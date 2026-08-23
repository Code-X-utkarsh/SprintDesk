import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { TaskService, type BoardDataPayload } from '../services/taskService';
import { useBoardStore } from '../stores/useBoardStore';

/**
 * TanStack Query Hook loading initial board dataset and hydrating useBoardStore.
 */
export function useBoardData() {
  const { isInitialized, hydrateBoard } = useBoardStore();

  const query = useQuery<BoardDataPayload, Error>({
    queryKey: ['boardData'],
    queryFn: () => TaskService.getBoardData(),
    staleTime: 1000 * 60 * 15, // 15 minutes
  });

  useEffect(() => {
    if (query.data && !isInitialized) {
      hydrateBoard(query.data);
    }
  }, [query.data, isInitialized, hydrateBoard]);

  return {
    ...query,
    isBoardReady: isInitialized || Boolean(query.data),
  };
}
