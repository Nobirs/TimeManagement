import { Request, Response } from 'express';
import { getData, setData } from '../services/redis';
import { Project, Task } from '../types';

export const getProjects = async (_req: Request, res: Response) => {
  try {
    const projects = await getData('projects') || [];
    return res.json({ data: projects });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return res.status(500).json({ error: 'Failed to fetch projects' });
  }
};

export const getProject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const projects = await getData('projects') || [];
    const project = projects.find((p: Project) => p.id === id);
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    return res.json({ data: project });
  } catch (error) {
    console.error('Error fetching project:', error);
    return res.status(500).json({ error: 'Failed to fetch project' });
  }
};

export const createProject = async (req: Request, res: Response) => {
  try {
    const project: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'tasks' | 'progress'> = req.body;
    
    if (!project.title?.trim()) {
      return res.status(400).json({ error: 'Project name is required' });
    }

    const newProject: Project = {
      ...project,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tasks: [],
      progress: 0
    };

    const projects = await getData('projects') || [];
    projects.push(newProject);
    await setData('projects', projects);
    
    return res.status(201).json({ data: newProject });
  } catch (error) {
    console.error('Error creating project:', error);
    return res.status(500).json({ error: 'Failed to create project' });
  }
};

export const updateProject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updatedProject: Project = req.body;
    
    if (!updatedProject.title?.trim()) {
      return res.status(400).json({ error: 'Project name is required' });
    }

    const projects = await getData('projects') || [];
    const index = projects.findIndex((p: Project) => p.id === id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    const projectToUpdate = {
      ...updatedProject,
      id,
      updatedAt: new Date().toISOString(),
      createdAt: projects[index].createdAt, // preserve original creation date
      tasks: updatedProject.tasks // update tasks
    };
    
    projects[index] = projectToUpdate;
    await setData('projects', projects);
    
    return res.json({ data: projectToUpdate });
  } catch (error) {
    console.error('Error updating project:', error);
    return res.status(500).json({ error: 'Failed to update project' });
  }
};

export const deleteProject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const projects = await getData('projects') || [];
    const filteredProjects = projects.filter((p: Project) => p.id !== id);
    
    if (projects.length === filteredProjects.length) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    await setData('projects', filteredProjects);
    return res.json({ success: true });
  } catch (error) {
    console.error('Error deleting project:', error);
    return res.status(500).json({ error: 'Failed to delete project' });
  }
};

export const addTaskToProject = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const task: Task = req.body;
    
    if (!task.title?.trim()) {
      return res.status(400).json({ error: 'Task title is required' });
    }

    const projects = await getData('projects') || [];
    const projectIndex = projects.findIndex((p: Project) => p.id === projectId);
    
    if (projectIndex === -1) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const newTask: Task = {
      ...task,
      id: task.id || crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: task.status || 'todo'
    };

    const updatedProject = {
      ...projects[projectIndex],
      tasks: [...projects[projectIndex].tasks, newTask],
      updatedAt: new Date().toISOString()
    };

    projects[projectIndex] = updatedProject;
    await setData('projects', projects);
    
    return res.status(201).json({ data: updatedProject });
  } catch (error) {
    console.error('Error adding task to project:', error);
    return res.status(500).json({ error: 'Failed to add task to project' });
  }
};

export const removeTaskFromProject = async (req: Request, res: Response) => {
  try {
    const { projectId, taskId } = req.params;
    const projects = await getData('projects') || [];
    const projectIndex = projects.findIndex((p: Project) => p.id === projectId);
    
    if (projectIndex === -1) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const updatedTasks = projects[projectIndex].tasks.filter((t: Task) => t.id !== taskId);
    
    if (updatedTasks.length === projects[projectIndex].tasks.length) {
      return res.status(404).json({ error: 'Task not found in project' });
    }

    const updatedProject = {
      ...projects[projectIndex],
      tasks: updatedTasks,
      updatedAt: new Date().toISOString()
    };

    projects[projectIndex] = updatedProject;
    await setData('projects', projects);
    
    return res.json({ data: updatedProject });
  } catch (error) {
    console.error('Error removing task from project:', error);
    return res.status(500).json({ error: 'Failed to remove task from project' });
  }
};

export const updateProjectProgress = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const { progress } = req.body;
    
    if (typeof progress !== 'number' || progress < 0 || progress > 100) {
      return res.status(400).json({ error: 'Progress must be a number between 0 and 100' });
    }

    const projects = await getData('projects') || [];
    const projectIndex = projects.findIndex((p: Project) => p.id === projectId);
    
    if (projectIndex === -1) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const updatedProject = {
      ...projects[projectIndex],
      progress: Math.max(0, Math.min(100, progress)),
      updatedAt: new Date().toISOString()
    };

    projects[projectIndex] = updatedProject;
    await setData('projects', projects);
    
    return res.json({ data: updatedProject });
  } catch (error) {
    console.error('Error updating project progress:', error);
    return res.status(500).json({ error: 'Failed to update project progress' });
  }
};