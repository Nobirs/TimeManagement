import { Router } from "express";
import {
  getProjects,
  getProject,
  getProjectTasks,
  createProject,
  updateProject,
  deleteProject,
  addTaskToProject,
  removeTaskFromProject,
} from "../controllers/projects";
import { auth } from "../middleware/auth";

const router = Router();

router.use(auth);

router.get("/", getProjects);
router.get("/:id", getProject);
router.post("/", createProject);
router.put("/:id", updateProject);
router.delete("/:id", deleteProject);
router.post("/:id/tasks", addTaskToProject);
router.get("/:id/tasks", getProjectTasks);
router.delete("/:projectId/tasks/:taskId", removeTaskFromProject);

export default router;
