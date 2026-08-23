import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Kanban, BarChart3, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { cn } from '../../utils/cn';

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
}) => {
  const location = useLocation();

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Sprint Board', path: '/board', icon: Kanban },
    { label: 'Analytics', path: '/analytics', icon: BarChart3 },
  ];

  return (
    <>
      {/* Mobile Drawer Overlay Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs md:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          'fixed top-0 bottom-0 left-0 z-40 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-200 flex flex-col',
          // Mobile state
          isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0',
          // Desktop width state
          isCollapsed ? 'md:w-16' : 'md:w-60'
        )}
      >
        {/* Brand Header */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
          <Link
            to="/dashboard"
            onClick={onCloseMobile}
            className="flex items-center gap-2.5 overflow-hidden"
          >
            <div className="h-9 w-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-xs">
              S
            </div>
            {(!isCollapsed || isMobileOpen) && (
              <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
                SprintDesk
              </span>
            )}
          </Link>

          {/* Mobile Drawer Close Button */}
          <button
            onClick={onCloseMobile}
            aria-label="Close menu"
            className="md:hidden p-1.5 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav aria-label="Main Navigation" className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onCloseMobile}
                title={isCollapsed ? item.label : undefined}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/60',
                  isCollapsed && !isMobileOpen && 'justify-center px-0'
                )}
              >
                <Icon className={cn('h-5 w-5 shrink-0', isActive && 'text-indigo-600 dark:text-indigo-400')} />
                {(!isCollapsed || isMobileOpen) && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Collapse / Expand Toggle Button Footer */}
        <div className="hidden md:flex p-3 border-t border-slate-200 dark:border-slate-800 justify-end">
          <button
            onClick={onToggleCollapse}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="w-full flex items-center justify-center p-2 rounded-md text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>
      </aside>
    </>
  );
};
