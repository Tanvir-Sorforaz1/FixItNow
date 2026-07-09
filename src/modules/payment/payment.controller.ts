import type { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync.js";
import sendResponse from "../../utils/sendResponse.js";
import paymentService from "./payment.service.js";

const create = catchAsync(async (req: Request, res: Response) => {
  const result = await paymentService.create(req.user!.id, req.body);
  sendResponse(res, { statusCode: 201, success: true, message: "Payment session created successfully", data: result });
});

const confirm = catchAsync(async (req: Request, res: Response) => {
  const result = await paymentService.confirm(req.body);
  sendResponse(res, { statusCode: 200, success: true, message: "Payment confirmed successfully", data: result });
});

const getAll = catchAsync(async (req: Request, res: Response) => {
  const result = await paymentService.list(req.user!.id, req.user!.role === "ADMIN");
  sendResponse(res, { statusCode: 200, success: true, message: "Payments retrieved successfully", data: result });
});

const getById = catchAsync(async (req: Request, res: Response) => {
  const result = await paymentService.getById(req.user!.id, req.user!.role === "ADMIN", req.params.id as string);
  sendResponse(res, { statusCode: 200, success: true, message: "Payment retrieved successfully", data: result });
});

export default { create, confirm, getAll, getById };
