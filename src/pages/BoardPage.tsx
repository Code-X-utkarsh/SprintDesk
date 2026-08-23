import React, { useState, useMemo, useCallback } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
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
import { Button, Input, CustomSelect, Skeleton } from '../components/ui';
import type { Task, TaskStatus } from '../types';
import { Plus, RotateCcw, Search, LayoutGrid, Table, BarChart2 } from 'lucide-react';
import { cn } from '../utils/cn';

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
    sprints,
    moveTask,
    openCreateModal,
    resetBoard,
  } = useBoardStore();

  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [activeViewTab, setActiveViewTab] = useState<'board' | 'table' | 'analytics'>('board');

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');

  const activeSprint = useMemo(() => {
    return sprints.find((s) => s.id === 3) || sprints[sprints.length - 1];
  }, [sprints]);

  // Configure DnD Sensors (Pointer for Mouse/Desktop, Touch for Mobile Touch Drag)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 8,
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

  const userSelectOptions = [
    { value: 'all', label: 'All Assignees' },
    ...users.map((u) => ({
      value: String(u.id),
      label: u.name,
      avatar: u.avatar,
      description: `@${u.email.split('@')[0]}`,
    })),
  ];

  const prioritySelectOptions = [
    { value: 'all', label: 'All Priorities' },
    { value: 'high', label: 'High Priority' },
    { value: 'medium', label: 'Medium Priority' },
    { value: 'low', label: 'Low Priority' },
  ];

  return (
    <div className="space-y-5">
      {/* Board Header Title & View Switcher Tabs */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-neutral-200/80 dark:border-neutral-800 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
            {activeSprint?.name || 'Sprint 3'} Board
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-0.5 font-mono">
            Timeline: {activeSprint?.startDate || '2026-08-17'} → {activeSprint?.endDate || '2026-08-28'} • Active Sprint
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* View Switcher Tabs */}
          <div className="flex items-center p-1 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200/80 dark:border-neutral-700">
            <button
              onClick={() => setActiveViewTab('board')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                activeViewTab === 'board'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-2xs'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
              )}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>Board</span>
            </button>
            <button
              onClick={() => setActiveViewTab('table')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                activeViewTab === 'table'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-2xs'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
              )}
            >
              <Table className="h-3.5 w-3.5" />
              <span>Table</span>
            </button>
            <button
              onClick={() => setActiveViewTab('analytics')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                activeViewTab === 'analytics'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-2xs'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
              )}
            >
              <BarChart2 className="h-3.5 w-3.5" />
              <span>Summary</span>
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            leftIcon={<RotateCcw className="h-3.5 w-3.5" />}
            onClick={() => resetBoard()}
            title="Reset board data to initial mock dataset"
          >
            Reset
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

      {/* Search & Custom Filter Controls Bar */}
      <div className="p-3.5 bg-neutral-50/80 dark:bg-neutral-900/60 border border-neutral-200/80 dark:border-neutral-800 rounded-2xl shadow-2xs grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
        <Input
          placeholder="Filter tasks by title..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          leftIcon={<Search className="h-4 w-4 text-neutral-400" />}
        />

        <CustomSelect
          options={prioritySelectOptions}
          value={priorityFilter}
          onChange={(val) => setPriorityFilter(String(val))}
          ariaLabel="Filter by Priority"
        />

        <CustomSelect
          options={userSelectOptions}
          value={assigneeFilter}
          onChange={(val) => setAssigneeFilter(String(val))}
          ariaLabel="Filter by Assignee"
        />
      </div>

      {/* Board Columns & DnD Context */}
      {!isBoardReady || isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {COLUMNS.map((col) => (
            <div key={col.status} className="bg-neutral-100/70 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 space-y-3">
              <Skeleton className="h-5 w-24 rounded-lg" />
              <Skeleton className="h-28 w-full rounded-2xl" />
              <Skeleton className="h-28 w-full rounded-2xl" />
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
          {/* Responsive 4-Column Layout (Horizontal Scroll Rail on Mobile, 4-Column Grid on Desktop) */}
          <div className="flex md:grid md:grid-cols-4 gap-4 overflow-x-auto pb-4 snap-x min-w-0">
            {COLUMNS.map((col) => (
              <BoardColumn
                key={col.status}
                status={col.status}
                title={col.title}
                tasks={tasksByColumn[col.status]}
              />
            ))}
          </div>

          {/* Active Drag Overlay preview with dashed active styling */}
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
