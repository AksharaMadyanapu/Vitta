import React, { useState } from 'react';
import {
  ShieldCheck,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { SkeletonChart } from '@/components/ui/Skeleton';
import { formatINR } from '@/utils/format';
import { useToast } from '@/components/ui/Toast';

export const PreTransactionPage: React.FC = () => {
  const [amount, setAmount] = useState<number>(350000);
  const [description, setDescription] = useState('New CNC Lathe Tooling Kit Purchase');
  const [party, setParty] = useState('Sandvik Coromant India');
  const [targetDate, setTargetDate] = useState('2026-11-22');
  const [evaluated, setEvaluated] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [showSkeleton, setShowSkeleton] = useState(false);
  const { success } = useToast();

  const handleEvaluate = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEvaluating(true);
    setTimeout(() => {
      setIsEvaluating(false);
      setEvaluated(true);
      success('What-If Risk Assessment Complete', 'Evaluated 2,000 simulations including this outflow.');
    }, 900);
  };

  const isHighRisk = amount > 500000;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pre-Transaction Risk Assessment"
        description="Test planned purchase orders, capital expenditures, or supplier contracts against the forecast engine before committing funds."
        badge={
          <Badge variant="blue" dot>
            Hypothetical Counterfactual Sandbox
          </Badge>
        }
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSkeleton(!showSkeleton)}
          >
            {showSkeleton ? 'View Content' : 'Preview Skeletons'}
          </Button>
        }
      />

      {showSkeleton ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SkeletonChart height="h-96" />
          <SkeletonChart height="h-96" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form Card */}
          <Card className="p-6">
            <h3 className="text-base font-semibold text-primary pb-3 border-b border-border/50">
              Simulate Proposed Outflow
            </h3>
            <p className="text-xs text-primary-muted mt-1 mb-6">
              Enter proposed transaction details to run a counterfactual check against existing receivables and obligations.
            </p>

            <form onSubmit={handleEvaluate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-primary-muted uppercase tracking-wider mb-1.5">
                  Proposed Outflow Amount (₹ INR)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary font-bold">
                    ₹
                  </span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    required
                    className="w-full pl-9 pr-4 py-2.5 bg-elevated border border-border rounded-xl text-primary font-mono text-sm focus:outline-none focus:border-accent-blue"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-primary-muted uppercase tracking-wider mb-1.5">
                  Vendor / Counterparty
                </label>
                <input
                  type="text"
                  value={party}
                  onChange={(e) => setParty(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 bg-elevated border border-border rounded-xl text-primary text-sm focus:outline-none focus:border-accent-blue"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-primary-muted uppercase tracking-wider mb-1.5">
                  Description / Purpose
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 bg-elevated border border-border rounded-xl text-primary text-sm focus:outline-none focus:border-accent-blue"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-primary-muted uppercase tracking-wider mb-1.5">
                  Planned Execution Date
                </label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 bg-elevated border border-border rounded-xl text-primary text-sm font-mono focus:outline-none focus:border-accent-blue"
                />
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  isLoading={isEvaluating}
                  leftIcon={<Sparkles className="w-4 h-4" />}
                >
                  Evaluate Cash-Flow Risk
                </Button>
              </div>
            </form>
          </Card>

          {/* Result Card */}
          <Card className="p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-border/50">
                <h3 className="text-base font-semibold text-primary">
                  Evaluation Verdict
                </h3>
                {evaluated && (
                  <Badge variant={isHighRisk ? 'high' : 'safe'} size="md" dot>
                    {isHighRisk ? 'Caution: Elevated Shortfall Risk' : 'Transaction Safe to Commit'}
                  </Badge>
                )}
              </div>

              {evaluated ? (
                <div className="mt-6 space-y-5">
                  <div
                    className={`p-5 rounded-2xl border ${
                      isHighRisk
                        ? 'bg-risk-high-bg border-risk-high/40'
                        : 'bg-risk-safe-bg border-risk-safe/40'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {isHighRisk ? (
                        <AlertTriangle className="w-5 h-5 text-risk-high" />
                      ) : (
                        <CheckCircle2 className="w-5 h-5 text-risk-safe" />
                      )}
                      <h4
                        className={`text-sm font-bold ${
                          isHighRisk ? 'text-risk-high-text' : 'text-risk-safe-text'
                        }`}
                      >
                        {isHighRisk
                          ? 'Triggers 42% Risk of Bank Overdraft Breach'
                          : 'Comfortable Liquidity Margin Maintained'}
                      </h4>
                    </div>

                    <p className="text-xs text-primary-muted mt-2 leading-relaxed">
                      {isHighRisk
                        ? `Adding an outflow of ${formatINR(amount)} on ${targetDate} pushes the p10 balance to ₹-1,45,000 due to existing GST liabilities.`
                        : `After this ${formatINR(amount)} outflow on ${targetDate}, projected minimum p10 cash buffer remains safe at ₹4,95,000.`}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs py-2 border-b border-border/40">
                      <span className="text-primary-muted">Pre-transaction p50 Median:</span>
                      <strong className="text-primary font-mono font-semibold">₹24,50,000</strong>
                    </div>
                    <div className="flex items-center justify-between text-xs py-2 border-b border-border/40">
                      <span className="text-primary-muted">Post-transaction p50 Median:</span>
                      <strong className="text-accent-teal font-mono font-semibold">
                        {formatINR(2450000 - amount)}
                      </strong>
                    </div>
                    <div className="flex items-center justify-between text-xs py-2 border-b border-border/40">
                      <span className="text-primary-muted">Estimated Cash Runway Shift:</span>
                      <strong className="text-primary font-mono font-semibold">
                        {isHighRisk ? '-8 Days (Down to 34 Days)' : '-2 Days (40 Days)'}
                      </strong>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-16 text-center text-primary-muted flex flex-col items-center justify-center">
                  <ShieldCheck className="w-12 h-12 text-primary-muted/40 mb-3" />
                  <p className="text-sm font-medium">Ready to Simulate</p>
                  <p className="text-xs text-primary-muted max-w-xs mt-1">
                    Fill in the proposed outflow on the left to inspect probability impact on working capital.
                  </p>
                </div>
              )}
            </div>

            {evaluated && (
              <div className="pt-4 border-t border-border/50">
                <Button
                  variant={isHighRisk ? 'secondary' : 'primary'}
                  className="w-full"
                  onClick={() => success('Approval Logged', 'Transaction marked as verified in procurement queue.')}
                >
                  {isHighRisk ? 'Log with Exception Approval' : 'Approve & Queue Transaction'}
                </Button>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
};

