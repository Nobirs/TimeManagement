import { Router } from 'express';
import {
    getProjects,
    getProject,
    createProject,
    updateProject,
    deleteProject,
    addTaskToProject,
    removeTaskFromProject,
    updateProjectProgress
} from '../controllers/projects';

const router = Router();

router.get('/', getProjects);
router.get('/:id', getProject);
router.post('/', createProject);
router.put('/:id', updateProject);
router.delete('/:id', deleteProject);
router.post('/:id/tasks', addTaskToProject);
router.delete('/:id/tasks/:taskId', removeTaskFromProject);
router.put('/:id/progress', updateProjectProgress);

export default router;