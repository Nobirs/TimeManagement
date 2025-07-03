import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { PlusIcon, TrashIcon, PencilIcon } from "@heroicons/react/24/outline";
import { useApp } from "../context/AppContext";
import type { Task } from "@time-management/shared-types";
import TaskForm from "../components/forms/TaskForm";

const Tasks: React.FC = () => {
  const { tasks, addTask, updateTask, deleteTask, error } = useApp();
  const [showAddTask, setShowAddTask] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [newTask, setNewTask] = useState<Partial<Task>>({
    title: "",
    description: "",
    dueDate: format(new Date(), "yyyy-MM-dd"),
    priority: "medium",
    status: "todo",
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<Task["status"] | "all">(
    "all"
  );
  const [priorityFilter, setPriorityFilter] = useState<
    Task["priority"] | "all"
  >("all");

  useEffect(() => {
    setLoading(false);
  }, [tasks]);

  const handleAddTask = async (task: Task) => {
    try {
      await addTask(task);
      setShowAddTask(false);
      setNewTask({
        title: "",
        description: "",
        dueDate: format(new Date(), "yyyy-MM-dd"),
        priority: "medium",
        status: "todo",
      });
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  const handleEditTask = async (task: Task) => {
    try {
      await updateTask(task.id, task);
      setEditingTask(null);
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm("Are you sure you want to delete this task?")) {
      return;
    }
    try {
      await deleteTask(taskId);
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const handleTaskStatusChange = async (
    taskId: string,
    currentStatus: string
  ) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const newStatus =
      currentStatus === "todo"
        ? "in-progress"
        : currentStatus === "in-progress"
        ? "completed"
        : "todo";

    try {
      // Упрощенный вызов - контекст сам обновит связанные проекты
      await updateTask(taskId, {
        ...task,
        status: newStatus,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Failed to update task status:", error);
    }
  };

  const getPriorityColor = (priority: Task["priority"]) => {
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

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || task.status === statusFilter;
    const matchesPriority =
      priorityFilter === "all" || task.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-600 text-center p-4">{error}</div>;
  }

  return (
    <div className="space-y-6 py-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
        <button
          onClick={() => {
            setEditingTask(null);
            setNewTask({
              title: "",
              description: "",
              dueDate: format(new Date(), "yyyy-MM-dd"),
              priority: "medium",
              status: "todo",
            });
            setShowAddTask(true);
          }}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-primary-50 hover:bg-primary-100 transition-colors duration-200"
          title="Add Task"
        >
          <PlusIcon className="w-6 h-6 text-primary-600" />
        </button>
      </div>

      {showAddTask && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <TaskForm
              task={newTask as Task}
              onSubmit={handleAddTask}
              onCancel={() => {
                setShowAddTask(false);
                setEditingTask(null);
              }}
            />
          </div>
        </div>
      )}

      {editingTask && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <TaskForm
              task={editingTask}
              onSubmit={handleEditTask}
              onCancel={() => {
                setEditingTask(null);
                setShowAddTask(false);
              }}
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <input
          type="text"
          placeholder="Search tasks..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value as Task["status"] | "all")
          }
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="all">All Status</option>
          <option value="todo">To Do</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
        <select
          value={priorityFilter}
          onChange={(e) =>
            setPriorityFilter(e.target.value as Task["priority"] | "all")
          }
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="all">All Priority</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      <div className="space-y-4 overflow-y-auto max-h-[calc(100vh-200px)]">
        {filteredTasks.map((task) => (
          <div
            key={task.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {task.title}
                  </h3>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(
                      task.priority
                    )}`}
                  >
                    {task.priority}
                  </span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      task.status === "completed"
                        ? "bg-green-100 text-green-800"
                        : task.status === "in-progress"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {task.status}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">{task.description}</p>
                {task.dueDate && (
                  <span className="text-sm text-gray-500 mt-2 block">
                    Due: {format(new Date(task.dueDate), "MMM d, yyyy")}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 ml-4">
                <button
                  onClick={() => handleTaskStatusChange(task.id, task.status)}
                  className={`px-3 py-1 rounded-md text-sm ${
                    task.status === "completed"
                      ? "bg-green-100 text-green-800"
                      : task.status === "in-progress"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {task.status === "todo"
                    ? "Start"
                    : task.status === "in-progress"
                    ? "Complete"
                    : "Reopen"}
                </button>
                <button
                  onClick={() => setEditingTask(task)}
                  className="p-1 text-gray-500 hover:text-gray-700"
                >
                  <PencilIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDeleteTask(task.id)}
                  className="p-1 text-gray-500 hover:text-red-600"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Tasks;
