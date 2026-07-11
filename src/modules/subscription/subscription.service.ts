import { Prisma } from "@prisma/client";
import config from "../../config/index.js";
import { AppError } from "../../errors/AppError.js";
import prisma from "../../lib/prisma.js";
import { stripe, type StripeCheckoutSession, type StripeInvoice, type StripeSubscription } from "../../lib/stripe.js";

const getAppUrl = () => config.app_url ?? "http://localhost:5000";

const requireEnv = (name: string, value: string | undefined) => {
	if (!value) {
		throw new AppError(500, `${name} is required`);
	}

	return value;
};

const toDate = (timestamp: number | null | undefined) => {
	if (!timestamp) {
		return null;
	}

	return new Date(timestamp * 1000);
};

const getCustomerId = (customer: StripeSubscription["customer"] | StripeCheckoutSession["customer"] | StripeInvoice["customer"]) => {
	return typeof customer === "string" ? customer : customer?.id ?? null;
};

const getPriceId = (subscription: StripeSubscription) => {
	return subscription.items.data[0]?.price.id ?? null;
};

const resolveUserId = async (subscription: StripeSubscription) => {
	const metadataUserId = subscription.metadata?.userId;

	if (metadataUserId) {
		return metadataUserId;
	}

	const existingBySubscription = await prisma.subscription.findUnique({
		where: { stripeSubscriptionId: subscription.id },
		select: { userId: true },
	});

	if (existingBySubscription) {
		return existingBySubscription.userId;
	}

	const customerId = getCustomerId(subscription.customer);
	if (customerId) {
		const existingByCustomer = await prisma.subscription.findFirst({
			where: { stripeCustomerId: customerId },
			orderBy: { updatedAt: "desc" },
			select: { userId: true },
		});

		if (existingByCustomer) {
			return existingByCustomer.userId;
		}
	}

	throw new AppError(400, "Unable to resolve subscription owner");
};

const persistSubscription = async (input: {
	userId: string;
	stripeSubscriptionId?: string | null;
	stripeCheckoutSessionId?: string | null;
	stripeCustomerId?: string | null;
	priceId?: string | null;
	status: string;
	cancelAtPeriodEnd?: boolean;
	currentPeriodStart?: Date | null;
	currentPeriodEnd?: Date | null;
	canceledAt?: Date | null;
	endedAt?: Date | null;
	latestInvoiceId?: string | null;
	latestInvoiceStatus?: string | null;
	latestInvoiceError?: string | null;
	metadata?: Prisma.InputJsonValue;
	rawResponse?: Prisma.InputJsonValue;
}) => {
	const data = {
		userId: input.userId,
		stripeSubscriptionId: input.stripeSubscriptionId ?? null,
		stripeCheckoutSessionId: input.stripeCheckoutSessionId ?? null,
		stripeCustomerId: input.stripeCustomerId ?? null,
		priceId: input.priceId ?? null,
		status: input.status,
		cancelAtPeriodEnd: input.cancelAtPeriodEnd ?? false,
		currentPeriodStart: input.currentPeriodStart ?? null,
		currentPeriodEnd: input.currentPeriodEnd ?? null,
		canceledAt: input.canceledAt ?? null,
		endedAt: input.endedAt ?? null,
		latestInvoiceId: input.latestInvoiceId ?? null,
		latestInvoiceStatus: input.latestInvoiceStatus ?? null,
		latestInvoiceError: input.latestInvoiceError ?? null,
		metadata: input.metadata,
		rawResponse: input.rawResponse,
	};

	if (input.stripeSubscriptionId) {
		const existing = await prisma.subscription.findUnique({
			where: { stripeSubscriptionId: input.stripeSubscriptionId },
			select: { id: true },
		});

		if (existing) {
			return prisma.subscription.update({ where: { id: existing.id }, data });
		}
	}

	if (input.stripeCheckoutSessionId) {
		const existing = await prisma.subscription.findUnique({
			where: { stripeCheckoutSessionId: input.stripeCheckoutSessionId },
			select: { id: true },
		});

		if (existing) {
			return prisma.subscription.update({ where: { id: existing.id }, data });
		}
	}

	return prisma.subscription.create({ data });
};

