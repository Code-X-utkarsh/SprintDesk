# SprintDesk - Kanban Sprint Board & Task Management Study Guide

This guide details the Kanban workflow architecture, `@dnd-kit` drag-and-drop integration, Zustand board store mutations, side drawer details view, task CRUD operations, and `localStorage` persistence powering the **SprintDesk Kanban Board System**. It serves as a comprehensive reference for technical interviews.

---

## 1. Core Kanban & Drag-and-Drop Concepts

### 1. What a Kanban Board is
A Kanban board is an agile project management visual tool that represents work items as cards moving across vertical columns corresponding to workflow stages (`Backlog`, `In Progress`, `Review`, `Done`).

### 2. How Tasks Are Represented
Tasks are represented as strongly-typed JavaScript domain entities ([`Task`](../src/types/index.ts)) containing metadata: `id`, `title`, `description`, `status` (`backlog` | `in-progress` | `review` | `done`), `priority` (`low` | `medium` | `high`), `assigneeId`, `dueDate`, `sprintId`, `order`, `createdAt`, `completedAt`, `updatedAt`.

### 3. Why Board State Resides in Zustand
Interactive board operations (drag reordering, column movement, task CRUD, comment additions) occur frequently in real-time on the client. **Zustand** ([`useBoardStore.ts`](../src/stores/useBoardStore.ts)) acts as an unopinionated client state store that executes synchronous, predictable state mutations without React Context re-rendering penalties.

### 4. How TanStack Query Interacts with the Board
TanStack Query ([`useBoardData.ts`](../src/hooks/useBoardData.ts)) handles asynchronous server data fetching from `mock-data.json`, managing request lifecycles, caching, stale-time invalidation, and loading/error states before hydrating the client board store.

### 5. What `@dnd-kit` Provides
`@dnd-kit` is a lightweight, performant, accessible drag-and-drop library for React. It handles pointer collision detection, keyboard accessibility sensor events, auto-scroll animation, and sortable context list transformations.

### 6. Difference Between Droppable Container and Sortable Item
- **Draggable Item ([`TaskCard`](../src/components/board/TaskCard.tsx))**: Emits drag coordinates and attributes via `useSortable`.
- **Droppable Container ([`BoardColumn`](../src/components/board/BoardColumn.tsx))**: Listens for items dropped over its boundaries via `useDroppable`.

### 7. How Same-Column Reordering Works
When a task card is dropped onto another card within the same column, `@dnd-kit` returns `active.id` and `over.id`. `useBoardStore.moveTask()` finds their array indices, performs array element reordering (`arrayMove`), updates `order` properties, and saves the snapshot.

### 8. How Cross-Column Movement Works
When a task is dropped over a column container with a different status (e.g. from `In Progress` to `Review`), `useBoardStore.moveTask()` updates the task's `status` property to the target column status, sets its new `order` index, and updates timestamps (`completedAt` if moved to `Done`).

### 9. How Persistence Works
Every store action (`moveTask`, `addTask`, `updateTask`, `deleteTask`) calculates the new task order and calls [`boardStorage.savePersistedBoardState()`](../src/utils/boardStorage.ts) to save the snapshot to `localStorage`.

### 10. How Malformed Snapshot Storage is Handled
[`boardStorage.ts`](../src/utils/boardStorage.ts) isolates `localStorage` operations under `sprintdesk_board_state_v1`, storing a serialized `{ tasks, comments, version }` JSON payload. If storage is corrupted or malformed, schema validation logs a warning and falls back to baseline tasks from `mock-data.json`.

### 11. Difference Between Source Mock Data and Client Board State
Source `mock-data.json` is static baseline data. Client board state is dynamic, living in `useBoardStore` and `localStorage`. The source JSON is never mutated directly.

### 12. How the Task Details Drawer Works
[`TaskDrawer.tsx`](../src/components/board/TaskDrawer.tsx) reads `selectedTaskId` from `useBoardStore`. When an edit is saved or a comment is posted, it invokes `updateTask()` or `addComment()`, updating global Zustand state instantly.

### 13. How Task Creation and Deletion Work
- **Creation**: `TaskCreateModal.tsx` collects form inputs and invokes `useBoardStore.getState().addTask()`.
- **Deletion**: `DeleteTaskConfirmModal.tsx` confirms user intent and invokes `useBoardStore.getState().deleteTask()`.

### 14. How Task Comments Work
Task comments ([`TaskComment`](../src/types/index.ts)) contain `taskId` and `authorId`. The drawer filters `comments.filter(c => c.taskId === selectedTaskId)` and resolves `authorId` against `users` to display author avatars and names.

### 15. How Board Performance is Optimized
Visual components ([`TaskCard`](../src/components/board/TaskCard.tsx), [`BoardColumn`](../src/components/board/BoardColumn.tsx)) only handle presentational layout and DnD hooks. Presentational components are memoized with `React.memo`, drag handlers are memoized with `useCallback`, and store state updates trigger targeted component re-renders.

---

## 2. Key Component Walkthroughs & Interview Q&A

### Q1: Why did you use Zustand for board state instead of TanStack Query cache?
TanStack Query manages asynchronous server state lifecycles. However, drag-and-drop same-column reordering and cross-column status moves happen continuously on the client. Using Zustand allows instant synchronous UI mutations and local storage persistence without sending unnecessary network requests.

### Q2: How do you prevent board state loss on page refresh?
`useBoardData` checks `boardStorage.getPersistedBoardState()` during initialization. If valid local storage exists, it hydrates `useBoardStore`. Otherwise, it loads initial mock data from `mock-data.json`.

### Q3: How do you ensure drag-and-drop accessibility?
`@dnd-kit` includes `KeyboardSensor` for keyboard accessibility. Users can focus drag handles, press `Space` or `Enter` to pick up a card, use `Arrow` keys to navigate across columns, and press `Space` to drop.

---

## 3. Important Source Files Reference

- [`src/utils/boardStorage.ts`](../src/utils/boardStorage.ts): Local storage persistence helper with schema validation and malformed state fallback.
- [`src/services/taskService.ts`](../src/services/taskService.ts): Fetches initial dataset snapshot (first 30 tasks).
- [`src/stores/useBoardStore.ts`](../src/stores/useBoardStore.ts): Dedicated Zustand store managing board state, drag reordering, status transitions, and CRUD operations.
- [`src/hooks/useBoardData.ts`](../src/hooks/useBoardData.ts): TanStack Query hook handling data loading and store hydration.
- [`src/components/board/TaskCard.tsx`](../src/components/board/TaskCard.tsx): Task card primitive integrating `@dnd-kit/sortable`.
- [`src/components/board/BoardColumn.tsx`](../src/components/board/BoardColumn.tsx): Kanban column container with `@dnd-kit` droppable context and dynamic task count badge.
- [`src/components/board/TaskDrawer.tsx`](../src/components/board/TaskDrawer.tsx): Side drawer for viewing details, editing, and posting comments.
- [`src/components/board/TaskCreateModal.tsx`](../src/components/board/TaskCreateModal.tsx): Reusable modal for creating sprint tasks.
- [`src/components/board/DeleteTaskConfirmModal.tsx`](../src/components/board/DeleteTaskConfirmModal.tsx): Reusable modal confirmation for task deletion.
- [`src/pages/BoardPage.tsx`](../src/pages/BoardPage.tsx): Main Kanban board view orchestrating `@dnd-kit` `DndContext`, search/filters, and drawers.
