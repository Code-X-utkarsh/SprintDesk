import { useAuthStore } from '../stores/useAuthStore';
import { storage } from '../utils/storage';
import type { RefreshResponse } from '../types/auth';

const DUMMY_JSON_BASE_URL = 'https://dummyjson.com';

interface RequestOptions extends RequestInit {
  _isRetry?: boolean;
  skipAuth?: boolean;
}

// Single-flight promise variable to prevent concurrent refresh request storms
let singleFlightRefreshPromise: Promise<string> | null = null;

/**
 * Executes token refresh against DummyJSON auth endpoint.
 * Isolated function used by the interceptor to prevent circular dependencies.
 */
export async function executeTokenRefresh(): Promise<string> {
  const refreshToken = storage.getRefreshToken();
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  const response = await fetch(`${DUMMY_JSON_BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      refreshToken,
      expiresInMins: 30,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Token refresh failed');
  }

  const data: RefreshResponse = await response.json();
  
  // Update in-memory access token in Zustand
  useAuthStore.getState().setAccessToken(data.accessToken);

  // Persist rotated refresh token if provided
  if (data.refreshToken) {
    storage.setRefreshToken(data.refreshToken);
  }

  return data.accessToken;
}

/**
 * Centralized Typed Fetch Client with Auth Interceptor
 * - Automatically attaches Bearer token from in-memory state
 * - Supports simulated access-token expiration for dev/interview testing
 * - Performs single-flight silent refresh on 401 responses
 * - Retries failed original request once
 * - Prevents infinite refresh recursion loops
 */
export async function apiClient<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { skipAuth = false, _isRetry = false, ...fetchOptions } = options;
  const url = endpoint.startsWith('http') ? endpoint : `${DUMMY_JSON_BASE_URL}${endpoint}`;

  // Prepare headers object
  const headers = new Headers(fetchOptions.headers || {});
  if (!headers.has('Content-Type') && fetchOptions.body && typeof fetchOptions.body === 'string') {
    headers.set('Content-Type', 'application/json');
  }

  const { accessToken, isSimulatedExpired, setSimulatedExpired } = useAuthStore.getState();

  // Handle Bearer Token Attachment & Simulated Expiration
  if (!skipAuth) {
    if (isSimulatedExpired && !_isRetry) {
      // Simulate expired token by attaching an invalid token and clearing simulation state for retry
      headers.set('Authorization', 'Bearer EXPIRED_SIMULATED_TOKEN');
      setSimulatedExpired(false);
    } else if (accessToken) {
      headers.set('Authorization', `Bearer ${accessToken}`);
    }
  }

  const response = await fetch(url, {
    ...fetchOptions,
    headers,
  });

  // Interceptor: Handle 401 Unauthorized responses
  if (response.status === 401 && !skipAuth) {
    // Infinite refresh recursion guard
    if (_isRetry) {
      useAuthStore.getState().clearAuth();
      storage.clearRefreshToken();
      throw new Error('Session expired. Please log in again.');
    }

    try {
      // Single-flight refresh: ensure only one refresh request executes concurrently
      if (!singleFlightRefreshPromise) {
        singleFlightRefreshPromise = executeTokenRefresh().finally(() => {
          singleFlightRefreshPromise = null;
        });
      }

      const newAccessToken = await singleFlightRefreshPromise;

      // Retry original request ONCE with new access token
      const retryHeaders = new Headers(fetchOptions.headers || {});
      if (!retryHeaders.has('Content-Type') && fetchOptions.body && typeof fetchOptions.body === 'string') {
        retryHeaders.set('Content-Type', 'application/json');
      }
      retryHeaders.set('Authorization', `Bearer ${newAccessToken}`);

      return apiClient<T>(endpoint, {
        ...options,
        _isRetry: true,
        headers: retryHeaders,
      });
    } catch (refreshErr) {
      // Refresh failed: clear auth state & storage to trigger logout
      useAuthStore.getState().clearAuth();
      storage.clearRefreshToken();
      throw new Error(refreshErr instanceof Error ? refreshErr.message : 'Authentication refresh failed');
    }
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData.message || `API Error: ${response.status} ${response.statusText}`;
    throw new Error(message);
  }

  // Handle empty responses (e.g. 204 No Content)
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}
