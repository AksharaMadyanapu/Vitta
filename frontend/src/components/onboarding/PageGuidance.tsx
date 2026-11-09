import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Lightbulb } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface PageGuidanceProps {
  bullets: string[];
  pageKey?: string;
  defaultExpanded?: boolean;
}

export const PageGuidance: React.FC<PageGuidanceProps> = ({
  bullets,
  pageKey,
  defaultExpanded = false,
}) => {
  const [expanded, setExpanded] = useState<boolean>(() => {
    if (defaultExpanded) return true;
    if (pageKey) {
      try {
        const val = localStorage.getItem(`runway_guidance_${pageKey}`);
        if (val !== null) return val === 'true';
      } catch {}
    }
    return false;
  });

  const handleToggle = () => {
    const next = !expanded;
    setExpanded(next);
    if (pageKey) {
      try {
        localStorage.setItem(`runway_guidance_${pageKey}`, String(next));
      } catch {}
    }
  };

  return (
    <div className="rounded-[10px] border border-[#E8EAF0] bg-white overflow-hidden text-xs">
      <button
        onClick={handleToggle}
        className="w-full px-4 py-2.5 flex items-center justify-between text-left text-[#4B5563] hover:text-[#111827] hover:bg-[#F9FAFB] transition-colors"
      >
        <span className="flex items-center gap-2 font-medium">
          <Lightbulb className="w-3.5 h-3.5 text-[#3F3DDB]" />
          How this page works
        </span>
        <span className="flex items-center gap-1 text-[11px] text-[#9CA3AF]">
          <span>{expanded ? 'Hide tips' : 'Show tips'}</span>
          {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </span>
      </button>

      {expanded && (
        <div className="px-4 pb-3.5 pt-1 border-t border-[#F1F2F6] bg-[#F9FAFB]/50 space-y-1.5">
          {bullets.map((b, i) => (
            <div key={i} className="flex items-start gap-2 text-[#6B7280]">
              <span className="text-[#3F3DDB] font-bold mt-0.5">•</span>
              <p className="leading-relaxed">{b}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

