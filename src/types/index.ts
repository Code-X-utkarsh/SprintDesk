export * from './auth';

/**
 * Domain Model Definitions for SprintDesk
 * Strictly aligns with official mock-data.json structure.
 */

export interface User {
  id: number;
  name: string;
  email: string;
  avatar: string;
}

export interface Sprint {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
}

export type TaskStatus = 'backlog' | 'in-progress' | 'review' | 'done';

export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: number;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId: number;
  dueDate: string;
  sprintId: number;
  order: number;
  createdAt: string;
  completedAt: string | null;
  updatedAt: string;
}

export interface TaskComment {
  id: number;
  taskId: number;
  authorId: number;
  message: string;
  createdAt: string;
}

export type NotificationType = 'task' | 'review' | 'system' | 'activity';

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt: string;
}

export interface MockData {
  users: User[];
  sprints: Sprint[];
  tasks: Task[];
  comments: TaskComment[];
  notifications: Notification[];
}

/**
 * Common API Response abstraction wrapper
 */
export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}
