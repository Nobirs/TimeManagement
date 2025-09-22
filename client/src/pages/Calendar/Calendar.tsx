import React, { useState, useMemo } from "react";
import { DragDropContext } from "@hello-pangea/dnd";
import { useAuth } from "../../contexts/AuthContext";
import { useEvent } from "../../contexts/EventContext";
import { useLoading } from "../../contexts/LoadingContext";
import CalendarHeader from "./CalendarHeader";
import CalendarGrid from "./CalendarGrid";
import EventModal from "./EventModal";
import { generateCalendarDays, handleDragEnd } from "./utils";
import type { Event } from "@time-management/shared-types";
import { addMonths, format, subMonths } from "date-fns";

const Calendar: React.FC = () => {
  const { events, addEvent, updateEvent, deleteEvent, error } = useEvent();
  const { isGlobalLoading } = useLoading();
  const { user } = useAuth();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [newEvent, setNewEvent] = useState<
    Omit<Event, "id" | "createdAt" | "updatedAt">
  >({
    title: "",
    date: format(new Date(), "yyyy-MM-dd"),
    time: "09:00",
    type: "meeting",
    userId: user?.id || "1",
  });

  const calendarDays = useMemo(
    () => generateCalendarDays(currentDate),
    [currentDate]
  );

  const handleAddEvent = async () => {
    try {
      if (editingEvent) {
        await updateEvent(editingEvent.id, {
          title: newEvent.title,
          date: newEvent.date,
          time: newEvent.time,
          type: newEvent.type,
        });
        setEditingEvent(null);
      } else {
        await addEvent(newEvent);
      }
      setShowAddEvent(false);
      setNewEvent({
        title: "",
        date: format(new Date(), "yyyy-MM-dd"),
        time: "09:00",
        type: "meeting",
        userId: user?.id || "1",
      });
    } catch (error) {
      console.error("Failed to save event:", error);
    }
  };

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    setNewEvent({
      title: event.title,
      date: event.date,
      time: event.time,
      type: event.type,
      userId: user?.id || "1",
    });
    setShowAddEvent(true);
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      await deleteEvent(eventId);
    } catch (error) {
      console.error("Failed to delete event:", error);
    }
  };

  const handleAddEventForDate = (date: Date) => {
    setEditingEvent(null);
    setNewEvent({
      title: "",
      date: format(date, "yyyy-MM-dd"),
      time: "09:00",
      type: "meeting",
      userId: user?.id || "1",
    });
    setShowAddEvent(true);
  };

  const onDragStart = () => {
    if (window.navigator.vibrate) {
      window.navigator.vibrate(100);
    }
  };

  if (isGlobalLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-error-color p-4 rounded-lg bg-red-50 border border-red-200">
        {error}
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col py-8">
      <CalendarHeader
        currentDate={currentDate}
        onPrevMonth={() => setCurrentDate(subMonths(currentDate, 1))}
        onNextMonth={() => setCurrentDate(addMonths(currentDate, 1))}
      />

      <div className="flex-1">
        <DragDropContext
          onDragStart={onDragStart}
          onDragEnd={(result) => handleDragEnd(result, events, updateEvent)}
        >
          <CalendarGrid
            calendarDays={calendarDays}
            currentDate={currentDate}
            events={events}
            onAddEvent={handleAddEventForDate}
            onEditEvent={handleEditEvent}
            onDeleteEvent={handleDeleteEvent}
          />
        </DragDropContext>

        <EventModal
          isOpen={showAddEvent}
          onClose={() => {
            setShowAddEvent(false);
            setEditingEvent(null);
          }}
          onSubmit={handleAddEvent}
          eventData={newEvent}
          onEventDataChange={(field, value) =>
            setNewEvent({ ...newEvent, [field]: value })
          }
          isEditing={!!editingEvent}
        />
      </div>
    </div>
  );
};

export default Calendar;
