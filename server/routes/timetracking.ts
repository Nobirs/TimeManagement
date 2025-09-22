import { Router } from "express";
import {
  getTimeTrackings,
  getTimeTracking,
  createTimeTracking,
  updateTimeTracking,
  deleteTimeTracking,
  syncTimeTracking,
} from "../controllers/timetracking";
import { auth } from "../middleware/auth";
import { get } from "http";

const router = Router();

router.use(auth);

router.get("/", getTimeTrackings);
router.get("/:id", getTimeTracking);
router.post("/", createTimeTracking);
router.put("/:id", updateTimeTracking);
router.delete("/:id", deleteTimeTracking);
router.post("/sync", syncTimeTracking);

export default router;
