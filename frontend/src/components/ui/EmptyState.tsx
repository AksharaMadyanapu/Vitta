import React from 'react';
import { LucideIcon, FolderOpen } from 'lucide-react';
import { Button } from './Button';
import { cn } from '@/utils/cn';

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = FolderOpen,
  title,
  description,
  actionLabel,
  onAction,
  className,
}) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center p-8 rounded-[10px] border border-dashed border-[#E5E7EB] bg-white",
        className
      )}
    >
      <div className="w-10 h-10 rounded-full bg-[#F3F4F6] flex items-center justify-center text-[#6B7280] mb-3">
        <Icon className="w-5 h-5" />
      </div>
      <h3 className="text-base font-semibold text-[#111827]">{title}</h3>
      <p className="text-sm text-[#6B7280] max-w-sm mt-1">
        {description}
      </p>
      {actionLabel && (
        <div className="mt-4">
          <Button variant="primary" size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
};
