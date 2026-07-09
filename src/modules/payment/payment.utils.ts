import { createStripeSession } from "../../lib/stripe.js";
import { createSslCommerzSession } from "../../lib/sslcommerz.js";

export const createProviderSession = async (provider: "STRIPE" | "SSLCOMMERZ", bookingId: string, amount: number) => {
  if (provider === "STRIPE") {
    return createStripeSession({ bookingId, amount });
  }

  return createSslCommerzSession({ bookingId, amount });
};
