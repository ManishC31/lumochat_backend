import asyncHandler from "../utils/asyncHandler.ts";
import { type Request, type Response } from "express";
import { ApiError, ApiResponse } from "../utils/responses.ts";
import {
  acceptConnectionRequest,
  createConnectionRequest,
  getConnectionRequests,
  getConnectionsOfUser,
  getSentConnections,
  rejectConnectionRequest,
} from "../services/connection.service.ts";
import { getUserByEmail } from "../services/user.service.ts";

export const getConnectionsOfUserConroller = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (typeof userId !== "number") {
    return ApiError(res, 400, "User id is required");
  }

  const connections = await getConnectionsOfUser(userId);
  return ApiResponse(res, 200, "Connections fetched successfully", connections);
});

export const createConnectionController = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    return ApiError(res, 400, "Email is required");
  }

  const user = await getUserByEmail(email);

  if (!user) {
    return ApiError(res, 400, "No user found with email");
  }

  await createConnectionRequest(req.user!.id, user.id);

  return ApiResponse(res, 200, "Connection request sent successfully");
});

export const getConnectionRequestController = asyncHandler(async (req: Request, res: Response) => {
  const requests = await getConnectionRequests(req.user!.id);
  return ApiResponse(res, 200, "Connection requests fetched successfully", requests);
});

export const acceptConnectionRequestController = asyncHandler(async (req: Request, res: Response) => {
  const connectionId = Number(req.params.id);
  console.log("connectionId", connectionId);

  if (!connectionId || isNaN(connectionId)) {
    return ApiError(res, 400, "Connection id is required");
  }
  await acceptConnectionRequest(connectionId);
  return ApiResponse(res, 200, "Connection request accepted successfully");
});

export const rejectConnectionRequestController = asyncHandler(async (req: Request, res: Response) => {
  const connectionId = Number(req.params.id);

  if (!connectionId || isNaN(connectionId)) {
    return ApiError(res, 400, "Connection id is required");
  }
  await rejectConnectionRequest(connectionId);
  return ApiResponse(res, 200, "Connection request rejected successfully");
});

export const getSentConnectionsController = asyncHandler(async (req: Request, res: Response) => {
  const response = await getSentConnections(req.user!.id);
  return ApiResponse(res, 200, "Connection responses fetched successfully", response);
});
