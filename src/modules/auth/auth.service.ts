import bcrypt from "bcryptjs";
import type { UserRole } from "@prisma/client";
import prisma from "../../lib/prisma.js";
import { AppError } from "../../errors/AppError.js";
import { signToken } from "../../utils/jwt.js";
import type { LoginInput, RegisterInput } from "./auth.interface.js";

const register = async (payload: RegisterInput) => {
  const existing = await prisma.user.findUnique({ where: { email: payload.email } });

  if (existing) {
    throw new AppError(409, "Email already exists");
  }

  const hashedPassword = await bcrypt.hash(payload.password, 10);
  const user = await prisma.user.create({
    data: {
      ...payload,
      password: hashedPassword,
      role: payload.role as UserRole,
    },
    select: { id: true, name: true, email: true, role: true, status: true, createdAt: true },
  });

  if (payload.role === "TECHNICIAN") {
    await prisma.technicianProfile.create({
      data: {
        userId: user.id,
        skills: [],
      },
    });
  }

  return {
    user,
    token: signToken({
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
    }),
  };
};

const login = async (payload: LoginInput) => {
  const user = await prisma.user.findUnique({ where: { email: payload.email } });

  if (!user) {
    throw new AppError(404, "User not found");
  }

  const valid = await bcrypt.compare(payload.password, user.password);
  if (!valid) {
    throw new AppError(401, "Invalid credentials");
  }

  const tokenPayload = {
    id: user.id,
    email: user.email,
    role: user.role,
    status: user.status,
  };

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    },
    token: signToken(tokenPayload),
  };
};

const me = async (userId: string) => {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      address: true,
      city: true,
      avatar: true,
      role: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      technicianProfile: true,
    },
  });
};

export default { register, login, me };
