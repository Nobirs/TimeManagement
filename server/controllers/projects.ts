import { Request, Response } from "express";
import prisma from "../services/prisma";
import { Status, Priority, TaskStatus } from "@time-management/shared-types";

export const getProjects = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = _req.user?.userId || "1";
    const projects = await prisma.project.findMany({
      where: { userId },
      include: {
        tasks: true, // ← включает все задачи, связанные с проектом
      },
    });
    res.json({ data: projects });
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({ error: "Failed to fetch projects" });
  }
};

export const getProjectTasks = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const project = await prisma.project.findUnique({ where: { id } });

    if (!project) {
      res.status(404).json({ error: "Project not found" });
    }

    const tasks = await prisma.task.findMany({
      where: {
        projectId: project?.id,
      },
    });

    res.json({ data: tasks });
  } catch (error) {
    console.error("Error finding project tasks:", error);
    res.status(500).json({ error: "Failed to find project tasks" });
  }
};

export const getProject = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        tasks: true, // ← включает все задачи, связанные с проектом
      },
    });

    if (!project) {
      res.status(404).json({ error: "Project not found" });
    }

    res.json({ data: project });
  } catch (error) {
    console.error("Error fetching project:", error);
    res.status(500).json({ error: "Failed to fetch project" });
  }
};

export const createProject = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      title,
      description,
      status,
      priority,
      startDate,
      endDate,
      members,
      tags,
      color,
    } = req.body;
    const userId = req.user?.userId || "1";

    if (!title?.trim()) {
      res.status(400).json({ error: "Project title is required" });
      return;
    }

    const newProject = await prisma.project.create({
      data: {
        title,
        description,
        status: status || Status.NotStarted,
        priority: priority || Priority.Medium,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        members: members || [],
        tags: tags || [],
        color,
        userId,
      },
    });

    res.status(201).json({ data: newProject });
  } catch (error) {
    console.error("Error creating project:", error);
    res.status(500).json({ error: "Failed to create project" });
  }
};

export const updateProject = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      status,
      priority,
      startDate,
      endDate,
      members,
      tags,
      color,
    } = req.body;

    const userId = req.user?.userId || "1";

    if (!title?.trim()) {
      res.status(400).json({ error: "Project title is required" });
      return;
    }

    const updatedProject = await prisma.project.update({
      where: { id },
      data: {
        title,
        description,
        status: status || undefined,
        priority: priority || undefined,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        members: members || undefined,
        tags: tags || undefined,
        color: color || undefined,
        userId,
      },
      include: {
        tasks: true, // ← включает все задачи, связанные с проектом
      },
    });

    res.json({ data: updatedProject });
  } catch (error) {
    console.error("Error updating project:", error);
    res.status(500).json({ error: "Failed to update project" });
  }
};

export const deleteProject = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const project = await prisma.project.findUnique({ where: { id } });

    if (!project) {
      res.status(404).json({ error: "Project not found" });
      return;
    }

    await prisma.project.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting project:", error);
    res.status(500).json({ error: "Failed to delete project" });
  }
};

export const addTaskToProject = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { projectId } = req.params;
    const { title, description, status, priority, dueDate } = req.body;

    // Validate required fields
    if (!title?.trim()) {
      res.status(400).json({ error: "Task title is required" });
      return;
    }
    if (!dueDate || isNaN(new Date(dueDate).getTime())) {
      res.status(400).json({ error: "Invalid or missing due date" });
      return;
    }

    const userId = req.user?.userId || "1";
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId }, // Ensure project belongs to user
    });

    if (!project) {
      res.status(404).json({ error: "Project not found" });
      return;
    }

    // Validate status and priority enums
    const validStatus = Object.values(TaskStatus).includes(status)
      ? status
      : TaskStatus.todo;
    const validPriority = Object.values(Priority).includes(priority)
      ? priority
      : Priority.Medium;

    const newTask = await prisma.task.create({
      data: {
        title,
        description,
        status: validStatus,
        priority: validPriority,
        dueDate: new Date(dueDate),
        user: {
          connect: { id: userId }, // Required for TaskCreateInput
        },
        project: {
          connect: { id: projectId }, // Connect to project
        },
      },
    });

    res.status(201).json({ data: newTask });
  } catch (error) {
    console.error("Error adding task to project:", error);
    res.status(500).json({ error: "Failed to add task to project" });
  }
};

export const removeTaskFromProject = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { projectId, taskId } = req.params;

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { tasks: true },
    });

    if (!project) {
      res.status(404).json({ error: "Project not found" });
      return;
    }

    const taskExists = project.tasks.some((task) => task.id === taskId);
    if (!taskExists) {
      res.status(404).json({ error: "Task not found in project" });
      return;
    }

    await prisma.project.update({
      where: { id: projectId },
      data: {
        tasks: {
          disconnect: { id: taskId },
        },
      },
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Error removing task from project:", error);
    res.status(500).json({ error: "Failed to remove task from project" });
  }
};
