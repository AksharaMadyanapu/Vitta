import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'sand' | 'mint';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'secondary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    // Rule 3: Pill buttons (rounded-full), no hard borders, gentle 250ms transitions
    const baseStyles = "inline-flex items-center justify-center font-medium rounded-full transition-all duration-250 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF6B4A] disabled:opacity-50 disabled:pointer-events-none select-none text-sm";

    const sizeStyles = {
      sm: "h-8 px-4 text-xs gap-1.5",
      md: "h-10 px-5 text-sm gap-2",
      lg: "h-12 px-7 text-sm font-semibold gap-2.5 shadow-soft hover:shadow-soft-hover hover:-translate-y-0.5",
      icon: "h-10 w-10 p-0",
    };

    const variantStyles = {
      // Coral for primary CTA
      primary: "bg-[#FF6B4A] text-white hover:bg-[#E85535] shadow-soft hover:shadow-soft-hover",
      // Soft sand / white for secondary
      secondary: "bg-white text-[#0F3D33] hover:bg-[#F1E9DC] shadow-soft",
      sand: "bg-[#F1E9DC] text-[#0F3D33] hover:bg-[#E5DDD0]",
      mint: "bg-[#CDEBDD] text-[#0F3D33] hover:bg-[#BDE0D0] font-semibold",
      ghost: "text-[#527A71] hover:text-[#0F3D33] hover:bg-[#F1E9DC]/60",
      danger: "bg-[#FDEEE9] text-[#FF6B4A] hover:bg-[#FCDFD6]",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, sizeStyles[size], variantStyles[variant], className)}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin text-current" />}
        {!isLoading && leftIcon && <span className="shrink-0">{leftIcon}</span>}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
