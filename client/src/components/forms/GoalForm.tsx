import React, { useCallback, useEffect, useState } from "react";
import { type Goal, Priority, Status } from "@time-management/shared-types";
import { format, parseISO } from "date-fns";

interface GoalFormProps {
  goal?: Goal;
  onSubmit: (goal: Goal) => void;
  onCancel: () => void;
}

const GoalForm: React.FC<GoalFormProps> = ({ goal, onSubmit, onCancel }) => {
  const defaultGoal: Goal = {
    id: "",
    title: "",
    description: "",
    startDate: "",
    dueDate: "",
    priority: Priority.Medium,
    status: Status.NotStarted,
    progress: 0,
    userId: "1",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const [formData, setFormData] = useState<Goal>(goal || defaultGoal);

  useEffect(() => {
    if (goal) {
      setFormData({
        ...goal,
        startDate: goal.startDate
          ? format(parseISO(goal.startDate), "yyyy-MM-dd")
          : "",
        dueDate: goal.dueDate
          ? format(parseISO(goal.dueDate), "yyyy-MM-dd")
          : "",
      });
    }
  }, [goal]);

  const handleChange = useCallback(
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    },
    []
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      const dataToSubmit = {
        ...formData,
        startDate: new Date(formData.startDate).toISOString(),
        dueDate: new Date(formData.dueDate).toISOString(),
      };

      if (new Date(formData.dueDate) < new Date(formData.startDate)) {
        alert("Due date must be after start date");
        return;
      }
      onSubmit(dataToSubmit);
    },
    [formData, onSubmit]
  );

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">
        {goal ? "Edit Goal" : "Create New Goal"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Title
          </label>
          <input
            type="text"
            name="title"
            aria-label="Goal Title"
            value={formData.title}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            name="description"
            aria-label="Goal Description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Start Date
            </label>
            <input
              type="date"
              name="startDate"
              aria-label="Goal Start Date"
              value={formData.startDate}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Due Date
            </label>
            <input
              type="date"
              name="dueDate"
              aria-label="Goal Due Date"
              value={formData.dueDate}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Priority
            </label>
            <select
              name="priority"
              aria-label="Goal Priority"
              value={formData.priority}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              {Object.entries(Priority).map(([key, value]) => (
                <option key={value} value={value}>
                  {key}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Status
            </label>
            <select
              name="status"
              aria-label="Goal Status"
              value={formData.status}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              {Object.entries(Status).map(([key, value]) => (
                <option key={value} value={value}>
                  {key}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            {goal ? "Update Goal" : "Create Goal"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default GoalForm;
