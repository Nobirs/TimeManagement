import { Router } from "express";
import { register, login, fastLogin } from "../controllers/auth";
import { validate } from "../middleware/validate";
import { registerSchema, loginSchema, fastLoginSchema } from "../auth.schema";

const router = Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.post("/fast-login", validate(fastLoginSchema), fastLogin);

export default router;
