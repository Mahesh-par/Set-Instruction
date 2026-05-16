import type { ErrorRequestHandler } from "express";

import { ApiError } from "../utils/ApiError.js";

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  const statusCode = error instanceof ApiError ? error.statusCode : 500;
  const message =
    error instanceof Error ? error.message : "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === "production" ? undefined : error.stack
  });
};
