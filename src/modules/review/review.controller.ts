import type { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync.js";
import sendResponse from "../../utils/sendResponse.js";
import reviewService from "./review.service.js";

const create = catchAsync(async (req: Request, res: Response) => {
  const result = await reviewService.create(req.user!.id, req.body);
  sendResponse(res, { statusCode: 201, success: true, message: "Review created successfully", data: result });
});

export default { create };
