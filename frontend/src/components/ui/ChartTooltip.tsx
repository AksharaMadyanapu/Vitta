import React from 'react';
import { formatINR } from '@/utils/format';

interface ChartTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

export const ChartTooltip: React.FC<ChartTooltipProps> = ({
  active,
  payload,
  label,
}) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="rounded-[16px] bg-white p-3.5 shadow-soft-hover border-none text-xs text-[#0F3D33] space-y-1.5 min-w-[140px]">
      <p className="font-semibold text-[#527A71] text-[11px] uppercase tracking-wider">{label}</p>
      {payload.map((entry, index) => {
        const val = typeof entry.value === 'number' ? formatINR(entry.value) : entry.value;
        const color = entry.color || '#0F3D33';
        return (
          <div key={`item-${index}`} className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-1.5 font-medium text-[#527A71]">
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: color }}
              />
              {entry.name || 'Balance'}
            </span>
            <span className="font-semibold font-serif tabular-nums text-[#0F3D33]">
              {val}
            </span>
          </div>
        );
      })}
    </div>
  );
};
