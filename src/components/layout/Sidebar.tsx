import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Kanban, BarChart3, ChevronLeft, ChevronRight, X, Layers, Sparkles } from 'lucide-react';
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

  const pinnedProjects = [
    { name: 'Sprint 3 — Active', path: '/board' },
    { name: 'Q3 Product Roadmap', path: '/board' },
  ];

  // Helper render for navigation content (used in both desktop and mobile modes)
  const renderSidebarContent = (showFullContent: boolean, isMobileView: boolean) => (
    <div className="flex flex-col h-full">
      {/* Brand Header — Unclipped & Structurally Padded */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-neutral-200/80 dark:border-neutral-800/80 shrink-0">
        <Link
          to="/dashboard"
          onClick={isMobileView ? onCloseMobile : undefined}
          className="flex items-center gap-3 group"
        >
          <div className="h-9 w-9 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 flex items-center justify-center font-bold text-lg shrink-0 shadow-xs transition-transform group-hover:scale-105">
            <Layers className="h-5 w-5" />
          </div>
          {showFullContent && (
            <span className="font-extrabold text-lg tracking-tight text-neutral-900 dark:text-white uppercase whitespace-nowrap">
              SprintDesk
            </span>
          )}
        </Link>

        {/* Mobile Drawer Close Button */}
        {isMobileView && (
          <button
            onClick={onCloseMobile}
            aria-label="Close menu"
            className="md:hidden p-1.5 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-200/60 dark:hover:bg-neutral-800"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <nav aria-label="Main Navigation" className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={isMobileView ? onCloseMobile : undefined}
                title={!showFullContent ? item.label : undefined}
                className={cn(
                  'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                  isActive
                    ? 'bg-neutral-200/80 dark:bg-neutral-800 text-neutral-900 dark:text-white font-semibold shadow-2xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-200/40 dark:hover:bg-neutral-800/40',
                  !showFullContent && 'justify-center px-0'
                )}
              >
                <Icon
                  className={cn(
                    'h-4.5 w-4.5 shrink-0 transition-colors',
                    isActive ? 'text-neutral-900 dark:text-white' : 'text-neutral-500 dark:text-neutral-400'
                  )}
                />
                {showFullContent && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </div>

        {/* Pinned Projects / Sprints Section */}
        {showFullContent && (
          <div className="pt-2 border-t border-neutral-200/60 dark:border-neutral-800/60 space-y-2">
            <p className="px-3.5 text-xs font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
              Pinned
            </p>
            <div className="space-y-1">
              {pinnedProjects.map((proj, idx) => (
                <Link
                  key={idx}
                  to={proj.path}
                  onClick={isMobileView ? onCloseMobile : undefined}
                  className="flex items-center gap-2.5 px-3.5 py-2 rounded-lg text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200/30 dark:hover:bg-neutral-800/30 transition-colors truncate"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                  <span className="truncate">{proj.name}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Assistant Quick Card */}
        {showFullContent && (
          <div className="pt-4">
            <div className="p-3.5 rounded-2xl bg-neutral-200/50 dark:bg-neutral-800/70 border border-neutral-200/80 dark:border-neutral-700/60 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-neutral-900 dark:text-white">
                <Sparkles className="h-4 w-4 text-amber-500 shrink-0" />
                <span>Sprint 3 Active</span>
              </div>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-normal">
                Real-time polling & sprint velocity tracking active.
              </p>
            </div>
          </div>
        )}
      </nav>

      {/* Desktop Collapse / Expand Toggle Button Footer */}
      {!isMobileView && (
        <div className="hidden md:flex p-3 border-t border-neutral-200/80 dark:border-neutral-800 justify-end shrink-0">
          <button
            onClick={onToggleCollapse}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="w-full flex items-center justify-center p-2 rounded-xl text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 transition-colors"
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* 1. Mobile Drawer Overlay Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-neutral-900/50 dark:bg-neutral-950/80 backdrop-blur-xs md:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* 2. Mobile Drawer Navigation Container */}
      {isMobileOpen && (
        <aside
          className="fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 shadow-2xl md:hidden animate-in slide-in-from-left duration-200"
          aria-label="Mobile Navigation"
        >
          {renderSidebarContent(true, true)}
        </aside>
      )}

      {/* 3. Structural Sidebar (adjacent flex child in AppShell layout for desktop only) */}
      <aside
        className={cn(
          'hidden md:flex flex-col shrink-0 sticky top-2 sm:top-4 lg:top-5 h-[calc(100vh-1rem)] sm:h-[calc(100vh-2rem)] transition-all duration-200',
          isCollapsed ? 'w-16' : 'w-60'
        )}
        aria-label="Main Navigation"
      >
        {renderSidebarContent(!isCollapsed, false)}
      </aside>
    </>
  );
};
