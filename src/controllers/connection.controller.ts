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
  /*
    #swagger.tags = ['Connection']
    #swagger.summary = 'Get all connections'
    #swagger.description = 'Returns all accepted connections for the logged-in user.'
    #swagger.security = [{ cookieAuth: [] }]
    #swagger.responses[200] = {
      description: 'Connections fetched successfully',
      content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } }
    }
    #swagger.responses[401] = { description: 'Unauthorized' }
  */
  const userId = req.user?.id;

  if (typeof userId !== "number") {
    return ApiError(res, 400, "User id is required");
  }

  const connections = await getConnectionsOfUser(userId);
  return ApiResponse(res, 200, "Connections fetched successfully", connections);
});

export const createConnectionController = asyncHandler(async (req: Request, res: Response) => {
  /*
    #swagger.tags = ['Connection']
    #swagger.summary = 'Send connection request'
    #swagger.description = 'Sends a connection request to a user by their email address.'
    #swagger.security = [{ cookieAuth: [] }]
    #swagger.requestBody = {
      required: true,
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/CreateConnectionBody' }
        }
      }
    }
    #swagger.responses[200] = {
      description: 'Connection request sent successfully',
      content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } }
    }
    #swagger.responses[400] = { description: 'No user found with that email' }
    #swagger.responses[401] = { description: 'Unauthorized' }
  */
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
  /*
    #swagger.tags = ['Connection']
    #swagger.summary = 'Get received connection requests'
    #swagger.description = 'Returns all pending connection requests received by the logged-in user.'
    #swagger.security = [{ cookieAuth: [] }]
    #swagger.responses[200] = {
      description: 'Connection requests fetched successfully',
      content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } }
    }
    #swagger.responses[401] = { description: 'Unauthorized' }
  */
  const requests = await getConnectionRequests(req.user!.id);
  return ApiResponse(res, 200, "Connection requests fetched successfully", requests);
});

export const acceptConnectionRequestController = asyncHandler(async (req: Request, res: Response) => {
  /*
    #swagger.tags = ['Connection']
    #swagger.summary = 'Accept a connection request'
    #swagger.description = 'Accepts a pending connection request by its ID.'
    #swagger.security = [{ cookieAuth: [] }]
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'Connection request ID',
      required: true,
      schema: { type: 'integer', example: 5 }
    }
    #swagger.responses[200] = {
      description: 'Connection request accepted successfully',
      content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } }
    }
    #swagger.responses[400] = { description: 'Invalid connection id' }
    #swagger.responses[401] = { description: 'Unauthorized' }
  */
  const connectionId = Number(req.params.id);

  if (!connectionId || isNaN(connectionId)) {
    return ApiError(res, 400, "Connection id is required");
  }
  await acceptConnectionRequest(connectionId);
  return ApiResponse(res, 200, "Connection request accepted successfully");
});

export const rejectConnectionRequestController = asyncHandler(async (req: Request, res: Response) => {
  /*
    #swagger.tags = ['Connection']
    #swagger.summary = 'Reject a connection request'
    #swagger.description = 'Rejects a pending connection request by its ID.'
    #swagger.security = [{ cookieAuth: [] }]
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'Connection request ID',
      required: true,
      schema: { type: 'integer', example: 5 }
    }
    #swagger.responses[200] = {
      description: 'Connection request rejected successfully',
      content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } }
    }
    #swagger.responses[400] = { description: 'Invalid connection id' }
    #swagger.responses[401] = { description: 'Unauthorized' }
  */
  const connectionId = Number(req.params.id);

  if (!connectionId || isNaN(connectionId)) {
    return ApiError(res, 400, "Connection id is required");
  }
  await rejectConnectionRequest(connectionId);
  return ApiResponse(res, 200, "Connection request rejected successfully");
});

export const getSentConnectionsController = asyncHandler(async (req: Request, res: Response) => {
  /*
    #swagger.tags = ['Connection']
    #swagger.summary = 'Get sent connection requests'
    #swagger.description = 'Returns all connection requests sent by the logged-in user.'
    #swagger.security = [{ cookieAuth: [] }]
    #swagger.responses[200] = {
      description: 'Connection responses fetched successfully',
      content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } }
    }
    #swagger.responses[401] = { description: 'Unauthorized' }
  */
  const response = await getSentConnections(req.user!.id);
  return ApiResponse(res, 200, "Connection responses fetched successfully", response);
});
