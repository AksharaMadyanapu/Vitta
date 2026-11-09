import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { Play } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { DataTable, Column } from '@/components/ui/DataTable';
import { ChartTooltip } from '@/components/ui/ChartTooltip';
import { formatINR } from '@/utils/format';
import { useToast } from '@/components/ui/Toast';

interface DriverItem {
  id: string;
  rank: number;
  description: string;
  date: string;
  amount: number;
  impact: string;
}

export const ForecastPage: React.FC = () => {
  const [horizon, setHorizon] = useState<14 | 30 | 60>(30);
  const [isSimulating, setIsSimulating] = useState(false);
  const { success } = useToast();

  const handleRunForecast = () => {
    setIsSimulating(true);
    setTimeout(() => {
      setIsSimulating(false);
      success('Forecast updated', 'Simulated 2,000 cash paths based on past customer delays.');
    }, 800);
  };

  const data14 = [
    { day: 'Today', balance: 1845200 },
    { day: 'Day 2', balance: 1820000 },
    { day: 'Day 4', balance: 1800000 },
    { day: 'Day 6', balance: 1780000 },
    { day: 'Day 8', balance: 2420000 },
    { day: 'Day 10', balance: 2840000 },
    { day: 'Day 12', balance: 2750000 },
    { day: 'Day 14', balance: 2680000 },
  ];

  const data30 = [
    { day: 'Today', balance: 1845200 },
    { day: 'Day 5', balance: 1790000 },
    { day: 'Day 10', balance: 2850000 },
    { day: 'Day 15', balance: 1990000 },
    { day: 'Day 20', balance: 1530000 },
    { day: 'Day 25', balance: 995000 },
    { day: 'Day 30', balance: 1920000 },
  ];

  const data60 = [
    { day: 'Today', balance: 1845200 },
    { day: 'Day 10', balance: 2850000 },
    { day: 'Day 20', balance: 1530000 },
    { day: 'Day 30', balance: 1920000 },
    { day: 'Day 40', balance: 1450000 },
    { day: 'Day 50', balance: 2100000 },
    { day: 'Day 60', balance: 2750000 },
  ];

  const activeData = horizon === 14 ? data14 : horizon === 30 ? data30 : data60;

  const topDrivers: DriverItem[] = [
    {
      id: 'd-1',
      rank: 1,
      description: 'Tata Steel raw material bill payment',
      date: '20 Nov 2026',
      amount: 480000,
      impact: 'Large bill to pay',
    },
    {
      id: 'd-2',
      rank: 2,
      description: 'GST tax payment (monthly output tax)',
      date: '20 Nov 2026',
      amount: 380000,
      impact: 'Fixed tax liability',
    },
    {
      id: 'd-3',
      rank: 3,
      description: 'Kalyani Powertrain customer payment delay',
      date: '16 Nov 2026',
      amount: 640000,
      impact: 'Usually pays 14 days late',
    },
    {
      id: 'd-4',
      rank: 4,
      description: 'Staff salaries and factory wages',
      date: '1 Dec 2026',
      amount: 420000,
      impact: 'Monthly payroll',
    },
    {
      id: 'd-5',
      rank: 5,
      description: 'Hindalco raw material bill payment',
      date: '25 Nov 2026',
      amount: 220000,
      impact: 'Supplier bill',
    },
  ];

  const columns: Column<DriverItem>[] = [
    {
      key: 'rank',
      header: '#',
      align: 'center',
      className: 'w-10 text-xs text-[#6B7280]',
      render: (item) => <span className="font-medium text-[#6B7280]">{item.rank}</span>,
    },
    {
      key: 'description',
      header: 'Transaction',
      render: (item) => (
        <div>
          <span className="font-medium text-[#111827]">{item.description}</span>
          <p className="text-xs text-[#6B7280]">{item.impact}</p>
        </div>
      ),
    },
    {
      key: 'date',
      header: 'Scheduled date',
      className: 'text-xs text-[#6B7280]',
    },
    {
      key: 'amount',
      header: 'Amount',
      align: 'right',
      render: (item) => (
        <span className="font-medium text-[#111827] tabular-nums">
          {formatINR(item.amount)}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cash forecast"
        description="Predict your bank balance over the next 14, 30, or 60 days to prevent cash shortages."
        action={
          <Button
            variant="primary"
            isLoading={isSimulating}
            onClick={handleRunForecast}
            leftIcon={<Play className="w-4 h-4" />}
          >
            Update forecast
          </Button>
        }
      />

      {/* Horizon selector buttons */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-[#6B7280] mr-1">
          Time window:
        </span>
        {([14, 30, 60] as const).map((h) => (
          <button
            key={h}
            onClick={() => setHorizon(h)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              horizon === h
                ? 'bg-[#2548C9] text-white'
                : 'bg-white border border-[#E5E7EB] text-[#374151] hover:bg-[#F9FAFB]'
            }`}
          >
            {h} days
          </button>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title={`Shortage risk (next ${horizon} days)`}
          value={horizon === 14 ? 4 : horizon === 30 ? 18 : 34}
          isCurrency={false}
          suffix="%"
          subtitle={horizon === 60 ? "Moderate risk around day 44" : "Low risk of running short"}
          statusVariant={horizon === 60 ? 'caution' : 'safe'}
        />
        <StatCard
          title="Lowest expected bank balance"
          value={horizon === 14 ? 1780000 : horizon === 30 ? 995000 : 850000}
          subtitle="Buffer stays above zero"
        />
        <StatCard
          title="Expected balance at end of period"
          value={horizon === 14 ? 2680000 : horizon === 30 ? 1920000 : 2750000}
          subtitle="Net cash remains positive"
          statusVariant="safe"
        />
      </div>

      {/* Simple quiet forecast chart */}
      <Card>
        <div className="pb-3 border-b border-[#E5E7EB]">
          <h3 className="text-base font-semibold text-[#111827]">
            Projected cash balance ({horizon} days)
          </h3>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Single-line estimate based on current bank balances and expected payment delays
          </p>
        </div>

        <div className="pt-4 h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={activeData} margin={{ top: 8, right: 12, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
              <XAxis
                dataKey="day"
                stroke="#9CA3AF"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#E5E7EB' }}
              />
              <YAxis
                stroke="#9CA3AF"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `₹${(val / 100000).toFixed(0)}L`}
              />
              <Tooltip content={<ChartTooltip />} />
              <Line
                type="monotone"
                dataKey="balance"
                name="Expected cash"
                stroke="#2548C9"
                strokeWidth={2}
                dot={{ r: 3, fill: '#2548C9' }}
                activeDot={{ r: 5, fill: '#2548C9', stroke: '#FFFFFF', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Top 5 Transactions with biggest cash impact */}
      <Card>
        <div className="pb-3 border-b border-[#E5E7EB] mb-3">
          <h3 className="text-base font-semibold text-[#111827]">
            Transactions with the biggest impact on your cash
          </h3>
          <p className="text-xs text-[#6B7280] mt-0.5">
            These upcoming bills or customer delays have the largest effect on your cash balance
          </p>
        </div>

        <DataTable
          data={topDrivers}
          columns={columns}
          pageSize={5}
        />
      </Card>
    </div>
  );
};
