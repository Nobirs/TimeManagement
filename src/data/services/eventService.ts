import { Event } from '../models/types';
import { apiClient } from '../api/client';
import { storageService } from './storageService';

class EventService {
  private readonly STORAGE_KEY = 'events';

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private async syncWithServer(events: Event[]): Promise<void> {
    try {
      await apiClient.post('/sync/events', { data: events });
    } catch (error) {
      console.error('Failed to sync events with server:', error);
    }
  }

  async getAll(): Promise<Event[]> {
    try {
      const response = await apiClient.get<Event[]>('/events');
      if (response.data) {
        storageService.set(this.STORAGE_KEY, response.data);
        return response.data;
      }
      return storageService.get<Event[]>(this.STORAGE_KEY) || [];
    } catch (error) {
      console.error('Error fetching events:', error);
      return storageService.get<Event[]>(this.STORAGE_KEY) || [];
    }
  }

  async create(event: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>): Promise<Event> {
    const newEvent: Event = {
      ...event,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      const response = await apiClient.post<Event>('/events', newEvent);
      if (response.data) {
        const events = await this.getAll();
        const updatedEvents = [...events, response.data];
        storageService.set(this.STORAGE_KEY, updatedEvents);
        await this.syncWithServer(updatedEvents);
        return response.data;
      }
      throw new Error('Failed to create event');
    } catch (error) {
      console.error('Error creating event:', error);
      const events = await this.getAll();
      const updatedEvents = [...events, newEvent];
      storageService.set(this.STORAGE_KEY, updatedEvents);
      await this.syncWithServer(updatedEvents);
      return newEvent;
    }
  }

  async update(id: string, event: Partial<Event>): Promise<Event> {
    const events = await this.getAll();
    const existingEvent = events.find(e => e.id === id);
    if (!existingEvent) {
      throw new Error('Event not found');
    }

    const updatedEvent = {
      ...existingEvent,
      ...event,
      updatedAt: new Date().toISOString()
    };

    try {
      const response = await apiClient.put<Event>(`/events/${id}`, updatedEvent);
      if (response.data) {
        const updatedEvents = events.map(e => e.id === id ? response.data as Event : e);
        storageService.set(this.STORAGE_KEY, updatedEvents);
        await this.syncWithServer(updatedEvents);
        return response.data;
      }
      throw new Error('Failed to update event');
    } catch (error) {
      console.error('Error updating event:', error);
      const updatedEvents = events.map(e => e.id === id ? updatedEvent : e);
      storageService.set(this.STORAGE_KEY, updatedEvents);
      await this.syncWithServer(updatedEvents);
      return updatedEvent;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const response = await apiClient.delete(`/events/${id}`);
      if (response.status === 200) {
        const events = await this.getAll();
        const updatedEvents = events.filter(e => e.id !== id);
        storageService.set(this.STORAGE_KEY, updatedEvents);
        await this.syncWithServer(updatedEvents);
      } else {
        throw new Error('Failed to delete event');
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      const events = await this.getAll();
      const updatedEvents = events.filter(e => e.id !== id);
      storageService.set(this.STORAGE_KEY, updatedEvents);
      await this.syncWithServer(updatedEvents);
    }
  }
}

export const eventService = new EventService(); 