import React from 'react';
import { cn } from '../../utils/cn';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'rectangular' | 'circular' | 'rounded';
}

/**
 * Reusable Skeleton Loading Primitive
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = 'rounded',
  ...props
}) => {
  return (
    <div
      aria-busy="true"
      aria-label="Loading..."
      className={cn(
        'animate-pulse bg-slate-200 dark:bg-slate-800',
        variant === 'circular' && 'rounded-full',
        variant === 'rounded' && 'rounded-md',
        variant === 'rectangular' && 'rounded-none',
        className
      )}
      {...props}
    />
  );
};

export const SkeletonText: React.FC<{ lines?: number; className?: string }> = ({
  lines = 3,
  className,
}) => {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn('h-3.5 w-full', i === lines - 1 && 'w-4/5')}
        />
      ))}
    </div>
  );
};

export const SkeletonCard: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn('p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3', className)}>
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-8 w-1/2" />
      <Skeleton className="h-3 w-1/4" />
    </div>
  );
};

export const SkeletonTable: React.FC<{ rows?: number; cols?: number }> = ({
  rows = 5,
  cols = 4,
}) => {
  return (
    <div className="w-full border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
      <div className="bg-slate-100 dark:bg-slate-800/60 p-3 border-b border-slate-200 dark:border-slate-800 flex gap-4">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="p-3 flex gap-4 bg-white dark:bg-slate-900">
            {Array.from({ length: cols }).map((_, c) => (
              <Skeleton key={c} className="h-3.5 flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
