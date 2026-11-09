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
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={closeWelcomeModal}
          className="fixed inset-0 bg-[#111827]/45"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.18 }}
          className="relative w-full max-w-lg rounded-[14px] bg-white border border-[#E8EAF0] shadow-2xl p-6 sm:p-7 z-10"
        >
          {/* Close button */}
          <button
            onClick={closeWelcomeModal}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Logo & Headline */}
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-[#3F3DDB] flex items-center justify-center text-white shadow-sm shrink-0">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 17l6-6 4 4 6-8" />
                <path d="M14 7h6v6" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold font-heading text-[#111827]">
                Welcome to Runway
              </h2>
              <p className="text-xs text-[#6B7280]">
                Cash-flow intelligence built for Indian MSME manufacturers
              </p>
            </div>
          </div>

          {/* 3 Short value rows */}
          <div className="mt-5 space-y-3.5">
            <div className="flex items-start gap-3.5 p-3 rounded-[10px] bg-[#F5F6FA] border border-[#E8EAF0]">
              <div className="w-8 h-8 rounded-lg bg-[#EEF0FD] text-[#3F3DDB] flex items-center justify-center shrink-0 mt-0.5">
                <Wallet className="w-4 h-4" strokeWidth={2} />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-[#111827]">
                  See your money in one place
                </h4>
                <p className="text-xs text-[#6B7280] mt-0.5 leading-relaxed">
                  Track bank balances, pending customer payments, and supplier bills without opening spreadsheets.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-3 rounded-[10px] bg-[#F5F6FA] border border-[#E8EAF0]">
              <div className="w-8 h-8 rounded-lg bg-[#E8F7EE] text-[#15803D] flex items-center justify-center shrink-0 mt-0.5">
                <TrendingUp className="w-4 h-4" strokeWidth={2} />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-[#111827]">
                  Know about cash shortages weeks before they happen
                </h4>
                <p className="text-xs text-[#6B7280] mt-0.5 leading-relaxed">
                  Our simulation engine factors in how late each customer usually pays to forecast shortfalls 14 to 60 days out.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-3 rounded-[10px] bg-[#F5F6FA] border border-[#E8EAF0]">
              <div className="w-8 h-8 rounded-lg bg-[#E6F7F7] text-[#0EA5A4] flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle className="w-4 h-4" strokeWidth={2} />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-[#111827]">
                  Get clear steps to fix them and check big purchases first
                </h4>
                <p className="text-xs text-[#6B7280] mt-0.5 leading-relaxed">
                  Receive practical actions to bridge deficits and test planned equipment or material purchases before confirming.
                </p>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-6 flex flex-col sm:flex-row items-center gap-2.5">
            <Button
              variant="primary"
              size="lg"
              className="w-full sm:flex-1 justify-center"
              onClick={startTour}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Take a 1-minute tour
            </Button>
            <Button
              variant="secondary"
              size="lg"
              className="w-full sm:w-auto"
              onClick={closeWelcomeModal}
            >
              Explore on my own
            </Button>
          </div>

          {/* Small honest note */}
          <p className="mt-3.5 text-center text-[11px] text-[#9CA3AF]">
            You're viewing sample data for Deccan Precision Components Pvt Ltd (Hyderabad).
          </p>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

