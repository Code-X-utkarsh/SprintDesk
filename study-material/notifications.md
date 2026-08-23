# SprintDesk - Real-Time Notification System & Polling Study Guide

This guide details the simulated real-time polling architecture, TanStack Query integration, browser tab visibility auto-pause/resume mechanisms, canonical ID deduplication, toast trigger rules, and technical choices powering the **SprintDesk Real-Time Notification System**. It serves as a comprehensive reference for technical interviews.

---

## 1. Core Real-Time & Polling Concepts

### 1. What Polling is
Polling is a client-side data fetching strategy where the frontend periodically sends HTTP requests to a remote endpoint at a set time interval (e.g., every 20 seconds) to query for new updates or state changes.

### 2. Why Polling is Used Instead of WebSockets for This Assessment
Polling relies on standard HTTP `GET` endpoints, eliminating the need for persistent TCP connections, WebSocket servers, or stateful infrastructure. In simulated environments or SaaS MVPs where real-time push infrastructure is not available, polling provides an efficient, lightweight solution.

### 3. What TanStack Query Provides for Polling
TanStack Query manages request lifecycle execution, refetch intervals (`refetchInterval: 20000`), background request deduplication, loading/error states, and automatic refetching on window focus (`refetchOnWindowFocus: true`).

### 4. Why Notification State Resides in Zustand
TanStack Query handles network request lifecycles and cache invalidation. However, user interactions (such as marking notifications as read or persisting read/unread states across reloads) require an application-level store. **Zustand** ([`useNotificationStore.ts`](../src/stores/useNotificationStore.ts)) acts as the single source of truth for persistent notification state.

### 5. Difference Between Server State and Persistent Client State
- **Server State**: Transient query cache fetched from external APIs (`https://jsonplaceholder.typicode.com/posts?_limit=5`).
- **Persistent Client State**: Application-level collection stored in `useNotificationStore` and persisted in `localStorage` under `sprintdesk_notifications_v1`.

### 6. How Duplicate Notification IDs Are Prevented
When polled posts arrive from JSONPlaceholder, [`NotificationService.ts`](../src/services/notificationService.ts) maps post IDs to canonical notification IDs (`post.id + 1000`). `useNotificationStore.addNotifications()` checks existing notification IDs via a JavaScript `Set`. Incoming posts with IDs already present in state are discarded.

### 7. How New Notification Detection Works
Incoming polled post IDs are compared against the set of known notification IDs in `useNotificationStore`. Only genuinely unknown IDs are appended to the store and returned as `newlyAdded` notifications.

### 8. Why ID Comparison is Used
Comparing canonical post IDs guarantees deterministic deduplication regardless of polling frequency or clock drift across client machines, whereas timestamp comparison alone can produce false positives or missed updates.

### 9. How LocalStorage Persistence Works
[`notificationStorage.ts`](../src/utils/notificationStorage.ts) isolates `localStorage` reads and writes under `sprintdesk_notifications_v1`, storing a serialized `{ notifications: Notification[], version: 1 }` payload.

### 10. How Malformed State is Handled
`notificationStorage.getPersistedNotifications()` executes schema checks verifying that `notifications` is an array of objects with valid `id`, `title`, `message`, and `read` fields. If malformed or corrupted JSON is detected, it logs a warning, discards the bad snapshot, and falls back to initial notifications from `mock-data.json`.

### 11. How Browser Visibility Detection Works
[`useNotificationPolling.ts`](../src/hooks/useNotificationPolling.ts) registers an event listener on `document.addEventListener('visibilitychange')`, updating `isTabVisible = document.visibilityState === 'visible'`.

### 12. Why Polling Pauses in Hidden Tabs
When a user switches away from the application tab (`document.visibilityState === 'hidden'`), continuing background HTTP requests wastes network bandwidth, CPU resources, and battery. Setting `refetchInterval: isTabVisible ? 20000 : false` safely pauses background network requests.

### 13. How Polling Resumes
When the user returns to the tab (`document.visibilityState === 'visible'`), `useNotificationPolling` reactivates `refetchInterval` and TanStack Query automatically triggers an immediate refetch (`refetchOnWindowFocus: true`) to fetch any updates missed while hidden.

