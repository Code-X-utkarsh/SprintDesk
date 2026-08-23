# SprintDesk - Performance, Accessibility, Code Splitting & Testing Study Guide

This guide details the measured Lighthouse metrics, route-level code splitting architecture, React memoization strategies, accessibility (WCAG/WAI-ARIA) standards, testing philosophy, and engineering decisions powering **SprintDesk**. It serves as a comprehensive reference for technical interviews.

---

## 1. Measured Production Lighthouse Metrics

The production build was served locally (`npx vite preview --port 4173`) and audited using Google Lighthouse 13.4.1 in headless mode against the real live build:

| Metric Category | Mobile Score (375px Emulated) | Desktop Score | Target Requirement | Pass Status |
|---|---|---|---|---|
| **Performance** | **94 / 100** | **99 / 100** | `>= 88` | **EXCEEDS (+6 pts)** |
| **Accessibility** | **98 / 100** | **98 / 100** | `>= 92` | **EXCEEDS (+6 pts)** |
| **Best Practices** | **100 / 100** | **100 / 100** | `-` | **PERFECT** |
| **SEO** | **91 / 100** | **91 / 100** | `-` | **PASSED** |

---

## 2. Core Engineering Concepts

### 1. What Code Splitting is
Code splitting is a technique in web bundling where application JavaScript is divided into smaller, separate chunks (or bundles) loaded on demand rather than forcing the browser to download a single monolithic JavaScript file upfront.

### 2. Why `React.lazy()` is Useful
`React.lazy()` allows React applications to dynamically import route-level view components using dynamic `import()` syntax, significantly reducing initial bundle size and improving First Contentful Paint (FCP) and Time to Interactive (TTI).

### 3. What `Suspense` Does
`React.Suspense` renders an accessible fallback UI component (such as [`RouteLoadingFallback.tsx`](../src/components/layout/RouteLoadingFallback.tsx)) while dynamic asynchronous code chunks are being downloaded over the network.

### 4. What `React.memo` Does
`React.memo` is a higher-order component that memoizes the rendered output of a functional component. It skips re-rendering when incoming props have not changed according to shallow reference equality checks.

### 5. What `useMemo` Does
`useMemo` caches the calculated result of a computational algorithm between re-renders, re-evaluating the computation only when its declared dependencies change.

### 6. What `useCallback` Does
`useCallback` returns a memoized callback function reference between re-renders, preventing child components wrapped in `React.memo` from re-rendering due to unstable function reference recreation.

### 7. When Memoization is Useful
Memoization is beneficial when:
- Components render frequently with complex DOM trees (e.g. [`TaskCard.tsx`](../src/components/board/TaskCard.tsx) inside a 30-item Kanban board).
- Operations perform expensive data transformations (e.g. analytics aggregation in [`analytics.ts`](../src/utils/analytics.ts)).
- Stable function references are passed as props to memoized child components.

### 8. When Memoization is Harmful / Unnecessary
Premature or indiscriminate memoization adds memory overhead (allocating closure dependencies) and code clutter. For trivial primitive elements or fast-rendering components, memoization overhead outweighs the cost of plain React re-renders.

### 9. What Lighthouse Measures
Lighthouse evaluates web application quality across key categories:
- **Performance**: FCP, LCP, TTI, Total Blocking Time (TBT), Cumulative Layout Shift (CLS).
- **Accessibility**: Semantic HTML, ARIA attributes, color contrast ratios, explicit form labels, and focusable controls.

### 10. What Accessibility (a11y) Means in Frontend Engineering
Accessibility ensures software can be perceived, navigated, and operated by all users, including those relying on screen readers, keyboard-only navigation, switch devices, or high-contrast display modes.

### 11. Keyboard Accessibility Requirements
- All interactive controls (`<button>`, `<a href>`, `<input>`, `<select>`) must be focusable via `Tab`.
- Visible focus rings (`focus-visible:ring-2 focus-visible:ring-indigo-500`) must clearly indicate current focus location.
- Modal dialogs and drawers must close when pressing `Escape`.

