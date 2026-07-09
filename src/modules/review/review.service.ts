import prisma from "../../lib/prisma.js";
import { AppError } from "../../errors/AppError.js";
import type { ReviewInput } from "./review.interface.js";

const create = async (userId: string, input: ReviewInput) => {
  const booking = await prisma.booking.findUnique({
    where: { id: input.bookingId },
    include: { technicianProfile: true },
  });

  if (!booking) {
    throw new AppError(404, "Booking not found");
  }

  if (booking.customerId !== userId) {
    throw new AppError(403, "Forbidden");
  }

  if (booking.status !== "COMPLETED") {
    throw new AppError(400, "Review is only allowed after job completion");
  }

  return prisma.review.create({
    data: {
      bookingId: booking.id,
      customerId: userId,
      technicianId: booking.technicianId,
      technicianProfileId: booking.technicianProfileId,
      rating: input.rating,
      comment: input.comment,
    },
  });
};

export default { create };
