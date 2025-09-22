import { Request, Response } from "express";
import prisma from "../services/prisma";
import { Event } from "@time-management/shared-types";
import { logger } from "../utils/logger";
import { Prisma } from "@prisma/client";

export const getEvents = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    logger.info(`Fetching events for user ${userId}`);
    const events = await prisma.event.findMany({
      where: { userId },
    });
    res.json({ data: events });
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ error: "Failed to fetch events" });
  }
};

export const getEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const event = await prisma.event.findUnique({ where: { id } });

    if (!event) {
      res.status(404).json({ error: "Event not found" });
      return;
    }

    res.json({ data: event });
  } catch (error) {
    console.error("Error fetching event:", error);
    res.status(500).json({ error: "Failed to fetch event" });
  }
};

export const createEvent = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const event: Omit<Event, "id" | "createdAt" | "updatedAt"> = req.body;
    const userId = req.user?.userId || "1";

    if (!event.title?.trim()) {
      res.status(400).json({ error: "Event title is required" });
      return;
    }

    const newEvent = await prisma.event.create({
      data: {
        ...event,
        date: new Date(event.date),
        userId: userId,
      },
    });

    res.status(201).json({ data: newEvent });
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).json({ error: "Failed to create event" });
  }
};

export const updateEvent = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    let event: Omit<Event, "id" | "createdAt" | "updatedAt"> = req.body;
    const userId = req.user?.userId || "1";

    if (!event.title?.trim()) {
      res.status(400).json({ error: "Event title is required" });
    }

    const updatedEvent = await prisma.event.update({
      where: { id },
      data: {
        ...event,
        date: new Date(event.date),
        userId: userId,
      },
    });

    res.json({ data: updatedEvent });
  } catch (error) {
    console.error("Error updating event:", error);
    res.status(500).json({ error: "Failed to update event" });
  }
};

export const deleteEvent = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.event.delete({ where: { id } });

    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting event:", error);

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      res.status(404).json({ error: "Event not found" });
    } else {
      res.status(500).json({ error: "Failed to delete event" });
    }
  }
};

export const syncEvents = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { data: events } = req.body;
    const userId = req.user?.userId;

    await prisma.$transaction(async (prisma) => {
      const existingEvents = await prisma.event.findMany({
        where: { userId },
        select: { id: true },
      });

      const newEventIds = events.map((e: Event) => e.id);
      await prisma.event.deleteMany({
        where: {
          userId,
          NOT: { id: { in: newEventIds } },
        },
      });

      for (const event of events) {
        await prisma.event.upsert({
          where: { id: event.id },
          update: {
            ...event,
            date: new Date(event.date),
            updatedAt: new Date(),
          },
          create: {
            ...event,
            date: new Date(event.date),
            createdAt: new Date(event.createdAt || Date.now()),
            updatedAt: new Date(event.updatedAt || Date.now()),
          },
        });
      }
    });

    res.json({ success: true });
  } catch (error) {
    logger.error("Error syncing events:", error);
    res.status(500).json({ error: "Failed to sync events" });
  }
};
