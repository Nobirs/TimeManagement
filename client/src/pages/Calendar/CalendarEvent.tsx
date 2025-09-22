import React from "react";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { Draggable } from "@hello-pangea/dnd";
import { getEventTypeColor } from "./utils";
import type { CalendarEventProps } from "./types";

const CalendarEvent: React.FC<CalendarEventProps> = ({
  index,
  event,
  onEdit,
  onDelete,
}) => {
  return (
    <Draggable key={event.id} draggableId={event.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={{
            ...provided.draggableProps.style,
            cursor: snapshot.isDragging ? "grabbing" : "grab",
          }}
          className={`
            group relative px-0.5 py-0.5 text-xs rounded-full select-none
            ${snapshot.isDragging ? "opacity-75 shadow-lg" : ""}
            ${getEventTypeColor(event.type)}
            transition-all duration-200
          `}
        >
          <div className="flex items-center justify-between">
            <span className="select-none truncate">
              {event.time} - {event.title}
            </span>
            <div className="hidden group-hover:flex items-center space-x-0.5">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(event);
                }}
                className="p-0.5 hover:bg-white rounded-full select-none"
              >
                <PencilIcon className="w-2 h-2" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(event.id);
                }}
                className="p-0.5 hover:bg-white rounded-full select-none"
              >
                <TrashIcon className="w-2 h-2" />
              </button>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default CalendarEvent;
