import type { NextFunction } from "express";
import { type Request, type Response } from "express";
import { pool } from "../configs/db.config.ts";
import { ApiError } from "../utils/responses.ts";
import { getUserById } from "../services/user.service.ts";
import jwt, { type JwtPayload } from "jsonwebtoken";
import type { IUser } from "../types/user.type.ts";

export const checkLogin = async (req: Request, res: Response, next: NextFunction) => {
  const client = await pool.connect();
  try {
    const token =
      req.cookies?.token || (typeof req.headers["authorization"] === "string" ? req.headers["authorization"].replace("Bearer ", "") : undefined);

    if (!token) {
      return ApiError(res, 401, "You are not authenticated. Login first.");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;

    if (!decoded?.id) {
      return ApiError(res, 401, "You are not authenticated. Login first to access resource");
    }

    const user: IUser = await getUserById(decoded?.id);

    if (!user) {
      return ApiError(res, 401, "You are not authenticated. Login first to access resource");
    }

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
    };

    next();
  } catch (error) {
    console.error("checkLogin err:", error);
    return ApiError(res, 401, "Failed to authenticate user");
  } finally {
    client.release();
  }
};
