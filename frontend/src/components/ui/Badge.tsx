import React from 'react';
import { cn } from '@/utils/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'safe' | 'caution' | 'high' | 'blue' | 'teal' | 'neutral';
  size?: 'sm' | 'md';
  dot?: boolean;
  pulse?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'neutral',
  size = 'md',
  dot = false,
  pulse = false,
  children,
  ...props
}) => {
  const variantStyles = {
    safe: "bg-risk-safe-bg text-risk-safe-text border-risk-safe/30",
    caution: "bg-risk-caution-bg text-risk-caution-text border-risk-caution/30",
    high: "bg-risk-high-bg text-risk-high-text border-risk-high/30",
    blue: "bg-accent-blue/15 text-accent-blue border-accent-blue/30",
    teal: "bg-accent-teal/15 text-accent-teal border-accent-teal/30",
    neutral: "bg-elevated text-primary-muted border-border",
  };

  const dotColors = {
    safe: "bg-risk-safe",
    caution: "bg-risk-caution",
    high: "bg-risk-high",
    blue: "bg-accent-blue",
    teal: "bg-accent-teal",
    neutral: "bg-primary-muted",
  };

  const sizeStyles = {
    sm: "text-[11px] px-2 py-0.5 gap-1",
    md: "text-xs px-2.5 py-1 gap-1.5",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center font-medium rounded-full border transition-colors",
        sizeStyles[size],
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {dot && (
        <span className="relative flex h-2 w-2">
          {pulse && (
            <span
              className={cn(
                "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
                dotColors[variant]
              )}
            />
          )}
          <span
            className={cn("relative inline-flex rounded-full h-2 w-2", dotColors[variant])}
          />
        </span>
      )}
      {children}
    </span>
  );
};

