import { Request, Response } from 'express';
import { getData, setData } from '../services/redis';
import { Note } from '../types';

export const getNotes = async (_req: Request, res: Response) => {
  try {
    const notes = await getData('notes') || [];
    return res.json({ data: notes });
  } catch (error) {
    console.error('Error fetching notes:', error);
    return res.status(500).json({ error: 'Failed to fetch notes' });
  }
};

export const getNote = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const notes = await getData('notes') || [];
    const note = notes.find((n: Note) => n.id === id);
    
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }
    
    return res.json({ data: note });
  } catch (error) {
    console.error('Error fetching note:', error);
    return res.status(500).json({ error: 'Failed to fetch note' });
  }
};

export const createNote = async (req: Request, res: Response) => {
  try {
    const note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'> = req.body;
    
    if (!note.title?.trim()) {
      return res.status(400).json({ error: 'Note title is required' });
    }

    const newNote: Note = {
      ...note,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPinned: note.isPinned || false,
      tags: note.tags || []
    };

    const notes = await getData('notes') || [];
    notes.push(newNote);
    await setData('notes', notes);
    
    return res.status(201).json({ data: newNote });
  } catch (error) {
    console.error('Error creating note:', error);
    return res.status(500).json({ error: 'Failed to create note' });
  }
};

export const updateNote = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updatedNote: Note = req.body;
    
    if (!updatedNote.title?.trim()) {
      return res.status(400).json({ error: 'Note title is required' });
    }

    const notes = await getData('notes') || [];
    const index = notes.findIndex((n: Note) => n.id === id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Note not found' });
    }
    
    const noteToUpdate = {
      ...updatedNote,
      id,
      updatedAt: new Date().toISOString(),
      createdAt: notes[index].createdAt // preserve original creation date
    };
    
    notes[index] = noteToUpdate;
    await setData('notes', notes);
    
    return res.json({ data: noteToUpdate });
  } catch (error) {
    console.error('Error updating note:', error);
    return res.status(500).json({ error: 'Failed to update note' });
  }
};

export const deleteNote = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const notes = await getData('notes') || [];
    const filteredNotes = notes.filter((n: Note) => n.id !== id);
    
    if (notes.length === filteredNotes.length) {
      return res.status(404).json({ error: 'Note not found' });
    }
    
    await setData('notes', filteredNotes);
    return res.json({ success: true });
  } catch (error) {
    console.error('Error deleting note:', error);
    return res.status(500).json({ error: 'Failed to delete note' });
  }
};

export const getNotesByCategory = async (req: Request, res: Response) => {
  try {
    const { category } = req.params;
    const notes = await getData('notes') || [];
    const filteredNotes = notes.filter((n: Note) => n.category === category);
    
    return res.json({ data: filteredNotes });
  } catch (error) {
    console.error('Error fetching notes by category:', error);
    return res.status(500).json({ error: 'Failed to fetch notes by category' });
  }
};

export const getNotesByTag = async (req: Request, res: Response) => {
  try {
    const { tag } = req.params;
    const notes = await getData('notes') || [];
    const filteredNotes = notes.filter((n: Note) => n.tags.includes(tag));
    
    return res.json({ data: filteredNotes });
  } catch (error) {
    console.error('Error fetching notes by tag:', error);
    return res.status(500).json({ error: 'Failed to fetch notes by tag' });
  }
};

export const getPinnedNotes = async (_req: Request, res: Response) => {
  try {
    const notes = await getData('notes') || [];
    const pinnedNotes = notes.filter((n: Note) => n.isPinned);
    
    return res.json({ data: pinnedNotes });
  } catch (error) {
    console.error('Error fetching pinned notes:', error);
    return res.status(500).json({ error: 'Failed to fetch pinned notes' });
  }
};

export const syncNotes = async (req: Request, res: Response) => {
  try {
    const { data: notes } = req.body;
    await setData('notes', notes);
    return res.json({ success: true });
  } catch (error) {
    console.error('Error syncing notes:', error);
    return res.status(500).json({ error: 'Failed to sync notes' });
  }
};