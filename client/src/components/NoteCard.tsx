import React, {useCallback, memo} from 'react';
import type { Note } from '@time-management/shared-types';
import { format } from 'date-fns';
import { DeleteIcon, EditIcon, PinIcon } from './Icons';

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (noteId: string) => void;
  onPin: (noteId: string) => void;
}

const NoteCard: React.FC<NoteCardProps> = ({
  note,
  onEdit,
  onDelete,
  onPin,
}) => {

  const handlePin = useCallback(() => onPin(note.id), [onPin, note.id]);
  const handleDelete = useCallback(() => onDelete(note.id), [onDelete, note.id]);
  const handleEdit = useCallback(() => onEdit(note), [onEdit, note]);

  const getCategoryColor = useCallback((category: Note['category']) => {
    const colors = {
      work: 'bg-blue-100 text-blue-800',
      personal: 'bg-green-100 text-green-800',
      idea: 'bg-purple-100 text-purple-800',
      other: 'bg-gray-100 text-gray-800',
    }
    return colors[category] || colors.other;
  }, []);

  return (
    <div 
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
      style={{ borderLeft: `4px solid ${note.color}` }}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-gray-900">{note.title}</h3>
            <button
              onClick={handlePin}
              className={`p-1 ${note.isPinned ? 'text-yellow-500' : 'text-gray-400'} hover:text-yellow-500`}
            >
              <PinIcon />
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-1">{note.content}</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleEdit}
            className="p-1 text-gray-500 hover:text-gray-700"
          >
            <EditIcon />
          </button>
          <button
            onClick={handleDelete}
            className="p-1 text-gray-500 hover:text-red-600"
          >
            <DeleteIcon />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <span className={`px-2 py-1 rounded-full text-xs ${getCategoryColor(note.category)}`}>
          {note.category}
        </span>
        {note.tags.map((tag) => (
          <span key={tag} className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
            {tag}
          </span>
        ))}
      </div>

      <div className="text-sm text-gray-500">
        <span>Created: {format(new Date(note.createdAt), 'MMM d, yyyy')}</span>
        {note.updatedAt !== note.createdAt && (
          <span className="ml-4">Updated: {format(new Date(note.updatedAt), 'MMM d, yyyy')}</span>
        )}
      </div>
    </div>
  );
};

export default memo(NoteCard); 