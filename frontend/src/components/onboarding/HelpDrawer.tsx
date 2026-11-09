import React, { useState } from 'react';
import { HelpCircle, RotateCcw, ChevronDown, ChevronUp, CheckCircle, Info } from 'lucide-react';
import { Drawer } from '@/components/ui/Drawer';
import { Button } from '@/components/ui/Button';
import { useOnboarding } from '@/context/OnboardingContext';

interface FAQ {
  q: string;
  a: string;
}

export const HelpDrawer: React.FC = () => {
  const {
    isHelpOpen,
    setIsHelpOpen,
    restartTour,
    checklistDismissed,
    setChecklistDismissed,
    resetAllOnboarding,
  } = useOnboarding();

  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs: FAQ[] = [
    {
      q: 'What does the cash forecast mean?',
      a: 'The forecast projects your daily bank balance 14, 30, and 60 days ahead. It runs 2,000 simulations that factor in each customer’s real past payment delay (bootstrap distribution) and your recurring monthly costs like salaries, rent, and GST liabilities.',
    },
    {
      q: 'How do I add or upload an invoice?',
      a: 'Go to the Invoices page and click "Create invoice" for manual entry, or "Upload invoice PDF". We automatically extract the invoice number, party name, GSTIN, amount, and due date.',
    },
    {
      q: 'Is my bank data real?',
      a: 'No. You are currently viewing synthetic sample data in a simulated sandbox environment for Deccan Precision Components Pvt Ltd (Hyderabad). In production, Runway connects directly to Indian bank feeds via Account Aggregators or statement imports.',
    },
    {
      q: 'What should I do if a cash shortage is predicted?',
      a: 'Visit the "Alerts and suggestions" page or Cash forecast. Typical preventive steps include requesting a 50% part-payment from a customer, negotiating staggered delivery on raw materials, or temporarily drawing from an overdraft facility.',
    },
    {
      q: 'How does "Check a purchase" work?',
      a: 'Before signing a purchase order or committing capex funds, enter the amount, vendor, and execution date. Runway re-simulates your cash trajectory to tell you if the purchase is safe or if it risks causing a negative bank balance.',
    },
    {
      q: 'Can I bring back the Getting Started checklist?',
      a: 'Yes! If you dismissed the checklist from your Overview page, you can unhide it using the button below at any time.',
    },
  ];

  return (
    <Drawer
      isOpen={isHelpOpen}
      onClose={() => setIsHelpOpen(false)}
      title="Help & guides"
      description="Learn how Runway helps Indian MSMEs manage cash flow."
      footer={
        <div className="w-full flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={resetAllOnboarding}
            className="text-xs text-[#6B7280]"
          >
            Reset demo tour
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsHelpOpen(false)}
          >
            Close
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        {/* Quick Tour Banner */}
        <div className="p-4 rounded-[10px] bg-[#EEF0FD] border border-[#D8DAFA]">
          <h4 className="text-sm font-semibold text-[#111827]">
            Guided product tour
          </h4>
          <p className="text-xs text-[#6B7280] mt-1 leading-relaxed">
            Take a 1-minute walkthrough highlighting the main cash-flow tools.
          </p>
          <div className="mt-3">
            <Button
              variant="primary"
              size="sm"
              onClick={restartTour}
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
            >
              Restart guided tour
            </Button>
          </div>
        </div>

        {/* How Runway Works */}
        <div className="p-4 rounded-[10px] bg-[#F5F6FA] border border-[#E8EAF0] space-y-2">
          <h4 className="text-sm font-semibold text-[#111827]">
            How Runway works
          </h4>
          <p className="text-xs text-[#6B7280] leading-relaxed">
            Indian manufacturers frequently experience cash pinches because buyers pay 30–60 days late while raw materials, electricity, GST, and worker wages must be paid strictly on time.
          </p>
          <p className="text-xs text-[#6B7280] leading-relaxed">
            Runway closes this gap by learning each buyer’s delay pattern, predicting the exact dates cash will drop below zero, and testing big spends before you confirm them.
          </p>
        </div>

        {/* Checklist restore option */}
        {checklistDismissed && (
          <div className="p-3.5 rounded-[10px] border border-[#E8EAF0] flex items-center justify-between">
            <span className="text-xs text-[#111827] font-medium">Getting started checklist is hidden</span>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setChecklistDismissed(false)}
            >
              Show checklist
            </Button>
          </div>
        )}

        {/* 6 FAQs */}
        <div className="space-y-2 pt-1">
          <h4 className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider">
            Frequently asked questions
          </h4>

          <div className="divide-y divide-[#E8EAF0] border border-[#E8EAF0] rounded-[10px] bg-white overflow-hidden">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="transition-colors">
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-3.5 flex items-center justify-between text-left gap-3 text-xs font-medium text-[#111827] hover:bg-[#F9FAFB]"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp className="w-3.5 h-3.5 text-[#9CA3AF] shrink-0" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 text-[#9CA3AF] shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-3.5 pb-3.5 text-xs text-[#6B7280] leading-relaxed bg-[#F9FAFB]/50">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Drawer>
  );
};

