import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { Task, TaskStatus } from '../../types';
import { TaskCard } from './TaskCard';
import { cn } from '../../utils/cn';

interface BoardColumnProps {
  status: TaskStatus;
  title: string;
  tasks: Task[];
}

export const BoardColumn: React.FC<BoardColumnProps> = React.memo(({ status, title, tasks }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
    data: { status },
  });

  const taskIds = tasks.map((t) => t.id);

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex flex-col bg-slate-100/70 dark:bg-slate-900/60 border rounded-xl p-3.5 transition-colors min-h-[400px]',
        isOver
          ? 'border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/20'
          : 'border-slate-200 dark:border-slate-800'
      )}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
          {title}
        </h2>
        <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
          {tasks.length}
        </span>
      </div>

      {/* Column Content Area */}
      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <div className="flex-1 space-y-3 min-h-[150px]">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}

          {tasks.length === 0 && (
            <div className="h-32 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-center text-xs text-slate-400 dark:text-slate-500">
              No tasks in this stage
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
});
