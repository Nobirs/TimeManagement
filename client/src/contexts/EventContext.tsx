import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { type Event } from "@time-management/shared-types";
import { eventService } from "../data/services/eventService";
import { useAuth } from "./AuthContext";
import { logger } from "../utils/logger";

interface EventContextType {
  events: Event[];
  addEvent: (
    event: Omit<Event, "id" | "createdAt" | "updatedAt">
  ) => Promise<void>;
  updateEvent: (id: string, event: Partial<Event>) => Promise<void>;
  deleteEvent: (eventId: string) => Promise<void>;
  loadEvents: () => Promise<void>;
  isSyncing: boolean;
  error: string | null;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

export const EventProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const { user } = useAuth();

  const loadEvents = useCallback(async () => {
    try {
      const loadedEvents = await eventService.getAll();
      setEvents(Array.isArray(loadedEvents) ? loadedEvents : []);
      logger.info("Loaded events", loadedEvents);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load events");
      logger.error("Failed to load events", err);
    }
  }, [user]);

  const addEvent = async (
    event: Omit<Event, "id" | "createdAt" | "updatedAt">
  ) => {
    try {
      setIsSyncing(true);
      logger.info("Adding event", event);
      logger.info("User", user);
      const newEvent = await eventService.create(event);
      setEvents((prev) => [...prev, newEvent]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add event");
    } finally {
      setIsSyncing(false);
    }
  };

  const updateEvent = async (id: string, event: Partial<Event>) => {
    try {
      setIsSyncing(true);
      const updatedEvent = await eventService.update(id, event);
      if (updatedEvent) {
        setEvents((prev) => prev.map((e) => (e.id === id ? updatedEvent : e)));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update event");
    } finally {
      setIsSyncing(false);
    }
  };

  const deleteEvent = async (eventId: string) => {
    try {
      setIsSyncing(true);
      await eventService.delete(eventId);
      setEvents((prev) => prev.filter((e) => e.id !== eventId));
    } catch (err) {
      console.error("Error deleting event:", err);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const value: EventContextType = {
    events,
    addEvent,
    updateEvent,
    deleteEvent,
    loadEvents,
    isSyncing,
    error,
  };

  return (
    <EventContext.Provider value={value}>{children}</EventContext.Provider>
  );
};

export const useEvent = () => {
  const context = useContext(EventContext);
  if (context === undefined) {
    throw new Error("useEvent must be used within an EventProvider");
  }
  return context;
};
