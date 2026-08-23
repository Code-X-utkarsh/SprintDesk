import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { ToastContainer } from '../ui/ToastContainer';
import { cn } from '../../utils/cn';

/**
 * Production Authenticated Application Shell Layout
 * Composes Sidebar navigation, Header, ToastContainer, and Outlet content area.
 */
export const AppShell: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans flex flex-col">
      {/* Toast Notification Container */}
      <ToastContainer />

      {/* Navigation Sidebar */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area Container (Shifted based on desktop sidebar collapse state) */}
      <div
        className={cn(
          'flex-1 flex flex-col transition-all duration-200',
          isSidebarCollapsed ? 'md:pl-16' : 'md:pl-60'
        )}
      >
        <Header onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)} />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
