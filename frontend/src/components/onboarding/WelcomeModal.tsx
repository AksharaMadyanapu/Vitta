import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, TrendingUp, CheckCircle, ArrowRight, X } from 'lucide-react';
import { useOnboarding } from '@/context/OnboardingContext';
import { Button } from '@/components/ui/Button';

export const WelcomeModal: React.FC = () => {
  const { showWelcomeModal, closeWelcomeModal, startTour } = useOnboarding();

  if (!showWelcomeModal) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Warm dimmed Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={closeWelcomeModal}
          className="fixed inset-0 bg-[#0F3D33]/40 backdrop-blur-sm"
        />

        {/* Modal Window: 24px radius, warm cream/white styling */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.25 }}
          className="relative w-full max-w-lg rounded-[24px] bg-white shadow-soft-hover p-7 sm:p-9 z-10"
        >
          {/* Close button */}
          <button
            onClick={closeWelcomeModal}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#F1E9DC] text-[#0F3D33] flex items-center justify-center hover:bg-[#E5DDD0] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Logo & Headline */}
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-[#CDEBDD] text-[#0F3D33] flex items-center justify-center shadow-soft shrink-0">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 18c4-1 8-5 11-10" />
                <path d="M9 7h6v6" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-semibold font-serif text-[#0F3D33]">
                Welcome to Runway
              </h2>
              <p className="text-xs text-[#527A71]">
                Your calm, trustworthy cash-flow mentor
              </p>
            </div>
          </div>

          {/* 3 Short value rows */}
          <div className="mt-6 space-y-3.5">
            <div className="flex items-start gap-4 p-4 rounded-[20px] bg-[#F1E9DC]/70">
              <div className="w-9 h-9 rounded-full bg-white text-[#0F3D33] flex items-center justify-center shrink-0 mt-0.5 shadow-soft">
                <Wallet className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-semibold font-serif text-[#0F3D33]">
                  See your money in one place
                </h4>
                <p className="text-xs text-[#527A71] mt-0.5 leading-relaxed">
                  Track bank balances, pending customer payments, and supplier bills without opening spreadsheets.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-[20px] bg-[#CDEBDD]/60">
              <div className="w-9 h-9 rounded-full bg-white text-[#1C6B56] flex items-center justify-center shrink-0 mt-0.5 shadow-soft">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-semibold font-serif text-[#0F3D33]">
                  Know about cash shortages weeks before they happen
                </h4>
                <p className="text-xs text-[#28584E] mt-0.5 leading-relaxed">
                  Our simulation engine factors in how late each customer usually pays to forecast shortfalls 14 to 60 days out.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-[20px] bg-[#FFE8A3]/50">
              <div className="w-9 h-9 rounded-full bg-white text-[#8A5B00] flex items-center justify-center shrink-0 mt-0.5 shadow-soft">
                <CheckCircle className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-semibold font-serif text-[#0F3D33]">
                  Get clear steps to fix them and check big purchases first
                </h4>
                <p className="text-xs text-[#8A5B00] mt-0.5 leading-relaxed">
                  Receive practical actions to bridge deficits and test planned equipment or material purchases before confirming.
                </p>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-[#527A71] mt-5">
            You're viewing sample data for <strong className="text-[#0F3D33]">Deccan Precision Components</strong>, Hyderabad.
          </p>

          {/* Action buttons */}
          <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
            <Button
              variant="primary"
              size="md"
              className="w-full sm:w-auto flex-1"
              onClick={startTour}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Take a 1-minute tour
            </Button>
            <Button
              variant="secondary"
              size="md"
              className="w-full sm:w-auto"
              onClick={closeWelcomeModal}
            >
              Explore on my own
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
