# SprintDesk - Analytics & Data Visualization Study Guide

This guide details the pure derived state architecture, Recharts integration, data aggregation formulas, and technical choices powering the **SprintDesk Analytics & Data Visualization System**. It serves as a comprehensive reference for technical interviews.

---

## 1. Core Analytics & Data Visualization Concepts

### 1. What Data Visualization is
Data visualization is the graphic representation of complex quantitative information (such as sprint metrics, task completion velocity, and workload distribution) to facilitate rapid decision-making and pattern recognition.

### 2. Why Analytics Should be Derived from Application Data
Storing separate analytics data in global state or hardcoding chart values creates data synchronization bugs. In **SprintDesk**, analytics metrics are pure derived values computed directly from `useBoardStore` state and `mock-data.json`, guaranteeing that any task drag, creation, edit, or deletion instantly updates all charts.

### 3. What Recharts is
Recharts is a composable, SVG-based React charting library built with React component primitives (`ResponsiveContainer`, `BarChart`, `PieChart`, `AreaChart`, `XAxis`, `YAxis`, `Tooltip`, `Legend`).

### 4. Why Recharts Was Chosen
Recharts provides native React component abstraction, declarative API composition, built-in responsive container auto-scaling, customizable SVG tooltips, and smooth CSS transitions without requiring direct DOM manipulation (like D3).

### 5. How Raw Tasks Become Chart Data
Raw task objects ([`Task`](../src/types/index.ts)) pass into pure aggregation functions in [`src/utils/analytics.ts`](../src/utils/analytics.ts). Arrays of raw tasks are filtered, grouped, and mapped into strongly-typed chart data arrays formatted specifically for Recharts consumption.

### 6. What a Transformation / Aggregation Function is
A pure JavaScript function that takes raw domain entities as inputs, executes deterministic grouping or mathematical calculations (such as counting tasks by status or sum-aggregating completions), and returns immutable chart-ready data structures without side effects.

### 7. How `filter()`, `reduce()`, and Grouping Concepts Are Used
- **Status Distribution**: Iterates through `tasks` array, initializing a status count accumulator object (`Record<TaskStatus, number>`).
- **Priority Breakdown**: Maps status columns and filters tasks by `priority === 'high' | 'medium' | 'low'`.
- **Completion Trend**: Filters completed tasks (`status === 'done'` and `completedAt !== null`), groups by `YYYY-MM-DD` string keys, and computes daily and cumulative running totals.

### 8. How Current Status Analytics Differ from Historical Completion Analytics
- **Current Status Analytics**: Reflects real-time active board state (`Backlog`, `In Progress`, `Review`, `Done`). Moving a task from `In Progress` -> `Done` immediately changes these distribution charts.
- **Historical Completion Analytics**: Analyzes timestamped completion records (`completedAt`) over time and across past sprints (`Sprint 1`, `Sprint 2`, `Sprint 3`).

### 9. How Sprint Velocity is Calculated
Velocity is defined as the number of completed tasks allocated to a specific sprint (`sprintId`). `getSprintVelocity(tasks, sprints)` filters tasks by `sprintId` and counts items where `status === 'done'` or `completedAt !== null`.

### 10. How Priority-by-Status Analysis is Calculated
`getPriorityBreakdown(tasks)` groups tasks by status column (`backlog`, `in-progress`, `review`, `done`) and counts `High`, `Medium`, and `Low` priority items within each stage, rendering a stacked bar chart.

### 11. How Completion Trend is Calculated
`getCompletionTrend(tasks)` filters completed tasks, extracts `completedAt` ISO date strings, sorts dates chronologically, and calculates cumulative completion counts over time.

### 12. Why Analytics State Should Not be Duplicated in Zustand
Storing calculated chart datasets inside a separate `useAnalyticsStore` introduces redundant state synchronization logic and stale cache risks. Analytics is **derived state** and is calculated on demand using React's `useMemo()`.

