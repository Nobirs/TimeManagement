import { Task } from '../models/types';
import { api } from './api';

export const taskService = {
  getAll: async (): Promise<Task[]> => {
    const response = await api.get('/tasks');
    return response.data.data || [];
  },

  getById: async (id: string): Promise<Task> => {
    const response = await api.get(`/tasks/${id}`);
    return response.data.data;
  },

  create: async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> => {
    if (!task.title.trim()) {
      throw new Error('Task title is required');
    }
    const response = await api.post('/tasks', task);
    return response.data.data;
  },

  update: async (id: string, taskData: Partial<Task>): Promise<Task> => {
    if (taskData.title && !taskData.title.trim()) {
      throw new Error('Task title is required');
    }
    const response = await api.put(`/tasks/${id}`, taskData);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/tasks/${id}`);
  },
}; 