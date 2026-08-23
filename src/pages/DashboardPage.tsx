import React, { useState, useMemo } from 'react';
import { useBoardStore } from '../stores/useBoardStore';
import { useBoardData } from '../hooks/useBoardData';
import { getAnalyticsSummary } from '../utils/analytics';
import { CustomSelect, DataTable, Skeleton, type ColumnDef } from '../components/ui';
import type { Task } from '../types';
import { Layers, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { cn } from '../utils/cn';

export const DashboardPage: React.FC = () => {
  const { isLoading } = useBoardData();
  const { tasks, sprints, users } = useBoardStore();
  const [selectedSprintId, setSelectedSprintId] = useState<string>('3');

  const activeSprint = useMemo(() => {
    return sprints.find((s) => String(s.id) === selectedSprintId) || sprints[sprints.length - 1];
  }, [sprints, selectedSprintId]);

  // Tasks belonging to selected sprint
  const sprintTasks = useMemo(() => {
    return tasks.filter((t) => Number(t.sprintId) === (activeSprint?.id || 3));
  }, [tasks, activeSprint]);

  // Derive metrics using centralized getAnalyticsSummary helper
  const summary = useMemo(
    () => getAnalyticsSummary(tasks, Number(selectedSprintId), sprints),
    [tasks, selectedSprintId, sprints]
  );

  const inProgressCount = useMemo(
    () => sprintTasks.filter((t) => t.status === 'in-progress' || t.status === 'review').length,
    [sprintTasks]
  );

  const sprintOptions = sprints.map((s) => ({
    value: String(s.id),
    label: `${s.name} ${s.id === 3 ? '(Active)' : ''}`,
    description: `${s.startDate} to ${s.endDate}`,
  }));

  const columns: ColumnDef<Task>[] = [
    {
      header: 'Task Title',
      accessorKey: 'title',
      cell: (row) => (
        <span className="font-semibold text-neutral-900 dark:text-white leading-snug">
          {row.title}
        </span>
      ),
    },
    {
      header: 'Status',
      cell: (row) => (
        <span
          className={cn(
            'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize border',
            row.status === 'done'
              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
              : row.status === 'in-progress'
              ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
              : row.status === 'review'
              ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
              : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700'
          )}
        >
          {row.status.replace('-', ' ')}
        </span>
      ),
    },
    {
      header: 'Priority',
      cell: (row) => (
        <span
          className={cn(
            'inline-flex items-center gap-1 text-xs font-semibold capitalize',
            row.priority === 'high'
              ? 'text-rose-600 dark:text-rose-400'
              : row.priority === 'medium'
              ? 'text-amber-600 dark:text-amber-400'
              : 'text-emerald-600 dark:text-emerald-400'
          )}
        >
          <span
            className={cn(
              'w-1.5 h-1.5 rounded-full',
              row.priority === 'high' ? 'bg-rose-500' : row.priority === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'
            )}
          />
          {row.priority}
        </span>
      ),
    },
    {
      header: 'Assignee',
      cell: (row) => {
        const user = users.find((u) => u.id === row.assigneeId);
        return user ? (
          <div className="flex items-center gap-2">
            <img src={user.avatar} alt={user.name} className="h-5 w-5 rounded-full object-cover" />
            <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">{user.name}</span>
          </div>
        ) : (
          <span className="text-xs text-neutral-400 italic">Unassigned</span>
        );
      },
    },
    {
      header: 'Due Date',
      cell: (row) => (
        <span className="text-xs text-neutral-600 dark:text-neutral-400 font-mono">
          {row.dueDate ? new Date(row.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Bar with Custom Sprint Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-neutral-200/80 dark:border-neutral-800 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
            Dashboard Overview
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
            Real-time sprint progress, task completion metrics, and workload distribution.
          </p>
        </div>

        <div className="w-full sm:w-64">
          <CustomSelect
            options={sprintOptions}
            value={selectedSprintId}
            onChange={(val) => setSelectedSprintId(String(val))}
            ariaLabel="Select Sprint"
          />
        </div>
      </div>

      {/* Active Sprint Metrics Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Active Sprint Card */}
          <div className="p-5 bg-neutral-50/80 dark:bg-neutral-900/60 border border-neutral-200/80 dark:border-neutral-800 rounded-2xl shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
                Sprint Target
              </span>
              <Layers className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            </div>
            <p className="text-2xl font-extrabold text-neutral-900 dark:text-white mt-2">
              {summary.selectedSprintName}
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 font-mono">
              {activeSprint?.startDate} → {activeSprint?.endDate}
            </p>
          </div>

          {/* Active Sprint Tasks & Completion Rate */}
          <div className="p-5 bg-neutral-50/80 dark:bg-neutral-900/60 border border-neutral-200/80 dark:border-neutral-800 rounded-2xl shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
                Total Sprint Tasks
              </span>
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="text-2xl font-extrabold text-neutral-900 dark:text-white mt-2">
              {summary.selectedSprintTasks} Tasks
            </p>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-semibold">
              {summary.selectedSprintCompletionRate}% completion rate ({summary.selectedSprintCompletedTasks} done)
            </p>
          </div>

          {/* In-Progress & Review Workload */}
          <div className="p-5 bg-neutral-50/80 dark:bg-neutral-900/60 border border-neutral-200/80 dark:border-neutral-800 rounded-2xl shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
                In-Progress Workload
              </span>
              <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
            <p className="text-2xl font-extrabold text-neutral-900 dark:text-white mt-2">
              {inProgressCount} Active
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              Currently in progress or under review
            </p>
          </div>

          {/* Overdue Items */}
          <div className="p-5 bg-neutral-50/80 dark:bg-neutral-900/60 border border-neutral-200/80 dark:border-neutral-800 rounded-2xl shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
                Attention Required
              </span>
              <AlertTriangle className="h-4 w-4 text-rose-600 dark:text-rose-400" />
            </div>
            <p className="text-2xl font-extrabold text-neutral-900 dark:text-white mt-2">
              {summary.overdueTasks} Overdue
            </p>
            <p className="text-xs text-rose-600 dark:text-rose-400 mt-1 font-semibold">
              {summary.overdueTasks > 0 ? 'Requires immediate focus' : 'All tasks on schedule'}
            </p>
          </div>
        </div>
      )}

      {/* Active Sprint Tasks DataTable */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-extrabold tracking-tight text-neutral-900 dark:text-white">
            {summary.selectedSprintName} Task Overview ({sprintTasks.length})
          </h2>
          <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
            Showing tasks for {summary.selectedSprintName}
          </span>
        </div>

        <DataTable columns={columns} data={sprintTasks} />
      </div>
    </div>
  );
};
