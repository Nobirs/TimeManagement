export interface BaseEntity {
  id: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface User extends BaseEntity {
  email: string;
  password: string;
  name?: string;
  settings?: any;
  tasks?: Task[];
  events?: Event[];
  projects?: Project[];
  notes?: Note[];
  goals?: Goal[];
  habits?: Habit[];
  pomodoroSessions?: PomodoroSession[];
  timeTrackings?: TimeTracking[];
  roadmaps?: Roadmap[];
}

export interface Task extends BaseEntity {
  title: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'completed';
  priority: Priority;
  dueDate: string | Date;
  projectId?: string;
  userId: string; // Добавлено
  notes?: Note[]; // Добавлено
}

export interface Event extends BaseEntity {
  title: string;
  date: string | Date;
  time?: string;
  type: 'meeting' | 'task' | 'reminder';
  userId: string; // Добавлено
}

export interface Project extends BaseEntity {
  title: string;
  description?: string;
  status: 'active' | 'completed' | 'archived';
  priority: Priority;
  startDate?: string | Date;
  endDate?: string | Date;
  progress?: number;
  tasks?: Task[];
  members: string[];
  tags: string[];
  color?: string;
  userId: string; // Добавлено
  notes?: Note[]; // Добавлено
}

export interface Note extends BaseEntity {
  title: string;
  content?: string;
  category: 'work' | 'personal' | 'idea' | 'other';
  tags: string[];
  color?: string;
  isPinned: boolean;
  relatedTaskId?: string;
  relatedProjectId?: string;
  userId: string; // Добавлено
}

export enum Priority {
  Low = 'low',
  Medium = 'medium',
  High = 'high',
}

export enum Status {
  NotStarted = 'not_started',
  InProgress = 'in_progress',
  Completed = 'completed',
  Archived = 'archived',
}

export interface Goal extends BaseEntity {
  title: string;
  description?: string;
  startDate: string;
  dueDate: string;
  priority: Priority;
  progress: number;
  status: Status;
  userId: string;
}


export enum Frequency {
  Daily = 'daily',
  Weekly = 'weekly',
  Monthly = 'monthly',
}

export enum TimeOfDay {
  Morning = 'morning',
  Afternoon = 'afternoon',
  Evening = 'evening',
  Anytime = 'anytime',
}

export interface Habit extends BaseEntity {
  title: string;
  description?: string;
  frequency: Frequency;
  timeOfDay: TimeOfDay;
  streak: number;
  userId: string;
}

export interface PomodoroSession extends BaseEntity {
  startTime: string | Date;
  endTime?: string | Date;
  duration?: number;
  taskId?: string;
  userId: string;
}

export interface TimeTracking extends BaseEntity {
  taskName: string;
  startTime: string | Date;
  endTime?: string | Date;
  duration?: number;
  userId: string;
}

export interface Roadmap extends BaseEntity {
  name: string;
  nodes: RoadmapNode[];
  edges: RoadmapEdge[];
  userId: string;
}

export interface RoadmapNode {
  id: string;
  roadmapId: string;
  type: 'goal' | 'step' | 'milestone' | 'project' | 'task';
  positionX: number;
  positionY: number;
  data: Record<string, any>;
}

export interface RoadmapEdge {
  id: string;
  roadmapId: string;
  source: string;
  target: string;
}

export type ApiResponse<T> = {
  data: T | null;
  error: string | null;
  status: number;
};