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
  // Rule 6: Status chips with soft mint, butter yellow, coral backgrounds and small matching dot
  const variantStyles = {
    safe: {
      wrap: "bg-[#CDEBDD] text-[#0F3D33]",
      dot: "bg-[#1C6B56]",
    },
    caution: {
      wrap: "bg-[#FFE8A3] text-[#8A5B00]",
      dot: "bg-[#8A5B00]",
    },
    danger: {
      wrap: "bg-[#FDEEE9] text-[#FF6B4A]",
      dot: "bg-[#FF6B4A]",
    },
    neutral: {
      wrap: "bg-[#F1E9DC] text-[#527A71]",
      dot: "bg-[#527A71]",
    },
    brand: {
      wrap: "bg-[#CDEBDD] text-[#0F3D33]",
      dot: "bg-[#0F3D33]",
    },
    teal: {
      wrap: "bg-[#CDEBDD] text-[#0F3D33]",
      dot: "bg-[#1C6B56]",
    },
  };

  const sizeStyles = {
    sm: "text-[11px] px-2.5 py-1 gap-1.5",
    md: "text-xs px-3 py-1 gap-2",
  };

  const style = variantStyles[variant] || variantStyles.neutral;

  return (
    <span
      className={cn(
        "inline-flex items-center font-medium rounded-full select-none",
        sizeStyles[size],
        style.wrap,
        className
      )}
      {...props}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", style.dot)} />
      <span>{children}</span>
    </span>
  );
};
