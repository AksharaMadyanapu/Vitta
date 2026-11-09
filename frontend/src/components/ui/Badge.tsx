import React from 'react';
import { cn } from '@/utils/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'safe' | 'caution' | 'danger' | 'neutral' | 'accent';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'neutral',
  size = 'md',
  children,
  ...props
}) => {
  const variantStyles = {
    safe: "bg-[#ECFDF3] text-[#15803D] border border-[#D1FADF]",
    caution: "bg-[#FFFAEB] text-[#B45309] border border-[#FEDF89]",
    danger: "bg-[#FEF3F2] text-[#B42318] border border-[#FECDCA]",
    neutral: "bg-[#F3F4F6] text-[#4B5563] border border-[#E5E7EB]",
    accent: "bg-[#EEF2FF] text-[#2548C9] border border-[#C7D2FE]",
  };

  const sizeStyles = {
    sm: "text-[11px] px-2 py-0.5",
    md: "text-xs px-2.5 py-0.5",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center font-medium rounded-full",
        sizeStyles[size],
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
