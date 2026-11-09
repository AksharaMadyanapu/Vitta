import React from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatINR } from '@/utils/format';
import { useToast } from '@/components/ui/Toast';

export const RiskAlertsPage: React.FC = () => {
  const { success } = useToast();

  const alerts = [
    {
      id: 'alt-1',
      severity: 'danger' as const,
      statusLabel: 'Action recommended',
      title: 'Cash shortage expected between 20–25 November',
      deficit: 480000,
      why: 'Your monthly GST tax payment (₹3.8L) and raw material bill to Tata Steel (₹4.8L) both fall due on 20 November, before Kalyani Powertrain is expected to clear their bill.',
      actions: [
        'Call Kalyani Powertrain to request an early payment or part-payment on Inv #0491.',
        'Ask Tata Steel to split the ₹4.8L payment into two instalments 10 days apart.',
        'Draw ₹2,50,000 from your SBI Overdraft limit to cover the 5-day gap.',
      ],
      timing: 'Expected 20 Nov',
    },
    {
      id: 'alt-2',
      severity: 'caution' as const,
      statusLabel: 'Customer paying later',
      title: 'Varroc Engineering payments are taking longer',
      deficit: null,
      why: 'Varroc Engineering used to pay in 14 days, but their last 3 bills took 24 days to clear. Currently ₹11,20,000 is waiting for payment.',
      actions: [
        'Ask for a 30% advance on upcoming machining orders.',
        'Send an updated statement of account to their accounts manager.',
      ],
      timing: 'Active trend',
    },
    {
      id: 'alt-3',
      severity: 'safe' as const,
      statusLabel: 'Resolved',
      title: 'Sundaram Fasteners bill cleared on time',
      deficit: null,
      why: '₹7,50,000 received on schedule, giving you enough cushion for the machinery loan EMI on 28 November.',
      actions: [
        'No action needed. Keep this buffer for the loan payment on 28 Nov.',
      ],
      timing: 'Cleared yesterday',
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Alerts and suggestions"
        description="Plain-English explanations of projected cash shortages and practical steps to avoid them."
      />

      <div className="space-y-4">
        {alerts.map((alert) => (
          <Card key={alert.id} className="p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E5E7EB]">
              <div className="flex items-center gap-2.5">
                <Badge variant={alert.severity === 'danger' ? 'danger' : alert.severity === 'caution' ? 'caution' : 'safe'}>
                  {alert.statusLabel}
                </Badge>
                <h3 className="text-base font-semibold text-[#111827]">
                  {alert.title}
                </h3>
              </div>
              <span className="text-xs text-[#6B7280]">
                {alert.timing}
              </span>
            </div>

            {/* Why this happens */}
            <div className="mt-3.5 space-y-1">
              <span className="text-xs font-semibold text-[#374151] uppercase tracking-wider">
                Why this happens:
              </span>
              <p className="text-sm text-[#4B5563] leading-relaxed">
                {alert.why}
              </p>
              {alert.deficit && (
                <p className="text-xs font-medium text-[#B42318] pt-1">
                  Estimated shortfall: <strong>{formatINR(alert.deficit)}</strong>
                </p>
              )}
            </div>

            {/* What you can do */}
            <div className="mt-4 pt-3 border-t border-[#F3F4F6] space-y-2">
              <span className="text-xs font-semibold text-[#374151] uppercase tracking-wider">
                What you can do:
              </span>
              <div className="space-y-2 mt-1">
                {alert.actions.map((act, idx) => (
                  <div
                    key={idx}
                    className="flex items-start justify-between gap-3 p-2.5 rounded-lg bg-[#F9FAFB] border border-[#E5E7EB] text-xs text-[#111827]"
                  >
                    <span className="leading-relaxed flex-1">{act}</span>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => success('Action started', 'Recorded this task in your action list.')}
                    >
                      Take action
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
