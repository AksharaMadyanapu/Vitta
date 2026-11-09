import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

export const AppShell: React.FC = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-[#111827]">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="pl-[232px] flex flex-col min-h-screen">
        {/* TopBar */}
        <TopBar />

        {/* Page Content with 150ms simple fade */}
        <main className="flex-1 mt-14 p-6 sm:p-8 max-w-6xl w-full mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};
