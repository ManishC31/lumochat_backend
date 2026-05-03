import { type Request, type Response } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import { createUser, getUserByEmail } from "../services/user.service.js";
import { ApiError, ApiResponse } from "../utils/responses.js";
import { encryptPassword, generateToken, verifyPassword } from "../services/auth.service.js";

export const registerUserController = asyncHandler(async (req: Request, res: Response) => {
  /*
    #swagger.tags = ['Auth']
    #swagger.summary = 'Register a new user'
    #swagger.description = 'Creates a new user account and sets an auth cookie.'
    #swagger.requestBody = {
      required: true,
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/SignupBody' }
        }
      }
    }
    #swagger.responses[201] = {
      description: 'User created successfully',
      content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } }
    }
    #swagger.responses[400] = {
      description: 'User already exists with that email',
      content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } }
    }
  */
  const { name, email, password } = req.body;

  const existingUser = await getUserByEmail(email);

  if (existingUser) {
    return ApiError(res, 400, "User already present with email");
  }

  const encPassword = await encryptPassword(password);
  const user = await createUser({ email, name, password: encPassword });
  const token = await generateToken({ id: user.id, email: user.email });

  const isProduction = process.env.NODE_ENV === "production";
  res.cookie("token", token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  ApiResponse(res, 201, "User created successfully", {
    user: { id: user.id, name: user.name, email: user.email },
    token: token,
  });
});

export const loginUserController = asyncHandler(async (req: Request, res: Response) => {
  /*
    #swagger.tags = ['Auth']
    #swagger.summary = 'Sign in'
    #swagger.description = 'Authenticates a user and sets an auth cookie.'
    #swagger.requestBody = {
      required: true,
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/SigninBody' }
        }
      }
    }
    #swagger.responses[200] = {
      description: 'User logged in successfully',
      content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } }
    }
    #swagger.responses[400] = {
      description: 'Invalid credentials',
      content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } }
    }
  */
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
  const isProduction = process.env.NODE_ENV === "production";
  res.cookie("token", token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  ApiResponse(res, 200, "User logged in successfully", {
    user: { id: user.id, name: user.name, email: user.email },
    token: token,
  });
});

export const logoutUserController = asyncHandler(async (req: Request, res: Response) => {
  /*
    #swagger.tags = ['Auth']
    #swagger.summary = 'Sign out'
    #swagger.description = 'Clears the auth cookie and logs out the current user.'
    #swagger.security = [{ cookieAuth: [] }]
    #swagger.responses[200] = {
      description: 'User logged out successfully',
      content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } }
    }
  */
  const isProduction = process.env.NODE_ENV === "production";
  res.clearCookie("token", {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
  });
  ApiResponse(res, 200, "User logged out successfully");
});
