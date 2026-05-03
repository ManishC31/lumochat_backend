// configure environment variables
import "dotenv/config";

import { app, server } from "./app.ts";
import authRoutes from "./routes/auth.route.ts";
import connectionRoutes from "./routes/connection.route.ts";
import userRoutes from "./routes/user.route.ts";
import messageRoutes from "./routes/message.route.ts";
import { v2 as cloudinary } from "cloudinary";
import { type Request, type Response } from "express";
import swaggerUi from "swagger-ui-express";
import { createRequire } from "module";

// testing route
app.get("/", (req: Request, res: Response) => {
  res.send("<h1>Welcome to Chat Application</h1>");
});

// routes
app.use("/api/auth", authRoutes);
app.use("/api/connection", connectionRoutes);
app.use("/api/user", userRoutes);
app.use("/api/message", messageRoutes);

// swagger docs
const require = createRequire(import.meta.url);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let swaggerDocument: any = {};
try {
  swaggerDocument = require("../swagger-output.json");
} catch {
  console.warn("swagger-output.json not found — run `npm run swagger` to generate it");
}
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// cloudinary connection
cloudinary.config({
  secure: true,
});

// run application
const port = process.env.PORT || 9090;

server.listen(port, () => {
  console.log(`SERVER IS RUNNING ON PORT ${port}`);
});
