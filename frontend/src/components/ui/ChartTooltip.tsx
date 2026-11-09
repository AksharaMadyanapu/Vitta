import React from 'react';
import { formatINR } from '@/utils/format';
import { cn } from '@/utils/cn';

export interface ChartTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  isCurrency?: boolean;
  titlePrefix?: string;
}

export const ChartTooltip: React.FC<ChartTooltipProps> = ({
  active,
  payload,
  label,
  isCurrency = true,
  titlePrefix = '',
}) => {
  if (!active || !payload || !payload.length) {
    return null;
  }

  return (
    <div className="rounded-xl border border-border bg-elevated/95 backdrop-blur-md p-3 shadow-2xl min-w-[170px] text-xs">
      {label && (
        <div className="font-semibold text-primary pb-2 mb-2 border-b border-border/60">
          {titlePrefix}{label}
        </div>
      )}
      <div className="space-y-1.5">
        {payload.map((item, index) => {
          const val = typeof item.value === 'number'
            ? (isCurrency ? formatINR(item.value) : item.value.toLocaleString())
            : item.value;

          return (
            <div key={`tooltip-item-${index}`} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-1.5 min-w-0">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: item.color || item.fill || '#3B82F6' }}
                />
                <span className="text-primary-muted truncate">
                  {item.name}
                </span>
              </div>
              <span className="font-semibold text-primary tabular-nums">
                {val}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

