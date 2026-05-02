import { Request } from "express";
import { Socket } from "socket.io";

declare module "express-serve-static-core" {
  interface Request {
    user?: {
      id: number;
      name: string;
      email: string;
      image?: string;
    };
  }
}

declare module "socket.io" {
  interface Socket {
    user?: any; // Adjust type as needed, e.g., User type
  }
}
