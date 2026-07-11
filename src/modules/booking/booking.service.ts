import { Prisma, type UserRole } from "@prisma/client";
import prisma from "../../lib/prisma.js";
import { AppError } from "../../errors/AppError.js";
import type { BookingInput } from "./booking.interface.js";

const create = async (customerId: string, customerRole: UserRole, input: BookingInput) => {
  if (customerRole !== "CUSTOMER" && customerRole !== "ADMIN") {
    throw new AppError(403, "Only customers can create bookings");
  }

  const service = await prisma.service.findUnique({
    where: { id: input.serviceId },
    include: { technicianProfile: { include: { user: true } } },
  });

  if (!service) {
    throw new AppError(404, "Service not found");
  }

  return prisma.booking.create({
    data: {
      customerId,
      technicianId: service.technicianProfile.userId,
      technicianProfileId: service.technicianProfileId,
      serviceId: service.id,
      scheduledAt: new Date(input.scheduledAt),
      durationMinutes: input.durationMinutes ?? 60,
      address: input.address,
      notes: input.notes,
      amount: service.price,
    },
    include: { customer: true, technician: true, technicianProfile: true, service: true },
  });
};

const list = async (userId: string, role: UserRole) => {
  const where =
    role === "ADMIN"
      ? undefined
      : role === "TECHNICIAN"
        ? { technicianId: userId }
        : { customerId: userId };

  return prisma.booking.findMany({
    where,
    include: {
      customer: true,
      technician: true,
      technicianProfile: true,
      service: true,
      payment: true,
      review: true,
    },
    orderBy: { createdAt: "desc" },
  });
};

const getById = async (userId: string, role: UserRole, bookingId: string) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { customer: true, technician: true, technicianProfile: true, service: true, payment: true, review: true },
  });

  if (!booking) {
    throw new AppError(404, "Booking not found");
  }

  if (role !== "ADMIN" && booking.customerId !== userId && booking.technicianId !== userId) {
    throw new AppError(403, "Forbidden");
  }

  return booking;
};

const cancel = async (userId: string, bookingId: string) => {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });

  if (!booking) {
    throw new AppError(404, "Booking not found");
  }

  if (booking.customerId !== userId) {
    throw new AppError(403, "Forbidden");
  }

  if (booking.status === "IN_PROGRESS" || booking.status === "COMPLETED") {
    throw new AppError(400, "Booking cannot be cancelled at this stage");
  }

  return prisma.booking.update({
    where: { id: bookingId },
    data: { status: "CANCELLED" },
  });
};

export default { create, list, getById, cancel };
