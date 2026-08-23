import React from 'react';

/**
 * Full-Screen Accessible Loading Screen
 * Rendered while initial authentication session validation is in progress.
 */
export const AuthLoadingScreen: React.FC = () => {
  return (
    <div
      role="status"
      aria-label="Validating session"
      className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
    >
      <div className="flex flex-col items-center space-y-4 text-center">
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-sm">
            S
          </div>
          <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            SprintDesk
          </span>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <svg
            className="animate-spin h-5 w-5 text-indigo-600 dark:text-indigo-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
            Validating session...
          </span>
        </div>
      </div>
    </div>
  );
};
