import { body, param, query } from "express-validator";

export const sendMessageValidators = [
  body("connectionId").notEmpty().withMessage("Connection ID is required.").isInt({ gt: 0 }).withMessage("Connection ID must be a positive integer."),
  body("receiverId").notEmpty().withMessage("Receiver ID is required.").isInt({ gt: 0 }).withMessage("Receiver ID must be a positive integer."),
  body("text").optional({ values: "falsy" }).isString().withMessage("Message text must be a string.").isLength({ max: 5000 }).withMessage("Message text must be at most 5000 characters."),
];

export const connectionIdParamValidator = [
  param("id").notEmpty().withMessage("Connection ID is required.").isInt({ gt: 0 }).withMessage("Connection ID must be a positive integer."),
];

export const getMessagesValidators = [
  ...connectionIdParamValidator,
  query("offset").optional().isInt({ min: 0 }).withMessage("Offset must be a non-negative integer."),
  query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be an integer between 1 and 100."),
];
