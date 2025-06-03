export interface Task {
    id: string;
    title: string;
    description?: string;
    status: 'todo' | 'in-progress' | 'done';
    priority: 'low' | 'medium' | 'high';
    dueDate?: string;
    projectId?: string;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface Event {
    id: string;
    title: string;
    description?: string;
    startDate: string;
    endDate: string;
    location?: string;
    attendees?: string[];
    createdAt: string;
    updatedAt: string;
  }
  
  export interface Note {
    id: string;
    title: string;
    content: string;
    category?: string;
    tags: string[];
    isPinned: boolean;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface Project {
    id: string;
    name: string;
    description?: string;
    progress: number;
    tasks: Task[];
    createdAt: string;
    updatedAt: string;
  }
  
  export interface UserSettings {
    theme: string;
    language: string;
    notifications: boolean;
    soundEnabled: boolean;
    fontSize: 'small' | 'medium' | 'large';
    customTheme: {
      primary: string;
      background: string;
      text: string;
      secondary: string;
    };
  }