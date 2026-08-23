import type { Task, TaskComment } from '../types';

const BOARD_STORAGE_KEY = 'sprintdesk_board_state_v1';

export interface PersistedBoardState {
  tasks: Task[];
  comments: TaskComment[];
  version: number;
}

export const boardStorage = {
  /**
   * Retrieves and validates persisted board state from localStorage.
   * Returns null if state is missing, invalid, or corrupted.
   */
  getPersistedBoardState(): { tasks: Task[]; comments: TaskComment[] } | null {
    try {
      const raw = localStorage.getItem(BOARD_STORAGE_KEY);
      if (!raw) return null;

      const parsed: unknown = JSON.parse(raw);

      // Schema validation guard against corrupted localStorage
      if (
        typeof parsed !== 'object' ||
        parsed === null ||
        !('tasks' in parsed) ||
        !Array.isArray((parsed as Record<string, unknown>).tasks)
      ) {
        console.warn('Malformed board storage schema detected. Falling back to default mock dataset.');
        return null;
      }

      const tasks = (parsed as Record<string, unknown>).tasks as Task[];
      const comments = Array.isArray((parsed as Record<string, unknown>).comments)
        ? ((parsed as Record<string, unknown>).comments as TaskComment[])
        : [];

      // Validate essential task fields
      const isValid = tasks.every(
        (t) =>
          typeof t === 'object' &&
          t !== null &&
          typeof t.id === 'number' &&
          typeof t.title === 'string' &&
          typeof t.status === 'string'
      );

      if (!isValid) {
        console.warn('Invalid task records in local storage. Resetting to initial mock dataset.');
        return null;
      }

      return { tasks, comments };
    } catch (err) {
      console.warn('Failed to read board state from localStorage:', err);
      return null;
    }
  },

  /**
   * Persists current board state snapshot to localStorage.
   */
  savePersistedBoardState(data: { tasks: Task[]; comments: TaskComment[] }): void {
    try {
      const payload: PersistedBoardState = {
        tasks: data.tasks,
        comments: data.comments,
        version: 1,
      };
      localStorage.setItem(BOARD_STORAGE_KEY, JSON.stringify(payload));
    } catch (err) {
      console.error('Failed to save board state to localStorage:', err);
    }
  },

  /**
   * Clears persisted board state.
   */
  clearPersistedBoardState(): void {
    try {
      localStorage.removeItem(BOARD_STORAGE_KEY);
    } catch (err) {
      console.error('Failed to clear board state from localStorage:', err);
    }
  },
};
