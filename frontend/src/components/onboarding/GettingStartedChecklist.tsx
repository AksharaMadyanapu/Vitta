import React from 'react';
import { Link } from 'react-router-dom';
import { Check, ArrowRight, X } from 'lucide-react';
import { useOnboarding } from '@/context/OnboardingContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export const GettingStartedChecklist: React.FC = () => {
  const { checklist, checklistDismissed, setChecklistDismissed, completeChecklistTask } = useOnboarding();

  if (checklistDismissed) return null;

  const tasks = [
    {
      key: 'connectBank' as const,
      label: 'Connect or add a bank account',
      completed: checklist.connectBank,
      to: '/banking',
      actionText: 'View accounts',
    },
    {
      key: 'addCustomers' as const,
      label: 'Add your customers',
      completed: checklist.addCustomers,
      to: '/customers',
      actionText: 'View customers',
    },
    {
      key: 'addInvoice' as const,
      label: 'Add your first invoice (or upload one)',
      completed: checklist.addInvoice,
      to: '/invoices',
      actionText: 'View invoices',
    },
    {
      key: 'viewForecast' as const,
      label: 'View your cash forecast',
      completed: checklist.viewForecast,
      to: '/forecast',
      actionText: 'Open forecast',
    },
    {
      key: 'checkPurchase' as const,
      label: 'Check a purchase before you make it',
      completed: checklist.checkPurchase,
      to: '/pre-transaction',
      actionText: 'Test a spend',
    },
  ];

  const completedCount = tasks.filter((t) => t.completed).length;
  const progressPercent = Math.round((completedCount / tasks.length) * 100);

  return (
    <Card className="p-5 border border-[#D8DAFA] bg-white">
      {/* Header */}
      <div className="flex items-start justify-between pb-3 border-b border-[#F1F2F6]">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold font-heading text-[#111827]">
              Get started with Runway ({completedCount} of {tasks.length} done)
            </h3>
            <span className="text-[11px] font-medium text-[#3F3DDB] bg-[#EEF0FD] px-2 py-0.5 rounded-full">
              {progressPercent}%
            </span>
          </div>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Key steps to set up cash-flow visibility for your business.
          </p>
        </div>

        <button
          onClick={() => setChecklistDismissed(true)}
          className="text-xs text-[#9CA3AF] hover:text-[#111827] flex items-center gap-1 transition-colors"
          title="Hide checklist"
        >
          <span>Hide checklist</span>
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-[#F3F4F6] rounded-full h-1.5 mt-3 overflow-hidden">
        <div
          className="bg-[#3F3DDB] h-1.5 rounded-full transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* 5 Tasks */}
      <div className="mt-3.5 divide-y divide-[#F3F4F6]">
        {tasks.map((task) => (
          <div
            key={task.key}
            className="py-2.5 first:pt-1 last:pb-0 flex items-center justify-between gap-3 text-xs"
          >
            <div className="flex items-center gap-2.5">
              <div
                className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                  task.completed
                    ? 'bg-[#E8F7EE] text-[#15803D]'
                    : 'border border-[#D2D5E0] bg-white'
                }`}
              >
                {task.completed && <Check className="w-2.5 h-2.5 stroke-[3]" />}
              </div>
              <span
                className={
                  task.completed
                    ? 'text-[#6B7280] line-through font-normal'
                    : 'text-[#111827] font-medium'
                }
              >
                {task.label}
              </span>
            </div>

            <Link
              to={task.to}
              onClick={() => completeChecklistTask(task.key)}
              className={`text-xs font-medium shrink-0 flex items-center gap-1 ${
                task.completed
                  ? 'text-[#6B7280] hover:text-[#111827]'
                  : 'text-[#3F3DDB] hover:underline'
              }`}
            >
              <span>{task.actionText}</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        ))}
      </div>
    </Card>
  );
};

