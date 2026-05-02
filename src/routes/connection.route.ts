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

const router = Router();

router.get("/", checkLogin, getConnectionsOfUserConroller);
router.post("/", checkLogin, createConnectionController);
router.get("/requests", checkLogin, getConnectionRequestController);
router.get("/responses", checkLogin, getSentConnectionsController);
router.get("/accept-request/:id", checkLogin, acceptConnectionRequestController);
router.get("/reject-request/:id", checkLogin, rejectConnectionRequestController);

export default router;
