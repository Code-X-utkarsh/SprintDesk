import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import {
  getSprintVelocity,
  getTaskStatusDistribution,
  getPriorityBreakdown,
  getCompletionTrend,
  getAnalyticsSummary,
} from '../utils/analytics';
import { useBoardStore } from '../stores/useBoardStore';
import { useAuthStore } from '../stores/useAuthStore';
import { routes } from '../app/router';
import { AppProviders } from '../app/providers';
import type { Task, Sprint } from '../types';

const mockSprints: Sprint[] = [
  { id: 1, name: 'Sprint 1', startDate: '2026-08-01', endDate: '2026-08-12' },
  { id: 2, name: 'Sprint 2', startDate: '2026-08-13', endDate: '2026-08-24' },
];

const mockTasks: Task[] = [
  {
    id: 1,
    title: 'Task A',
    description: 'Task A desc',
    status: 'done',
    priority: 'high',
    assigneeId: 1,
    dueDate: '2026-08-10',
    sprintId: 1,
    order: 1,
    createdAt: '2026-08-02T10:00:00Z',
    completedAt: '2026-08-05T14:30:00Z',
    updatedAt: '2026-08-05T14:30:00Z',
  },
  {
    id: 2,
    title: 'Task B',
    description: 'Task B desc',
    status: 'in-progress',
    priority: 'medium',
    assigneeId: 2,
    dueDate: '2026-08-20',
    sprintId: 2,
    order: 1,
    createdAt: '2026-08-14T09:00:00Z',
    completedAt: null,
    updatedAt: '2026-08-14T09:00:00Z',
  },
  {
    id: 3,
    title: 'Task C',
    description: 'Task C desc',
    status: 'backlog',
    priority: 'low',
    assigneeId: 1,
    dueDate: '2026-08-22',
    sprintId: 2,
    order: 2,
    createdAt: '2026-08-15T09:00:00Z',
    completedAt: null,
    updatedAt: '2026-08-15T09:00:00Z',
  },
];

describe('Analytics Transformation Layer Unit Tests', () => {
  it('calculates Sprint Velocity accurately', () => {
    const velocity = getSprintVelocity(mockTasks, mockSprints);
    expect(velocity).toHaveLength(2);
    expect(velocity[0].completedTasks).toBe(1);
    expect(velocity[0].totalTasks).toBe(1);
    expect(velocity[1].completedTasks).toBe(0);
    expect(velocity[1].totalTasks).toBe(2);
  });

  it('calculates Task Status Distribution', () => {
    const distribution = getTaskStatusDistribution(mockTasks);
    expect(distribution).toHaveLength(4);
    expect(distribution.find((d) => d.status === 'done')?.value).toBe(1);
    expect(distribution.find((d) => d.status === 'in-progress')?.value).toBe(1);
    expect(distribution.find((d) => d.status === 'backlog')?.value).toBe(1);
    expect(distribution.find((d) => d.status === 'review')?.value).toBe(0);
  });

  it('calculates Priority Breakdown across statuses', () => {
    const breakdown = getPriorityBreakdown(mockTasks);
    expect(breakdown).toHaveLength(4);
    
    const doneStage = breakdown.find((b) => b.status === 'done');
    expect(doneStage?.High).toBe(1);
    expect(doneStage?.Medium).toBe(0);

    const inProgressStage = breakdown.find((b) => b.status === 'in-progress');
    expect(inProgressStage?.Medium).toBe(1);
  });

  it('calculates Completion Trend chronologically', () => {
    const trend = getCompletionTrend(mockTasks);
    expect(trend).toHaveLength(1);
    expect(trend[0].completed).toBe(1);
    expect(trend[0].cumulative).toBe(1);
  });

  it('calculates Summary KPI metrics', () => {
    const summary = getAnalyticsSummary(mockTasks);
    expect(summary.totalTasks).toBe(3);
    expect(summary.completedTasks).toBe(1);
    expect(summary.completionRate).toBe(33);
  });

  it('handles empty tasks list safely without throwing', () => {
    expect(getSprintVelocity([], mockSprints)).toHaveLength(2);
    expect(getTaskStatusDistribution([])).toHaveLength(4);
    expect(getPriorityBreakdown([])).toHaveLength(4);
    expect(getCompletionTrend([])).toHaveLength(0);

    const summary = getAnalyticsSummary([]);
    expect(summary.totalTasks).toBe(0);
    expect(summary.completedTasks).toBe(0);
    expect(summary.completionRate).toBe(0);
  });
});

describe('Analytics Page Integration & Dynamic Reactivity Tests', () => {
  beforeEach(() => {
    useAuthStore.getState().setAuth(
      { id: 1, username: 'emilys', email: 'emily@example.com', firstName: 'Emily', lastName: 'Johnson' },
      'mock_token'
    );
    useBoardStore.getState().resetBoard({
      tasks: mockTasks,
      users: [],
      comments: [],
      sprints: mockSprints,
    });
  });

  it('renders Analytics page KPI summary cards and chart titles', async () => {
    const testRouter = createMemoryRouter(routes, { initialEntries: ['/analytics'] });

    render(
      <AppProviders>
        <RouterProvider router={testRouter} />
      </AppProviders>
    );

    await waitFor(
      () => {
        expect(screen.getByText('Sprint & Productivity Analytics')).toBeInTheDocument();
        expect(screen.getByText('Total Tasks')).toBeInTheDocument();
        expect(screen.getByText('Sprint Velocity')).toBeInTheDocument();
        expect(screen.getByText('Task Status Distribution')).toBeInTheDocument();
        expect(screen.getByText('Priority Breakdown Across Workflow Stages')).toBeInTheDocument();
        expect(screen.getByText('Cumulative Task Completion Trend')).toBeInTheDocument();
      },
      { timeout: 4000 }
    );
  });

  it('updates analytics summary dynamically when board task status changes', async () => {
    const testRouter = createMemoryRouter(routes, { initialEntries: ['/analytics'] });

    render(
      <AppProviders>
        <RouterProvider router={testRouter} />
      </AppProviders>
    );

    await waitFor(
      () => {
        expect(screen.getByText('33% completion rate')).toBeInTheDocument();
      },
      { timeout: 4000 }
    );

    // Move Task 2 ('in-progress') to 'done'
    act(() => {
      useBoardStore.getState().updateTask(2, { status: 'done' });
    });

    await waitFor(() => {
      expect(screen.getByText('67% completion rate')).toBeInTheDocument();
    });
  });
});
