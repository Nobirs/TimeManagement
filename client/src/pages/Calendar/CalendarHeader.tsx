import React from "react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

interface CalendarHeaderProps {
  currentDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  currentDate,
  onPrevMonth,
  onNextMonth,
}) => {
  return (
    <div className="flex-none flex items-center justify-between mb-2">
      <div className="flex items-center space-x-3">
        <h1 className="text-lg font-bold text-gray-900">Calendar</h1>
        <div className="flex items-center space-x-2">
          <button
            onClick={onPrevMonth}
            className="p-1 rounded-md hover:bg-gray-100"
          >
            <svg
              className="w-5 h-5 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <span className="text-base font-semibold">
            {format(currentDate, "LLLL yyyy", { locale: ru })}
          </span>
          <button
            onClick={onNextMonth}
            className="p-1 rounded-md hover:bg-gray-100"
          >
            <svg
              className="w-5 h-5 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>
      <div className="text-base text-gray-500">
        {format(currentDate, "EEEE, MMMM do, yyyy")}
      </div>
    </div>
  );
};

export default CalendarHeader;
