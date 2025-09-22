import { Request, Response } from "express";
import prisma from "../services/prisma";
import { Priority, Task, TaskStatus } from "@time-management/shared-types";
import { parseTaskStatus } from "../utils/parseEnums";
import { logger } from "../utils/logger";

export const getTasks = async (_req: Request, res: Response): Promise<void> => {
  try {
    const userId = _req.user?.userId;
    logger.info(`Fetching tasks for user ${userId}`);

    const tasks = await prisma.task.findMany({
      where: { userId },
    });
    logger.info(`Fetching tasks for user ${userId}`);
    res.json({ data: tasks });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
};

export const getTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const task = await prisma.task.findUnique({
      where: { id },
    });

    if (!task) {
      res.status(404).json({ error: "Task not found" });
    }

    res.json({ data: task });
  } catch (error) {
    console.error("Error fetching task:", error);
    res.status(500).json({ error: "Failed to fetch task" });
  }
};

export const createTask = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { title, description, status, priority, dueDate, projectId } =
      req.body;

    if (!title?.trim()) {
      res.status(400).json({ error: "Task title is required" });
      return;
    }

    const userId = req.user?.userId || "1";

    const newTask = await prisma.task.create({
      data: {
        title,
        description,
        status: status || TaskStatus.todo,
        priority: priority || Priority.Medium,
        dueDate: new Date(dueDate),
        user: { connect: { id: userId } },
        ...(projectId && { project: { connect: { id: projectId } } }),
      },
    });

    res.status(201).json({ data: newTask });
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).json({ error: "Failed to create task" });
  }
};

export const updateTask = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, description, status, priority, dueDate, projectId } =
      req.body;

    if (!title?.trim()) {
      res.status(400).json({ error: "Task title is required" });
      return;
    }

    const userId = req.user?.userId || "1";

    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        title,
        description,
        status: parseTaskStatus(status),
        priority: priority || undefined,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        user: { connect: { id: userId } },
        project: projectId
          ? { connect: { id: projectId } }
          : { disconnect: true },
      },
    });

    res.json({ data: updatedTask });
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).json({ error: "Failed to update task" });
  }
};

export const deleteTask = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const task = await prisma.task.findUnique({ where: { id } });

    if (!task) {
      res.status(404).json({ error: "Task not found" });
      return;
    }

    await prisma.task.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting task:", error);
    res.status(500).json({ error: "Failed to delete task" });
  }
};
