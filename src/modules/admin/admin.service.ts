import { Prisma } from "@prisma/client";
import prisma from "../../lib/prisma.js";
import { AppError } from "../../errors/AppError.js";
import type { UserStatusInput } from "./admin.interface.js";
import type { CategoryInput } from "../category/category.interface.js";

const getUsers = async () => {
  return prisma.user.findMany({
    include: { technicianProfile: true },
    orderBy: { createdAt: "desc" },
  });
};

const updateUserStatus = async (id: string, input: UserStatusInput) => {
  const user = await prisma.user.findUnique({ where: { id } });

  if (!user) {
    throw new AppError(404, "User not found");
  }

  return prisma.user.update({
    where: { id },
    data: { status: input.status },
  });
};

const getBookings = async () => {
  return prisma.booking.findMany({
    include: { customer: true, technician: true, service: true, payment: true, review: true },
    orderBy: { createdAt: "desc" },
  });
};

const getCategories = async () => {
  return prisma.category.findMany({ orderBy: { createdAt: "desc" } });
};

const createCategory = async (input: CategoryInput) => {
  const slug = input.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

  return prisma.category.create({
    data: {
      name: input.name,
      slug,
      description: input.description,
      icon: input.icon,
    },
  });
};

export default { getUsers, updateUserStatus, getBookings, getCategories, createCategory };
