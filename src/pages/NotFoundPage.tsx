import React from 'react';
import { Link } from 'react-router-dom';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-extrabold text-indigo-600 dark:text-indigo-400">404</h1>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Page Not Found</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">
          The route you requested does not exist or has been moved.
        </p>
        <div>
          <Link
            to="/dashboard"
            className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-500"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};
