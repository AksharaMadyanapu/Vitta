import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import {
  Wallet,
  TrendingUp,
  Clock,
  AlertCircle,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  ChevronRight,
  Calendar,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatCard } from '@/components/ui/StatCard';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ChartTooltip } from '@/components/ui/ChartTooltip';
import { GettingStartedChecklist } from '@/components/onboarding/GettingStartedChecklist';
import { PageGuidance } from '@/components/onboarding/PageGuidance';
import { NextStepStrip } from '@/components/onboarding/NextStepStrip';
import { api, RunwayData, DashboardSummaryData, ForecastData } from '@/api/client';
import { formatINR, formatCompactINR } from '@/utils/format';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();

  // Queries
  const { data: runway, isLoading: runwayLoading } = useQuery<RunwayData>({
    queryKey: ['runway'],
    queryFn: () => api.getRunway(),
  });

  const { data: summary, isLoading: summaryLoading } = useQuery<DashboardSummaryData>({
    queryKey: ['summary'],
    queryFn: () => api.getSummary(),
  });

  const { data: forecastData, isLoading: forecastLoading } = useQuery<ForecastData>({
    queryKey: ['forecast', 30],
    queryFn: () => api.getForecast(30),
  });

  // Prepare chart series from live forecast
  const chartPoints = React.useMemo(() => {
    if (!forecastData?.days) return [];
    return forecastData.days.map((dayStr, idx) => {
      const d = new Date(dayStr);
      const label = idx === 0 ? 'Today' : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
      return {
        day: label,
        balance: Math.round(forecastData.p50[idx] || 0),
        p10: Math.round(forecastData.p10[idx] || 0),
        p90: Math.round(forecastData.p90[idx] || 0),
      };
    });
  }, [forecastData]);

  const bankBalance = summary?.total_bank_balance ?? 1845200;
  const shortfallDateStr = runway?.expected_shortfall_date
    ? new Date(runway.expected_shortfall_date).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
      })
    : '5 December';

  return (
    <div className="space-y-6">
      <PageHeader
        title="Overview"
        description="Your business cash position and upcoming bills at a glance."
      />

      {/* ── Welcome Banner ──────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-[14px] bg-gradient-to-r from-[#EEF0FD] to-[#F5F3FF] border border-[#E0E4FB] p-5 sm:p-6 shadow-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#3F3DDB]/10 text-[#3F3DDB]">
                <Sparkles className="w-3.5 h-3.5" />
                Good morning, Rakesh
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-heading text-[#111827]">
              You have {formatCompactINR(bankBalance)} in the bank.
            </h2>
            <p className="text-sm text-[#4B5563] leading-relaxed">
              {runway?.shortfall_prob_30 && runway.shortfall_prob_30 > 0.5 ? (
                <>
                  A cash shortage is likely around{' '}
                  <strong className="text-[#B42318] font-semibold">{shortfallDateStr}</strong> due to heavy supplier bills and late customer receipts.
                </>
              ) : (
                'Your cash position is currently stable for the next 14 days.'
              )}
            </p>

            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/forecast')}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                See what to do
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate('/forecast')}
              >
                View 60-day forecast
              </Button>
            </div>
          </div>

          {/* Inline SVG Illustration */}
          <div className="hidden lg:block shrink-0 pr-4">
            <svg
              className="w-36 h-28 text-[#3F3DDB]"
              viewBox="0 0 160 120"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3F3DDB" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#3F3DDB" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path
                d="M10 95 C 40 85, 60 70, 85 45 C 110 20, 130 35, 150 15 L 150 110 L 10 110 Z"
                fill="url(#chartGrad)"
              />
              <path
                d="M10 95 C 40 85, 60 70, 85 45 C 110 20, 130 35, 150 15"
                stroke="#3F3DDB"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <circle cx="85" cy="45" r="4" fill="#3F3DDB" stroke="#FFFFFF" strokeWidth="2" />
              <circle cx="150" cy="15" r="4.5" fill="#0EA5A4" stroke="#FFFFFF" strokeWidth="2" />
              <line x1="5" y1="110" x2="155" y2="110" stroke="#CBD5E1" strokeWidth="1" />
            </svg>
          </div>
        </div>
      </div>

      {/* ── Getting Started Checklist ───────────────────────────────────── */}
      <GettingStartedChecklist />

      {/* ── HERO RUNWAY CARD ────────────────────────────────────────────── */}
      <div className="rounded-[14px] bg-white border border-[#E8EAF0] p-6 shadow-card hover:shadow-card-hover transition-all">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                Signature Metric
              </span>
              <Badge
                variant={
                  runway?.status_key === 'high_risk'
                    ? 'danger'
                    : runway?.status_key === 'caution'
                    ? 'caution'
                    : 'safe'
                }
              >
                {runway?.status || 'Watch'}
              </Badge>
            </div>

            <div className="flex items-baseline gap-3">
              <h1 className="text-3xl sm:text-4xl font-bold font-heading text-[#111827] tracking-tight">
                Your cash runway:{' '}
                <span
                  className={
                    runway?.status_key === 'high_risk'
                      ? 'text-[#B42318]'
                      : runway?.status_key === 'caution'
                      ? 'text-[#B45309]'
                      : 'text-[#15803D]'
                  }
                >
                  {runway?.runway_label || '26 days'}
                </span>
              </h1>
            </div>

            <p className="text-sm text-[#4B5563] max-w-2xl leading-relaxed">
              {runway?.one_line_reason ||
                'The main risk is a delayed payment from Sai Auto Parts combined with upcoming supplier bills around late November.'}
            </p>

            <div className="flex items-center gap-4 text-xs text-[#6B7280] pt-1">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#3F3DDB]" />
                Expected shortfall:{' '}
                <strong className="text-[#111827]">
                  {shortfallDateStr}
                </strong>
              </span>
              <span>·</span>
              <span>
                Simulated 30-day shortfall risk:{' '}
                <strong className="text-[#111827]">
                  {runway?.shortfall_prob_30
                    ? `${(runway.shortfall_prob_30 * 100).toFixed(0)}%`
                    : '70%'}
                </strong>
              </span>
            </div>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row md:flex-col gap-2">
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate('/forecast')}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              See how to fix this
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate('/pre-transaction')}
            >
              Check a purchase
            </Button>
          </div>
        </div>
      </div>

      {/* ── 4 SUMMARY STAT CARDS ────────────────────────────────────────── */}
      <div id="tour-overview-summary" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Cash in bank"
          value={bankBalance}
          subtitle={`Across ${summary?.accounts?.length || 3} bank accounts`}
          icon={Wallet}
          badgeTheme="brand"
        />
        <StatCard
          title="Money you're expecting (30d)"
          value={summary?.total_receivables_30d ?? 2510000}
          subtitle="Customer invoices coming due"
          icon={TrendingUp}
          badgeTheme="teal"
        />
        <StatCard
          title="Money you need to pay (30d)"
          value={summary?.total_payables_30d ?? 1937000}
          subtitle="Tata Steel and suppliers"
          icon={Clock}
          badgeTheme="caution"
        />
        <StatCard
          title="Overdue from customers"
          value={summary?.overdue_receivables ?? 1350000}
          subtitle={`${summary?.overdue_receivables_count ?? 2} overdue invoices`}
          statusVariant="danger"
          icon={AlertCircle}
          badgeTheme="danger"
        />
      </div>

      {/* ── MAIN CONTENT: CHART & NEEDS ATTENTION ───────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Simple 30-Day Cash Balance Chart with Soft Area Fill */}
        <Card className="lg:col-span-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#E8EAF0]">
              <div>
                <h3 className="text-base font-bold font-heading text-[#111827]">
                  Expected cash balance (next 30 days)
                </h3>
                <p className="text-xs text-[#6B7280] mt-0.5">
                  Median projection based on 2,000 simulations and customer payment history
                </p>
              </div>
              <Link
                to="/forecast"
                className="text-xs font-semibold text-[#3F3DDB] hover:underline flex items-center gap-1"
              >
                Full view <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="pt-4 h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartPoints}
                  margin={{ top: 8, right: 12, left: -10, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="indigoArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3F3DDB" stopOpacity={0.12} />
                      <stop offset="95%" stopColor="#3F3DDB" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F2F6" />
                  <XAxis
                    dataKey="day"
                    stroke="#9CA3AF"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#E8EAF0' }}
                  />
                  <YAxis
                    stroke="#9CA3AF"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => `₹${(val / 100000).toFixed(0)}L`}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <ReferenceLine y={0} stroke="#EF4444" strokeDasharray="4 4" strokeWidth={1.5} />
                  <Area
                    type="monotone"
                    dataKey="balance"
                    name="Expected cash"
                    stroke="#3F3DDB"
                    strokeWidth={2.2}
                    fill="url(#indigoArea)"
                    dot={false}
                    activeDot={{ r: 4, fill: '#3F3DDB', stroke: '#FFFFFF', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pt-3 border-t border-[#F1F2F6] flex items-center justify-between text-xs text-[#6B7280]">
            <span>
              Expected first shortfall:{' '}
              <strong className="text-[#B42318]">{shortfallDateStr}</strong>
            </span>
            <Link to="/forecast" className="text-[#3F3DDB] hover:underline font-medium">
              Explore "What-if" solutions
            </Link>
          </div>
        </Card>

        {/* Needs your attention list */}
        <Card className="lg:col-span-2 flex flex-col justify-between" id="tour-attention-list">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#E8EAF0]">
              <h3 className="text-base font-bold font-heading text-[#111827]">
                Needs your attention
              </h3>
              <span className="text-xs text-[#6B7280] font-medium">
                {summary?.attention_items?.length || 5} items
              </span>
            </div>

            <div className="divide-y divide-[#F1F2F6]">
              {(summary?.attention_items || [
                {
                  id: '1',
                  title: 'Sai Auto Parts payment overdue by 15 days',
                  amount: 900000,
                  amount_formatted: '₹9,00,000',
                  link_text: 'Follow up',
                  route: '/invoices',
                  due_label: 'Was due 15 days ago',
                  urgent: true,
                  severity: 'high_risk' as const,
                },
                {
                  id: '2',
                  title: 'Tata Steel raw material payment due',
                  amount: 750000,
                  amount_formatted: '₹7,50,000',
                  link_text: 'Check cash impact',
                  route: '/pre-transaction',
                  due_label: 'Due in 25 days',
                  urgent: false,
                  severity: 'caution' as const,
                },
                {
                  id: '3',
                  title: 'Staff salaries and factory payroll',
                  amount: 520000,
                  amount_formatted: '₹5,20,000',
                  link_text: 'View schedule',
                  route: '/reminders',
                  due_label: 'Due on 1st of month',
                  urgent: false,
                  severity: 'safe' as const,
                },
              ]).map((item) => (
                <div
                  key={item.id}
                  className="py-3 first:pt-2.5 last:pb-0 flex items-start justify-between gap-3 text-sm"
                >
                  <div className="space-y-0.5 min-w-0">
                    <p className="font-semibold text-[#111827] text-xs leading-snug line-clamp-1">
                      {item.title}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-[#6B7280]">
                      <span className="font-medium text-[#111827] tabular-nums">
                        {item.amount_formatted}
                      </span>
                      <span>·</span>
                      <span className={item.urgent ? 'text-[#B42318] font-medium' : ''}>
                        {item.due_label}
                      </span>
                    </div>
                  </div>

                  <Link
                    to={item.route}
                    className="text-xs font-semibold text-[#3F3DDB] hover:underline shrink-0 pt-0.5"
                  >
                    {item.link_text}
                  </Link>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-[#F1F2F6] text-right">
            <Link to="/risk-alerts" className="text-xs font-semibold text-[#3F3DDB] hover:underline">
              See all alerts and suggestions
            </Link>
          </div>
        </Card>
      </div>

      {/* ── Page Guidance Box ───────────────────────────────────────────── */}
      <PageGuidance
        pageKey="dashboard"
        bullets={[
          'Cash runway tells you exactly how many days of operations your bank accounts can sustain before going into overdraft.',
          'Summary cards track real-time bank accounts, upcoming 30-day receipts, and supplier payables.',
          'The 30-day forecast takes into account historical customer delay distributions to simulate probable shortfall dates.',
        ]}
      />

      {/* ── Next Step Strip ────────────────────────────────────────────── */}
      <NextStepStrip
        label="Planning your next 30 to 60 days?"
        description="Review your 60-day cash forecast and test 'What if' scenarios to solve the upcoming deficit."
        actionText="View forecast"
        to="/forecast"
      />
    </div>
  );
};
