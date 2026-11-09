import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'teal';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
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
    const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-150 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]";

    const sizeStyles = {
      sm: "text-xs px-3 py-1.5 gap-1.5",
      md: "text-sm px-4 py-2 gap-2",
      lg: "text-base px-5 py-2.5 gap-2.5",
      icon: "p-2 w-9 h-9",
    };

    const variantStyles = {
      primary: "bg-accent-blue text-white hover:bg-blue-600 focus:ring-accent-blue shadow-lg shadow-accent-blue/20",
      secondary: "bg-elevated text-primary hover:bg-elevated-hover hover:text-white border border-border focus:ring-border",
      outline: "border border-border text-primary hover:bg-surface hover:text-white hover:border-accent-blue/50 focus:ring-accent-blue",
      ghost: "text-primary-muted hover:text-primary hover:bg-surface focus:ring-border",
      danger: "bg-risk-high text-white hover:bg-red-600 focus:ring-risk-high shadow-lg shadow-risk-high/20",
      teal: "bg-accent-teal text-white hover:bg-teal-600 focus:ring-accent-teal shadow-lg shadow-accent-teal/20",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, sizeStyles[size], variantStyles[variant], className)}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-current" />
        ) : (
          leftIcon
        )}
        {children}
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';

