import { getUserById, updateUserData, updateUserImage } from "../services/user.service.ts";
import { compressImage, uploadImage } from "../services/imageUpload.service.ts";
import asyncHandler from "../utils/asyncHandler.ts";
import { type Request, type Response } from "express";
import { ApiError, ApiResponse } from "../utils/responses.ts";
import path from "path";

export const getLoggedInUserController = asyncHandler(async (req: Request, res: Response) => {
  /*
    #swagger.tags = ['User']
    #swagger.summary = 'Get logged-in user'
    #swagger.description = 'Returns the currently authenticated user profile.'
    #swagger.security = [{ cookieAuth: [] }]
    #swagger.responses[200] = {
      description: 'User fetched successfully',
      content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } }
    }
    #swagger.responses[401] = { description: 'Unauthorized' }
  */
  return ApiResponse(res, 200, "User fetched successfully", {
    user: req.user,
    token: req.cookies?.token ?? null,
  });
});

export const updateUserController = asyncHandler(async (req: Request, res: Response) => {
  /*
    #swagger.tags = ['User']
    #swagger.summary = 'Update user profile'
    #swagger.description = 'Updates the name and/or status of the logged-in user.'
    #swagger.security = [{ cookieAuth: [] }]
    #swagger.requestBody = {
      required: true,
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/UpdateUserBody' }
        }
      }
    }
    #swagger.responses[200] = {
      description: 'User details updated successfully',
      content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } }
    }
    #swagger.responses[401] = { description: 'Unauthorized' }
  */
  await updateUserData({ id: req.user!.id, name: req.body.name, status: req.body.status });
  const user = await getUserById(req.user!.id);
  return ApiResponse(res, 200, "User details updated successfully", user);
});

export const updateUserAvatarController = asyncHandler(async (req: Request, res: Response) => {
  /*
    #swagger.tags = ['User']
    #swagger.summary = 'Update user avatar'
    #swagger.description = 'Uploads and sets a new avatar image for the logged-in user.'
    #swagger.security = [{ cookieAuth: [] }]
    #swagger.requestBody = {
      required: true,
      content: {
        'multipart/form-data': {
          schema: {
            type: 'object',
            required: ['avatar'],
            properties: {
              avatar: { type: 'string', format: 'binary', description: 'Image file (JPEG, PNG, WebP, etc.)' }
            }
          }
        }
      }
    }
    #swagger.responses[200] = {
      description: 'Avatar updated successfully',
      content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } }
    }
    #swagger.responses[400] = { description: 'No image file provided' }
    #swagger.responses[401] = { description: 'Unauthorized' }
  */
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
