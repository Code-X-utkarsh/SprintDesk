import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Task } from '../../types';
import { useBoardStore } from '../../stores/useBoardStore';
import { GripVertical, Calendar, MessageSquare } from 'lucide-react';
import { cn } from '../../utils/cn';

interface TaskCardProps {
  task: Task;
}

const priorityStyles: Record<string, string> = {
  high: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800',
  medium: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800',
  low: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
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
  const isOverdue =
    task.dueDate &&
    task.status !== 'done' &&
    new Date(task.dueDate).getTime() < new Date().setHours(0, 0, 0, 0);

  const formattedDueDate = task.dueDate
    ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group bg-white dark:bg-slate-900 border rounded-xl p-3.5 shadow-2xs transition-all hover:border-indigo-300 dark:hover:border-indigo-700',
        isDragging
          ? 'opacity-40 border-indigo-500 shadow-md cursor-grabbing'
          : 'border-slate-200 dark:border-slate-800'
      )}
    >
      {/* Top Bar: Drag Handle & Priority Badge */}
      <div className="flex items-center justify-between mb-2">
        <span
          className={cn(
            'inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border',
            priorityStyles[task.priority] || priorityStyles.low
          )}
        >
          {task.priority}
        </span>

        {/* Drag handle button */}
        <button
          {...attributes}
          {...listeners}
          type="button"
          aria-label={`Drag task ${task.title}`}
          className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-grab active:cursor-grabbing p-0.5 rounded transition-opacity focus:opacity-100"
        >
          <GripVertical className="h-4 w-4" />
        </button>
      </div>

      {/* Title (Click opens drawer) */}
      <h3
        onClick={() => openDrawer(task.id)}
        className="text-sm font-semibold text-slate-900 dark:text-slate-100 cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors line-clamp-2 leading-snug"
      >
        {task.title}
      </h3>

      {/* Description Snippet if available */}
      {task.description && (
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
          {task.description}
        </p>
      )}

      {/* Card Footer: Metadata (Due Date, Comments, Assignee) */}
      <div className="mt-3.5 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-3">
          {/* Due Date Indicator */}
          {formattedDueDate && (
            <div
              className={cn(
                'flex items-center gap-1 text-[11px] font-medium',
                isOverdue
                  ? 'text-rose-600 dark:text-rose-400 font-semibold'
                  : 'text-slate-500 dark:text-slate-400'
              )}
            >
              <Calendar className="h-3 w-3 shrink-0" />
              <span>{formattedDueDate}</span>
            </div>
          )}

          {/* Comments count */}
          {taskCommentCount > 0 && (
            <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
              <MessageSquare className="h-3 w-3 shrink-0" />
              <span>{taskCommentCount}</span>
            </div>
          )}
        </div>

        {/* Assignee Avatar */}
        {assignee && (
          <div className="flex items-center gap-1.5" title={`Assignee: ${assignee.name}`}>
            {assignee.avatar ? (
              <img
                src={assignee.avatar}
                alt={assignee.name}
                className="h-6 w-6 rounded-full object-cover border border-slate-200 dark:border-slate-700"
              />
            ) : (
              <div className="h-6 w-6 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center text-[10px]">
                {assignee.name[0]}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
});
