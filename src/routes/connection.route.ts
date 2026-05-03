import { Router } from "express";
import { checkLogin } from "../middlewares/auth.middleware.ts";
import {
  acceptConnectionRequestController,
  createConnectionController,
  getConnectionRequestController,
  getConnectionsOfUserConroller,
  getSentConnectionsController,
  rejectConnectionRequestController,
} from "../controllers/connection.controller.ts";
import { validate } from "../middlewares/validate.middleware.ts";
import { createConnectionValidators, connectionIdParamValidator } from "../validators/connection.validator.ts";

const router = Router();

router.get("/", checkLogin, getConnectionsOfUserConroller);
router.post("/", checkLogin, createConnectionValidators, validate, createConnectionController);
router.get("/requests", checkLogin, getConnectionRequestController);
router.get("/responses", checkLogin, getSentConnectionsController);
router.get("/accept-request/:id", checkLogin, connectionIdParamValidator, validate, acceptConnectionRequestController);
router.get("/reject-request/:id", checkLogin, connectionIdParamValidator, validate, rejectConnectionRequestController);

export default router;
