type PaymentSessionInput = {
  bookingId: string;
  amount: number;
  currency?: string;
};

export const createStripeSession = async (input: PaymentSessionInput) => {
  return {
    provider: "STRIPE",
    sessionId: `stripe_${input.bookingId}`,
    paymentUrl: `${process.env.APP_URL ?? "http://localhost:5000"}/payments/stripe/${input.bookingId}`,
  };
};
