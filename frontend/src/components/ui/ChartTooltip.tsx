import React from 'react';
import { formatINR } from '@/utils/format';
import { cn } from '@/utils/cn';

export interface ChartTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  isCurrency?: boolean;
}

export const ChartTooltip: React.FC<ChartTooltipProps> = ({
  active,
  payload,
  label,
  isCurrency = true,
}) => {
  if (!active || !payload || !payload.length) {
    return null;
  }

  return (
    <div className="rounded-lg border border-[#E5E7EB] bg-white p-2.5 shadow-sm text-xs min-w-[140px]">
      {label && (
        <div className="font-medium text-[#6B7280] pb-1.5 mb-1.5 border-b border-[#F3F4F6]">
          {label}
        </div>
      )}
      <div className="space-y-1">
        {payload.map((item, index) => {
          const val = typeof item.value === 'number'
            ? (isCurrency ? formatINR(item.value) : item.value.toLocaleString())
            : item.value;

          return (
            <div key={`tooltip-${index}`} className="flex items-center justify-between gap-3">
              <span className="text-[#6B7280]">
                {item.name}
              </span>
              <span className="font-medium text-[#111827] tabular-nums">
                {val}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
