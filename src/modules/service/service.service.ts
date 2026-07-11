import { Prisma } from "@prisma/client";
import prisma from "../../lib/prisma.js";
import { AppError } from "../../errors/AppError.js";
import type { ServiceInput } from "./service.interface.js";

const list = async (query: Record<string, string | undefined>) => {
  const where: Prisma.ServiceWhereInput = {
    isActive: query.isActive === undefined ? undefined : query.isActive === "true",
    categoryId: query.categoryId,
    location: query.location ? { contains: query.location, mode: "insensitive" } : undefined,
    OR: query.search
      ? [
          { title: { contains: query.search, mode: "insensitive" } },
          { description: { contains: query.search, mode: "insensitive" } },
        ]
      : undefined,
    price:
      query.minPrice || query.maxPrice
        ? {
            gte: query.minPrice ? Number(query.minPrice) : undefined,
            lte: query.maxPrice ? Number(query.maxPrice) : undefined,
          }
        : undefined,
  };

  return prisma.service.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      category: true,
      technicianProfile: {
        include: { user: { select: { id: true, name: true, email: true, city: true } } },
      },
    },
  });
};

const getById = async (id: string) => {
  const service = await prisma.service.findUnique({
    where: { id },
    include: {
      category: true,
      technicianProfile: {
        include: { user: true, reviews: true },
      },
    },
  });

  if (!service) {
    throw new AppError(404, "Service not found");
  }

  return service;
};

const create = async (input: ServiceInput) => {
  const technicianProfile = await prisma.technicianProfile.findUnique({
    where: { id: input.technicianProfileId },
  });

  if (!technicianProfile) {
    throw new AppError(404, "Technician profile not found");
  }

  return prisma.service.create({
    data: {
      title: input.title,
      description: input.description,
      price: new Prisma.Decimal(input.price),
      location: input.location,
      categoryId: input.categoryId,
      technicianProfileId: input.technicianProfileId,
    },
  });
};

const update = async (id: string, input: Partial<ServiceInput & { isActive: boolean }>) => {
  await getById(id);

  return prisma.service.update({
    where: { id },
    data: {
      title: input.title,
      description: input.description,
      price: input.price === undefined ? undefined : new Prisma.Decimal(input.price),
      location: input.location,
      categoryId: input.categoryId,
      technicianProfileId: input.technicianProfileId,
      isActive: input.isActive,
    },
  });
};

export default { list, getById, create, update };
