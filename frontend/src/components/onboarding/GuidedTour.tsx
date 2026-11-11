import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { useOnboarding } from '@/context/OnboardingContext';
import { Button } from '@/components/ui/Button';

interface TourStepConfig {
  title: string;
  description: string;
  route: string;
}

// Exactly 3 Tour Steps: Home, Forecast, Check a purchase
const TOUR_STEPS: TourStepConfig[] = [
  {
    title: '1. Home — How is my cash?',
    description: 'See whether your cash will be tight in the next 30 days in one simple sentence and chart, with your single best next action.',
    route: '/dashboard',
  },
  {
    title: '2. Forecast — Will I run short of cash?',
    description: 'Simulate 2,000 cash paths based on your real customer payment habits, and test 3 big solutions with instant toggle chips.',
    route: '/forecast',
  },
  {
    title: '3. Check a purchase — Can I afford this?',
    description: 'Test any machine purchase or raw material order before you commit. We show before-and-after cash curves and safer payment alternatives.',
    route: '/pre-transaction',
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
          transition={{ duration: 0.25 }}
          className="fixed inset-0 bg-[#0F3D33]/40 backdrop-blur-sm pointer-events-auto"
        />

        {/* Floating Centered Tour Card */}
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50 pointer-events-auto">
          <motion.div
            key={tourStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="w-full max-w-md rounded-[24px] bg-white shadow-soft-hover p-7 relative"
          >
            {/* Header: step indicator & close button */}
            <div className="flex items-center justify-between pb-3 border-b border-[#F1E9DC]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#FF6B4A]" />
                <span className="text-xs font-semibold text-[#FF6B4A] uppercase tracking-wider">
                  Step {tourStep + 1} of {TOUR_STEPS.length}
                </span>
              </div>
              <button
                onClick={skipTour}
                className="text-xs text-[#527A71] hover:text-[#0F3D33] transition-colors"
              >
                Skip tour
              </button>
            </div>

            {/* Content */}
            <div className="pt-4 pb-2">
              <h3 className="text-lg font-semibold font-serif text-[#0F3D33]">
                {currentStep.title}
              </h3>
              <p className="text-xs text-[#527A71] mt-2 leading-relaxed">
                {currentStep.description}
              </p>
            </div>

            {/* Step navigation buttons */}
            <div className="pt-4 border-t border-[#F1E9DC] flex items-center justify-between">
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
                  {isLast ? 'Done exploring' : 'Next'}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};
