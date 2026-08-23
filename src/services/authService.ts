import { apiClient, executeTokenRefresh } from './apiClient';
import { useAuthStore } from '../stores/useAuthStore';
import { storage } from '../utils/storage';
import type { AuthUser, LoginCredentials, LoginResponse } from '../types/auth';

/**
 * High-Level Authentication Service
 * Encapsulates authentication workflows and translates API responses to domain entities.
 */
export const AuthService = {
  /**
   * Authenticates a user with username and password against DummyJSON.
   */
  async login(credentials: LoginCredentials): Promise<AuthUser> {
    useAuthStore.getState().setError(null);

    try {
      const response = await apiClient<LoginResponse>('/auth/login', {
        method: 'POST',
        skipAuth: true,
        body: JSON.stringify({
          username: credentials.username.trim(),
          password: credentials.password,
          expiresInMins: credentials.expiresInMins || 30,
        }),
      });

      const { accessToken, refreshToken, ...user } = response;

      // 1. Persist refresh token in localStorage via storage helper
      storage.setRefreshToken(refreshToken);

      // 2. Store in-memory access token and user profile in Zustand auth store
      useAuthStore.getState().setAuth(user, accessToken);

      return user;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Invalid credentials or login failure';
      useAuthStore.getState().setError(errorMessage);
      throw new Error(errorMessage);
    }
  },

  /**
   * Fetches current authenticated user profile using active Bearer token.
   */
  async getCurrentUser(): Promise<AuthUser> {
    return apiClient<AuthUser>('/auth/me', {
      method: 'GET',
    });
  },

  /**
   * Validates stored session on application initialization.
   * Performs silent refresh if a valid refresh token exists in localStorage.
   */
  async validateSession(): Promise<boolean> {
    const { status, accessToken, setStatus, setAuth, clearAuth } = useAuthStore.getState();

    // If already authenticated with an in-memory access token, preserve active session
    if (accessToken && status === 'authenticated') {
      return true;
    }

    setStatus('initializing');

    const refreshToken = storage.getRefreshToken();
    if (!refreshToken) {
      clearAuth();
      return false;
    }

    try {
      // 1. Attempt token refresh to obtain a fresh access token
      const accessToken = await executeTokenRefresh();

      // 2. Fetch authenticated user profile
      const user = await AuthService.getCurrentUser();

      // 3. Update auth store to authenticated state
      setAuth(user, accessToken);
      return true;
    } catch (err) {
      console.warn('Initial session restoration failed:', err);
      AuthService.logout();
      return false;
    }
  },

  /**
   * Logs out the user and clears all stored session data.
   */
  logout(): void {
    storage.clearRefreshToken();
    useAuthStore.getState().clearAuth();
  },
};
