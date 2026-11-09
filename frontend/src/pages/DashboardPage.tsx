import React, { useState } from 'react';
import {
  Wallet,
  TrendingDown,
  ShieldCheck,
  Calendar,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Plus,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatCard } from '@/components/ui/StatCard';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { SkeletonStatCard, SkeletonChart, SkeletonTable } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';

export const DashboardPage: React.FC = () => {
  const [showSkeleton, setShowSkeleton] = useState(false);
  const { info } = useToast();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Executive Dashboard"
        description="Real-time liquidity, cash runway horizon, and projected shortfall alerts for Deccan Precision Components."
        badge={
          <Badge variant="safe" dot pulse>
            Runway Safe (42 Days)
          </Badge>
        }
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSkeleton(!showSkeleton)}
            >
              {showSkeleton ? "View Content" : "Preview Skeletons"}
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Sparkles className="w-4 h-4" />}
              onClick={() => info("Simulating Forecast", "Re-running 2000 Monte Carlo paths with latest receivables...")}
            >
              Run 60D Forecast
            </Button>
          </div>
        }
      />

      {showSkeleton ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <SkeletonStatCard />
            <SkeletonStatCard />
            <SkeletonStatCard />
            <SkeletonStatCard />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <SkeletonChart height="h-80" />
            </div>
            <div>
              <SkeletonTable rows={4} />
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Key Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Current Bank Balance"
              value={1845200}
              change={8.4}
              changeLabel="vs last week"
              icon={Wallet}
              variant="blue"
              subtitle="Across HDFC & SBI Current Accounts"
            />
            <StatCard
              title="Cash Runway Horizon"
              value={42}
              isCurrency={false}
              suffix=" Days"
              change={-3.1}
              changeLabel="burn acceleration"
              icon={Calendar}
              variant="safe"
              subtitle="Before next critical capex cycle"
            />
            <StatCard
              title="30-Day Shortfall Risk"
              value={18}
              isCurrency={false}
              suffix="%"
              change={-5.0}
              changeLabel="risk reduced"
              icon={ShieldCheck}
              variant="caution"
              subtitle="p50 buffer remains positive"
            />
            <StatCard
              title="Expected 30D Inflow"
              value={3240000}
              compactCurrency
              change={12.8}
              changeLabel="from 12 active customers"
              icon={TrendingDown}
              variant="teal"
              subtitle="Weighted by payment delay history"
            />
          </div>

          {/* Runway Chart Preview & Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-border/50 gap-2">
                <div>
                  <h3 className="text-base font-semibold text-primary">
                    60-Day Projected Liquidity Curve (p10 / p50 / p90)
                  </h3>
                  <p className="text-xs text-primary-muted mt-0.5">
                    Monte Carlo simulation using Indian MSME delay distribution
                  </p>
                </div>
                <Badge variant="blue" size="sm">
                  Confidence: 95%
                </Badge>
              </div>

              {/* Chart Placeholder / Visualizer */}
              <div className="py-8">
                <div className="h-64 flex flex-col justify-between relative bg-elevated/40 rounded-xl p-4 border border-border/40">
                  <div className="flex items-center justify-between text-xs text-primary-muted border-b border-border/40 pb-2">
                    <span>Upper Bound (p90): ₹38.2L</span>
                    <span className="text-accent-teal font-medium">Median (p50): ₹24.5L</span>
                    <span className="text-risk-caution font-medium">Pessimistic (p10): ₹6.8L</span>
                  </div>

                  <div className="flex-1 flex items-end justify-between gap-2 px-2 pt-6">
                    {[
                      { day: 'Today', val: 45, p10: 35 },
                      { day: 'Day 10', val: 55, p10: 40 },
                      { day: 'Day 20', val: 62, p10: 42 },
                      { day: 'Day 30', val: 48, p10: 25 },
                      { day: 'Day 40', val: 52, p10: 28 },
                      { day: 'Day 50', val: 70, p10: 38 },
                      { day: 'Day 60', val: 78, p10: 45 },
                    ].map((item, idx) => (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                        <div className="w-full flex items-end gap-1 h-full">
                          <div
                            style={{ height: `${item.p10}%` }}
                            className="w-1/2 bg-risk-caution/40 rounded-t border-t border-risk-caution/60"
                          />
                          <div
                            style={{ height: `${item.val}%` }}
                            className="w-1/2 bg-accent-blue/60 rounded-t border-t border-accent-blue"
                          />
                        </div>
                        <span className="text-[10px] text-primary-muted font-mono">{item.day}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-primary-muted pt-3 border-t border-border/40">
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded bg-accent-blue inline-block" /> p50 Median Inflow
                      <span className="w-2.5 h-2.5 rounded bg-risk-caution/60 inline-block ml-3" /> p10 Stress Floor
                    </span>
                    <span className="text-primary font-medium">Zero-cash breach: None in next 30 days</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Critical Actions Panel */}
            <Card className="p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-border/50">
                  <h3 className="text-base font-semibold text-primary">Immediate Risk Actions</h3>
                  <Badge variant="caution" size="sm">2 Pending</Badge>
                </div>
                <div className="mt-4 space-y-3">
                  <div className="p-3 rounded-xl bg-elevated border border-risk-caution/30">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-risk-caution-text">Follow Up Due Invoice</span>
                      <span className="text-[10px] text-primary-muted font-mono">2 days ago</span>
                    </div>
                    <p className="text-xs text-primary-muted mt-1">
                      Kalyani Powertrain ₹6.4L due. Delayed 8 days past usual average.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-elevated border border-accent-blue/30">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-accent-blue">GST Liability Provision</span>
                      <span className="text-[10px] text-primary-muted font-mono">Day 20</span>
                    </div>
                    <p className="text-xs text-primary-muted mt-1">
                      Projected ₹3.8L payout. Reserve is sufficient with current buffer.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-border/50">
                <Button variant="secondary" size="sm" className="w-full justify-between" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Explore Risk Alerts & Actions
                </Button>
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

