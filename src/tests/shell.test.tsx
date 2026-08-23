import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';
import { storage } from '../utils/storage';
import { routes } from '../app/router';
import { AppProviders } from '../app/providers';

describe('Production Application Shell Test Suite', () => {
  beforeEach(() => {
    useAuthStore.getState().clearAuth();
    storage.clearRefreshToken();
  });

  it('renders navigation links and active route state inside AppShell', async () => {
    storage.setRefreshToken('mock_refresh_token');
    useAuthStore.getState().setAuth(
      { id: 1, username: 'emilys', email: 'emily.s@example.com', firstName: 'Emily', lastName: 'Johnson' },
      'mock_access_token'
    );

    const testRouter = createMemoryRouter(routes, { initialEntries: ['/dashboard'] });

    render(
      <AppProviders>
        <RouterProvider router={testRouter} />
      </AppProviders>
    );

    await waitFor(() => {
      expect(screen.getByText('SprintDesk')).toBeInTheDocument();
      expect(screen.getByText('Dashboard Overview')).toBeInTheDocument();
      expect(screen.getByText('Sprint Board')).toBeInTheDocument();
      expect(screen.getByText('Analytics')).toBeInTheDocument();
    });
  });

  it('renders authenticated user details and executes logout on logout button click', async () => {
    storage.setRefreshToken('mock_refresh_token');
    useAuthStore.getState().setAuth(
      { id: 15, username: 'emilys', email: 'emily.s@example.com', firstName: 'Emily', lastName: 'Johnson' },
      'mock_access_token'
    );

    const testRouter = createMemoryRouter(routes, { initialEntries: ['/dashboard'] });

    render(
      <AppProviders>
        <RouterProvider router={testRouter} />
      </AppProviders>
    );

    await waitFor(() => {
      expect(screen.getByText('Emily Johnson')).toBeInTheDocument();
      expect(screen.getByText('@emilys')).toBeInTheDocument();
    });

    const logoutButtons = screen.getAllByTitle('Logout');
    fireEvent.click(logoutButtons[0]);

    await waitFor(() => {
      expect(useAuthStore.getState().status).toBe('unauthenticated');
      expect(storage.getRefreshToken()).toBeNull();
      expect(screen.getByText('Sign in to your team workspace')).toBeInTheDocument();
    });
  });
});
