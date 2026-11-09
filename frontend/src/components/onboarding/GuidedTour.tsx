import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, X, Sparkles } from 'lucide-react';
import { useOnboarding } from '@/context/OnboardingContext';
import { Button } from '@/components/ui/Button';

interface TourStepConfig {
  title: string;
  description: string;
  targetId: string;
  position: 'top' | 'bottom' | 'center';
}

const TOUR_STEPS: TourStepConfig[] = [
  {
    title: 'Overview — Your money at a glance',
    description: 'This is your financial command centre. Here you see your total cash across bank accounts, incoming customer payments, and bills due in the next 30 days.',
    targetId: 'tour-overview-summary',
    position: 'bottom',
  },
  {
    title: 'Needs your attention — Start here each day',
    description: 'Every morning, check this list. It surfaces the most urgent payments: overdue customer bills, tax liabilities, and upcoming payroll with clear actions.',
    targetId: 'tour-attention-list',
    position: 'top',
  },
  {
    title: 'Cash forecast — See if you will run short of cash',
    description: 'We simulate 2,000 future cash trajectories using each customer’s real payment delay history to warn you about shortfalls 14, 30, or 60 days ahead.',
    targetId: 'tour-forecast-chart',
    position: 'bottom',
  },
  {
    title: 'Check a purchase — Test a big spend before you commit',
    description: 'Thinking of buying new machinery or raw material coils? Test the amount and planned payment date first to make sure it will not trigger an overdraft breach.',
    targetId: 'tour-check-purchase',
    position: 'bottom',
  },
  {
    title: 'Invoices — Add or upload invoices',
    description: 'Manage all customer bills and supplier payables. You can also upload PDF invoices or photos and we will extract the key details automatically.',
    targetId: 'tour-invoices-section',
    position: 'bottom',
  },
  {
    title: 'Help & FAQs — Restart this tour anytime',
    description: 'Have a question about what the numbers mean or whether your data is simulated? Click the Help button in the top bar to review guides or restart this tour.',
    targetId: 'tour-help-button',
    position: 'bottom',
  },
];

export const GuidedTour: React.FC = () => {
  const { tourActive, tourStep, nextTourStep, prevTourStep, skipTour } = useOnboarding();

  if (!tourActive) return null;

  const currentStep = TOUR_STEPS[tourStep] || TOUR_STEPS[0];
  const isLast = tourStep === TOUR_STEPS.length - 1;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 pointer-events-none select-none">
        {/* Dimmed backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 bg-[#111827]/40 pointer-events-auto"
        />

        {/* Floating Centered/Smart Popover Card */}
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50 pointer-events-auto">
          <motion.div
            key={tourStep}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="w-full max-w-md rounded-[14px] bg-white border border-[#E8EAF0] shadow-2xl p-5 relative"
          >
            {/* Header: step indicator & close button */}
            <div className="flex items-center justify-between pb-2.5 border-b border-[#F1F2F6]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#3F3DDB]" />
                <span className="text-xs font-semibold text-[#3F3DDB] uppercase tracking-wider">
                  Step {tourStep + 1} of {TOUR_STEPS.length}
                </span>
              </div>
              <button
                onClick={skipTour}
                className="text-xs text-[#9CA3AF] hover:text-[#111827] transition-colors"
              >
                Skip tour
              </button>
            </div>

            {/* Content */}
            <div className="pt-3.5 pb-2">
              <h3 className="text-base font-bold font-heading text-[#111827]">
                {currentStep.title}
              </h3>
              <p className="text-xs text-[#6B7280] mt-1.5 leading-relaxed">
                {currentStep.description}
              </p>
            </div>

            {/* Footer controls */}
            <div className="mt-4 pt-3 border-t border-[#F1F2F6] flex items-center justify-between">
              <div>
                {tourStep > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={prevTourStep}
                    leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
                  >
                    Back
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={nextTourStep}
                  rightIcon={!isLast ? <ArrowRight className="w-3.5 h-3.5" /> : undefined}
                >
                  {isLast ? 'Done & finish' : 'Next'}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};

