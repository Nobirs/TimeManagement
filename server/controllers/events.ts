import { Request, Response } from 'express';
import prisma from '../services/prisma';
import { Event } from '@time-management/shared-types';

export const getEvents = async (_req: Request, res: Response): Promise<void> => {
  try {
    const events = await prisma.event.findMany();
    res.json({ data: events });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
};

export const getEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const event = await prisma.event.findUnique({ where: {id}})
    
    if (!event) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }
    
    res.json({ data: event });
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ error: 'Failed to fetch event' });
  }
};

export const createEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const event: Omit<Event, 'id' | 'createdAt' | 'updatedAt'> = req.body;
    
    if (!event.title?.trim()) {
      res.status(400).json({ error: 'Event title is required' });
      return;
    }

    const newEvent = await prisma.event.create({
      data: {
        ...event,
        date: new Date(event.date),
        userId: '1'
      }
    })

    
    res.status(201).json({ data: newEvent });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
};

export const updateEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    let event: Omit<Event, 'id' | 'createdAt' | 'updatedAt'> = req.body;
    
    if (!event.title?.trim()) {
      res.status(400).json({ error: 'Event title is required' });
    }

    const updatedEvent = await prisma.event.update({
      where: { id },
      data: {
        ...event,
        date: new Date(event.date),
        userId: '1'
      }
    })

    
    res.json({ data: updatedEvent });
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ error: 'Failed to update event' });
  }
};

export const deleteEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const event = prisma.event.delete({ where: {id}})
    
    if (!event) {
      res.status(404).json({ error: 'Event not found' });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ error: 'Failed to delete event' });
  }
};

export const syncEvents = async (req: Request, res: Response): Promise<void> => {
  try {
    const { data: events } = req.body;
    const userId = '1'; // Замените на реальный ID пользователя

    await prisma.$transaction(async (prisma) => {
      // 1. Получаем текущие события пользователя
      const existingEvents = await prisma.event.findMany({
        where: { userId },
        select: { id: true }
      });

      // 2. Удаляем события, которых нет в новом списке
      const newEventIds = events.map((e: Event) => e.id);
      await prisma.event.deleteMany({
        where: {
          userId,
          NOT: { id: { in: newEventIds } }
        }
      });

      // 3. Обновляем или создаем события
      for (const event of events) {
        await prisma.event.upsert({
          where: { id: event.id },
          update: {
            ...event,
            date: new Date(event.date),
            updatedAt: new Date()
          },
          create: {
            ...event,
            date: new Date(event.date),
            userId,
            createdAt: new Date(event.createdAt || Date.now()),
            updatedAt: new Date(event.updatedAt || Date.now())
          }
        });
      }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error syncing events:', error);
    res.status(500).json({ error: 'Failed to sync events' });
  }
};