import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { App } from '../app/App';
import { useAuthStore } from '../stores/useAuthStore';
import { storage } from '../utils/storage';

describe('SprintDesk Application Setup & Auth Guard Integration', () => {
  beforeEach(() => {
    useAuthStore.getState().clearAuth();
    storage.clearRefreshToken();
  });

  it('renders sign-in workspace screen when unauthenticated', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText('SprintDesk')).toBeInTheDocument();
      expect(screen.getByText('Sign in to your team workspace')).toBeInTheDocument();
    });
  });

  it('renders dashboard overview when user is authenticated', async () => {
    storage.setRefreshToken('valid_mock_refresh');
    useAuthStore.getState().setAuth(
      { id: 1, username: 'emilys', email: 'e@e.com', firstName: 'Emily', lastName: 'Johnson' },
      'valid_mock_access'
    );

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('SprintDesk')).toBeInTheDocument();
      expect(screen.getByText('Dashboard Overview')).toBeInTheDocument();
    });
  });
});
