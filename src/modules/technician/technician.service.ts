import { Prisma } from "@prisma/client";
import prisma from "../../lib/prisma.js";
import { AppError } from "../../errors/AppError.js";
import type { TechnicianBookingStatusInput, TechnicianProfileInput } from "./technician.interface.js";

const list = async (query: Record<string, string | undefined>) => {
  const technicians = await prisma.technicianProfile.findMany({
    where: {
      isAvailable: query.isAvailable === undefined ? undefined : query.isAvailable === "true",
      location: query.location ? { contains: query.location, mode: "insensitive" } : undefined,
      skills: query.skill ? { has: query.skill } : undefined,
      hourlyRate:
        query.minRate || query.maxRate
          ? {
              gte: query.minRate ? new Prisma.Decimal(query.minRate) : undefined,
              lte: query.maxRate ? new Prisma.Decimal(query.maxRate) : undefined,
            }
          : undefined,
    },
    include: {
      user: { select: { id: true, name: true, email: true, city: true, avatar: true } },
      services: true,
      reviews: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return technicians.map((technician) => {
    const totalRating = technician.reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = technician.reviews.length ? totalRating / technician.reviews.length : 0;

    return {
      ...technician,
      averageRating,
    };
  });
};

const getById = async (id: string) => {
  const technician = await prisma.technicianProfile.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true, phone: true, city: true, avatar: true } },
      services: true,
      reviews: {
        include: {
          customer: { select: { id: true, name: true, avatar: true } },
        },
      },
    },
  });

  if (!technician) {
    throw new AppError(404, "Technician not found");
  }

  return technician;
};

const updateProfile = async (userId: string, input: TechnicianProfileInput) => {
  const technicianProfile = await prisma.technicianProfile.findUnique({ where: { userId } });

  if (!technicianProfile) {
    throw new AppError(404, "Technician profile not found");
  }

  return prisma.technicianProfile.update({
    where: { userId },
    data: {
      bio: input.bio,
      experience: input.experience,
      skills: input.skills,
      hourlyRate: input.hourlyRate === undefined ? undefined : new Prisma.Decimal(input.hourlyRate),
      location: input.location,
      availability: input.availability as Prisma.InputJsonValue | undefined,
      isAvailable: input.isAvailable,
    },
    include: { user: true, services: true },
  });
};

const updateAvailability = async (userId: string, availability: unknown) => {
  return prisma.technicianProfile.update({
    where: { userId },
    data: { availability: availability as Prisma.InputJsonValue },
  });
};

const bookings = async (userId: string) => {
  const technicianProfile = await prisma.technicianProfile.findUnique({ where: { userId } });

  if (!technicianProfile) {
    throw new AppError(404, "Technician profile not found");
  }

  return prisma.booking.findMany({
    where: { technicianProfileId: technicianProfile.id },
    include: { customer: true, service: true, payment: true, review: true },
    orderBy: { createdAt: "desc" },
  });
};

const updateBookingStatus = async (userId: string, bookingId: string, input: TechnicianBookingStatusInput) => {
  const technicianProfile = await prisma.technicianProfile.findUnique({ where: { userId } });

  if (!technicianProfile) {
    throw new AppError(404, "Technician profile not found");
  }

  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, technicianProfileId: technicianProfile.id },
  });

  if (!booking) {
    throw new AppError(404, "Booking not found");
  }

  return prisma.booking.update({
    where: { id: bookingId },
    data: { status: input.status },
  });
};

export default { list, getById, updateProfile, updateAvailability, bookings, updateBookingStatus };
