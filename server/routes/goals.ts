import { Router } from "express";
import {
  getGoals,
  getGoal,
  createGoal,
  updateGoal,
  deleteGoal,
  syncGoals,
} from "../controllers/goals";
import { auth } from "../middleware/auth";

const router = Router();

router.use(auth);

router.get("/", getGoals);
router.get("/:id", getGoal);
router.post("/", createGoal);
router.put("/:id", updateGoal);
router.delete("/:id", deleteGoal);
router.post("/sync", syncGoals);

export default router;
