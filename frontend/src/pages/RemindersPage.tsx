import React from 'react';
import { Send, Calendar as CalendarIcon, CheckCircle2 } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatINR } from '@/utils/format';
import { useToast } from '@/components/ui/Toast';

export const RemindersPage: React.FC = () => {
  const { success } = useToast();

  const reminders = [
    {
      id: 'rem-1',
      party: 'Kalyani Powertrain Ltd',
      invoice: 'INV-2026-0491',
      amount: 640000,
      dueDate: '16 Nov 2026',
      daysLeft: 7,
      status: 'caution',
      statusText: 'Due in 7 days',
    },
    {
      id: 'rem-2',
      party: 'Sundaram Fasteners Ltd',
      invoice: 'INV-2026-0502',
      amount: 420000,
      dueDate: '18 Nov 2026',
      daysLeft: 9,
      status: 'neutral',
      statusText: 'Due in 9 days',
    },
    {
      id: 'rem-3',
      party: 'Varroc Engineering Components',
      invoice: 'INV-2026-0478',
      amount: 1120000,
      dueDate: '4 Nov 2026',
      daysLeft: -5,
      status: 'danger',
      statusText: '5 days overdue',
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Calendar"
        description="See upcoming payment due dates and send friendly payment reminders 7 days ahead."
        action={
          <Button
            variant="primary"
            onClick={() => success('Reminders sent', 'Friendly reminders sent via WhatsApp and email.')}
            leftIcon={<Send className="w-4 h-4" />}
          >
            Send reminders
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Reminders List */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
            <div>
              <h3 className="text-base font-semibold text-[#111827]">
                Payment reminders to send
              </h3>
              <p className="text-xs text-[#6B7280] mt-0.5">
                Automatically prepared 7 days before bills are due
              </p>
            </div>
            <span className="text-xs text-[#6B7280]">
              {reminders.length} queued
            </span>
          </div>

          <div className="divide-y divide-[#F3F4F6] mt-1">
            {reminders.map((rem) => (
              <div
                key={rem.id}
                className="py-3.5 first:pt-3 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-[#111827]">
                      {rem.party}
                    </span>
                    <Badge variant={rem.status as any} size="sm">
                      {rem.statusText}
                    </Badge>
                  </div>
                  <p className="text-xs text-[#6B7280]">
                    {rem.invoice} · Due on {rem.dueDate} · Amount: <strong className="text-[#111827] font-medium tabular-nums">{formatINR(rem.amount)}</strong>
                  </p>
                </div>

                <div className="self-end sm:self-auto shrink-0">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => success('Reminder sent', `Sent payment reminder to ${rem.party}.`)}
                  >
                    Send reminder
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Calendar Schedule */}
        <Card>
          <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
            <h3 className="text-base font-semibold text-[#111827]">
              November schedule
            </h3>
            <span className="text-xs text-[#6B7280]">Key dates</span>
          </div>

          <div className="mt-4 space-y-3 text-xs">
            <div className="p-3 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB]">
              <span className="font-semibold text-[#111827]">16 Nov (Monday)</span>
              <p className="text-[#6B7280] mt-0.5">Kalyani Powertrain: ₹6.4L expected</p>
            </div>
            <div className="p-3 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB]">
              <span className="font-semibold text-[#111827]">18 Nov (Wednesday)</span>
              <p className="text-[#6B7280] mt-0.5">Sundaram Fasteners: ₹4.2L expected</p>
            </div>
            <div className="p-3 rounded-lg border border-[#FEDF89] bg-[#FFFAEB]">
              <span className="font-semibold text-[#B45309]">20 Nov (Friday) — Important</span>
              <p className="text-[#6B7280] mt-0.5">GST payment (₹3.8L) + Tata Steel bill (₹4.8L)</p>
            </div>
            <div className="p-3 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB]">
              <span className="font-semibold text-[#111827]">25 Nov (Wednesday)</span>
              <p className="text-[#6B7280] mt-0.5">Hindalco Extrusions: ₹2.2L bill to pay</p>
            </div>
            <div className="p-3 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB]">
              <span className="font-semibold text-[#111827]">1 Dec (Tuesday)</span>
              <p className="text-[#6B7280] mt-0.5">Factory staff salaries: ₹4.2L</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
