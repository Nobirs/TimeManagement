import { Request, Response } from "express";
import prisma from "../services/prisma";
import { Habit, HabitCompletion } from "@time-management/shared-types";
import { logger } from "../utils/logger";
import { parseDate } from "../utils/parseDates";

export const getHabits = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (userId) {
      const habits = await prisma.habit.findMany({
        where: { userId },
        include: {
          completions: true,
        },
      });
      res.json({ data: habits });
    } else {
      res.json({ error: "Unauthorized" });
    }
  } catch (error) {
    logger.error("Error fetching habits:", error);
    res.status(500).json({ error: "Failed to fetch habits" });
  }
};

export const getHabit = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const habit = await prisma.habit.findUnique({
      where: { id },
      include: {
        completions: true,
      },
    });
    res.json({ data: habit });
  } catch (error) {
    logger.error("Error fetching habit:", error);
    res.status(500).json({ error: "Failed to fetch habit" });
  }
};

export const createHabit = async (req: Request, res: Response) => {
  try {
    const habit: Omit<Habit, "id" | "createdAt" | "updatedAt"> = req.body;
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const newHabit = await prisma.habit.create({
      data: {
        ...habit,
        userId,
      },
    });
    res.status(201).json({ data: newHabit });
  } catch (error) {
    logger.error("Error creating habit:", error);
    res.status(500).json({ error: "Failed to create habit" });
  }
};

export const updateHabit = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const habit: Omit<Habit, "id" | "createdAt" | "updatedAt"> = req.body;
    const userId = req.user?.userId;

    if (!userId || userId !== habit.userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const updatedHabit = await prisma.habit.update({
      where: { id },
      data: {
        ...habit,
      },
    });
    res.json({ data: updatedHabit });
  } catch (error) {
    logger.error("Error updating habit:", error);
    res.status(500).json({ error: "Failed to update habit" });
  }
};

export const deleteHabit = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const deletedHabit = await prisma.habit.delete({
      where: { id },
    });
    res.json({ data: deletedHabit });
  } catch (error) {
    logger.error("Error deleting habit:", error);
    res.status(500).json({ error: "Failed to delete habit" });
  }
};

export const syncHabits = async (req: Request, res: Response) => {
  try {
    const { data: habits } = req.body;
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    await prisma.$transaction(async (prisma) => {
      const existingHabits = await prisma.habit.findMany({
        where: { userId },
        select: { id: true },
      });

      const newHabitIds = habits.map((h: Habit) => h.id);
      await prisma.habit.deleteMany({
        where: {
          userId,
          NOT: { id: { in: newHabitIds } },
        },
      });

      for (const habit of habits) {
        await prisma.habit.upsert({
          where: { id: habit.id },
          update: {
            ...habit,
            updatedAt: new Date(),
          },
          create: {
            ...habit,
            createdAt: new Date(habit.createdAt || Date.now()),
            updatedAt: new Date(habit.updatedAt || Date.now()),
          },
        });
      }
    });

    res.json({ success: true });
  } catch (error) {
    logger.error("Error syncing habits:", error);
    res.status(500).json({ error: "Failed to sync habits" });
  }
};
