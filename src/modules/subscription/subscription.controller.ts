import type { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync.js";
import sendResponse from "../../utils/sendResponse.js";
import subscriptionService from "./subscription.service.js";

const createCheckoutSession = catchAsync(async (req: Request, res: Response) => {
	const result = await subscriptionService.createCheckoutSession(req.user!.id);
	sendResponse(res, { statusCode: 201, success: true, message: "Checkout session created successfully", data: result });
});

const webhook = catchAsync(async (req: Request, res: Response) => {
	const signature = req.headers["stripe-signature"];
	const payload = Buffer.isBuffer(req.body) ? req.body : null;

	if (typeof signature !== "string") {
		return res.status(400).json({ success: false, message: "Missing Stripe signature" });
	}

	if (!payload) {
		return res.status(400).json({ success: false, message: "Invalid webhook payload" });
	}

	await subscriptionService.handleWebhook(signature, payload);
	return res.status(200).json({ received: true });
});

const status = catchAsync(async (req: Request, res: Response) => {
	const result = await subscriptionService.getStatus(req.user!.id);
	sendResponse(res, { statusCode: 200, success: true, message: "Subscription status retrieved successfully", data: result });
});

const cancel = catchAsync(async (req: Request, res: Response) => {
	const result = await subscriptionService.cancel(req.user!.id);
	sendResponse(res, { statusCode: 200, success: true, message: "Subscription canceled successfully", data: result });
});

export default { createCheckoutSession, webhook, status, cancel };