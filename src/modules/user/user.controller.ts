import type { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync.js";
import sendResponse from "../../utils/sendResponse.js";
import userService from "./user.service.js";

const getMe = catchAsync(async (req: Request, res: Response) => {
  const result = await userService.getMe(req.user!.id);
  sendResponse(res, { statusCode: 200, success: true, message: "Profile retrieved successfully", data: result });
});

const updateMe = catchAsync(async (req: Request, res: Response) => {
  const result = await userService.updateMe(req.user!.id, req.body);
  sendResponse(res, { statusCode: 200, success: true, message: "Profile updated successfully", data: result });
});

export default { getMe, updateMe };
