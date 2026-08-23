import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';
import { storage } from '../utils/storage';
import { apiClient } from '../services/apiClient';
import { routes } from '../app/router';
import { AppProviders } from '../app/providers';

// Mock global fetch for API tests
const originalFetch = globalThis.fetch;

describe('Authentication Unit & Integration Test Suite', () => {
  beforeEach(() => {
    // Reset Zustand store state
    useAuthStore.getState().clearAuth();
    storage.clearRefreshToken();
    vi.restoreAllMocks();
  });

  describe('Storage Abstraction Helper', () => {
    it('persists, retrieves, and clears refresh token cleanly', () => {
      expect(storage.getRefreshToken()).toBeNull();

      storage.setRefreshToken('sample_refresh_token_123');
      expect(storage.getRefreshToken()).toBe('sample_refresh_token_123');

      storage.clearRefreshToken();
      expect(storage.getRefreshToken()).toBeNull();
    });
  });

  describe('Zustand Auth Store', () => {
    it('establishes authenticated state on setAuth', () => {
      const mockUser = {
        id: 1,
        username: 'emilys',
        email: 'emily.s@example.com',
        firstName: 'Emily',
        lastName: 'Johnson',
      };

      useAuthStore.getState().setAuth(mockUser, 'mock_access_token_xyz');

      const state = useAuthStore.getState();
      expect(state.status).toBe('authenticated');
      expect(state.user).toEqual(mockUser);
      expect(state.accessToken).toBe('mock_access_token_xyz');
    });

    it('clears all authentication state on clearAuth', () => {
      useAuthStore.getState().setAuth(
        { id: 1, username: 'test', email: 'test@test.com', firstName: 'T', lastName: 'U' },
        'token_123'
      );

      useAuthStore.getState().clearAuth();

      const state = useAuthStore.getState();
      expect(state.status).toBe('unauthenticated');
      expect(state.user).toBeNull();
      expect(state.accessToken).toBeNull();
    });
  });

  describe('API Client & 401 Interceptor', () => {
    it('attaches Bearer token to requests when access token is present in memory', async () => {
      useAuthStore.getState().setAuth(
        { id: 1, username: 'emilys', email: 'e@e.com', firstName: 'E', lastName: 'J' },
        'my_valid_bearer_token'
      );

      const fetchSpy = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ success: true }),
      });
      globalThis.fetch = fetchSpy;

      await apiClient('/test-endpoint');

      expect(fetchSpy).toHaveBeenCalledTimes(1);
      const requestHeaders = fetchSpy.mock.calls[0][1].headers;
      expect(requestHeaders.get('Authorization')).toBe('Bearer my_valid_bearer_token');

      globalThis.fetch = originalFetch;
    });

    it('triggers silent refresh on 401 response and retries original request once', async () => {
      storage.setRefreshToken('valid_refresh_token');
      useAuthStore.getState().setAuth(
        { id: 1, username: 'emilys', email: 'e@e.com', firstName: 'E', lastName: 'J' },
        'expired_token'
      );

      let callCount = 0;
      globalThis.fetch = vi.fn().mockImplementation(async (url: string) => {
        callCount++;
        if (url.includes('/auth/refresh')) {
          return {
            ok: true,
            status: 200,
            json: async () => ({
              accessToken: 'new_fresh_token_777',
              refreshToken: 'rotated_refresh_token_888',
            }),
          };
        }

        // First attempt returns 401, second attempt (retry) succeeds
        if (callCount === 1) {
          return {
            ok: false,
            status: 401,
            json: async () => ({ message: 'Token expired' }),
          };
        }

        return {
          ok: true,
          status: 200,
          json: async () => ({ data: 'retry_success' }),
        };
      });

      const result = await apiClient<{ data: string }>('/protected-data');

      expect(result).toEqual({ data: 'retry_success' });
      expect(useAuthStore.getState().accessToken).toBe('new_fresh_token_777');
      expect(storage.getRefreshToken()).toBe('rotated_refresh_token_888');

      globalThis.fetch = originalFetch;
    });

    it('clears session and logs out user if refresh request fails', async () => {
      storage.setRefreshToken('invalid_refresh_token');
      useAuthStore.getState().setAuth(
        { id: 1, username: 'emilys', email: 'e@e.com', firstName: 'E', lastName: 'J' },
        'expired_token'
      );

      globalThis.fetch = vi.fn().mockImplementation(async (url: string) => {
        if (url.includes('/auth/refresh')) {
          return {
            ok: false,
            status: 401,
            json: async () => ({ message: 'Invalid refresh token' }),
          };
        }
        return {
          ok: false,
          status: 401,
          json: async () => ({ message: 'Token expired' }),
        };
      });

      await expect(apiClient('/protected-data')).rejects.toThrow();

      expect(useAuthStore.getState().status).toBe('unauthenticated');
      expect(storage.getRefreshToken()).toBeNull();

      globalThis.fetch = originalFetch;
    });
  });

  describe('Route Guards & Access Control', () => {
    it('redirects unauthenticated user trying to access /dashboard to /login', async () => {
      useAuthStore.getState().setStatus('unauthenticated');

      const testRouter = createMemoryRouter(routes, { initialEntries: ['/dashboard'] });

      render(
        <AppProviders>
          <RouterProvider router={testRouter} />
        </AppProviders>
      );

      await waitFor(() => {
        expect(screen.getByText('Sign in to your team workspace')).toBeInTheDocument();
      });
    });

    it('redirects authenticated user trying to access /login to /dashboard', async () => {
      storage.setRefreshToken('valid_refresh_token');
      useAuthStore.getState().setAuth(
        { id: 1, username: 'emilys', email: 'e@e.com', firstName: 'Emily', lastName: 'Johnson' },
        'valid_access_token'
      );

      const testRouter = createMemoryRouter(routes, { initialEntries: ['/login'] });

      render(
        <AppProviders>
          <RouterProvider router={testRouter} />
        </AppProviders>
      );

      await waitFor(() => {
        expect(screen.getByText('Dashboard Overview')).toBeInTheDocument();
      });
    });
  });
});
