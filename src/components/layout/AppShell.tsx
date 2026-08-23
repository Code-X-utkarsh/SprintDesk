import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { ToastContainer } from '../ui/ToastContainer';

/**
 * Production Authenticated Application Shell Layout
 * Styled with a structural parent flex layout where the desktop Sidebar
 * and Main Content Surface are structurally adjacent, eliminating any sidebar overlap.
 */
export const AppShell: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 font-sans p-0 sm:p-4 lg:p-5 flex transition-colors duration-200">
      {/* Toast Notification Container */}
      <ToastContainer />

      {/* Main Structural Flex Wrapper */}
      <div className="flex-1 flex gap-3 sm:gap-4 lg:gap-5 min-h-screen sm:min-h-[calc(100vh-2rem)] max-w-[1920px] mx-auto w-full relative">
        {/* Navigation Sidebar */}
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* Main Content Surface (Full viewport width on mobile, rounded card on desktop) */}
        <div className="flex-1 flex flex-col min-w-0 w-full bg-white dark:bg-neutral-900 rounded-none sm:rounded-3xl border-0 sm:border border-neutral-200/80 dark:border-neutral-800/80 shadow-none sm:shadow-sm overflow-hidden">
          <Header onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)} />

          <main className="flex-1 w-full mx-auto px-3.5 sm:px-6 lg:px-8 py-4 sm:py-5 overflow-y-auto overflow-x-hidden">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};
