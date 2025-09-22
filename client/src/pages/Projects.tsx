import React, { useState, useEffect } from "react";
import {
  Priority,
  TaskStatus,
  type Project,
  type Task,
} from "@time-management/shared-types";
import { projectService } from "../data/services/projectService";
import ProjectCard from "../components/ProjectCard";
import ProjectForm from "../components/forms/ProjectForm";
import { useProject } from "../contexts/ProjectContext";
import { useTask } from "../contexts/TaskContext";
import { PlusIcon } from "@heroicons/react/24/outline";
import { useLoading } from "../contexts/LoadingContext";

const Projects: React.FC = () => {
  const {
    projects,
    loadProjects,
    updateProject,
    deleteProject,
    removeTaskFromProject,
  } = useProject();

  const { tasks: allTasks, addTask: addGlobalTask, updateTask } = useTask();

  const { isGlobalLoading: appLoading } = useLoading();

  // Убрать локальное состояние проектов
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | undefined>();
  const [filter, setFilter] = useState<
    "all" | "active" | "completed" | "archived"
  >("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null
  );

  useEffect(() => {
    loadProjects();
  }, []);

  const handleCreateProject = async (
    projectData: Omit<Project, "id" | "createdAt" | "updatedAt">
  ) => {
    try {
      await projectService.create(projectData);
      setShowForm(false);
      loadProjects();
    } catch (err) {
      console.error("Error creating project:", err);
    }
  };

  const handleUpdateProject = async (
    projectData: Omit<Project, "id" | "createdAt" | "updatedAt">
  ) => {
    if (!editingProject) return;
    try {
      await updateProject({
        ...projectData,
        id: editingProject.id,
        createdAt: editingProject.createdAt,
        updatedAt: new Date().toISOString(),
      });
      setEditingProject(undefined);
    } catch (err) {
      console.error("Error updating project:", err);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!window.confirm("Are you sure you want to delete this project?"))
      return;
    try {
      const projectTasks = allTasks.filter((t) => t.projectId === projectId);
      await Promise.all(
        projectTasks.map((task) =>
          updateTask(task.id, { ...task, projectId: undefined })
        )
      );

      await deleteProject(projectId);
    } catch (err) {
      console.error("Error deleting project:", err);
    }
  };

  const handleAddTask = async (projectId: string) => {
    setSelectedProjectId(projectId);
    setShowTaskModal(true);
  };

  const handleSelectTask = async (task: Task) => {
    if (!selectedProjectId) return;

    try {
      const project = projects.find((p) => p.id === selectedProjectId);
      if (!project) return;

      const updatedTask: Task = {
        ...task,
        projectId: selectedProjectId,
        updatedAt: new Date().toISOString(),
      };
      const updatedProject: Project = {
        ...project,
        tasks: [...(project.tasks || []), updatedTask],
        updatedAt: new Date().toISOString(),
      };

      console.log(updatedProject);

      await updateTask(updatedTask.id, updatedTask);
      await updateProject(updatedProject);

      setShowTaskModal(false);
      setSelectedProjectId(null);
    } catch (err) {
      console.error("Error adding task to project:", err);
    }
  };

  const handleCreateNewTask = async () => {
    if (!selectedProjectId) {
      console.log("Project ID to create new Task is null");
      return;
    }

    const title = window.prompt("Task title:");
    if (!title) return;

    const newTaskData = {
      userId: "1", // TODO: shouldn't be here
      title,
      description: "",
      dueDate: new Date().toISOString().split("T")[0],
      priority: Priority.Medium,
      status: TaskStatus.todo,
    };

    try {
      const newTask = await addGlobalTask(newTaskData);
      const project = projects.find((p) => p.id === selectedProjectId);
      if (!project) return;

      const updatedProject: Project = {
        ...project,
        tasks: [...(project.tasks || []), newTask],
        updatedAt: new Date().toISOString(),
      };

      // Использовать updateProject из контекста
      await updateProject(updatedProject);
      setShowTaskModal(false);
      setSelectedProjectId(null);
    } catch (err) {
      console.error("Error creating task:", err);
    }
  };

  const handleRemoveTask = async (projectId: string, taskId: string) => {
    try {
      const project = projects.find((p) => p.id === projectId);
      if (!project) return;

      await removeTaskFromProject(taskId, projectId);
    } catch (err) {
      console.error("Error removing task:", err);
    }
  };

  const filteredProjects = projects.filter((project) => {
    const matchesFilter = filter === "all" || project.status === filter;
    const matchesSearch =
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      );
    return matchesFilter && matchesSearch;
  });

  if (appLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  console.log("In projects.tsx");
  console.log(projects);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
        <button
          onClick={() => setShowForm(true)}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-primary-50 hover:bg-primary-100 transition-colors duration-200"
        >
          <PlusIcon className="w-6 h-6 text-primary-600" />
        </button>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as typeof filter)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Projects</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">
            <h2 className="text-2xl font-bold mb-4">Create New Project</h2>
            <ProjectForm
              onSubmit={handleCreateProject}
              onCancel={() => setShowForm(false)}
            />
          </div>
        </div>
      )}

      {editingProject && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">
            <h2 className="text-2xl font-bold">Edit Project</h2>
            <ProjectForm
              project={editingProject}
              onSubmit={handleUpdateProject}
              onCancel={() => setEditingProject(undefined)}
            />
          </div>
        </div>
      )}

      {/* Task Selection Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Add Task to Project</h2>
              <button
                onClick={() => {
                  setShowTaskModal(false);
                  setSelectedProjectId(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="mb-4">
              <button
                onClick={handleCreateNewTask}
                className="w-full px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 mb-4"
              >
                Create New Task
              </button>

              <h3 className="text-lg font-semibold mb-2">
                Select Existing Task
              </h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {allTasks.map((task: Task) => (
                  <div
                    key={task.id}
                    className="p-3 border rounded-md hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleSelectTask(task)}
                  >
                    <div className="font-medium">{task.title}</div>
                    <div className="text-sm text-gray-500">
                      {task.description}
                    </div>
                    <div className="flex gap-2 mt-1">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          task.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : task.status === "in_progress"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {task.status}
                      </span>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
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
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto max-h-[calc(100vh-200px)]">
        {filteredProjects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onEdit={() => setEditingProject(project)}
            onDelete={() => handleDeleteProject(project.id)}
            onAddTask={() => handleAddTask(project.id)}
            onRemoveTask={(taskId) => handleRemoveTask(project.id, taskId)}
          />
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No projects found</p>
        </div>
      )}
    </div>
  );
};

export default Projects;
