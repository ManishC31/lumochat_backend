import { Router } from "express";
import { checkLogin } from "../middlewares/auth.middleware.ts";
import { getLoggedInUserController, updateUserController } from "../controllers/user.controller.ts";

const router = Router();

router.get("/me", checkLogin, getLoggedInUserController);
router.put("/", checkLogin, updateUserController);

export default router;
