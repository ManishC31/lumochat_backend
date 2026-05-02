import { OAuth2Client, type TokenPayload } from "google-auth-library";
import { type Request, type Response } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import { createUser, getUserByEmail } from "../services/user.service.js";
import { ApiError, ApiResponse } from "../utils/responses.js";
import { encryptPassword, generateToken, verifyPassword } from "../services/auth.service.js";
import { authTypeConstant } from "../utils/constants.js";

export const registerUserController = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  const existingUser = await getUserByEmail(email);
  console.log("existing user:", existingUser);

  if (existingUser) {
    return ApiError(res, 400, "User already present with email");
  }

  const encPassword = await encryptPassword(password);
  const user = await createUser({ email, name, password: encPassword, authType: authTypeConstant.EMAIL });
  const token = await generateToken({ id: user.id, email: user.email });

  res.cookie("token", token);
  ApiResponse(res, 201, "User created successfully", {
    user: { id: user.id, name: user.name, email: user.email },
    token: token,
  });
});

export const googleAuthController = asyncHandler(async (req: Request, res: Response) => {
  const { credential, client_id } = req.body;

  // client to connect to google auth
  const client = new OAuth2Client();

  const ticket = await client.verifyIdToken({
    idToken: credential,
    audience: client_id,
  });

  const payload: TokenPayload | undefined = ticket.getPayload();

  if (!payload) {
    throw new Error("Failed to authenticate.");
  }

  console.log("Payload:", payload);

  const { email, given_name, family_name } = payload;

  if (!email) {
    throw new Error("Email is required for authentication");
  }

  let user = await getUserByEmail(email);

  console.log("existingUser:", user);

  // if user not present, register as a new user and if user already present then login directly

  if (!user) {
    const name = `${given_name} ${family_name}`.trim();
    user = await createUser({ name, email, password: "", authType: authTypeConstant.GOOGLE });
  }
  const token = await generateToken({ id: user.id, email: user.email });
  res.cookie("token", token);

  ApiResponse(res, 201, "User created successfully", {
    user: { id: user.id, name: user.name, email: user.email },
    token: token,
  });
});

export const loginUserController = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await getUserByEmail(email);

  if (!user) {
    return ApiError(res, 400, "User not found with email");
  }

  const isValidPassword = await verifyPassword(password, user.password);

  if (!isValidPassword) {
    return ApiError(res, 400, "Email & password are not matching");
  }

  const token = await generateToken({ id: user.id, email: user.email });
  res.cookie("token", token);

  ApiResponse(res, 200, "User created successfully", {
    user: { id: user.id, name: user.name, email: user.email },
    token: token,
  });
});

export const logoutUserController = asyncHandler(async (req: Request, res: Response) => {
  res.clearCookie("token");
  ApiResponse(res, 200, "User logged out successfully");
});
