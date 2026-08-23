# SprintDesk - Authentication Architecture & Protected Session Flow Study Guide

This guide details the technical implementation, architectural decisions, and interview rationale behind the **SprintDesk Authentication System**. It serves as a comprehensive reference for technical interviews.

---

## 1. Core Architecture & Concepts

### 1. What Authentication is
Authentication is the process of verifying the identity of a user or system. In SprintDesk, users supply credentials (`username` / `password`), which are validated against the DummyJSON Authentication API to obtain session tokens.

### 2. Difference Between Access Token and Refresh Token
- **Access Token**: A short-lived JWT used to authorize API requests via the `Authorization: Bearer <token>` HTTP header.
- **Refresh Token**: A longer-lived token used exclusively to request a new access token when the current access token expires.

### 3. Where Tokens Are Stored and Why
- **Access Token**: Stored strictly **in memory** inside the Zustand auth store (`useAuthStore`). In-memory storage guarantees that access tokens are never written to disk or exposed to Cross-Site Scripting (XSS) attacks reading `localStorage`.
- **Refresh Token**: Stored in `localStorage` via a dedicated storage abstraction ([`src/utils/storage.ts`](../src/utils/storage.ts)) to allow session persistence across browser reloads or tab closures.

### 4. What an API Client & Interceptor Are
An API client ([`src/services/apiClient.ts`](../src/services/apiClient.ts)) is a centralized utility that wraps HTTP network calls. An interceptor intercepts requests or responses before they reach application code—attaching headers, handling errors, and executing refresh logic automatically.

### 5. Single-Flight Refresh Token Pattern
If multiple parallel API requests fail with `401 Unauthorized` simultaneously, firing multiple refresh requests creates race conditions and invalidates tokens. SprintDesk implements a **single-flight mutex pattern**: the first 401 response initiates a single refresh promise; subsequent 401 requests queue up and await that same promise.

### 6. How Protected Routes Work
[`ProtectedRouteGuard`](../src/app/router.tsx) checks the Zustand auth status. If `isInitializing`, it renders `<AuthLoadingScreen />`. If `unauthenticated`, it renders `<Navigate to="/login" replace />`. Otherwise, it renders `<Outlet />`.

### 7. Difference Between TanStack Query and Zustand in Auth Architecture
- **Zustand** ([`src/stores/useAuthStore.ts`](../src/stores/useAuthStore.ts)) acts as the single source of truth for in-memory client auth state (`user`, `accessToken`, `status`, `error`, `isSimulatedExpired`).
- **TanStack Query** ([`src/hooks/useAuth.ts`](../src/hooks/useAuth.ts)) manages asynchronous login mutations (`useLoginMutation`), handling loading indicators (`isPending`), error handling, and mutation lifecycle.

---

## 2. Key Component Walkthroughs & Interview Q&A

### Q1: Why did you store the access token in memory instead of localStorage?
Storing access tokens in `localStorage` exposes them to XSS attacks. In SprintDesk, keeping the access token in memory ensures third-party scripts cannot harvest credentials.

### Q2: How does your silent refresh mechanism work?
When an API request receives a `401 Unauthorized` response, our `apiClient` interceptor catches the error. It checks if a refresh token exists in local storage. If present, it executes `AuthService.refreshToken()`, updates the in-memory access token in `useAuthStore`, and retries the original failed request.

### Q3: How do you prevent multiple simultaneous token refresh requests?
We use a single-flight promise variable (`refreshPromise`). If a refresh is already in progress, concurrent 401 requests attach to the existing promise rather than initiating duplicate HTTP requests.

---

## 3. Important Source Files Reference

- [`src/utils/storage.ts`](../src/utils/storage.ts): Storage helper abstraction for refresh token persistence.
- [`src/types/auth.ts`](../src/types/auth.ts): Strongly-typed domain interfaces for `AuthUser`, `LoginCredentials`, `AuthState`.
- [`src/stores/useAuthStore.ts`](../src/stores/useAuthStore.ts): In-memory Zustand store for auth state.
- [`src/services/apiClient.ts`](../src/services/apiClient.ts): Typed fetch client with Bearer header injection, 401 interceptor, single-flight refresh, and single retry.
- [`src/services/authService.ts`](../src/services/authService.ts): High-level auth service wrapping login, logout, user profile, and session restoration.
- [`src/hooks/useAuth.ts`](../src/hooks/useAuth.ts): React & TanStack Query hooks.
- [`src/app/router.tsx`](../src/app/router.tsx): Route guards (`ProtectedRouteGuard`, `PublicRouteGuard`).
- [`src/pages/LoginPage.tsx`](../src/pages/LoginPage.tsx): Accessible B2B SaaS login interface with demo presets and dev token expiry toggle.
