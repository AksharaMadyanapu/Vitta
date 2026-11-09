import React, { useState } from 'react';
import {
  CalendarClock,
  BellRing,
  Send,
  Calendar as CalendarIcon,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { SkeletonTable } from '@/components/ui/Skeleton';
import { formatINR } from '@/utils/format';
import { useToast } from '@/components/ui/Toast';

export const RemindersPage: React.FC = () => {
  const [showSkeleton, setShowSkeleton] = useState(false);
  const { success } = useToast();

  const reminders = [
    {
      id: 'rem-1',
      party: 'Kalyani Powertrain Ltd',
      invoice: 'INV/2026/0491',
      amount: 640000,
      dueDate: '2026-11-16',
      daysUntilDue: 7,
      type: '7_day_advance',
      status: 'pending',
    },
    {
      id: 'rem-2',
      party: 'Sundaram Fasteners Auto Components',
      invoice: 'INV/2026/0502',
      amount: 420000,
      dueDate: '2026-11-18',
      daysUntilDue: 9,
      type: 'upcoming',
      status: 'scheduled',
    },
    {
      id: 'rem-3',
      party: 'Varroc Engineering Components',
      invoice: 'INV/2026/0478',
      amount: 1120000,
      dueDate: '2026-11-04',
      daysUntilDue: -5,
      type: 'overdue_escalation',
      status: 'urgent',
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payment Reminders & Due Calendar"
        description="Automated 7-day advance payment notices sent to automotive OEM customers to compress collection cycles."
        badge={
          <Badge variant="caution" dot>
            3 Reminders Queued
          </Badge>
        }
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSkeleton(!showSkeleton)}
            >
              {showSkeleton ? 'View Content' : 'Preview Skeletons'}
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<BellRing className="w-4 h-4" />}
              onClick={() => success('Reminders Dispatched', 'Sent WhatsApp & Email notices to 3 parties.')}
            >
              Send All Reminders
            </Button>
          </div>
        }
      />

      {showSkeleton ? (
        <SkeletonTable rows={4} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 p-6">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-border/50">
              <div>
                <h3 className="text-base font-semibold text-primary">
                  Active Reminder Queue (7-Day Lead Time)
                </h3>
                <p className="text-xs text-primary-muted mt-0.5">
                  Notices triggered exactly 7 days prior to scheduled due date
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {reminders.map((rem) => (
                <div
                  key={rem.id}
                  className="p-4 rounded-xl bg-elevated border border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-primary text-sm">
                        {rem.party}
                      </span>
                      <Badge
                        variant={
                          rem.status === 'urgent'
                            ? 'high'
                            : rem.status === 'pending'
                            ? 'caution'
                            : 'blue'
                        }
                        size="sm"
                      >
                        {rem.daysUntilDue < 0
                          ? `${Math.abs(rem.daysUntilDue)} Days Overdue`
                          : `Due in ${rem.daysUntilDue} Days`}
                      </Badge>
                    </div>
                    <p className="text-xs text-primary-muted">
                      {rem.invoice} · Due on {rem.dueDate} · Amount:{' '}
                      <strong className="text-primary tabular-nums">
                        {formatINR(rem.amount)}
                      </strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <Button
                      variant="secondary"
                      size="sm"
                      leftIcon={<Send className="w-3.5 h-3.5" />}
                      onClick={() => success('Notice Sent', `Notice sent to ${rem.party}`)}
                    >
                      Dispatch Notice
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Calendar Due Widget */}
          <Card className="p-6">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-border/50">
              <h3 className="text-base font-semibold text-primary flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-accent-blue" /> Due Schedule
              </h3>
              <span className="text-xs text-primary-muted">Nov 2026</span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-lg bg-elevated border-l-2 border-l-accent-teal">
                <div className="font-semibold text-primary">Nov 16, 2026</div>
                <div className="text-primary-muted mt-0.5">Kalyani Powertrain: ₹6.4L due</div>
              </div>
              <div className="p-3 rounded-lg bg-elevated border-l-2 border-l-accent-blue">
                <div className="font-semibold text-primary">Nov 18, 2026</div>
                <div className="text-primary-muted mt-0.5">Sundaram Fasteners: ₹4.2L due</div>
              </div>
              <div className="p-3 rounded-lg bg-elevated border-l-2 border-l-risk-caution">
                <div className="font-semibold text-primary">Nov 20, 2026</div>
                <div className="text-primary-muted mt-0.5">Tata Steel BSL: ₹4.8L payable</div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

