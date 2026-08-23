import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAppStore } from '../../stores/useAppStore';
import { useNotificationStore, selectUnreadCount } from '../../stores/useNotificationStore';
import { useAuth } from '../../hooks/useAuth';
import { NotificationPanel } from './NotificationPanel';
import { Menu, Moon, Sun, Bell, ShieldAlert, LogOut } from 'lucide-react';
import { cn } from '../../utils/cn';

interface HeaderProps {
  onOpenMobileSidebar: () => void;
}

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard Overview',
  '/board': 'Sprint Kanban Board',
  '/analytics': 'Sprint Analytics',
};

export const Header: React.FC<HeaderProps> = ({ onOpenMobileSidebar }) => {
  const location = useLocation();
  const { theme, toggleTheme } = useAppStore();
  const { user, logout, isSimulatedExpired, toggleSimulatedExpired } = useAuth();
  
  const { togglePanel } = useNotificationStore();
  const unreadCount = useNotificationStore(selectUnreadCount);

  const currentTitle = pageTitles[location.pathname] || 'SprintDesk';
  const unreadBadgeText = unreadCount > 9 ? '9+' : String(unreadCount);

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xs border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
      {/* Left Area: Mobile Menu Trigger & Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          aria-label="Open navigation menu"
          className="md:hidden p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div>
          <h1 className="text-base sm:text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
            {currentTitle}
          </h1>
        </div>
      </div>

      {/* Right Area: Controls, Notification Bell & Profile */}
      <div className="flex items-center gap-2.5 sm:gap-3 relative">
        {/* Dev Token Simulation Toggle */}
        <button
          onClick={toggleSimulatedExpired}
          title="Toggle 401 token expiration simulation to test silent refresh"
          className={cn(
            'flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium border transition-colors',
            isSimulatedExpired
              ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
          )}
        >
          <ShieldAlert className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">
            {isSimulatedExpired ? 'Simulating 401 Expiry' : 'Simulate 401 Expiry'}
          </span>
        </button>

        {/* Real Notification Bell Trigger */}
        <div className="relative">
          <button
            onClick={togglePanel}
            aria-label={`Notifications, ${unreadCount} unread`}
            title="Notifications"
            className="relative p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center border-2 border-white dark:border-slate-900">
                {unreadBadgeText}
              </span>
            )}
          </button>

          {/* Notification Popover Panel */}
          <NotificationPanel />
        </div>

        {/* Theme Switcher */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {theme === 'dark' ? (
            <Sun className="h-4 w-4 text-amber-400" />
          ) : (
            <Moon className="h-4 w-4 text-slate-600" />
          )}
        </button>

        {/* User Profile Badge & Logout */}
        {user && (
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
            {user.image ? (
              <img
                src={user.image}
                alt={user.username}
                className="h-8 w-8 rounded-full border border-slate-200 dark:border-slate-700 object-cover"
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center text-xs">
                {user.firstName[0]}
              </div>
            )}

            <div className="hidden lg:block text-left">
              <p className="text-xs font-semibold text-slate-900 dark:text-white leading-none">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                @{user.username}
              </p>
            </div>

            <button
              onClick={logout}
              title="Logout"
              aria-label="Logout"
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
