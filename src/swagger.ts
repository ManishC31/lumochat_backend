import swaggerAutogen from "swagger-autogen";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const doc = {
  info: {
    title: "Chat App API",
    description: "REST API documentation for the Chat Application",
    version: "1.0.0",
  },
  servers: [
    { url: "http://localhost:9090", description: "Development server" },
    { url: "https://api.lumochat.manishchavan.in", description: "Production server" },
  ],
  components: {
    securitySchemes: {
      cookieAuth: {
        type: "apiKey",
        in: "cookie",
        name: "token",
        description: "JWT token stored in HTTP-only cookie (set on login/signup)",
      },
    },
    schemas: {
      SignupBody: {
        type: "object",
        required: ["name", "email", "password"],
        properties: {
          name: { type: "string", example: "John Doe" },
          email: { type: "string", format: "email", example: "john@example.com" },
          password: { type: "string", minLength: 6, example: "password123" },
        },
      },
      SigninBody: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email", example: "john@example.com" },
          password: { type: "string", example: "password123" },
        },
      },
      UpdateUserBody: {
        type: "object",
        properties: {
          name: { type: "string", example: "John Doe" },
          status: { type: "string", maxLength: 150, example: "Hey there!" },
        },
      },
      CreateConnectionBody: {
        type: "object",
        required: ["email"],
        properties: {
          email: { type: "string", format: "email", example: "friend@example.com" },
        },
      },
      SendMessageBody: {
        type: "object",
        required: ["connectionId", "receiverId", "text"],
        properties: {
          connectionId: { type: "integer", example: 1 },
          receiverId: { type: "integer", example: 2 },
          text: { type: "string", example: "Hello!" },
          file: { type: "string", format: "binary" },
        },
      },
      ApiResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          message: { type: "string", example: "Operation successful" },
          data: { type: "object" },
        },
      },
      ApiError: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          message: { type: "string", example: "Error message" },
        },
      },
    },
  },
};

const outputFile = join(__dirname, "../swagger-output.json");
const endpointsFiles = [join(__dirname, "index.ts")];

swaggerAutogen({ openapi: "3.0.0" })(outputFile, endpointsFiles, doc);
