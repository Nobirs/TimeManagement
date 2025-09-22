import { Router } from "express";
import {
  getNotes,
  getNote,
  createNote,
  updateNote,
  deleteNote,
  getNotesByCategory,
  getNotesByTag,
  getPinnedNotes,
} from "../controllers/notes";
import { auth } from "../middleware/auth";

const router = Router();

router.use(auth);

router.get("/", getNotes);
router.get("/:id", getNote);
router.post("/", createNote);
router.put("/:id", updateNote);
router.delete("/:id", deleteNote);
router.get("/category/:category", getNotesByCategory);
router.get("/tag/:tag", getNotesByTag);
router.get("/pinned", getPinnedNotes);

export default router;
