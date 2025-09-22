import { Request, Response } from "express";
import prisma from "../services/prisma";
import { TimeTracking } from "@time-management/shared-types";
import { logger } from "../utils/logger";

export const getTimeTrackings = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const timeTrackings = await prisma.timeTracking.findMany({
      where: { userId },
    });
    res.json({ data: timeTrackings });
  } catch (error) {
    logger.error("Error fetching time trackings:", error);
    res.status(500).json({ error: "Failed to fetch time trackings" });
  }
};

export const getTimeTracking = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const timeTracking = await prisma.timeTracking.findUnique({
      where: { id },
    });
    if (!timeTracking) {
      res.status(404).json({ error: "Time tracking not found" });
      return;
    }
    res.json({ data: timeTracking });
  } catch (error) {
    logger.error("Error fetching time tracking:", error);
    res.status(500).json({ error: "Failed to fetch time tracking" });
  }
};

export const createTimeTracking = async (req: Request, res: Response) => {
  try {
    const timeTracking: Omit<TimeTracking, "id" | "createdAt" | "updatedAt"> =
      req.body;
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    if (!timeTracking.taskName?.trim()) {
      res.status(400).json({ error: "TimeTracknig title is required" });
      return;
    }
    const newTimeTracking = await prisma.timeTracking.create({
      data: {
        ...timeTracking,
        userId,
      },
    });
    res.status(201).json({ data: newTimeTracking });
  } catch (error) {
    logger.error("Error creating time tracking:", error);
    res.status(500).json({ error: "Failed to create time tracking" });
  }
};

export const updateTimeTracking = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    let timeTracking: Omit<TimeTracking, "id" | "createdAt" | "updatedAt"> =
      req.body;
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const updatedTimeTracking = await prisma.note.update({
      where: { id },
      data: {
        ...timeTracking,
      },
    });

    res.json({ data: updatedTimeTracking });
  } catch (error) {
    logger.error("Error updating time tracking:", error);
    res.status(500).json({ error: "Failed to update time tracking" });
  }
};

export const deleteTimeTracking = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.timeTracking.delete({ where: { id } });

    res.json({ success: true });
  } catch (error) {
    logger.error("Error deleting time tracking:", error);
    res.status(500).json({ error: "Failed to delete time tracking" });
  }
};

export const syncTimeTracking = async (req: Request, res: Response) => {
  try {
    const { data: timeTrackings } = req.body;
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    await prisma.$transaction(async (prisma) => {
      const existingTimeTrackings = await prisma.timeTracking.findMany({
        where: { userId },
        select: { id: true },
      });

      const newTimeTrackingIds = timeTrackings.map((t: TimeTracking) => t.id);
      await prisma.timeTracking.deleteMany({
        where: {
          userId,
          NOT: { id: { in: newTimeTrackingIds } },
        },
      });

      for (const timeTracking of timeTrackings) {
        await prisma.timeTracking.upsert({
          where: { id: timeTracking.id },
          update: {
            ...timeTracking,
          },
          create: {
            ...timeTracking,
            createdAt: new Date(timeTracking.createdAt || Date.now()),
          },
        });
      }
    });

    res.json({ success: true });
  } catch (error) {
    logger.error("Error syncing time tracking:", error);
    res.status(500).json({ error: "Failed to sync time tracking" });
  }
};
