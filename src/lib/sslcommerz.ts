type PaymentSessionInput = {
  bookingId: string;
  amount: number;
  currency?: string;
};

export const createSslCommerzSession = async (input: PaymentSessionInput) => {
  return {
    provider: "SSLCOMMERZ",
    sessionId: `ssl_${input.bookingId}`,
    paymentUrl: `${process.env.APP_URL ?? "http://localhost:5000"}/payments/sslcommerz/${input.bookingId}`,
  };
};
