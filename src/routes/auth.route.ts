import { Router } from "express";
import { loginUserController, logoutUserController, registerUserController } from "../controllers/auth.controller.ts";
import { validate } from "../middlewares/validate.middleware.ts";
import { signupValidators, signinValidators } from "../validators/auth.validator.ts";

const router = Router();

router.post("/signup", signupValidators, validate, registerUserController);
router.post("/signin", signinValidators, validate, loginUserController);
router.get("/signout", logoutUserController);

export default router;
