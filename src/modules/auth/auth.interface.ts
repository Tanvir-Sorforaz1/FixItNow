import type { UserRole } from "../../../generated/prisma/client.js";

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
