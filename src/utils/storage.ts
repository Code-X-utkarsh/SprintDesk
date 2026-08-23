/**
 * Dedicated Storage Abstraction for Sensitive / Session Credentials
 * Isolates direct localStorage interactions behind strongly typed accessors.
 */

const REFRESH_TOKEN_KEY = 'sprintdesk_refresh_token';

export const storage = {
  getRefreshToken(): string | null {
    try {
      return localStorage.getItem(REFRESH_TOKEN_KEY);
    } catch {
      return null;
    }
  },

  setRefreshToken(token: string): void {
    try {
      localStorage.setItem(REFRESH_TOKEN_KEY, token);
    } catch (err) {
      console.error('Failed to save refresh token to localStorage:', err);
    }
  },

  clearRefreshToken(): void {
    try {
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    } catch (err) {
      console.error('Failed to clear refresh token from localStorage:', err);
    }
  },
};
