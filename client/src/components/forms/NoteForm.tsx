import React, { useState, useEffect, useCallback, useMemo } from "react";
import type { Note } from "@time-management/shared-types";

interface NoteFormProps {
  note?: Note;
  onSubmit: (note: Note) => void;
  onCancel: () => void;
}

const CATEGORIES = [
  { value: "work", label: "Work" },
  { value: "personal", label: "Personal" },
  { value: "idea", label: "Idea" },
  { value: "other", label: "Other" },
] as const;

const NoteForm: React.FC<NoteFormProps> = ({ note, onSubmit, onCancel }) => {
  const defaultNote: Note = {
    id: "",
    title: "",
    content: "",
    category: "other",
    tags: [],
    color: "#3B82F6",
    isPinned: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    userId: "1",
  };
  const [formData, setFormData] = useState(note || defaultNote);

  const [newTag, setNewTag] = useState("");

  useEffect(() => {
    setFormData(note ?? defaultNote);
  }, [note]);

  const handleChange = useCallback(
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) => {
      const { name, value, type } = e.target;
      const checked = (e.target as HTMLInputElement).checked;

      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    },
    []
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      onSubmit(formData);
    },
    [formData, onSubmit]
  );

  const handleAddTag = useCallback(() => {
    if (newTag && !formData.tags.includes(newTag)) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag],
      }));
      setNewTag("");
    }
  }, [newTag, formData.tags]);

  const handleRemoveTag = useCallback((tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  }, []);

  const tagsElements = useMemo(
    () =>
      formData.tags.map((tag) => (
        <Tag key={tag} tag={tag} onRemove={handleRemoveTag} />
      )),
    [formData.tags, handleRemoveTag]
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-700"
        >
          Title
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          required
        />
      </div>

      <div>
        <label
          htmlFor="content"
          className="block text-sm font-medium text-gray-700"
        >
          Content
        </label>
        <textarea
          id="content"
          name="content"
          value={formData.content}
          onChange={handleChange}
          rows={4}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          required
        />
      </div>

      <div>
        <label
          htmlFor="category"
          className="block text-sm font-medium text-gray-700"
        >
          Category
        </label>
        <select
          id="category"
          name="category"
          value={formData.category}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
        >
          {CATEGORIES.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Tags</label>
        <div className="mt-1 flex flex-wrap gap-2">{tagsElements}</div>
        <div className="mt-2 flex">
          <input
            type="text"
            value={newTag}
            name="tags"
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
            placeholder="Add a tag"
            className="block w-full rounded-l-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          />
          <button
            type="button"
            onClick={handleAddTag}
            disabled={!newTag}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Add
          </button>
        </div>
      </div>

      <div>
        <label
          htmlFor="color"
          className="block text-sm font-medium text-gray-700"
        >
          Color
        </label>
        <input
          type="color"
          id="color"
          value={formData.color}
          onChange={handleChange}
          name="color"
          className="mt-1 block w-full h-10 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
        />
        <span className="ml-2 text-sm text-gray-500">{formData.color}</span>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="isPinned"
          checked={formData.isPinned}
          onChange={handleChange}
          name="isPinned"
          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
        />
        <label htmlFor="isPinned" className="ml-2 block text-sm text-gray-700">
          Pin this note
        </label>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          {note ? "Update" : "Create"}
        </button>
      </div>
    </form>
  );
};

const Tag: React.FC<{
  tag: string;
  onRemove: (tag: string) => void;
}> = React.memo(({ tag, onRemove }) => (
  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
    {tag}
    <button
      type="button"
      onClick={() => onRemove(tag)}
      className="ml-1 text-gray-500 hover:text-gray-700"
      aria-label={`Remove tag ${tag}`}
    >
      ×
    </button>
  </span>
));

export default React.memo(NoteForm);
