import { Request, Response } from 'express';
import { getData, setData } from '../services/redis';
import { Event } from '../types';

export const getEvents = async (_req: Request, res: Response) => {
  try {
    const events = await getData('events') || [];
    return res.json({ data: events });
  } catch (error) {
    console.error('Error fetching events:', error);
    return res.status(500).json({ error: 'Failed to fetch events' });
  }
};

export const getEvent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const events = await getData('events') || [];
    const event = events.find((e: Event) => e.id === id);
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    return res.json({ data: event });
  } catch (error) {
    console.error('Error fetching event:', error);
    return res.status(500).json({ error: 'Failed to fetch event' });
  }
};

export const createEvent = async (req: Request, res: Response) => {
  try {
    const event: Event = req.body;
    
    if (!event.title?.trim()) {
      return res.status(400).json({ error: 'Event title is required' });
    }

    const newEvent: Event = {
      ...event,
      id: event.id || crypto.randomUUID(),
      createdAt: event.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const events = await getData('events') || [];
    events.push(newEvent);
    await setData('events', events);
    
    return res.status(201).json({ data: newEvent });
  } catch (error) {
    console.error('Error creating event:', error);
    return res.status(500).json({ error: 'Failed to create event' });
  }
};

export const updateEvent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updatedEvent: Event = req.body;
    
    if (!updatedEvent.title?.trim()) {
      return res.status(400).json({ error: 'Event title is required' });
    }

    const events = await getData('events') || [];
    const index = events.findIndex((e: Event) => e.id === id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    const updatedEventWithDates = {
      ...updatedEvent,
      updatedAt: new Date().toISOString(),
      createdAt: events[index].createdAt // preserve original creation date
    };
    
    events[index] = updatedEventWithDates;
    await setData('events', events);
    
    return res.json({ data: updatedEventWithDates });
  } catch (error) {
    console.error('Error updating event:', error);
    return res.status(500).json({ error: 'Failed to update event' });
  }
};

export const deleteEvent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const events = await getData('events') || [];
    const filteredEvents = events.filter((e: Event) => e.id !== id);
    
    if (events.length === filteredEvents.length) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    await setData('events', filteredEvents);
    return res.json({ success: true });
  } catch (error) {
    console.error('Error deleting event:', error);
    return res.status(500).json({ error: 'Failed to delete event' });
  }
};

export const syncEvents = async (req: Request, res: Response) => {
  try {
    const { data: events } = req.body;
    await setData('events', events);
    return res.json({ success: true });
  } catch (error) {
    console.error('Error syncing events:', error);
    return res.status(500).json({ error: 'Failed to sync events' });
  }
};