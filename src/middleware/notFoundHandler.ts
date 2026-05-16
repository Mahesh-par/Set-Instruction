import type { Request, Response, NextFunction } from "express";

import { ApiError } from "../utils/ApiError.js";

export const notFoundHandler = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  next(new ApiError(404, `Route not found: ${req.originalUrl}`));
};
