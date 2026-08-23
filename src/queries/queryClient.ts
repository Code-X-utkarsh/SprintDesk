import { QueryClient } from '@tanstack/react-query';

/**
 * Global TanStack Query v5 Client Instance
 * Configured with production defaults for caching and refetching.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 15, // 15 minutes (formerly cacheTime in v4)
      refetchOnWindowFocus: false,
      retry: 1,
    },
    mutations: {
      retry: 0,
    },
  },
});
