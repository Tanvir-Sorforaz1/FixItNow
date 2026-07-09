import type { UserRole } from "@prisma/client";

export type RegisterInput = {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phone?: string;
  address?: string;
  city?: string;
  avatar?: string;
};

export type LoginInput = {
  email: string;
  password: string;
};
