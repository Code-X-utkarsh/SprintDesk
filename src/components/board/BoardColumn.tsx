import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { Task, TaskStatus } from '../../types';
import { TaskCard } from './TaskCard';
import { useBoardStore } from '../../stores/useBoardStore';
import { Plus, MoreHorizontal, Circle, Square, Triangle } from 'lucide-react';
import { cn } from '../../utils/cn';

interface BoardColumnProps {
  status: TaskStatus;
  title: string;
  tasks: Task[];
}

const columnStatusIcons: Record<TaskStatus, React.ReactNode> = {
  backlog: <Triangle className="h-3.5 w-3.5 text-neutral-500 fill-neutral-500 shrink-0" />,
  'in-progress': <Square className="h-3.5 w-3.5 text-amber-500 fill-amber-500 shrink-0" />,
  review: <Triangle className="h-3.5 w-3.5 text-indigo-500 fill-indigo-500 shrink-0" />,
  done: <Circle className="h-3.5 w-3.5 text-emerald-500 fill-emerald-500 shrink-0" />,
};

export const BoardColumn: React.FC<BoardColumnProps> = React.memo(({ status, title, tasks }) => {
  const { openCreateModal } = useBoardStore();
  const { setNodeRef, isOver } = useDroppable({
    id: status,
    data: { status },
  });

  const taskIds = tasks.map((t) => t.id);

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'w-[280px] sm:w-[320px] md:w-auto shrink-0 md:shrink snap-center flex flex-col bg-neutral-100/70 dark:bg-neutral-900/50 border rounded-2xl p-3.5 transition-colors min-h-[450px]',
        isOver
          ? 'border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/20'
          : 'border-neutral-200/80 dark:border-neutral-800'
      )}
    >
      {/* Column Header matching reference image */}
      <div className="flex items-center justify-between mb-3.5 px-1">
        <div className="flex items-center gap-2">
          {columnStatusIcons[status]}
          <h2 className="text-sm font-bold text-neutral-800 dark:text-neutral-200 tracking-tight">
            {title}
          </h2>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-neutral-200/80 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
            {tasks.length}
          </span>
        </div>

        <button
          aria-label={`Options for ${title}`}
          className="p-1 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 transition-colors"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>

      {/* Column Content Area with DnD Sortable Context */}
      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <div className="flex-1 space-y-3.5 min-h-[150px]">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}

          {tasks.length === 0 && (
            <div className="h-32 border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl flex flex-col items-center justify-center text-xs text-neutral-400 dark:text-neutral-500 p-4 text-center">
              <span>No tasks in stage</span>
            </div>
          )}
        </div>
      </SortableContext>

      {/* Ghost "+ Add Task" button at bottom of column */}
      <button
        onClick={openCreateModal}
        className="mt-3.5 w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-dashed border-neutral-300 dark:border-neutral-800 text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50 transition-colors"
      >
        <Plus className="h-3.5 w-3.5" />
        <span>Add task</span>
      </button>
    </div>
  );
});