const upsertFromSubscription = async (
	stripeSubscription: StripeSubscription,
	overrides: Partial<{
		stripeCheckoutSessionId: string;
		latestInvoiceId: string;
		latestInvoiceStatus: string;
		latestInvoiceError: string | null;
		rawResponse: Prisma.InputJsonValue;
	}>,
) => {
	const userId = await resolveUserId(stripeSubscription);

	return persistSubscription({
		userId,
		stripeSubscriptionId: stripeSubscription.id,
		stripeCheckoutSessionId: overrides.stripeCheckoutSessionId,
		stripeCustomerId: getCustomerId(stripeSubscription.customer),
		priceId: getPriceId(stripeSubscription),
		status: stripeSubscription.status,
		cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
		currentPeriodStart: toDate(stripeSubscription.current_period_start),
		currentPeriodEnd: toDate(stripeSubscription.current_period_end),
		canceledAt: toDate(stripeSubscription.canceled_at),
		endedAt: toDate(stripeSubscription.ended_at),
		latestInvoiceId: overrides.latestInvoiceId,
		latestInvoiceStatus: overrides.latestInvoiceStatus,
		latestInvoiceError: overrides.latestInvoiceError,
		metadata: stripeSubscription.metadata as Prisma.InputJsonValue,
		rawResponse: overrides.rawResponse ?? (stripeSubscription as Prisma.InputJsonValue),
	});
};

