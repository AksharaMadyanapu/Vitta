import React from 'react';
import { cn } from '@/utils/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'safe' | 'caution' | 'danger' | 'neutral' | 'brand' | 'teal';
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
    safe: "bg-[#E8F7EE] text-[#15803D] border border-[#C6F0D4]",
    caution: "bg-[#FFF4DB] text-[#B45309] border border-[#FFE5A3]",
    danger: "bg-[#FDECEA] text-[#B42318] border border-[#FAC7C3]",
    neutral: "bg-[#F3F4F6] text-[#4B5563] border border-[#E8EAF0]",
    brand: "bg-[#EEF0FD] text-[#3F3DDB] border border-[#D8DAFA]",
    teal: "bg-[#E6F7F7] text-[#0EA5A4] border border-[#B2EBEB]",
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
