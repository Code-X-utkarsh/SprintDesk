# SprintDesk - Design System & Application Shell Study Guide

This guide details the architectural principles, component primitive design patterns, dark mode theme management, and layout structure powering the **SprintDesk Design System & Production Application Shell**. It serves as a comprehensive reference for technical interviews.

---

## 1. Core Architecture & Design System Concepts

### 1. What a Design System is
A design system is a comprehensive collection of reusable UI components, design tokens (colors, typography, spacing, shadows), and architectural patterns that ensure visual consistency, accessibility, and rapid feature development across an enterprise web application.

### 2. Why a Design System Was Built from Scratch for SprintDesk
Building a custom design system using Tailwind CSS v3 ensures zero reliance on heavy third-party UI component libraries (like MUI or Ant Design), eliminates bundle bloat, guarantees full control over DOM accessibility (`aria-*` attributes), and allows seamless dark mode customization.

### 3. What Design Tokens Are
Design tokens are visual design primitives (e.g. `indigo-600`, `slate-900`, `rounded-xl`, `shadow-2xs`) stored as key-value configurations in `tailwind.config.js`. Components consume design tokens rather than hardcoding arbitrary pixel values or CSS rules.

### 4. Difference Between Primitive Component and Page Component
- **Primitive Component**: A modular, single-responsibility presentational building block (e.g. [`Button`](../src/components/ui/Button.tsx), [`Input`](../src/components/ui/Input.tsx), [`Modal`](../src/components/ui/Modal.tsx)). It is stateless regarding business domain logic.
- **Page Component**: A route-level container (e.g. [`DashboardPage`](../src/pages/DashboardPage.tsx)) that composes feature widgets, manages layout, and connects data services/hooks to UI primitives.

### 5. Why Presentational Components are Kept Decoupled
Keeping UI primitives decoupled from application state stores or domain APIs ensures maximum reusability, simplifies unit testing (testing visual states via simple props), and prevents tight coupling.

### 6. Controlled vs Uncontrolled Components
A controlled component is an input element (like [`Input`](../src/components/ui/Input.tsx) or [`Select`](../src/components/ui/Select.tsx)) whose value is driven by React state (e.g. `useState`) rather than internal DOM state, ensuring deterministic input behavior and validation.

### 7. Modal Accessibility & Overlay Patterns
[`Modal.tsx`](../src/components/ui/Modal.tsx) implements:
- Accessible ARIA dialog semantics (`role="dialog"`, `aria-modal="true"`, `aria-labelledby`).
- Backdrop click close handlers.
- Keyboard `Escape` key close listeners.
- Body scroll locking (`document.body.style.overflow = 'hidden'`) when active.

### 8. How the Toast System Works
The toast system utilizes a global Zustand store ([`useToastStore.ts`](../src/stores/useToastStore.ts)), a custom hook ([`useToast.ts`](../src/hooks/useToast.ts)), and a portal renderer ([`ToastContainer.tsx`](../src/components/ui/ToastContainer.tsx)). Components trigger `toast.success()` or `toast.error()`, which pushes items into the store. `<ToastContainer />` renders active toasts with auto-dismiss timers and accessible `role="status"` / `role="alert"` announcements.

### 9. How Skeletons Improve Perceived Performance
Skeleton loading components ([`Skeleton.tsx`](../src/components/ui/Skeleton.tsx)) render animated pulse placeholder shapes mimicking the dimensions of actual content before data loading completes, preventing layout shifts (CLS) and lowering perceived latency.

### 10. How Tailwind CSS v3 & Class Merging Work
Tailwind CSS v3 provides low-level utility classes configured with custom design tokens in `tailwind.config.js`. Class names are merged dynamically using the [`cn()`](../src/utils/cn.ts) helper (`clsx` + `tailwind-merge`) to avoid class specificity conflicts.

### 11. Responsive Breakpoints & Mobile Drawer Patterns
SprintDesk uses Tailwind's mobile-first breakpoints (`sm: 640px`, `md: 768px`, `lg: 1024px`). On mobile devices (< 768px), the desktop sidebar converts into a slide-out mobile drawer controlled by hamburger button triggers in `Header.tsx`.

### 12. Accessible DataTable Design
[`DataTable.tsx`](../src/components/ui/DataTable.tsx) renders generic typed tables with explicit `<thead>`, `<tbody>`, `<tr>`, `<th>`, `<td>` HTML elements, empty state banners, and loading skeletons.

### 13. Why UI Primitives Are Separated from Data Fetching
UI components should only be responsible for rendering and user interaction. Delegating API calls to a dedicated service layer ([`api.ts`](../src/services/api.ts)) or custom query hooks improves testability, reusability, and separation of concerns.

### 14. How Dark Mode State is Persisted
Theme preference (`light` / `dark`) is a client-side display preference that affects every component in the DOM. Storing theme mode in a Zustand store ([`useAppStore.ts`](../src/stores/useAppStore.ts)) allows instant theme toggling and DOM class updates (`document.documentElement.classList`) without re-render cascades or prop-drilling.

---

## 2. Key Component Walkthroughs & Interview Q&A

### Q1: How do you handle class name collisions in custom Tailwind components?
We use a `cn()` helper function combining `clsx` and `tailwind-merge`. This allows consumers to pass custom `className` overrides that clean up and override baseline component styles without specificity bugs.

### Q2: How is dark mode implemented across the application?
Dark mode uses Tailwind's `darkMode: 'class'` configuration. `useAppStore` manages theme state and toggles the `dark` class on `document.documentElement`. Every component uses Tailwind `dark:` modifiers (e.g. `bg-white dark:bg-slate-900`).

### Q3: How do you test UI primitives?
UI primitives are tested using React Testing Library (`designSystem.test.tsx`). We render components with various props, simulate user events (`fireEvent.click`, `fireEvent.change`), and assert accessibility attributes and DOM output.

---

## 3. Important Source Files Reference

- [`Button.tsx`](../src/components/ui/Button.tsx): Variants (`primary`, `secondary`, `destructive`, `outline`, `ghost`), loading spinner, icons.
- [`Input.tsx`](../src/components/ui/Input.tsx): Form text input with label, error text (`role="alert"`), helper text, left/right icons.
- [`Select.tsx`](../src/components/ui/Select.tsx): Accessible select dropdown with custom chevron indicator.
- [`Modal.tsx`](../src/components/ui/Modal.tsx): Accessible dialog overlay with backdrop click close, Escape listener, and body scroll lock.
- [`ToastContainer.tsx`](../src/components/ui/ToastContainer.tsx): Toast portal renderer with auto-dismiss timers and accessible announcements.
- [`Skeleton.tsx`](../src/components/ui/Skeleton.tsx): Pulse loading primitives (`Skeleton`, `SkeletonCard`, `SkeletonTable`).
- [`DataTable.tsx`](../src/components/ui/DataTable.tsx): Generic responsive typed table component with headers, cells, skeletons, and empty state.
- [`AppShell.tsx`](../src/components/layout/AppShell.tsx): Responsive application layout composing `Sidebar`, `Header`, and `<Outlet />`.
