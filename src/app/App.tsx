import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { AppProviders } from './providers';
import { router } from './router';

/**
 * Core Application Root Component
 * Integrates global providers with application router.
 */
export const App: React.FC = () => {
  return (
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  );
};
