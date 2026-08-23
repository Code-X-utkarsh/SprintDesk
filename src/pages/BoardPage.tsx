import React, { useState, useMemo, useCallback } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useBoardData } from '../hooks/useBoardData';
import { useBoardStore } from '../stores/useBoardStore';
import { BoardColumn } from '../components/board/BoardColumn';
import { TaskCard } from '../components/board/TaskCard';
import { TaskDrawer } from '../components/board/TaskDrawer';
import { TaskCreateModal } from '../components/board/TaskCreateModal';
import { DeleteTaskConfirmModal } from '../components/board/DeleteTaskConfirmModal';
import { Button, Input, Select, Skeleton } from '../components/ui';
import type { Task, TaskStatus } from '../types';
import { Plus, RotateCcw, Search } from 'lucide-react';

const COLUMNS: Array<{ status: TaskStatus; title: string }> = [
  { status: 'backlog', title: 'Backlog' },
  { status: 'in-progress', title: 'In Progress' },
  { status: 'review', title: 'Review' },
  { status: 'done', title: 'Done' },
];

export const BoardPage: React.FC = () => {
  const { isLoading, isBoardReady } = useBoardData();
  const {
    tasks,
    users,
    moveTask,
    openCreateModal,
    resetBoard,
  } = useBoardStore();

  const [activeTask, setActiveTask] = useState<Task | null>(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');

  // Configure DnD Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Requires moving 5px before drag activates to preserve clicks
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Filter tasks based on search and filters
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const matchesSearch =
        !searchQuery ||
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesPriority = priorityFilter === 'all' || t.priority === priorityFilter;
      const matchesAssignee = assigneeFilter === 'all' || String(t.assigneeId) === assigneeFilter;

      return matchesSearch && matchesPriority && matchesAssignee;
    });
  }, [tasks, searchQuery, priorityFilter, assigneeFilter]);

  // Group tasks by column status
  const tasksByColumn = useMemo(() => {
    const map: Record<TaskStatus, Task[]> = {
      backlog: [],
      'in-progress': [],
      review: [],
      done: [],
    };

    filteredTasks.forEach((t) => {
      if (map[t.status]) {
        map[t.status].push(t);
      }
    });

    // Sort tasks in each column by order
    Object.keys(map).forEach((col) => {
      map[col as TaskStatus].sort((a, b) => a.order - b.order);
    });

    return map;
  }, [filteredTasks]);

  // Drag Event Handlers
  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const { active } = event;
      const task = tasks.find((t) => t.id === Number(active.id));
      if (task) {
        setActiveTask(task);
      }
    },
    [tasks]
  );

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const { active, over } = event;
      if (!over) return;

      const activeId = Number(active.id);
      const overId = over.id;

      const activeTaskItem = tasks.find((t) => t.id === activeId);
      if (!activeTaskItem) return;

      let targetStatus: TaskStatus | null = null;

      if (COLUMNS.some((col) => col.status === overId)) {
        targetStatus = overId as TaskStatus;
      } else {
        const overTask = tasks.find((t) => t.id === Number(overId));
        if (overTask) {
          targetStatus = overTask.status;
        }
      }

      if (targetStatus && activeTaskItem.status !== targetStatus) {
        const targetColumnTasks = tasksByColumn[targetStatus];
        moveTask(activeId, targetStatus, targetColumnTasks.length);
      }
    },
    [tasks, tasksByColumn, moveTask]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveTask(null);

      if (!over) return;

      const activeId = Number(active.id);
      const overId = over.id;

      const activeTaskItem = tasks.find((t) => t.id === activeId);
      if (!activeTaskItem) return;

      let targetStatus = activeTaskItem.status;
      let targetIndex = 0;

      if (COLUMNS.some((col) => col.status === overId)) {
        targetStatus = overId as TaskStatus;
        targetIndex = tasksByColumn[targetStatus].length;
      } else {
        const overTask = tasks.find((t) => t.id === Number(overId));
        if (overTask) {
          targetStatus = overTask.status;
          const colTasks = tasksByColumn[targetStatus];
          targetIndex = colTasks.findIndex((t) => t.id === overTask.id);
        }
      }

      moveTask(activeId, targetStatus, targetIndex);
    },
    [tasks, tasksByColumn, moveTask]
  );

  const userOptions = [
    { value: 'all', label: 'All Assignees' },
    ...users.map((u) => ({ value: String(u.id), label: u.name })),
  ];

  return (
    <div className="space-y-6">
      {/* Top Header & Action Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Sprint 3 Kanban Board
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Drag tasks across workflow stages to update status and reorder priorities.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<RotateCcw className="h-3.5 w-3.5" />}
            onClick={() => resetBoard()}
            title="Reset board data to initial mock dataset"
          >
            Reset Board
          </Button>

          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={openCreateModal}
          >
            Create Task
          </Button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
        <Input
          placeholder="Filter tasks by title or keyword..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          leftIcon={<Search className="h-4 w-4" />}
        />

        <Select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          options={[
            { value: 'all', label: 'All Priorities' },
            { value: 'high', label: 'High Priority' },
            { value: 'medium', label: 'Medium Priority' },
            { value: 'low', label: 'Low Priority' },
          ]}
        />

        <Select
          value={assigneeFilter}
          onChange={(e) => setAssigneeFilter(e.target.value)}
          options={userOptions}
        />
      </div>

      {/* Board Columns & DnD Context */}
      {!isBoardReady || isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {COLUMNS.map((col) => (
            <div key={col.status} className="bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-24 w-full rounded-lg" />
              <Skeleton className="h-24 w-full rounded-lg" />
            </div>
          ))}
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          {/* Responsive 4-Column Layout */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 overflow-x-auto pb-4">
            {COLUMNS.map((col) => (
              <BoardColumn
                key={col.status}
                status={col.status}
                title={col.title}
                tasks={tasksByColumn[col.status]}
              />
            ))}
          </div>

          {/* Active Drag Overlay preview */}
          <DragOverlay>
            {activeTask ? <TaskCard task={activeTask} /> : null}
          </DragOverlay>
        </DndContext>
      )}

      {/* Feature Modals & Drawer */}
      <TaskDrawer />
      <TaskCreateModal />
      <DeleteTaskConfirmModal />
    </div>
  );
};
