import React, { createContext, useContext, ReactNode, useState, useEffect, useCallback } from 'react';
import { Task, Event, Theme, Project } from '../data/models/types';
import { taskService } from '../data/services/taskService';
import { eventService } from '../data/services/eventService';
import { settingsService } from '../data/services/settingsService';
import { projectService } from '../data/services/projectService';

interface AppContextType {
  events: Event[];
  tasks: Task[];
  projects: Project[];

  addEvent: (event: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateEvent: (id: string, event: Partial<Event>) => Promise<void>;
  deleteEvent: (eventId: string) => Promise<void>;

  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Task>;
  updateTask: (taskId: string, taskData: Partial<Task>) => Promise<Task | null>;
  deleteTask: (taskId: string) => Promise<void>;
  loadTasks: () => Promise<void>;

  updateProject: (project: Project) => Promise<Project | null>;
  loadProjects: () => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;

  theme: string;
  setTheme: (theme: string) => void;
  customTheme: Theme;
  setCustomTheme: (theme: Theme) => void;

  isLoading: boolean;
  error: string | null;
  isSyncing: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [theme, setThemeState] = useState(settingsService.getTheme());
  const [customTheme, setCustomThemeState] = useState(settingsService.getSettings().customTheme);

  const loadTasks = useCallback(async () => {
    try {
      const loadedTasks = await taskService.getAll();
      setTasks(Array.isArray(loadedTasks) ? loadedTasks : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load Tasks");
    }
  }, []);

  const loadEvents = useCallback(async () => {
    try {
      const loadedEvents = await eventService.getAll();
      setEvents(Array.isArray(loadedEvents) ? loadedEvents : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load Events");
    }
  }, []);

  const loadProjects = useCallback(async () => {
    try {
      const loadedProjects = await projectService.getAll();
      setProjects(Array.isArray(loadedProjects) ? loadedProjects : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load Projects");
    }
  }, []);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        await Promise.all([loadTasks(), loadEvents(), loadProjects()]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [loadTasks, loadEvents, loadProjects]);

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'sync-projects') {
        loadProjects();
      } else if (e.key === 'sync-tasks') {
        loadTasks();
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [loadProjects, loadTasks]);

  const triggerSync = useCallback((key: 'projects' | 'tasks') => {
    localStorage.setItem(`sync-${key}`, Date.now().toString());
  }, []);

  const addEvent = async (event: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setIsSyncing(true);
      const newEvent = await eventService.create(event);
      setEvents(prev => [...prev, newEvent]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add event');
    } finally {
      setIsSyncing(false);
    }
  };

  const updateEvent = async (id: string, event: Partial<Event>) => {
    try {
      setIsSyncing(true);
      const updatedEvent = await eventService.update(id, event);
      if (updatedEvent) {
        setEvents(prev => prev.map(e => e.id === id ? updatedEvent : e));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update event');
    } finally {
      setIsSyncing(false);
    }
  };

  const addTask = async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> => {
    try {
      setIsSyncing(true);
      const newTask = await taskService.create(task);
      setTasks(prev => [...prev, newTask]);
      return newTask;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add task');
      throw err;
    } finally {
      setIsSyncing(false);
    }
  };

  const updateTask = async (taskId: string, taskData: Partial<Task>) => {
    try {
      setIsSyncing(true);
      const updatedTask = await taskService.update(taskId, {
        ...taskData,
        updatedAt: new Date().toISOString()
      });
      if (updatedTask) {
        setTasks(prev => prev.map(task => task.id === taskId ? updatedTask : task));

        const updatedProjects = projects.map(project => {
          if(project.tasks.some(t => t.id === taskId)) {
            const tasks = project.tasks.map(t => t.id === taskId ? updatedTask : t);
            const completedTasks = tasks.filter(t => t.status === 'completed').length;
            const progress = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;
            projectService.update({
              ...project,
              tasks,
              progress,
              updatedAt: new Date().toISOString()})
            return {
              ...project,
              tasks,
              progress,
              updatedAt: new Date().toISOString()
            };
          }
          return project;
        });

        setProjects(updatedProjects);
        triggerSync('projects');
        return updatedTask;
      }
      return null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task');
      throw err;
    } finally {
      setIsSyncing(false);
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      setIsSyncing(true);
      await taskService.delete(taskId);
      setTasks(prev => prev.filter(t => t.id !== taskId));

      // Обновляем проекты
      const updatedProjects = projects.map(project => {
        const taskIndex = project.tasks.findIndex(t => t.id === taskId);
        if (taskIndex !== -1) {
          const tasks = project.tasks.filter(t => t.id !== taskId);
          const completedTasks = tasks.filter(t => t.status === 'completed').length;
          const progress = tasks.length > 0
              ? Math.round((completedTasks / tasks.length) * 100)
              : 0;

          return {
            ...project,
            tasks,
            progress,
            updatedAt: new Date().toISOString()
          };
        }
        return project;
      });

      setProjects(updatedProjects);
      triggerSync('projects');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete task');
    } finally {
      setIsSyncing(false);
    }
  };

  const deleteEvent = async (eventId: string) => {
    try {
      setIsSyncing(true);
      await eventService.delete(eventId);
      setEvents(prev => prev.filter(e => e.id !== eventId));
    } catch (err) {
      console.error('Error deleting event:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  const deleteProject = async (projectId: string) => {
    try{
      setIsSyncing(true);
      tasks.map(t => {
        if(t.projectId === projectId) {
          t.projectId = undefined;
        }
      });
      await projectService.delete(projectId);
      setProjects(prev => prev.filter(p => p.id !== projectId));
    } catch (err) {
      console.error('Error deleting project:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  const updateProject = async (project: Project) => {
    try {
      setIsSyncing(true);
      const updatedProject = await projectService.update({
        ...project,
        updatedAt: new Date().toISOString()
      });

      if (updatedProject) {
        setProjects(prev => prev.map(p => p.id === project.id ? updatedProject : p));
        triggerSync('projects');
        return updatedProject;
      }
      return null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update project');
      throw err;
    } finally {
      setIsSyncing(false);
    }
  };

  const setTheme = (newTheme: string) => {
    settingsService.setTheme(newTheme);
    setThemeState(newTheme);
  };

  const setCustomTheme = (newTheme: Theme) => {
    settingsService.updateSettings({ customTheme: newTheme });
    setCustomThemeState(newTheme);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>;
  }

  const value = {
    events,
    tasks,
    projects,
    addEvent,
    updateEvent,
    addTask,
    updateTask,
    deleteTask,
    deleteEvent,
    deleteProject,
    updateProject,
    loadProjects,
    loadTasks,
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