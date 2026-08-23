import { describe, it, expect } from 'vitest';
import canonicalMockData from '../data/mock-data.json';

describe('Canonical Mock Data Source & Data Integrity Audit Suite', () => {
  it('verifies the canonical dataset contains exactly 30 tasks', () => {
    expect(canonicalMockData.tasks).toBeDefined();
    expect(canonicalMockData.tasks).toHaveLength(30);
  });

  it('verifies the canonical dataset contains exactly 6 users', () => {
    expect(canonicalMockData.users).toBeDefined();
    expect(canonicalMockData.users).toHaveLength(6);
    canonicalMockData.users.forEach((user) => {
      expect(user.id).toBeDefined();
      expect(user.name).toBeDefined();
      expect(user.email).toBeDefined();
      expect(user.avatar).toBeDefined();
    });
  });

  it('verifies the canonical dataset contains exactly 3 sprints with valid dates', () => {
    expect(canonicalMockData.sprints).toBeDefined();
    expect(canonicalMockData.sprints).toHaveLength(3);

    const sprint1 = canonicalMockData.sprints.find((s) => s.id === 1);
    const sprint2 = canonicalMockData.sprints.find((s) => s.id === 2);
    const sprint3 = canonicalMockData.sprints.find((s) => s.id === 3);

    expect(sprint1).toEqual({ id: 1, name: 'Sprint 1', startDate: '2026-07-20', endDate: '2026-07-31' });
    expect(sprint2).toEqual({ id: 2, name: 'Sprint 2', startDate: '2026-08-03', endDate: '2026-08-14' });
    expect(sprint3).toEqual({ id: 3, name: 'Sprint 3', startDate: '2026-08-17', endDate: '2026-08-28' });
  });

  it('verifies Sprint 3 contains exactly 18 source tasks', () => {
    const sprint3Tasks = canonicalMockData.tasks.filter((t) => t.sprintId === 3);
    expect(sprint3Tasks).toHaveLength(18);
  });

  it('verifies all task assignees resolve against the six canonical users', () => {
    const validUserIds = new Set(canonicalMockData.users.map((u) => u.id));
    canonicalMockData.tasks.forEach((task) => {
      expect(validUserIds.has(task.assigneeId)).toBe(true);
    });
  });

  it('verifies comments and notifications exist in the canonical dataset', () => {
    expect(canonicalMockData.comments.length).toBeGreaterThan(0);
    expect(canonicalMockData.notifications.length).toBeGreaterThan(0);
  });
});
