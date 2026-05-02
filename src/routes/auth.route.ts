import { Router } from "express";
import { googleAuthController, loginUserController, logoutUserController, registerUserController } from "../controllers/auth.controller.ts";

const router = Router();

router.post("/google", googleAuthController);
router.post("/signup", registerUserController);
router.post("/signin", loginUserController);
router.get("/signout", logoutUserController);

export default router;
