import React from "react";
import CalendarDay from "./CalendarDay";
import type { Event } from "@time-management/shared-types";
import { getEventsForDay } from "./utils";

const weekDays = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

interface CalendarGridProps {
  calendarDays: Date[];
  currentDate: Date;
  events: Event[];
  onAddEvent: (date: Date) => void;
  onEditEvent: (event: Event) => void;
  onDeleteEvent: (eventId: string) => void;
}

const CalendarGrid: React.FC<CalendarGridProps> = ({
  calendarDays,
  currentDate,
  events,
  onAddEvent,
  onEditEvent,
  onDeleteEvent,
}) => {
  return (
    <div className="h-[calc(100%-3.5rem)] grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden">
      {weekDays.map((day) => (
        <div
          key={day}
          className="bg-white p-0.5 text-center text-xs font-medium text-gray-500"
        >
          {day}
        </div>
      ))}
      {calendarDays.map((day) => {
        const dayEvents = getEventsForDay(day, events);
        return (
          <CalendarDay
            key={day.toString()}
            day={day}
            currentMonth={currentDate}
            events={dayEvents}
            onAddEvent={onAddEvent}
            onEditEvent={onEditEvent}
            onDeleteEvent={onDeleteEvent}
          />
        );
      })}
    </div>
  );
};

export default CalendarGrid;
