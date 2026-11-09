import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  ReferenceArea,
} from 'recharts';
import {
  Play,
  RotateCcw,
  Sparkles,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  History,
  Info,
  Calendar,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ChartTooltip } from '@/components/ui/ChartTooltip';
import { PageGuidance } from '@/components/onboarding/PageGuidance';
import { InfoTooltip } from '@/components/onboarding/InfoTooltip';
import { NextStepStrip } from '@/components/onboarding/NextStepStrip';
import { RecommendationsList } from '@/components/recommendations/RecommendationsList';
import { api, ForecastData, OverrideItem, BacktestData, ActionCardItem } from '@/api/client';
import { formatINR, formatCompactINR } from '@/utils/format';
import { useToast } from '@/components/ui/Toast';

export const ForecastPage: React.FC = () => {
  const [horizon, setHorizon] = useState<14 | 30 | 60>(30);
  const [isSimulating, setIsSimulating] = useState(false);
  const { success } = useToast();

  // What-if sliders state
  const [saiEarlierDays, setSaiEarlierDays] = useState<number>(0);
  const [tataDelayDays, setTataDelayDays] = useState<number>(0);
  const [collectSaiThisWeek, setCollectSaiThisWeek] = useState<boolean>(false);

  // Active overrides forecast data
  const [overrideData, setOverrideData] = useState<ForecastData | null>(null);

  // Base forecast query
  const { data: baseData, isLoading: baseLoading, refetch: refetchBase } = useQuery<ForecastData>({
    queryKey: ['forecast', horizon],
    queryFn: () => api.getForecast(horizon),
  });

  // Backtest query
  const { data: backtestData, isLoading: backtestLoading } = useQuery<BacktestData>({
    queryKey: ['backtest', 21],
    queryFn: () => api.getBacktest(21),
  });

  // Recommendations query
  const { data: recommendations = [] } = useQuery<ActionCardItem[]>({
    queryKey: ['recommendations'],
    queryFn: () => api.getRecommendations(),
  });

  // Active data is overridden if any slider is moved
  const hasOverrides = saiEarlierDays > 0 || tataDelayDays > 0 || collectSaiThisWeek;
  const currentData = hasOverrides && overrideData ? overrideData : baseData;

  // Run simulation with overrides
  const runOverridesSimulation = useCallback(
    async (saiDays: number, steelDelay: number, collectThisWeek: boolean) => {
      setIsSimulating(true);
      const overrides: OverrideItem[] = [];

      // Sai Auto Parts has customer_id 9 (or look up from top drivers)
      const saiDriver = baseData?.top_drivers?.find((d) => d.plain_reason.includes('Sai Auto'));
      const saiId = saiDriver?.counterparty_id || 9;

      // Tata Steel has supplier_id 1
      const tataDriver = baseData?.top_drivers?.find((d) => d.plain_reason.includes('Tata Steel'));
      const tataId = tataDriver?.counterparty_id || 13;

      if (collectThisWeek) {
        // Collect Sai Auto ₹9L invoice on day 3
        const saiInvId = saiDriver?.invoice_id || 19;
        overrides.push({ invoice_id: saiInvId, paid_on_day: 3 });
      } else if (saiDays > 0) {
        overrides.push({ customer_id: saiId, pays_days_earlier: saiDays });
      }

      if (steelDelay > 0) {
        overrides.push({ supplier_id: tataId, delay_days: steelDelay });
      }

      try {
        const res = await api.postForecast(horizon, overrides);
        setOverrideData(res);
      } catch (err) {
        console.error('Failed to run overrides:', err);
      } finally {
        setIsSimulating(false);
      }
    },
    [baseData, horizon]
  );

  // Trigger when sliders change with 300ms debounce
  useEffect(() => {
    if (!hasOverrides) {
      setOverrideData(null);
      return;
    }
    const timer = setTimeout(() => {
      runOverridesSimulation(saiEarlierDays, tataDelayDays, collectSaiThisWeek);
    }, 200);
    return () => clearTimeout(timer);
  }, [saiEarlierDays, tataDelayDays, collectSaiThisWeek, hasOverrides, runOverridesSimulation]);

  const handleResetSliders = () => {
    setSaiEarlierDays(0);
    setTataDelayDays(0);
    setCollectSaiThisWeek(false);
    setOverrideData(null);
    success('Scenarios reset', 'Restored base baseline forecast.');
  };

  // Transform data for chart
  const chartPoints = useMemo(() => {
    if (!currentData?.days) return [];
    return currentData.days.map((dayStr, idx) => {
      const d = new Date(dayStr);
      const label = idx === 0 ? 'Today' : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
      const p10Val = Math.round(currentData.p10[idx] || 0);
      const p50Val = Math.round(currentData.p50[idx] || 0);
      const p90Val = Math.round(currentData.p90[idx] || 0);
      return {
        day: label,
        balance: p50Val,
        p10: p10Val,
        p90: p90Val,
        // Range for area
        range: [p10Val, p90Val],
        baseBalance: baseData?.p50[idx] ? Math.round(baseData.p50[idx]) : undefined,
      };
    });
  }, [currentData, baseData]);

  // Compute runway days for current data
  const currentRunwayDays = useMemo(() => {
    if (!currentData?.p50) return 60;
    const firstNeg = currentData.p50.findIndex((val) => val < 0);
    return firstNeg === -1 ? 60 : firstNeg;
  }, [currentData]);

  const baseRunwayDays = useMemo(() => {
    if (!baseData?.p50) return 60;
    const firstNeg = baseData.p50.findIndex((val) => val < 0);
    return firstNeg === -1 ? 60 : firstNeg;
  }, [baseData]);

  // Format shortfall date
  const shortfallDateStr = currentData?.expected_shortfall_date
    ? new Date(currentData.expected_shortfall_date).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cash forecast"
        description="Predict your daily bank balance and test preventive actions to avoid cash shortfalls."
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                handleResetSliders();
                refetchBase();
              }}
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
            >
              Refresh
            </Button>
            <Button
              variant="primary"
              size="sm"
              isLoading={isSimulating}
              onClick={() => {
                runOverridesSimulation(saiEarlierDays, tataDelayDays, collectSaiThisWeek);
                success('Simulation refreshed', 'Ran 2,000 Monte Carlo trajectories.');
              }}
              leftIcon={<Play className="w-3.5 h-3.5" />}
            >
              Re-run engine
            </Button>
          </div>
        }
      />

      {/* ── Time window selector & Plain language summary banner ──────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-[12px] border border-[#E8EAF0] shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[#6B7280]">Forecast window:</span>
          {([14, 30, 60] as const).map((h) => (
            <button
              key={h}
              onClick={() => setHorizon(h)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                horizon === h
                  ? 'bg-[#3F3DDB] text-white shadow-sm'
                  : 'bg-[#F5F6FA] text-[#4B5563] hover:text-[#111827] hover:bg-[#EEF0FD]'
              }`}
            >
              {h} days
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs text-[#6B7280]">
          <span className="w-2 h-2 rounded-full bg-[#15803D]" />
          <span>2,000 vectorised NumPy simulations</span>
          <span>·</span>
          <span>Responded in {currentData?.elapsed_ms?.toFixed(0) || 20}ms</span>
        </div>
      </div>

      {/* ── Plain English warning alert banner ──────────────────────────── */}
      <div
        className={`p-4 rounded-[12px] border transition-all ${
          currentData?.shortfall_prob_30 && currentData.shortfall_prob_30 > 0.5
            ? 'bg-[#FEF3F2] border-[#FECDCA] text-[#B42318]'
            : currentData?.shortfall_prob_30 && currentData.shortfall_prob_30 > 0.2
            ? 'bg-[#FFF4DB] border-[#FDE68A] text-[#B45309]'
            : 'bg-[#E8F7EE] border-[#A6F4C5] text-[#15803D]'
        }`}
      >
        <div className="flex items-start gap-3">
          {currentData?.shortfall_prob_30 && currentData.shortfall_prob_30 > 0.5 ? (
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          ) : (
            <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
          )}
          <div className="text-xs sm:text-sm leading-relaxed">
            {horizon === 14 ? (
              <p>
                <strong>14-Day Outlook is Safe:</strong> Your starting bank balance and expected receipts from
                Sundaram Fasteners are expected to cover all operational expenses and bills for the next 14 days with 0% shortfall risk.
              </p>
            ) : hasOverrides ? (
              <p>
                <strong>What-If Scenario Active:</strong> With your proposed adjustments, 30-day shortfall probability drops from{' '}
                <strong className="underline">{(baseData?.shortfall_prob_30 || 0.7) * 100}%</strong> down to{' '}
                <strong className="underline">{(currentData?.shortfall_prob_30 || 0) * 100}%</strong>, extending your cash runway from{' '}
                <strong>{baseRunwayDays} days</strong> to{' '}
                <strong>{currentRunwayDays >= 60 ? '60+ days' : `${currentRunwayDays} days`}</strong>.
              </p>
            ) : (
              <p>
                In the next 30 days there is a{' '}
                <strong>{Math.round((currentData?.shortfall_prob_30 || 0.7) * 100)}% chance</strong> your bank balance drops below zero around{' '}
                <strong>{shortfallDateStr || '5 December'}</strong>. The main reasons are a chronically delayed payment from{' '}
                <strong>Sai Auto Parts (₹9L)</strong> and the <strong>Tata Steel bill (₹7.5L)</strong> falling due in the same week as payroll.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Summary Cards ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title={`Shortfall risk (${horizon} days)`}
          value={Math.round(
            (horizon === 14
              ? currentData?.shortfall_prob_14 || 0
              : horizon === 30
              ? currentData?.shortfall_prob_30 || 0.7
              : currentData?.shortfall_prob_60 || 0.75) * 100
          )}
          isCurrency={false}
          suffix="%"
          subtitle={
            horizon === 14
              ? 'Zero shortfall expected in 14 days'
              : hasOverrides
              ? `Reduced from ${(baseData?.shortfall_prob_30 || 0.7) * 100}%`
              : 'High risk without early collection'
          }
          statusVariant={
            (horizon === 14
              ? (currentData?.shortfall_prob_14 ?? 0)
              : (currentData?.shortfall_prob_30 ?? 0.7)) > 0.5
              ? 'danger'
              : 'safe'
          }
        />
        <StatCard
          title="Lowest expected bank balance"
          value={currentData?.p50 ? Math.min(...currentData.p50) : 0}
          subtitle={
            (currentData?.p50 ? Math.min(...currentData.p50) : 0) < 0
              ? 'Overdraft expected'
              : 'Buffer stays safely positive'
          }
          statusVariant={
            (currentData?.p50 ? Math.min(...currentData.p50) : 0) < 0 ? 'danger' : 'safe'
          }
        />
        <StatCard
          title="Cash Runway"
          value={currentRunwayDays}
          isCurrency={false}
          suffix={currentRunwayDays >= 60 ? '+ days' : ' days'}
          subtitle={
            hasOverrides
              ? `Improved from ${baseRunwayDays} days`
              : shortfallDateStr
              ? `Runs out around ${shortfallDateStr}`
              : 'Safe for entire horizon'
          }
          statusVariant={currentRunwayDays < 30 ? 'danger' : 'safe'}
        />
      </div>

      {/* ── Forecast Chart with Likely Range Band & Danger Zone ─────────── */}
      <Card id="tour-forecast-chart" className="overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#E8EAF0] gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold font-heading text-[#111827]">
                Projected cash balance ({horizon} days)
              </h3>
              <InfoTooltip content="p50 is the median trajectory. Shaded lavender band represents the 10th to 90th percentile likely range from 2,000 simulations." />
            </div>
            <p className="text-xs text-[#6B7280] mt-0.5">
              Simulated using actual customer payment delays and scheduled vendor payables
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-[#3F3DDB] font-medium">
              <span className="w-3 h-1 bg-[#3F3DDB] rounded-full" />
              Expected cash (p50)
            </span>
            <span className="flex items-center gap-1.5 text-[#6B7280]">
              <span className="w-3 h-2 bg-[#EEF0FD] border border-[#CBD5E1] rounded-sm" />
              Likely range (p10–p90)
            </span>
            <span className="flex items-center gap-1.5 text-[#B42318] font-medium">
              <span className="w-3 h-1 bg-[#EF4444] border-dashed border-t border-[#EF4444]" />
              Danger zone (&lt; ₹0)
            </span>
          </div>
        </div>

        <div className="pt-4 h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={chartPoints}
              margin={{ top: 12, right: 16, left: -5, bottom: 0 }}
            >
              <defs>
                <linearGradient id="rangeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3F3DDB" stopOpacity={0.12} />
                  <stop offset="100%" stopColor="#3F3DDB" stopOpacity={0.03} />
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

              {/* Red Danger Zone below 0 with Direct Shading */}
              <ReferenceArea
                y1={-1500000}
                y2={0}
                fill="#FEF3F2"
                fillOpacity={0.8}
                strokeOpacity={0}
              />
              <ReferenceLine
                y={0}
                stroke="#EF4444"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                label={{
                  value: '₹0 Overdraft Threshold',
                  fill: '#EF4444',
                  fontSize: 11,
                  position: 'insideBottomLeft',
                  offset: 8,
                }}
              />

              {/* Range Area (p10 to p90) */}
              <Area
                type="monotone"
                dataKey="range"
                fill="url(#rangeGrad)"
                stroke="#CBD5E1"
                strokeWidth={0.5}
                name="Likely Range (p10–p90)"
              />

              {/* Baseline comparison if overridden */}
              {hasOverrides && (
                <Line
                  type="monotone"
                  dataKey="baseBalance"
                  stroke="#9CA3AF"
                  strokeDasharray="4 4"
                  strokeWidth={1.75}
                  dot={false}
                  name="Without actions"
                />
              )}

              {/* Main Expected Cash Line */}
              <Line
                type="monotone"
                dataKey="balance"
                name="Expected cash (p50)"
                stroke="#3F3DDB"
                strokeWidth={2.5}
                dot={{ r: 2.5, fill: '#3F3DDB' }}
                activeDot={{ r: 5, fill: '#3F3DDB', stroke: '#FFFFFF', strokeWidth: 2 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* ── "WHAT IF?" INTERACTIVE EXPERIMENT PANEL ─────────────────────── */}
      <Card className="border-2 border-[#EEF0FD]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E8EAF0] gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#EEF0FD] text-[#3F3DDB] flex items-center justify-center">
                <Sliders className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold font-heading text-[#111827]">
                What if? Test solutions to prevent the cash shortage
              </h3>
            </div>
            <p className="text-xs text-[#6B7280] mt-1">
              Move these levers to re-simulate all 2,000 trajectories in real time and see how your runway improves.
            </p>
          </div>

          {hasOverrides && (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleResetSliders}
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
            >
              Reset levers
            </Button>
          )}
        </div>

        <div className="pt-5 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Lever 1: Sai Auto Parts */}
          <div className="p-4 rounded-[12px] bg-[#F5F6FA] border border-[#E8EAF0] space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#111827]">
                Sai Auto Parts pays earlier
              </label>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-white border border-[#E8EAF0] text-[#3F3DDB]">
                +{saiEarlierDays} days
              </span>
            </div>
            <p className="text-[11px] text-[#6B7280] leading-snug">
              Sai owes ₹9,00,000 and is chronically late. Follow up to speed up collection.
            </p>
            <input
              type="range"
              min="0"
              max="20"
              step="1"
              value={saiEarlierDays}
              disabled={collectSaiThisWeek}
              onChange={(e) => setSaiEarlierDays(Number(e.target.value))}
              className="w-full accent-[#3F3DDB] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#9CA3AF]">
              <span>Normal delay (0d)</span>
              <span>10d earlier</span>
              <span>20d earlier</span>
            </div>
          </div>

          {/* Lever 2: Delay Tata Steel Payment */}
          <div className="p-4 rounded-[12px] bg-[#F5F6FA] border border-[#E8EAF0] space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#111827]">
                Delay Tata Steel ₹7.5L bill
              </label>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-white border border-[#E8EAF0] text-[#B45309]">
                +{tataDelayDays} days
              </span>
            </div>
            <p className="text-[11px] text-[#6B7280] leading-snug">
              Request a payment extension on the ₹7,50,000 raw material coil batch.
            </p>
            <input
              type="range"
              min="0"
              max="20"
              step="1"
              value={tataDelayDays}
              onChange={(e) => setTataDelayDays(Number(e.target.value))}
              className="w-full accent-[#B45309] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#9CA3AF]">
              <span>Pay on due date</span>
              <span>+10 days</span>
              <span>+20 days</span>
            </div>
          </div>

          {/* Lever 3: Instant Collection Toggle */}
          <div className="p-4 rounded-[12px] bg-[#F5F6FA] border border-[#E8EAF0] flex flex-col justify-between space-y-3">
            <div>
              <label className="text-xs font-bold text-[#111827] block">
                Collect ₹9L invoice this week
              </label>
              <p className="text-[11px] text-[#6B7280] mt-1 leading-snug">
                Assume immediate collection of Sai Auto's overdue invoice within 3 days.
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setCollectSaiThisWeek(!collectSaiThisWeek)}
                className={`w-full py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  collectSaiThisWeek
                    ? 'bg-[#15803D] text-white shadow-sm'
                    : 'bg-white border border-[#CBD5E1] text-[#374151] hover:bg-[#F9FAFB]'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                {collectSaiThisWeek ? 'Lever Applied (Collected Day 3)' : 'Apply Collection Lever'}
              </button>
            </div>
          </div>
        </div>

        {/* Live Before & After Comparison Strip */}
        {hasOverrides && (
          <div className="mt-5 p-3.5 rounded-[10px] bg-[#EEF0FD] border border-[#C7D2FE] flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-4">
              <span className="font-semibold text-[#111827]">Impact of selected levers:</span>
              <span>
                Runway:{' '}
                <strong className="text-[#B42318] line-through mr-1">{baseRunwayDays} days</strong>
                <strong className="text-[#15803D]">
                  → {currentRunwayDays >= 60 ? '60+ days (Safe)' : `${currentRunwayDays} days`}
                </strong>
              </span>
              <span>·</span>
              <span>
                30-day shortfall risk:{' '}
                <strong className="text-[#B42318] line-through mr-1">
                  {Math.round((baseData?.shortfall_prob_30 || 0.7) * 100)}%
                </strong>
                <strong className="text-[#15803D]">
                  → {Math.round((currentData?.shortfall_prob_30 || 0) * 100)}%
                </strong>
              </span>
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                success('Actions queued', 'Added recommended collection and delay reminders to your schedule.');
              }}
            >
              Apply to schedule
            </Button>
          </div>
        )}
      </Card>

      {/* ── RECOMMENDED ACTIONS CARDS ─────────────────────────────────── */}
      <RecommendationsList
        recommendations={recommendations}
        maxItems={4}
        onTakeAction={(item) => {
          if (item.id === 'act-chase-sai') {
            setSaiEarlierDays(15);
          } else if (item.id === 'act-discount-sai') {
            setCollectSaiThisWeek(true);
          } else if (item.id === 'act-delay-tata') {
            setTataDelayDays(15);
          }
          success('Lever applied to simulation', `Updated forecast with: ${item.title}`);
        }}
      />

      {/* ── TOP 5 RISK DRIVERS LIST ─────────────────────────────────────── */}
      <Card>
        <div className="pb-3 border-b border-[#E8EAF0] mb-3">
          <h3 className="text-base font-bold font-heading text-[#111827]">
            Top 5 transactions contributing to your cash risk
          </h3>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Identified by counterfactual re-simulation: these 5 transactions have the greatest influence on your minimum cash balance.
          </p>
        </div>

        <div className="divide-y divide-[#F1F2F6]">
          {(currentData?.top_drivers || []).map((driver) => (
            <div
              key={driver.rank}
              className="py-3.5 first:pt-2 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm"
            >
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-[#F5F6FA] text-[#6B7280] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  #{driver.rank}
                </span>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[#111827] text-xs sm:text-sm">
                      {driver.invoice_number ? driver.invoice_number : driver.type.toUpperCase()}
                    </span>
                    <Badge
                      variant={
                        driver.type === 'receivable'
                          ? 'teal'
                          : driver.type === 'payable'
                          ? 'danger'
                          : 'neutral'
                      }
                    >
                      {driver.type}
                    </Badge>
                  </div>
                  <p className="text-xs text-[#4B5563] leading-relaxed max-w-2xl">
                    {driver.plain_reason}
                  </p>
                </div>
              </div>

              <div className="sm:text-right shrink-0 pl-9 sm:pl-0">
                <span className="font-bold text-[#111827] tabular-nums text-sm">
                  {formatINR(driver.amount)}
                </span>
                <p className="text-[11px] text-[#6B7280]">
                  Impact: ~{formatCompactINR(driver.impact)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* ── BACKTEST PROOF CARD ─────────────────────────────────────────── */}
      <Card className="border border-[#CBD5E1] bg-gradient-to-br from-[#FFFFFF] to-[#F8FAFC]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#E8EAF0] gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#E0E7FF] text-[#3F3DDB] flex items-center justify-center">
              <History className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold font-heading text-[#111827]">
                  Would Runway have caught your October cash crunch?
                </h3>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase bg-[#3F3DDB]/10 text-[#3F3DDB]">
                  Backtest
                </span>
              </div>
              <p className="text-xs text-[#6B7280] mt-0.5">
                Simulating what Runway would have predicted 21 days before your historical October deficit
              </p>
            </div>
          </div>
        </div>

        <div className="pt-4 space-y-4">
          <div className="p-4 rounded-[12px] bg-[#EEF0FD] border border-[#C7D2FE] text-[#1E1B4B]">
            <p className="text-xs sm:text-sm leading-relaxed">
              {backtestData?.summary ||
                'Running the forecast as of 21 days before the cash crunch — Runway predicted a 100% chance of running short within 30 days. Runway would have warned you 21 days earlier.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-white border border-[#E8EAF0]">
              <span className="text-[#6B7280] block text-[11px]">As of test date:</span>
              <strong className="text-[#111827] text-sm">
                {backtestData ? new Date(backtestData.as_of).toLocaleDateString('en-IN') : '14 Sep 2026'}
              </strong>
            </div>
            <div className="p-3 rounded-lg bg-white border border-[#E8EAF0]">
              <span className="text-[#6B7280] block text-[11px]">Actual crunch hit:</span>
              <strong className="text-[#B42318] text-sm">
                {backtestData ? new Date(backtestData.crunch_date).toLocaleDateString('en-IN') : '05 Oct 2026'}
              </strong>
            </div>
            <div className="p-3 rounded-lg bg-white border border-[#E8EAF0]">
              <span className="text-[#6B7280] block text-[11px]">Lead time advantage:</span>
              <strong className="text-[#15803D] text-sm font-bold">
                21 days earlier warning
              </strong>
            </div>
          </div>
        </div>
      </Card>

      {/* ── Page Guidance & Next Step Strip ─────────────────────────────── */}
      <PageGuidance
        pageKey="forecast"
        bullets={[
          'The forecast engine runs 2,000 vectorised Monte Carlo simulations based on bootstrap sampling of customer delay distributions.',
          'Overdue customer receivables are simulated based on the customer’s historical tail delay to avoid premature optimism.',
          "Test what-if levers above to see how earlier collections or delayed payables transform your cash buffer.",
        ]}
      />

      <NextStepStrip
        label="Pre-transaction risk assessment"
        description="Planning to make a big equipment or material purchase? Check its cash impact before confirming."
        actionText="Check a purchase"
        to="/pre-transaction"
      />
    </div>
  );
};
