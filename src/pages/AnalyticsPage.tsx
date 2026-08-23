import React, { useMemo } from 'react';
import { useBoardData } from '../hooks/useBoardData';
import { useBoardStore } from '../stores/useBoardStore';
import {
  getAnalyticsSummary,
  getSprintVelocity,
  getTaskStatusDistribution,
  getPriorityBreakdown,
  getCompletionTrend,
} from '../utils/analytics';
import {
  SprintVelocityChart,
  TaskStatusChart,
  PriorityBreakdownChart,
  CompletionTrendChart,
} from '../components/analytics';
import { SkeletonCard, Button } from '../components/ui';
import { CheckCircle2, ListTodo, AlertTriangle, TrendingUp, RefreshCw } from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const { isLoading, refetch } = useBoardData();
  const { tasks, sprints } = useBoardStore();

  // Derive analytics using pure transformation functions wrapped in useMemo
  const summary = useMemo(() => getAnalyticsSummary(tasks), [tasks]);
  const velocityData = useMemo(() => getSprintVelocity(tasks, sprints), [tasks, sprints]);
  const statusData = useMemo(() => getTaskStatusDistribution(tasks), [tasks]);
  const priorityData = useMemo(() => getPriorityBreakdown(tasks), [tasks]);
  const trendData = useMemo(() => getCompletionTrend(tasks), [tasks]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Sprint & Productivity Analytics
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time analytics derived dynamically from active board state and sprint datasets.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
            onClick={() => refetch()}
          >
            Refresh Analytics
          </Button>
        </div>
      </div>

      {/* Summary KPI Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Tasks */}
          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Total Tasks
              </p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {summary.totalTasks}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">Across 4 workflow stages</p>
            </div>
            <div className="p-3 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <ListTodo className="h-6 w-6" />
            </div>
          </div>

          {/* Completed Tasks */}
          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Completed
              </p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {summary.completedTasks}
              </p>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5 font-medium">
                {summary.completionRate}% completion rate
              </p>
            </div>
            <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-6 w-6" />
            </div>
          </div>

          {/* Overdue Tasks */}
          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Overdue Tasks
              </p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {summary.overdueTasks}
              </p>
              <p className="text-[11px] text-rose-500 mt-0.5 font-medium">Requires immediate focus</p>
            </div>
            <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
              <AlertTriangle className="h-6 w-6" />
            </div>
          </div>

          {/* Active Sprint Scope */}
          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Sprint 3 Scope
              </p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {summary.activeSprintTasks}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">Active sprint task count</p>
            </div>
            <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <TrendingUp className="h-6 w-6" />
            </div>
          </div>
        </div>
      )}

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Sprint Velocity */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs">
          <div className="mb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Sprint Velocity
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Completed tasks compared to total allocated tasks per sprint.
            </p>
          </div>
          <SprintVelocityChart data={velocityData} />
        </div>

        {/* Chart 2: Task Status Distribution */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs">
          <div className="mb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Task Status Distribution
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Current breakdown of tasks across Backlog, In Progress, Review, and Done.
            </p>
          </div>
          <TaskStatusChart data={statusData} />
        </div>

        {/* Chart 3: Priority Breakdown Across Stages */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs">
          <div className="mb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Priority Breakdown Across Workflow Stages
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Stacked distribution of High, Medium, and Low priority items per stage.
            </p>
          </div>
          <PriorityBreakdownChart data={priorityData} />
        </div>

        {/* Chart 4: Task Completion Trend */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs">
          <div className="mb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Cumulative Task Completion Trend
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Chronological progress of completed tasks over time.
            </p>
          </div>
          <CompletionTrendChart data={trendData} />
        </div>
      </div>
    </div>
  );
};
