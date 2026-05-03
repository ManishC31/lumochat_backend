import express, { type Express } from "express";
import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";
import { Server } from "socket.io";
import http from "http";
import { socketMiddleware } from "./middlewares/socket.middleware.ts";
import { markMessagesAsRead } from "./services/message.service.ts";

const app: Express = express();

const corsOptions = {
  origin: process.env.CLIENT_URL || "https://lumochat.manishchavan.in" || "http://localhost:3000",
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH"],
};

// socket connection
const server = http.createServer(app);
const io = new Server(server, {
  cors: corsOptions,
});

// Apply socket middleware
io.use(socketMiddleware);

// middlewares
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions));

// store online users
const userSocketMap: Record<string, string> = {};

export function getReceiverSocketId(userId: string) {
  return userSocketMap[userId];
}

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  const userId = String(socket.user.id);

  userSocketMap[userId] = socket.id;

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("typing", ({ receiverId }: { receiverId: string }) => {
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("typing", { senderId: userId });
    }
  });

  socket.on("stop_typing", ({ receiverId }: { receiverId: string }) => {
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("stop_typing", { senderId: userId });
    }
  });

  // Receiver tells us they've read messages; mark DB + notify sender
  socket.on("markRead", async ({ connectionId, senderId }: { connectionId: string; senderId: string }) => {
    try {
      await markMessagesAsRead(Number(connectionId), Number(userId));
      const senderSocketId = getReceiverSocketId(senderId);
      if (senderSocketId) {
        io.to(senderSocketId).emit("messagesRead", { connectionId });
      }
    } catch (err) {
      console.error("markRead err:", err);
    }
  });

  // with socket.on we listen for events from clients
  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.user.name);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { app, io, server, userSocketMap };
