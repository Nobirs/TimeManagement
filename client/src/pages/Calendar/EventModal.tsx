import React from "react";
import type { EventModalProps } from "./types";

const EventModal: React.FC<EventModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  eventData,
  onEventDataChange,
  isEditing,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] backdrop-blur-sm flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">
          {isEditing ? "Edit Event" : "Add New Event"}
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Title
            </label>
            <input
              type="text"
              value={eventData.title}
              onChange={(e) => onEventDataChange("title", e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Date
            </label>
            <input
              type="date"
              value={
                eventData.date instanceof Date
                  ? eventData.date.toISOString().split("T")[0]
                  : new Date(eventData.date).toISOString().split("T")[0]
              }
              onChange={(e) => onEventDataChange("date", e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Time
            </label>
            <input
              type="time"
              value={eventData.time}
              onChange={(e) => onEventDataChange("time", e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Type
            </label>
            <select
              value={eventData.type}
              onChange={(e) => onEventDataChange("type", e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              <option value="meeting">Meeting</option>
              <option value="task">Task</option>
              <option value="reminder">Reminder</option>
            </select>
          </div>
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={onSubmit}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              {isEditing ? "Update Event" : "Add Event"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventModal;
