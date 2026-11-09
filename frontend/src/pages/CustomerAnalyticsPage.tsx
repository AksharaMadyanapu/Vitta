import React, { useState } from 'react';
import {
  TrendingUp,
  Clock,
  Sparkles,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { DataTable, Column } from '@/components/ui/DataTable';
import { SkeletonStatCard, SkeletonChart, SkeletonTable } from '@/components/ui/Skeleton';
import { formatINR } from '@/utils/format';

interface CustomerDelayMetric {
  id: string;
  name: string;
  paidCount: number;
  avgDelay: number;
  medianDelay: number;
  maxDelay: number;
  blendWithGlobal: boolean;
  reliabilityScore: number;
  status: 'safe' | 'caution' | 'high';
}

export const CustomerAnalyticsPage: React.FC = () => {
  const [showSkeleton, setShowSkeleton] = useState(false);

  const customerData: CustomerDelayMetric[] = [
    {
      id: 'c-1',
      name: 'Sundaram Fasteners Auto Components',
      paidCount: 18,
      avgDelay: 2.1,
      medianDelay: 1.0,
      maxDelay: 7,
      blendWithGlobal: false,
      reliabilityScore: 96,
      status: 'safe',
    },
    {
      id: 'c-2',
      name: 'Kalyani Powertrain Ltd',
      paidCount: 14,
      avgDelay: 14.2,
      medianDelay: 12.0,
      maxDelay: 28,
      blendWithGlobal: false,
      reliabilityScore: 68,
      status: 'caution',
    },
    {
      id: 'c-3',
      name: 'Varroc Engineering Components',
      paidCount: 9,
      avgDelay: 24.5,
      medianDelay: 22.0,
      maxDelay: 45,
      blendWithGlobal: false,
      reliabilityScore: 42,
      status: 'high',
    },
    {
      id: 'c-4',
      name: 'Endurance Technologies Casting',
      paidCount: 3,
      avgDelay: 8.0,
      medianDelay: 6.0,
      maxDelay: 15,
      blendWithGlobal: true, // fewer than 5 paid invoices, blend with global distribution
      reliabilityScore: 75,
      status: 'caution',
    },
    {
      id: 'c-5',
      name: 'Motherson Sumi Wiring',
      paidCount: 22,
      avgDelay: 3.5,
      medianDelay: 3.0,
      maxDelay: 11,
      blendWithGlobal: false,
      reliabilityScore: 92,
      status: 'safe',
    },
  ];

  const columns: Column<CustomerDelayMetric>[] = [
    {
      key: 'name',
      header: 'Customer Name',
      sortable: true,
      render: (c) => (
        <div>
          <span className="font-semibold text-primary">{c.name}</span>
          {c.blendWithGlobal && (
            <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-accent-blue/15 text-accent-blue border border-accent-blue/30 font-medium">
              &lt; 5 Invoices (Blended Prior)
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'paidCount',
      header: 'Paid Invoices',
      align: 'center',
      sortable: true,
      render: (c) => <span className="font-mono text-xs">{c.paidCount}</span>,
    },
    {
      key: 'avgDelay',
      header: 'Mean Delay',
      align: 'center',
      sortable: true,
      render: (c) => (
        <span className="font-mono text-xs">+{c.avgDelay.toFixed(1)}d</span>
      ),
    },
    {
      key: 'medianDelay',
      header: 'Median (p50)',
      align: 'center',
      sortable: true,
      render: (c) => (
        <span className="font-mono text-xs font-semibold text-accent-teal">
          +{c.medianDelay.toFixed(1)}d
        </span>
      ),
    },
    {
      key: 'maxDelay',
      header: 'Tail Risk (Max)',
      align: 'center',
      sortable: true,
      render: (c) => (
        <span className="font-mono text-xs text-risk-high">
          +{c.maxDelay}d
        </span>
      ),
    },
    {
      key: 'reliabilityScore',
      header: 'Reliability Index',
      align: 'right',
      sortable: true,
      render: (c) => (
        <div className="flex items-center justify-end gap-2">
          <span className="font-mono text-xs font-bold">{c.reliabilityScore}/100</span>
          <Badge variant={c.status} size="sm" dot />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customer Payment Behaviour Analytics"
        description="Empirical bootstrap distributions of past payment delays used by the Monte Carlo forecast engine to predict settlement timing."
        badge={
          <Badge variant="blue" size="sm">
            Empirical Delay Distributions
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SkeletonStatCard />
            <SkeletonStatCard />
            <SkeletonStatCard />
          </div>
          <SkeletonTable rows={5} />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              title="Portfolio Average Delay"
              value={9.4}
              isCurrency={false}
              suffix=" Days"
              change={-1.2}
              changeLabel="delay contraction"
              icon={Clock}
              variant="blue"
              subtitle="Industry benchmark: 18.5 days"
            />
            <StatCard
              title="DSO (Days Sales Outstanding)"
              value={48}
              isCurrency={false}
              suffix=" Days"
              change={-4.0}
              changeLabel="cash collected faster"
              icon={TrendingUp}
              variant="safe"
              subtitle="Target: under 45 days"
            />
            <StatCard
              title="High-Delay Exposure"
              value={1680000}
              compactCurrency
              change={8.5}
              changeLabel="Varroc Engineering"
              icon={AlertTriangle}
              variant="high"
              subtitle="Customers with avg delay > 20 days"
            />
          </div>

          <Card className="p-6">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-border/50">
              <div>
                <h3 className="text-base font-semibold text-primary">
                  Customer Empirical Delay Metrics
                </h3>
                <p className="text-xs text-primary-muted mt-0.5">
                  Customers with &lt; 5 past payments are blended with the global manufacturing prior
                </p>
              </div>
            </div>

            <DataTable
              data={customerData}
              columns={columns}
              searchPlaceholder="Search customer payment profiles..."
              pageSize={10}
            />
          </Card>
        </>
      )}
    </div>
  );
};

