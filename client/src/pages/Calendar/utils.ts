import type { DropResult } from "@hello-pangea/dnd";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  parseISO,
  addMinutes,
  eachDayOfInterval,
} from "date-fns";
import { ru } from "date-fns/locale";
import type { Event } from "@time-management/shared-types";

export const generateCalendarDays = (currentDate: Date) => {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { locale: ru });
  const calendarEnd = endOfWeek(monthEnd, { locale: ru });
  return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
};

export const getEventsForDay = (date: Date, events: Event[]) => {
  const targetDate = format(date, "yyyy-MM-dd");
  return events
    .filter((event) => {
      const eventDate =
        event.date instanceof Date
          ? format(event.date, "yyyy-MM-dd")
          : event.date.split("T")[0];
      return eventDate === targetDate;
    })
    .sort((a, b) => (a.time ?? "").localeCompare(b.time ?? ""));
};

export const getEventTypeColor = (type: Event["type"]) => {
  switch (type) {
    case "meeting":
      return "bg-blue-100 text-blue-800";
    case "task":
      return "bg-green-100 text-green-800";
    case "reminder":
      return "bg-yellow-100 text-yellow-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export const handleDragEnd = (
  result: DropResult,
  events: Event[],
  updateEvent: (id: string, updates: Partial<Event>) => Promise<void>
) => {
  const { source, destination, draggableId } = result;

  if (!destination) return;
  if (
    source.droppableId === destination.droppableId &&
    source.index === destination.index
  )
    return;

  const eventToMove = events.find((event) => event.id === draggableId);
  if (!eventToMove) return;

  const sourceEvents = getEventsForDay(parseISO(source.droppableId), events);
  const destinationEvents =
    source.droppableId === destination.droppableId
      ? sourceEvents
      : getEventsForDay(parseISO(destination.droppableId), events);

  const newDestinationEvents = Array.from(destinationEvents);

  if (source.droppableId !== destination.droppableId) {
    const updatedEvent = {
      ...eventToMove,
      date: destination.droppableId,
      time: format(
        addMinutes(
          parseISO(`${destination.droppableId}T09:00:00`),
          destination.index * 30
        ),
        "HH:mm"
      ),
    };

    newDestinationEvents.splice(destination.index, 0, updatedEvent);

    newDestinationEvents.forEach((event, index) => {
      const newTime = format(
        addMinutes(parseISO(`${destination.droppableId}T09:00:00`), index * 30),
        "HH:mm"
      );
      if (event.id === draggableId) {
        updateEvent(event.id, {
          date: destination.droppableId,
          time: newTime,
        });
      } else {
        updateEvent(event.id, { time: newTime });
      }
    });
  } else {
    newDestinationEvents.splice(source.index, 1);
    newDestinationEvents.splice(destination.index, 0, eventToMove);

    newDestinationEvents.forEach((event, index) => {
      const newTime = format(
        addMinutes(parseISO(source.droppableId + "T09:00:00"), index * 30),
        "HH:mm"
      );
      updateEvent(event.id, { time: newTime });
    });
  }
};
