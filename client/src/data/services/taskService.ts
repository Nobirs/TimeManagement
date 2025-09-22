import { logger } from "../../utils/logger";
import { apiClient as api } from "../api/client";
import type { Task } from "@time-management/shared-types";
import { storageService } from "../services/storageService";

class TaskService {
  private readonly STORAGE_KEY = "tasks";

  async getAll(): Promise<Task[]> {
    try {
      const response = await api.get<Task[]>("/tasks");
      if (response.data) {
        storageService.set(this.STORAGE_KEY, response.data);
        return response.data;
      }
    } catch (err) {
      logger.warn("Error fetching tasks:", err);
    } finally {
      return storageService.get<Task[]>(this.STORAGE_KEY) || [];
    }
  }

  async getById(id: string): Promise<Task | null> {
    try {
      const response = await api.get<Task>(`/tasks/${id}`);
      if (response.data) {
        return response.data;
      }
      throw new Error("Task not found");
    } catch (err) {
      logger.warn("Error fetching task:", err);
      return null;
    }
  }

  async create(
    task: Omit<Task, "id" | "createdAt" | "updatedAt">
  ): Promise<Task> {
    if (!task.title.trim()) {
      throw new Error("Task title is required");
    }
    try {
      const response = await api.post<Task>("/tasks", task);
      if (response.data) {
        return response.data;
      }
      throw new Error("Failed to create task");
    } catch (err) {
      logger.warn("Error creating task:", err);
      throw err;
    }
  }

  async update(id: string, taskData: Partial<Task>): Promise<Task> {
    if (taskData.title && !taskData.title.trim()) {
      throw new Error("Task title is required");
    }
    try {
      const response = await api.put<Task>(`/tasks/${id}`, taskData);
      if (response.data) {
        return response.data;
      }
      throw new Error("Failed to update task");
    } catch (err) {
      logger.warn("Error updating task:", err);
      throw err;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const response = await api.delete<Task>(`/tasks/${id}`);
      if (response.status === 200) {
        return;
      }
      throw new Error("Failed to delete task");
    } catch (err) {
      logger.warn("Error deleting task:", err);
      throw err;
    }
  }
}

export const taskService = new TaskService();
