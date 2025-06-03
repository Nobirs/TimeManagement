export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  projectId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Event extends BaseEntity {
  title: string;
  date: string;
  time: string;
  type: 'meeting' | 'task' | 'reminder';
}

export interface Theme {
  primary: string;
  background: string;
  text: string;
  secondary: string;
}

export interface UserSettings {
  theme: string;
  customTheme: Theme;
  language: string;
  notifications: boolean;
  soundEnabled: boolean;
  fontSize: 'small' | 'medium' | 'large';
}

export interface Project extends BaseEntity {
  title: string;
  description: string;
  status: 'active' | 'completed' | 'archived';
  priority: 'high' | 'medium' | 'low';
  startDate: string;
  endDate: string;
  progress: number;
  tasks: Task[]; // Array of Task objects
  members: string[]; // Array of user IDs
  tags: string[];
  color: string;
}

export interface Note extends BaseEntity {
  title: string;
  content: string;
  category: 'work' | 'personal' | 'idea' | 'other';
  tags: string[];
  color: string;
  isPinned: boolean;
  relatedTaskId?: string;
  relatedProjectId?: string;
}

export type ApiResponse<T> = {
  data: T | null;
  error: string | null;
  status: number;
}; 