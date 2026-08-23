import React, { useEffect } from 'react';
import {
  useNotificationStore,
  selectUnreadCount,
  selectPaginatedNotifications,
  selectTotalPages,
} from '../../stores/useNotificationStore';
import { Button } from '../ui';
import { Bell, CheckCheck, Check, ChevronLeft, ChevronRight, X, Info, Activity } from 'lucide-react';
import { cn } from '../../utils/cn';

export const NotificationPanel: React.FC = () => {
  const {
    isPanelOpen,
    notifications,
    currentPage,
    closePanel,
    markAsRead,
    markAllAsRead,
    setPage,
  } = useNotificationStore();

  const unreadCount = useNotificationStore(selectUnreadCount);
  const paginatedNotifications = useNotificationStore(selectPaginatedNotifications);
  const totalPages = useNotificationStore(selectTotalPages);

  // Keyboard Escape listener
  useEffect(() => {
    if (!isPanelOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closePanel();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isPanelOpen, closePanel]);

  if (!isPanelOpen) return null;

  const totalCount = notifications.length;
  const startItem = totalCount > 0 ? (currentPage - 1) * 20 + 1 : 0;
  const endItem = Math.min(currentPage * 20, totalCount);

  return (
    <div
      className="fixed inset-x-2 top-16 sm:inset-auto sm:right-0 sm:top-14 sm:w-96 z-50 max-w-[calc(100vw-1rem)] mx-auto sm:mx-0"
      role="dialog"
      aria-modal="true"
      aria-labelledby="notification-panel-title"
    >
      {/* Mobile Backdrop Overlay */}
      <div
        className="fixed inset-0 bg-neutral-900/60 dark:bg-neutral-950/80 backdrop-blur-xs sm:hidden"
        onClick={closePanel}
        aria-hidden="true"
      />

      {/* Main Panel Container */}
      <div className="relative w-full h-full sm:h-auto max-h-[85vh] bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-none sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-top-2 duration-200">
        {/* Panel Header */}
        <div className="p-4 border-b border-neutral-200/80 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/50 dark:bg-neutral-900/50">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            <h2 id="notification-panel-title" className="text-sm font-bold text-neutral-900 dark:text-white">
              Notifications
            </h2>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                {unreadCount} unread
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<CheckCheck className="h-3.5 w-3.5" />}
                onClick={markAllAsRead}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700"
              >
                Mark all read
              </Button>
            )}

            <button
              onClick={closePanel}
              aria-label="Close notification panel"
              className="p-1.5 rounded-xl text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Notification List */}
        <div className="flex-1 overflow-y-auto divide-y divide-neutral-100 dark:divide-neutral-800/80">
          {paginatedNotifications.map((n) => (
            <div
              key={n.id}
              className={cn(
                'p-4 transition-colors flex items-start gap-3 relative group',
                n.read
                  ? 'bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-300'
                  : 'bg-indigo-50/40 dark:bg-indigo-950/20 text-neutral-900 dark:text-neutral-100 font-medium'
              )}
            >
              {/* Status Indicator / Type Icon */}
              <div className="mt-0.5 shrink-0">
                {n.type === 'system' ? (
                  <Info className="h-4 w-4 text-indigo-500" />
                ) : (
                  <Activity className="h-4 w-4 text-amber-500" />
                )}
              </div>

              {/* Message Details */}
              <div className="flex-1 min-w-0 pr-6">
                <div className="flex items-center gap-2">
                  <h3 className={cn('text-xs font-semibold truncate', !n.read && 'text-indigo-950 dark:text-indigo-200')}>
                    {n.title}
                  </h3>
                  {!n.read && (
                    <span className="h-2 w-2 rounded-full bg-indigo-600 dark:bg-indigo-400 shrink-0" aria-label="Unread" />
                  )}
                </div>

                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 line-clamp-2 leading-relaxed">
                  {n.message}
                </p>

                <p className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-1.5 font-mono">
                  {new Date(n.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>

              {/* Individual Mark as Read action button */}
              {!n.read && (
                <button
                  onClick={() => markAsRead(n.id)}
                  aria-label={`Mark notification ${n.title} as read`}
                  title="Mark as read"
                  className="absolute right-3 top-4 p-1 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-neutral-400 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors"
                >
                  <Check className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))}

          {totalCount === 0 && (
            <div className="p-8 text-center space-y-2">
              <Bell className="h-8 w-8 text-neutral-300 dark:text-neutral-600 mx-auto" />
              <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">You're all caught up</p>
              <p className="text-xs text-neutral-400">No active notifications at this time.</p>
            </div>
          )}
        </div>

        {/* Pagination Footer */}
        {totalCount > 0 && (
          <div className="p-3 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 flex items-center justify-between text-xs">
            <span className="text-neutral-500 dark:text-neutral-400 font-mono">
              Showing {startItem}-{endItem} of {totalCount}
            </span>

            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setPage(currentPage - 1)}
                aria-label="Previous page"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>

              <span className="px-2 font-mono text-neutral-700 dark:text-neutral-300">
                {currentPage} / {totalPages}
              </span>

              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages}
                onClick={() => setPage(currentPage + 1)}
                aria-label="Next page"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
