import React from "react";
import type { Task } from "@time-management/shared-types";

interface ProjectTaskProps {
  task: Task;
  handleTaskStatusChange: (taskId: string) => void;
  onRemoveTask: (taskId: string) => void;
}

export const ProjectTask = ({
  task,
  handleTaskStatusChange,
  onRemoveTask,
}: ProjectTaskProps) => (
  <div
    key={task.id}
    className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
    onClick={(e) => {
      e.preventDefault();
      e.stopPropagation();
    }}
  >
    <div className="flex-1 min-w-0">
      <div className="flex items-center space-x-2">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleTaskStatusChange(task.id);
          }}
          className={`w-4 h-4 rounded-full border-2 ${
            task.status === "completed"
              ? "bg-green-500 border-transparent"
              : task.status === "in-progress"
              ? "bg-blue-500 border-transparent"
              : "bg-white border-gray-300"
          }`}
        />
        <p className="text-sm font-medium text-gray-900 truncate">
          {task.title}
        </p>
      </div>
      <div className="flex gap-2 mt-1">
        <span
          className={`px-2 py-0.5 text-xs rounded-full ${
            task.status === "completed"
              ? "bg-green-100 text-green-800"
              : task.status === "in-progress"
              ? "bg-yellow-100 text-yellow-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {task.status}
        </span>
        <span
          className={`px-2 py-0.5 text-xs rounded-full ${
            task.priority === "high"
              ? "bg-red-100 text-red-800"
              : task.priority === "medium"
              ? "bg-yellow-100 text-yellow-800"
              : "bg-green-100 text-green-800"
          }`}
        >
          {task.priority}
        </span>
      </div>
    </div>
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onRemoveTask(task.id);
      }}
      className="ml-2 p-1 text-gray-400 hover:text-red-600"
    >
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    </button>
  </div>
);

export default React.memo(ProjectTask);
