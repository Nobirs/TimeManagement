import { Router } from "express";
import {
  getHabits,
  getHabit,
  createHabit,
  updateHabit,
  deleteHabit,
  syncHabits,
} from "../controllers/habits";
import { auth } from "../middleware/auth";

const router = Router();

router.use(auth);

router.get("/", getHabits);
router.get("/:id", getHabit);
router.post("/", createHabit);
router.put("/:id", updateHabit);
router.delete("/:id", deleteHabit);
router.post("/sync", syncHabits);

export default router;
