# SprintDesk — Production Engineering Assessment

[![Build & Test Status](https://img.shields.io/badge/tests-73%20passed%20%7C%20100%25-success)](./docs/SUBMISSION_CHECKLIST.md)
[![CI](https://github.com/Code-X-utkarsh/SprintDesk/actions/workflows/ci.yml/badge.svg)](https://github.com/Code-X-utkarsh/SprintDesk/actions/workflows/ci.yml)
[![TypeScript Strict](https://img.shields.io/badge/typescript-strict%20mode-blue)](./tsconfig.app.json)
[![Lighthouse Mobile Performance](https://img.shields.io/badge/Lighthouse%20Perf-94%2F100-success)](./study-material/performance-accessibility-testing.md)
[![Lighthouse Mobile Accessibility](https://img.shields.io/badge/Lighthouse%20A11y-98%2F100-success)](./study-material/performance-accessibility-testing.md)

**SprintDesk** is a single-page SaaS frontend application engineered for software development teams to manage active sprints, tasks, Kanban workflows, real-time analytics, and notification alerts.

Built from scratch using **React 18**, **TypeScript** (Strict Mode), **Vite 5**, **Tailwind CSS v3**, **TanStack Query v5**, **Zustand v4**, **React Router v6**, **Recharts v2**, and **@dnd-kit**.

---

## Architecture & Data Flow

```text
                               SprintDesk Application
                                         │
               ┌─────────────────────────┴─────────────────────────┐
               │                                                   │
          UI Layer                                         Application State
   (Presentational Views)                                (Client Zustand Stores)
   ├── AppShell / Sidebar / Header                        ├── useAuthStore (Access Token in Memory)
   ├── BoardPage / TaskCard / TaskDrawer                  ├── useBoardStore (Tasks, Drag & Drop, CRUD)
   ├── AnalyticsPage (Recharts)                           ├── useNotificationStore (Read State, Pagination)
   └── NotificationPanel / ToastContainer                 ├── useAppStore (Theme & Mobile Drawer)
               │                                          └── useToastStore (Toast Alert Queue)
               │                                                   │
         Query / Hooks                                             │
   (TanStack Query v5 & Custom Hooks)                              │
   ├── useAuth() / useBoardData()                                  │
   └── useNotificationPolling() (20s interval)                      │
               │                                                   │
         Service Layer                                             │
   (API Abstraction & Persistence)                                 │
   ├── ApiService / apiClient (401 Interceptor)                   │
   ├── AuthServices / TaskService / NotificationService            │
   └── Storage Helpers (boardStorage / notificationStorage) ───────┘
               │
     ┌─────────┼────────────────────────┐
     │         │                        │
 DummyJSON  JSONPlaceholder     Mock Dataset
 Auth API   Polling API    (src/data/mock-data.json)
```

---

## Measured CLI Lighthouse Audit Scores

Evaluated against the live production preview build server (`http://localhost:4173/`) using Google Lighthouse 13.4.1 CLI in headless mode:

| Audit Category | Mobile Score (375px Emulated) | Desktop Score | Assessment Threshold | Status |
|---|---|---|---|---|
| **Performance** | **94 / 100** | **99 / 100** | `>= 88` | **EXCEEDS (+6 pts)** |
| **Accessibility** | **98 / 100** | **98 / 100** | `>= 92` | **EXCEEDS (+6 pts)** |
| **Best Practices** | **100 / 100** | **100 / 100** | `-` | **PERFECT** |
| **SEO** | **91 / 100** | **91 / 100** | `-` | **PASSED** |

---

## State Management Strategy

SprintDesk enforces clean separation of concerns between server state and client state:

### 1. TanStack Query v5
Used for managing asynchronous network request lifecycles, caching, refetching, background polling, and server state.
- **Why**: Handles loading, error, and refetch lifecycles automatically without cluttering global state.

### 2. Zustand v4
Used for application client state requiring synchronous updates across components:
- `useAuthStore`: Manages authenticated user session and in-memory access token.
- `useBoardStore`: Manages Kanban tasks, drag-and-drop ordering, comments, and CRUD operations.
- `useNotificationStore`: Manages notification read states, panel visibility, and pagination.
- `useAppStore`: Manages light/dark theme preference and mobile navigation drawer state.
- `useToastStore`: Manages non-intrusive toast alert queues.

### 3. Local React State
Used strictly for form inputs, modal dialog visibility, and temporary component-level UI interactions.

---

## Technology Stack

| Technology | Purpose & Application in SprintDesk |
|---|---|
| **React 18** | UI component rendering with Concurrent Features, `React.lazy`, and `Suspense`. |
| **TypeScript** | Strict type safety (`strict: true`) across domain models, API payloads, and component props. |
| **Vite 5** | High-performance build system, HMR, and Rollup chunk code splitting. |
| **Tailwind CSS v3** | Custom design system tokens, PostCSS, dark mode (`dark:` modifier), and responsive breakpoints. |
| **TanStack Query v5** | Server state caching, request lifecycle management, and background notification polling. |
| **Zustand v4** | Lightweight global client state management for auth, board, notifications, theme, and toasts. |
| **React Router v6** | Client-side routing with `ProtectedRouteGuard` and `PublicRouteGuard`. |
| **Recharts v2** | Responsive SVG data visualization for sprint velocity, status, priority, and completion trends. |
| **@dnd-kit** | Accessible drag-and-drop same-column reordering and cross-column state transitions. |
| **Vitest & RTL** | Unit and integration test runner with `jsdom` environment. |

---

## Key Implemented Features

### 1. Authentication Architecture & Session Flow
- DummyJSON API authentication (`POST /auth/login`, `POST /auth/refresh`, `GET /auth/me`).
- In-memory `accessToken` storage preventing XSS vulnerabilities.
- `localStorage` `refreshToken` persistence helper (`storage.ts`).
- `apiClient` fetch interceptor handling `401 Unauthorized` responses via single-flight silent refresh mutex requests and request retries.
- Simulated 401 token expiration toggle in header for testing.

### 2. Interactive Kanban Sprint Board
- 4 workflow stage columns (`Backlog`, `In Progress`, `Review`, `Done`).
- Drag-and-drop same-column reordering and cross-column movement using `@dnd-kit`.
- Side details drawer (`TaskDrawer`) with edit mode, author-resolved comment threads, and priority badges.
- Modals for task creation (`TaskCreateModal`) and deletion confirmation (`DeleteTaskConfirmModal`).
- `boardStorage.ts` `localStorage` persistence with malformed snapshot fallback.

### 3. Real-Time Analytics Dashboard
- 4 Recharts visualizations: Sprint Velocity Bar Chart, Task Status Distribution Donut Chart, Priority Breakdown Stacked Bar Chart, and Completion Trend Area Chart.
- Pure data transformation layer (`analytics.ts`) calculating metrics on demand from board state.
- Dynamic real-time reactivity to Kanban board task status updates.

### 4. Real-Time Notification System & Polling
- JSONPlaceholder background polling (`GET /posts?_limit=5`) on a 20-second interval.
- Tab visibility auto-pause & resume (`visibilitychange` event listener).
- Canonical post ID deduplication preventing duplicate notification alerts.
- Closed-panel toast alert trigger logic.
- `NotificationPanel` popover drawer with unread indicators, "Mark read", "Mark all read", and 20-item client-side pagination.

### 5. Performance & Accessibility (a11y)
- Route-level code splitting using `React.lazy()` and `React.Suspense` with an accessible `RouteLoadingFallback` skeleton.
- Component memoization (`TaskCard`, `BoardColumn`, `useCallback`, `useMemo`).
- WCAG/WAI-ARIA compliance: explicit form labels (`htmlFor`), dialog attributes (`role="dialog"`), focus rings (`focus-visible:ring-2`), and image `alt` text.

---

## Local Setup & Quick Start

### Prerequisites
- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher

### Installation & Development
```bash
# 1. Clone the repository
git clone https://github.com/Code-X-utkarsh/SprintDesk.git
cd SprintDesk

# 2. Install dependencies
npm install

# 3. Start local Vite development server
npm run dev
```

### Production Build & Local Preview
```bash
# Execute TypeScript check & Vite production build
npm run build

# Serve local production build preview (runs at http://localhost:4173)
npm run preview
```

### Automated Testing
```bash
# Execute full Vitest suite (73 tests across 11 files)
npm run test
```

---

## Deployment & Submission Information

- **GitHub Repository**: https://github.com/Code-X-utkarsh/SprintDesk
- **Live Application Deployment**: AWS Amplify (connected to `main` branch)

---

## Demo Credentials

For reviewer testing, use the non-sensitive public demo credential from DummyJSON:

| Username | Password | Account Name |
|---|---|---|
| `emilys` | `emilyspass` | Emily Johnson |

---

## Repository Documentation Index

- [`docs/FINAL_SUBMISSION.md`](./docs/FINAL_SUBMISSION.md): Final submission summary, measured CLI Lighthouse scores, automated test breakdown, and technology stack.
- [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md): Complete architecture documentation, system flow diagrams, and measured quality metrics.
- [`docs/API.md`](./docs/API.md): API integration reference for DummyJSON Auth, JSONPlaceholder polling, and mock datasets.
- [`docs/SUBMISSION_CHECKLIST.md`](./docs/SUBMISSION_CHECKLIST.md): Submission verification matrix covering all prompt requirements and test results.
- [`study-material/demo-script.md`](./study-material/demo-script.md): Demonstration walkthrough video speaking script and interview Q&A guide.
- [`study-material/performance-accessibility-testing.md`](./study-material/performance-accessibility-testing.md): Deep-dive performance, Lighthouse, accessibility, and testing study guide.

---

## Development Workflow & CI

SprintDesk uses a two-branch Git workflow with automated CI via GitHub Actions.

### Branches

| Branch | Purpose |
|---|---|
| `main` | Production — deployed to AWS Amplify automatically on merge |
| `develop` | Integration — feature branches merge here first |

### Workflow

```text
feature/my-feature   (create from develop)
        │
        ▼
    develop          (PR + CI must pass + review)
        │
        ▼
      main           (PR + CI must pass + review → Amplify deploys)
```

### CI Pipeline (`.github/workflows/ci.yml`)

Triggered on:
- Push to `develop`
- Pull requests targeting `develop` or `main`

Steps:
1. `npm ci` — deterministic dependency install
2. `npm run test` — 73 Vitest tests across 11 files
3. `npm run build` — TypeScript strict check (`tsc -b`) + Vite production bundle

### Recommended Branch Protection (manual GitHub configuration)

- Require pull request before merging to `main`
- Require CI status checks to pass
- Require at least one reviewer approval
- No direct pushes to `main`

---

## Known Limitations

- **Client Persistence**: Task mutations and notification read states are persisted to `localStorage`. In a multi-user enterprise environment, board updates would be synchronized over WebSockets or a persistent REST API backend.
- **Simulated Activity Polling**: Notification activity is polled from JSONPlaceholder's static public dataset to demonstrate real-time frontend polling lifecycles.
