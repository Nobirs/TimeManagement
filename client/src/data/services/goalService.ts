import type { Goal } from "@time-management/shared-types";
import { apiClient } from "../api/client";
import { storageService } from "./storageService";
import { logger } from "../../utils/logger";

class GoalService {
  private readonly STORAGE_KEY = "goals";

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private async syncWithServer(goals: Goal[]): Promise<void> {
    try {
      await apiClient.post<Goal>("/goals/sync", { data: goals });
    } catch (error) {
      logger.error("Failed to sync goals with server:", error);
    }
  }

  async getAll(): Promise<Goal[]> {
    try {
      const response = await apiClient.get<Goal[]>("/goals");
      if (response.data) {
        storageService.set(this.STORAGE_KEY, response.data);
        return response.data;
      }
      return storageService.get<Goal[]>(this.STORAGE_KEY) || [];
    } catch (error) {
      logger.error("Error fetching goals:", error);
      return storageService.get<Goal[]>(this.STORAGE_KEY) || [];
    }
  }

  async create(
    goal: Omit<Goal, "id" | "createdAt" | "updatedAt">
  ): Promise<Goal> {
    const newGoal: Goal = {
      ...goal,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      const response = await apiClient.post<Goal>("/goals", newGoal);
      if (response.data) {
        const goals = await this.getAll();
        const updatedGoals = [...goals, response.data];
        storageService.set(this.STORAGE_KEY, updatedGoals);
        await this.syncWithServer(updatedGoals);
        return response.data;
      }
      throw new Error("Failed to create goal");
    } catch (error) {
      logger.error("Error creating goal:", error);
      const goals = await this.getAll();
      const updatedGoals = [...goals, newGoal];
      storageService.set(this.STORAGE_KEY, updatedGoals);
      await this.syncWithServer(updatedGoals);
      return newGoal;
    }
  }

  async update(updatedGoal: Goal): Promise<Goal> {
    try {
      const response = await apiClient.put<Goal>(
        `/goals/${updatedGoal.id}`,
        updatedGoal
      );
      if (response.data) {
        const goals = await this.getAll();
        const updatedGoals = goals.map((g) =>
          g.id === updatedGoal.id ? (response.data as Goal) : g
        );
        storageService.set(this.STORAGE_KEY, updatedGoals);
        await this.syncWithServer(updatedGoals);
        return response.data;
      }
      throw new Error("Failed to update goal");
    } catch (error) {
      logger.error("Error updating goal:", error);
      const goals = await this.getAll();
      const updatedGoals = goals.map((g) =>
        g.id === updatedGoal.id ? updatedGoal : g
      );
      storageService.set(this.STORAGE_KEY, updatedGoals);
      await this.syncWithServer(updatedGoals);
      return updatedGoal;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const response = await apiClient.delete(`/goals/${id}`);
      if (response.status === 200) {
        const goals = await this.getAll();
        const updatedGoals = goals.filter((g) => g.id !== id);
        storageService.set(this.STORAGE_KEY, updatedGoals);
        await this.syncWithServer(updatedGoals);
      } else {
        throw new Error("Failed to delete goal");
      }
    } catch (error) {
      logger.error("Error deleting goal:", error);
      const goals = await this.getAll();
      const updatedGoals = goals.filter((g) => g.id !== id);
      storageService.set(this.STORAGE_KEY, updatedGoals);
      await this.syncWithServer(updatedGoals);
    }
  }
}

export const goalService = new GoalService();
