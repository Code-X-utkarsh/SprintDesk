import type { Notification } from '../types';

const NOTIFICATION_STORAGE_KEY = 'sprintdesk_notifications_v1';

export interface PersistedNotificationState {
  notifications: Notification[];
  version: number;
}

export const notificationStorage = {
  /**
   * Retrieves and validates persisted notification state from localStorage.
   * Returns null if missing, invalid, or corrupted.
   */
  getPersistedNotifications(): Notification[] | null {
    try {
      const raw = localStorage.getItem(NOTIFICATION_STORAGE_KEY);
      if (!raw) return null;

      const parsed: unknown = JSON.parse(raw);

      if (
        typeof parsed !== 'object' ||
        parsed === null ||
        !('notifications' in parsed) ||
        !Array.isArray((parsed as Record<string, unknown>).notifications)
      ) {
        console.warn('Malformed notification storage schema detected. Falling back to default mock dataset.');
        return null;
      }

      const notifications = (parsed as Record<string, unknown>).notifications as Notification[];

      const isValid = notifications.every(
        (n) =>
          typeof n === 'object' &&
          n !== null &&
          typeof n.id === 'number' &&
          typeof n.title === 'string' &&
          typeof n.message === 'string' &&
          typeof n.read === 'boolean'
      );

      if (!isValid) {
        console.warn('Invalid notification records in local storage. Resetting to initial mock dataset.');
        return null;
      }

      return notifications;
    } catch (err) {
      console.warn('Failed to read notifications from localStorage:', err);
      return null;
    }
  },

  /**
   * Persists current notification snapshot to localStorage.
   */
  savePersistedNotifications(notifications: Notification[]): void {
    try {
      const payload: PersistedNotificationState = {
        notifications,
        version: 1,
      };
      localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(payload));
    } catch (err) {
      console.error('Failed to save notifications to localStorage:', err);
    }
  },

  /**
   * Clears persisted notifications.
   */
  clearPersistedNotifications(): void {
    try {
      localStorage.removeItem(NOTIFICATION_STORAGE_KEY);
    } catch (err) {
      console.error('Failed to clear notifications from localStorage:', err);
    }
  },
};
