# SprintDesk - Engineering Study Material & Interview Guide

This guide breaks down the core frontend concepts, architectural patterns, and technology decisions powering **SprintDesk**. It is designed as an interview preparation reference explaining *why* each choice was made and *how* the application is constructed.

---

## 1. What React is
React is a declarative, component-based JavaScript library for building user interfaces. It enables developers to build complex UIs by composing small, isolated pieces of code called "components" that react efficiently to changes in underlying state.

## 2. Why React is being used here
SprintDesk requires a highly interactive, dynamic, single-page application (SPA) experience with real-time feedback (such as Kanban drag-and-drop, interactive analytics charts, and active sprint monitoring). React’s component model, Virtual DOM reconciliation, and rich ecosystem make it ideal for managing complex B2B SaaS state changes without full page reloads.

## 3. What TypeScript is and why strict mode matters
TypeScript is a strongly typed superset of JavaScript that compiles to plain JavaScript. 
- **Why Strict Mode Matters**: Enforcing `strict: true` disables implicit `any` types, enforces strict null/undefined checks, and ensures function parameters and return types are explicitly checked at compile time. This prevents entire classes of runtime errors (such as `Cannot read property 'x' of undefined`) and guarantees self-documenting code contracts across the application.

## 4. What Vite does
Vite is a modern frontend build tool that powers fast local development and production bundling.
- **Development**: Utilizes native ES Modules (ESM) to serve source files directly without upfront bundling, enabling instant server start and near-instantaneous Hot Module Replacement (HMR).
- **Production**: Uses Rollup under the hood to perform tree-shaking, code splitting, and bundle optimization.

## 5. What Tailwind CSS does
Tailwind CSS is a utility-first CSS framework that provides low-level utility classes directly in markup (e.g., `flex`, `pt-4`, `text-center`, `shadow-sm`).
- **Benefits**: Eliminates naming fatigue, enforces responsive design breakpoints, reduces bundle size (Purge/Just-In-Time compiler removes unused CSS), and ensures design system consistency through configuration tokens without external UI component library lock-in.

## 6. What TanStack Query is
TanStack Query (v5) is a data-fetching, caching, and state synchronization library for React.
- **Role**: Manages server state lifecycle—handling asynchronous data loading, automated background refetching, caching, garbage collection (`gcTime`), request deduplication, optimistic updates, and error handling out-of-the-box.

## 7. What Zustand is
Zustand is a lightweight, unopinionated client-side state management library built on React hooks.
- **Role**: Manages transient global client state (e.g., light/dark theme preference, sidebar collapse/expand) without the boilerplate, Redux action ceremonies, or React Context re-rendering overhead.

## 8. What React Router is
React Router (v6+) is the standard routing library for React applications.
- **Role**: Synchronizes browser URL paths with visible UI component trees. Enables client-side navigation without full page refreshes, handles route parameters, nested layouts, and route fallback management.

## 9. What component architecture means
Component architecture is the practice of breaking an application down into modular, single-responsibility UI pieces. Components are structured hierarchically (e.g., Atomic UI -> Compound Components -> Feature Blocks -> Page Views) so code remains reusable, testable, and easy to refactor.

## 10. What application state means
Application state represents the snapshot of data stored in memory that determines what the UI renders at any given moment (e.g., active user details, loaded tasks, active modal states, or current theme).

## 11. Difference between state categories
- **Server State**: Data owned and persisted by remote backend databases (e.g., tasks, comments, sprints). Managed via **TanStack Query**.
- **Global/Client State**: Client-only UI preferences shared across distant components (e.g., active theme mode, sidebar visibility). Managed via **Zustand**.
- **Local Component State**: Ephemeral state isolated to a single component (e.g., dropdown toggle state, controlled text input field value). Managed via React’s **`useState`**.

## 12. What a provider is in React
A Provider is a React component that utilizes React Context to supply data or functionality to its descendant component subtree without passing props manually down through every level ("prop drilling").
- *Example in SprintDesk*: `<QueryClientProvider>` provides query caching capabilities to all child components.

## 13. What a hook is in React
A React Hook is a special JavaScript function starting with `use` (e.g., `useState`, `useEffect`, `useContext`) that allows functional components to tap into React state, lifecycle features, and context without writing ES6 classes.

## 14. Why we will use custom hooks later
Custom hooks allow us to encapsulate and share complex stateful logic or side effects between multiple components (e.g., `useSprintTasks`, `useTheme`, `useNotificationPolling`) keeping UI components clean, declarative, and focused solely on rendering.

## 15. What a service/API layer means
A service layer is an architectural boundary that encapsulates all raw HTTP networking, API endpoints, data transformation, and backend interaction.
- *In SprintDesk*: `src/services/api.ts` abstracts data retrieval from `mock-data.json` so UI components never touch raw URLs directly.

## 16. Why API access should be separated from UI components
Separating API logic from UI components enforces the **Separation of Concerns** principle:
- **Testability**: Components can be tested in isolation by mocking service calls.
- **Maintainability**: If API schemas or endpoints change, only the service layer needs updating, leaving UI components untouched.
- **Reusability**: Multiple components can consume the same service methods cleanly.

## 17. What code splitting means
Code splitting is a technique that breaks JavaScript bundles into smaller chunks loaded on-demand (e.g., dynamic imports using `React.lazy()` and `<Suspense>`). This prevents users from downloading code for pages they haven't visited, drastically improving initial page load times.

## 18. Why tests are important
Automated tests (Unit, Integration, E2E) verify that code operates as specified, preventing regressions when adding new features or refactoring.
- *In SprintDesk*: **Vitest** + **React Testing Library** verify component rendering, user interactions, accessibility states, and state management behavior reliably.

## 19. Overall SprintDesk Architecture
SprintDesk follows a strict unidirectional layered architecture:
```
UI Components (Pages/Widgets)
        ↓
Custom Query Hooks (TanStack Query / Zustand Stores)
        ↓
Service / Data Access Layer (ApiService)
        ↓
Data Source (mock-data.json / Remote REST API)
```
- Client UI state (theme, sidebar) is isolated in **Zustand**.
- Server domain data (sprints, tasks) is cached and managed via **TanStack Query**.
- UI styling is built from scratch using **Tailwind CSS v3**.
