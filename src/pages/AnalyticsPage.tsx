import React, { useState, useMemo } from 'react';
import { useBoardData } from '../hooks/useBoardData';
import { useBoardStore } from '../stores/useBoardStore';
import {
  getAnalyticsSummary,
  getSprintVelocity,
  getTaskStatusDistribution,
  getPriorityBreakdown,
  getCompletionTrend,
} from '../utils/analytics';
import { getRecentActivity } from '../utils/activityUtils';
import {
  SprintVelocityChart,
  TaskStatusChart,
  PriorityBreakdownChart,
  CompletionTrendChart,
  RecentActivityFeed,
} from '../components/analytics';
import { CustomSelect, Skeleton, Button } from '../components/ui';
import { CheckCircle2, ListTodo, AlertTriangle, Target, RefreshCw } from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const { isLoading, refetch } = useBoardData();
  const { tasks, sprints, comments, users } = useBoardStore();
  const [selectedSprintId, setSelectedSprintId] = useState<string>('3');

  // Pure memoized transformation calls
  const summary = useMemo(
    () => getAnalyticsSummary(tasks, Number(selectedSprintId), sprints),
    [tasks, selectedSprintId, sprints]
  );

  const velocityData = useMemo(() => getSprintVelocity(tasks, sprints), [tasks, sprints]);
  const statusData = useMemo(() => getTaskStatusDistribution(tasks), [tasks]);
  const priorityData = useMemo(() => getPriorityBreakdown(tasks), [tasks]);
  const trendData = useMemo(() => getCompletionTrend(tasks), [tasks]);

  const recentActivities = useMemo(
    () => getRecentActivity(tasks, comments, users, 6),
    [tasks, comments, users]
  );

  const sprintOptions = sprints.map((s) => ({
    value: String(s.id),
    label: `${s.name} ${s.id === 3 ? '(Active)' : ''}`,
    description: `${s.startDate} to ${s.endDate}`,
  }));

  return (
    <div className="space-y-6">
      {/* Top Header Bar with Custom Sprint Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-neutral-200/80 dark:border-neutral-800 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
            Sprint & Productivity Analytics
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
            Real-time analytics derived dynamically from active board state and sprint datasets.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          <div className="w-full sm:w-64">
            <CustomSelect
              options={sprintOptions}
              value={selectedSprintId}
              onChange={(val) => setSelectedSprintId(String(val))}
              ariaLabel="Select Sprint Filter"
            />
          </div>

          <Button
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
            onClick={() => refetch()}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary KPI Cards Grid (Explicit Distinction between Global & Sprint Scope) */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Tasks (Global Application Metric) */}
          <div className="p-5 bg-neutral-50/80 dark:bg-neutral-900/60 border border-neutral-200/80 dark:border-neutral-800 rounded-2xl shadow-2xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                Total Tasks
              </p>
              <p className="text-2xl font-extrabold text-neutral-900 dark:text-white mt-1">
                {summary.totalTasks}
              </p>
              <p className="text-[11px] text-neutral-400 mt-0.5">Global application dataset</p>
            </div>
            <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
              <ListTodo className="h-5 w-5" />
            </div>
          </div>

          {/* Card 2: Completed Tasks (Global Application Metric) */}
          <div className="p-5 bg-neutral-50/80 dark:bg-neutral-900/60 border border-neutral-200/80 dark:border-neutral-800 rounded-2xl shadow-2xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                Completed
              </p>
              <p className="text-2xl font-extrabold text-neutral-900 dark:text-white mt-1">
                {summary.completedTasks}
              </p>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5 font-semibold">
                {summary.completionRate}% global completion rate
              </p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>

          {/* Card 3: Overdue Tasks (Global Application Metric) */}
          <div className="p-5 bg-neutral-50/80 dark:bg-neutral-900/60 border border-neutral-200/80 dark:border-neutral-800 rounded-2xl shadow-2xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                Overdue Tasks
              </p>
              <p className="text-2xl font-extrabold text-neutral-900 dark:text-white mt-1">
                {summary.overdueTasks}
              </p>
              <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-0.5 font-semibold">
                {summary.overdueTasks > 0 ? 'Requires immediate focus' : 'All deadlines on track'}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>

          {/* Card 4: Selected Sprint Scope (Sprint-Specific Metric) */}
          <div className="p-5 bg-neutral-50/80 dark:bg-neutral-900/60 border border-neutral-200/80 dark:border-neutral-800 rounded-2xl shadow-2xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                {summary.selectedSprintName} Scope
              </p>
              <p className="text-2xl font-extrabold text-neutral-900 dark:text-white mt-1">
                {summary.selectedSprintTasks} Tasks
              </p>
              <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-0.5 font-semibold">
                {summary.selectedSprintCompletionRate}% sprint completion rate ({summary.selectedSprintCompletedTasks} done)
              </p>
            </div>
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
              <Target className="h-5 w-5" />
            </div>
          </div>
        </div>
      )}

      {/* Main Charts 2x2 Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Sprint Velocity */}
        <div className="p-5 bg-neutral-50/80 dark:bg-neutral-900/60 border border-neutral-200/80 dark:border-neutral-800 rounded-2xl shadow-2xs">
          <div className="mb-4">
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">
              Sprint Velocity
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Completed tasks compared to total allocated tasks across official sprints.
            </p>
          </div>
          <SprintVelocityChart data={velocityData} />
        </div>

        {/* Chart 2: Task Status Distribution */}
        <div className="p-5 bg-neutral-50/80 dark:bg-neutral-900/60 border border-neutral-200/80 dark:border-neutral-800 rounded-2xl shadow-2xs">
          <div className="mb-4">
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">
              Task Status Distribution
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Current breakdown of tasks across Backlog, In Progress, Review, and Done.
            </p>
          </div>
          <TaskStatusChart data={statusData} />
        </div>

        {/* Chart 3: Priority Breakdown Across Stages */}
        <div className="p-5 bg-neutral-50/80 dark:bg-neutral-900/60 border border-neutral-200/80 dark:border-neutral-800 rounded-2xl shadow-2xs">
          <div className="mb-4">
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">
              Priority Breakdown Across Workflow Stages
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Stacked distribution of High, Medium, and Low priority items per stage.
            </p>
          </div>
          <PriorityBreakdownChart data={priorityData} />
        </div>

        {/* Chart 4: Task Completion Trend */}
        <div className="p-5 bg-neutral-50/80 dark:bg-neutral-900/60 border border-neutral-200/80 dark:border-neutral-800 rounded-2xl shadow-2xs">
          <div className="mb-4">
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">
              Cumulative Task Completion Trend
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Chronological progress of completed tasks over time.
            </p>
          </div>
          <CompletionTrendChart data={trendData} />
        </div>
      </div>

      {/* Recent Activity Section (Derived from authentic task & comment domain events) */}
      <RecentActivityFeed activities={recentActivities} />
    </div>
  );
};
