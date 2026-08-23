import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '../services/authService';
import { useAuthStore } from '../stores/useAuthStore';
import type { LoginCredentials, AuthUser } from '../types/auth';

/**
 * TanStack Query Mutation hook for user authentication.
 */
export function useLoginMutation() {
  const navigate = useNavigate();

  return useMutation<AuthUser, Error, LoginCredentials>({
    mutationFn: (credentials: LoginCredentials) => AuthService.login(credentials),
    onSuccess: () => {
      // Navigate to authenticated application dashboard on successful login
      navigate('/dashboard', { replace: true });
    },
  });
}

/**
 * Custom React Hook exposing authentication state and actions.
 */
export function useAuth() {
  const navigate = useNavigate();
  const {
    user,
    accessToken,
    status,
    error,
    isSimulatedExpired,
    toggleSimulatedExpired,
    setError,
  } = useAuthStore();

  const isAuthenticated = status === 'authenticated' && Boolean(user && accessToken);
  const isInitializing = status === 'initializing';

  const logout = () => {
    AuthService.logout();
    navigate('/login', { replace: true });
  };

  return {
    user,
    accessToken,
    status,
    error,
    isAuthenticated,
    isInitializing,
    logout,
    setError,
    isSimulatedExpired,
    toggleSimulatedExpired,
  };
}
