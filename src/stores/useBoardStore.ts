import { create } from 'zustand';
import type { Task, User, TaskComment, Sprint, TaskStatus } from '../types';
import { boardStorage } from '../utils/boardStorage';

export interface BoardStoreState {
  tasks: Task[];
  users: User[];
  comments: TaskComment[];
  sprints: Sprint[];
  selectedTaskId: number | null;
  isDrawerOpen: boolean;
  isCreateModalOpen: boolean;
  isDeleteModalOpen: boolean;
  isInitialized: boolean;
}

export interface BoardStoreActions {
  hydrateBoard: (data: { tasks: Task[]; users: User[]; comments: TaskComment[]; sprints: Sprint[] }) => void;
  moveTask: (taskId: number, targetStatus: TaskStatus, targetIndex: number) => void;
  addTask: (taskInput: Omit<Task, 'id' | 'order' | 'createdAt' | 'updatedAt' | 'completedAt'>) => Task;
  updateTask: (taskId: number, updates: Partial<Task>) => void;
  deleteTask: (taskId: number) => void;
  addComment: (taskId: number, message: string, authorId: number) => void;
  resetBoard: (initialData?: { tasks: Task[]; users: User[]; comments: TaskComment[]; sprints: Sprint[] }) => void;
  
  openDrawer: (taskId: number) => void;
  closeDrawer: () => void;
  openCreateModal: () => void;
  closeCreateModal: () => void;
  openDeleteModal: () => void;
  closeDeleteModal: () => void;
}

type BoardStore = BoardStoreState & BoardStoreActions;

/**
 * Dedicated Zustand Store for Sprint Board & Task Management
 * Manages board state, drag reordering, status transitions, task CRUD, and comments.
 */
export const useBoardStore = create<BoardStore>((set, get) => ({
  tasks: [],
  users: [],
  comments: [],
  sprints: [],
  selectedTaskId: null,
  isDrawerOpen: false,
  isCreateModalOpen: false,
  isDeleteModalOpen: false,
  isInitialized: false,

  hydrateBoard: (data) => {
    // Check for valid persisted state snapshot
    const persisted = boardStorage.getPersistedBoardState();

    if (persisted && persisted.tasks.length > 0) {
      set({
        tasks: persisted.tasks,
        comments: persisted.comments.length > 0 ? persisted.comments : data.comments,
        users: data.users,
        sprints: data.sprints,
        isInitialized: true,
      });
    } else {
      // First visit or corrupt snapshot fallback
      set({
        tasks: data.tasks,
        comments: data.comments,
        users: data.users,
        sprints: data.sprints,
        isInitialized: true,
      });
      boardStorage.savePersistedBoardState({ tasks: data.tasks, comments: data.comments });
    }
  },

  moveTask: (taskId, targetStatus, targetIndex) => {
    set((state) => {
      const taskToMove = state.tasks.find((t) => t.id === taskId);
      if (!taskToMove) return state;

      const nowIso = new Date().toISOString();
      const updatedCompletedAt =
        targetStatus === 'done'
          ? taskToMove.completedAt || nowIso
          : null;

      // Extract tasks from current target status column (excluding moved task)
      const targetColumnTasks = state.tasks
        .filter((t) => t.status === targetStatus && t.id !== taskId)
        .sort((a, b) => a.order - b.order);

      // Insert moved task at targetIndex
      const updatedMovedTask: Task = {
        ...taskToMove,
        status: targetStatus,
        completedAt: updatedCompletedAt,
        updatedAt: nowIso,
      };

      const clampedIndex = Math.max(0, Math.min(targetIndex, targetColumnTasks.length));
      targetColumnTasks.splice(clampedIndex, 0, updatedMovedTask);

      // Re-index order property for target column
      const reindexedTargetTasks = targetColumnTasks.map((t, idx) => ({
        ...t,
        order: idx + 1,
      }));

      // Combine with tasks from other columns
      const otherTasks = state.tasks.filter((t) => t.status !== targetStatus && t.id !== taskId);
      const newTasks = [...otherTasks, ...reindexedTargetTasks];

      boardStorage.savePersistedBoardState({ tasks: newTasks, comments: state.comments });
      return { tasks: newTasks };
    });
  },

  addTask: (taskInput) => {
    const state = get();
    const newId = Date.now();
    const nowIso = new Date().toISOString();

    const columnTasks = state.tasks.filter((t) => t.status === taskInput.status);
    const newOrder = columnTasks.length + 1;

    const newTask: Task = {
      ...taskInput,
      id: newId,
      order: newOrder,
      createdAt: nowIso,
      updatedAt: nowIso,
      completedAt: taskInput.status === 'done' ? nowIso : null,
    };

    const newTasks = [...state.tasks, newTask];
    set({ tasks: newTasks });
    boardStorage.savePersistedBoardState({ tasks: newTasks, comments: state.comments });

    return newTask;
  },

  updateTask: (taskId, updates) => {
    set((state) => {
      const nowIso = new Date().toISOString();
      const newTasks = state.tasks.map((t) => {
        if (t.id !== taskId) return t;

        const nextStatus = updates.status || t.status;
        const nextCompletedAt =
          nextStatus === 'done'
            ? t.completedAt || nowIso
            : null;

        return {
          ...t,
          ...updates,
          completedAt: nextCompletedAt,
          updatedAt: nowIso,
        };
      });

      boardStorage.savePersistedBoardState({ tasks: newTasks, comments: state.comments });
      return { tasks: newTasks };
    });
  },

  deleteTask: (taskId) => {
    set((state) => {
      const newTasks = state.tasks.filter((t) => t.id !== taskId);
      const newComments = state.comments.filter((c) => c.taskId !== taskId);

      const isCurrentSelected = state.selectedTaskId === taskId;

      boardStorage.savePersistedBoardState({ tasks: newTasks, comments: newComments });
      return {
        tasks: newTasks,
        comments: newComments,
        selectedTaskId: isCurrentSelected ? null : state.selectedTaskId,
        isDrawerOpen: isCurrentSelected ? false : state.isDrawerOpen,
        isDeleteModalOpen: false,
      };
    });
  },

  addComment: (taskId, message, authorId) => {
    set((state) => {
      const newComment: TaskComment = {
        id: Date.now(),
        taskId,
        authorId,
        message: message.trim(),
        createdAt: new Date().toISOString(),
      };

      const newComments = [...state.comments, newComment];
      boardStorage.savePersistedBoardState({ tasks: state.tasks, comments: newComments });
      return { comments: newComments };
    });
  },

  resetBoard: (initialData) => {
    boardStorage.clearPersistedBoardState();
    if (initialData) {
      set({
        tasks: initialData.tasks,
        users: initialData.users,
        comments: initialData.comments,
        sprints: initialData.sprints,
        isInitialized: true,
        selectedTaskId: null,
        isDrawerOpen: false,
      });
      boardStorage.savePersistedBoardState({ tasks: initialData.tasks, comments: initialData.comments });
    } else {
      set({ isInitialized: false });
    }
  },

  openDrawer: (taskId) => set({ selectedTaskId: taskId, isDrawerOpen: true }),
  closeDrawer: () => set({ isDrawerOpen: false, selectedTaskId: null }),
  openCreateModal: () => set({ isCreateModalOpen: true }),
  closeCreateModal: () => set({ isCreateModalOpen: false }),
  openDeleteModal: () => set({ isDeleteModalOpen: true }),
  closeDeleteModal: () => set({ isDeleteModalOpen: false }),
}));
