import React from "react";
import { format, isSameMonth, isToday } from "date-fns";
import { PlusIcon } from "@heroicons/react/24/outline";
import { Droppable } from "@hello-pangea/dnd";
import CalendarEvent from "./CalendarEvent";
import type { CalendarDayProps } from "./types";

const CalendarDay: React.FC<CalendarDayProps> = ({
  day,
  currentMonth,
  events,
  onAddEvent,
  onEditEvent,
  onDeleteEvent,
}) => {
  const dateStr = format(day, "yyyy-MM-dd");
  const isCurrentMonth = isSameMonth(day, currentMonth);

  return (
    <Droppable droppableId={dateStr}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          className={`h-full bg-white p-0.5 relative group ${
            !isCurrentMonth ? "bg-gray-50 text-gray-400" : ""
          } ${isToday(day) ? "bg-blue-50" : ""} ${
            snapshot.isDraggingOver ? "bg-primary-50" : ""
          }`}
        >
          <div className="flex justify-between items-center">
            <div className="font-semibold text-xs select-none">
              {format(day, "d")}
            </div>
            {isCurrentMonth && (
              <button
                onClick={() => onAddEvent(day)}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-gray-100 rounded-full"
              >
                <PlusIcon className="w-2.5 h-2.5 text-gray-600" />
              </button>
            )}
          </div>
          <div className="mt-0.5 space-y-0.5 overflow-y-auto h-[calc(100%-1.25rem)]">
            {events.map((event, index) => (
              <CalendarEvent
                key={event.id}
                event={event}
                index={index}
                onEdit={onEditEvent}
                onDelete={onDeleteEvent}
              />
            ))}
            {provided.placeholder}
          </div>
        </div>
      )}
    </Droppable>
  );
};

export default CalendarDay;
