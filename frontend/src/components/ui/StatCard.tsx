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
  bg?: 'white' | 'sand' | 'mint';
  subtitle?: string;
  statusVariant?: string;
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
  bg = 'white',
  subtitle,
  className,
  onClick,
}) => {
  const formattedAmount = isCurrency
    ? compactCurrency
      ? formatCompactINR(value)
      : formatINR(value)
    : `${prefix}${value.toLocaleString('en-IN')}${suffix}`;

  const bgClasses = {
    white: 'bg-white',
    sand: 'bg-[#F1E9DC]',
    mint: 'bg-[#CDEBDD]',
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "rounded-[24px] p-6 shadow-soft transition-all duration-250 flex flex-col justify-between",
        bgClasses[bg],
        onClick && "cursor-pointer hover:-translate-y-1 hover:shadow-soft-hover",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="text-xs font-semibold text-[#527A71] uppercase tracking-wider">
          {title}
        </span>
        {Icon && (
          <div className="w-9 h-9 rounded-full bg-[#0F3D33]/5 text-[#0F3D33] flex items-center justify-center shrink-0">
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="mt-3">
        {/* Rule 2: Fraunces serif for big numbers (36px, weight 600) */}
        <p className="text-[32px] sm:text-[36px] font-semibold font-serif text-[#0F3D33] tracking-tight tabular-nums leading-none">
          {formattedAmount}
        </p>
        {subtitle && (
          <p className="text-xs text-[#527A71] mt-2 font-medium">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};
