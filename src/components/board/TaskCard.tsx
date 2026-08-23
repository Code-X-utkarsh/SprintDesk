import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Task } from '../../types';
import { useBoardStore } from '../../stores/useBoardStore';
import { isTaskOverdue } from '../../utils/analytics';
import { GripVertical, Calendar, MessageSquare } from 'lucide-react';
import { cn } from '../../utils/cn';

interface TaskCardProps {
  task: Task;
}

// Map priority to clean dot badge styles matching reference image
const priorityDotStyles: Record<string, { dot: string; text: string; bg: string }> = {
  high: {
    dot: 'bg-rose-500',
    text: 'text-rose-700 dark:text-rose-400',
    bg: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200/60 dark:border-rose-900/60',
  },
  medium: {
    dot: 'bg-amber-500',
    text: 'text-amber-700 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200/60 dark:border-amber-900/60',
  },
  low: {
    dot: 'bg-emerald-500',
    text: 'text-emerald-700 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200/60 dark:border-emerald-900/60',
  },
};

export const TaskCard: React.FC<TaskCardProps> = React.memo(({ task }) => {
  const { users, comments, openDrawer } = useBoardStore();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: { task },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const assignee = users.find((u) => u.id === task.assigneeId);
  const taskCommentCount = comments.filter((c) => c.taskId === task.id).length;

  // Format due date & calculate overdue status
  const isOverdue = isTaskOverdue(task);

  const formattedDueDate = task.dueDate
    ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : null;

  const priorityConfig = priorityDotStyles[task.priority] || priorityDotStyles.low;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group bg-white dark:bg-neutral-900 border rounded-2xl p-4 shadow-2xs transition-all hover:shadow-md hover:border-neutral-300 dark:hover:border-neutral-700 relative touch-manipulation',
        isDragging
          ? 'dragging-card-active opacity-40 border-indigo-500 shadow-xl cursor-grabbing'
          : 'border-neutral-200/80 dark:border-neutral-800'
      )}
    >
      {/* Top Row: Date Badge (Left) & Priority Dot Badge (Right) & Drag Handle */}
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400 font-medium">
          {formattedDueDate ? (
            <>
              <Calendar className="h-3.5 w-3.5 text-neutral-400" />
              <span className={cn(isOverdue && 'text-rose-600 dark:text-rose-400 font-semibold')}>
                {formattedDueDate}
              </span>
            </>
          ) : (
            <span className="text-[11px] font-mono text-neutral-400">#Task-{task.id}</span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <span
            className={cn(
              'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold capitalize border',
              priorityConfig.bg,
              priorityConfig.text
            )}
          >
            <span className={cn('w-1.5 h-1.5 rounded-full', priorityConfig.dot)} />
            {task.priority}
          </span>

          {/* Drag handle icon button */}
          <button
            {...attributes}
            {...listeners}
            type="button"
            aria-label={`Drag task ${task.title}`}
            className="opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 cursor-grab active:cursor-grabbing p-1 rounded transition-opacity focus:opacity-100"
          >
            <GripVertical className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Task Title (Click opens drawer) */}
      <h3
        onClick={() => openDrawer(task.id)}
        className="text-sm font-bold text-neutral-900 dark:text-neutral-100 cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors line-clamp-2 leading-snug"
      >
        {task.title}
      </h3>

      {/* Description Snippet if available */}
      {task.description && (
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 line-clamp-2 leading-relaxed">
          {task.description}
        </p>
      )}

      {/* Bottom Row: Assignee Avatar (Left) & Real Comment Count (Right) */}
      <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between gap-2">
        {/* Assignee Avatar */}
        <div className="flex items-center gap-2">
          {assignee ? (
            <div className="flex items-center gap-1.5" title={`Assignee: ${assignee.name}`}>
              <img
                src={assignee.avatar}
                alt={assignee.name}
                className="h-6 w-6 rounded-full object-cover border border-neutral-200 dark:border-neutral-700"
              />
              <span className="text-[11px] font-medium text-neutral-600 dark:text-neutral-400 truncate max-w-[100px]">
                {assignee.name.split(' ')[0]}
              </span>
            </div>
          ) : (
            <span className="text-[11px] text-neutral-400 italic">Unassigned</span>
          )}
        </div>

        {/* Comment Count Indicator (Strictly real count) */}
        {taskCommentCount > 0 && (
          <div className="flex items-center gap-1 text-[11px] font-semibold text-neutral-500 dark:text-neutral-400">
            <MessageSquare className="h-3.5 w-3.5 text-neutral-400" />
            <span>{taskCommentCount}</span>
          </div>
        )}
      </div>
    </div>
  );
});
