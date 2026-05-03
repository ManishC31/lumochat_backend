import { Router } from "express";
import { checkLogin } from "../middlewares/auth.middleware.ts";
import { getMediaController, getMessagesController, sendMessageController } from "../controllers/message.controller.ts";
import { upload } from "../middlewares/multer.middleware.ts";
import { validate } from "../middlewares/validate.middleware.ts";
import { sendMessageValidators, connectionIdParamValidator, getMessagesValidators } from "../validators/message.validator.ts";

const router = Router();

router.post("/", checkLogin, upload.single("file"), sendMessageValidators, validate, sendMessageController);
router.get("/:id/media", checkLogin, connectionIdParamValidator, validate, getMediaController);
router.get("/:id", checkLogin, getMessagesValidators, validate, getMessagesController);

export default router;
