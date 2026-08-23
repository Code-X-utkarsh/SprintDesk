import { describe, it, expect, beforeEach } from 'vitest';
import { useNotificationStore, selectUnreadCount, selectPaginatedNotifications } from '../stores/useNotificationStore';
import { notificationStorage } from '../utils/notificationStorage';
import type { Notification } from '../types';

const mockNotifications: Notification[] = [
  {
    id: 1,
    title: 'Sprint 3 started',
    message: 'Sprint 3 active scope defined.',
    type: 'system',
    read: false,
    createdAt: '2026-08-20T10:00:00Z',
  },
  {
    id: 2,
    title: 'Task completed',
    message: 'Emily completed Auth flow task.',
    type: 'activity',
    read: false,
    createdAt: '2026-08-21T11:30:00Z',
  },
  {
    id: 3,
    title: 'Deployment successful',
    message: 'Production build v1.0 deployed.',
    type: 'system',
    read: true,
    createdAt: '2026-08-22T08:00:00Z',
  },
];

describe('Notification Zustand Store Unit Tests', () => {
  beforeEach(() => {
    notificationStorage.clearPersistedNotifications();
    useNotificationStore.getState().resetNotifications(mockNotifications);
  });

  it('hydrates notifications from initial data snapshot', () => {
    const state = useNotificationStore.getState();
    expect(state.isInitialized).toBe(true);
    expect(state.notifications).toHaveLength(3);
  });

  it('calculates unread notification count accurately', () => {
    const unreadCount = selectUnreadCount(useNotificationStore.getState());
    expect(unreadCount).toBe(2);
  });

  it('deduplicates incoming notifications by canonical ID', () => {
    const incoming: Notification[] = [
      { id: 2, title: 'Duplicate item', message: 'Dup', type: 'activity', read: false, createdAt: '2026-08-21T11:30:00Z' }, // Duplicate
      { id: 1001, title: 'Brand new polled item', message: 'New', type: 'system', read: false, createdAt: '2026-08-23T12:00:00Z' }, // New
    ];

    const newlyAdded = useNotificationStore.getState().addNotifications(incoming, false);

    expect(newlyAdded).toHaveLength(1);
    expect(newlyAdded[0].id).toBe(1001);
    expect(useNotificationStore.getState().notifications).toHaveLength(4);
  });

  it('marks an individual notification as read', () => {
    useNotificationStore.getState().markAsRead(1);

    const notification = useNotificationStore.getState().notifications.find((n) => n.id === 1);
    expect(notification?.read).toBe(true);

    const unreadCount = selectUnreadCount(useNotificationStore.getState());
    expect(unreadCount).toBe(1);
  });

  it('marks all notifications as read', () => {
    useNotificationStore.getState().markAllAsRead();

    const unreadCount = selectUnreadCount(useNotificationStore.getState());
    expect(unreadCount).toBe(0);
  });

  it('paginates notifications correctly (20 items per page)', () => {
    const manyNotifications: Notification[] = Array.from({ length: 25 }, (_, i) => ({
      id: i + 1,
      title: `Notification ${i + 1}`,
      message: `Message ${i + 1}`,
      type: 'system',
      read: false,
      createdAt: `2026-08-20T${10 + (i % 10)}:00:00Z`,
    }));

    useNotificationStore.getState().resetNotifications(manyNotifications);

    const page1 = selectPaginatedNotifications(useNotificationStore.getState());
    expect(page1).toHaveLength(20);

    useNotificationStore.getState().setPage(2);
    const page2 = selectPaginatedNotifications(useNotificationStore.getState());
    expect(page2).toHaveLength(5);
  });

  it('falls back to default initial data if localStorage contains malformed state', () => {
    localStorage.setItem('sprintdesk_notifications_v1', JSON.stringify({ notifications: 'corrupted_string' }));

    useNotificationStore.getState().hydrateNotifications(mockNotifications);

    const state = useNotificationStore.getState();
    expect(state.notifications).toHaveLength(3);
    expect(state.notifications[0].title).toBe('Sprint 3 started');
  });
});
