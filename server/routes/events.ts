import { Router } from "express";
import {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
} from "../controllers/events";
import { auth } from "../middleware/auth";

const router = Router();

router.use(auth);

router.get("/", getEvents);
router.get("/:id", getEvent);
router.post("/", createEvent);
router.put("/:id", updateEvent);
router.delete("/:id", deleteEvent);

export default router;
