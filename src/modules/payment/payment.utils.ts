import config from "../../config/index.js";
import { stripe } from "../../lib/stripe.js";

export const createStripePaymentSession = async (input: {
  bookingId: string;
  amount: number;
  customerEmail: string;
  currency?: string;
}) => {
  const currency = (input.currency ?? "usd").toLowerCase();
  const unitAmount = Math.round(input.amount * 100);

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    customer_email: input.customerEmail,
    client_reference_id: input.bookingId,
    metadata: {
      bookingId: input.bookingId,
      amount: String(input.amount),
      currency,
    },
    payment_intent_data: {
      metadata: {
        bookingId: input.bookingId,
      },
    },
    line_items: [
      {
        quantity: 1,
        currency,
        product_name: `Booking payment for ${input.bookingId}`,
        unit_amount: unitAmount,
      },
    ],
    success_url: `${config.app_url ?? "http://localhost:5000"}/payments/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${config.app_url ?? "http://localhost:5000"}/payments/cancel`,
  });

  return {
    sessionId: session.id,
    paymentUrl: session.url,
    rawResponse: session,
  };
};
