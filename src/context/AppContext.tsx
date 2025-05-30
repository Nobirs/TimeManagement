import React, { createContext, useContext, ReactNode } from 'react';
import { useDataSync } from '../hooks/useDataSync';

export interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  type: 'meeting' | 'task' | 'reminder';
}

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in-progress' | 'completed';
}

interface AppContextType {
  events: Event[];
  tasks: Task[];
  addEvent: (event: Omit<Event, 'id'>) => void;
  updateEvent: (event: Event) => void;
  addTask: (task: Omit<Task, 'id'>) => void;
  updateTask: (task: Task) => void;
  deleteTask: (taskId: string) => void;
  deleteEvent: (eventId: string) => void;
  theme: string;
  setTheme: (theme: string) => void;
  customTheme: Record<string, string>;
  setCustomTheme: (theme: Record<string, string>) => void;
  isLoading: boolean;
  error: string | null;
  isSyncing: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Default data
const defaultEvents: Event[] = [];
const defaultTasks: Task[] = [];

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const {
    data: events,
    setData: setEvents,
    isLoading: eventsLoading,
    error: eventsError,
    isSyncing: eventsSyncing
  } = useDataSync<Event[]>({ key: 'events', defaultValue: defaultEvents });

  const {
    data: tasks,
    setData: setTasks,
    isLoading: tasksLoading,
    error: tasksError,
    isSyncing: tasksSyncing
  } = useDataSync<Task[]>({ key: 'tasks', defaultValue: defaultTasks });

  const {
    data: theme,
    setData: setTheme,
    isLoading: themeLoading,
    error: themeError,
    isSyncing: themeSyncing
  } = useDataSync<string>({ key: 'theme', defaultValue: 'forest' });

  const {
    data: customTheme,
    setData: setCustomTheme,
    isLoading: customThemeLoading,
    error: customThemeError,
    isSyncing: customThemeSyncing
  } = useDataSync<Record<string, string>>({ key: 'customTheme', defaultValue: {} });

  const addEvent = (event: Omit<Event, 'id'>) => {
    const newEvent = {
      id: Math.random().toString(36).substr(2, 9),
      ...event
    };
    setEvents(prev => [...prev, newEvent]);
  };

  const updateEvent = (updatedEvent: Event) => {
    setEvents(prev => prev.map(event => 
      event.id === updatedEvent.id ? updatedEvent : event
    ));
  };

  const addTask = (task: Omit<Task, 'id'>) => {
    const newTask = {
      id: Math.random().toString(36).substr(2, 9),
      ...task
    };
    setTasks(prev => [...prev, newTask]);
  };

  const updateTask = (updatedTask: Task) => {
    setTasks(prev => prev.map(task => task.id === updatedTask.id ? updatedTask : task));
  };

  const deleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
  };

  const deleteEvent = (eventId: string) => {
    setEvents(prev => prev.filter(event => event.id !== eventId));
  };

  const isLoading = eventsLoading || tasksLoading || themeLoading || customThemeLoading;
  const error = eventsError || tasksError || themeError || customThemeError;
  const isSyncing = eventsSyncing || tasksSyncing || themeSyncing || customThemeSyncing;

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>;
  }

  const value = {
    events,
    tasks,
    addEvent,
    updateEvent,
    addTask,
    updateTask,
    deleteTask,
    deleteEvent,
    theme,
    setTheme,
    customTheme,
    setCustomTheme,
    isLoading,
    error,
    isSyncing
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}; 