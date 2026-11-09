import React from 'react';
import { cn } from '@/utils/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  elevated?: boolean;
  glow?: 'none' | 'blue' | 'teal' | 'green' | 'amber' | 'red';
  hoverable?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, elevated = false, glow = 'none', hoverable = true, children, ...props }, ref) => {
    const glowClasses = {
      none: '',
      blue: 'hover:shadow-glow-blue hover:border-accent-blue/50',
      teal: 'hover:shadow-glow-teal hover:border-accent-teal/50',
      green: 'hover:shadow-glow-green hover:border-risk-safe/50',
      amber: 'hover:shadow-glow-amber hover:border-risk-caution/50',
      red: 'hover:shadow-glow-red hover:border-risk-high/50',
    };

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-2xl border border-border transition-all duration-200",
          elevated ? "bg-elevated" : "bg-surface",
          hoverable && "hover:border-border-focus/40 hover:shadow-card-hover hover:-translate-y-0.5",
          glowClasses[glow],
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
    <div ref={ref} className={cn("p-6 pb-3 flex flex-col space-y-1.5", className)} {...props} />
  )
);
CardHeader.displayName = 'CardHeader';

export const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn("text-lg font-semibold leading-none tracking-tight text-primary", className)} {...props} />
  )
);
CardTitle.displayName = 'CardTitle';

export const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm text-primary-muted", className)} {...props} />
  )
);
CardDescription.displayName = 'CardDescription';

export const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 pt-3", className)} {...props} />
  )
);
CardContent.displayName = 'CardContent';

export const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 pt-0 flex items-center border-t border-border/50 mt-4", className)} {...props} />
  )
);
CardFooter.displayName = 'CardFooter';

