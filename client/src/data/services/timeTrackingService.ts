import type { TimeTracking } from "@time-management/shared-types";
import { apiClient } from "../api/client";
import { storageService } from "./storageService";
import { logger } from "../../utils/logger";

class TimeTrackingService {
  private readonly STORAGE_KEY = "timeTracking";

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private async syncWithServer(timeTracking: TimeTracking[]): Promise<void> {
    try {
      await apiClient.post("/timetracking/sync", { data: timeTracking });
    } catch (error) {
      logger.error("Failed to sync time tracking with server:", error);
    }
  }

  async getAll(): Promise<TimeTracking[]> {
    try {
      const response = await apiClient.get<TimeTracking[]>("/timetracking");
      if (response.data) {
        storageService.set(this.STORAGE_KEY, response.data);
        return response.data;
      }
      return storageService.get<TimeTracking[]>(this.STORAGE_KEY) || [];
    } catch (error) {
      logger.error("Error fetching time tracking:", error);
      return storageService.get<TimeTracking[]>(this.STORAGE_KEY) || [];
    }
  }

  async getById(id: string): Promise<TimeTracking | null> {
    try {
      const response = await apiClient.get<TimeTracking>(`/timetracking/${id}`);
      return response.data;
    } catch (error) {
      logger.error("Error fetching time tracking:", error);
      const timeTracking = await this.getAll();
      return timeTracking.find((t) => t.id === id) || null;
    }
  }

  async create(
    timeTracking: Omit<TimeTracking, "id" | "createdAt" | "updatedAt">
  ): Promise<TimeTracking> {
    const newTimeTracking: TimeTracking = {
      ...timeTracking,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    try {
      const response = await apiClient.post<TimeTracking>(
        "/timetracking",
        newTimeTracking
      );
      if (response.data) {
        const timeTrackings =
          storageService.get<TimeTracking[]>(this.STORAGE_KEY) || [];
        const updatedTimeTrackings = [...timeTrackings, response.data];
        storageService.set(this.STORAGE_KEY, updatedTimeTrackings);
        await this.syncWithServer(updatedTimeTrackings);
        return response.data;
      }
      throw new Error("Failed to create time tracking");
    } catch (error) {
      logger.error("Error creating time tracking:", error);
      const timeTrackings =
        storageService.get<TimeTracking[]>(this.STORAGE_KEY) || [];
      const updatedTimeTrackings = [...timeTrackings, newTimeTracking];
      storageService.set(this.STORAGE_KEY, updatedTimeTrackings);
      await this.syncWithServer(updatedTimeTrackings);
      return newTimeTracking;
    }
  }

  async update(updatedTimeTracking: TimeTracking): Promise<TimeTracking> {
    try {
      const response = await apiClient.put<TimeTracking>(
        `/timetracking/${updatedTimeTracking.id}`,
        updatedTimeTracking
      );
      if (response.data) {
        const timeTrackings =
          storageService.get<TimeTracking[]>(this.STORAGE_KEY) || [];
        const updatedTimeTrackings = timeTrackings.map((t) =>
          t.id === updatedTimeTracking.id ? (response.data as TimeTracking) : t
        );
        storageService.set(this.STORAGE_KEY, updatedTimeTrackings);
        await this.syncWithServer(updatedTimeTrackings);
        return response.data;
      }
      throw new Error("Failed to update time tracking");
    } catch (error) {
      logger.error("Error updating time tracking:", error);
      const timeTrackings =
        storageService.get<TimeTracking[]>(this.STORAGE_KEY) || [];
      const updatedTimeTrackings = timeTrackings.map((t) =>
        t.id === updatedTimeTracking.id
          ? (updatedTimeTracking as TimeTracking)
          : t
      );
      storageService.set(this.STORAGE_KEY, updatedTimeTrackings);
      await this.syncWithServer(updatedTimeTrackings);
      return updatedTimeTracking;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const response = await apiClient.delete(`/timetracking/${id}`);
      if (response.status === 200) {
        const timeTrackings =
          storageService.get<TimeTracking[]>(this.STORAGE_KEY) || [];
        const updatedTimeTrackings = timeTrackings.filter((t) => t.id !== id);
        storageService.set(this.STORAGE_KEY, updatedTimeTrackings);
        await this.syncWithServer(updatedTimeTrackings);
      }
    } catch (error) {
      logger.error("Error deleting time tracking:", error);
      throw error;
    }
  }
}

export const timeTrackingService = new TimeTrackingService();
