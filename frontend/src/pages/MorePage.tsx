import React from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  BarChart2,
  Settings,
  HelpCircle,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { useOnboarding } from '@/context/OnboardingContext';

interface MoreLinkItem {
  title: string;
  description: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  bg: string;
}

export const MorePage: React.FC = () => {
  const { setIsHelpOpen, startTour } = useOnboarding();

  const links: MoreLinkItem[] = [
    {
      title: 'Calendar & Reminders',
      description: 'Payment schedule and WhatsApp reminders for customer receivables.',
      path: '/reminders',
      icon: Calendar,
      bg: 'bg-[#CDEBDD]',
    },
    {
      title: 'Payment behaviour',
      description: 'Historical payment delays and reliability analysis across all customers.',
      path: '/customer-analytics',
      icon: Clock,
      bg: 'bg-[#FFE8A3]',
    },
    {
      title: 'Reports',
      description: 'Working capital cycles, DSO/DPO, and monthly operating cost breakdown.',
      path: '/business-analytics',
      icon: BarChart2,
      bg: 'bg-[#F1E9DC]',
    },
    {
      title: 'Risk alerts & suggestions',
      description: 'All system-detected risks and suggested cash protection actions.',
      path: '/risk-alerts',
      icon: ShieldAlert,
      bg: 'bg-[#FDEEE9]',
    },
    {
      title: 'Settings',
      description: 'Company information, alert preferences, and banking connection details.',
      path: '/settings',
      icon: Settings,
      bg: 'bg-[#F1E9DC]',
    },
  ];

  return (
    <div className="space-y-12 max-w-4xl mx-auto">
      <PageHeader
        title="More tools"
        description="Secondary tools, reports, payment reminders, and workshop settings."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {links.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className="p-7 rounded-[24px] bg-white shadow-soft hover:shadow-soft-hover hover:-translate-y-1 transition-all duration-250 flex items-start gap-5 group"
            >
              <div className={`w-12 h-12 rounded-2xl ${item.bg} text-[#0F3D33] flex items-center justify-center shrink-0`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold font-serif text-[#0F3D33] group-hover:text-[#FF6B4A] transition-colors">
                    {item.title}
                  </h3>
                  <ArrowRight className="w-4 h-4 text-[#8FB4AC] group-hover:text-[#FF6B4A] group-hover:translate-x-1 transition-all" />
                </div>
                <p className="text-xs text-[#527A71] mt-1.5 line-clamp-2 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </Link>
          );
        })}

        {/* Quick Help & Restart Tour Action Card */}
        <div className="p-7 rounded-[24px] bg-[#CDEBDD] shadow-soft flex items-start gap-5">
          <div className="w-12 h-12 rounded-2xl bg-white text-[#0F3D33] flex items-center justify-center shrink-0">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold font-serif text-[#0F3D33]">Help & Guides</h3>
            <p className="text-xs text-[#28584E] mt-1.5 leading-relaxed">
              Read FAQs about cash simulation or take the interactive 3-step tour.
            </p>
            <div className="flex items-center gap-3 mt-4">
              <button
                onClick={() => setIsHelpOpen(true)}
                className="text-xs font-semibold px-4 py-1.5 rounded-full bg-white text-[#0F3D33] hover:bg-[#FBF7F0] shadow-soft transition-all"
              >
                Open Help Drawer
              </button>
              <button
                onClick={startTour}
                className="text-xs font-semibold px-4 py-1.5 rounded-full bg-[#0F3D33] text-white hover:bg-[#194E42] shadow-soft transition-all"
              >
                Restart tour
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
