import React from 'react';
import { cn } from '@/utils/cn';

export interface PageHeaderProps {
  title: string;
  description?: string;
  badge?: React.ReactNode;
  action?: React.ReactNode;
  secondaryAction?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  badge,
  action,
  secondaryAction,
  className,
}) => {
  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 mb-6 border-b border-[#E8EAF0]",
        className
      )}
    >
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-[26px] font-bold font-heading tracking-tight text-[#111827]">
            {title}
          </h1>
          {badge}
        </div>
        {description && (
          <p className="text-sm text-[#6B7280] mt-1">
            {description}
          </p>
        )}
      </div>

      {(action || secondaryAction) && (
        <div className="flex items-center gap-2.5 self-start sm:self-auto shrink-0">
          {secondaryAction}
          {action}
        </div>
      )}
    </div>
  );
};
