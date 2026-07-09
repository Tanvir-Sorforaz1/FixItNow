import type { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync.js";
import sendResponse from "../../utils/sendResponse.js";
import technicianService from "./technician.service.js";

const getAll = catchAsync(async (req: Request, res: Response) => {
  const result = await technicianService.list(req.query as Record<string, string | undefined>);
  sendResponse(res, { statusCode: 200, success: true, message: "Technicians retrieved successfully", data: result });
});

const getById = catchAsync(async (req: Request, res: Response) => {
  const result = await technicianService.getById(req.params.id as string);
  sendResponse(res, { statusCode: 200, success: true, message: "Technician retrieved successfully", data: result });
});

const updateProfile = catchAsync(async (req: Request, res: Response) => {
  const result = await technicianService.updateProfile(req.user!.id, req.body);
  sendResponse(res, { statusCode: 200, success: true, message: "Technician profile updated successfully", data: result });
});

const updateAvailability = catchAsync(async (req: Request, res: Response) => {
  const result = await technicianService.updateAvailability(req.user!.id, req.body.availability);
  sendResponse(res, { statusCode: 200, success: true, message: "Availability updated successfully", data: result });
});

const getBookings = catchAsync(async (req: Request, res: Response) => {
  const result = await technicianService.bookings(req.user!.id);
  sendResponse(res, { statusCode: 200, success: true, message: "Bookings retrieved successfully", data: result });
});

const updateBookingStatus = catchAsync(async (req: Request, res: Response) => {
  const result = await technicianService.updateBookingStatus(req.user!.id, req.params.id as string, req.body);
  sendResponse(res, { statusCode: 200, success: true, message: "Booking status updated successfully", data: result });
});

export default { getAll, getById, updateProfile, updateAvailability, getBookings, updateBookingStatus };
