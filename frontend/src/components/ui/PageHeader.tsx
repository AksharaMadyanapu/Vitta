import React from 'react';
import { cn } from '@/utils/cn';

export interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  secondaryAction?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  action,
  secondaryAction,
  className,
}) => {
  return (
    <div className={cn("flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 mb-2", className)}>
      <div>
        {/* Rule 2: Fraunces serif (weight 600, 32px) */}
        <h1 className="text-[28px] sm:text-[32px] font-semibold font-serif text-[#0F3D33] tracking-tight leading-tight">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-[#527A71] mt-1.5 max-w-2xl leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {(action || secondaryAction) && (
        <div className="flex items-center gap-2.5 shrink-0">
          {secondaryAction}
          {action}
        </div>
      )}
    </div>
  );
};
