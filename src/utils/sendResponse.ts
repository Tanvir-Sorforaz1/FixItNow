import type { Response } from "express";

type SendResponsePayload<T> = {
  statusCode: number;
  success: boolean;
  message: string;
  data?: T;
  meta?: Record<string, unknown>;
};

const sendResponse = <T>(res: Response, payload: SendResponsePayload<T>) => {
  const { statusCode, success, message, data, meta } = payload;

  return res.status(statusCode).json({
    success,
    message,
    data,
    meta,
  });
};

export default sendResponse;
