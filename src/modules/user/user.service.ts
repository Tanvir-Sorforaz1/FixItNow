import prisma from "../../lib/prisma.js";
import { AppError } from "../../errors/AppError.js";
import type { UserUpdateInput } from "./user.interface.js";

const getMe = async (userId: string) => {
  return prisma.user.findUnique({
    where: { id: userId },
    include: { technicianProfile: true },
  });
};

const updateMe = async (userId: string, input: UserUpdateInput) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw new AppError(404, "User not found");
  }

  return prisma.user.update({
    where: { id: userId },
    data: {
      name: input.name,
      phone: input.phone,
      address: input.address,
      city: input.city,
      avatar: input.avatar,
    },
  });
};

export default { getMe, updateMe };
