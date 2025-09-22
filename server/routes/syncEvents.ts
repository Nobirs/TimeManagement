import { Router } from "express";
import { syncEvents } from "../controllers/events";
import { auth } from "../middleware/auth";

const router = Router();

router.use(auth);

router.post("/", syncEvents);
export default router;
