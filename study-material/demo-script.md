# SprintDesk - Video Demonstration Speaking Script & Interview Guide

This guide provides a structured speaking script, visual demonstration walkthrough, technical explanation cues, and interviewer follow-up answers for recording the **SprintDesk Candidate Demonstration Video**.

---

## Part 1 — Introduction & Architectural Overview (0:00 - 1:00)

### What to Show
Display the SprintDesk Sign-In Workspace screen (`/login`).

### What to Say
> "Hello! Welcome to SprintDesk, a production-grade single-page SaaS application engineered for software development teams to manage sprints, tasks, Kanban workflows, real-time analytics, and notification alerts.
> 
> SprintDesk is built with **React 18** and **TypeScript** using **Vite 5**. We use **Tailwind CSS v3** for a fully responsive, dark-mode accessible design system built entirely from scratch without external UI frameworks. For state management, we maintain strict architectural discipline: **TanStack Query v5** handles server state, caching, and background polling, while **Zustand v4** manages client-side stores for authentication, board state, notifications, theme, and toast alerts."

### Key Technical Concepts Demonstrated
- Clean separation between Server State (TanStack Query) and Client State (Zustand).
- Modern Vite + React 18 + TypeScript toolchain.

---

## Part 2 — Authentication Architecture & Session Flow (1:00 - 2:30)

### What to Show
1. Click the preset credentials button (`emilys` / `emilyspass`).
2. Click **Sign In to Workspace** to transition into `/dashboard`.
3. In the header bar, click **Simulate 401 Expiry** toggle to activate token expiry simulation.
4. Perform an action (e.g. create a task or refresh data) and show seamless silent refresh handling.
5. Click **Logout** to demonstrate session termination.

### What to Say
> "SprintDesk integrates with the DummyJSON authentication API. We enforce a secure token architecture: short-lived access tokens are stored strictly **in memory** inside our Zustand auth store, while refresh tokens are saved in local storage.
> 
> Our custom fetch API client implements an automatic **401 Unauthorized response interceptor**. When an access token expires, the interceptor intercepts the 401 error, executes a single-flight mutex refresh request to get a new access token, updates memory state, and transparently retries the original request.
> 
> Let's sign back in with Emily's account and explore the application shell."

### Likely Interviewer Follow-Ups
- **Q: Why store access tokens in memory instead of localStorage?**
  - *Answer*: Storing access tokens in memory mitigates Cross-Site Scripting (XSS) risks. Storing only the refresh token in storage (or HTTP-only cookies) ensures access credentials cannot be harvested by malicious third-party scripts.

---

## Part 3 — Kanban Sprint Board, Drag & Drop, & Task CRUD (2:30 - 4:30)

### What to Show
1. Navigate to **Sprint Board** (`/board`).
2. Demonstrate dragging a task card from `In Progress` to `Review` using mouse drag.
3. Show same-column reordering.
4. Click a task title card to open the **Task Details Drawer**.
5. Switch to Edit Mode, update title/description, add a comment in the discussion thread.
6. Click **Create Task** button, fill in the modal form, and submit a new task.
7. Demonstrate deleting a task via the deletion confirmation modal.

### What to Say
> "Our interactive Kanban board manages tasks across 4 workflow stages: Backlog, In Progress, Review, and Done. Drag and drop is powered by **@dnd-kit/core** and **@dnd-kit/sortable**, providing smooth same-column reordering and cross-column state transitions.
> 
> Board mutations—adding tasks, updating status, ordering, and posting comments—are managed by our `useBoardStore` Zustand store and persisted to `localStorage` via a schema-validated `boardStorage` abstraction. Clicking any card opens a side drawer for viewing details, editing, and posting author-resolved comment threads. Presentational task cards and board columns are memoized with `React.memo` to optimize render cycles during active drag operations."

### Key Technical Concepts Demonstrated
- `@dnd-kit` drag-and-drop integration.
- `React.memo` rendering performance optimization.
- Client state persistence under `localStorage` schema check fallback.

