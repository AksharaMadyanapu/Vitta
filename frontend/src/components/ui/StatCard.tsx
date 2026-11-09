import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/utils/cn';
import { formatINR, formatCompactINR } from '@/utils/format';

export interface StatCardProps {
  title: string;
  value: number;
  isCurrency?: boolean;
  compactCurrency?: boolean;
  prefix?: string;
  suffix?: string;
  icon?: LucideIcon;
  badgeTheme?: 'brand' | 'teal' | 'safe' | 'caution' | 'danger';
  change?: number; // percentage change
  changeLabel?: string;
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
  icon: Icon,
  badgeTheme = 'brand',
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

  const badgeStyles = {
    brand: 'bg-[#EEF0FD] text-[#3F3DDB]',
    teal: 'bg-[#E6F7F7] text-[#0EA5A4]',
    safe: 'bg-[#E8F7EE] text-[#15803D]',
    caution: 'bg-[#FFF4DB] text-[#B45309]',
    danger: 'bg-[#FDECEA] text-[#B42318]',
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "rounded-[14px] bg-white border border-[#E8EAF0] p-5 shadow-card transition-all duration-180 flex flex-col justify-between",
        onClick && "cursor-pointer hover:-translate-y-0.5 hover:shadow-card-hover hover:border-[#D8DAFA]",
        className
      )}
    >
      <div>
        {/* Header row: Label & 36px Coloured Icon Badge */}
        <div className="flex items-start justify-between gap-3">
          <span className="text-xs font-medium text-[#6B7280] leading-snug">
            {title}
          </span>
          {Icon && (
            <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0 shadow-sm", badgeStyles[badgeTheme])}>
              <Icon className="w-4 h-4" strokeWidth={2} />
            </div>
          )}
        </div>

        {/* Large 28px/600 Number */}
        <div className="text-[28px] font-semibold tracking-tight text-[#111827] tabular-nums mt-2">
          {formattedAmount}
        </div>
      </div>

      {/* Caption row */}
      {(subtitle || change !== undefined || statusVariant) && (
        <div className="flex items-center justify-between gap-2 mt-3 pt-3 border-t border-[#F1F2F6] text-xs">
          {subtitle && (
            <span className="text-[#6B7280] truncate">
              {subtitle}
            </span>
          )}

          {change !== undefined && (
            <span
              className={cn(
                "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium tabular-nums ml-auto shrink-0",
                isPositive && "bg-[#E8F7EE] text-[#15803D]",
                isNegative && "bg-[#FDECEA] text-[#B42318]",
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
                statusVariant === 'safe' && "bg-[#E8F7EE] text-[#15803D]",
                statusVariant === 'caution' && "bg-[#FFF4DB] text-[#B45309]",
                statusVariant === 'danger' && "bg-[#FDECEA] text-[#B42318]",
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
