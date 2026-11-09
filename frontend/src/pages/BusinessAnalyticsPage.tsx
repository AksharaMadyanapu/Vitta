import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Percent,
  Clock,
  RefreshCw,
  PieChart,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { SkeletonStatCard, SkeletonChart } from '@/components/ui/Skeleton';
import { formatINR } from '@/utils/format';

export const BusinessAnalyticsPage: React.FC = () => {
  const [showSkeleton, setShowSkeleton] = useState(false);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Business Performance & Working Capital"
        description="Core financial efficiency metrics for Deccan Precision Components: Cash Conversion Cycle, DSO, DPO, and burn velocity."
        badge={
          <Badge variant="teal" size="sm">
            Cash Conversion Cycle: 56 Days
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
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <SkeletonStatCard />
            <SkeletonStatCard />
            <SkeletonStatCard />
            <SkeletonStatCard />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SkeletonChart height="h-80" />
            <SkeletonChart height="h-80" />
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Cash Conversion Cycle (CCC)"
              value={56}
              isCurrency={false}
              suffix=" Days"
              change={-4.5}
              changeLabel="cycle optimized"
              icon={Clock}
              variant="safe"
              subtitle="DIO (38) + DSO (48) - DPO (30)"
            />
            <StatCard
              title="Monthly Operating Burn"
              value={820000}
              compactCurrency
              change={2.1}
              changeLabel="vs last month"
              icon={TrendingUp}
              variant="blue"
              subtitle="Fixed costs + recurring overhead"
            />
            <StatCard
              title="Gross Contribution Margin"
              value={28.4}
              isCurrency={false}
              suffix="%"
              change={1.8}
              changeLabel="machining margin"
              icon={Percent}
              variant="teal"
              subtitle="Auto precision component lines"
            />
            <StatCard
              title="Current Ratio"
              value={1.68}
              isCurrency={false}
              suffix="x"
              change={3.2}
              changeLabel="liquidity strength"
              icon={BarChart3}
              variant="safe"
              subtitle="Liquid Assets / Short-term Debt"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Working Capital Breakdown */}
            <Card className="p-6">
              <div className="flex items-center justify-between pb-4 border-b border-border/50">
                <h3 className="text-base font-semibold text-primary">
                  Working Capital Days Breakdown
                </h3>
                <span className="text-xs text-primary-muted font-mono">Benchmark: 65 Days</span>
              </div>

              <div className="mt-6 space-y-4">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-primary font-medium">Days Sales Outstanding (DSO)</span>
                    <span className="font-mono text-accent-blue font-bold">48 Days</span>
                  </div>
                  <div className="w-full bg-elevated rounded-full h-2.5 overflow-hidden border border-border">
                    <div className="bg-accent-blue h-full rounded-full" style={{ width: '65%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-primary font-medium">Days Inventory Outstanding (DIO)</span>
                    <span className="font-mono text-accent-teal font-bold">38 Days</span>
                  </div>
                  <div className="w-full bg-elevated rounded-full h-2.5 overflow-hidden border border-border">
                    <div className="bg-accent-teal h-full rounded-full" style={{ width: '52%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-primary font-medium">Days Payable Outstanding (DPO)</span>
                    <span className="font-mono text-risk-caution font-bold">30 Days</span>
                  </div>
                  <div className="w-full bg-elevated rounded-full h-2.5 overflow-hidden border border-border">
                    <div className="bg-risk-caution h-full rounded-full" style={{ width: '42%' }} />
                  </div>
                </div>
              </div>

              <div className="mt-8 p-4 rounded-xl bg-elevated/50 border border-border/50 text-xs text-primary-muted">
                <strong className="text-primary">Optimization Insight:</strong> Accelerating Kalyani and Varroc payments by an average of 6 days would compress CCC from 56 to 50 days, liberating approx ₹6,20,000 in unlocked working capital.
              </div>
            </Card>

            {/* Monthly Operating Expense Profile */}
            <Card className="p-6">
              <div className="flex items-center justify-between pb-4 border-b border-border/50">
                <h3 className="text-base font-semibold text-primary">
                  Monthly Fixed vs Variable Outflow
                </h3>
                <Badge variant="neutral" size="sm">Monthly Run-Rate: ₹8.2L</Badge>
              </div>

              <div className="mt-6 space-y-3">
                {[
                  { name: 'Staff Salaries & Factory Wages', amount: 420000, pct: '51%', color: 'bg-accent-blue' },
                  { name: 'Factory Shed Lease & Maintenance', amount: 120000, pct: '15%', color: 'bg-accent-teal' },
                  { name: 'TSSPDCL Electricity & High-Tension Power', amount: 95000, pct: '12%', color: 'bg-risk-caution' },
                  { name: 'Machinery Term Loan EMI', amount: 115000, pct: '14%', color: 'bg-accent-blue/70' },
                  { name: 'Statutory GST & Professional Taxes', amount: 70000, pct: '8%', color: 'bg-primary-muted' },
                ].map((exp, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-elevated border border-border/50">
                    <div className="flex items-center gap-2.5">
                      <span className={`w-3 h-3 rounded-full ${exp.color}`} />
                      <span className="text-xs font-semibold text-primary">{exp.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono font-bold text-primary tabular-nums">
                        {formatINR(exp.amount)}
                      </span>
                      <span className="text-[11px] font-mono text-primary-muted w-10 text-right">
                        {exp.pct}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

