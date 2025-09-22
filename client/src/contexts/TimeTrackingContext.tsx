import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import type { TimeTracking } from "@time-management/shared-types";
import { timeTrackingService } from "../data/services/timeTrackingService";
import { useAuth } from "./AuthContext";
import { logger } from "../utils/logger";

interface TimeTrackingContextType {
  timeTrackings: TimeTracking[];
  loadTimeTrackings: () => Promise<void>;
  addTimeTracking: (
    timeTracking: Omit<TimeTracking, "id" | "createdAt" | "updatedAt">
  ) => Promise<TimeTracking>;
  updateTimeTracking: (timeTracking: TimeTracking) => Promise<TimeTracking>;
  deleteTimeTracking: (timeTrackingId: string) => Promise<void>;
  isSyncing: boolean;
  error: string | null;
}

const TimeTrackingContext = createContext<TimeTrackingContextType | undefined>(
  undefined
);

export const TimeTrackingProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [timeTrackings, setTimeTrackings] = useState<TimeTracking[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const { user } = useAuth();

  const loadTimeTrackings = useCallback(async () => {
    try {
      const loadedTimeTrackings = await timeTrackingService.getAll();
      setTimeTrackings(
        Array.isArray(loadedTimeTrackings) ? loadedTimeTrackings : []
      );
      logger.info("Loaded time trackings", loadedTimeTrackings);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load time trackings"
      );
      logger.error("Failed to load time trackings", err);
    }
  }, [user]);

  useEffect(() => {
    loadTimeTrackings();
  }, [loadTimeTrackings]);

  const addTimeTracking = useCallback(
    async (
      timeTracking: Omit<TimeTracking, "id" | "createdAt" | "updatedAt">
    ) => {
      try {
        setIsSyncing(true);
        const newTimeTracking = await timeTrackingService.create(timeTracking);
        setTimeTrackings((prev) => [...prev, newTimeTracking]);
        return newTimeTracking;
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Failed to add time tracking"
        );
        logger.error("Failed to add time tracking", error);
        throw error;
      } finally {
        setIsSyncing(false);
      }
    },
    []
  );

  const updateTimeTracking = useCallback(async (timeTracking: TimeTracking) => {
    try {
      setIsSyncing(true);
      const updatedTimeTracking = await timeTrackingService.update(
        timeTracking
      );
      if (updatedTimeTracking) {
        setTimeTrackings((prev) =>
          prev.map((t) => (t.id === timeTracking.id ? updatedTimeTracking : t))
        );
      }
      return updatedTimeTracking;
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to update time tracking"
      );
      logger.error("Failed to update time tracking", error);
      throw error;
    } finally {
      setIsSyncing(false);
    }
  }, []);

  const deleteTimeTracking = useCallback(async (timeTrackingId: string) => {
    try {
      setIsSyncing(true);
      await timeTrackingService.delete(timeTrackingId);
      setTimeTrackings((prev) => prev.filter((t) => t.id !== timeTrackingId));
    } catch (error) {
      logger.error("Failed to delete time tracking", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to delete time tracking"
      );
    } finally {
      setIsSyncing(false);
    }
  }, []);

  const value: TimeTrackingContextType = {
    timeTrackings,
    loadTimeTrackings,
    addTimeTracking,
    updateTimeTracking,
    deleteTimeTracking,
    isSyncing,
    error,
  };

  return (
    <TimeTrackingContext.Provider value={value}>
      {children}
    </TimeTrackingContext.Provider>
  );
};

export const useTimeTracking = () => {
  const context = useContext(TimeTrackingContext);
  if (context === undefined) {
    throw new Error(
      "useTimeTracking must be used within a TimeTrackingProvider"
    );
  }
  return context;
};
