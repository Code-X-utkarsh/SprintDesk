import { create } from 'zustand';
import type { Notification } from '../types';
import { notificationStorage } from '../utils/notificationStorage';

export interface NotificationStoreState {
  notifications: Notification[];
  isPanelOpen: boolean;
  currentPage: number;
  pageSize: number;
  isInitialized: boolean;
}

export interface NotificationStoreActions {
  hydrateNotifications: (initialData: Notification[]) => void;
  addNotifications: (incomingNotifications: Notification[], isPanelOpen: boolean) => Notification[];
  markAsRead: (notificationId: number) => void;
  markAllAsRead: () => void;
  togglePanel: () => void;
  openPanel: () => void;
  closePanel: () => void;
  setPage: (page: number) => void;
  resetNotifications: (initialData?: Notification[]) => void;
}

type NotificationStore = NotificationStoreState & NotificationStoreActions;

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],
  isPanelOpen: false,
  currentPage: 1,
  pageSize: 20,
  isInitialized: false,

  hydrateNotifications: (initialData) => {
    const persisted = notificationStorage.getPersistedNotifications();

    if (persisted && persisted.length > 0) {
      set({
        notifications: persisted,
        isInitialized: true,
      });
    } else {
      set({
        notifications: initialData,
        isInitialized: true,
      });
      notificationStorage.savePersistedNotifications(initialData);
    }
  },

  addNotifications: (incomingNotifications) => {
    const state = get();
    const existingIds = new Set(state.notifications.map((n) => n.id));

    // Filter out duplicate IDs
    const trulyNew = incomingNotifications.filter((n) => !existingIds.has(n.id));

    if (trulyNew.length === 0) {
      return [];
    }

    // Prepend newly arrived notifications
    const newNotifications = [...trulyNew, ...state.notifications];
    set({ notifications: newNotifications });
    notificationStorage.savePersistedNotifications(newNotifications);

    return trulyNew;
  },

  markAsRead: (notificationId) => {
    set((state) => {
      const newNotifications = state.notifications.map((n) =>
        n.id === notificationId ? { ...n, read: true } : n
      );
      notificationStorage.savePersistedNotifications(newNotifications);
      return { notifications: newNotifications };
    });
  },

  markAllAsRead: () => {
    set((state) => {
      const newNotifications = state.notifications.map((n) => ({ ...n, read: true }));
      notificationStorage.savePersistedNotifications(newNotifications);
      return { notifications: newNotifications };
    });
  },

  togglePanel: () => set((state) => ({ isPanelOpen: !state.isPanelOpen })),
  openPanel: () => set({ isPanelOpen: true }),
  closePanel: () => set({ isPanelOpen: false }),

  setPage: (page) => set({ currentPage: Math.max(1, page) }),

  resetNotifications: (initialData) => {
    notificationStorage.clearPersistedNotifications();
    if (initialData) {
      set({
        notifications: initialData,
        isInitialized: true,
        currentPage: 1,
        isPanelOpen: false,
      });
      notificationStorage.savePersistedNotifications(initialData);
    } else {
      set({ notifications: [], isInitialized: false, currentPage: 1, isPanelOpen: false });
    }
  },
}));

// Derived Store Selectors
export const selectUnreadCount = (state: NotificationStoreState): number =>
  state.notifications.filter((n) => !n.read).length;

export const selectSortedNotifications = (state: NotificationStoreState): Notification[] =>
  [...state.notifications].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

export const selectPaginatedNotifications = (state: NotificationStoreState): Notification[] => {
  const sorted = selectSortedNotifications(state);
  const startIndex = (state.currentPage - 1) * state.pageSize;
  return sorted.slice(startIndex, startIndex + state.pageSize);
};

export const selectTotalPages = (state: NotificationStoreState): number => {
  const count = state.notifications.length;
  return Math.ceil(count / state.pageSize) || 1;
};
