# SprintDesk Architecture Documentation

## 1. Project Purpose
SprintDesk is a single-page SaaS application designed for software development teams to manage sprints, tasks, Kanban workflows, analytics, and notifications efficiently.

## 2. Technology Stack & Constraints
- **Core Framework**: React 18+ with TypeScript (Strict Mode enabled).
- **Build System**: Vite 5.
- **Styling**: Tailwind CSS v3 with custom design system tokens and PostCSS.
- **Server State Management**: TanStack Query v5 (`@tanstack/react-query`).
- **Client State Management**: Zustand v4 (`useAppStore`, `useAuthStore`, `useToastStore`, `useBoardStore`, `useNotificationStore`).
- **Routing**: React Router v6 (`react-router-dom`) with `React.lazy()` + `React.Suspense` route-level code splitting.
- **Authentication**: DummyJSON API (`/auth/login`, `/auth/refresh`, `/auth/me`).
- **UI Component System**: Pure presentational Tailwind primitives built from scratch (Button, Input, Select, Modal, Toast, Skeleton, DataTable).
- **Kanban Drag & Drop**: `@dnd-kit/core` & `@dnd-kit/sortable`.
- **Charts & Data Visualization**: Recharts v2 (`ResponsiveContainer`, `BarChart`, `PieChart`, `AreaChart`).
- **Real-Time Notifications & Polling**: JSONPlaceholder API (`/posts?_limit=5`) + TanStack Query polling + browser tab visibility control (`visibilitychange`).
- **Test Runner & Environment**: Vitest + React Testing Library + `jsdom`.

## 3. Measured Production Quality Metrics (Lighthouse 13.4.1 CLI Audit)

Actual measured audit metrics generated against the live local production preview server (`http://localhost:4173/`):

- **Lighthouse Performance**: **94 / 100** (Mobile) \| **99 / 100** (Desktop) — (Required threshold >= 88)
- **Lighthouse Accessibility**: **98 / 100** (Mobile) \| **98 / 100** (Desktop) — (Required threshold >= 92)
- **Lighthouse Best Practices**: **100 / 100** (Mobile) \| **100 / 100** (Desktop)
- **Lighthouse SEO**: **91 / 100** (Mobile) \| **91 / 100** (Desktop)

## 4. Folder Architecture
```
src/
├── app/                  # Application initialization & configuration
│   ├── App.tsx           # Main application entry component
│   ├── providers.tsx     # Context providers orchestration & ToastContainer
│   └── router.tsx        # React Router v6 route specifications with React.lazy code splitting
├── components/           # UI Component system
│   ├── ui/               # Reusable primitive elements (built from scratch)
│   │   ├── Button.tsx    # Accessible button primitive
│   │   ├── Input.tsx     # Accessible text input
│   │   ├── Select.tsx    # Accessible select dropdown
│   │   ├── Modal.tsx     # Accessible dialog overlay
│   │   ├── ToastContainer.tsx # Toast portal renderer
│   │   ├── Skeleton.tsx  # Pulse loading primitives
│   │   └── DataTable.tsx # Generic responsive typed table component
│   ├── layout/           # Page structural components
│   │   ├── AppShell.tsx  # Production authenticated shell container
│   │   ├── Sidebar.tsx   # Navigation sidebar
│   │   ├── Header.tsx    # Header bar with notification bell & theme toggle
│   │   ├── NotificationPanel.tsx # Notification popover panel & pagination
│   │   └── RouteLoadingFallback.tsx # Route-level Suspense loading fallback
│   ├── board/            # Kanban board feature components
│   │   ├── BoardColumn.tsx # Column container with dnd-kit droppable context (React.memo)
│   │   ├── TaskCard.tsx    # Task card with dnd-kit sortable handle (React.memo)
│   │   ├── TaskDrawer.tsx  # Side drawer for task details, edits & comments
│   │   ├── TaskCreateModal.tsx # Task creation modal
│   │   └── DeleteTaskConfirmModal.tsx # Task deletion confirmation modal
│   └── analytics/        # Recharts visualization feature components
│       ├── SprintVelocityChart.tsx # Velocity bar chart
│       ├── TaskStatusChart.tsx     # Workflow status distribution donut chart
│       ├── PriorityBreakdownChart.tsx # Stacked bar chart
│       ├── CompletionTrendChart.tsx   # Cumulative task completion area chart
│       └── index.ts        # Analytics components barrel export
├── pages/                # Route level view pages (Lazy Loaded)
│   ├── LoginPage.tsx     # Sign-in view
│   ├── DashboardPage.tsx # Sprint metrics overview & design system demo
│   ├── BoardPage.tsx     # Interactive Kanban board view (useCallback drag handlers)
│   ├── AnalyticsPage.tsx # Real-time Recharts analytics dashboard (useMemo transformations)
│   └── NotFoundPage.tsx  # 404 fallback page
├── hooks/                # Reusable custom React hooks
│   ├── useAuth.ts        # Authentication mutation & query hooks
│   ├── useToast.ts       # Clean toast notification trigger API
│   ├── useBoardData.ts   # Board data loading & hydration hook
│   └── useNotificationPolling.ts # Real-time polling hook with tab visibility control
├── stores/               # Client-side global stores
│   ├── useAppStore.ts    # Zustand store (theme, sidebar visibility)
│   ├── useAuthStore.ts   # Zustand auth store (in-memory access token)
│   ├── useToastStore.ts  # Zustand toast notification store
│   ├── useBoardStore.ts  # Zustand board store (tasks, drag reorder, CRUD)
│   └── useNotificationStore.ts # Zustand notification store (notifications, read states, pagination)
├── services/             # Data access / API abstraction layer
│   ├── api.ts            # ApiService abstraction for mock data fetching
│   ├── apiClient.ts      # Fetch client with 401 interceptor & single-flight refresh
│   ├── authService.ts    # Authentication workflows & session restoration
│   ├── taskService.ts    # Task & board dataset loader service
│   └── notificationService.ts # Polled notification loader service
├── queries/              # TanStack Query client & query option definitions
│   └── queryClient.ts    # QueryClient instance with defaults
├── types/                # Domain models & TypeScript interfaces
│   ├── auth.ts           # Authentication domain interfaces
│   └── index.ts          # Domain models (User, Sprint, Task, TaskComment, Notification)
├── utils/                # Helper utilities
│   ├── cn.ts             # Tailwind class merging utility
│   ├── storage.ts        # Refresh token storage helper
│   ├── boardStorage.ts   # Board state localStorage persistence abstraction
│   ├── notificationStorage.ts # Notification state localStorage persistence abstraction
│   └── analytics.ts      # Pure analytics transformation algorithms
├── data/                 # Static data layer sources
│   └── mock-data.json    # Official application dataset
├── tests/                # Automated testing setup & test suites
│   ├── setup.ts          # Vitest & RTL test setup + ResizeObserver mock
│   ├── App.test.tsx      # Smoke & setup unit tests
│   ├── auth.test.tsx     # Authentication & route guard test suite
│   ├── designSystem.test.tsx # UI primitives unit test suite
│   ├── shell.test.tsx    # Production AppShell integration test suite
│   ├── boardStore.test.tsx # Board Zustand store unit test suite
│   ├── boardUi.test.tsx  # Board UI & task drawer integration test suite
│   ├── analytics.test.tsx # Analytics transformation & dynamic UI test suite
│   ├── notificationStore.test.tsx # Notification store unit test suite
│   ├── notificationUi.test.tsx    # Notification bell & panel integration test suite
│   └── performanceAndA11y.test.tsx # Code-splitting, a11y & performance test suite
├── index.css             # Tailwind directives & global accessibility styles
└── main.tsx              # DOM root mounting entry point
```

