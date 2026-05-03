import { body } from "express-validator";

export const signupValidators = [
  body("name").trim().notEmpty().withMessage("Name is required.").isLength({ max: 50 }).withMessage("Name must be at most 50 characters."),
  body("email").trim().notEmpty().withMessage("Email is required.").isEmail().withMessage("Please provide a valid email address.").normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required.").isLength({ min: 6 }).withMessage("Password must be at least 6 characters."),
];

export const signinValidators = [
  body("email").trim().notEmpty().withMessage("Email is required.").isEmail().withMessage("Please provide a valid email address.").normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required."),
];
