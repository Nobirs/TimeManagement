import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { type Goal } from "@time-management/shared-types";
import { goalService } from "../data/services/goalService";
import { useAuth } from "./AuthContext";
import { logger } from "../utils/logger";

interface GoalContextType {
  goals: Goal[];
  addGoal: (
    goal: Omit<Goal, "id" | "createdAt" | "updatedAt">
  ) => Promise<Goal>;
  updateGoal: (goal: Goal) => Promise<Goal>;
  deleteGoal: (goalId: string) => Promise<void>;
  loadGoals: () => Promise<void>;
  isSyncing: boolean;
  error: string | null;
}

const GoalContext = createContext<GoalContextType | undefined>(undefined);

export const GoalProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const { user } = useAuth();

  const loadGoals = useCallback(async () => {
    try {
      const loadedGoals = await goalService.getAll();
      setGoals(Array.isArray(loadedGoals) ? loadedGoals : []);
      logger.info("Loaded goals", loadedGoals);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load goals");
      logger.error("Failed to load goals", err);
    }
  }, [user]);

  const addGoal = useCallback(
    async (goal: Omit<Goal, "id" | "createdAt" | "updatedAt">) => {
      try {
        setIsSyncing(true);
        const newGoal = await goalService.create(goal);
        setGoals((prev) => [...prev, newGoal]);
        return newGoal;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to add goal");
        logger.error("Failed to add goal", err);
        throw err;
      } finally {
        setIsSyncing(false);
      }
    },
    []
  );

  const updateGoal = useCallback(async (goal: Goal) => {
    try {
      setIsSyncing(true);
      const updatedGoal = await goalService.update(goal);
      if (updatedGoal) {
        setGoals((prev) =>
          prev.map((g) => (g.id === goal.id ? updatedGoal : g))
        );
      }
      return updatedGoal;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update goal");
      logger.error("Failed to update goal", err);
      throw err;
    } finally {
      setIsSyncing(false);
    }
  }, []);

  const deleteGoal = useCallback(async (goalId: string) => {
    try {
      setIsSyncing(true);
      await goalService.delete(goalId);
      setGoals((prev) => prev.filter((g) => g.id !== goalId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete goal");
      logger.error("Failed to delete goal", err);
      throw err;
    } finally {
      setIsSyncing(false);
    }
  }, []);

  useEffect(() => {
    loadGoals();
  }, [loadGoals]);

  const value: GoalContextType = {
    goals,
    addGoal,
    updateGoal,
    deleteGoal,
    loadGoals,
    isSyncing,
    error,
  };

  return <GoalContext.Provider value={value}>{children}</GoalContext.Provider>;
};

export const useGoal = () => {
  const context = useContext(GoalContext);
  if (context === undefined) {
    throw new Error("useGoal must be used within a GoalProvider");
  }
  return context;
};
