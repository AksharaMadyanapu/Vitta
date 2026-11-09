import React from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import { DataTable, Column } from '@/components/ui/DataTable';
import { formatINR } from '@/utils/format';

interface CustomerMetric {
  id: string;
  name: string;
  terms: number;
  paidInvoices: number;
  avgDelay: number;
  longestDelay: number;
  openBalance: number;
}

export const CustomerAnalyticsPage: React.FC = () => {
  const customerData: CustomerMetric[] = [
    {
      id: 'c-1',
      name: 'Sundaram Fasteners Ltd',
      terms: 45,
      paidInvoices: 18,
      avgDelay: 2,
      longestDelay: 7,
      openBalance: 840000,
    },
    {
      id: 'c-2',
      name: 'Kalyani Powertrain Ltd',
      terms: 30,
      paidInvoices: 14,
      avgDelay: 14,
      longestDelay: 28,
      openBalance: 640000,
    },
    {
      id: 'c-3',
      name: 'Varroc Engineering Components',
      terms: 60,
      paidInvoices: 9,
      avgDelay: 24,
      longestDelay: 45,
      openBalance: 1120000,
    },
    {
      id: 'c-4',
      name: 'Endurance Technologies Ltd',
      terms: 30,
      paidInvoices: 3,
      avgDelay: 8,
      longestDelay: 15,
      openBalance: 420000,
    },
    {
      id: 'c-5',
      name: 'Motherson Automotive Parts',
      terms: 45,
      paidInvoices: 22,
      avgDelay: 3,
      longestDelay: 11,
      openBalance: 590000,
    },
  ];

  const columns: Column<CustomerMetric>[] = [
    {
      key: 'name',
      header: 'Customer',
      sortable: true,
      render: (c) => (
        <div>
          <span className="font-medium text-[#111827]">{c.name}</span>
          <p className="text-xs text-[#6B7280]">{c.paidInvoices} past bills paid</p>
        </div>
      ),
    },
    {
      key: 'terms',
      header: 'Agreed terms',
      align: 'center',
      sortable: true,
      render: (c) => (
        <span className="text-xs text-[#374151]">
          {c.terms} days
        </span>
      ),
    },
    {
      key: 'avgDelay',
      header: 'Average payment delay',
      align: 'center',
      sortable: true,
      render: (c) => {
        if (c.avgDelay <= 3) {
          return <Badge variant="safe">On time (+{c.avgDelay}d)</Badge>;
        }
        if (c.avgDelay > 15) {
          return <Badge variant="danger">+{c.avgDelay} days late</Badge>;
        }
        return <Badge variant="caution">+{c.avgDelay} days late</Badge>;
      },
    },
    {
      key: 'longestDelay',
      header: 'Longest delay seen',
      align: 'center',
      sortable: true,
      render: (c) => (
        <span className="text-xs text-[#6B7280]">
          {c.longestDelay} days
        </span>
      ),
    },
    {
      key: 'openBalance',
      header: 'Amount owed now',
      align: 'right',
      sortable: true,
      render: (c) => (
        <span className="font-medium text-[#111827] tabular-nums">
          {formatINR(c.openBalance)}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payment behaviour"
        description="See how quickly your customers clear their bills compared to agreed credit terms."
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Average customer delay"
          value={9}
          isCurrency={false}
          suffix=" days late"
          subtitle="Better than industry average (18 days)"
          statusVariant="safe"
        />
        <StatCard
          title="Days to collect money (DSO)"
          value={48}
          isCurrency={false}
          suffix=" days"
          subtitle="From invoice to bank receipt"
        />
        <StatCard
          title="Tied up in late customer payments"
          value={1760000}
          subtitle="Kalyani and Varroc"
          statusVariant="caution"
        />
      </div>

      <Card>
        <div className="pb-3 border-b border-[#E5E7EB] mb-4">
          <h3 className="text-base font-semibold text-[#111827]">
            Customer payment track record
          </h3>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Based on 6 months of paid invoices for Deccan Precision Components
          </p>
        </div>

        <DataTable
          data={customerData}
          columns={columns}
          searchPlaceholder="Search customer payment history..."
          searchKey={(c) => c.name}
          pageSize={10}
        />
      </Card>
    </div>
  );
};
