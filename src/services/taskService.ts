import { ApiService } from './api';
import type { Task, User, TaskComment, Sprint } from '../types';

export interface BoardDataPayload {
  tasks: Task[];
  users: User[];
  comments: TaskComment[];
  sprints: Sprint[];
}

export const TaskService = {
  /**
   * Fetches initial board data snapshot from official dataset.
   */
  async getBoardData(): Promise<BoardDataPayload> {
    const response = await ApiService.getMockData();
    const data = response.data;

    // Take the first 30 tasks as required by the assessment specification
    const initialTasks = data.tasks.slice(0, 30);

    return {
      tasks: initialTasks,
      users: data.users,
      comments: data.comments,
      sprints: data.sprints,
    };
  },
};
