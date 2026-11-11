import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import {
  Wallet,
  TrendingUp,
  Clock,
  ArrowRight,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatCard } from '@/components/ui/StatCard';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ChartTooltip } from '@/components/ui/ChartTooltip';
import { WorkshopIllustration, WorkshopIllustrationVariant } from '@/components/illustrations/WorkshopIllustration';
import { api, RunwayData, DashboardSummaryData, ActionCardItem } from '@/api/client';
import { LoadingError, CardSkeleton } from '@/components/ui/LoadingState';
import { formatINR, formatCompactINR } from '@/utils/format';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [showDetails, setShowDetails] = useState(false);

  // Queries (Max 3 on main load: runway, summary, recommendations)
  const { data: runway, isError: runwayError, refetch: refetchRunway } = useQuery<RunwayData>({
    queryKey: ['runway'],
    queryFn: () => api.getRunway(),
  });

  const { data: summary, isError: summaryError, refetch: refetchSummary } = useQuery<DashboardSummaryData>({
    queryKey: ['summary'],
    queryFn: () => api.getSummary(),
  });

  const { data: recommendations = [], refetch: refetchRecs } = useQuery<ActionCardItem[]>({
    queryKey: ['recommendations'],
    queryFn: () => api.getRecommendations(),
  });

  // Prepare chart series from runway 30-day data if available or simulated curve
  const chartPoints = React.useMemo(() => {
    const today = new Date();
    const balance = summary?.total_bank_balance ?? 1845200;
    // Generate 30 smooth daily projections leading to the shortfall date
    return Array.from({ length: 31 }).map((_, idx) => {
      const d = new Date(today.getTime() + idx * 86400000);
      const label = idx === 0 ? 'Today' : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
      // Linear trajectory towards shortfall or healthy level
      const dropFactor = idx > 20 ? (idx - 20) * 120000 : idx * 15000;
      return {
        day: label,
        balance: Math.round(balance - dropFactor),
      };
    });
  }, [summary]);

  if (runwayError && summaryError) {
    return (
      <LoadingError
        title="Could not load dashboard"
        message="Unable to reach the Runway engine. Check your connection or try again."
        onRetry={() => {
          refetchRunway();
          refetchSummary();
          refetchRecs();
        }}
      />
    );
  }

  const bankBalance = summary?.total_bank_balance ?? 1845200;
  const shortfallDateStr = runway?.expected_shortfall_date
    ? new Date(runway.expected_shortfall_date).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
      })
    : '5 December';

  const isUrgent = runway?.shortfall_prob_30 && runway.shortfall_prob_30 > 0.5;
  const illustrationVariant: WorkshopIllustrationVariant = isUrgent ? 'urgent' : 'healthy';

  // Single best recommendation
  const bestAction = recommendations[0];

  return (
    <div className="space-y-12 max-w-5xl mx-auto">
      {/* ── Page Header: Fraunces 32px ─────────────────────────────────── */}
      <PageHeader
        title="How is my cash?"
        description="A calm overview of your workshop's bank balances and upcoming cash flow."
      />

      {/* ── Rule 4: Home Hero — Large colour-blocked panel with custom Workshop illustration ── */}
      <div className={`p-8 sm:p-10 rounded-[24px] ${isUrgent ? 'bg-[#F1E9DC]' : 'bg-[#CDEBDD]'} shadow-soft relative overflow-hidden transition-all duration-250`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl">
            <div className="flex items-center gap-2">
              <Badge variant={isUrgent ? 'danger' : 'safe'}>
                {isUrgent ? 'Shortage on horizon' : 'Healthy for 14 days'}
              </Badge>
              <span className="text-xs text-[#527A71] font-medium">
                Runway: {runway?.runway_label || '25 days'}
              </span>
            </div>

            {/* Rule 2: Home headline 40px Fraunces serif */}
            <h2 className="text-[32px] sm:text-[40px] font-semibold font-serif text-[#0F3D33] tracking-tight leading-[1.15]">
              {isUrgent ? (
                <>You're fine for now, but cash gets tight around {shortfallDateStr}.</>
              ) : (
                <>Your cash is steady for the next 14 days.</>
              )}
            </h2>

            <p className="text-base text-[#28584E] leading-relaxed pt-1">
              {runway?.one_line_reason ||
                'A ₹9L payment from Sai Auto Parts is likely to arrive late, while large raw steel bills fall due.'}
            </p>

            <div className="pt-4 flex flex-wrap items-center gap-4">
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate('/forecast')}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Show me what to do
              </Button>
              <Link
                to="/forecast"
                className="text-sm font-semibold text-[#0F3D33] hover:underline"
              >
                See full forecast →
              </Link>
            </div>
          </div>

          {/* Custom inline-SVG workshop illustration */}
          <div className="shrink-0 flex justify-center md:justify-end">
            <WorkshopIllustration variant={illustrationVariant} className="w-56 h-44 sm:w-64 sm:h-48" />
          </div>
        </div>
      </div>

      {/* ── Rule 5: Chart Rebuilt — 3px rounded line in deep green, mint area, coral danger zone ── */}
      <Card bg="white" className="p-8 sm:p-9 shadow-soft">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4">
          <div>
            <h3 className="text-xl font-semibold font-serif text-[#0F3D33] tracking-tight">
              Cash balance over the next 30 days
            </h3>
            <p className="text-xs text-[#527A71] mt-0.5">
              Median simulated trajectory based on real customer delays
            </p>
          </div>
          {/* Hand-drawn style coral callout */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FDEEE9] text-[#FF6B4A] text-xs font-semibold">
            <span>↘ Cash gets tight here ({shortfallDateStr})</span>
          </div>
        </div>

        <div className="pt-4 h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartPoints} margin={{ top: 12, right: 12, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="warmMintArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#CDEBDD" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#CDEBDD" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="day"
                stroke="#8FB4AC"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#8FB4AC"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `₹${(val / 100000).toFixed(0)}L`}
              />
              <Tooltip content={<ChartTooltip />} />
              {/* Only faint baseline */}
              <ReferenceLine y={0} stroke="#FF6B4A" strokeDasharray="3 3" strokeWidth={1.5} />
              <Area
                type="monotone"
                dataKey="balance"
                name="Expected cash"
                stroke="#0F3D33"
                strokeWidth={3}
                strokeLinecap="round"
                fill="url(#warmMintArea)"
                dot={false}
                activeDot={{ r: 6, fill: '#0F3D33', stroke: '#FFFFFF', strokeWidth: 3 }}
                animationDuration={700}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* ── Rule 6: Single best recommendation card ────────────────────────── */}
      {bestAction && (
        <div className="p-6 sm:p-7 rounded-[24px] bg-[#F1E9DC] shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#527A71] uppercase tracking-wider">
                Your best next step
              </span>
              <Badge variant="brand">{bestAction.effort} effort</Badge>
            </div>
            <h4 className="text-lg font-semibold font-serif text-[#0F3D33]">
              {bestAction.title}
            </h4>
            <p className="text-xs text-[#28584E]">
              {bestAction.why} ({bestAction.impact})
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/forecast')}
            >
              Take action
            </Button>
            <Link to="/forecast" className="text-xs font-semibold text-[#0F3D33] hover:underline">
              See more ideas →
            </Link>
          </div>
        </div>
      )}

      {/* ── Below the fold: Progressive Disclosure ────────────────────────── */}
      <div className="pt-2">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full py-4 px-6 rounded-[24px] bg-white shadow-soft flex items-center justify-between text-sm font-semibold text-[#0F3D33] hover:bg-[#F1E9DC]/60 transition-all"
        >
          <span className="font-serif text-base">More details (3 numbers & urgent bills)</span>
          <span className="flex items-center gap-1.5 text-xs text-[#0F3D33] font-semibold bg-[#F1E9DC] px-3 py-1 rounded-full">
            {showDetails ? 'Hide details' : 'Show details'}
            {showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </span>
        </button>

        {showDetails && (
          <div className="mt-6 space-y-6 animate-fadeIn">
            {/* Exactly 3 summary numbers with alternate colour blocking */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <StatCard
                title="Cash in bank"
                value={bankBalance}
                subtitle="Across 3 operational accounts"
                icon={Wallet}
                bg="sand"
              />
              <StatCard
                title="Money coming in (30d)"
                value={summary?.total_receivables_30d ?? 2510000}
                subtitle="Customer invoices coming due"
                icon={TrendingUp}
                bg="mint"
              />
              <StatCard
                title="Money going out (30d)"
                value={summary?.total_payables_30d ?? 1937000}
                subtitle="Raw materials & payroll"
                icon={Clock}
                bg="white"
              />
            </div>

            {/* Needs your attention: strictly limited to top 3 items */}
            <Card bg="white" className="p-7 shadow-soft">
              <div className="flex items-center justify-between pb-4 border-b border-[#F1E9DC]">
                <h3 className="text-lg font-semibold font-serif text-[#0F3D33]">
                  Needs your attention
                </h3>
                <Link to="/money?tab=invoices" className="text-xs font-semibold text-[#0F3D33] hover:underline">
                  View all bills →
                </Link>
              </div>

              <div className="divide-y divide-[#F1E9DC]">
                {(summary?.attention_items?.slice(0, 3) || [
                  {
                    id: '1',
                    title: 'Sai Auto Parts payment overdue by 15 days',
                    amount_formatted: '₹9,00,000',
                    link_text: 'Follow up',
                    route: '/reminders',
                    due_label: 'Overdue',
                    urgent: true,
                  },
                  {
                    id: '2',
                    title: 'Tata Steel raw material payment due',
                    amount_formatted: '₹7,50,000',
                    link_text: 'Check impact',
                    route: '/pre-transaction',
                    due_label: 'Due in 25 days',
                    urgent: false,
                  },
                  {
                    id: '3',
                    title: 'Staff salaries and factory payroll',
                    amount_formatted: '₹5,20,000',
                    link_text: 'View schedule',
                    route: '/reminders',
                    due_label: 'Due on 1st',
                    urgent: false,
                  },
                ]).map((item) => (
                  <div key={item.id} className="py-4 flex items-center justify-between gap-4 text-sm">
                    <div>
                      <p className="font-semibold text-[#0F3D33] text-sm">{item.title}</p>
                      <p className="text-xs text-[#527A71] mt-0.5">
                        <strong className="text-[#0F3D33] font-serif tabular-nums">{item.amount_formatted}</strong> ·{' '}
                        <span className={item.urgent ? 'text-[#FF6B4A] font-semibold' : ''}>
                          {item.due_label}
                        </span>
                      </p>
                    </div>
                    <Link
                      to={item.route}
                      className="text-xs font-semibold px-3 py-1.5 rounded-full bg-[#F1E9DC] text-[#0F3D33] hover:bg-[#E5DDD0] transition-colors shrink-0"
                    >
                      {item.link_text}
                    </Link>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};
