import { body } from "express-validator";

export const updateUserValidators = [
  body("name").trim().notEmpty().withMessage("Name is required.").isLength({ max: 50 }).withMessage("Name must be at most 50 characters."),
  body("status").optional().isString().withMessage("Status must be a string.").isLength({ max: 150 }).withMessage("Status must be at most 150 characters."),
];
