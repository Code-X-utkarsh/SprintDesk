import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAppStore } from '../../stores/useAppStore';
import { useAuth } from '../../hooks/useAuth';
import { Moon, Sun, LayoutDashboard, Kanban, BarChart3, LogOut, ShieldAlert } from 'lucide-react';

export const AppLayout: React.FC = () => {
  const location = useLocation();
  const { theme, toggleTheme } = useAppStore();
  const { user, logout, isSimulatedExpired, toggleSimulatedExpired } = useAuth();

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Sprint Board', path: '/board', icon: Kanban },
    { label: 'Analytics', path: '/analytics', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
      {/* Navigation Header */}
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/dashboard" className="flex items-center gap-2 font-bold text-lg tracking-tight text-indigo-600 dark:text-indigo-400">
              <div className="h-8 w-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold shadow-sm">
                S
              </div>
              <span>SprintDesk</span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {/* Simulation Expiry Button */}
            <button
              onClick={toggleSimulatedExpired}
              title="Toggle simulated 401 token expiration for testing silent refresh"
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                isSimulatedExpired
                  ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
              }`}
            >
              <ShieldAlert className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">
                {isSimulatedExpired ? 'Simulating 401 Expiry' : 'Simulate Expiry'}
              </span>
            </button>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-label="Toggle light and dark theme"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-600" />}
            </button>

            {/* User Profile Badge */}
            {user && (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
                {user.image ? (
                  <img
                    src={user.image}
                    alt={user.username}
                    className="h-8 w-8 rounded-full border border-slate-200 dark:border-slate-700 object-cover"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center text-xs">
                    {user.firstName[0]}
                  </div>
                )}
                <div className="hidden lg:block text-left">
                  <p className="text-xs font-semibold text-slate-900 dark:text-white leading-none">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                    @{user.username}
                  </p>
                </div>
              </div>
            )}

            {/* Logout Button */}
            <button
              onClick={logout}
              className="flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 px-3 py-2 rounded-md border border-slate-200 dark:border-slate-800 transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
};