const createCheckoutSession = async (userId: string) => {
	const user = await prisma.user.findUnique({
		where: { id: userId },
		select: { id: true, email: true, name: true },
	});

	if (!user) {
		throw new AppError(404, "User not found");
	}

	const priceId = requireEnv("STRIPE_PRICE_ID", config.stripe_price_id);
	const session = await stripe.checkout.sessions.create({
		mode: "subscription",
		payment_method_types: ["card"],
		customer_email: user.email,
		client_reference_id: user.id,
		metadata: {
			userId: user.id,
			userName: user.name,
		},
		subscription_data: {
			metadata: {
				userId: user.id,
			},
		},
		line_items: [
			{
				price: priceId,
				quantity: 1,
			},
		],
		success_url: `${getAppUrl()}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
		cancel_url: `${getAppUrl()}/subscription/cancel`,
	});

	if (!session.url) {
		throw new AppError(500, "Stripe checkout session URL was not generated");
	}

	await persistSubscription({
		userId: user.id,
		stripeCheckoutSessionId: session.id,
		status: session.status ?? "pending",
		metadata: {
			userId: user.id,
			userName: user.name,
		},
		rawResponse: session as Prisma.InputJsonValue,
	});

	return {
		sessionId: session.id,
		url: session.url,
	};
};

const handleCheckoutSessionCompleted = async (session: StripeCheckoutSession) => {
	const subscriptionId = typeof session.subscription === "string" ? session.subscription : null;
	const stripeSubscription = subscriptionId ? await stripe.subscriptions.retrieve(subscriptionId) : null;
	const userId = stripeSubscription?.metadata?.userId ?? session.metadata?.userId;

	if (!userId) {
		throw new AppError(400, "Subscription user metadata missing");
	}

	if (stripeSubscription) {
		await persistSubscription({
			userId,
			stripeSubscriptionId: stripeSubscription.id,
			stripeCheckoutSessionId: session.id,
			stripeCustomerId: getCustomerId(stripeSubscription.customer),
			priceId: getPriceId(stripeSubscription),
			status: stripeSubscription.status,
			cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
			currentPeriodStart: toDate(stripeSubscription.current_period_start),
			currentPeriodEnd: toDate(stripeSubscription.current_period_end),
			canceledAt: toDate(stripeSubscription.canceled_at),
			endedAt: toDate(stripeSubscription.ended_at),
			metadata: stripeSubscription.metadata as Prisma.InputJsonValue,
			rawResponse: session as Prisma.InputJsonValue,
		});
		return;
	}

	await persistSubscription({
		userId,
		stripeCheckoutSessionId: session.id,
		status: session.status ?? "complete",
		metadata: session.metadata as Prisma.InputJsonValue,
		rawResponse: session as Prisma.InputJsonValue,
	});
};

const handleSubscriptionEvent = async (subscription: StripeSubscription) => {
	await upsertFromSubscription(subscription, {
		rawResponse: subscription as Prisma.InputJsonValue,
	});
};

const handleInvoiceEvent = async (invoice: StripeInvoice, outcome: "paid" | "failed") => {
	const subscriptionId = typeof invoice.subscription === "string" ? invoice.subscription : null;

	if (!subscriptionId) {
		return;
	}

	const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId);

	await upsertFromSubscription(stripeSubscription, {
		latestInvoiceId: invoice.id,
		latestInvoiceStatus: outcome,
		latestInvoiceError: outcome === "failed" ? "Invoice payment failed" : null,
		rawResponse: invoice as Prisma.InputJsonValue,
	});
};

const handleWebhook = async (signature: string, payload: Buffer) => {
	const webhookSecret = requireEnv("STRIPE_WEBHOOK_SECRET", config.stripe_webhook_secret);
	const event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);

	switch (event.type) {
		case "checkout.session.completed":
			await handleCheckoutSessionCompleted(event.data.object as StripeCheckoutSession);
			break;
		case "customer.subscription.created":
		case "customer.subscription.updated":
		case "customer.subscription.deleted":
			await handleSubscriptionEvent(event.data.object as StripeSubscription);
			break;
		case "invoice.paid":
			await handleInvoiceEvent(event.data.object as StripeInvoice, "paid");
			break;
		case "invoice.payment_failed":
			await handleInvoiceEvent(event.data.object as StripeInvoice, "failed");
			break;
		default:
			break;
	}

	return { received: true, type: event.type };
};

const getStatus = async (userId: string) => {
	return prisma.subscription.findFirst({
		where: { userId },
		orderBy: { updatedAt: "desc" },
	});
};

const cancel = async (userId: string) => {
	const subscription = await prisma.subscription.findFirst({
		where: {
			userId,
			stripeSubscriptionId: { not: null },
			status: { notIn: ["canceled", "deleted"] },
		},
		orderBy: { updatedAt: "desc" },
	});

	if (!subscription?.stripeSubscriptionId) {
		throw new AppError(404, "Subscription not found");
	}

	const canceledSubscription = await stripe.subscriptions.cancel(subscription.stripeSubscriptionId);

	return persistSubscription({
		userId: subscription.userId,
		stripeSubscriptionId: canceledSubscription.id,
		stripeCheckoutSessionId: subscription.stripeCheckoutSessionId,
		stripeCustomerId: getCustomerId(canceledSubscription.customer),
		priceId: getPriceId(canceledSubscription),
		status: canceledSubscription.status,
		cancelAtPeriodEnd: canceledSubscription.cancel_at_period_end,
		currentPeriodStart: toDate(canceledSubscription.current_period_start),
		currentPeriodEnd: toDate(canceledSubscription.current_period_end),
		canceledAt: toDate(canceledSubscription.canceled_at),
		endedAt: toDate(canceledSubscription.ended_at),
		metadata: canceledSubscription.metadata as Prisma.InputJsonValue,
		rawResponse: canceledSubscription as Prisma.InputJsonValue,
	});
};

export default {
	createCheckoutSession,
	handleWebhook,
	getStatus,
	cancel,
};