import React, { useState } from 'react';
import {
  LineChart as LineChartIcon,
  Play,
  RotateCcw,
  Sparkles,
  AlertTriangle,
  Info,
  Calendar,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { SkeletonStatCard, SkeletonChart, SkeletonTable } from '@/components/ui/Skeleton';
import { formatINR } from '@/utils/format';
import { useToast } from '@/components/ui/Toast';

export const ForecastPage: React.FC = () => {
  const [horizon, setHorizon] = useState<14 | 30 | 60>(30);
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const { success } = useToast();

  const handleRunSimulation = () => {
    setIsSimulating(true);
    setTimeout(() => {
      setIsSimulating(false);
      success('2,000 Monte Carlo Simulations Complete', 'Refreshed p10/p50/p90 curves in 1.4s.');
    }, 1200);
  };

  const topContributing = [
    {
      id: 'tx-cf-1',
      date: '2026-11-20',
      description: 'Tata Steel Raw Material Outflow',
      type: 'payable',
      amount: 480000,
      shortfallImpact: '+42% risk contribution',
    },
    {
      id: 'tx-cf-2',
      date: '2026-11-20',
      description: 'GST Monthly Output Liability (GSTR-3B)',
      type: 'recurring',
      amount: 380000,
      shortfallImpact: '+31% risk contribution',
    },
    {
      id: 'tx-cf-3',
      date: '2026-11-16',
      description: 'Kalyani Powertrain Receivable Delay (Expected +14d)',
      type: 'receivable',
      amount: 640000,
      shortfallImpact: '+18% risk contribution',
    },
    {
      id: 'tx-cf-4',
      date: '2026-12-01',
      description: 'Monthly Staff Salaries & Factory Wages',
      type: 'recurring',
      amount: 420000,
      shortfallImpact: '+12% risk contribution',
    },
    {
      id: 'tx-cf-5',
      date: '2026-11-25',
      description: 'Hindalco Extrusions Supplier Payment',
      type: 'payable',
      amount: 220000,
      shortfallImpact: '+8% risk contribution',
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Monte Carlo Cash-Flow Forecast"
        description="Vectorized simulation engine (2,000 runs) evaluating liquidity paths, shortfall probabilities, and counterfactual transaction drivers."
        badge={
          <Badge variant="blue" dot pulse>
            2,000 Paths · Under 2s SLA
          </Badge>
        }
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSkeleton(!showSkeleton)}
            >
              {showSkeleton ? 'View Content' : 'Preview Skeletons'}
            </Button>
            <Button
              variant="primary"
              size="sm"
              isLoading={isSimulating}
              leftIcon={<Play className="w-4 h-4" />}
              onClick={handleRunSimulation}
            >
              Run 2,000 Simulations
            </Button>
          </div>
        }
      />

      {/* Horizon selector buttons */}
      <div className="flex items-center gap-3">
        <span className="text-xs font-semibold text-primary-muted uppercase tracking-wider">
          Horizon:
        </span>
        {([14, 30, 60] as const).map((h) => (
          <button
            key={h}
            onClick={() => setHorizon(h)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              horizon === h
                ? 'bg-accent-blue text-white shadow-lg shadow-accent-blue/20'
                : 'bg-elevated text-primary-muted hover:text-primary hover:bg-elevated-hover border border-border'
            }`}
          >
            {h} Days
          </button>
        ))}
      </div>

      {showSkeleton ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <SkeletonStatCard />
            <SkeletonStatCard />
            <SkeletonStatCard />
            <SkeletonStatCard />
          </div>
          <SkeletonChart height="h-80" />
          <SkeletonTable rows={5} />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title={`${horizon}-Day Shortfall Probability`}
              value={horizon === 14 ? 4 : horizon === 30 ? 18 : 34}
              isCurrency={false}
              suffix="%"
              change={-2.4}
              changeLabel="from prior run"
              icon={AlertTriangle}
              variant={horizon === 60 ? 'caution' : 'safe'}
              subtitle="P(Balance < ₹0 in window)"
            />
            <StatCard
              title="First Projected Shortfall"
              value={horizon === 60 ? 44 : 0}
              isCurrency={false}
              suffix={horizon === 60 ? "th Day" : "None"}
              icon={Calendar}
              variant={horizon === 60 ? 'caution' : 'safe'}
              subtitle={horizon === 60 ? "Projected ₹2.4L deficit" : "Zero shortfall in period"}
            />
            <StatCard
              title="P50 Median Ending Balance"
              value={horizon === 14 ? 1920000 : horizon === 30 ? 2450000 : 3100000}
              change={7.8}
              changeLabel="expected trajectory"
              icon={LineChartIcon}
              variant="teal"
              subtitle="50th percentile outcome"
            />
            <StatCard
              title="P10 Stress-Floor Balance"
              value={horizon === 14 ? 1120000 : horizon === 30 ? 680000 : 120000}
              change={-8.1}
              changeLabel="conservative floor"
              icon={AlertTriangle}
              variant="blue"
              subtitle="Worst 10% empirical paths"
            />
          </div>

          {/* Simulation Graph visualizer */}
          <Card className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-border/50 gap-2">
              <div>
                <h3 className="text-base font-semibold text-primary">
                  {horizon}-Day Monte Carlo Path Envelope
                </h3>
                <p className="text-xs text-primary-muted mt-0.5">
                  Bootstrapped from Deccan Precision’s 6-month transaction and delay history
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 text-xs text-primary-muted">
                  <span className="w-2.5 h-2.5 rounded-full bg-accent-blue" /> p50
                  <span className="w-2.5 h-2.5 rounded-full bg-accent-teal ml-2" /> p90
                  <span className="w-2.5 h-2.5 rounded-full bg-risk-caution ml-2" /> p10
                </span>
              </div>
            </div>

            <div className="py-6">
              <div className="h-64 flex flex-col justify-between bg-elevated/40 rounded-xl p-4 border border-border/40">
                <div className="flex items-center justify-between text-xs text-primary-muted border-b border-border/40 pb-2">
                  <span>Current Baseline: {formatINR(1845200)}</span>
                  <span className="text-accent-teal font-semibold">Max p90: ₹42.5L</span>
                  <span className="text-risk-caution font-semibold">Min p10: ₹1.2L</span>
                </div>

                <div className="flex-1 flex items-end justify-between gap-1 px-4 pt-4">
                  {Array.from({ length: horizon === 14 ? 14 : horizon === 30 ? 20 : 30 }).map((_, i) => {
                    const progress = i / (horizon === 14 ? 14 : horizon === 30 ? 20 : 30);
                    const p10Height = Math.max(15, 60 - progress * 40 + Math.sin(i) * 10);
                    const p50Height = Math.max(25, 60 + Math.sin(i * 0.8) * 20);
                    const p90Height = Math.min(95, 75 + progress * 20);

                    return (
                      <div key={i} className="flex-1 flex flex-col items-center h-full justify-end group">
                        <div className="w-full relative flex items-end justify-center h-full">
                          {/* p90 bar */}
                          <div
                            style={{ height: `${p90Height}%` }}
                            className="w-full bg-accent-teal/15 rounded-t"
                          />
                          {/* p50 bar */}
                          <div
                            style={{ height: `${p50Height}%` }}
                            className="w-3/4 absolute bottom-0 bg-accent-blue/50 rounded-t border-t border-accent-blue"
                          />
                          {/* p10 bar */}
                          <div
                            style={{ height: `${p10Height}%` }}
                            className="w-1/2 absolute bottom-0 bg-risk-caution/60 rounded-t border-t border-risk-caution"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between text-[11px] text-primary-muted pt-3 border-t border-border/40">
                  <span>Day 1 (Today)</span>
                  <span>Day {Math.round(horizon / 2)}</span>
                  <span>Day {horizon}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Top 5 Contributing Transactions */}
          <Card className="p-6">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-border/50">
              <div>
                <h3 className="text-base font-semibold text-primary">
                  Top 5 Contributing Drivers (Counterfactual Resimulation)
                </h3>
                <p className="text-xs text-primary-muted mt-0.5">
                  Transactions whose timing or delay shifts greatest risk into the shortfall window
                </p>
              </div>
              <Badge variant="caution" size="sm">
                Counterfactual Analysis
              </Badge>
            </div>

            <div className="space-y-3">
              {topContributing.map((item, idx) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl bg-elevated border border-border flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-surface border border-border flex items-center justify-center text-xs font-bold font-mono text-primary">
                      #{idx + 1}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-primary">
                        {item.description}
                      </p>
                      <span className="text-xs text-primary-muted font-mono">
                        Date: {item.date} · {formatINR(item.amount)}
                      </span>
                    </div>
                  </div>

                  <span className="text-xs font-semibold text-risk-caution-text px-2.5 py-1 rounded-lg bg-risk-caution-bg border border-risk-caution/30">
                    {item.shortfallImpact}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}
    </div>
  );
};

