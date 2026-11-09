import React, { useState } from 'react';
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
  Sparkles,
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  RotateCcw,
  Check,
  Info,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ChartTooltip } from '@/components/ui/ChartTooltip';
import { PageGuidance } from '@/components/onboarding/PageGuidance';
import { api, AssessResponse, AlternativeOption } from '@/api/client';
import { formatINR, formatCompactINR } from '@/utils/format';
import { useToast } from '@/components/ui/Toast';

const PREFILLED_EXAMPLES = [
  {
    label: 'New machine ₹12L',
    type: 'purchase' as const,
    party: 'Sandvik Coromant India',
    amount: 1200000,
    terms: 15,
  },
  {
    label: 'Raw material order ₹4L',
    type: 'purchase' as const,
    party: 'Tata Steel BSL Ltd',
    amount: 400000,
    terms: 30,
  },
  {
    label: 'Big sale ₹6L',
    type: 'sale' as const,
    party: 'Bosch Automotive India',
    amount: 600000,
    terms: 45,
  },
];

export const PreTransactionPage: React.FC = () => {
  const { success, error } = useToast();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [txnType, setTxnType] = useState<'purchase' | 'sale' | 'expense'>('purchase');
  const [party, setParty] = useState('Sandvik Coromant India');
  const [amount, setAmount] = useState<number>(450000);
  const [targetDate, setTargetDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split('T')[0];
  });
  const [terms, setTerms] = useState<number>(15);

  const [isAssessing, setIsAssessing] = useState(false);
  const [assessment, setAssessment] = useState<AssessResponse | null>(null);
  const [selectedAlt, setSelectedAlt] = useState<AlternativeOption | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  // Run assessment
  const handleAssess = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsAssessing(true);
    try {
      const res = await api.assessPurchase({
        type: txnType,
        party,
        amount,
        date: targetDate,
        payment_terms: terms,
      });
      setAssessment(res);
      setSelectedAlt(null);
      setStep(2);
      success('Simulation complete', 'Re-ran 2,000 cash paths with this transaction.');
    } catch (err) {
      error('Assessment failed', 'Could not run simulation engine.');
    } finally {
      setIsAssessing(false);
    }
  };

  const handleApplyExample = (ex: (typeof PREFILLED_EXAMPLES)[0]) => {
    setTxnType(ex.type);
    setParty(ex.party);
    setAmount(ex.amount);
    setTerms(ex.terms);
    setAssessment(null);
    setSelectedAlt(null);
    setConfirmed(false);
    setStep(1);
  };

  const handleSelectAlternative = (alt: AlternativeOption) => {
    if (selectedAlt?.id === alt.id) {
      setSelectedAlt(null);
    } else {
      setSelectedAlt(alt);
      setStep(3);
    }
  };

  const handleConfirmDecision = async () => {
    if (!assessment) return;
    setIsConfirming(true);
    try {
      const effectiveAmount = amount;
      await api.confirmPurchase({
        type: txnType,
        party,
        amount: effectiveAmount,
        date: targetDate,
        alternative_id: selectedAlt ? selectedAlt.id : 'original_plan',
        notes: selectedAlt
          ? `Confirmed with choice: ${selectedAlt.title}`
          : 'Confirmed original transaction plan',
      });
      setConfirmed(true);
      success(
        'Transaction confirmed!',
        'Saved to schedule. Cash runway & forecast updated across the entire platform.'
      );
    } catch (err) {
      error('Confirmation failed', 'Could not record transaction.');
    } finally {
      setIsConfirming(false);
    }
  };

  // Build chart points
  const chartPoints = React.useMemo(() => {
    if (!assessment) return [];
    return assessment.days.map((dayStr, idx) => {
      const d = new Date(dayStr);
      const label = idx === 0 ? 'Today' : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
      const beforeVal = assessment.before_curve[idx];
      let afterVal = assessment.after_curve[idx];

      return {
        day: label,
        before: beforeVal,
        after: afterVal,
      };
    });
  }, [assessment]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Check a purchase"
        description="Test planned equipment or material purchases before confirming to protect your cash runway."
      />

      {/* ── 3-STEP FLOW HEADER ────────────────────────────────────────── */}
      <div className="p-4 rounded-[14px] bg-white border border-[#E8EAF0] shadow-card">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div
            className={`p-3 rounded-[10px] flex items-center gap-3 transition-colors ${
              step === 1 ? 'bg-[#EEF0FD] border border-[#C7D2FE]' : 'bg-[#F9FAFB]'
            }`}
          >
            <span
              className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center shrink-0 ${
                step === 1
                  ? 'bg-[#3F3DDB] text-white'
                  : 'bg-[#E5E7EB] text-[#6B7280]'
              }`}
            >
              1
            </span>
            <div>
              <h4 className="text-xs font-bold text-[#111827]">1. Describe it</h4>
              <p className="text-[11px] text-[#6B7280]">Enter amount, party & date</p>
            </div>
          </div>

          <div
            className={`p-3 rounded-[10px] flex items-center gap-3 transition-colors ${
              step === 2 ? 'bg-[#EEF0FD] border border-[#C7D2FE]' : 'bg-[#F9FAFB]'
            }`}
          >
            <span
              className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center shrink-0 ${
                step === 2
                  ? 'bg-[#3F3DDB] text-white'
                  : 'bg-[#E5E7EB] text-[#6B7280]'
              }`}
            >
              2
            </span>
            <div>
              <h4 className="text-xs font-bold text-[#111827]">2. See the impact</h4>
              <p className="text-[11px] text-[#6B7280]">View re-simulated balance</p>
            </div>
          </div>

          <div
            className={`p-3 rounded-[10px] flex items-center gap-3 transition-colors ${
              step === 3 || confirmed
                ? 'bg-[#EEF0FD] border border-[#C7D2FE]'
                : 'bg-[#F9FAFB]'
            }`}
          >
            <span
              className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center shrink-0 ${
                step === 3 || confirmed
                  ? 'bg-[#3F3DDB] text-white'
                  : 'bg-[#E5E7EB] text-[#6B7280]'
              }`}
            >
              3
            </span>
            <div>
              <h4 className="text-xs font-bold text-[#111827]">3. Decide & confirm</h4>
              <p className="text-[11px] text-[#6B7280]">Choose plan & lock forecast</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── PREFILLED EXAMPLE CHIPS ────────────────────────────────────── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        <span className="text-xs font-semibold text-[#6B7280] whitespace-nowrap">
          Try a prefilled scenario:
        </span>
        {PREFILLED_EXAMPLES.map((ex, idx) => (
          <button
            key={idx}
            onClick={() => handleApplyExample(ex)}
            className="px-3 py-1.5 rounded-full text-xs font-medium bg-white border border-[#E8EAF0] text-[#374151] hover:border-[#3F3DDB] hover:text-[#3F3DDB] transition-all shadow-sm shrink-0 flex items-center gap-1.5"
          >
            <Sparkles className="w-3 h-3 text-[#3F3DDB]" />
            {ex.label}
          </button>
        ))}
      </div>

      {/* ── MAIN CONTENT GRID: INPUT FORM & ASSESSMENT RESULT ──────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Card */}
        <Card className="lg:col-span-5 space-y-4">
          <div className="pb-3 border-b border-[#E8EAF0]">
            <h3 className="text-base font-bold font-heading text-[#111827]">
              Transaction details
            </h3>
            <p className="text-xs text-[#6B7280] mt-0.5">
              We test this against all 2,000 cash trajectories and upcoming bills.
            </p>
          </div>

          <form onSubmit={handleAssess} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-[#374151] mb-1">
                Transaction type
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['purchase', 'expense', 'sale'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTxnType(t)}
                    className={`py-1.5 rounded-lg text-xs font-semibold capitalize border transition-all ${
                      txnType === t
                        ? 'bg-[#3F3DDB] text-white border-[#3F3DDB] shadow-sm'
                        : 'bg-[#F9FAFB] text-[#4B5563] border-[#E8EAF0] hover:bg-white'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#374151] mb-1">
                Amount (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#6B7280]">
                  ₹
                </span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  required
                  className="w-full pl-7 pr-3 py-2 bg-white border border-[#CBD5E1] rounded-lg text-xs text-[#111827] font-semibold focus:outline-none focus:border-[#3F3DDB]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#374151] mb-1">
                Party / Payee
              </label>
              <input
                type="text"
                value={party}
                onChange={(e) => setParty(e.target.value)}
                required
                className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-lg text-xs text-[#111827] focus:outline-none focus:border-[#3F3DDB]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#374151] mb-1">
                  Delivery / Order date
                </label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-lg text-xs text-[#111827] focus:outline-none focus:border-[#3F3DDB]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#374151] mb-1">
                  Payment credit terms
                </label>
                <select
                  value={terms}
                  onChange={(e) => setTerms(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-lg text-xs text-[#111827] focus:outline-none focus:border-[#3F3DDB]"
                >
                  <option value={0}>Immediate (0 days)</option>
                  <option value={15}>Net 15 days</option>
                  <option value={30}>Net 30 days</option>
                  <option value={45}>Net 45 days</option>
                </select>
              </div>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                className="w-full justify-center"
                isLoading={isAssessing}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Simulate cash impact
              </Button>
            </div>
          </form>
        </Card>

        {/* Results Card */}
        <Card className="lg:col-span-7 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#E8EAF0]">
              <h3 className="text-base font-bold font-heading text-[#111827]">
                Simulation verdict
              </h3>
              {assessment && (
                <Badge
                  variant={
                    (selectedAlt ? selectedAlt.verdict : assessment.verdict) === 'high_risk'
                      ? 'danger'
                      : (selectedAlt ? selectedAlt.verdict : assessment.verdict) === 'caution'
                      ? 'caution'
                      : 'safe'
                  }
                >
                  {(selectedAlt
                    ? selectedAlt.verdict
                    : assessment.verdict
                  ).toUpperCase()}
                </Badge>
              )}
            </div>

            {assessment ? (
              <div className="space-y-4 pt-2">
                {/* Explanation Banner */}
                <div
                  className={`p-4 rounded-[12px] border ${
                    (selectedAlt ? selectedAlt.verdict : assessment.verdict) === 'high_risk'
                      ? 'bg-[#FEF3F2] border-[#FECDCA] text-[#B42318]'
                      : (selectedAlt ? selectedAlt.verdict : assessment.verdict) === 'caution'
                      ? 'bg-[#FFF4DB] border-[#FDE68A] text-[#B45309]'
                      : 'bg-[#E8F7EE] border-[#A6F4C5] text-[#15803D]'
                  }`}
                >
                  <p className="text-xs sm:text-sm font-medium leading-relaxed">
                    {selectedAlt
                      ? `Selected alternative: ${selectedAlt.title}. Shortfall risk drops to ${(selectedAlt.shortfall_prob * 100).toFixed(0)}%.`
                      : assessment.explanation}
                  </p>
                </div>

                {/* Animated / Clean Before and After Cash Curve */}
                <div className="h-56 w-full pt-1">
                  <span className="text-[11px] font-semibold text-[#6B7280] block mb-1">
                    Projected Cash Trajectory (Next 60 Days):
                  </span>
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                      data={chartPoints}
                      margin={{ top: 8, right: 12, left: -5, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F2F6" />
                      <XAxis
                        dataKey="day"
                        stroke="#9CA3AF"
                        fontSize={10}
                        tickLine={false}
                        axisLine={{ stroke: '#E8EAF0' }}
                      />
                      <YAxis
                        stroke="#9CA3AF"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`}
                      />
                      <Tooltip content={<ChartTooltip />} />
                      <ReferenceLine y={0} stroke="#EF4444" strokeDasharray="4 4" strokeWidth={1.5} />
                      <Line
                        type="monotone"
                        dataKey="before"
                        stroke="#9CA3AF"
                        strokeDasharray="4 4"
                        strokeWidth={1.5}
                        dot={false}
                        name="Baseline balance"
                      />
                      <Line
                        type="monotone"
                        dataKey="after"
                        stroke={
                          assessment.verdict === 'high_risk' ? '#B42318' : '#3F3DDB'
                        }
                        strokeWidth={2.5}
                        dot={false}
                        name="With this transaction"
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>

                {/* Stat Numbers */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-[#F5F6FA] border border-[#E8EAF0]">
                    <span className="text-[#6B7280] block text-[10px]">Shortfall risk:</span>
                    <strong
                      className={
                        assessment.after_prob > 0.5 ? 'text-[#B42318]' : 'text-[#111827]'
                      }
                    >
                      {Math.round(assessment.before_prob * 100)}% →{' '}
                      {Math.round(
                        (selectedAlt ? selectedAlt.shortfall_prob : assessment.after_prob) *
                          100
                      )}
                      %
                    </strong>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#F5F6FA] border border-[#E8EAF0]">
                    <span className="text-[#6B7280] block text-[10px]">Lowest balance:</span>
                    <strong
                      className={
                        (selectedAlt ? selectedAlt.lowest_balance : assessment.after_lowest) <
                        0
                          ? 'text-[#B42318]'
                          : 'text-[#111827]'
                      }
                    >
                      {formatINR(
                        selectedAlt ? selectedAlt.lowest_balance : assessment.after_lowest
                      )}
                    </strong>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#F5F6FA] border border-[#E8EAF0]">
                    <span className="text-[#6B7280] block text-[10px]">Shortfall date:</span>
                    <strong className="text-[#111827]">{assessment.lowest_date}</strong>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#F5F6FA] border border-[#E8EAF0]">
                    <span className="text-[#6B7280] block text-[10px]">Simulation runs:</span>
                    <strong className="text-[#15803D]">2,000 runs</strong>
                  </div>
                </div>

                {/* ── AUTO-SIMULATED SAFER ALTERNATIVES ──────────────────── */}
                <div className="pt-3 border-t border-[#E8EAF0] space-y-2.5">
                  <span className="text-xs font-bold text-[#111827] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#3F3DDB]" />
                    Auto-simulated safer alternatives:
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {assessment.alternatives.map((alt) => {
                      const isSelected = selectedAlt?.id === alt.id;
                      return (
                        <div
                          key={alt.id}
                          onClick={() => handleSelectAlternative(alt)}
                          className={`p-3 rounded-[10px] border cursor-pointer transition-all flex flex-col justify-between space-y-1.5 ${
                            isSelected
                              ? 'bg-[#EEF0FD] border-[#3F3DDB] shadow-sm'
                              : 'bg-white border-[#E8EAF0] hover:border-[#CBD5E1]'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-[#111827]">
                                {alt.title}
                              </span>
                              {isSelected && (
                                <Check className="w-3.5 h-3.5 text-[#3F3DDB]" />
                              )}
                            </div>
                            <p className="text-[11px] text-[#6B7280] mt-1 leading-snug">
                              {alt.description}
                            </p>
                          </div>

                          <div className="pt-1.5 border-t border-[#F1F2F6] flex items-center justify-between text-[11px]">
                            <span className="text-[#6B7280]">Risk:</span>
                            <Badge variant={alt.verdict === 'high_risk' ? 'danger' : alt.verdict === 'caution' ? 'caution' : 'safe'}>
                              {Math.round(alt.shortfall_prob * 100)}%
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-20 text-center space-y-2">
                <p className="text-sm font-semibold text-[#111827]">
                  No transaction evaluated yet
                </p>
                <p className="text-xs text-[#6B7280] max-w-sm mx-auto leading-relaxed">
                  Fill in the payment details on the left or select a prefilled scenario chip above to run 2,000 vectorised Monte Carlo simulations.
                </p>
              </div>
            )}
          </div>

          {/* Confirm Decision Button */}
          {assessment && (
            <div className="pt-3 border-t border-[#E8EAF0] flex items-center justify-between">
              <span className="text-xs text-[#6B7280]">
                {selectedAlt
                  ? `Selected: ${selectedAlt.title}`
                  : 'Ready to proceed with original terms'}
              </span>

              <Button
                variant="primary"
                size="md"
                disabled={confirmed}
                isLoading={isConfirming}
                onClick={handleConfirmDecision}
                leftIcon={confirmed ? <CheckCircle2 className="w-4 h-4" /> : undefined}
                className={confirmed ? 'bg-[#15803D]' : undefined}
              >
                {confirmed ? 'Decision Recorded & Active' : 'Confirm & Lock into Forecast'}
              </Button>
            </div>
          )}
        </Card>
      </div>

      <PageGuidance
        pageKey="pre-transaction"
        bullets={[
          'Checks proposed transactions against your projected bank balances, customer receipts, and fixed monthly debits.',
          'Automatically tests alternative payment terms (such as 14-day delays or split instalments) to avoid overdraft triggers.',
          'Confirming a transaction records it directly into your schedule and refreshes the cash runway across the platform.',
        ]}
      />
    </div>
  );
};
