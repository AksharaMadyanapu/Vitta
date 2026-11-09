import React, { useEffect, useState } from 'react';
import { ArrowUpRight, ArrowDownRight, Minus, LucideIcon } from 'lucide-react';
import { Card } from './Card';
import { cn } from '@/utils/cn';
import { formatINR, formatCompactINR } from '@/utils/format';

export interface StatCardProps {
  title: string;
  value: number;
  isCurrency?: boolean;
  compactCurrency?: boolean;
  prefix?: string;
  suffix?: string;
  change?: number; // percentage change e.g. 12.5 or -4.2
  changeLabel?: string; // e.g. "vs last month"
  icon?: LucideIcon;
  variant?: 'default' | 'safe' | 'caution' | 'high' | 'blue' | 'teal';
  subtitle?: string;
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
  icon: Icon,
  variant = 'default',
  subtitle,
  className,
  onClick,
}) => {
  // Count-up animation
  const [displayValue, setDisplayValue] = useState<number>(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const duration = 900; // ms
    const startValue = 0;
    const endValue = value;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // ease-out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(startValue + (endValue - startValue) * easeProgress);

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setDisplayValue(endValue);
      }
    };

    window.requestAnimationFrame(step);
  }, [value]);

  const variantStyles = {
    default: {
      border: 'border-border',
      glow: 'none' as const,
      iconBg: 'bg-elevated text-primary',
    },
    blue: {
      border: 'border-accent-blue/30',
      glow: 'blue' as const,
      iconBg: 'bg-accent-blue/15 text-accent-blue',
    },
    teal: {
      border: 'border-accent-teal/30',
      glow: 'teal' as const,
      iconBg: 'bg-accent-teal/15 text-accent-teal',
    },
    safe: {
      border: 'border-risk-safe/30',
      glow: 'green' as const,
      iconBg: 'bg-risk-safe-bg text-risk-safe-text',
    },
    caution: {
      border: 'border-risk-caution/30',
      glow: 'amber' as const,
      iconBg: 'bg-risk-caution-bg text-risk-caution-text',
    },
    high: {
      border: 'border-risk-high/30',
      glow: 'red' as const,
      iconBg: 'bg-risk-high-bg text-risk-high-text',
    },
  };

  const style = variantStyles[variant];

  const formattedAmount = isCurrency
    ? compactCurrency
      ? formatCompactINR(displayValue)
      : formatINR(Math.round(displayValue))
    : `${prefix}${Math.round(displayValue).toLocaleString('en-IN')}${suffix}`;

  const isPositive = change !== undefined && change > 0;
  const isNegative = change !== undefined && change < 0;
  const isNeutral = change !== undefined && change === 0;

  return (
    <Card
      glow={style.glow}
      onClick={onClick}
      className={cn(
        "p-5 relative overflow-hidden transition-all duration-300",
        style.border,
        onClick && "cursor-pointer",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-primary-muted">
          {title}
        </span>
        {Icon && (
          <div className={cn("p-2 rounded-xl transition-colors", style.iconBg)}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-3">
        <div className="text-2xl font-bold tracking-tight text-primary tabular-nums">
          {formattedAmount}
        </div>

        {subtitle && (
          <p className="text-xs text-primary-muted mt-1 truncate">{subtitle}</p>
        )}

        {change !== undefined && (
          <div className="flex items-center gap-1.5 mt-3 text-xs">
            <span
              className={cn(
                "inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded font-medium tabular-nums",
                isPositive && "bg-risk-safe-bg text-risk-safe-text",
                isNegative && "bg-risk-high-bg text-risk-high-text",
                isNeutral && "bg-elevated text-primary-muted"
              )}
            >
              {isPositive && <ArrowUpRight className="w-3.5 h-3.5" />}
              {isNegative && <ArrowDownRight className="w-3.5 h-3.5" />}
              {isNeutral && <Minus className="w-3.5 h-3.5" />}
              {Math.abs(change).toFixed(1)}%
            </span>
            <span className="text-primary-muted/70 text-[11px] truncate">
              {changeLabel}
            </span>
          </div>
        )}
      </div>
    </Card>
  );
};

