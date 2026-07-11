import { createHmac, timingSafeEqual } from "node:crypto";
import config from "../config/index.js";

const stripeSecretKey = config.stripe_secret_key;

if (!stripeSecretKey) {
	throw new Error("STRIPE_SECRET_KEY is required");
}

const stripeApiBaseUrl = "https://api.stripe.com/v1";

export type StripeCustomerReference = string | { id: string } | null;

export type StripeCheckoutSession = {
	id: string;
	url: string | null;
	subscription: string | null;
	status: string | null;
	payment_status: string | null;
	metadata: Record<string, string>;
	customer: StripeCustomerReference;
};

export type StripeSubscription = {
	id: string;
	customer: StripeCustomerReference;
	status: string;
	cancel_at_period_end: boolean;
	current_period_start: number;
	current_period_end: number;
	canceled_at: number | null;
	ended_at: number | null;
	metadata: Record<string, string>;
	items: {
		data: Array<{
			price: { id: string };
		}>;
	};
};

export type StripeInvoice = {
	id: string;
	subscription: string | null;
	customer: StripeCustomerReference;
	status: string | null;
};

export type StripeWebhookEvent<T = unknown> = {
	id: string;
	type: string;
	data: {
		object: T;
	};
};

type CheckoutSessionCreateInput = {
	mode: "subscription" | "payment";
	payment_method_types?: string[];
	customer_email: string;
	client_reference_id: string;
	metadata?: Record<string, string>;
	subscription_data?: {
		metadata?: Record<string, string>;
	};
	payment_intent_data?: {
		metadata?: Record<string, string>;
	};
	line_items: Array<{
		price?: string;
		quantity: number;
		currency?: string;
		product_name?: string;
		unit_amount?: number;
	}>;
	success_url: string;
	cancel_url: string;
};

const requestStripeApi = async <T>(path: string, options: RequestInit = {}) => {
	const response = await fetch(`${stripeApiBaseUrl}${path}`, {
		...options,
		headers: {
			Authorization: `Bearer ${stripeSecretKey}`,
			...(options.headers ?? {}),
		},
	});

	if (!response.ok) {
		const errorBody = await response.text();
		throw new Error(`Stripe API request failed (${response.status}): ${errorBody}`);
	}

	return response.json() as Promise<T>;
};

const checkoutSessionCreate = async (input: CheckoutSessionCreateInput) => {
	const body = new URLSearchParams();
	body.set("mode", input.mode);
	body.set("payment_method_types[0]", input.payment_method_types?.[0] ?? "card");
	body.set("customer_email", input.customer_email);
	body.set("client_reference_id", input.client_reference_id);
	body.set("success_url", input.success_url);
	body.set("cancel_url", input.cancel_url);

	if (input.metadata) {
		for (const [key, value] of Object.entries(input.metadata)) {
			body.set(`metadata[${key}]`, value);
		}
	}

	if (input.subscription_data?.metadata) {
		for (const [key, value] of Object.entries(input.subscription_data.metadata)) {
			body.set(`subscription_data[metadata][${key}]`, value);
		}
	}

	if (input.payment_intent_data?.metadata) {
		for (const [key, value] of Object.entries(input.payment_intent_data.metadata)) {
			body.set(`payment_intent_data[metadata][${key}]`, value);
		}
	}

	input.line_items.forEach((item, index) => {
		body.set(`line_items[${index}][quantity]`, String(item.quantity));

		if (item.price) {
			body.set(`line_items[${index}][price]`, item.price);
			return;
		}

		if (item.currency) {
			body.set(`line_items[${index}][price_data][currency]`, item.currency);
			body.set(`line_items[${index}][price_data][product_data][name]`, item.product_name ?? "Booking payment");
			body.set(`line_items[${index}][price_data][unit_amount]`, String(item.unit_amount ?? 0));
		}
	});

	return requestStripeApi<StripeCheckoutSession>("/checkout/sessions", {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
		},
		body,
	});
};

const subscriptionRetrieve = async (id: string) => {
	const query = new URLSearchParams({
		"expand[]": "items.data.price",
	});

	return requestStripeApi<StripeSubscription>(`/subscriptions/${id}?${query.toString()}`);
};

const subscriptionCancel = async (id: string) => {
	return requestStripeApi<StripeSubscription>(`/subscriptions/${id}`, {
		method: "DELETE",
	});
};

const safeCompare = (left: string, right: string) => {
	const leftBuffer = Buffer.from(left);
	const rightBuffer = Buffer.from(right);

	if (leftBuffer.length !== rightBuffer.length) {
		return false;
	}

	return timingSafeEqual(leftBuffer, rightBuffer);
};

const constructWebhookEvent = <T>(payload: Buffer, signature: string, webhookSecret: string) => {
	const parts = Object.fromEntries(
		signature.split(",").map((segment) => {
			const [key, value] = segment.split("=");
			return [key, value];
		}),
	);

	const timestamp = parts.t;
	const expectedSignature = parts.v1;

	if (!timestamp || !expectedSignature) {
		throw new Error("Invalid Stripe signature header");
	}

	const signedPayload = `${timestamp}.${payload.toString("utf8")}`;
	const computedSignature = createHmac("sha256", webhookSecret).update(signedPayload, "utf8").digest("hex");

	if (!safeCompare(computedSignature, expectedSignature)) {
		throw new Error("Stripe webhook signature verification failed");
	}

	return JSON.parse(payload.toString("utf8")) as StripeWebhookEvent<T>;
};

export const stripe = {
	checkout: {
		sessions: {
			create: checkoutSessionCreate,
		},
	},
	subscriptions: {
		retrieve: subscriptionRetrieve,
		cancel: subscriptionCancel,
	},
	webhooks: {
		constructEvent: constructWebhookEvent,
	},
};
