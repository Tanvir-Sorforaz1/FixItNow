import config from "../../config/index.js";

export const createProviderSession = async (provider: "STRIPE" | "SSLCOMMERZ", bookingId: string, amount: number) => {
  void amount;

  return {
    provider,
    sessionId: `${provider.toLowerCase()}_${bookingId}`,
    paymentUrl: `${config.app_url ?? "http://localhost:5000"}/payments/${provider.toLowerCase()}/${bookingId}`,
  };
};
