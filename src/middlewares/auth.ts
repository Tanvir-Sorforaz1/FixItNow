import type { NextFunction, Request, Response } from "express";
import prisma from "../lib/prisma.js";
import { AppError } from "../errors/AppError.js";
import { verifyToken } from "../utils/jwt.js";

const auth = async (req: Request, _res: Response, next: NextFunction) => {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    next(new AppError(401, "Unauthorized"));
    return;
  }

  try {
    const token = header.slice(7);
    const decoded = verifyToken(token);
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, role: true, status: true },
    });

    if (!user) {
      next(new AppError(401, "Unauthorized"));
      return;
    }

    if (user.status === "BANNED") {
      next(new AppError(403, "User is banned"));
      return;
    }

    req.user = user;
    next();
  } catch {
    next(new AppError(401, "Unauthorized"));
  }
};

export default auth;
