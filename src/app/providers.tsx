import React, { useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../queries/queryClient';
import { AuthService } from '../services/authService';
import { ToastContainer } from '../components/ui/ToastContainer';
import { useNotificationPolling } from '../hooks/useNotificationPolling';

interface AppProvidersProps {
  children: React.ReactNode;
}

const NotificationPollingInitializer: React.FC = () => {
  useNotificationPolling();
  return null;
};

/**
 * Root Application Providers Wrapper
 * - Manages QueryClientProvider instance
 * - Triggers initial session validation on application startup
 * - Renders app-wide toast notifications portal
 * - Initializes real-time notification polling & tab visibility control
 */
export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  useEffect(() => {
    // Validate stored refresh token session on application load
    AuthService.validateSession();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ToastContainer />
      <NotificationPollingInitializer />
      {children}
    </QueryClientProvider>
  );
};
