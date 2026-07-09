import type { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync.js";
import sendResponse from "../../utils/sendResponse.js";
import adminService from "./admin.service.js";

const getUsers = catchAsync(async (_req: Request, res: Response) => {
  const result = await adminService.getUsers();
  sendResponse(res, { statusCode: 200, success: true, message: "Users retrieved successfully", data: result });
});

const updateUserStatus = catchAsync(async (req: Request, res: Response) => {
  const result = await adminService.updateUserStatus(req.params.id as string, req.body);
  sendResponse(res, { statusCode: 200, success: true, message: "User status updated successfully", data: result });
});

const getBookings = catchAsync(async (_req: Request, res: Response) => {
  const result = await adminService.getBookings();
  sendResponse(res, { statusCode: 200, success: true, message: "Bookings retrieved successfully", data: result });
});

const getCategories = catchAsync(async (_req: Request, res: Response) => {
  const result = await adminService.getCategories();
  sendResponse(res, { statusCode: 200, success: true, message: "Categories retrieved successfully", data: result });
});

const createCategory = catchAsync(async (req: Request, res: Response) => {
  const result = await adminService.createCategory(req.body);
  sendResponse(res, { statusCode: 201, success: true, message: "Category created successfully", data: result });
});

export default { getUsers, updateUserStatus, getBookings, getCategories, createCategory };
