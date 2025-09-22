import type { Event } from "@time-management/shared-types";

export type CalendarProps = {};

export type CalendarEventProps = {
  index: number;
  event: Event;
  onEdit: (event: Event) => void;
  onDelete: (eventId: string) => void;
};

export type CalendarDayProps = {
  day: Date;
  currentMonth: Date;
  events: Event[];
  onAddEvent: (date: Date) => void;
  onEditEvent: (event: Event) => void;
  onDeleteEvent: (eventId: string) => void;
};

export type EventModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  eventData: Omit<Event, "id" | "createdAt" | "updatedAt">;
  onEventDataChange: (
    field: keyof Omit<Event, "id" | "createdAt" | "updatedAt">,
    value: string
  ) => void;
  isEditing: boolean;
};
