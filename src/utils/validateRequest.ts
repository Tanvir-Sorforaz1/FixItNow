import type { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/AppError.js";

type Validator = (body: unknown) => void;

const validateRequest = (validator: Validator) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      validator(req.body);
      next();
    } catch (error) {
      next(error instanceof Error ? error : new AppError(400, "Invalid request payload"));
    }
  };
};

export default validateRequest;
