import { Router } from "express";
import { checkLogin } from "../middlewares/auth.middleware.ts";
import { getMediaController, getMessagesController, sendMessageController } from "../controllers/message.controller.ts";
import { upload } from "../middlewares/multer.middleware.ts";

const router = Router();

router.post("/", checkLogin, upload.single("file"), sendMessageController);
router.get("/:id/media", checkLogin, getMediaController);
router.get("/:id", checkLogin, getMessagesController);

export default router;