### 13. How Charts React to Board State Changes
When a user drags a task on the Kanban board or creates a new task, Zustand updates `tasks` in `useBoardStore`. Any component (like `AnalyticsPage`) reading `useBoardStore` automatically re-renders, causing `useMemo()` to re-compute analytics transformation functions and re-render Recharts SVG components.

### 14. What Responsive Chart Rendering Means
`ResponsiveContainer` dynamically calculates parent container dimensions (`width="100%"` and `height="100%"`) and scales SVG chart elements seamlessly across 375px mobile screens, tablets, and 1440px+ desktop viewports.

### 15. What Tooltips and Legends Provide
- **Tooltips**: Provide contextual detail on cursor hover, formatting raw values into human-readable strings (e.g. `Completed Tasks: 8`).
- **Legends**: Provide visual category keys linking chart colors to domain statuses or priorities.

### 16. How Empty and Error States Are Handled
If `tasks` is empty or data fetching fails, chart components check `data.length === 0` and display a clean text banner (`"No analytics data available"`) instead of throwing SVG rendering exceptions.

### 17. How Memoization (`useMemo`) is Used and Why
`AnalyticsPage` wraps transformation function calls in `useMemo(() => getAnalyticsSummary(tasks), [tasks])`. This ensures data aggregation algorithms only re-run when `tasks` or `sprints` references actually change, preventing unneeded recalculations during un-related UI updates.

### 18. How These Analytics Could Later be Backed by a Real Analytics API
If backend aggregation endpoints are introduced (e.g. `GET /api/analytics/velocity`), `useBoardData` can fetch pre-aggregated payloads directly from the server without changing the presentational Recharts chart components.

---

## 2. Key Component Walkthroughs & Interview Q&A

### Q1: Why isn't analytics stored in Zustand?
Analytics is derived state. Storing derived state in global stores creates single-source-of-truth violations and requires manual synchronization on every task edit. Using pure functions + `useMemo` guarantees 100% data consistency.

### Q2: Why did you create a separate transformation module (`analytics.ts`)?
Decoupling calculation logic from React JSX components ensures transformation functions are pure, independently unit-testable (without DOM rendering overhead), reusable across export generators or reports, and easy to maintain.

### Q3: How does moving a task update the charts in real-time?
When a task moves to `Done`, `useBoardStore.moveTask()` updates the task array in memory. `AnalyticsPage` subscribes to `useBoardStore`. React detects the state update, `useMemo()` re-evaluates `getTaskStatusDistribution()` and `getCompletionTrend()`, and Recharts animates the new data SVG elements.

### Q4: How would this scale if there were 100,000 tasks?
For 100,000 tasks, client-side array iteration would become a bottleneck. We would offload aggregation to backend SQL database queries (or web worker threads) and consume pre-calculated summary endpoints via TanStack Query.

---

## 3. Important Source Files Reference

- [`src/utils/analytics.ts`](../src/utils/analytics.ts): Pure data transformation module (`getSprintVelocity`, `getTaskStatusDistribution`, `getPriorityBreakdown`, `getCompletionTrend`, `getAnalyticsSummary`).
- [`src/components/analytics/SprintVelocityChart.tsx`](../src/components/analytics/SprintVelocityChart.tsx): BarChart comparing completed vs total tasks per sprint.
- [`src/components/analytics/TaskStatusChart.tsx`](../src/components/analytics/TaskStatusChart.tsx): Donut/Pie Chart displaying task distribution across status columns.
- [`src/components/analytics/PriorityBreakdownChart.tsx`](../src/components/analytics/PriorityBreakdownChart.tsx): Stacked BarChart visualizing High, Medium, and Low priorities across stages.
- [`src/components/analytics/CompletionTrendChart.tsx`](../src/components/analytics/CompletionTrendChart.tsx): AreaChart visualizing cumulative completion trend over time.
- [`src/pages/AnalyticsPage.tsx`](../src/pages/AnalyticsPage.tsx): Analytics dashboard composing summary KPI cards and Recharts visualization cards.
- [`src/tests/analytics.test.tsx`](../src/tests/analytics.test.tsx): Vitest test suite verifying calculation logic, edge cases, and real-time UI updates.
