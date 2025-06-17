import type { Project, Task } from '@time-management/shared-types';
import { api } from './api';

export const projectService = {
  getAll: async (): Promise<Project[]> => {
    const response = await api.get('/projects');
    return response.data.data || [];
  },

  getById: async (id: string): Promise<Project> => {
    const response = await api.get(`/projects/${id}`);
    return response.data.data;
  },

  create: async (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> => {
    const response = await api.post('/projects', project);
    return response.data.data;
  },

  update: async (project: Project): Promise<Project> => {
    const response = await api.put(`/projects/${project.id}`, project);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/projects/${id}`);
  },

  addTask: async (projectId: string, task: Task): Promise<Project> => {
    const projects = await projectService.getAll();
    const project = projects.find(p => p.id === projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    const updatedProject = {
      ...project,
      tasks: [...project.tasks, task],
      updatedAt: new Date().toISOString(),
    };

    return projectService.update(updatedProject);
  },

  removeTask: async (projectId: string, taskId: string): Promise<Project> => {
    const projects = await projectService.getAll();
    const project = projects.find(p => p.id === projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    const updatedProject = {
      ...project,
      tasks: project.tasks.filter(task => task.id !== taskId),
      updatedAt: new Date().toISOString(),
    };

    return projectService.update(updatedProject);
  },

  updateProgress: async (projectId: string, progress: number): Promise<Project> => {
    const projects = await projectService.getAll();
    const project = projects.find(p => p.id === projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    const updatedProject = {
      ...project,
      progress: Math.max(0, Math.min(100, progress)),
      updatedAt: new Date().toISOString(),
    };

    return projectService.update(updatedProject);
  },
}; 