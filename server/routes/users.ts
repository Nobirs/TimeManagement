import { Router } from "express";
import {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
} from "../controllers/users";
import { auth } from "../middleware/auth";

const router = Router();

router.use(auth);

router.get("/", getUsers);
router.get("/:id", getUser);
router.post("/", createUser);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

export default router;
