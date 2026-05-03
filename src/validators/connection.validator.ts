import { body, param } from "express-validator";

export const createConnectionValidators = [
  body("email").trim().notEmpty().withMessage("Email is required.").isEmail().withMessage("Please provide a valid email address.").normalizeEmail(),
];

export const connectionIdParamValidator = [
  param("id").notEmpty().withMessage("Connection ID is required.").isInt({ gt: 0 }).withMessage("Connection ID must be a positive integer."),
];
