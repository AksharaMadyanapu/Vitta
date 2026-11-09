import React, { useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatINR } from '@/utils/format';
import { useToast } from '@/components/ui/Toast';

export const PreTransactionPage: React.FC = () => {
  const [amount, setAmount] = useState<number>(350000);
  const [description, setDescription] = useState('New CNC lathe tooling kit');
  const [vendor, setVendor] = useState('Sandvik Coromant India');
  const [targetDate, setTargetDate] = useState('2026-11-22');
  const [evaluated, setEvaluated] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const { success } = useToast();

  const handleEvaluate = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEvaluating(true);
    setTimeout(() => {
      setIsEvaluating(false);
      setEvaluated(true);
      success('Check complete', 'Checked this payment against your expected bills and cash.');
    }, 600);
  };

  const causesShortage = amount > 500000;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Check a purchase"
        description="Check whether a planned payment will cause a cash shortage before you confirm it."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form Card */}
        <Card>
          <div className="pb-3 border-b border-[#E5E7EB] mb-4">
            <h3 className="text-base font-semibold text-[#111827]">
              Enter planned payment details
            </h3>
            <p className="text-xs text-[#6B7280] mt-0.5">
              We will compare this payment against your scheduled bills and incoming payments.
            </p>
          </div>

          <form onSubmit={handleEvaluate} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#374151] mb-1">
                Payment amount (₹)
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
                  placeholder="350000"
                  className="w-full pl-7 pr-3 py-2 bg-white border border-[#E5E7EB] rounded-lg text-sm text-[#111827] focus:outline-none focus:border-[#2548C9]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#374151] mb-1">
                Supplier or payee
              </label>
              <input
                type="text"
                value={vendor}
                onChange={(e) => setVendor(e.target.value)}
                required
                placeholder="e.g. Tata Steel BSL Ltd"
                className="w-full px-3 py-2 bg-white border border-[#E5E7EB] rounded-lg text-sm text-[#111827] focus:outline-none focus:border-[#2548C9]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#374151] mb-1">
                What is this for?
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                placeholder="e.g. Raw material batch"
                className="w-full px-3 py-2 bg-white border border-[#E5E7EB] rounded-lg text-sm text-[#111827] focus:outline-none focus:border-[#2548C9]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#374151] mb-1">
                Planned payment date
              </label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                required
                className="w-full px-3 py-2 bg-white border border-[#E5E7EB] rounded-lg text-sm text-[#111827] focus:outline-none focus:border-[#2548C9]"
              />
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                className="w-full"
                isLoading={isEvaluating}
              >
                Check cash impact
              </Button>
            </div>
          </form>
        </Card>

        {/* Results Card */}
        <Card className="flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
              <h3 className="text-base font-semibold text-[#111827]">
                Result
              </h3>
              {evaluated && (
                <Badge variant={causesShortage ? 'danger' : 'safe'}>
                  {causesShortage ? 'Shortage risk' : 'Safe to proceed'}
                </Badge>
              )}
            </div>

            {evaluated ? (
              <div className="mt-5 space-y-4">
                <div
                  className={`p-4 rounded-[10px] border ${
                    causesShortage
                      ? 'bg-[#FEF3F2] border-[#FECDCA]'
                      : 'bg-[#ECFDF3] border-[#D1FADF]'
                  }`}
                >
                  <h4
                    className={`text-sm font-semibold ${
                      causesShortage ? 'text-[#B42318]' : 'text-[#15803D]'
                    }`}
                  >
                    {causesShortage
                      ? 'This payment may cause a cash shortage'
                      : 'This payment is safe to make'}
                  </h4>
                  <p className="text-xs text-[#4B5563] mt-1.5 leading-relaxed">
                    {causesShortage
                      ? `Paying ${formatINR(amount)} on ${targetDate} leaves you short of cash because of the upcoming GST payment on 20 Nov. Consider delaying this by 7 days or asking for a split payment.`
                      : `After paying ${formatINR(amount)} on ${targetDate}, your bank balance is expected to stay at or above ₹6,45,000.`}
                  </p>
                </div>

                <div className="space-y-2 text-sm pt-2">
                  <div className="flex items-center justify-between py-1.5 border-b border-[#F3F4F6]">
                    <span className="text-[#6B7280]">Current bank balance:</span>
                    <strong className="text-[#111827] font-medium tabular-nums">₹18,45,200</strong>
                  </div>
                  <div className="flex items-center justify-between py-1.5 border-b border-[#F3F4F6]">
                    <span className="text-[#6B7280]">Expected balance after payment:</span>
                    <strong className="text-[#111827] font-medium tabular-nums">
                      {formatINR(1845200 - amount)}
                    </strong>
                  </div>
                  <div className="flex items-center justify-between py-1.5">
                    <span className="text-[#6B7280]">Lowest balance in next 30 days:</span>
                    <strong className={causesShortage ? "text-[#B42318] font-medium tabular-nums" : "text-[#111827] font-medium tabular-nums"}>
                      {causesShortage ? "Negative (Shortage)" : "₹6,45,000"}
                    </strong>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-16 text-center text-[#6B7280]">
                <p className="text-sm font-medium text-[#111827]">No payment tested yet</p>
                <p className="text-xs text-[#6B7280] mt-1 max-w-xs mx-auto">
                  Fill in the details on the left and click "Check cash impact" to see how it affects your bank balance.
                </p>
              </div>
            )}
          </div>

          {evaluated && (
            <div className="pt-4 border-t border-[#E5E7EB]">
              <Button
                variant={causesShortage ? 'secondary' : 'primary'}
                className="w-full"
                onClick={() => success('Saved', 'Recorded this planned payment in your schedule.')}
              >
                {causesShortage ? 'Save as planned draft' : 'Confirm and schedule payment'}
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
