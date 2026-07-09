import type { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync.js";
import sendResponse from "../../utils/sendResponse.js";
import bookingService from "./booking.service.js";

const create = catchAsync(async (req: Request, res: Response) => {
  const result = await bookingService.create(req.user!.id, req.user!.role, req.body);
  sendResponse(res, { statusCode: 201, success: true, message: "Booking created successfully", data: result });
});

const getAll = catchAsync(async (req: Request, res: Response) => {
  const result = await bookingService.list(req.user!.id, req.user!.role);
  sendResponse(res, { statusCode: 200, success: true, message: "Bookings retrieved successfully", data: result });
});

const getById = catchAsync(async (req: Request, res: Response) => {
  const result = await bookingService.getById(req.user!.id, req.user!.role, req.params.id as string);
  sendResponse(res, { statusCode: 200, success: true, message: "Booking retrieved successfully", data: result });
});

const cancel = catchAsync(async (req: Request, res: Response) => {
  const result = await bookingService.cancel(req.user!.id, req.params.id as string);
  sendResponse(res, { statusCode: 200, success: true, message: "Booking cancelled successfully", data: result });
});

export default { create, getAll, getById, cancel };
