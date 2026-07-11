import { Prisma } from "@prisma/client";
import prisma from "../../lib/prisma.js";
import { AppError } from "../../errors/AppError.js";
import { createStripePaymentSession } from "./payment.utils.js";
import type { PaymentConfirmInput, PaymentCreateInput } from "./payment.interface.js";

const create = async (userId: string, input: PaymentCreateInput) => {
  const booking = await prisma.booking.findUnique({ where: { id: input.bookingId } });

  if (!booking) {
    throw new AppError(404, "Booking not found");
  }

  if (booking.customerId !== userId) {
    throw new AppError(403, "Forbidden");
  }

  if (!["ACCEPTED", "PAID", "IN_PROGRESS", "COMPLETED"].includes(booking.status)) {
    throw new AppError(400, "Payment can only be created after booking is accepted");
  }

  const customer = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true },
  });

  if (!customer?.email) {
    throw new AppError(404, "Customer email not found");
  }

  const session = await createStripePaymentSession({
    bookingId: booking.id,
    amount: Number(booking.amount),
    customerEmail: customer.email,
    currency: "usd",
  });

  return prisma.payment.upsert({
    where: { bookingId: booking.id },
    create: {
      bookingId: booking.id,
      customerId: userId,
      transactionId: session.sessionId,
      amount: booking.amount,
      method: input.method ?? "CARD",
      provider: "STRIPE",
      status: "PENDING",
      currency: "USD",
      rawResponse: session.rawResponse as Prisma.InputJsonValue,
    },
    update: {
      transactionId: session.sessionId,
      amount: booking.amount,
      method: input.method ?? "CARD",
      provider: "STRIPE",
      status: "PENDING",
      currency: "USD",
      rawResponse: session.rawResponse as Prisma.InputJsonValue,
    },
  });
};

const confirm = async (input: PaymentConfirmInput) => {
  const payment = await prisma.payment.findUnique({ where: { transactionId: input.transactionId } });

  if (!payment) {
    throw new AppError(404, "Payment not found");
  }

  const updated = await prisma.payment.update({
    where: { transactionId: input.transactionId },
    data: {
      status: input.status,
      paidAt: input.status === "COMPLETED" ? new Date() : null,
      rawResponse: input.rawResponse as Prisma.InputJsonValue | undefined,
    },
  });

  if (input.status === "COMPLETED") {
    await prisma.booking.update({ where: { id: payment.bookingId }, data: { status: "PAID" } });
  }

  return updated;
};

const list = async (userId: string, isAdmin: boolean) => {
  return prisma.payment.findMany({
    where: isAdmin ? undefined : { customerId: userId },
    include: { booking: true },
    orderBy: { createdAt: "desc" },
  });
};

const getById = async (userId: string, isAdmin: boolean, id: string) => {
  const payment = await prisma.payment.findUnique({ where: { id }, include: { booking: true } });

  if (!payment) {
    throw new AppError(404, "Payment not found");
  }

  if (!isAdmin && payment.customerId !== userId) {
    throw new AppError(403, "Forbidden");
  }

  return payment;
};

export default { create, confirm, list, getById };
