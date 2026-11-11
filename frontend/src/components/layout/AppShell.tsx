import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { WelcomeModal } from '@/components/onboarding/WelcomeModal';
import { GuidedTour } from '@/components/onboarding/GuidedTour';
import { HelpDrawer } from '@/components/onboarding/HelpDrawer';
import { RunwayCopilot } from '@/components/copilot/RunwayCopilot';

export const AppShell: React.FC = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#FBF7F0] text-[#0F3D33]">
      {/* Onboarding Modals & Tour */}
      <WelcomeModal />
      <GuidedTour />
      <HelpDrawer />

      {/* Floating Copilot Assistant */}
      <RunwayCopilot />

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="pl-16 md:pl-[232px] flex flex-col min-h-screen transition-all duration-250">
        {/* TopBar */}
        <TopBar />

        {/* Page Content with gentle 250ms fade and warm whitespace */}
        <main className="flex-1 mt-16 p-6 sm:p-10 max-w-6xl w-full mx-auto space-y-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};
