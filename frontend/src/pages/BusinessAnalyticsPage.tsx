import React from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import { formatINR } from '@/utils/format';

export const BusinessAnalyticsPage: React.FC = () => {
  const recurringCosts = [
    { name: 'Factory staff salaries and operator wages', amount: 420000, share: '51%' },
    { name: 'Factory shed lease and maintenance', amount: 120000, share: '15%' },
    { name: 'Machinery term loan monthly EMI', amount: 115000, share: '14%' },
    { name: 'TSSPDCL factory electricity bill', amount: 95000, share: '12%' },
    { name: 'Statutory GST and professional taxes', amount: 70000, share: '8%' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        description="Key financial cycles and monthly fixed operating expenses for Deccan Precision Components."
      />

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Working capital cycle"
          value={56}
          isCurrency={false}
          suffix=" days"
          subtitle="Days cash is tied up in stock & bills"
        />
        <StatCard
          title="Time to collect from customers"
          value={48}
          isCurrency={false}
          suffix=" days"
          subtitle="Average collection time (DSO)"
        />
        <StatCard
          title="Time taken to pay suppliers"
          value={30}
          isCurrency={false}
          suffix=" days"
          subtitle="Average credit taken (DPO)"
        />
        <StatCard
          title="Monthly fixed factory costs"
          value={820000}
          subtitle="Salaries, rent, power, and loan EMIs"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Working capital explanation */}
        <Card>
          <div className="pb-3 border-b border-[#E5E7EB]">
            <h3 className="text-base font-semibold text-[#111827]">
              Where your working capital is tied up
            </h3>
            <p className="text-xs text-[#6B7280] mt-0.5">
              The cycle from buying raw materials to receiving cash from customer sales
            </p>
          </div>

          <div className="mt-5 space-y-4 text-sm">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[#111827] font-medium">Customer payment collection (DSO)</span>
                <span className="font-medium text-[#111827] tabular-nums">48 days</span>
              </div>
              <div className="w-full bg-[#F3F4F6] rounded-full h-2">
                <div className="bg-[#2548C9] h-2 rounded-full" style={{ width: '60%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[#111827] font-medium">Stock held in raw materials and finished parts (DIO)</span>
                <span className="font-medium text-[#111827] tabular-nums">38 days</span>
              </div>
              <div className="w-full bg-[#F3F4F6] rounded-full h-2">
                <div className="bg-[#6B7280] h-2 rounded-full" style={{ width: '48%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[#111827] font-medium">Credit given by suppliers (DPO)</span>
                <span className="font-medium text-[#111827] tabular-nums">30 days</span>
              </div>
              <div className="w-full bg-[#F3F4F6] rounded-full h-2">
                <div className="bg-[#9CA3AF] h-2 rounded-full" style={{ width: '38%' }} />
              </div>
            </div>

            <div className="p-3.5 rounded-[10px] bg-[#F9FAFB] border border-[#E5E7EB] text-xs text-[#4B5563] mt-4 leading-relaxed">
              <strong className="text-[#111827]">How to improve:</strong> If you collect from Kalyani and Varroc 6 days faster, your working capital cycle drops from 56 to 50 days, freeing about ₹6,20,000 in liquid bank balance.
            </div>
          </div>
        </Card>

        {/* Monthly fixed costs */}
        <Card>
          <div className="pb-3 border-b border-[#E5E7EB]">
            <h3 className="text-base font-semibold text-[#111827]">
              Monthly fixed factory expenses
            </h3>
            <p className="text-xs text-[#6B7280] mt-0.5">
              Expenses that occur every month regardless of sales volume (total ₹8.2L/mo)
            </p>
          </div>

          <div className="mt-4 divide-y divide-[#F3F4F6]">
            {recurringCosts.map((cost, idx) => (
              <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                <span className="text-[#111827] font-medium">{cost.name}</span>
                <div className="flex items-center gap-3">
                  <span className="font-medium text-[#111827] tabular-nums">
                    {formatINR(cost.amount)}
                  </span>
                  <span className="text-[#6B7280] w-8 text-right font-mono">
                    {cost.share}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
