import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
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
    const baseStyles = "inline-flex items-center justify-center font-medium rounded-lg transition-colors duration-180 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#3F3DDB] disabled:opacity-50 disabled:pointer-events-none select-none text-sm";

    const sizeStyles = {
      sm: "h-8 px-3 text-xs gap-1.5",
      md: "h-9 px-3.5 text-sm gap-2",
      lg: "h-10 px-4 text-sm gap-2",
      icon: "h-9 w-9 p-0",
    };

    const variantStyles = {
      primary: "bg-[#3F3DDB] text-white hover:bg-[#3230C8] shadow-sm",
      secondary: "bg-white text-[#374151] border border-[#E8EAF0] hover:bg-[#F9FAFB] hover:text-[#111827] shadow-sm",
      ghost: "text-[#4B5563] hover:text-[#111827] hover:bg-[#F3F4F6]",
      danger: "bg-[#FDECEA] text-[#B42318] border border-[#FAC7C3] hover:bg-[#FCD8D4]",
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
