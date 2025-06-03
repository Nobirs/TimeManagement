import { Note } from '../models/types';
import { apiClient } from '../api/client';
import { storageService } from './storageService';

class NoteService {
  private readonly STORAGE_KEY = 'notes';

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private async syncWithServer(notes: Note[]): Promise<void> {
    try {
      await apiClient.post('/sync/notes', { data: notes });
    } catch (error) {
      console.error('Failed to sync notes with server:', error);
    }
  }

  async getAll(): Promise<Note[]> {
    try {
      const response = await apiClient.get<Note[]>('/notes');
      if (response.data) {
        storageService.set(this.STORAGE_KEY, response.data);
        return response.data;
      }
      return storageService.get<Note[]>(this.STORAGE_KEY) || [];
    } catch (error) {
      console.error('Error fetching notes:', error);
      return storageService.get<Note[]>(this.STORAGE_KEY) || [];
    }
  }

  async getById(id: string): Promise<Note | null> {
    try {
      const response = await apiClient.get<Note>(`/notes/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching note:', error);
      const notes = await this.getAll();
      return notes.find(note => note.id === id) || null;
    }
  }

  async create(note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Promise<Note> {
    const newNote: Note = {
      ...note,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      const response = await apiClient.post<Note>('/notes', newNote);
      if (response.data) {
        const notes = await this.getAll();
        const updatedNotes = [...notes, response.data];
        storageService.set(this.STORAGE_KEY, updatedNotes);
        await this.syncWithServer(updatedNotes);
        return response.data;
      }
      throw new Error('Failed to create note');
    } catch (error) {
      console.error('Error creating note:', error);
      const notes = await this.getAll();
      const updatedNotes = [...notes, newNote];
      storageService.set(this.STORAGE_KEY, updatedNotes);
      await this.syncWithServer(updatedNotes);
      return newNote;
    }
  }

  async update(note: Note): Promise<Note> {
    const updatedNote = {
      ...note,
      updatedAt: new Date().toISOString(),
    };

    try {
      const response = await apiClient.put<Note>(`/notes/${note.id}`, updatedNote);
      if (response.data) {
        const notes = await this.getAll();
        const updatedNotes = notes.map(n => (n.id === updatedNote.id ? response.data as Note : n));
        storageService.set(this.STORAGE_KEY, updatedNotes);
        await this.syncWithServer(updatedNotes);
        return response.data;
      }
      throw new Error('Failed to update note');
    } catch (error) {
      console.error('Error updating note:', error);
      const notes = await this.getAll();
      const updatedNotes = notes.map(n => (n.id === updatedNote.id ? updatedNote : n));
      storageService.set(this.STORAGE_KEY, updatedNotes);
      await this.syncWithServer(updatedNotes);
      return updatedNote;
    }
  }

  async delete(noteId: string): Promise<void> {
    try {
      const response = await apiClient.delete(`/notes/${noteId}`);
      if (response.status === 200) {
        const notes = await this.getAll();
        const updatedNotes = notes.filter(n => n.id !== noteId);
        storageService.set(this.STORAGE_KEY, updatedNotes);
        await this.syncWithServer(updatedNotes);
      } else {
        throw new Error('Failed to delete note');
      }
    } catch (error) {
      console.error('Error deleting note:', error);
      const notes = await this.getAll();
      const updatedNotes = notes.filter(n => n.id !== noteId);
      storageService.set(this.STORAGE_KEY, updatedNotes);
      await this.syncWithServer(updatedNotes);
    }
  }

  async getByCategory(category: string): Promise<Note[]> {
    const notes = await this.getAll();
    return notes.filter(note => note.category === category);
  }

  async getByTag(tag: string): Promise<Note[]> {
    const notes = await this.getAll();
    return notes.filter(note => note.tags.includes(tag));
  }

  async getPinned(): Promise<Note[]> {
    const notes = await this.getAll();
    return notes.filter(note => note.isPinned);
  }
}

export const noteService = new NoteService(); 