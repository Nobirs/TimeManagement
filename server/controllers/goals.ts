import { Request, Response } from "express";
import prisma from "../services/prisma";
import { Goal } from "@time-management/shared-types";
import { logger } from "../utils/logger";
import { parseDate } from "../utils/parseDates";

export const getGoals = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (userId) {
      const goals = await prisma.goal.findMany({
        where: { userId },
      });
      res.json({ data: goals });
    } else {
      res.json({ error: "Unauthorized" });
    }
  } catch (error) {
    logger.error("Error fetching goals:", error);
    res.status(500).json({ error: "Failed to fetch goals" });
  }
};

export const getGoal = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const goal = await prisma.goal.findUniqueOrThrow({
      where: { id },
    });
    res.json({ data: goal });
  } catch (error) {
    logger.error("Error fetching goal:", error);
    res.status(500).json({ error: JSON.stringify(error) });
  }
};

export const createGoal = async (req: Request, res: Response) => {
  try {
    const goal: Omit<Goal, "id" | "createdAt" | "updatedAt"> = req.body;
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const createdGoal = await prisma.goal.create({
      data: {
        ...goal,
        startDate: parseDate(goal.startDate),
        dueDate: parseDate(goal.dueDate),
        userId,
      },
    });
    res.status(201).json({ data: createdGoal });
  } catch (error) {
    logger.error("Error creating goal:", error);
    res
      .status(500)
      .json({ error: "Failed to create goal" + JSON.stringify(error) });
  }
};

export const updateGoal = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const goal: Omit<Goal, "id" | "createdAt" | "updatedAt"> = req.body;
    const userId = req.user?.userId;

    if (!userId || userId !== goal.userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const updatedGoal = await prisma.goal.update({
      where: { id },
      data: {
        ...goal,
        startDate: parseDate(goal.startDate),
        dueDate: parseDate(goal.dueDate),
      },
    });
    res.json({ data: updatedGoal });
  } catch (error) {
    logger.error("Error updating goal:", error);
    res
      .status(500)
      .json({ error: "Failed to update goal " + JSON.stringify(error) });
  }
};

export const deleteGoal = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const deletedGoal = await prisma.goal.delete({
      where: { id },
    });
    res.json({ data: deletedGoal });
  } catch (error) {
    logger.error("Error deleting goal:", error);
    res
      .status(500)
      .json({ error: "Failed to delete goal " + JSON.stringify(error) });
  }
};

export const syncGoals = async (req: Request, res: Response) => {
  try {
    const { data: goals } = req.body;
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    await prisma.$transaction(async (prisma) => {
      const existingGoals = await prisma.goal.findMany({
        where: { userId },
        select: { id: true },
      });

      const newGoalIds = goals.map((g: Goal) => g.id);
      await prisma.goal.deleteMany({
        where: {
          userId,
          NOT: { id: { in: newGoalIds } },
        },
      });

      for (const goal of goals) {
        await prisma.goal.upsert({
          where: { id: goal.id },
          update: {
            ...goal,
            startDate: new Date(goal.startDate),
            dueDate: new Date(goal.dueDate),
            updatedAt: new Date(),
          },
          create: {
            ...goal,
            startDate: new Date(goal.startDate),
            dueDate: new Date(goal.dueDate),
            createdAt: new Date(goal.createdAt || Date.now()),
            updatedAt: new Date(goal.updatedAt || Date.now()),
          },
        });
      }
    });

    res.json({ success: true });
  } catch (error) {
    logger.error("Error syncing goals:", error);
    res.status(500).json({ error: "Failed to sync goals" });
  }
};
