import express, { Router } from "express";
import auth from "../../middlewares/auth.js";
import subscriptionController from "./subscription.controller.js";

const router = Router();

router.post("/create-checkout-session", auth, subscriptionController.createCheckoutSession);
router.post("/webhook", express.raw({ type: "application/json" }), subscriptionController.webhook);
router.get("/status", auth, subscriptionController.status);
router.post("/cancel", auth, subscriptionController.cancel);

export default router;