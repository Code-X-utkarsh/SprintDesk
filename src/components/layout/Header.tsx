import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAppStore } from '../../stores/useAppStore';
import { useNotificationStore, selectUnreadCount } from '../../stores/useNotificationStore';
import { useAuth } from '../../hooks/useAuth';
import { NotificationPanel } from './NotificationPanel';
import { Menu, Moon, Sun, Bell, ShieldAlert, LogOut, Star } from 'lucide-react';
import { cn } from '../../utils/cn';

interface HeaderProps {
  onOpenMobileSidebar: () => void;
}

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard Overview',
  '/board': 'Sprint Board',
  '/analytics': 'Sprint Analytics',
};

export const Header: React.FC<HeaderProps> = ({ onOpenMobileSidebar }) => {
  const location = useLocation();
  const { theme, toggleTheme } = useAppStore();
  const { user, logout, isSimulatedExpired, toggleSimulatedExpired } = useAuth();
  
  const { togglePanel } = useNotificationStore();
  const unreadCount = useNotificationStore(selectUnreadCount);

  const [isMobileUserMenuOpen, setIsMobileUserMenuOpen] = useState(false);
  const mobileUserMenuRef = useRef<HTMLDivElement>(null);

  const currentTitle = pageTitles[location.pathname] || 'SprintDesk';
  const unreadBadgeText = unreadCount > 9 ? '9+' : String(unreadCount);

  // Outside click listener for mobile user menu popover
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (mobileUserMenuRef.current && !mobileUserMenuRef.current.contains(e.target as Node)) {
        setIsMobileUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard Escape listener
  useEffect(() => {
    if (!isMobileUserMenuOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileUserMenuOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isMobileUserMenuOpen]);

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-xs border-b border-neutral-200/80 dark:border-neutral-800 px-3.5 sm:px-6 lg:px-8 flex items-center justify-between transition-colors shrink-0 gap-2">
      {/* Left Area: Mobile Menu Trigger & Workspace Title Context */}
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        <button
          onClick={onOpenMobileSidebar}
          aria-label="Open navigation menu"
          className="md:hidden p-2 rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 shrink-0"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2 min-w-0 truncate">
          <Star className="h-4 w-4 text-amber-400 fill-amber-400 shrink-0 hidden sm:block" />
          <div className="min-w-0 truncate">
            <h1 className="text-sm sm:text-lg font-bold tracking-tight text-neutral-900 dark:text-white truncate">
              {currentTitle}
            </h1>
            <p className="text-[11px] text-neutral-400 dark:text-neutral-500 hidden md:block font-mono">
              Sprint 3 • Active Sprint
            </p>
          </div>
        </div>
      </div>

      {/* Right Area: Controls, Notification Bell & User Profile */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        {/* Dev Token Simulation Toggle (Desktop Only) */}
        <button
          onClick={toggleSimulatedExpired}
          title="Toggle 401 token expiration simulation to test silent refresh"
          className={cn(
            'hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-all',
            isSimulatedExpired
              ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700'
              : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border-neutral-200/80 dark:border-neutral-700 hover:bg-neutral-200/70 dark:hover:bg-neutral-700'
          )}
        >
          <ShieldAlert className="h-3.5 w-3.5" />
          <span>
            {isSimulatedExpired ? 'Simulating 401 Expiry' : 'Simulate 401 Expiry'}
          </span>
        </button>

        {/* Notification Bell Trigger */}
        <div className="relative">
          <button
            onClick={togglePanel}
            aria-label={`Notifications, ${unreadCount} unread`}
            title="Notifications"
            className="relative p-2 rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-rose-500 text-white font-bold text-[10px] flex items-center justify-center border-2 border-white dark:border-neutral-900">
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
          className="p-2 rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {theme === 'dark' ? (
            <Sun className="h-4 w-4 text-amber-400" />
          ) : (
            <Moon className="h-4 w-4 text-neutral-600" />
          )}
        </button>

        {/* User Profile Badge & Logout (Desktop View: Inline, Mobile View: Popover Menu) */}
        {user && (
          <div className="flex items-center pl-1 sm:pl-2 border-l border-neutral-200/80 dark:border-neutral-800">
            {/* Desktop User Row (>= 768px) */}
            <div className="hidden md:flex items-center gap-2">
              {user.image ? (
                <img
                  src={user.image}
                  alt={user.username}
                  className="h-8 w-8 rounded-full border border-neutral-200 dark:border-neutral-700 object-cover shrink-0"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-neutral-900 text-white font-bold flex items-center justify-center text-xs shrink-0">
                  {user.firstName[0]}
                </div>
              )}

              <div className="text-left">
                <p className="text-xs font-semibold text-neutral-900 dark:text-white leading-none">{user.firstName} {user.lastName}</p>
                <p className="text-[10px] text-neutral-500 dark:text-neutral-400 leading-tight">@{user.username}</p>
              </div>

              <button
                onClick={logout}
                title="Logout"
                aria-label="Logout"
                className="p-2 rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>

            {/* Mobile User Avatar Trigger (< 768px) */}
            <div ref={mobileUserMenuRef} className="relative md:hidden">
              <button
                onClick={() => setIsMobileUserMenuOpen((prev) => !prev)}
                aria-haspopup="menu"
                aria-expanded={isMobileUserMenuOpen}
                aria-label="User Account Menu"
                className="p-1 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {user.image ? (
                  <img
                    src={user.image}
                    alt={user.username}
                    className="h-8 w-8 rounded-full border border-neutral-200 dark:border-neutral-700 object-cover shrink-0"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-neutral-900 text-white font-bold flex items-center justify-center text-xs shrink-0">
                    {user.firstName[0]}
                  </div>
                )}
              </button>

              {/* Viewport-Safe Mobile User Menu Popover */}
              {isMobileUserMenuOpen && (
                <div
                  role="menu"
                  aria-orientation="vertical"
                  className="absolute right-0 top-full mt-2 w-60 bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-2xl shadow-xl p-3 z-50 animate-in fade-in-50 zoom-in-95 duration-150 space-y-3"
                >
                  {/* User Identity Details */}
                  <div className="flex items-center gap-3 pb-2.5 border-b border-neutral-200/80 dark:border-neutral-800">
                    {user.image ? (
                      <img src={user.image} alt={user.username} className="h-9 w-9 rounded-full object-cover shrink-0" />
                    ) : (
                      <div className="h-9 w-9 rounded-full bg-neutral-900 text-white font-bold flex items-center justify-center text-sm shrink-0">
                        {user.firstName[0]}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-neutral-900 dark:text-white truncate">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate font-mono">
                        @{user.username}
                      </p>
                    </div>
                  </div>

                  {/* Mobile Dev Token Simulation Toggle */}
                  <button
                    onClick={() => {
                      toggleSimulatedExpired();
                      setIsMobileUserMenuOpen(false);
                    }}
                    className={cn(
                      'w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border transition-colors',
                      isSimulatedExpired
                        ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700'
                        : 'bg-neutral-50 dark:bg-neutral-800/60 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700'
                    )}
                  >
                    <ShieldAlert className="h-4 w-4 shrink-0 text-amber-500" />
                    <span className="truncate">
                      {isSimulatedExpired ? 'Simulating 401 Expiry' : 'Simulate 401 Expiry'}
                    </span>
                  </button>

                  {/* Logout Button */}
                  <button
                    onClick={() => {
                      setIsMobileUserMenuOpen(false);
                      logout();
                    }}
                    title="Logout"
                    role="menuitem"
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-transparent hover:border-rose-200 dark:hover:border-rose-900 transition-colors"
                  >
                    <LogOut className="h-4 w-4 shrink-0" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
