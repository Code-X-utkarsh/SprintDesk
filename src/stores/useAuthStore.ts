import { create } from 'zustand';
import type { AuthState, AuthUser, AuthStatus } from '../types/auth';

interface AuthStoreActions {
  setAuth: (user: AuthUser, accessToken: string) => void;
  setAccessToken: (accessToken: string) => void;
  setStatus: (status: AuthStatus) => void;
  setError: (error: string | null) => void;
  setSimulatedExpired: (expired: boolean) => void;
  toggleSimulatedExpired: () => void;
  clearAuth: () => void;
}

type AuthStore = AuthState & AuthStoreActions;

/**
 * Global Client Authentication Store (Zustand)
 * Maintains in-memory accessToken, user profile, and authentication status.
 * Access tokens are NEVER persisted to localStorage.
 */
export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  accessToken: null,
  status: 'initializing',
  error: null,
  isSimulatedExpired: false,

  setAuth: (user, accessToken) =>
    set({
      user,
      accessToken,
      status: 'authenticated',
      error: null,
    }),

  setAccessToken: (accessToken) =>
    set({
      accessToken,
      status: 'authenticated',
      error: null,
    }),

  setStatus: (status) => set({ status }),

  setError: (error) => set({ error }),

  setSimulatedExpired: (isSimulatedExpired) => set({ isSimulatedExpired }),

  toggleSimulatedExpired: () =>
    set((state) => ({ isSimulatedExpired: !state.isSimulatedExpired })),

  clearAuth: () =>
    set({
      user: null,
      accessToken: null,
      status: 'unauthenticated',
      error: null,
      isSimulatedExpired: false,
    }),
}));
