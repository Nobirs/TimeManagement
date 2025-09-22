// src/pages/Goals.tsx
import React, { useState, useEffect } from "react";
import { format, parseISO, isBefore, isAfter } from "date-fns";
import {
  PlusIcon,
  TrashIcon,
  PencilIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import GoalForm from "../components/forms/GoalForm";
import {
  type Goal,
  Status as GoalStatus,
  Priority as GoalPriority,
} from "@time-management/shared-types";
import { useGoal } from "../contexts/GoalContext";
import { logger } from "../utils/logger";

const Goals: React.FC = () => {
  const { goals, error, addGoal, updateGoal, deleteGoal } = useGoal();
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [internalError, setInternalError] = useState("");
  const [editingGoal, setEditingGoal] = useState<Goal | undefined>(undefined);
  const [filter, setFilter] = useState<"all" | "active" | "completed">(
    "active"
  );

  useEffect(() => {
    if (error) {
      setInternalError(error);
    }
    setLoading(false);
  }, [error]);

  const handleUpdateProgress = (id: string, progress: number) => {
    goals.map((g) =>
      g.id === id
        ? updateGoal({
            ...g,
            progress: Math.max(0, Math.min(100, progress)),
            status:
              progress >= 100
                ? GoalStatus.Completed
                : g.status === GoalStatus.Completed
                ? GoalStatus.InProgress
                : g.status,
          })
        : g
    );
  };

  const getStatusColor = (status: GoalStatus) => {
    switch (status) {
      case GoalStatus.NotStarted:
        return "bg-gray-100 text-gray-800";
      case GoalStatus.InProgress:
        return "bg-blue-100 text-blue-800";
      case GoalStatus.Completed:
        return "bg-green-100 text-green-800";
      case GoalStatus.Archived:
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: GoalPriority) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getGoalStatus = (goal: Goal): GoalStatus => {
    const today = new Date();
    const start = parseISO(goal.startDate);
    const due = parseISO(goal.dueDate);

    if (goal.progress >= 100) return GoalStatus.Completed;
    if (isBefore(today, start)) return GoalStatus.NotStarted;
    if (isAfter(today, due)) return GoalStatus.Archived;
    return GoalStatus.InProgress;
  };

  const filteredGoals = goals.filter((goal) => {
    if (filter === "active") {
      return (
        getGoalStatus(goal) !== "completed" &&
        getGoalStatus(goal) !== "archived"
      );
    }
    if (filter === "completed") {
      return getGoalStatus(goal) === "completed";
    }
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Goals</h1>
        <button
          onClick={() => {
            setEditingGoal(undefined);
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
        >
          <PlusIcon className="w-5 h-5" />
          <span>New Goal</span>
        </button>
      </div>

      {internalError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600">{internalError}</p>
        </div>
      )}

      <div className="mb-6 flex flex-wrap gap-4">
        <button
          onClick={() => setFilter("active")}
          className={`px-4 py-2 rounded-md ${
            filter === "active"
              ? "bg-primary-100 text-primary-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          Active Goals
        </button>
        <button
          onClick={() => setFilter("completed")}
          className={`px-4 py-2 rounded-md ${
            filter === "completed"
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          Completed
        </button>
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-md ${
            filter === "all"
              ? "bg-blue-100 text-blue-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          All Goals
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <GoalForm
              goal={editingGoal}
              onSubmit={
                editingGoal
                  ? async (goalData) => {
                      try {
                        await updateGoal(goalData);
                        setShowForm(false);
                        setEditingGoal(undefined);
                      } catch (error) {
                        logger.error("Failed to update goal:", error);
                        setInternalError("Failed to update goal" + error);
                      }
                    }
                  : async (goalData) => {
                      try {
                        await addGoal(goalData);
                        setShowForm(false);
                        setEditingGoal(undefined);
                      } catch (error) {
                        logger.error("Failed to add goal:", error);
                        setInternalError("Failed to add goal" + error);
                      }
                    }
              }
              onCancel={() => {
                setShowForm(false);
                setEditingGoal(undefined);
              }}
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGoals.map((goal) => {
          const status = getGoalStatus(goal);
          const daysLeft = Math.ceil(
            (parseISO(goal.dueDate).getTime() - new Date().getTime()) /
              (1000 * 60 * 60 * 24)
          );

          return (
            <div
              key={goal.id}
              className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden"
            >
              <div className="p-5">
                <div className="flex justify-between items-start">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {goal.title}
                  </h2>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingGoal(goal);
                        setShowForm(true);
                      }}
                      className="text-gray-500 hover:text-blue-600"
                    >
                      <PencilIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => deleteGoal(goal.id)}
                      className="text-gray-500 hover:text-red-600"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <p className="mt-2 text-gray-600">{goal.description}</p>

                <div className="mt-4 space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progress: {goal.progress}%</span>
                      {status === "completed" && (
                        <span className="flex items-center text-green-600">
                          <CheckIcon className="w-4 h-4 mr-1" /> Completed
                        </span>
                      )}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full"
                        style={{ width: `${goal.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${getStatusColor(
                        status
                      )}`}
                    >
                      {status.replace("-", " ")}
                    </span>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(
                        goal.priority
                      )}`}
                    >
                      {goal.priority}
                    </span>
                    {status !== "completed" &&
                      status !== "archived" &&
                      daysLeft > 0 && (
                        <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                          {daysLeft} {daysLeft === 1 ? "day" : "days"} left
                        </span>
                      )}
                  </div>

                  <div className="text-sm text-gray-500">
                    <div>
                      Start: {format(parseISO(goal.startDate), "MMM d, yyyy")}
                    </div>
                    <div>
                      Due: {format(parseISO(goal.dueDate), "MMM d, yyyy")}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 px-5 py-3 flex justify-between items-center">
                <div className="flex gap-1">
                  {[0, 25, 50, 75, 100].map((value) => (
                    <button
                      key={value}
                      onClick={() => handleUpdateProgress(goal.id, value)}
                      className={`w-8 h-8 flex items-center justify-center rounded-full text-xs ${
                        goal.progress === value
                          ? "bg-primary-600 text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      {value}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={goal.progress}
                    onChange={(e) =>
                      handleUpdateProgress(goal.id, parseInt(e.target.value))
                    }
                    className="w-24 accent-primary-600"
                  />
                  <span className="text-sm font-medium">{goal.progress}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredGoals.length === 0 && (
        <div className="text-center py-12">
          <div className="bg-gray-100 border-2 border-dashed rounded-xl w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <PlusIcon className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            No goals yet
          </h3>
          <p className="text-gray-500 mb-4">
            {filter === "completed"
              ? "You haven't completed any goals yet"
              : "Create your first goal to get started"}
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            Create Goal
          </button>
        </div>
      )}
    </div>
  );
};

export default Goals;
