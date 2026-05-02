import { type Response } from "express";

export type ApiResponseObject = {
  success: boolean;
  message: string;
  data?: any;
};

export const ApiResponse = (res: Response, code: number = 200, message = "Operation Successful", data: any = null) => {
  const object: ApiResponseObject = {
    success: true,
    message,
  };

  if (data) {
    object.data = data;
  }

  res.status(code).json(object);
};

export const ApiError = (res: Response, code: number = 500, message: string = "Something went wrong") => {
  res.status(code).json({
    success: false,
    error: message,
  });
};
