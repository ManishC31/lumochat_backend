import { validationResult } from "express-validator";
import type { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/responses.ts";

export const validate = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const first = errors.array()[0];
    ApiError(res, 400, first?.msg ?? "Validation failed.");
    return;
  }
  next();
};