---

## Part 4 — Real-Time Analytics & Recharts Visualizations (4:30 - 5:30)

### What to Show
1. Navigate to **Analytics** (`/analytics`).
2. Show the 4 Recharts visualizations: Sprint Velocity Bar Chart, Task Status Distribution Donut Chart, Priority Breakdown Stacked Bar Chart, and Cumulative Completion Trend Area Chart.
3. Open a second tab or navigate back to `/board`, move a task to `Done`, return to `/analytics`, and show that analytics update **dynamically in real time**.

### What to Say
> "Our Analytics dashboard visualizes sprint productivity using **Recharts**. Rather than hardcoding static charts or duplicating analytics in global state, all metrics are computed dynamically on demand from our board state using a pure data transformation utility layer (`analytics.ts`).
> 
> When tasks change stage on the Kanban board, `useMemo` hooks in `AnalyticsPage` automatically recalculate distributions and re-render charts smoothly."

### Key Technical Concepts Demonstrated
- Pure derived state calculation without global store duplication.
- Dynamic Recharts integration.

---

## Part 5 — Real-Time Notification System & Tab Visibility Polling (5:30 - 6:30)

### What to Show
1. Point out the **Notification Bell** in the header bar showing unread badge count (`2`).
2. Click the bell to open the **NotificationPanel** popover drawer.
3. Show unread indicators, click **Mark all read** (badge count clears to `0`), and show 20-item pagination controls.
4. Close the panel. Show a toast alert popping up when background polling fetches a new activity notification from JSONPlaceholder.

### What to Say
> "Notifications simulate real-time team activity by background polling the JSONPlaceholder posts endpoint using **TanStack Query** every 20 seconds.
> 
> To conserve battery, network bandwidth, and CPU, we listen to `document.visibilityState`. When a user switches away from the tab, polling automatically pauses. When returning, polling resumes and refetches immediately.
> 
> Incoming posts map to canonical notification IDs. Duplicate IDs are filtered out, and when new notifications arrive while the panel is closed, a non-intrusive toast alert is triggered."

### Key Technical Concepts Demonstrated
- Tab visibility auto-pause & resume (`visibilitychange`).
- Canonical ID deduplication.
- Closed-panel toast alert trigger logic.

---

## Part 6 — Performance, Accessibility & Measured Lighthouse Audit (6:30 - 7:30)

### What to Show
1. Show route lazy loading fallback in action.
2. Display the measured Lighthouse CLI audit results.

### What to Say
> "Finally, engineering quality is central to SprintDesk. We implemented route-level code splitting using `React.lazy()` and `React.Suspense` with an accessible `RouteLoadingFallback` skeleton screen. This split our production JavaScript from a single 840KB bundle into lightweight, per-route chunks (`LoginPage` 4KB, `BoardPage` 73KB, `AnalyticsPage` 424KB).
> 
> We conducted an actual CLI Lighthouse audit against our local production build preview (`http://localhost:4173`). Our measured results are:
> - **Mobile Performance**: **94 / 100** (exceeding the >= 88 threshold)
> - **Mobile Accessibility**: **98 / 100** (exceeding the >= 92 threshold)
> - **Desktop Performance**: **99 / 100**
> - **Desktop Accessibility**: **98 / 100**
> 
> We have 60 automated unit and integration tests passing cleanly across 10 Vitest test suites with zero errors. Thank you!"

---

## Summary Checklist for Demo Video

- [ ] Clear audio & readable screen resolution (1080p).
- [ ] Sign in with demo credentials (`emilys` / `emilyspass`).
- [ ] Demonstrate token expiry simulation toggle & silent refresh.
- [ ] Show drag-and-drop same-column & cross-column moves on board.
- [ ] Show task drawer details, edit mode, and comments.
- [ ] Show analytics page dynamic updates after board state changes.
- [ ] Show notification bell, popover panel, mark all read, and toast alert.
- [ ] Mention actual Lighthouse scores (**Performance 94/99**, **Accessibility 98/98**).
