import type { Project, Task } from "@time-management/shared-types";
import { apiClient } from "../api/client";
import { storageService } from "./storageService";
import { logger } from "../../utils/logger";

class ProjectService {
  private readonly STORAGE_KEY = "projects";

  async getAll(): Promise<Project[]> {
    try {
      const response = await apiClient.get<Project[]>("/projects");
      if (response.data) {
        storageService.set(this.STORAGE_KEY, response.data);
        return response.data;
      }
    } catch (error) {
      logger.debug("Error fetching projects:", error);
    } finally {
      return storageService.get<Project[]>(this.STORAGE_KEY) || [];
    }
  }

  async getById(id: string): Promise<Project | null> {
    try {
      const response = await apiClient.get<Project>(`/projects/${id}`);
      if (response.data) {
        return response.data;
      }
      throw new Error("Project not found");
    } catch (error) {
      logger.debug("Error fetching project:", error);
      return null;
    }
  }

  async create(
    project: Omit<Project, "id" | "createdAt" | "updatedAt">
  ): Promise<Project> {
    const response = await apiClient.post<Project>("/projects", project);
    if (response.data) {
      const projects: Project[] =
        storageService.get<Project[]>(this.STORAGE_KEY) || [];
      storageService.set(this.STORAGE_KEY, [...projects, response.data]);
      return response.data;
    } else {
      throw new Error("Failed to create project");
    }
  }

  async update(project: Project): Promise<Project> {
    const response = await apiClient.put<Project>(
      `/projects/${project.id}`,
      project
    );
    if (response.data) {
      const projects = storageService.get<Project[]>(this.STORAGE_KEY) || [];
      const updatedProjects = projects.map((p) =>
        p.id === project.id ? response.data : p
      );
      storageService.set(this.STORAGE_KEY, updatedProjects);
      return response.data;
    } else {
      throw new Error("Failed to update project");
    }
  }

  async delete(id: string): Promise<Object> {
    const response = await apiClient.delete<Object>(`/projects/${id}`);
    logger.info("delete project RESPONSE: ", response);
    if (response.status === 200) {
      return response;
    }
    throw new Error("Failed to delete project");
  }

  async addTask(projectId: string, task: Task): Promise<Project> {
    const projects = await projectService.getAll();
    const project = projects.find((p) => p.id === projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    const updatedProject = {
      ...project,
      tasks: [...(project.tasks || []), task],
      updatedAt: new Date().toISOString(),
    };

    return projectService.update(updatedProject);
  }

  async removeTask(projectId: string, taskId: string): Promise<Project> {
    try {
      const response = await apiClient.delete<Project>(
        `/projects/${projectId}/tasks/${taskId}`
      );
      if (response.status === 200) {
        const projects = storageService.get<Project[]>(this.STORAGE_KEY) || [];
        const updatedProject = projects.find((p) => p.id === projectId);
        if (updatedProject) {
          updatedProject.tasks = updatedProject.tasks?.filter(
            (t) => t.id !== taskId
          );
        } else {
          throw new Error("Project not found");
        }
        const updatedProjects = projects.map((p) =>
          p.id === projectId ? updatedProject : p
        );
        storageService.set(this.STORAGE_KEY, updatedProjects);
        return updatedProject;
      }
      throw new Error("Failed to remove task from project");
    } catch (error) {
      logger.debug("Error removing task from project:", error);
      throw error;
    }
  }

  async updateProgress(projectId: string, progress: number): Promise<Project> {
    const projects = await projectService.getAll();
    const project = projects.find((p) => p.id === projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    const updatedProject = {
      ...project,
      progress: Math.max(0, Math.min(100, progress)),
      updatedAt: new Date().toISOString(),
    };

    return projectService.update(updatedProject);
  }
}

export const projectService = new ProjectService();
