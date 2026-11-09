import React from 'react';
import { cn } from '@/utils/cn';
import { formatINR, formatCompactINR } from '@/utils/format';

export interface StatCardProps {
  title: string;
  value: number;
  isCurrency?: boolean;
  compactCurrency?: boolean;
  prefix?: string;
  suffix?: string;
  change?: number; // percentage change
  changeLabel?: string; // e.g. "vs last month"
  subtitle?: string;
  statusVariant?: 'safe' | 'caution' | 'danger' | 'neutral';
  className?: string;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  isCurrency = true,
  compactCurrency = false,
  prefix = '',
  suffix = '',
  change,
  changeLabel = 'vs last month',
  subtitle,
  statusVariant,
  className,
  onClick,
}) => {
  const formattedAmount = isCurrency
    ? compactCurrency
      ? formatCompactINR(value)
      : formatINR(value)
    : `${prefix}${value.toLocaleString('en-IN')}${suffix}`;

  const isPositive = change !== undefined && change > 0;
  const isNegative = change !== undefined && change < 0;

  return (
    <div
      onClick={onClick}
      className={cn(
        "rounded-[10px] bg-white border border-[#E5E7EB] p-5 shadow-sm transition-colors duration-150 flex flex-col justify-between",
        onClick && "cursor-pointer hover:border-[#D1D5DB]",
        className
      )}
    >
      <div>
        <span className="text-xs font-medium text-[#6B7280]">
          {title}
        </span>
        <div className="text-2xl font-semibold tracking-tight text-[#111827] tabular-nums mt-1.5">
          {formattedAmount}
        </div>
      </div>

      {(subtitle || change !== undefined || statusVariant) && (
        <div className="flex items-center justify-between gap-2 mt-3 pt-3 border-t border-[#F3F4F6] text-xs">
          {subtitle && (
            <span className="text-[#6B7280] truncate">
              {subtitle}
            </span>
          )}

          {change !== undefined && (
            <span
              className={cn(
                "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium tabular-nums ml-auto shrink-0",
                isPositive && "bg-[#ECFDF3] text-[#15803D]",
                isNegative && "bg-[#FEF3F2] text-[#B42318]",
                !isPositive && !isNegative && "bg-[#F3F4F6] text-[#4B5563]"
              )}
            >
              {isPositive ? `+${change.toFixed(1)}%` : `${change.toFixed(1)}%`}
            </span>
          )}

          {statusVariant && !change && (
            <span
              className={cn(
                "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ml-auto shrink-0",
                statusVariant === 'safe' && "bg-[#ECFDF3] text-[#15803D]",
                statusVariant === 'caution' && "bg-[#FFFAEB] text-[#B45309]",
                statusVariant === 'danger' && "bg-[#FEF3F2] text-[#B42318]",
                statusVariant === 'neutral' && "bg-[#F3F4F6] text-[#4B5563]"
              )}
            >
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
