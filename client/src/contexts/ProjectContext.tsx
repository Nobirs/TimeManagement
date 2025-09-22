import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
  useCallback,
} from "react";
import type { Project } from "@time-management/shared-types";
import { projectService } from "../data/services/projectService";
import { useAuth } from "./AuthContext";
import { logger } from "../utils/logger";
import { useTask } from "./TaskContext";

interface ProjectContextType {
  projects: Project[];
  loadProjects: () => Promise<void>;
  updateProject: (project: Project) => Promise<Project | null>;
  deleteProject: (projectId: string) => Promise<void>;
  removeTaskFromProject: (
    taskId: string,
    projectId: string
  ) => Promise<Project>;
  isSyncing: boolean;
  error: string | null;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const loadProjects = useCallback(async () => {
    try {
      const loadedProjects = await projectService.getAll();
      setProjects(Array.isArray(loadedProjects) ? loadedProjects : []);
      logger.info("Loaded projects", loadedProjects);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load Projects");
      logger.error("Failed to load Projects", err);
    }
  }, [user]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const triggerSync = useCallback(() => {
    localStorage.setItem("sync-projects", Date.now().toString());
  }, []);

  const updateProject = async (project: Project) => {
    try {
      setIsSyncing(true);
      const updatedProject = await projectService.update({
        ...project,
        updatedAt: new Date().toISOString(),
      });

      if (updatedProject) {
        setProjects((prev) =>
          prev.map((p) => (p.id === project.id ? updatedProject : p))
        );
        triggerSync();
        return updatedProject;
      }
      return null;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update project");
      throw err;
    } finally {
      setIsSyncing(false);
    }
  };

  const removeTaskFromProject = async (taskId: string, projectId: string) => {
    try {
      setIsSyncing(true);
      const updatedProject = await projectService.removeTask(projectId, taskId);
      logger.debug("Updated project after removing task:", updatedProject);
      if (updatedProject) {
        setProjects((prev) =>
          prev.map((p) => (p.id === projectId ? updatedProject : p))
        );
        triggerSync();
        return updatedProject;
      }
      throw new Error("Failed to remove task from project");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove task");
      throw err;
    }
  };

  const deleteProject = async (projectId: string) => {
    try {
      setIsSyncing(true);

      await projectService.delete(projectId);

      setProjects((prev) => prev.filter((p) => p.id !== projectId));

      triggerSync();
    } catch (err) {
      logger.error("Error deleting project:", err);
      throw err;
    } finally {
      setIsSyncing(false);
    }
  };

  const value = {
    projects,
    loadProjects,
    updateProject,
    deleteProject,
    removeTaskFromProject,
    isSyncing,
    error,
  };

  return (
    <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error("useProject must be used within a ProjectProvider");
  }
  return context;
};
