// configure environment variables
import "dotenv/config";

import { app, server } from "./app.ts";
import authRoutes from "./routes/auth.route.ts";
import connectionRoutes from "./routes/connection.route.ts";
import userRoutes from "./routes/user.route.ts";
import messageRoutes from "./routes/message.route.ts";
import { v2 as cloudinary } from "cloudinary";
import { type Request, type Response } from "express";

// testing route
app.get("/", (req: Request, res: Response) => {
  res.send("<h1>Welcome to Chat Application</h1>");
});

// routes
app.use("/api/auth", authRoutes);
app.use("/api/connection", connectionRoutes);
app.use("/api/user", userRoutes);
app.use("/api/message", messageRoutes);

// cloudinary connection
cloudinary.config({
  secure: true,
});

// run application
const port = process.env.PORT || 9090;

server.listen(port, () => {
  console.log(`SERVER IS RUNNING ON PORT ${port}`);
});
