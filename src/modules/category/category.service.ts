import prisma from "../../lib/prisma.js";
import { AppError } from "../../errors/AppError.js";
import type { CategoryInput } from "./category.interface.js";

const slugify = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const getAll = async () => {
  return prisma.category.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { services: true },
      },
    },
  });
};

const create = async (input: CategoryInput) => {
  const category = await prisma.category.findFirst({
    where: { OR: [{ name: input.name }, { slug: slugify(input.name) }] },
  });

  if (category) {
    throw new AppError(409, "Category already exists");
  }

  return prisma.category.create({
    data: {
      name: input.name,
      slug: slugify(input.name),
      description: input.description,
      icon: input.icon,
    },
  });
};

export default { getAll, create };