## 5. Production Engineering Architecture

```text
[ Route Architecture: React.lazy() + React.Suspense ]
 -> Separates initial JavaScript into per-route chunks (LoginPage, BoardPage, AnalyticsPage, Core index.js)

[ Performance Layer: React.memo + useMemo + useCallback ]
 -> Memoizes TaskCard and BoardColumn components
 -> Caches drag handler callbacks in BoardPage
 -> Memoizes pure analytics data aggregations in AnalyticsPage

[ Accessibility Layer: WCAG & WAI-ARIA Specifications ]
 -> Explicit htmlFor <-> id linkages on all form inputs and selects
 -> ARIA roles (role="dialog", role="alert", role="status", aria-modal="true", aria-label)
 -> Visible focus rings (focus-visible:ring-2 focus-visible:ring-indigo-500)
 -> Keyboard Escape listeners on dialogs, drawers, and popovers

[ Quality Assurance & Testing Layer ]
 -> 60 automated unit and integration tests across 10 test suites
 -> Isolated test setups resetting Zustand stores and localStorage
```

## 6. Implemented Milestones vs. Planned Features

### Implemented Milestones (Prompts 0, 1, 2, 3, 4, 5, 6, 6A)
- ✅ Vite + React 18 + TypeScript strict mode project foundation.
- ✅ Route-level code splitting using `React.lazy()` and `React.Suspense`.
- ✅ Tailwind CSS v3 design system & dark mode foundation (`useAppStore`).
- ✅ Complete DummyJSON authentication implementation (`/auth/login`, `/auth/refresh`, `/auth/me`).
- ✅ 7 Reusable UI Primitives built from scratch (`Button`, `Input`, `Select`, `Modal`, `Toast`, `Skeleton`, `DataTable`).
- ✅ Production Application Shell (`AppShell`, `Sidebar`, `Header`).
- ✅ Interactive 4-column Kanban Sprint Board with `@dnd-kit` drag-and-drop same-column reordering & cross-column movement.
- ✅ Side drawer (`TaskDrawer`) for task details, view/edit mode toggle, and comment threads.
- ✅ Task CRUD operations & `boardStorage` local storage persistence.
- ✅ Real-time Analytics & Data Visualization page powered by Recharts.
- ✅ Real-Time Notification System with TanStack Query polling (20s interval).
- ✅ Browser tab visibility auto-pause/resume control (`visibilitychange`).
- ✅ `NotificationPanel` popover/drawer with unread indicators, "Mark read", "Mark all read", and client-side pagination (20 per page).
- ✅ Performance memoization pass (`TaskCard`, `BoardColumn`, `useCallback`, `useMemo`).
- ✅ Accessibility audit (explicit form labels, ARIA attributes, focus rings, keyboard UX).
- ✅ Actual measured Lighthouse CLI scores: **Performance 94 (Mobile) / 99 (Desktop)**, **Accessibility 98 (Mobile) / 98 (Desktop)**.
- ✅ 60 passing unit & integration tests across 10 test suites (`npm run test`).
- ✅ Clean production build passing with zero errors (`npm run build`).
- ✅ Complete interview study materials (`study-material/performance-accessibility-testing.md`, `study-material/notifications.md`, `study-material/analytics.md`, `study-material/kanban-board.md`, `study-material/design-system.md`, `study-material/authentication.md`).
