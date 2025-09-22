import { Request, Response } from "express";
import prisma from "../services/prisma";
import { Note } from "@time-management/shared-types";
import { NoteCategory } from "@prisma/client";
import { logger } from "../utils/logger";

export const getNotes = async (_req: Request, res: Response): Promise<void> => {
  try {
    const userId = _req.user?.userId;
    const notes = await prisma.note.findMany({
      where: { userId },
    });
    res.json({ data: notes });
  } catch (error) {
    console.error("Error fetching notes:", error);
    res.status(500).json({ error: "Failed to fetch notes" });
  }
};

export const getNote = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const note = await prisma.note.findUnique({ where: { id } });

    if (!note) {
      res.status(404).json({ error: "Note not found" });
      return;
    }

    res.json({ data: note });
  } catch (error) {
    console.error("Error fetching note:", error);
    res.status(500).json({ error: "Failed to fetch note" });
  }
};

export const createNote = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const note: Omit<Note, "id" | "createdAt" | "updatedAt"> = req.body;
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    if (!note.title?.trim()) {
      res.status(400).json({ error: "Note title is required" });
    }

    const newNote = await prisma.note.create({
      data: {
        ...note,
        userId: userId,
      },
    });

    res.status(201).json({ data: newNote });
  } catch (error) {
    console.error("Error creating note:", error);
    res.status(500).json({ error: "Failed to create note" });
  }
};

export const updateNote = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    let note: Omit<Note, "id" | "createdAt" | "updatedAt"> = req.body;
    const userId = req.user?.userId || "1";

    if (!note.title?.trim()) {
      res.status(400).json({ error: "Note title is required" });
    }

    const updatedNote = await prisma.note.update({
      where: { id },
      data: {
        ...note,
        userId,
      },
    });

    res.json({ data: updatedNote });
  } catch (error) {
    logger.error("Error updating note:", error);
    res.status(500).json({ error: "Failed to update note" });
  }
};

export const deleteNote = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const note = prisma.note.delete({ where: { id } });

    if (!note) {
      res.status(404).json({ error: "Note not found" });
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting note:", error);
    res.status(500).json({ error: "Failed to delete note" });
  }
};

export const getNotesByCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { category } = req.params;
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const filteredNotes = await prisma.note.findMany({
      where: {
        userId: userId,
        category: NoteCategory[category as keyof typeof NoteCategory],
      },
    });

    res.json({ data: filteredNotes });
  } catch (error) {
    console.error("Error fetching notes by category:", error);
    res.status(500).json({ error: "Failed to fetch notes by category" });
  }
};

export const getNotesByTag = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { tag } = req.params;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const filteredNotes = await prisma.note.findMany({
      where: { userId: userId, tags: { has: tag } },
    });

    res.json({ data: filteredNotes });
  } catch (error) {
    console.error("Error fetching notes by tag:", error);
    res.status(500).json({ error: "Failed to fetch notes by tag" });
  }
};

export const getPinnedNotes = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = _req.user?.userId || "1";
    const pinnedNotes = await prisma.note.findMany({
      where: { userId, isPinned: true },
    });

    res.json({ data: pinnedNotes });
  } catch (error) {
    console.error("Error fetching pinned notes:", error);
    res.status(500).json({ error: "Failed to fetch pinned notes" });
  }
};

export const syncNotes = async (req: Request, res: Response): Promise<void> => {
  try {
    const { data: notes } = req.body;
    const userId = req.user?.userId;

    await prisma.$transaction(async (prisma) => {
      const existingNotes = await prisma.note.findMany({
        where: { userId },
        select: { id: true },
      });

      const newNoteIds = notes.map((n: Note) => n.id);
      await prisma.note.deleteMany({
        where: {
          userId,
          NOT: { id: { in: newNoteIds } },
        },
      });

      for (const note of notes) {
        await prisma.note.upsert({
          where: { id: note.id },
          update: {
            ...note,
            updatedAt: new Date(),
          },
          create: {
            ...note,
            createdAt: new Date(note.createdAt || Date.now()),
            updatedAt: new Date(note.updatedAt || Date.now()),
          },
        });
      }
    });

    res.json({ success: true });
  } catch (error) {
    logger.error("Error syncing notes:", error);
    res.status(500).json({ error: "Failed to sync notes" });
  }
};
