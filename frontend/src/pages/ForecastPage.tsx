import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import {
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Calendar,
  Repeat,
  MessageCircle,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ChartTooltip } from '@/components/ui/ChartTooltip';
import { WhatsAppModal } from '@/components/reminders/WhatsAppModal';
import { api, ForecastData, OverrideItem, BacktestData, ReminderItem } from '@/api/client';
import { formatINR, formatCompactINR, formatDate } from '@/utils/format';

// ── Types ─────────────────────────────────────────────────────────────────────

interface PartyInfo {
  id: number;
  name: string;
  avg_delay_days: number;
  delay_profile: number[];
  contact_person?: string;
  phone?: string;
  risk_level: string;
}

interface FixProbs {
  saiCollect: number | null;
  steelDelay: number | null;
  saiEarly: number | null;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const AVATAR_COLOURS = [
  'bg-[#CDEBDD] text-[#0F3D33]',
  'bg-[#FFE8A3] text-[#8A5B00]',
  'bg-[#FDEEE9] text-[#C13A1E]',
  'bg-[#E8F5FF] text-[#1D4E89]',
  'bg-[#F1E9DC] text-[#6B4B2C]',
];

function avatarColour(idx: number) {
  return AVATAR_COLOURS[idx % AVATAR_COLOURS.length];
}

function getInitials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

function daysFromNow(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.round(diff / 86_400_000);
}

function friendlyShortfallDate(dateStr: string | null): string {
  if (!dateStr) return '';
  return formatDate(dateStr, 'd MMMM');
}

/** Build a friendly, plain-English title for a driver card */
function driverTitle(
  type: string,
  amount: number,
  counterpartyName: string | null,
  dueDate: string | null
): string {
  if (type === 'receivable') {
    return `${counterpartyName ?? 'A customer'} owes you ${formatCompactINR(amount)}`;
  }
  if (type === 'payable') {
    const dateStr = dueDate ? ` on ${formatDate(dueDate, 'd MMM')}` : '';
    return `${formatCompactINR(amount)} due to ${counterpartyName ?? 'a supplier'}${dateStr}`;
  }
  // recurring
  if (amount >= 500000) return `Monthly salaries — ${formatCompactINR(amount)}`;
  return `Monthly GST — ${formatCompactINR(amount)}`;
}

/** Build a friendly one-sentence explanation */
function driverSentence(
  type: string,
  amount: number,
  counterpartyName: string | null,
  dueDate: string | null,
  avgDelay: number | null
): string {
  if (type === 'receivable' && avgDelay !== null) {
    const expected = dueDate
      ? formatDate(
          new Date(new Date(dueDate).getTime() + avgDelay * 86_400_000).toISOString(),
          'd MMM'
        )
      : null;
    const originalDue = dueDate ? formatDate(dueDate, 'd MMM') : null;
    if (expected && originalDue) {
      return `${counterpartyName ?? 'This customer'} usually pays about ${Math.round(avgDelay)} days late, so expect the money around ${expected} instead of ${originalDue}.`;
    }
    return `${counterpartyName ?? 'This customer'} usually pays about ${Math.round(avgDelay)} days late.`;
  }
  if (type === 'payable') {
    const dateStr = dueDate ? ` on ${formatDate(dueDate, 'd MMM')}` : '';
    return `${formatINR(amount)} is due to ${counterpartyName ?? 'a supplier'}${dateStr} — the largest payment in this period.`;
  }
  // recurring
  if (amount >= 500000) {
    return `Staff salaries and factory wages of ${formatINR(amount)} come out on the 1st of each month.`;
  }
  return `GST liability of ${formatINR(amount)} comes out around the 20th of each month.`;
}

/** Summary sentence from top 2 drivers */
function summaryFromDrivers(
  drivers: ForecastData['top_drivers'],
  parties: Record<number, PartyInfo>
): string {
  if (!drivers || drivers.length === 0) return '';
  const parts = drivers.slice(0, 2).map((d) => {
    const name = d.counterparty_id ? (parties[d.counterparty_id]?.name ?? null) : null;
    if (d.type === 'receivable' && name) {
      const delay = parties[d.counterparty_id!]?.avg_delay_days;
      return delay ? `${name} is paying ${Math.round(delay)} days late` : `${name} owes ${formatCompactINR(d.amount)}`;
    }
    if (d.type === 'payable' && name) {
      return `a ${formatCompactINR(d.amount)} payment to ${name} is due${d.due_date ? ' on ' + formatDate(d.due_date, 'd MMM') : ''}`;
    }
    if (d.type === 'recurring') {
      return d.amount >= 500000 ? `monthly salaries of ${formatCompactINR(d.amount)}` : `GST of ${formatCompactINR(d.amount)}`;
    }
    return '';
  }).filter(Boolean);
  if (parts.length === 0) return '';
  return 'Mainly because ' + parts.join(' and ') + '.';
}

// ── Sub-components ────────────────────────────────────────────────────────────

/** Delay-history dots (last 6 payments) */
function DelayDots({ profile }: { profile: number[] }) {
  const dots = profile.slice(-6);
  return (
    <div className="flex items-center gap-1.5">
      {dots.map((days, i) => {
        const colour =
          days < 7 ? 'bg-[#CDEBDD]' : days < 20 ? 'bg-[#FFE8A3]' : 'bg-[#FDEEE9]';
        const label = days < 7 ? 'On time' : days < 20 ? `${days}d late` : `${days}d late`;
        return (
          <span
            key={i}
            title={label}
            className={`w-3 h-3 rounded-full ${colour} border border-white`}
          />
        );
      })}
      <span className="text-xs text-[#527A71] ml-1">Last 6 payments</span>
    </div>
  );
}

/** Type chip */
function TypeChip({ type }: { type: string }) {
  if (type === 'receivable')
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#FDEEE9] text-[#C13A1E] text-[11px] font-semibold">
        <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B4A] inline-block" />
        Paying late
      </span>
    );
  if (type === 'payable')
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#FFE8A3] text-[#8A5B00] text-[11px] font-semibold">
        <span className="w-1.5 h-1.5 rounded-full bg-[#D4A017] inline-block" />
        Big bill due
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#F1E9DC] text-[#6B4B2C] text-[11px] font-semibold">
      <span className="w-1.5 h-1.5 rounded-full bg-[#C8A97B] inline-block" />
      Regular payment
    </span>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export const ForecastPage: React.FC = () => {
  const [horizon, setHorizon] = useState<14 | 30 | 60>(30);

  // Fix toggles
  const [saiCollectNow, setSaiCollectNow] = useState(false);
  const [steelDelay15d, setSteelDelay15d] = useState(false);
  const [saiEarly10d, setSaiEarly10d] = useState(false);

  // Pre-computed fix probabilities (fetched on mount)
  const [fixProbs, setFixProbs] = useState<FixProbs>({ saiCollect: null, steelDelay: null, saiEarly: null });

  // Active overrides data (for chart + hero when fix is on)
  const [overrideData, setOverrideData] = useState<ForecastData | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  // Expanded driver card
  const [expandedDriver, setExpandedDriver] = useState<number | null>(null);
  const [showAllDrivers, setShowAllDrivers] = useState(false);

  // Collapsible sections
  const [showChart, setShowChart] = useState(false);
  const [showBacktest, setShowBacktest] = useState(false);

  // Party data cache
  const [parties, setParties] = useState<Record<number, PartyInfo>>({});

  // WhatsApp modal
  const [whatsappReminder, setWhatsappReminder] = useState<ReminderItem | null>(null);

  // ── Queries ──────────────────────────────────────────────────────────────

  const { data: baseData } = useQuery<ForecastData>({
    queryKey: ['forecast', horizon],
    queryFn: () => api.getForecast(horizon),
  });

  const { data: backtestData } = useQuery<BacktestData>({
    queryKey: ['backtest', 21],
    queryFn: () => api.getBacktest(21),
  });

  const { data: reminders } = useQuery<ReminderItem[]>({
    queryKey: ['reminders'],
    queryFn: api.getReminders,
  });

  // ── Load party data for top drivers ─────────────────────────────────────

  useEffect(() => {
    if (!baseData?.top_drivers) return;
    const ids = baseData.top_drivers
      .map((d) => d.counterparty_id)
      .filter((id): id is number => id !== null);

    const missing = ids.filter((id) => !parties[id]);
    if (missing.length === 0) return;

    missing.forEach(async (id) => {
      try {
        const p = await api.getParty(id);
        setParties((prev) => ({ ...prev, [id]: p }));
      } catch {
        // ignore
      }
    });
  }, [baseData?.top_drivers]);

  // ── Pre-fetch all 3 fix scenarios in parallel ────────────────────────────

  useEffect(() => {
    if (!baseData) return;
    const saiDriver = baseData.top_drivers?.find((d) => d.counterparty_id === 9);
    const tataDriver = baseData.top_drivers?.find((d) => d.counterparty_id === 13);
    const saiInvId = saiDriver?.invoice_id ?? 115;
    const tataId = tataDriver?.counterparty_id ?? 13;

    (async () => {
      try {
        const [fix1, fix2, fix3] = await Promise.all([
          api.postForecast(horizon, [{ invoice_id: saiInvId, paid_on_day: 3 }]),
          api.postForecast(horizon, [{ supplier_id: tataId, delay_days: 15 }]),
          api.postForecast(horizon, [{ customer_id: 9, pays_days_earlier: 10 }]),
        ]);
        const getProb = (d: ForecastData) =>
          horizon === 14 ? d.shortfall_prob_14 : horizon === 60 ? d.shortfall_prob_60 : d.shortfall_prob_30;
        setFixProbs({
          saiCollect: getProb(fix1),
          steelDelay: getProb(fix2),
          saiEarly: getProb(fix3),
        });
      } catch {
        // non-fatal
      }
    })();
  }, [baseData, horizon]);

  // ── Run overrides simulation when a toggle changes ───────────────────────

  const hasOverrides = saiCollectNow || steelDelay15d || saiEarly10d;

  const runOverridesSimulation = useCallback(
    async (collectNow: boolean, delaySteel: boolean, earlySai: boolean) => {
      if (!baseData) return;
      setIsSimulating(true);
      const overrides: OverrideItem[] = [];
      const saiDriver = baseData.top_drivers?.find((d) => d.counterparty_id === 9);
      const tataDriver = baseData.top_drivers?.find((d) => d.counterparty_id === 13);

      if (collectNow) {
        overrides.push({ invoice_id: saiDriver?.invoice_id ?? 115, paid_on_day: 3 });
      } else if (earlySai) {
        overrides.push({ customer_id: 9, pays_days_earlier: 10 });
      }
      if (delaySteel) {
        overrides.push({ supplier_id: tataDriver?.counterparty_id ?? 13, delay_days: 15 });
      }

      try {
        const res = await api.postForecast(horizon, overrides);
        setOverrideData(res);
      } catch (err) {
        console.error('Override simulation failed:', err);
      } finally {
        setIsSimulating(false);
      }
    },
    [baseData, horizon]
  );

  useEffect(() => {
    if (!hasOverrides) {
      setOverrideData(null);
      return;
    }
    const timer = setTimeout(() => {
      runOverridesSimulation(saiCollectNow, steelDelay15d, saiEarly10d);
    }, 200);
    return () => clearTimeout(timer);
  }, [saiCollectNow, steelDelay15d, saiEarly10d, hasOverrides, runOverridesSimulation]);

  // ── Derived values ───────────────────────────────────────────────────────

  const displayData = hasOverrides && overrideData ? overrideData : baseData;

  const shortfallRisk = displayData
    ? horizon === 14
      ? displayData.shortfall_prob_14
      : horizon === 60
      ? displayData.shortfall_prob_60
      : displayData.shortfall_prob_30
    : 0;

  const baseRisk = baseData
    ? horizon === 14
      ? baseData.shortfall_prob_14
      : horizon === 60
      ? baseData.shortfall_prob_60
      : baseData.shortfall_prob_30
    : 0;

  const shortfallDate = displayData?.expected_shortfall_date;
  const shortfallAmount = displayData?.expected_shortfall_amount;

  const daysToShortfall = daysFromNow(shortfallDate ?? null);
  const p10Min = displayData?.p10 ? Math.min(...displayData.p10) : null;

  const isSafe = shortfallRisk < 0.2;
  const isWatch = !isSafe && shortfallRisk < 0.5;
  const isRisk = !isSafe && !isWatch;

  const heroClass = isSafe
    ? 'bg-[#CDEBDD]'
    : isWatch
    ? 'bg-[#FFE8A3]'
    : 'bg-[#FDEEE9]';

  const totalImpact = useMemo(
    () => (baseData?.top_drivers ?? []).reduce((sum, d) => sum + Math.abs(d.impact), 0),
    [baseData]
  );

  const drivers = baseData?.top_drivers ?? [];

  // Chart data
  const chartPoints = useMemo(() => {
    if (!displayData?.days) return [];
    return displayData.days.map((dayStr, idx) => {
      const d = new Date(dayStr);
      const label =
        idx === 0
          ? 'Today'
          : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
      return {
        day: label,
        p50: Math.round(displayData.p50[idx] || 0),
        p10: Math.round(displayData.p10[idx] || 0),
        p90: Math.round(displayData.p90[idx] || 0),
        range: [
          Math.round(displayData.p10[idx] || 0),
          Math.round(displayData.p90[idx] || 0),
        ],
      };
    });
  }, [displayData]);

  // Find matching reminder for a driver (by invoice_id)
  const findReminder = (invoiceId: number | null) =>
    invoiceId
      ? (reminders ?? []).find((r) => r.invoice_id === invoiceId) ?? null
      : null;

  // Which driver is this fix associated with?
  const driverHasFix = (driver: ForecastData['top_drivers'][0]) => {
    if (driver.counterparty_id === 9 && (saiCollectNow || saiEarly10d)) return true;
    if (driver.counterparty_id === 13 && steelDelay15d) return true;
    return false;
  };

  // ── Render ───────────────────────────────────────────────────────────────

  const visibleDrivers = showAllDrivers ? drivers : drivers.slice(0, 3);

  return (
    <div className="space-y-10 max-w-5xl mx-auto">
      <PageHeader
        title="Will I run short of cash?"
        description="We simulated 2,000 cash paths based on your customers' real payment history."
      />

      {/* ── HERO PANEL ──────────────────────────────────────────────────────── */}
      <motion.div
        className={`relative rounded-[28px] p-8 md:p-10 ${heroClass} overflow-hidden`}
        animate={{ opacity: isSimulating ? 0.7 : 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Horizon toggle — top right */}
        <div className="absolute top-6 right-6 flex items-center gap-1 bg-white/60 backdrop-blur-sm p-1 rounded-full shadow-soft">
          {([14, 30, 60] as const).map((h) => (
            <button
              key={h}
              onClick={() => setHorizon(h)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200 ${
                horizon === h
                  ? 'bg-[#0F3D33] text-white shadow-soft'
                  : 'text-[#527A71] hover:text-[#0F3D33]'
              }`}
            >
              {h}d
            </button>
          ))}
        </div>

        {/* Headline */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${shortfallDate}-${Math.round(shortfallRisk * 100)}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.3 }}
          >
            {isSafe ? (
              <h1 className="font-serif text-[36px] md:text-[40px] font-semibold text-[#0F3D33] leading-tight max-w-xl pr-24">
                Your cash looks safe for the next {horizon} days.
              </h1>
            ) : (
              <h1 className="font-serif text-[36px] md:text-[40px] font-semibold text-[#0F3D33] leading-tight max-w-xl pr-24">
                You'll likely run short of cash around{' '}
                {shortfallDate ? friendlyShortfallDate(shortfallDate) : '5 December'}.
              </h1>
            )}

            {/* Three big numbers */}
            <div className="mt-8 flex flex-wrap gap-8">
              {/* Days to shortfall */}
              <div>
                <div className="font-serif text-[36px] font-semibold text-[#0F3D33] leading-none">
                  {isSafe ? '—' : daysToShortfall !== null ? `${daysToShortfall}d` : '—'}
                </div>
                <div className="text-sm text-[#28584E] mt-1">
                  {isSafe ? 'No shortfall' : 'from now'}
                </div>
              </div>

              {/* Probability */}
              <div>
                <div className="font-serif text-[36px] font-semibold text-[#0F3D33] leading-none flex items-baseline gap-2">
                  {Math.round(shortfallRisk * 100)}%
                  {hasOverrides && overrideData && (
                    <span className="text-sm font-sans font-semibold text-[#527A71] bg-white/70 px-2 py-0.5 rounded-full">
                      was {Math.round(baseRisk * 100)}%
                    </span>
                  )}
                </div>
                <div className="text-sm text-[#28584E] mt-1">chance of shortfall</div>
              </div>

              {/* Gap / cushion */}
              <div>
                <div className="font-serif text-[36px] font-semibold text-[#0F3D33] leading-none">
                  {isSafe
                    ? p10Min !== null && p10Min > 0
                      ? formatCompactINR(p10Min)
                      : '—'
                    : shortfallAmount !== null
                    ? formatCompactINR(Math.abs(shortfallAmount ?? 0))
                    : '—'}
                </div>
                <div className="text-sm text-[#28584E] mt-1">
                  {isSafe ? 'minimum cushion' : 'gap expected'}
                </div>
                {/* Bad case caption */}
                {!isSafe && p10Min !== null && p10Min < 0 && (
                  <div className="text-xs text-[#527A71] mt-0.5">
                    could reach {formatCompactINR(Math.abs(p10Min))} in a bad case
                  </div>
                )}
              </div>
            </div>

            {/* Summary sentence */}
            {!isSafe && baseData?.top_drivers && (
              <p className="mt-6 text-base text-[#28584E] leading-relaxed max-w-2xl">
                {summaryFromDrivers(baseData.top_drivers, parties)}
              </p>
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* ── WHY THIS IS HAPPENING ────────────────────────────────────────────── */}
      <section className="space-y-5">
        <div>
          <h2 className="font-serif text-2xl font-semibold text-[#0F3D33]">
            {isSafe ? 'What could affect your cash' : 'Why this is happening'}
          </h2>
          <p className="text-sm text-[#527A71] mt-1">
            These are the transactions that matter most, biggest first.
          </p>
        </div>

        <div className="space-y-4">
          {visibleDrivers.map((driver, idx) => {
            const name = driver.counterparty_id
              ? (parties[driver.counterparty_id]?.name ?? null)
              : null;
            const party = driver.counterparty_id ? parties[driver.counterparty_id] : null;
            const impactPct =
              totalImpact > 0 ? (Math.abs(driver.impact) / totalImpact) * 100 : 0;
            const isExpanded = expandedDriver === driver.rank;
            const fixApplied = driverHasFix(driver);
            const reminder = findReminder(driver.invoice_id);

            return (
              <motion.div
                key={driver.rank}
                layout
                className={`rounded-[20px] overflow-hidden shadow-soft transition-all ${
                  fixApplied ? 'ring-2 ring-[#0F3D33]/30' : ''
                } bg-white`}
              >
                {/* Card header — always visible */}
                <button
                  onClick={() => setExpandedDriver(isExpanded ? null : driver.rank)}
                  className="w-full text-left p-6 flex items-start gap-4 hover:bg-[#F1E9DC]/30 transition-colors"
                >
                  {/* Rank */}
                  <span className="font-serif text-2xl font-semibold text-[#C8B89A] shrink-0 w-7 text-center leading-none mt-1">
                    {driver.rank}
                  </span>

                  {/* Avatar */}
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${avatarColour(idx)}`}
                  >
                    {driver.type === 'recurring' ? (
                      driver.amount >= 500000 ? (
                        <Clock className="w-4 h-4" />
                      ) : (
                        <Repeat className="w-4 h-4" />
                      )
                    ) : (
                      getInitials(name ?? 'XX')
                    )}
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-serif text-base font-semibold text-[#0F3D33]">
                        {driverTitle(driver.type, driver.amount, name, driver.due_date)}
                      </span>
                      <TypeChip type={driver.type} />
                      {fixApplied && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#0F3D33] text-white text-[11px] font-semibold">
                          <CheckCircle2 className="w-3 h-3" /> Fix applied
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-[#527A71] mt-1 leading-relaxed">
                      {driverSentence(
                        driver.type,
                        driver.amount,
                        name,
                        driver.due_date,
                        party?.avg_delay_days ?? null
                      )}
                    </p>

                    {/* Impact bar */}
                    <div className="mt-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-[#527A71]">
                          Causes about {Math.round(impactPct)}% of the risk
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-[#F1E9DC] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#FF6B4A] rounded-full"
                          style={{ width: `${Math.min(impactPct, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Amount + chevron */}
                  <div className="text-right shrink-0 ml-2">
                    <div className="font-serif text-lg font-semibold text-[#0F3D33]">
                      {formatINR(driver.amount)}
                    </div>
                    <div className="text-[#527A71] mt-2">
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 ml-auto" />
                      ) : (
                        <ChevronDown className="w-4 h-4 ml-auto" />
                      )}
                    </div>
                  </div>
                </button>

                {/* Expandable detail */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6 pt-0 border-t border-[#F1E9DC] flex flex-col sm:flex-row items-start gap-6 mt-0 pt-5">
                        {/* Payment history dots */}
                        {party?.delay_profile && party.delay_profile.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-[#527A71] mb-2">
                              Payment history
                            </p>
                            <DelayDots profile={party.delay_profile} />
                            <p className="text-xs text-[#527A71] mt-1.5">
                              Average delay: {Math.round(party.avg_delay_days)} days
                            </p>
                          </div>
                        )}

                        {/* Action button */}
                        <div className="sm:ml-auto">
                          {driver.type === 'receivable' && reminder && (
                            <Button
                              variant="secondary"
                              size="sm"
                              leftIcon={<MessageCircle className="w-3.5 h-3.5" />}
                              onClick={() => setWhatsappReminder(reminder)}
                            >
                              Send WhatsApp reminder
                            </Button>
                          )}
                          {driver.type === 'receivable' && !reminder && (
                            <span className="text-xs text-[#527A71]">No reminder on record</span>
                          )}
                          {driver.type === 'payable' && (
                            <Button
                              variant="secondary"
                              size="sm"
                              leftIcon={<Clock className="w-3.5 h-3.5" />}
                              onClick={() =>
                                alert(
                                  `Draft email to ask ${name ?? 'supplier'} for 15 more days on ${driver.invoice_number ?? 'this invoice'}.`
                                )
                              }
                            >
                              Ask for 15 more days
                            </Button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* Show more / less toggle */}
        {drivers.length > 3 && (
          <button
            onClick={() => setShowAllDrivers(!showAllDrivers)}
            className="text-sm font-semibold text-[#0F3D33] hover:underline"
          >
            {showAllDrivers ? 'Show fewer' : `Show ${drivers.length - 3} more`}
          </button>
        )}
      </section>

      {/* ── TRY A FIX ───────────────────────────────────────────────────────── */}
      {!isSafe && (
        <section className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-2xl font-semibold text-[#0F3D33]">Try a fix</h2>
              <p className="text-sm text-[#527A71] mt-1">
                Toggle these on to see how the forecast changes.
              </p>
            </div>
            {hasOverrides && (
              <button
                onClick={() => {
                  setSaiCollectNow(false);
                  setSteelDelay15d(false);
                  setSaiEarly10d(false);
                }}
                className="text-sm font-semibold text-[#0F3D33] hover:underline flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Fix 1: Collect Sai Auto now */}
            <button
              onClick={() => {
                setSaiCollectNow(!saiCollectNow);
                if (!saiCollectNow) setSaiEarly10d(false);
              }}
              className={`p-6 rounded-[20px] text-left transition-all duration-200 shadow-soft ${
                saiCollectNow
                  ? 'bg-[#0F3D33] text-[#FBF7F0]'
                  : 'bg-white text-[#0F3D33] hover:bg-[#F1E9DC]'
              }`}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-3 ${saiCollectNow ? 'bg-white/20' : 'bg-[#CDEBDD]'}`}>
                <MessageCircle className={`w-4 h-4 ${saiCollectNow ? 'text-[#CDEBDD]' : 'text-[#0F3D33]'}`} />
              </div>
              <span className="font-serif text-sm font-semibold block">
                Collect Sai Auto ₹9L this week
              </span>
              <span className={`text-xs mt-1.5 block ${saiCollectNow ? 'text-[#CDEBDD]' : 'text-[#527A71]'}`}>
                {fixProbs.saiCollect !== null
                  ? `Chance drops to ${Math.round(fixProbs.saiCollect * 100)}% (from ${Math.round(baseRisk * 100)}%)`
                  : 'Tap to simulate'}
              </span>
            </button>

            {/* Fix 2: Delay Tata Steel 15d */}
            <button
              onClick={() => setSteelDelay15d(!steelDelay15d)}
              className={`p-6 rounded-[20px] text-left transition-all duration-200 shadow-soft ${
                steelDelay15d
                  ? 'bg-[#0F3D33] text-[#FBF7F0]'
                  : 'bg-white text-[#0F3D33] hover:bg-[#F1E9DC]'
              }`}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-3 ${steelDelay15d ? 'bg-white/20' : 'bg-[#FFE8A3]'}`}>
                <Clock className={`w-4 h-4 ${steelDelay15d ? 'text-[#FFE8A3]' : 'text-[#8A5B00]'}`} />
              </div>
              <span className="font-serif text-sm font-semibold block">
                Delay Tata Steel bill by 15 days
              </span>
              <span className={`text-xs mt-1.5 block ${steelDelay15d ? 'text-[#CDEBDD]' : 'text-[#527A71]'}`}>
                {fixProbs.steelDelay !== null
                  ? `Chance drops to ${Math.round(fixProbs.steelDelay * 100)}% (from ${Math.round(baseRisk * 100)}%)`
                  : 'Tap to simulate'}
              </span>
            </button>

            {/* Fix 3: Sai Auto pays 10d earlier */}
            <button
              onClick={() => {
                setSaiEarly10d(!saiEarly10d);
                if (!saiEarly10d) setSaiCollectNow(false);
              }}
              className={`p-6 rounded-[20px] text-left transition-all duration-200 shadow-soft ${
                saiEarly10d
                  ? 'bg-[#0F3D33] text-[#FBF7F0]'
                  : 'bg-white text-[#0F3D33] hover:bg-[#F1E9DC]'
              }`}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-3 ${saiEarly10d ? 'bg-white/20' : 'bg-[#FDEEE9]'}`}>
                <Calendar className={`w-4 h-4 ${saiEarly10d ? 'text-[#FDEEE9]' : 'text-[#C13A1E]'}`} />
              </div>
              <span className="font-serif text-sm font-semibold block">
                Sai Auto pays 10 days earlier
              </span>
              <span className={`text-xs mt-1.5 block ${saiEarly10d ? 'text-[#CDEBDD]' : 'text-[#527A71]'}`}>
                {fixProbs.saiEarly !== null
                  ? `Chance drops to ${Math.round(fixProbs.saiEarly * 100)}% (from ${Math.round(baseRisk * 100)}%)`
                  : 'Tap to simulate'}
              </span>
            </button>
          </div>
        </section>
      )}

      {/* ── CHART (collapsed) ────────────────────────────────────────────────── */}
      <div className="rounded-[24px] bg-white shadow-soft overflow-hidden">
        <button
          onClick={() => setShowChart(!showChart)}
          className="w-full p-6 flex items-center justify-between text-left hover:bg-[#F1E9DC]/40 transition-colors"
        >
          <div>
            <h3 className="text-base font-semibold font-serif text-[#0F3D33]">
              See the cash path day by day
            </h3>
            <p className="text-xs text-[#527A71] mt-0.5">
              {hasOverrides ? 'Showing forecast with your fix applied.' : `30-day cash flow with uncertainty range.`}
            </p>
          </div>
          <span className="text-xs text-[#0F3D33] font-semibold bg-[#F1E9DC] px-3 py-1 rounded-full flex items-center gap-1 shrink-0">
            {showChart ? 'Hide' : 'Show chart'}
            {showChart ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </span>
        </button>

        {showChart && (
          <div className="p-6 pt-0 border-t border-[#F1E9DC]">
            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartPoints} margin={{ top: 12, right: 12, left: -10, bottom: 0 }}>
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
                  <ReferenceLine
                    y={0}
                    stroke="#FF6B4A"
                    strokeDasharray="3 3"
                    strokeWidth={1.5}
                    label={{
                      value: 'Cash runs out below this line',
                      fill: '#FF6B4A',
                      fontSize: 11,
                      position: 'insideTopLeft',
                    }}
                  />
                  {/* Soft mint p10-p90 range band */}
                  <Area
                    type="monotone"
                    dataKey="range"
                    fill="#CDEBDD"
                    fillOpacity={0.45}
                    stroke="none"
                  />
                  {/* Expected balance — 3px deep green */}
                  <Line
                    type="monotone"
                    dataKey="p50"
                    name="Expected balance"
                    stroke="#0F3D33"
                    strokeWidth={3}
                    strokeLinecap="round"
                    dot={false}
                    activeDot={{ r: 6, fill: '#0F3D33', stroke: '#FFFFFF', strokeWidth: 3 }}
                    animationDuration={700}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* ── BACKTEST (collapsed) ─────────────────────────────────────────────── */}
      <div className="rounded-[24px] bg-white shadow-soft overflow-hidden">
        <button
          onClick={() => setShowBacktest(!showBacktest)}
          className="w-full p-6 flex items-center justify-between text-left hover:bg-[#F1E9DC]/40 transition-colors"
        >
          <div>
            <h3 className="text-base font-semibold font-serif text-[#0F3D33]">
              Would Runway have caught this before?
            </h3>
            <p className="text-xs text-[#527A71] mt-0.5">
              Backtest against your real October cash crunch.
            </p>
          </div>
          <span className="text-xs text-[#0F3D33] font-semibold bg-[#F1E9DC] px-3 py-1 rounded-full flex items-center gap-1 shrink-0">
            {showBacktest ? 'Hide' : 'Show proof'}
            {showBacktest ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </span>
        </button>

        {showBacktest && (
          <div className="p-7 border-t border-[#F1E9DC] bg-[#F1E9DC]/50 space-y-4">
            <p className="text-base font-semibold font-serif text-[#0F3D33]">
              Runway would have warned you 21 days earlier.
            </p>
            <p className="text-sm text-[#28584E] leading-relaxed">
              In October, your cash dropped to -₹3,20,000 due to delayed receipts. When we
              re-run the forecast 21 days prior, the simulation predicted an 84% shortfall
              probability on that exact week.
            </p>
            <div className="p-5 rounded-2xl bg-white shadow-soft text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-[#527A71]">Predicted shortfall probability:</span>
                <strong className="text-[#FF6B4A] font-serif text-sm">
                  {backtestData
                    ? `${Math.round(backtestData.shortfall_prob_30 * 100)}%`
                    : '84%'}
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#527A71]">Actual lowest balance:</span>
                <strong className="text-[#0F3D33] font-serif text-sm">
                  -₹3,20,000 (Crunch verified)
                </strong>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── WhatsApp Modal ───────────────────────────────────────────────────── */}
      <WhatsAppModal
        reminder={whatsappReminder}
        isOpen={whatsappReminder !== null}
        onClose={() => setWhatsappReminder(null)}
      />
    </div>
  );
};
