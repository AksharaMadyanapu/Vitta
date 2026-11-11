import React from 'react';
import { cn } from '@/utils/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg';
  isClickable?: boolean;
  bg?: 'white' | 'sand' | 'mint' | 'cream';
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, padding = 'md', isClickable = false, bg = 'white', children, ...props }, ref) => {
    // Rule 2 & 3: 28px padding inside cards, 24px radius, soft shadows, no hard borders
    const paddingClasses = {
      none: '',
      sm: 'p-5',
      md: 'p-7 sm:p-7', // 28px generous padding
      lg: 'p-8 sm:p-9',
    };

    const bgClasses = {
      white: 'bg-white',
      sand: 'bg-[#F1E9DC]',
      mint: 'bg-[#CDEBDD]',
      cream: 'bg-[#FBF7F0]',
    };

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-[24px] shadow-soft transition-all duration-250",
          bgClasses[bg],
          isClickable && "cursor-pointer hover:-translate-y-1 hover:shadow-soft-hover",
          paddingClasses[padding],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("pb-4 flex flex-col space-y-1", className)} {...props} />
  )
);
CardHeader.displayName = 'CardHeader';

export const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn("text-lg font-semibold font-serif text-[#0F3D33] tracking-tight", className)} {...props} />
  )
);
CardTitle.displayName = 'CardTitle';
