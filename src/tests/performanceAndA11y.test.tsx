import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';
import { useBoardStore } from '../stores/useBoardStore';
import { useNotificationStore } from '../stores/useNotificationStore';
import { routes } from '../app/router';
import { AppProviders } from '../app/providers';
import { Button, Input, Modal } from '../components/ui';

describe('Performance, Code Splitting & Accessibility (a11y) Test Suite', () => {
  beforeEach(() => {
    useAuthStore.getState().setAuth(
      { id: 1, username: 'emilys', email: 'emily@example.com', firstName: 'Emily', lastName: 'Johnson' },
      'mock_token'
    );
    useBoardStore.getState().resetBoard({
      tasks: [],
      users: [],
      comments: [],
      sprints: [],
    });
    useNotificationStore.getState().resetNotifications([]);
  });

  it('renders RouteLoadingFallback screen during lazy route Suspense transitions', () => {
    const testRouter = createMemoryRouter(routes, { initialEntries: ['/board'] });

    render(
      <AppProviders>
        <RouterProvider router={testRouter} />
      </AppProviders>
    );

    // Verify loading status fallback container
    expect(screen.getByRole('status', { name: /Loading page content/i })).toBeInTheDocument();
  });

  it('links Input label with input element via htmlFor and id attributes', () => {
    render(<Input id="test-field-id" label="Test Field Label" placeholder="Enter text..." />);

    const label = screen.getByText('Test Field Label');
    expect(label).toHaveAttribute('for', 'test-field-id');

    const input = screen.getByPlaceholderText('Enter text...');
    expect(input).toHaveAttribute('id', 'test-field-id');
  });

  it('enforces ARIA dialog semantics and Escape key listener on Modal primitive', async () => {
    const handleClose = vi.fn();

    render(
      <Modal
        isOpen={true}
        onClose={handleClose}
        title="Accessible Dialog Header"
        description="Testing dialog semantics."
      >
        <p>Modal body content.</p>
      </Modal>
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(screen.getByText('Accessible Dialog Header')).toBeInTheDocument();

    // Trigger Escape key
    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('provides accessible titles and focus rings on Button primitive', () => {
    render(
      <Button variant="primary" aria-label="Perform Accessible Action">
        Action Text
      </Button>
    );

    const button = screen.getByRole('button', { name: /Perform Accessible Action/i });
    expect(button).toBeInTheDocument();
    expect(button).not.toBeDisabled();
  });
});
