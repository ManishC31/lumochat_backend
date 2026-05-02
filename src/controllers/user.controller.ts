import { getUserById, updateUserData, updateUserImage } from "../services/user.service.ts";
import { compressImage, uploadImage } from "../services/imageUpload.service.ts";
import asyncHandler from "../utils/asyncHandler.ts";
import { type Request, type Response } from "express";
import { ApiError, ApiResponse } from "../utils/responses.ts";
import path from "path";

export const getLoggedInUserController = asyncHandler(async (req: Request, res: Response) => {
  return ApiResponse(res, 200, "User fetched successfully", req.user);
});

export const updateUserController = asyncHandler(async (req: Request, res: Response) => {
  await updateUserData({ id: req.user!.id, name: req.body.name, status: req.body.status });
  const user = await getUserById(req.user!.id);
  return ApiResponse(res, 200, "User details updated successfully", user);
});

export const updateUserAvatarController = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    return ApiError(res, 400, "No image file provided");
  }

  const filePath = path.join(req.file.destination, req.file.filename);
  await compressImage(filePath);
  const imageUrl = await uploadImage(filePath);
  await updateUserImage(req.user!.id, imageUrl);
  const user = await getUserById(req.user!.id);

  return ApiResponse(res, 200, "Avatar updated successfully", user);
});
