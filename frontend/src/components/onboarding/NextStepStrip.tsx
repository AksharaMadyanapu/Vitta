import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface NextStepStripProps {
  label: string;
  description: string;
  to: string;
  actionText: string;
  className?: string;
}

export const NextStepStrip: React.FC<NextStepStripProps> = ({
  label,
  description,
  to,
  actionText,
  className,
}) => {
  return (
    <div
      className={cn(
        "p-4 rounded-[14px] bg-white border border-[#E8EAF0] shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm transition-colors hover:border-[#D8DAFA]",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-[#EEF0FD] text-[#3F3DDB] flex items-center justify-center shrink-0">
          <Sparkles className="w-4 h-4" />
        </div>
        <div>
          <span className="font-semibold text-[#111827] text-sm">
            {label}
          </span>
          <p className="text-xs text-[#6B7280]">
            {description}
          </p>
        </div>
      </div>

      <Link
        to={to}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-[#3F3DDB] hover:bg-[#3230C8] px-3.5 py-2 rounded-lg shrink-0 transition-colors shadow-sm"
      >
        <span>{actionText}</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
};

