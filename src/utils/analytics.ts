import type { Task, Sprint, TaskStatus } from '../types';

export interface SprintVelocityItem {
  sprintId: number;
  name: string;
  completedTasks: number;
  totalTasks: number;
}

export interface TaskStatusItem {
  name: string;
  status: TaskStatus;
  value: number;
  color: string;
}

export interface PriorityBreakdownItem {
  statusLabel: string;
  status: TaskStatus;
  High: number;
  Medium: number;
  Low: number;
}

export interface CompletionTrendItem {
  date: string;
  completed: number;
  cumulative: number;
}

export interface AnalyticsSummary {
  totalTasks: number;
  completedTasks: number;
  completionRate: number; // Percentage (0 - 100)
  overdueTasks: number;
  activeSprintTasks: number;
}

const STATUS_COLORS: Record<TaskStatus, string> = {
  backlog: '#64748b', // Slate
  'in-progress': '#6366f1', // Indigo
  review: '#f59e0b', // Amber
  done: '#10b981', // Emerald
};

const STATUS_LABELS: Record<TaskStatus, string> = {
  backlog: 'Backlog',
  'in-progress': 'In Progress',
  review: 'Review',
  done: 'Done',
};

/**
 * Derives Sprint Velocity data (completed tasks per sprint)
 */
export function getSprintVelocity(tasks: Task[] = [], sprints: Sprint[] = []): SprintVelocityItem[] {
  if (!Array.isArray(sprints) || sprints.length === 0) return [];

  const safeTasks = Array.isArray(tasks) ? tasks : [];

  return sprints.map((sprint) => {
    const sprintTasks = safeTasks.filter((t) => t.sprintId === sprint.id);
    const completedTasks = sprintTasks.filter(
      (t) => t.status === 'done' || Boolean(t.completedAt)
    ).length;

    return {
      sprintId: sprint.id,
      name: sprint.name,
      completedTasks,
      totalTasks: sprintTasks.length,
    };
  });
}

/**
 * Derives Task Status Distribution (counts per workflow stage)
 */
export function getTaskStatusDistribution(tasks: Task[] = []): TaskStatusItem[] {
  const safeTasks = Array.isArray(tasks) ? tasks : [];
  const statusCounts: Record<TaskStatus, number> = {
    backlog: 0,
    'in-progress': 0,
    review: 0,
    done: 0,
  };

  safeTasks.forEach((t) => {
    if (t.status && statusCounts[t.status] !== undefined) {
      statusCounts[t.status]++;
    }
  });

  return (Object.keys(statusCounts) as TaskStatus[]).map((status) => ({
    name: STATUS_LABELS[status],
    status,
    value: statusCounts[status],
    color: STATUS_COLORS[status],
  }));
}

/**
 * Derives Priority Breakdown across status columns (Stacked bar format)
 */
export function getPriorityBreakdown(tasks: Task[] = []): PriorityBreakdownItem[] {
  const safeTasks = Array.isArray(tasks) ? tasks : [];
  const statuses: TaskStatus[] = ['backlog', 'in-progress', 'review', 'done'];

  return statuses.map((status) => {
    const columnTasks = safeTasks.filter((t) => t.status === status);
    const high = columnTasks.filter((t) => t.priority === 'high').length;
    const medium = columnTasks.filter((t) => t.priority === 'medium').length;
    const low = columnTasks.filter((t) => t.priority === 'low').length;

    return {
      statusLabel: STATUS_LABELS[status],
      status,
      High: high,
      Medium: medium,
      Low: low,
    };
  });
}

/**
 * Derives Task Completion Trend over time based on completedAt timestamps
 */
export function getCompletionTrend(tasks: Task[] = []): CompletionTrendItem[] {
  const safeTasks = Array.isArray(tasks) ? tasks : [];

  // Filter tasks that are done and have a valid completedAt date
  const completedTasks = safeTasks.filter(
    (t) => t.status === 'done' && Boolean(t.completedAt)
  );

  if (completedTasks.length === 0) return [];

  // Group task completions by YYYY-MM-DD
  const dateMap: Record<string, number> = {};

  completedTasks.forEach((t) => {
    try {
      const dateStr = new Date(t.completedAt!).toISOString().split('T')[0];
      dateMap[dateStr] = (dateMap[dateStr] || 0) + 1;
    } catch {
      // Ignore malformed dates
    }
  });

  const sortedDates = Object.keys(dateMap).sort();

  let cumulative = 0;
  return sortedDates.map((dateKey) => {
    const count = dateMap[dateKey];
    cumulative += count;

    // Format date for readable XAxis display (e.g. "Aug 18")
    const formattedDate = new Date(dateKey + 'T00:00:00Z').toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });

    return {
      date: formattedDate,
      completed: count,
      cumulative,
    };
  });
}

/**
 * Derives Summary KPI metrics from current tasks
 */
export function getAnalyticsSummary(tasks: Task[] = []): AnalyticsSummary {
  const safeTasks = Array.isArray(tasks) ? tasks : [];
  const totalTasks = safeTasks.length;
  const completedTasks = safeTasks.filter(
    (t) => t.status === 'done' || Boolean(t.completedAt)
  ).length;

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const now = new Date().setHours(0, 0, 0, 0);
  const overdueTasks = safeTasks.filter((t) => {
    if (!t.dueDate || t.status === 'done') return false;
    try {
      return new Date(t.dueDate).getTime() < now;
    } catch {
      return false;
    }
  }).length;

  const activeSprintTasks = safeTasks.filter((t) => t.sprintId === 3).length;

  return {
    totalTasks,
    completedTasks,
    completionRate,
    overdueTasks,
    activeSprintTasks,
  };
}
