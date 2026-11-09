import React from 'react';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { ArrowRight, AlertCircle, Clock, Calendar } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatCard } from '@/components/ui/StatCard';
import { Card } from '@/components/ui/Card';
import { ChartTooltip } from '@/components/ui/ChartTooltip';
import { formatINR } from '@/utils/format';

export const DashboardPage: React.FC = () => {
  // 30-day projection data: clean, single-series
  const chartData = [
    { day: 'Today', balance: 1845200 },
    { day: '12 Nov', balance: 1810000 },
    { day: '14 Nov', balance: 1790000 },
    { day: '16 Nov', balance: 2430000 }, // Kalyani payment expected
    { day: '18 Nov', balance: 2850000 }, // Sundaram payment expected
    { day: '20 Nov', balance: 1990000 }, // Tata Steel + GST out
    { day: '22 Nov', balance: 1750000 },
    { day: '25 Nov', balance: 1530000 }, // Hindalco out
    { day: '28 Nov', balance: 1415000 }, // Loan EMI
    { day: '1 Dec', balance: 995000 },  // Salaries
    { day: '5 Dec', balance: 1650000 },
    { day: '9 Dec', balance: 1920000 },
  ];

  const attentionItems = [
    {
      id: '1',
      title: 'Varroc Engineering payment is 5 days overdue',
      amount: 1120000,
      linkText: 'Follow up',
      to: '/invoices',
      due: 'Was due 4 Nov',
      urgent: true,
    },
    {
      id: '2',
      title: 'Kalyani Powertrain bill is due in 7 days',
      amount: 640000,
      linkText: 'Send reminder',
      to: '/reminders',
      due: 'Due 16 Nov',
      urgent: false,
    },
    {
      id: '3',
      title: 'GST tax payment scheduled',
      amount: 380000,
      linkText: 'View forecast',
      to: '/forecast',
      due: 'Due 20 Nov',
      urgent: false,
    },
    {
      id: '4',
      title: 'Tata Steel raw material bill to pay',
      amount: 480000,
      linkText: 'Check cash impact',
      to: '/pre-transaction',
      due: 'Due 20 Nov',
      urgent: false,
    },
    {
      id: '5',
      title: 'Monthly staff salaries and factory wages',
      amount: 420000,
      linkText: 'View schedule',
      to: '/reminders',
      due: 'Due 1 Dec',
      urgent: false,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Overview"
        description="Your business cash position and upcoming bills at a glance."
      />

      {/* Top plain-English status banner */}
      <div className="p-4 rounded-[10px] bg-white border border-[#E5E7EB] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p className="text-sm text-[#111827]">
          You have <strong className="font-semibold text-[#111827]">₹18.5L</strong> in the bank. A cash shortage is likely around <strong className="font-semibold text-[#B42318]">20 November</strong>.
        </p>
        <Link
          to="/forecast"
          className="inline-flex items-center gap-1 text-sm font-medium text-[#2548C9] hover:underline shrink-0"
        >
          See forecast <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* At most 4 summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Cash in bank"
          value={1845200}
          subtitle="Across 2 bank accounts"
        />
        <StatCard
          title="Money you're expecting (next 30 days)"
          value={2510000}
          subtitle="From 4 customer invoices"
        />
        <StatCard
          title="Money you need to pay (next 30 days)"
          value={700000}
          subtitle="To 2 suppliers"
        />
        <StatCard
          title="Overdue from customers"
          value={1120000}
          subtitle="1 overdue invoice"
          statusVariant="danger"
        />
      </div>

      {/* Main Content: ONE simple chart and ONE list */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Simple Cash Balance Chart (next 30 days) */}
        <Card className="lg:col-span-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
              <div>
                <h3 className="text-base font-semibold text-[#111827]">
                  Expected cash balance (next 30 days)
                </h3>
                <p className="text-xs text-[#6B7280] mt-0.5">
                  Based on payment due dates and past customer delays
                </p>
              </div>
            </div>

            <div className="pt-4 h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 8, right: 12, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                  <XAxis
                    dataKey="day"
                    stroke="#9CA3AF"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#E5E7EB' }}
                  />
                  <YAxis
                    stroke="#9CA3AF"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => `₹${(val / 100000).toFixed(0)}L`}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="balance"
                    name="Cash balance"
                    stroke="#2548C9"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, fill: '#2548C9', stroke: '#FFFFFF', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pt-3 border-t border-[#F3F4F6] flex items-center justify-between text-xs text-[#6B7280]">
            <span>Lowest projected balance: <strong>₹9.9L</strong> around 1 Dec</span>
            <Link to="/forecast" className="text-[#2548C9] hover:underline font-medium">
              View full 60-day forecast
            </Link>
          </div>
        </Card>

        {/* Needs your attention list */}
        <Card className="lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
              <h3 className="text-base font-semibold text-[#111827]">
                Needs your attention
              </h3>
              <span className="text-xs text-[#6B7280]">
                {attentionItems.length} items
              </span>
            </div>

            <div className="divide-y divide-[#F3F4F6]">
              {attentionItems.map((item) => (
                <div
                  key={item.id}
                  className="py-3 first:pt-2.5 last:pb-0 flex items-start justify-between gap-3 text-sm"
                >
                  <div className="space-y-0.5 min-w-0">
                    <p className="font-medium text-[#111827] text-xs leading-snug">
                      {item.title}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-[#6B7280]">
                      <span className="font-medium text-[#111827] tabular-nums">
                        {formatINR(item.amount)}
                      </span>
                      <span>·</span>
                      <span className={item.urgent ? "text-[#B42318] font-medium" : ""}>
                        {item.due}
                      </span>
                    </div>
                  </div>

                  <Link
                    to={item.to}
                    className="text-xs font-medium text-[#2548C9] hover:underline shrink-0 pt-0.5"
                  >
                    {item.linkText}
                  </Link>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-[#F3F4F6] text-right">
            <Link to="/risk-alerts" className="text-xs font-medium text-[#2548C9] hover:underline">
              See all alerts and suggestions
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};
