import { create } from 'zustand';

export type ThemeMode = 'light' | 'dark';

interface AppState {
  theme: ThemeMode;
  isSidebarOpen: boolean;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  toggleSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void;
}

/**
 * Global Application UI State Store (Zustand)
 * Manages client-side display preferences like light/dark mode and navigation drawer state.
 */
export const useAppStore = create<AppState>((set) => ({
  theme: 'light',
  isSidebarOpen: true,
  setTheme: (theme) => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    set({ theme });
  },
  toggleTheme: () => {
    set((state) => {
      const nextTheme = state.theme === 'light' ? 'dark' : 'light';
      if (nextTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return { theme: nextTheme };
    });
  },
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
}));
