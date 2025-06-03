import React, { useState, useEffect } from 'react';
import { Note } from '../data/models/types';
import { noteService } from '../data/services/noteService';
import NoteCard from '../components/NoteCard';
import NoteForm from '../components/NoteForm';

const Notes: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | undefined>();
  const [filter, setFilter] = useState<'all' | 'work' | 'personal' | 'idea' | 'other'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showPinnedOnly, setShowPinnedOnly] = useState(false);

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      setLoading(true);
      const data = await noteService.getAll();
      setNotes(data);
      setError(null);
    } catch (err) {
      setError('Failed to load notes');
      console.error('Error loading notes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNote = async (noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await noteService.create(noteData);
      setShowForm(false);
      loadNotes();
    } catch (err) {
      setError('Failed to create note');
      console.error('Error creating note:', err);
    }
  };

  const handleUpdateNote = async (noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!editingNote) return;
    try {
      await noteService.update({
        ...noteData,
        id: editingNote.id,
        createdAt: editingNote.createdAt,
        updatedAt: new Date().toISOString()
      });
      setEditingNote(undefined);
      loadNotes();
    } catch (err) {
      setError('Failed to update note');
      console.error('Error updating note:', err);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;
    try {
      await noteService.delete(noteId);
      loadNotes();
    } catch (err) {
      setError('Failed to delete note');
      console.error('Error deleting note:', err);
    }
  };

  const handlePinNote = async (noteId: string) => {
    try {
      const note = notes.find(n => n.id === noteId);
      if (!note) return;

      const updatedNote = {
        ...note,
        isPinned: !note.isPinned,
        updatedAt: new Date().toISOString()
      };

      await noteService.update(updatedNote);
      loadNotes();
    } catch (err) {
      setError('Failed to update note');
      console.error('Error updating note:', err);
    }
  };

  const filteredNotes = notes.filter(note => {
    const matchesFilter = filter === 'all' || note.category === filter;
    const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesPinned = !showPinnedOnly || note.isPinned;
    return matchesFilter && matchesSearch && matchesPinned;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Notes</h1>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          New Note
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={filter}
            onChange={e => setFilter(e.target.value as typeof filter)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Categories</option>
            <option value="work">Work</option>
            <option value="personal">Personal</option>
            <option value="idea">Ideas</option>
            <option value="other">Other</option>
          </select>
          <button
            onClick={() => setShowPinnedOnly(!showPinnedOnly)}
            className={`px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
              showPinnedOnly
                ? 'bg-yellow-100 text-yellow-800 border-yellow-300'
                : 'bg-white text-gray-700 border-gray-300'
            }`}
          >
            {showPinnedOnly ? 'Show All' : 'Show Pinned'}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">
            <h2 className="text-2xl font-bold mb-4">Create New Note</h2>
            <NoteForm
              onSubmit={handleCreateNote}
              onCancel={() => setShowForm(false)}
            />
          </div>
        </div>
      )}

      {editingNote && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">
            <h2 className="text-2xl font-bold mb-4">Edit Note</h2>
            <NoteForm
              note={editingNote}
              onSubmit={handleUpdateNote}
              onCancel={() => setEditingNote(undefined)}
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredNotes.map(note => (
          <NoteCard
            key={note.id}
            note={note}
            onEdit={() => setEditingNote(note)}
            onDelete={() => handleDeleteNote(note.id)}
            onPin={() => handlePinNote(note.id)}
          />
        ))}
      </div>

      {filteredNotes.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No notes found</p>
        </div>
      )}
    </div>
  );
};

export default Notes; 