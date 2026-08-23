import React from 'react';
import type { ActivityItem } from '../../utils/activityUtils';
import { CheckCircle2, MessageSquare, PlusCircle, Clock, Activity } from 'lucide-react';
import { cn } from '../../utils/cn';

interface RecentActivityFeedProps {
  activities: ActivityItem[];
}

export const RecentActivityFeed: React.FC<RecentActivityFeedProps> = ({ activities }) => {
  const getEventIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'task_completed':
        return <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />;
      case 'comment_added':
        return <MessageSquare className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />;
      case 'task_updated':
        return <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />;
      case 'task_created':
        return <PlusCircle className="h-4 w-4 text-sky-600 dark:text-sky-400" />;
      default:
        return <Activity className="h-4 w-4 text-neutral-500" />;
    }
  };

  const getEventBadgeBg = (type: ActivityItem['type']) => {
    switch (type) {
      case 'task_completed':
        return 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800';
      case 'comment_added':
        return 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800';
      case 'task_updated':
        return 'bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800';
      case 'task_created':
        return 'bg-sky-50 dark:bg-sky-950/60 border-sky-200 dark:border-sky-800';
      default:
        return 'bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700';
    }
  };

  return (
    <div className="p-5 bg-neutral-50/80 dark:bg-neutral-900/60 border border-neutral-200/80 dark:border-neutral-800 rounded-2xl shadow-2xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-200/80 dark:border-neutral-800 pb-3">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-indigo-500" />
          <h3 className="text-base font-bold text-neutral-900 dark:text-white">
            Recent Activity Feed
          </h3>
        </div>
        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-neutral-200/60 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 font-mono">
          {activities.length} Audit Events
        </span>
      </div>

      {/* Activity List */}
      <div className="divide-y divide-neutral-200/60 dark:divide-neutral-800/60">
        {activities.map((item) => (
          <div key={item.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3 min-w-0">
              {/* Event type icon badge */}
              <div className={cn('p-2 rounded-xl border shrink-0', getEventBadgeBg(item.type))}>
                {getEventIcon(item.type)}
              </div>

              {/* User Avatar */}
              {item.user.avatar ? (
                <img
                  src={item.user.avatar}
                  alt={item.user.name}
                  className="h-7 w-7 rounded-full object-cover shrink-0 border border-neutral-200 dark:border-neutral-700"
                />
              ) : (
                <div className="h-7 w-7 rounded-full bg-neutral-900 text-white font-bold flex items-center justify-center text-[10px] shrink-0">
                  {item.user.name[0]}
                </div>
              )}

              {/* Content */}
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-neutral-900 dark:text-white truncate">
                    {item.user.name}
                  </span>
                  <span className="text-neutral-400 font-medium hidden sm:inline">•</span>
                  <span className="text-neutral-500 dark:text-neutral-400 font-medium truncate">
                    {item.title}
                  </span>
                </div>
                <p className="text-neutral-600 dark:text-neutral-300 truncate mt-0.5 leading-snug">
                  "{item.description}"
                </p>
              </div>
            </div>

            {/* Date Tag */}
            <span className="text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 font-mono shrink-0">
              {item.formattedDate}
            </span>
          </div>
        ))}

        {activities.length === 0 && (
          <p className="text-xs text-neutral-400 italic py-3 text-center">
            No recent activity recorded.
          </p>
        )}
      </div>
    </div>
  );
};