### 14. How Toast Notifications Are Triggered
When `addNotifications()` processes newly arrived notification IDs, it returns an array of newly added items. If `newlyAdded.length > 0` AND `!isPanelOpen`, `useNotificationPolling` invokes `useToast().toast.info('New Activity Alert', latest.title)`.

### 15. Why a Closed Panel Triggers a Toast but an Open Panel Does Not
If the notification panel is already open, new notifications appear directly inside the active panel view. Popping up a toast banner simultaneously would create visual noise and duplicate alert UI.

### 16. How Pagination Works
[`useNotificationStore`](../src/stores/useNotificationStore.ts) implements client-side pagination (20 items per page). `selectPaginatedNotifications` sorts notifications by `createdAt` descending and slices the array based on `currentPage`. [`NotificationPanel`](../src/components/layout/NotificationPanel.tsx) renders Next/Previous controls and total page counts (`Page X of Y`).

### 17. How Notification Data is Normalized
[`NotificationService.fetchPolledPosts()`](../src/services/notificationService.ts) maps raw JSONPlaceholder posts (`{ id, userId, title, body }`) into strongly-typed [`Notification`](../src/types/index.ts) entities with formatted titles, messages, types (`system` | `activity`), and ISO timestamps.

### 18. How the Notification Panel is Made Accessible
[`NotificationPanel.tsx`](../src/components/layout/NotificationPanel.tsx) includes `role="dialog"`, `aria-modal="true"`, keyboard `Escape` close listener, unread count text indicators (`aria-label="Notifications, 3 unread"`), and accessible buttons.

### 19. How the System Could Later be Replaced with WebSockets / SSE
Replacing polling with WebSockets or Server-Sent Events (SSE) requires replacing `useNotificationPolling` with a WebSocket client hook that listens for incoming JSON events and calls `useNotificationStore.getState().addNotifications()`. The Zustand store, `notificationStorage`, `Header`, and `NotificationPanel` remain unchanged.

### 20. Tradeoffs Between Polling and Real-Time Transports
- **Polling**: Simple setup, standard HTTP caching, firewall friendly, works with serverless APIs. Drawback: slight latency delay between polling intervals.
- **WebSockets / SSE**: Instant push updates, reduced HTTP header overhead. Drawback: stateful connection management, reconnect logic, server scaling complexity.

---

## 2. Key Component Walkthroughs & Interview Q&A

### Q1: Why did you use polling instead of WebSockets?
Polling allows simulated real-time updates using standard HTTP `GET` requests from external REST APIs like JSONPlaceholder without requiring custom server-side WebSocket infrastructure.

### Q2: What happens when the browser tab is hidden?
`useNotificationPolling` listens to `visibilitychange` events. When `document.visibilityState === 'hidden'`, `refetchInterval` is set to `false`, pausing network requests. When the tab becomes visible again, TanStack Query refetches instantly.

### Q3: How do you prevent duplicate notification toasts?
`addNotifications()` deduplicates incoming IDs against existing notification IDs in `useNotificationStore`. Toasts are triggered ONLY for newly added IDs and ONLY when `isPanelOpen` is false.

---

## 3. Important Source Files Reference

- [`src/utils/notificationStorage.ts`](../src/utils/notificationStorage.ts): Local storage persistence helper with schema validation and malformed state fallback.
- [`src/services/notificationService.ts`](../src/services/notificationService.ts): Fetches polled posts from JSONPlaceholder and maps to `Notification` domain objects.
- [`src/stores/useNotificationStore.ts`](../src/stores/useNotificationStore.ts): Dedicated Zustand store managing notifications, read/unread states, panel visibility, and pagination.
- [`src/hooks/useNotificationPolling.ts`](../src/hooks/useNotificationPolling.ts): TanStack Query polling hook managing 20s interval, tab visibility pause/resume, and toast alerts.
- [`src/components/layout/NotificationPanel.tsx`](../src/components/layout/NotificationPanel.tsx): Responsive notification popover/drawer panel with pagination controls.
- [`src/components/layout/Header.tsx`](../src/components/layout/Header.tsx): Application header featuring the notification bell button and unread count badge.
