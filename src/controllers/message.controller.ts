import asyncHandler from "../utils/asyncHandler.ts";
import { type Request, type Response } from "express";
import { ApiError, ApiResponse } from "../utils/responses.ts";
import { compressImage, uploadImage } from "../services/imageUpload.service.ts";
import { createMessage, getMediaOfConnection, getMessagesOfConnection, markMessagesAsRead } from "../services/message.service.ts";
import { io, getReceiverSocketId } from "../app.ts";
import path from "path";

export const sendMessageController = asyncHandler(async (req: Request, res: Response) => {
  /*
    #swagger.tags = ['Message']
    #swagger.summary = 'Send a message'
    #swagger.description = 'Sends a text or media message to a connection. Emits a socket event to the receiver if online.'
    #swagger.security = [{ cookieAuth: [] }]
    #swagger.requestBody = {
      required: true,
      content: {
        'multipart/form-data': {
          schema: {
            type: 'object',
            required: ['connectionId', 'receiverId', 'text'],
            properties: {
              connectionId: { type: 'integer', example: 1 },
              receiverId: { type: 'integer', example: 2 },
              text: { type: 'string', example: 'Hello!' },
              file: { type: 'string', format: 'binary', description: 'Optional image or media file' }
            }
          }
        }
      }
    }
    #swagger.responses[201] = {
      description: 'Message sent successfully',
      content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } }
    }
    #swagger.responses[401] = { description: 'Unauthorized' }
  */
  const { connectionId, receiverId, text } = req.body;

  let imageUrl: string | null = null;
  if (req.file) {
    const filePath = path.join(req.file.destination, req.file.filename);
    const isImage = req.file.mimetype.startsWith("image/");

    // only compress actual images — sharp cannot handle audio/video
    if (isImage) {
      await compressImage(filePath);
    }

    imageUrl = await uploadImage(filePath);
  }

  const message = await createMessage(connectionId, req.user!.id, receiverId, text.trim(), imageUrl);

  // Emit message to receiver via socket if they are online
  const receiverSocketId = getReceiverSocketId(String(receiverId));
  if (receiverSocketId) {
    io.to(receiverSocketId).emit("newMessage", {
      ...message,
      sender: {
        id: req.user!.id,
        name: req.user!.name,
        email: req.user!.email,
      },
    });
  }

  return ApiResponse(res, 201, "Message sent successfully");
});

export const getMessagesController = asyncHandler(async (req: Request, res: Response) => {
  /*
    #swagger.tags = ['Message']
    #swagger.summary = 'Get messages in a connection'
    #swagger.description = 'Returns paginated messages for a connection and marks unread messages as read.'
    #swagger.security = [{ cookieAuth: [] }]
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'Connection ID',
      required: true,
      schema: { type: 'integer', example: 1 }
    }
    #swagger.parameters['offset'] = {
      in: 'query',
      description: 'Number of messages to skip (pagination)',
      required: false,
      schema: { type: 'integer', default: 0, example: 0 }
    }
    #swagger.parameters['limit'] = {
      in: 'query',
      description: 'Max number of messages to return',
      required: false,
      schema: { type: 'integer', default: 15, example: 15 }
    }
    #swagger.responses[200] = {
      description: 'Messages fetched successfully',
      content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } }
    }
    #swagger.responses[400] = { description: 'Invalid connection id' }
    #swagger.responses[401] = { description: 'Unauthorized' }
  */
  const connectionId = Number(req.params.id);
  const offset = Number(req.query.offset) || 0;
  const limit = Number(req.query.limit) || 15;

  if (!connectionId || Number.isNaN(connectionId)) {
    return ApiError(res, 400, "Invalid connection id");
  }

  const messages = await getMessagesOfConnection(connectionId, offset, limit);

  // Mark messages received by the current user as read and notify the sender(s)
  const senderIds = await markMessagesAsRead(connectionId, req.user!.id);
  if (senderIds.length > 0) {
    const unique = [...new Set(senderIds.map(String))];
    for (const senderId of unique) {
      const senderSocketId = getReceiverSocketId(senderId);
      if (senderSocketId) {
        io.to(senderSocketId).emit("messagesRead", { connectionId });
      }
    }
  }

  return ApiResponse(res, 200, "Messages fetched successfully", messages);
});

export const getMediaController = asyncHandler(async (req: Request, res: Response) => {
  /*
    #swagger.tags = ['Message']
    #swagger.summary = 'Get media files in a connection'
    #swagger.description = 'Returns all media (images/files) shared within a connection.'
    #swagger.security = [{ cookieAuth: [] }]
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'Connection ID',
      required: true,
      schema: { type: 'integer', example: 1 }
    }
    #swagger.responses[200] = {
      description: 'Media fetched successfully',
      content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } }
    }
    #swagger.responses[400] = { description: 'Invalid connection id' }
    #swagger.responses[401] = { description: 'Unauthorized' }
  */
  const connectionId = Number(req.params.id);

  if (!connectionId || Number.isNaN(connectionId)) {
    return ApiError(res, 400, "Invalid connection id");
  }

  const media = await getMediaOfConnection(connectionId);

  return ApiResponse(res, 200, "Media fetched successfully", media);
});
