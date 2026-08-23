import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { NotificationService } from '../services/notificationService';
import { useNotificationStore } from '../stores/useNotificationStore';
import { useToast } from './useToast';

const POLLING_INTERVAL_MS = 20000; // 20 seconds

export function useNotificationPolling() {
  const [isTabVisible, setIsTabVisible] = useState<boolean>(
    typeof document !== 'undefined' ? document.visibilityState === 'visible' : true
  );

  const { isInitialized, hydrateNotifications, addNotifications, isPanelOpen } = useNotificationStore();
  const { toast } = useToast();

  // Hydrate store from mock-data initial dataset on mount if needed
  useEffect(() => {
    if (!isInitialized) {
      NotificationService.getInitialNotifications().then((initialData) => {
        hydrateNotifications(initialData);
      });
    }
  }, [isInitialized, hydrateNotifications]);

  // Tab Visibility change listener
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const handleVisibilityChange = () => {
      const visible = document.visibilityState === 'visible';
      setIsTabVisible(visible);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // TanStack Query for background polling
  const query = useQuery({
    queryKey: ['notificationPolling'],
    queryFn: () => NotificationService.fetchPolledPosts(),
    refetchInterval: isTabVisible ? POLLING_INTERVAL_MS : false,
    refetchOnWindowFocus: true,
    enabled: isInitialized,
  });

  // Process polled notifications when query succeeds
  useEffect(() => {
    if (query.data && query.data.length > 0 && isInitialized) {
      const newlyAdded = addNotifications(query.data, isPanelOpen);

      // Trigger toast ONLY when panel is closed
      if (newlyAdded.length > 0 && !isPanelOpen) {
        const latest = newlyAdded[0];
        toast.info('New Activity Alert', latest.title);
      }
    }
  }, [query.data, isInitialized, addNotifications, isPanelOpen, toast]);

  return {
    isPollingActive: isTabVisible,
    isTabVisible,
    refetchNotifications: query.refetch,
  };
}
