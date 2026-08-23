import { ApiService } from './api';
import type { Notification } from '../types';

export interface JsonPlaceholderPost {
  id: number;
  userId: number;
  title: string;
  body: string;
}

export const NotificationService = {
  /**
   * Fetches latest 5 posts from JSONPlaceholder API and maps them into Notification domain objects.
   */
  async fetchPolledPosts(): Promise<Notification[]> {
    try {
      const response = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=5');
      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
      }

      const posts: JsonPlaceholderPost[] = await response.json();

      return posts.map((post) => {
        // Offset ID by 1000 to prevent ID collision with mock-data initial notification IDs
        const canonicalId = post.id + 1000;
        const formattedTitle = post.title.length > 30 
          ? `${post.title.slice(0, 30)}...`
          : post.title;

        return {
          id: canonicalId,
          title: `Activity: ${formattedTitle}`,
          message: post.body,
          type: post.id % 2 === 0 ? 'activity' : 'system',
          read: false,
          createdAt: new Date().toISOString(),
        };
      });
    } catch (err) {
      console.warn('Failed to poll notifications from JSONPlaceholder:', err);
      return [];
    }
  },

  /**
   * Loads initial notification dataset from official mock data.
   */
  async getInitialNotifications(): Promise<Notification[]> {
    const response = await ApiService.getMockData();
    return response.data.notifications || [];
  },
};
