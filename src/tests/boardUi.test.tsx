import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { useBoardStore } from '../stores/useBoardStore';
import { useAuthStore } from '../stores/useAuthStore';
import { boardStorage } from '../utils/boardStorage';
import { routes } from '../app/router';
import { AppProviders } from '../app/providers';
import type { Task, User, TaskComment, Sprint } from '../types';

const mockUsers: User[] = [
  { id: 1, name: 'Emily Johnson', email: 'emily@example.com', avatar: '' },
  { id: 2, name: 'Michael Williams', email: 'michael@example.com', avatar: '' },
];

const mockSprints: Sprint[] = [
  { id: 3, name: 'Sprint 3', startDate: '2026-08-17', endDate: '2026-08-28' },
];

const mockTasks: Task[] = [
  {
    id: 101,
    title: 'Alpha Board Task',
    description: 'Alpha task description',
    status: 'backlog',
    priority: 'high',
    assigneeId: 1,
    dueDate: '2026-08-25',
    sprintId: 3,
    order: 1,
    createdAt: '2026-08-15T09:30:00Z',
    completedAt: null,
    updatedAt: '2026-08-15T09:30:00Z',
  },
  {
    id: 102,
    title: 'Beta Board Task',
    description: 'Beta task description',
    status: 'in-progress',
    priority: 'medium',
    assigneeId: 2,
    dueDate: '2026-08-26',
    sprintId: 3,
    order: 1,
    createdAt: '2026-08-15T10:00:00Z',
    completedAt: null,
    updatedAt: '2026-08-15T10:00:00Z',
  },
];

const mockComments: TaskComment[] = [
  { id: 1, taskId: 101, authorId: 1, message: 'Initial comment on Alpha task.', createdAt: '2026-08-19T10:20:00Z' },
];

describe('Board UI & Task Details Integration Test Suite', () => {
  beforeEach(() => {
    boardStorage.clearPersistedBoardState();
    useAuthStore.getState().setAuth(
      { id: 1, username: 'emilys', email: 'emily@example.com', firstName: 'Emily', lastName: 'Johnson' },
      'mock_token'
    );
    useBoardStore.getState().resetBoard({
      tasks: mockTasks,
      users: mockUsers,
      comments: mockComments,
      sprints: mockSprints,
    });
  });

  it('renders 4 Kanban columns and displays task title cards', async () => {
    const testRouter = createMemoryRouter(routes, { initialEntries: ['/board'] });

    render(
      <AppProviders>
        <RouterProvider router={testRouter} />
      </AppProviders>
    );

    await waitFor(() => {
      expect(screen.getByText('Backlog')).toBeInTheDocument();
      expect(screen.getByText('In Progress')).toBeInTheDocument();
      expect(screen.getByText('Review')).toBeInTheDocument();
      expect(screen.getByText('Done')).toBeInTheDocument();
      expect(screen.getByText('Alpha Board Task')).toBeInTheDocument();
      expect(screen.getByText('Beta Board Task')).toBeInTheDocument();
    });
  });

  it('opens task drawer when task card title is clicked', async () => {
    const testRouter = createMemoryRouter(routes, { initialEntries: ['/board'] });

    render(
      <AppProviders>
        <RouterProvider router={testRouter} />
      </AppProviders>
    );

    await waitFor(() => {
      expect(screen.getByText('Alpha Board Task')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Alpha Board Task'));

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Initial comment on Alpha task.')).toBeInTheDocument();
    });
  });

  it('allows adding a new comment in task drawer', async () => {
    useBoardStore.getState().openDrawer(101);

    const testRouter = createMemoryRouter(routes, { initialEntries: ['/board'] });

    render(
      <AppProviders>
        <RouterProvider router={testRouter} />
      </AppProviders>
    );

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Add a comment...')).toBeInTheDocument();
    });

    const commentInput = screen.getByPlaceholderText('Add a comment...');
    fireEvent.change(commentInput, { target: { value: 'New test comment posted!' } });
    fireEvent.click(screen.getByRole('button', { name: 'Post' }));

    await waitFor(() => {
      expect(screen.getByText('New test comment posted!')).toBeInTheDocument();
    });
  });

  it('triggers delete confirmation modal and removes task on confirmation', async () => {
    useBoardStore.getState().openDrawer(101);

    const testRouter = createMemoryRouter(routes, { initialEntries: ['/board'] });

    render(
      <AppProviders>
        <RouterProvider router={testRouter} />
      </AppProviders>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
    });

    // Click delete inside drawer
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));

    await waitFor(() => {
      expect(screen.getByText('Delete Task Confirmation')).toBeInTheDocument();
    });

    // Click Confirm Delete Permanently
    fireEvent.click(screen.getByRole('button', { name: 'Delete Permanently' }));

    await waitFor(() => {
      expect(useBoardStore.getState().tasks.find((t) => t.id === 101)).toBeUndefined();
    });
  });

  it('opens task creation modal and adds new task to board', async () => {
    const testRouter = createMemoryRouter(routes, { initialEntries: ['/board'] });

    render(
      <AppProviders>
        <RouterProvider router={testRouter} />
      </AppProviders>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Create Task' })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Create Task' }));

    await waitFor(() => {
      expect(screen.getByText('Create New Sprint Task')).toBeInTheDocument();
    });

    const titleInput = screen.getByLabelText(/Task Title/i);
    fireEvent.change(titleInput, { target: { value: 'Newly Created Task' } });

    const submitButtons = screen.getAllByRole('button', { name: 'Create Task' });
    fireEvent.click(submitButtons[submitButtons.length - 1]);

    await waitFor(() => {
      expect(screen.getByText('Newly Created Task')).toBeInTheDocument();
    });
  });
});
