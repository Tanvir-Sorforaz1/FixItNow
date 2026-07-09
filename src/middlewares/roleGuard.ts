import type { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/AppError.js";

const roleGuard = (...roles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      next(new AppError(401, "Unauthorized"));
      return;
    }

    if (!roles.includes(req.user.role)) {
      next(new AppError(403, "Forbidden"));
      return;
    }

    next();
  };
};

export default roleGuard;
