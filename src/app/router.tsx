import React, { Suspense } from 'react';
import { RouteObject, Navigate, Outlet, createBrowserRouter } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';
import { AppShell } from '../components/layout/AppShell';
import { AuthLoadingScreen } from '../components/layout/AuthLoadingScreen';
import { RouteLoadingFallback } from '../components/layout/RouteLoadingFallback';

// Route-level code splitting using React.lazy()
const LoginPage = React.lazy(() =>
  import('../pages/LoginPage').then((m) => ({ default: m.LoginPage }))
);
const DashboardPage = React.lazy(() =>
  import('../pages/DashboardPage').then((m) => ({ default: m.DashboardPage }))
);
const BoardPage = React.lazy(() =>
  import('../pages/BoardPage').then((m) => ({ default: m.BoardPage }))
);
const AnalyticsPage = React.lazy(() =>
  import('../pages/AnalyticsPage').then((m) => ({ default: m.AnalyticsPage }))
);
const NotFoundPage = React.lazy(() =>
  import('../pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage }))
);

/**
 * Protected Route Guard
 */
export const ProtectedRouteGuard: React.FC = () => {
  const { status } = useAuthStore();

  if (status === 'initializing') {
    return <AuthLoadingScreen />;
  }

  if (status !== 'authenticated') {
    return <Navigate to="/login" replace />;
  }

  return (
    <Suspense fallback={<RouteLoadingFallback />}>
      <Outlet />
    </Suspense>
  );
};

/**
 * Public Route Guard
 */
export const PublicRouteGuard: React.FC = () => {
  const { status } = useAuthStore();

  if (status === 'initializing') {
    return <AuthLoadingScreen />;
  }

  if (status === 'authenticated') {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <Suspense fallback={<RouteLoadingFallback />}>
      <Outlet />
    </Suspense>
  );
};

/**
 * Application Route Specification Tree
 */
export const routes: RouteObject[] = [
  {
    element: <PublicRouteGuard />,
    children: [
      {
        path: '/login',
        element: <LoginPage />,
      },
    ],
  },
  {
    element: <ProtectedRouteGuard />,
    children: [
      {
        element: <AppShell />,
        children: [
          {
            path: '/dashboard',
            element: <DashboardPage />,
          },
          {
            path: '/board',
            element: <BoardPage />,
          },
          {
            path: '/analytics',
            element: <AnalyticsPage />,
          },
        ],
      },
    ],
  },
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: '*',
    element: (
      <Suspense fallback={<RouteLoadingFallback />}>
        <NotFoundPage />
      </Suspense>
    ),
  },
];

export const router = createBrowserRouter(routes);
