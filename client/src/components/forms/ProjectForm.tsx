import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  type Project,
  ProjectStatus,
  Priority,
} from "@time-management/shared-types";

interface ProjectFormProps {
  project?: Project;
  onSubmit: (project: Project) => void;
  onCancel: () => void;
}

const ProjectForm: React.FC<ProjectFormProps> = ({
  project,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState<Project>({
    title: "",
    description: "",
    status: ProjectStatus.Active,
    priority: Priority.Medium,
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
    progress: 0,
    tasks: [],
    members: [],
    tags: [],
    color: "#3b82f6",

    userId: "1",
    id: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  useEffect(() => {
    if (project) {
      setFormData({ ...project });
    }
  }, [project]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleTagInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && e.currentTarget.value.trim()) {
      e.preventDefault();
      const newTag = e.currentTarget.value.trim();
      if (!formData.tags.includes(newTag)) {
        setFormData((prev) => ({
          ...prev,
          tags: [...prev.tags, newTag],
        }));
      }
      e.currentTarget.value = "";
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleMemberInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && e.currentTarget.value.trim()) {
      e.preventDefault();
      const newMember = e.currentTarget.value.trim();
      if (!formData.members.includes(newMember)) {
        setFormData((prev) => ({
          ...prev,
          members: [...prev.members, newMember],
        }));
      }
      e.currentTarget.value = "";
    }
  };

  const removeMember = (memberToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      members: prev.members.filter((member) => member !== memberToRemove),
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2 max-w-3x1 mx-auto p-3">
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Title
        </label>
        <input
          type="text"
          id="title"
          value={formData.title}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, title: e.target.value }))
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          required
        />
      </div>

      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Description
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, description: e.target.value }))
          }
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="status"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Status
          </label>
          <select
            id="status"
            value={formData.status}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                status: e.target.value as Project["status"],
              }))
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="priority"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Priority
          </label>
          <select
            id="priority"
            value={formData.priority}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                priority: e.target.value as Project["priority"],
              }))
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="startDate"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Start Date
          </label>
          <input
            type="date"
            id="startDate"
            value={
              formData.startDate &&
              format(new Date(formData.startDate), "yyyy-MM-dd")
            }
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, startDate: e.target.value }))
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            required
          />
        </div>

        <div>
          <label
            htmlFor="endDate"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            End Date
          </label>
          <input
            type="date"
            id="endDate"
            value={
              formData.endDate &&
              format(new Date(formData.endDate), "yyyy-MM-dd")
            }
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, endDate: e.target.value }))
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Progress and Color Picker - левая колонка */}
        <div className="space-y-2">
          {/* Progress Slider */}
          <div>
            <label
              htmlFor="progress"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Progress ({formData.progress}%)
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                id="progress"
                min="0"
                max="100"
                value={formData.progress}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    progress: parseInt(e.target.value),
                  }))
                }
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-sm font-medium text-gray-600 min-w-[40px]">
                {formData.progress}%
              </span>
            </div>
          </div>

          {/* Color Picker */}
          <div>
            <label
              htmlFor="color"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Color
            </label>
            <div className="flex items-center gap-4">
              <input
                type="color"
                id="color"
                value={formData.color}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, color: e.target.value }))
                }
                className="w-12 h-12 border border-gray-300 rounded-md cursor-pointer shadow-sm"
              />
              <span className="text-sm font-mono bg-gray-100 px-3 py-1.5 rounded-md">
                {formData.color}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-row justify-between space-2">
          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center pl-3 pr-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1.5 text-gray-500 hover:text-gray-700 focus:outline-none"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <input
                type="text"
                placeholder="Add a tag and press Enter"
                onKeyDown={handleTagInput}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          {/* Team Members */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Team Members
            </label>
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap gap-2">
                {formData.members.map((member) => (
                  <span
                    key={member}
                    className="inline-flex items-center pl-3 pr-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                  >
                    {member}
                    <button
                      type="button"
                      onClick={() => removeMember(member)}
                      className="ml-1.5 text-gray-500 hover:text-gray-700 focus:outline-none"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <input
                type="text"
                placeholder="Add a member and press Enter"
                onKeyDown={handleMemberInput}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Buttons - под всеми колонками */}
      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          {project ? "Update Project" : "Create Project"}
        </button>
      </div>
    </form>
  );
};

export default React.memo(ProjectForm);
