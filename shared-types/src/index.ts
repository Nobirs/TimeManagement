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

export enum TaskStatus {
  todo = "todo",
  in_progress = "in_progress",
  completed = "completed",
}

export interface Task extends BaseEntity {
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  dueDate: string | Date;
  projectId?: string;
  userId: string;
  notes?: Note[];
}

export interface Event extends BaseEntity {
  title: string;
  date: string | Date;
  time?: string;
  type: "meeting" | "task" | "reminder";
  userId: string;
}

export enum ProjectStatus {
  Active = "active",
  Completed = "completed",
  Archived = "archived",
}

export interface Project extends BaseEntity {
  title: string;
  description?: string;
  status: ProjectStatus;
  priority: Priority;
  startDate?: string | number | Date;
  endDate?: string | number | Date;
  progress?: number;
  tasks?: Task[];
  members: string[];
  tags: string[];
  color?: string;
  userId: string;
  notes?: Note[];
}

export interface Note extends BaseEntity {
  title: string;
  content?: string;
  category: "work" | "personal" | "idea" | "other";
  tags: string[];
  color?: string;
  isPinned: boolean;
  relatedTaskId?: string;
  relatedProjectId?: string;
  userId: string;
}

export enum Priority {
  Low = "low",
  Medium = "medium",
  High = "high",
}

export enum Status {
  NotStarted = "not_started",
  InProgress = "in_progress",
  Completed = "completed",
  Archived = "archived",
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
  Daily = "daily",
  Weekly = "weekly",
  Monthly = "monthly",
}

export enum TimeOfDay {
  Morning = "morning",
  Afternoon = "afternoon",
  Evening = "evening",
  Anytime = "anytime",
}

export interface Habit extends BaseEntity {
  title: string;
  description?: string;
  frequency: Frequency;
  timeOfDay: TimeOfDay;
  streak: number;
  userId: string;
}

export interface HabitCompletion extends BaseEntity {
  habitId: string;
  date: string | Date;
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
  type: "goal" | "step" | "milestone" | "project" | "task";
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

export interface Theme {
  primary: string;
  background: string;
  text: string;
  secondary: string;
}
