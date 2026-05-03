import { Router } from "express";
import { checkLogin } from "../middlewares/auth.middleware.ts";
import { getLoggedInUserController, updateUserController, updateUserAvatarController } from "../controllers/user.controller.ts";
import { upload } from "../middlewares/multer.middleware.ts";
import { validate } from "../middlewares/validate.middleware.ts";
import { updateUserValidators } from "../validators/user.validator.ts";

const router = Router();

router.get("/me", checkLogin, getLoggedInUserController);
router.put("/", checkLogin, updateUserValidators, validate, updateUserController);
router.patch("/avatar", checkLogin, upload.single("avatar"), updateUserAvatarController);

export default router;