### 12. Focus Management
When an overlay (`Modal`, `TaskDrawer`, `NotificationPanel`) opens, focus is directed inside the container. When closed, body scroll locking is released and focus returns predictably to the trigger element.

### 13. ARIA Specifications Used in SprintDesk
- `role="dialog"` & `aria-modal="true"` on dialogs and drawers.
- `role="alert"` & `role="status"` on form errors, toast notifications, and skeletons.
- `aria-label` on icon-only buttons (bell, search, menu, close, drag handles).
- `aria-busy="true"` on loading indicators.

### 14. Semantic HTML
Using standard elements (`<header>`, `<nav>`, `<aside>`, `<main>`, `<table>`, `<button>`) provides native browser keyboard support and screen reader landmarks without requiring custom ARIA hacks.

### 15. Testing Philosophy
Tests should focus on user-observable behavior and domain state transitions rather than implementation details or internal framework state.

### 16. Unit vs Integration Testing
- **Unit Tests**: Test isolated pure functions (e.g. [`analytics.ts`](../src/utils/analytics.ts) formulas or `boardStorage.ts`).
- **Integration Tests**: Test user flows across multiple components (e.g. clicking a task card, opening `TaskDrawer`, editing details, and asserting UI updates).

### 17. Why Behavior-Based Tests are Preferred
Testing behavior (e.g. asserting that clicking "Mark all read" sets unread count badge to 0) ensures test suites remain resilient during internal refactoring.

### 18. Test Isolation
Every test resets Zustand stores (`resetBoard`, `resetNotifications`), clears `localStorage`, and clears mocks (`beforeEach`) to prevent state leakage between test runs.

### 19. API Mocking
Tests use `vi.spyOn()` and MSW/jsdom fetch mocks to simulate server responses deterministically without depending on external network availability.

### 20. Common Frontend Performance Bottlenecks
- Monolithic un-split JavaScript bundles.
- Un-memoized child component re-renders during state updates.
- Recalculating expensive data filters inside JSX render bodies.
- Un-throttled scroll or resize event listeners.

---

## 3. SprintDesk Implementation Decisions

- **Route Lazy Loading**: [`router.tsx`](../src/app/router.tsx) splits routes into dynamic chunks (`LoginPage`, `DashboardPage`, `BoardPage`, `AnalyticsPage`, `NotFoundPage`).
- **Suspense Fallback**: Renders [`RouteLoadingFallback.tsx`](../src/components/layout/RouteLoadingFallback.tsx) during chunk downloads.
- **Component Memoization**: [`TaskCard.tsx`](../src/components/board/TaskCard.tsx) and [`BoardColumn.tsx`](../src/components/board/BoardColumn.tsx) are wrapped in `React.memo`. Drag event handlers in [`BoardPage.tsx`](../src/pages/BoardPage.tsx) are wrapped in `useCallback`.
- **Derived Analytics**: [`AnalyticsPage.tsx`](../src/pages/AnalyticsPage.tsx) wraps pure aggregation functions in `useMemo`.

---

## 4. Interview Q&A Reference

### Q1: Why did you lazy-load routes?
Lazy-loading routes splits our 840KB bundle into lightweight per-route chunks (`LoginPage` 4KB, `BoardPage` 73KB, `AnalyticsPage` 424KB), reducing initial load time and achieving an actual measured Lighthouse Performance score of 94 (mobile) and 99 (desktop).

### Q2: What is the difference between `useMemo` and `useCallback`?
- `useMemo` caches the return value of a calculation.
- `useCallback` caches a function reference between re-renders.

### Q3: How do you test drag-and-drop state without depending on drag events?
We test domain actions directly via `useBoardStore.getState().moveTask()` and assert resultant UI column counts and card titles in integration tests.
