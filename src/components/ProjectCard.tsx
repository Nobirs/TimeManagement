import React from 'react';
import { Project, Task } from '../data/models/types';
import { format } from 'date-fns';
import {useApp} from "../context/AppContext";

interface ProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (projectId: string) => void;
  onAddTask: (projectId: string) => void;
  onRemoveTask: (taskId: string) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onEdit,
  onDelete,
  onAddTask,
  onRemoveTask
}) => {
  const { updateTask } = useApp();
  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: Project['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateProgress = () => {
    if (project.tasks.length === 0) return 0;
    const completedTasks = project.tasks.filter(task => task.status === 'completed').length;
    return Math.round((completedTasks / project.tasks.length) * 100);
  };

  const progress = calculateProgress();

  const handleTaskStatusChange = async (taskId: string) => {
    const task = project.tasks.find(t => t.id === taskId);
    if (!task) return;

    const newStatus = task.status === 'todo'
        ? 'in-progress'
        : task.status === 'in-progress'
            ? 'completed'
            : 'todo';

    try {
      // Использовать updateTask из контекста
      await updateTask(taskId, {
        ...task,
        status: newStatus,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to update task status:', error);
    }
  };


  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{project.title}</h3>
          <p className="text-sm text-gray-500 mt-1">{project.description}</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(project)}
            className="p-1 text-gray-500 hover:text-gray-700"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(project.id)}
            className="p-1 text-gray-500 hover:text-red-600"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(project.status)}`}>
          {project.status}
        </span>
        <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(project.priority)}`}>
          {project.priority}
        </span>
        {project.tags.map((tag, index) => (
          <span key={index} className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
            {tag}
          </span>
        ))}
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>Progress</span>
          <span>{progress}%</span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={progress}
          disabled
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-not-allowed opacity-75"
          style={{
            background: `linear-gradient(to right, ${project.color} ${progress}%, #e5e7eb ${progress}%)`
          }}
        />
      </div>

      <div className="flex justify-between text-sm text-gray-500 mb-4">
        <div>
          <span>Start: {format(new Date(project.startDate), 'MMM d, yyyy')}</span>
        </div>
        <div>
          <span>End: {format(new Date(project.endDate), 'MMM d, yyyy')}</span>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex justify-between items-center mb-2">
          <h4 className="text-sm font-medium text-gray-900">Tasks ({project.tasks.length})</h4>
          <button
            onClick={() => onAddTask(project.id)}
            className="px-2 py-1 text-sm bg-primary-600 text-white rounded hover:bg-primary-700"
          >
            Add Task
          </button>
        </div>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {project.tasks.map((task: Task) => (
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
                      task.status === 'completed' ? 'bg-green-500 border-transparent' :
                      task.status === 'in-progress' ? 'bg-blue-500 border-transparent' :
                      'bg-white border-gray-300'
                    }`}
                  />
                  <p className="text-sm font-medium text-gray-900 truncate">{task.title}</p>
                </div>
                <div className="flex gap-2 mt-1">
                  <span className={`px-2 py-0.5 text-xs rounded-full ${
                    task.status === 'completed' ? 'bg-green-100 text-green-800' :
                    task.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {task.status}
                  </span>
                  <span className={`px-2 py-0.5 text-xs rounded-full ${
                    task.priority === 'high' ? 'bg-red-100 text-red-800' :
                    task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
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
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectCard; 