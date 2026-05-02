import { type Request, type Response } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import { createUser, getUserByEmail } from "../services/user.service.js";
import { ApiError, ApiResponse } from "../utils/responses.js";
import { encryptPassword, generateToken, verifyPassword } from "../services/auth.service.js";

export const registerUserController = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  const existingUser = await getUserByEmail(email);

  if (existingUser) {
    return ApiError(res, 400, "User already present with email");
  }

  const encPassword = await encryptPassword(password);
  const user = await createUser({ email, name, password: encPassword });
  const token = await generateToken({ id: user.id, email: user.email });

  res.cookie("token", token);
  ApiResponse(res, 201, "User created successfully", {
    user: { id: user.id, name: user.name, email: user.email },
    token: token,
  });
});

export const loginUserController = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await getUserByEmail(email);

  if (!user) {
    return ApiError(res, 400, "User not found with email");
  }

  const isValidPassword = await verifyPassword(password, user.password);

  if (!isValidPassword) {
    return ApiError(res, 400, "Email & password are not matching");
  }

  const token = await generateToken({ id: user.id, email: user.email });
  res.cookie("token", token);

  ApiResponse(res, 200, "User logged in successfully", {
    user: { id: user.id, name: user.name, email: user.email },
    token: token,
  });
});

export const logoutUserController = asyncHandler(async (req: Request, res: Response) => {
  res.clearCookie("token");
  ApiResponse(res, 200, "User logged out successfully");
});
