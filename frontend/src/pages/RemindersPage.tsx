import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  MessageCircle,
  Calendar as CalendarIcon,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  Send,
  Phone,
  User,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { StatCard } from '@/components/ui/StatCard';
import { PageGuidance } from '@/components/onboarding/PageGuidance';
import { WhatsAppModal } from '@/components/reminders/WhatsAppModal';
import { api, ReminderItem } from '@/api/client';
import { formatINR } from '@/utils/format';

export const RemindersPage: React.FC = () => {
  const [selectedReminder, setSelectedReminder] = useState<ReminderItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'overdue' | 'due_soon'>('all');

  const { data: reminders = [], isLoading, refetch } = useQuery<ReminderItem[]>({
    queryKey: ['reminders'],
    queryFn: () => api.getReminders(),
  });

  const handleOpenReminder = (item: ReminderItem) => {
    setSelectedReminder(item);
    setIsModalOpen(true);
  };

  const filteredReminders = reminders.filter((item) => {
    if (filter === 'overdue') return item.status === 'overdue';
    if (filter === 'due_soon') return item.status === 'due_soon';
    return true;
  });

  const totalOverdue = reminders
    .filter((r) => r.status === 'overdue')
    .reduce((sum, r) => sum + r.amount, 0);

  const totalDueSoon = reminders
    .filter((r) => r.status === 'due_soon')
    .reduce((sum, r) => sum + r.amount, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Calendar & Reminders"
        description="Track payment due dates and send professional multi-lingual WhatsApp reminders 7 days before bills become overdue."
      />

      {/* ── Summary Cards ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Overdue receivables"
          value={totalOverdue}
          subtitle={`${reminders.filter((r) => r.status === 'overdue').length} overdue bills`}
          statusVariant="danger"
          badgeTheme="danger"
        />
        <StatCard
          title="Due in next 7 days"
          value={totalDueSoon}
          subtitle={`${reminders.filter((r) => r.status === 'due_soon').length} bills coming due`}
          statusVariant="caution"
          badgeTheme="caution"
        />
        <StatCard
          title="Total pending collection"
          value={totalOverdue + totalDueSoon}
          subtitle="Across active customers"
          statusVariant="safe"
          badgeTheme="brand"
        />
      </div>

      {/* ── Filter Buttons ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between pb-1">
        <div className="flex items-center gap-2">
          {(
            [
              { key: 'all', label: 'All reminders' },
              { key: 'overdue', label: 'Overdue now' },
              { key: 'due_soon', label: 'Due in 7 days' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filter === tab.key
                  ? 'bg-[#3F3DDB] text-white shadow-sm'
                  : 'bg-white border border-[#E8EAF0] text-[#4B5563] hover:text-[#111827]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <span className="text-xs text-[#6B7280]">
          Showing {filteredReminders.length} receivables
        </span>
      </div>

      {/* ── Receivables List with WhatsApp Actions ─────────────────────── */}
      <Card>
        <div className="divide-y divide-[#F1F2F6]">
          {filteredReminders.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#6B7280]">
              No receivables in this category. All collections are up to date!
            </div>
          ) : (
            filteredReminders.map((item) => (
              <div
                key={item.id}
                className="py-4 first:pt-2 last:pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      item.status === 'overdue'
                        ? 'bg-[#FDECEA] text-[#B42318]'
                        : item.status === 'due_soon'
                        ? 'bg-[#FFF4DB] text-[#B45309]'
                        : 'bg-[#E8F7EE] text-[#15803D]'
                    }`}
                  >
                    {item.status === 'overdue' ? (
                      <AlertTriangle className="w-4 h-4" />
                    ) : (
                      <Clock className="w-4 h-4" />
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-[#111827]">
                        {item.party_name}
                      </h4>
                      <Badge
                        variant={
                          item.status === 'overdue'
                            ? 'danger'
                            : item.status === 'due_soon'
                            ? 'caution'
                            : 'safe'
                        }
                      >
                        {item.status_label}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-[#6B7280]">
                      <span>Invoice: <strong className="text-[#111827]">{item.invoice_number}</strong></span>
                      <span>·</span>
                      <span>Due date: <strong className="text-[#111827]">{new Date(item.due_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</strong></span>
                      <span>·</span>
                      <span>Contact: <strong className="text-[#4B5563]">{item.contact_person || 'Accounts'}</strong></span>
                      <span>·</span>
                      <span>Phone: <span className="tabular-nums">{item.phone || '+91 98491 XXXXX'}</span></span>
                    </div>

                    <p className="text-[11px] text-[#6B7280] italic pt-0.5 line-clamp-1 max-w-xl">
                      "{item.messages.en}"
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 sm:shrink-0 justify-between sm:justify-end pl-12 sm:pl-0">
                  <div className="text-right">
                    <span className="text-sm font-bold text-[#111827] tabular-nums block">
                      {item.amount_formatted}
                    </span>
                    <span className="text-[10px] text-[#9CA3AF]">
                      {item.days_left < 0
                        ? `${Math.abs(item.days_left)} days overdue`
                        : `in ${item.days_left} days`}
                    </span>
                  </div>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleOpenReminder(item)}
                    leftIcon={<MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />}
                    className="bg-[#1E1B4B] hover:bg-[#2E2A72] border border-[#3F3DDB]/30 shadow-sm"
                  >
                    Send WhatsApp
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* ── WhatsApp Modal Component ───────────────────────────────────── */}
      <WhatsAppModal
        reminder={selectedReminder}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => refetch()}
      />

      <PageGuidance
        pageKey="reminders"
        bullets={[
          'Payment reminders sent 7 days before due date increase on-time customer collections by over 35%.',
          'Messages are dynamically generated in English, Hindi, and Telugu with exact invoice numbers and amounts.',
          'Clicking "Open in WhatsApp" initiates an encrypted chat with prefilled text and logs the contact record in your history.',
        ]}
      />
    </div>
  );
};
