import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
  useCallback,
} from "react";
import type { Project, Task } from "@time-management/shared-types";
import { projectService } from "../data/services/projectService";
import { taskService } from "../data/services/taskService";

interface ProjectContextType {
  projects: Project[];
  loadProjects: () => Promise<void>;
  updateProject: (project: Project) => Promise<Project | null>;
  deleteProject: (projectId: string) => Promise<void>;
  assignTaskToProject: (taskId: string, projectId: string | undefined) => void;
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

  const loadProjects = useCallback(async () => {
    try {
      const loadedProjects = await projectService.getAll();
      setProjects(Array.isArray(loadedProjects) ? loadedProjects : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load Projects");
    }
  }, []);

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

  const deleteProject = async (projectId: string) => {
    try {
      setIsSyncing(true);

      // Снимаем привязку у задач (можно улучшить, если задачи хранятся в TaskContext)
      const tasks = await taskService.getAll();
      tasks.forEach(async (t) => {
        if (t.projectId === projectId) {
          await taskService.update(t.id, { ...t, projectId: undefined });
        }
      });

      await projectService.delete(projectId);
      setProjects((prev) => prev.filter((p) => p.id !== projectId));
      triggerSync();
    } catch (err) {
      console.error("Error deleting project:", err);
    } finally {
      setIsSyncing(false);
    }
  };

  const assignTaskToProject = (
    taskId: string,
    projectId: string | undefined
  ) => {
    // Заглушка для логики привязки задач (если нужно напрямую управлять из этого контекста)
  };

  const value = {
    projects,
    loadProjects,
    updateProject,
    deleteProject,
    assignTaskToProject,
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
