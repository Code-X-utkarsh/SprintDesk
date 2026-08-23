import { describe, it, expect, beforeEach } from 'vitest';
import { useBoardStore } from '../stores/useBoardStore';
import { boardStorage } from '../utils/boardStorage';
import type { Task, User, TaskComment, Sprint } from '../types';

const mockUsers: User[] = [
  { id: 1, name: 'Emily Johnson', email: 'emily@example.com', avatar: '' },
  { id: 2, name: 'Michael Williams', email: 'michael@example.com', avatar: '' },
];

const mockSprints: Sprint[] = [
  { id: 3, name: 'Sprint 3', startDate: '2026-08-17', endDate: '2026-08-28' },
];

const mockInitialTasks: Task[] = [
  {
    id: 1,
    title: 'Implement auth',
    description: 'Auth desc',
    status: 'done',
    priority: 'high',
    assigneeId: 1,
    dueDate: '2026-08-18',
    sprintId: 3,
    order: 1,
    createdAt: '2026-08-15T09:30:00Z',
    completedAt: '2026-08-18T16:20:00Z',
    updatedAt: '2026-08-18T16:20:00Z',
  },
  {
    id: 2,
    title: 'Build Kanban board',
    description: 'Board desc',
    status: 'in-progress',
    priority: 'high',
    assigneeId: 2,
    dueDate: '2026-08-22',
    sprintId: 3,
    order: 1,
    createdAt: '2026-08-15T10:00:00Z',
    completedAt: null,
    updatedAt: '2026-08-19T11:10:00Z',
  },
];

const mockComments: TaskComment[] = [
  { id: 1, taskId: 2, authorId: 1, message: 'Board basic structure ready.', createdAt: '2026-08-19T10:20:00Z' },
];

describe('Board Zustand Store Unit Test Suite', () => {
  beforeEach(() => {
    boardStorage.clearPersistedBoardState();
    useBoardStore.getState().resetBoard({
      tasks: mockInitialTasks,
      users: mockUsers,
      comments: mockComments,
      sprints: mockSprints,
    });
  });

  it('hydrates board state from initial data snapshot', () => {
    const state = useBoardStore.getState();
    expect(state.isInitialized).toBe(true);
    expect(state.tasks).toHaveLength(2);
    expect(state.users).toHaveLength(2);
  });

  it('adds a new task with generated ID and order', () => {
    const newTask = useBoardStore.getState().addTask({
      title: 'Design toast system',
      description: 'Create toast hook',
      status: 'backlog',
      priority: 'medium',
      assigneeId: 1,
      dueDate: '2026-08-25',
      sprintId: 3,
    });

    const state = useBoardStore.getState();
    expect(state.tasks).toHaveLength(3);
    expect(newTask.id).toBeDefined();
    expect(newTask.status).toBe('backlog');
    expect(newTask.order).toBe(1);
  });

  it('updates task properties and sets completedAt when moved to done', () => {
    useBoardStore.getState().updateTask(2, { status: 'done' });

    const updatedTask = useBoardStore.getState().tasks.find((t) => t.id === 2);
    expect(updatedTask?.status).toBe('done');
    expect(updatedTask?.completedAt).not.toBeNull();
  });

  it('moves task to new status column and updates task order', () => {
    // Move task 2 from 'in-progress' to 'done' at index 0
    useBoardStore.getState().moveTask(2, 'done', 0);

    const tasks = useBoardStore.getState().tasks;
    const doneTasks = tasks.filter((t) => t.status === 'done');
    expect(doneTasks).toHaveLength(2);
  });

  it('deletes task and associated comments from state', () => {
    useBoardStore.getState().deleteTask(2);

    const state = useBoardStore.getState();
    expect(state.tasks.find((t) => t.id === 2)).toBeUndefined();
    expect(state.comments.filter((c) => c.taskId === 2)).toHaveLength(0);
  });

  it('adds a new comment to a task', () => {
    useBoardStore.getState().addComment(2, 'Drag and drop works great!', 2);

    const comments = useBoardStore.getState().comments.filter((c) => c.taskId === 2);
    expect(comments).toHaveLength(2);
    expect(comments[1].message).toBe('Drag and drop works great!');
  });

  it('falls back to default initial data if localStorage contains malformed state', () => {
    localStorage.setItem('sprintdesk_board_state_v1', JSON.stringify({ tasks: 'invalid_string' }));

    useBoardStore.getState().hydrateBoard({
      tasks: mockInitialTasks,
      users: mockUsers,
      comments: mockComments,
      sprints: mockSprints,
    });

    const state = useBoardStore.getState();
    expect(state.tasks).toHaveLength(2);
    expect(state.tasks[0].title).toBe('Implement auth');
  });
});
