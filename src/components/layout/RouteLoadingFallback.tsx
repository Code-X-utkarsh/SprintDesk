import React from 'react';
import { Skeleton, SkeletonCard } from '../ui/Skeleton';

/**
 * Accessible route-level loading state rendered during React.lazy Suspense transitions.
 */
export const RouteLoadingFallback: React.FC = () => {
  return (
    <div
      className="p-6 space-y-6 animate-in fade-in duration-150"
      role="status"
      aria-label="Loading page content"
      aria-busy="true"
    >
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-9 w-28 rounded-lg" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>

      <div className="h-64 border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-white/50 dark:bg-slate-900/50">
        <Skeleton className="h-6 w-36 mb-4" />
        <Skeleton className="h-40 w-full rounded-lg" />
      </div>
    </div>
  );
};
