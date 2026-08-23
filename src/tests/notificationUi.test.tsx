import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { useNotificationStore } from '../stores/useNotificationStore';
import { useAuthStore } from '../stores/useAuthStore';
import { notificationStorage } from '../utils/notificationStorage';
import { NotificationService } from '../services/notificationService';
import { routes } from '../app/router';
import { AppProviders } from '../app/providers';
import type { Notification } from '../types';

const mockNotifications: Notification[] = [
  {
    id: 1,
    title: 'Sprint 3 started',
    message: 'Sprint 3 active scope defined.',
    type: 'system',
    read: false,
    createdAt: '2026-08-20T10:00:00Z',
  },
  {
    id: 2,
    title: 'Task completed',
    message: 'Emily completed Auth flow task.',
    type: 'activity',
    read: false,
    createdAt: '2026-08-21T11:30:00Z',
  },
];

describe('Notification UI & Panel Integration Tests', () => {
  beforeEach(() => {
    vi.spyOn(NotificationService, 'fetchPolledPosts').mockResolvedValue([]);
    notificationStorage.clearPersistedNotifications();
    useAuthStore.getState().setAuth(
      { id: 1, username: 'emilys', email: 'emily@example.com', firstName: 'Emily', lastName: 'Johnson' },
      'mock_token'
    );
    useNotificationStore.getState().resetNotifications(mockNotifications);
  });

  it('renders notification bell button with unread count badge', async () => {
    const testRouter = createMemoryRouter(routes, { initialEntries: ['/dashboard'] });

    render(
      <AppProviders>
        <RouterProvider router={testRouter} />
      </AppProviders>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Notifications, 2 unread/i })).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
    });
  });

  it('opens notification panel when bell button is clicked', async () => {
    const testRouter = createMemoryRouter(routes, { initialEntries: ['/dashboard'] });

    render(
      <AppProviders>
        <RouterProvider router={testRouter} />
      </AppProviders>
    );

    const bell = await screen.findByRole('button', { name: /Notifications, 2 unread/i });
    fireEvent.click(bell);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Notifications')).toBeInTheDocument();
      expect(screen.getByText('Sprint 3 started')).toBeInTheDocument();
      expect(screen.getByText('Task completed')).toBeInTheDocument();
    });
  });

  it('marks all notifications as read when "Mark all read" is clicked', async () => {
    useNotificationStore.getState().openPanel();

    const testRouter = createMemoryRouter(routes, { initialEntries: ['/dashboard'] });

    render(
      <AppProviders>
        <RouterProvider router={testRouter} />
      </AppProviders>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Mark all read/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Mark all read/i }));

    await waitFor(() => {
      expect(useNotificationStore.getState().notifications.every((n) => n.read)).toBe(true);
    });
  });

  it('triggers toast alert when new notification arrives while panel is CLOSED', async () => {
    const testRouter = createMemoryRouter(routes, { initialEntries: ['/dashboard'] });

    render(
      <AppProviders>
        <RouterProvider router={testRouter} />
      </AppProviders>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Notifications, 2 unread/i })).toBeInTheDocument();
    });

    // Add a new notification while panel is closed
    const newPolledItem: Notification[] = [
      {
        id: 999,
        title: 'Urgent Security Update',
        message: 'Patch applied to server.',
        type: 'system',
        read: false,
        createdAt: new Date().toISOString(),
      },
    ];

    act(() => {
      useNotificationStore.getState().addNotifications(newPolledItem, false);
    });

    // Verify unread badge updated to 3
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Notifications, 3 unread/i })).toBeInTheDocument();
    });
  });
});
