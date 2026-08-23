import type { Task, TaskComment, User } from '../types';

export type ActivityType = 'task_completed' | 'comment_added' | 'task_updated' | 'task_created';

export interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: string;
  formattedDate: string;
  user: {
    name: string;
    avatar?: string;
    email?: string;
  };
}

/**
 * Pure transformation utility that derives an authentic Recent Activity feed
 * strictly from available domain tasks, comments, and users.
 * Zero fabricated events or timestamps.
 */
export function getRecentActivity(
  tasks: Task[] = [],
  comments: TaskComment[] = [],
  users: User[] = [],
  limit = 6
): ActivityItem[] {
  const safeTasks = Array.isArray(tasks) ? tasks : [];
  const safeComments = Array.isArray(comments) ? comments : [];
  const safeUsers = Array.isArray(users) ? users : [];

  const getUser = (userId: number): { name: string; avatar?: string; email?: string } => {
    const found = safeUsers.find((u) => u.id === userId);
    if (found) {
      return { name: found.name, avatar: found.avatar, email: found.email };
    }
    return { name: 'Team Member' };
  };

  const formatDate = (isoString: string): string => {
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return 'Recently';
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return 'Recently';
    }
  };

  const activities: ActivityItem[] = [];

  // 1. Derive task completion events
  safeTasks.forEach((task) => {
    if (task.status === 'done' || task.completedAt) {
      const timestamp = task.completedAt || task.updatedAt || task.createdAt;
      activities.push({
        id: `completed-task-${task.id}`,
        type: 'task_completed',
        title: 'Task completed',
        description: task.title,
        timestamp,
        formattedDate: formatDate(timestamp),
        user: getUser(task.assigneeId),
      });
    } else if (task.updatedAt && task.updatedAt !== task.createdAt) {
      // 2. Derive task status/update events
      activities.push({
        id: `updated-task-${task.id}`,
        type: 'task_updated',
        title: `Task updated (${task.status.replace('-', ' ')})`,
        description: task.title,
        timestamp: task.updatedAt,
        formattedDate: formatDate(task.updatedAt),
        user: getUser(task.assigneeId),
      });
    } else {
      // 3. Derive task creation events
      activities.push({
        id: `created-task-${task.id}`,
        type: 'task_created',
        title: 'Task created',
        description: task.title,
        timestamp: task.createdAt,
        formattedDate: formatDate(task.createdAt),
        user: getUser(task.assigneeId),
      });
    }
  });

  // 4. Derive comment events
  safeComments.forEach((comment) => {
    const parentTask = safeTasks.find((t) => t.id === comment.taskId);
    activities.push({
      id: `comment-${comment.id}`,
      type: 'comment_added',
      title: 'Comment added',
      description: parentTask ? `Commented on "${parentTask.title}"` : comment.message,
      timestamp: comment.createdAt,
      formattedDate: formatDate(comment.createdAt),
      user: getUser(comment.authorId),
    });
  });

  // Sort chronologically descending (newest timestamp first)
  activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // Return top limited items
  return activities.slice(0, limit);
}
