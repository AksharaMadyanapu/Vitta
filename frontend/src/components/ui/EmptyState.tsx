import React from 'react';
import { LucideIcon, FolderOpen, RefreshCw } from 'lucide-react';
import { Button } from './Button';
import { cn } from '@/utils/cn';
import { useToast } from './Toast';

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  showSampleDataLink?: boolean;
  onLoadSampleData?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = FolderOpen,
  title,
  description,
  actionLabel,
  onAction,
  showSampleDataLink = true,
  onLoadSampleData,
  className,
}) => {
  const { success } = useToast();

  const handleSample = () => {
    if (onLoadSampleData) {
      onLoadSampleData();
    } else {
      success('Sample data loaded', 'Restored Deccan Precision Components seed data.');
    }
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center p-8 sm:p-10 rounded-[14px] border border-dashed border-[#E8EAF0] bg-white",
        className
      )}
    >
      {/* Friendly SVG Illustration */}
      <div className="w-16 h-16 rounded-2xl bg-[#EEF0FD] text-[#3F3DDB] flex items-center justify-center mb-3.5 shadow-sm">
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <rect width="18" height="14" x="3" y="5" rx="3" />
          <path d="M3 10h18" />
          <path d="M7 15h2" />
        </svg>
      </div>

      <h3 className="text-base font-bold font-heading text-[#111827]">{title}</h3>
      <p className="text-xs text-[#6B7280] max-w-sm mt-1 leading-relaxed">
        {description}
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-2.5 mt-5">
        {actionLabel && (
          <Button variant="primary" size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        )}
        {showSampleDataLink && (
          <button
            onClick={handleSample}
            className="text-xs font-medium text-[#6B7280] hover:text-[#3F3DDB] hover:underline flex items-center gap-1 transition-colors px-2 py-1"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Load sample data</span>
          </button>
        )}
      </div>
    </div>
  );
};
