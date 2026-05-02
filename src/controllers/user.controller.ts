import { getUserById, updateUserData } from "../services/user.service.ts";
import asyncHandler from "../utils/asyncHandler.ts";
import { type Request, type Response } from "express";
import { ApiError, ApiResponse } from "../utils/responses.ts";

export const getUserDetailController = asyncHandler(async (req: Request, res: Response) => {
  const userId = Number(req.params.id);

  if (!userId || !isNaN(userId)) {
    return ApiError(res, 400, "Invalid user id");
  }

  const user = await getUserById(userId);

  return ApiResponse(res, 200, "User fetched successfully", user);
});

export const getLoggedInUserController = asyncHandler(async (req: Request, res: Response) => {
  return ApiResponse(res, 200, "User fetched successfully", req.user);
});

export const updateUserController = asyncHandler(async (req: Request, res: Response) => {
  await updateUserData({ id: req.user!.id, name: req.body.name, status: req.body.status });
  const user = await getUserById(req.user!.id);
  return ApiResponse(res, 200, "User details updated successfully", user);
});
