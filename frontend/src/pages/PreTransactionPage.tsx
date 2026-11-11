import React, { useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import {
  ArrowRight,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ChartTooltip } from '@/components/ui/ChartTooltip';
import { api, AssessResponse, AlternativeOption } from '@/api/client';
import { formatINR } from '@/utils/format';
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
  const [showOtherAlts, setShowOtherAlts] = useState(false);
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
      success('Simulation complete', 'Re-ran 2,000 cash paths with this transaction.');
    } catch (err) {
      error('Assessment failed', 'Could not run simulation engine.');
    } finally {
      setIsAssessing(false);
    }
  };

  const handleSelectExample = (ex: (typeof PREFILLED_EXAMPLES)[0]) => {
    setTxnType(ex.type);
    setParty(ex.party);
    setAmount(ex.amount);
    setTerms(ex.terms);
    setAssessment(null);
    setSelectedAlt(null);
    setConfirmed(false);
  };

  // Confirm choice into engine
  const handleConfirm = async () => {
    if (!assessment) return;
    setIsConfirming(true);
    try {
      await api.confirmPurchase({
        type: txnType,
        party,
        amount,
        date: targetDate,
        alternative_id: selectedAlt?.id,
        notes: selectedAlt ? `Applied alternative: ${selectedAlt.title}` : undefined,
      });
      setConfirmed(true);
      success('Transaction recorded', 'Your cash runway and forecast have been updated everywhere.');
    } catch (err) {
      error('Confirmation failed', 'Could not record transaction.');
    } finally {
      setIsConfirming(false);
    }
  };

  // Chart data
  const chartPoints = React.useMemo(() => {
    if (!assessment) return [];
    const days = assessment.days || [];
    const base = assessment.before_curve || [];
    const withTxn = assessment.after_curve || [];

    return days.map((dayStr: string, idx: number) => {
      const d = new Date(dayStr);
      const label = idx === 0 ? 'Today' : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
      return {
        day: label,
        before: Math.round(base[idx] || 0),
        after: Math.round(withTxn[idx] || 0),
      };
    });
  }, [assessment]);

  const bestAlternative = assessment?.alternatives?.[0];
  const otherAlternatives = assessment?.alternatives?.slice(1) || [];

  return (
    <div className="space-y-12 max-w-3xl mx-auto">
      {/* ── Page Header: Fraunces 32px ─────────────────────────────────── */}
      <PageHeader
        title="Can I afford this purchase?"
        description="Test any big expense or machine purchase against 2,000 cash paths before you sign."
      />

      {/* ── Example Chips ──────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs font-semibold text-[#527A71]">Try an example:</span>
        {PREFILLED_EXAMPLES.map((ex, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSelectExample(ex)}
            className="px-4 py-2 rounded-full text-xs font-semibold bg-white text-[#0F3D33] hover:bg-[#F1E9DC] shadow-soft transition-all duration-250"
          >
            {ex.label}
          </button>
        ))}
      </div>

      {/* ── Single Centred Card with 3 Fields (What, How much, When) ───── */}
      <Card bg="white" className="p-8 sm:p-9 shadow-soft">
        <form onSubmit={handleAssess} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* Field 1: What */}
            <div>
              <label className="block text-xs font-semibold text-[#527A71] uppercase tracking-wider mb-2">
                What / Supplier
              </label>
              <input
                type="text"
                value={party}
                onChange={(e) => setParty(e.target.value)}
                placeholder="e.g. Tata Steel BSL Ltd"
                className="w-full px-4 py-3 bg-[#FBF7F0] rounded-2xl text-sm font-medium text-[#0F3D33] focus:outline-none focus:ring-2 focus:ring-[#0F3D33]/20 shadow-soft"
                required
              />
            </div>

            {/* Field 2: How much */}
            <div>
              <label className="block text-xs font-semibold text-[#527A71] uppercase tracking-wider mb-2">
                How much (₹)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                step={10000}
                className="w-full px-4 py-3 bg-[#FBF7F0] rounded-2xl text-base font-semibold font-serif text-[#0F3D33] tabular-nums focus:outline-none focus:ring-2 focus:ring-[#0F3D33]/20 shadow-soft"
                required
              />
            </div>

            {/* Field 3: When */}
            <div>
              <label className="block text-xs font-semibold text-[#527A71] uppercase tracking-wider mb-2">
                When (Payment date)
              </label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full px-4 py-3 bg-[#FBF7F0] rounded-2xl text-sm font-medium text-[#0F3D33] focus:outline-none focus:ring-2 focus:ring-[#0F3D33]/20 shadow-soft"
                required
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isAssessing}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Check impact now
            </Button>
          </div>
        </form>
      </Card>

      {/* ── Assessment Result: One Plain Sentence + One Chart + Best Alt ─── */}
      {assessment && (
        <div className="space-y-8 animate-fadeIn">
          {/* Plain sentence verdict card */}
          <div className="p-7 rounded-[24px] bg-[#F1E9DC] shadow-soft flex items-start justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    assessment.verdict === 'safe'
                      ? 'safe'
                      : assessment.verdict === 'caution'
                      ? 'caution'
                      : 'danger'
                  }
                >
                  Verdict: {assessment.verdict.toUpperCase()}
                </Badge>
                <span className="text-xs text-[#527A71] font-medium">
                  30d shortage risk: {(assessment.before_prob * 100).toFixed(0)}% →{' '}
                  <strong className="text-[#0F3D33]">
                    {(assessment.after_prob * 100).toFixed(0)}%
                  </strong>
                </span>
              </div>
              <p className="text-base font-semibold font-serif text-[#0F3D33] pt-1">
                {assessment.explanation}
              </p>
            </div>
          </div>

          {/* Before-and-After Chart */}
          <Card bg="white" className="p-8 shadow-soft">
            <h3 className="text-xs font-semibold text-[#527A71] uppercase tracking-wider mb-4">
              Before vs After Cash Trajectory
            </h3>
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartPoints} margin={{ top: 8, right: 10, left: -15, bottom: 0 }}>
                  <XAxis dataKey="day" stroke="#8FB4AC" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis
                    stroke="#8FB4AC"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => `₹${(val / 100000).toFixed(0)}L`}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <ReferenceLine y={0} stroke="#FF6B4A" strokeDasharray="3 3" />
                  <Line
                    type="monotone"
                    dataKey="before"
                    name="Current baseline"
                    stroke="#8FB4AC"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="after"
                    name="With this purchase"
                    stroke="#0F3D33"
                    strokeWidth={3}
                    dot={false}
                    animationDuration={700}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Best Safer Alternative Card */}
          {bestAlternative && (
            <div className="p-7 rounded-[24px] bg-[#CDEBDD] shadow-soft space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#0F3D33] uppercase tracking-wider">
                  Recommended safer option
                </span>
                <span className="text-xs font-semibold text-[#1C6B56] bg-white px-3 py-1 rounded-full">
                  Risk falls to {(bestAlternative.shortfall_prob * 100).toFixed(0)}%
                </span>
              </div>

              <div>
                <h4 className="text-base font-semibold font-serif text-[#0F3D33]">{bestAlternative.title}</h4>
                <p className="text-xs text-[#28584E] mt-1">{bestAlternative.description}</p>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() =>
                    setSelectedAlt(selectedAlt?.id === bestAlternative.id ? null : bestAlternative)
                  }
                  className={`px-4 py-2 rounded-full text-xs font-semibold transition-all duration-250 ${
                    selectedAlt?.id === bestAlternative.id
                      ? 'bg-[#0F3D33] text-white'
                      : 'bg-white text-[#0F3D33] hover:bg-[#F1E9DC]'
                  }`}
                >
                  {selectedAlt?.id === bestAlternative.id ? '✓ Selected' : 'Apply this option'}
                </button>

                {otherAlternatives.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowOtherAlts(!showOtherAlts)}
                    className="text-xs font-semibold text-[#0F3D33] hover:underline flex items-center gap-1"
                  >
                    {showOtherAlts ? 'Hide other options' : `See other options (${otherAlternatives.length})`}
                    {showOtherAlts ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Other alternatives behind progressive disclosure */}
          {showOtherAlts && (
            <div className="space-y-4 animate-fadeIn">
              {otherAlternatives.map((alt) => (
                <div
                  key={alt.id}
                  className="p-5 rounded-[20px] bg-white shadow-soft flex items-center justify-between gap-4"
                >
                  <div>
                    <h5 className="text-sm font-semibold font-serif text-[#0F3D33]">{alt.title}</h5>
                    <p className="text-xs text-[#527A71] mt-0.5">{alt.description}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedAlt(selectedAlt?.id === alt.id ? null : alt)}
                    className={`px-4 py-2 rounded-full text-xs font-semibold shrink-0 transition-all ${
                      selectedAlt?.id === alt.id
                        ? 'bg-[#0F3D33] text-white'
                        : 'bg-[#F1E9DC] text-[#0F3D33] hover:bg-[#E5DDD0]'
                    }`}
                  >
                    {selectedAlt?.id === alt.id ? '✓ Selected' : 'Select'}
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Confirm Button */}
          <div className="p-6 rounded-[24px] bg-white shadow-soft flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold font-serif text-[#0F3D33]">Ready to proceed?</p>
              <p className="text-xs text-[#527A71]">
                {selectedAlt ? `Recording with: ${selectedAlt.title}` : 'Recording original terms'}
              </p>
            </div>
            <Button
              variant="primary"
              size="md"
              onClick={handleConfirm}
              isLoading={isConfirming}
              disabled={confirmed}
            >
              {confirmed ? '✓ Recorded in forecast' : 'Confirm & record choice'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
