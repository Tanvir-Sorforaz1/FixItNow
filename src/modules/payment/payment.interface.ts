export type PaymentCreateInput = {
  bookingId: string;
  method?: "CARD" | "BANK_TRANSFER" | "MOBILE_BANKING" | "CASH";
};

export type PaymentConfirmInput = {
  transactionId: string;
  status: "COMPLETED" | "FAILED";
  rawResponse?: unknown;
};
