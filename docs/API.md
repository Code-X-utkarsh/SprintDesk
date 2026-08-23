# SprintDesk - API & Service Integration Reference

This document details the external API integrations, data access services, mock dataset structures, and state handling mechanisms powering **SprintDesk**.

---

## 1. Authentication API (DummyJSON)

SprintDesk integrates with the external [DummyJSON Auth API](https://dummyjson.com/docs/auth) for user authentication, token refresh, and profile retrieval.

### 1. User Sign-In
- **Endpoint**: `POST https://dummyjson.com/auth/login`
- **Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "username": "emilys",
    "password": "emilyspass",
    "expiresInMins": 30
  }
  ```
- **Response**: Returns JWT `accessToken`, `refreshToken`, and authenticated `User` profile payload.
- **Client Handling**: The `accessToken` is stored strictly in memory (`useAuthStore`). The `refreshToken` is saved to `localStorage` under `sprintdesk_refresh_token_v1` via `storage.ts`.

### 2. Silent Token Refresh
- **Endpoint**: `POST https://dummyjson.com/auth/refresh`
- **Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "refreshToken": "<stored_refresh_token>",
    "expiresInMins": 30
  }
  ```
- **Client Handling**: Triggered automatically by the `apiClient` HTTP response interceptor upon encountering a `401 Unauthorized` status response. Executes a single-flight mutex refresh request to prevent token race conditions, updates the in-memory access token, and retries the failed request.

### 3. Current User Profile Session Validation
- **Endpoint**: `GET https://dummyjson.com/auth/me`
- **Headers**: `Authorization: Bearer <accessToken>`
- **Response**: Authenticated user session object.
- **Client Handling**: Called during application initialization on page reload to validate stored refresh token sessions.

---

## 2. Real-Time Notification Polling API (JSONPlaceholder)

SprintDesk simulates real-time activity updates by background polling the external JSONPlaceholder API.

- **Endpoint**: `GET https://jsonplaceholder.typicode.com/posts?_limit=5`
- **Polling Strategy**: TanStack Query `useQuery` (`queryKey: ['notificationPolling']`) executing every **20 seconds** (`20000ms`).
- **Tab Visibility Control**: Listens for `document.visibilityState` (`visibilitychange` event). Polling pauses when the application tab is hidden (`refetchInterval: false`) and resumes/refetches immediately when the user returns to the tab (`refetchOnWindowFocus: true`).
- **Canonical ID Mapping & Deduplication**:
  - Polled posts (`id: 1..5`) are mapped to canonical notification IDs (`post.id + 1000`) in `NotificationService.ts`.
  - `useNotificationStore.addNotifications()` filters incoming post IDs against existing notification IDs in Zustand state to prevent duplicate notifications.
- **Toast Trigger Rules**: Triggers a toast banner alert (`useToast().toast.info`) ONLY when new notification IDs arrive while the `NotificationPanel` popover is CLOSED.

---

## 3. Primary Mock Application Dataset (`src/data/mock-data.json`)

Primary sprint, task, user, comment, and notification domain data is sourced from `src/data/mock-data.json`.

### Dataset Schema Entities
- **Users**: Team member profiles (`id`, `name`, `email`, `avatar`).
- **Sprints**: Active & historical sprints (`id`, `name`, `startDate`, `endDate`).
- **Tasks**: Sprint tasks (`id`, `title`, `description`, `status`, `priority`, `assigneeId`, `dueDate`, `sprintId`, `order`, `createdAt`, `completedAt`, `updatedAt`).
- **Task Comments**: Task discussion threads (`id`, `taskId`, `authorId`, `message`, `createdAt`).
- **Notifications**: Baseline notification dataset (`id`, `title`, `message`, `type`, `read`, `createdAt`).

### Service Layer Abstraction (`src/services/`)
- [`ApiService`](../src/services/api.ts): Wraps mock data fetching via TanStack Query.
- [`TaskService`](../src/services/taskService.ts): Fetches initial board data and syncs with `useBoardStore`.
- [`NotificationService`](../src/services/notificationService.ts): Merges initial notification mock data with polled JSONPlaceholder items.
- [`boardStorage.ts`](../src/utils/boardStorage.ts): Persists user board mutations (task moves, edits, creation, deletion) to `localStorage` under key `sprintdesk_board_state_v1` with schema fallback validation.
- [`notificationStorage.ts`](../src/utils/notificationStorage.ts): Persists notification read states and collection snapshots to `localStorage` under key `sprintdesk_notifications_v1`.
