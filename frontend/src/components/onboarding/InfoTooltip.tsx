import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface InfoTooltipProps {
  content: string;
  className?: string;
}

export const InfoTooltip: React.FC<InfoTooltipProps> = ({ content, className }) => {
  const [visible, setVisible] = useState(false);

  return (
    <span className="relative inline-flex items-center ml-1 group select-none">
      <button
        type="button"
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        onClick={(e) => {
          e.preventDefault();
          setVisible(!visible);
        }}
        className={cn(
          "text-[#9CA3AF] hover:text-[#3F3DDB] transition-colors p-0.5 rounded-full",
          className
        )}
        aria-label="More information"
      >
        <HelpCircle className="w-3.5 h-3.5" />
      </button>

      {visible && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 w-52 p-2 rounded-lg bg-[#111827] text-white text-[11px] leading-relaxed shadow-lg z-50 text-center pointer-events-none">
          {content}
          <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#111827]" />
        </span>
      )}
    </span>
  );
};

