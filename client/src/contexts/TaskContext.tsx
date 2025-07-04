import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import type { Task } from "@time-management/shared-types";
import { taskService } from "../data/services/taskService";
import { projectService } from "../data/services/projectService";

interface TaskContextType {
  tasks: Task[];

  addTask: (
    task: Omit<Task, "id" | "createdAt" | "updatedAt">
  ) => Promise<Task>;
  updateTask: (taskId: string, taskData: Task) => Promise<Task | null>;
  deleteTask: (taskId: string) => Promise<void>;
  loadTasks: () => Promise<void>;
  isSyncing: boolean;
  error: string | null;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTasks = useCallback(async () => {
    try {
      const loadedTasks = await taskService.getAll();
      setTasks(Array.isArray(loadedTasks) ? loadedTasks : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load tasks");
    }
  }, []);

  const triggerSync = useCallback(() => {
    localStorage.setItem("sync-projects", Date.now().toString());
  }, []);

  const addTask = async (
    task: Omit<Task, "id" | "createdAt" | "updatedAt">
  ) => {
    try {
      setIsSyncing(true);
      const newTask = await taskService.create(task);
      setTasks((prev) => [...prev, newTask]);
      return newTask;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add task");
      throw err;
    } finally {
      setIsSyncing(false);
    }
  };

  const updateTask = async (taskId: string, taskData: Task) => {
    try {
      setIsSyncing(true);
      const updatedTask = await taskService.update(taskId, {
        ...taskData,
        updatedAt: new Date().toISOString(),
      });
      if (updatedTask) {
        setTasks((prev) =>
          prev.map((t) => (t.id === taskId ? updatedTask : t))
        );

        const projects = await projectService.getAll();
        projects.map((project) => {
          if (project.tasks?.some((t) => t.id === taskId)) {
            const tasks = project.tasks.map((t) =>
              t.id === taskId ? updatedTask : t
            );
            const completedTasks = tasks.filter(
              (t) => t.status === "completed"
            ).length;
            const progress =
              tasks.length > 0
                ? Math.round((completedTasks / tasks.length) * 100)
                : 0;

            projectService.update({
              ...project,
              tasks,
              progress,
              updatedAt: new Date().toISOString(),
            });

            return {
              ...project,
              tasks,
              progress,
              updatedAt: new Date().toISOString(),
            };
          }
          return project;
        });

        triggerSync();
        return updatedTask;
      }
      return null;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update task");
      throw err;
    } finally {
      setIsSyncing(false);
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      setIsSyncing(true);
      await taskService.delete(taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      triggerSync();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete task");
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "sync-projects") {
        loadTasks();
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [loadTasks]);

  return (
    <TaskContext.Provider
      value={{
        tasks,
        addTask,
        updateTask,
        deleteTask,
        loadTasks,
        isSyncing,
        error,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTask = () => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error("useTask must be used within a TaskProvider");
  }
  return context;
};
