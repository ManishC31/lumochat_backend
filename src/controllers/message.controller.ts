import asyncHandler from "../utils/asyncHandler.ts";
import { type Request, type Response } from "express";
import { ApiError, ApiResponse } from "../utils/responses.ts";
import { compressImage, uploadImage } from "../services/imageUpload.service.ts";
import { createMessage, getMediaOfConnection, getMessagesOfConnection } from "../services/message.service.ts";
import { io, getReceiverSocketId } from "../app.ts";
import path from "path";

export const sendMessageController = asyncHandler(async (req: Request, res: Response) => {
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
  const connectionId = Number(req.params.id);
  const offset = Number(req.query.offset) || 0;
  const limit = Number(req.query.limit) || 15;

  if (!connectionId || Number.isNaN(connectionId)) {
    return ApiError(res, 400, "Invalid connection id");
  }

  const messages = await getMessagesOfConnection(connectionId, offset, limit);

  return ApiResponse(res, 200, "Messages fetched successfully", messages);
});

export const getMediaController = asyncHandler(async (req: Request, res: Response) => {
  const connectionId = Number(req.params.id);

  if (!connectionId || Number.isNaN(connectionId)) {
    return ApiError(res, 400, "Invalid connection id");
  }

  const media = await getMediaOfConnection(connectionId);

  return ApiResponse(res, 200, "Media fetched successfully", media);
});
