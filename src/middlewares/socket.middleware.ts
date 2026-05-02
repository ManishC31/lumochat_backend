import jwt from "jsonwebtoken";
import type { Socket, ExtendedError } from "socket.io";
import { getUserById } from "../services/user.service.js";

export const socketMiddleware = async (socket: Socket, next: (err?: ExtendedError) => void) => {
  try {
    // Extract token from auth object, cookies, or authorization header
    let token =
      (socket.handshake.auth?.token as string) ||
      socket.handshake.headers.cookie
        ?.split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1] ||
      (typeof socket.handshake.headers.authorization === "string" ? socket.handshake.headers.authorization.replace("Bearer ", "") : undefined);

    console.log("socket token:", token);

    if (!token) {
      console.log("Socket connection rejected: No token provided");
      return next(new Error("Unauthorized - No token"));
    }

    if (!process.env.JWT_SECRET) {
      console.log("JWT_SECRET not configured");
      return next(new Error("Server configuration error"));
    }

    // verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as any;

    // find the user from db
    const user = await getUserById(decoded.id);
    if (!user) {
      console.log("Socket connection rejected: User not found");
      return next(new Error("User not found"));
    }

    // attach user info to socket
    socket.user = user;
    console.log(`Socket authenticated for user: ${user.name} (${user.id})`);

    next();
  } catch (error) {
    console.log("Error in socket authentication:", (error as Error).message);
    next(new Error("Unauthorized - Authentication failed"));
  }
};
