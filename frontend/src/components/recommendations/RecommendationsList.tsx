import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  TrendingDown,
  Clock,
  Coins,
  ShieldCheck,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { ActionCardItem } from '@/api/client';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatINR, formatCompactINR } from '@/utils/format';

interface RecommendationsListProps {
  recommendations: ActionCardItem[];
  onTakeAction?: (item: ActionCardItem) => void;
  maxItems?: number;
}

export const RecommendationsList: React.FC<RecommendationsListProps> = ({
  recommendations,
  onTakeAction,
  maxItems = 4,
}) => {
  const navigate = useNavigate();
  const items = recommendations.slice(0, maxItems);

  if (!items.length) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between pb-1">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#EEF0FD] text-[#3F3DDB] flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <h3 className="text-sm font-bold font-heading text-[#111827]">
            Recommended Actions to Protect Cash
          </h3>
        </div>
        <span className="text-xs text-[#6B7280]">
          Quantified by counterfactual re-simulation
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {items.map((item) => (
          <div
            key={item.id}
            className="p-4 rounded-[12px] bg-white border border-[#E8EAF0] shadow-card hover:border-[#C7D2FE] transition-all flex flex-col justify-between space-y-3"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase bg-[#EEF0FD] text-[#3F3DDB]">
                  {item.badge}
                </span>
                <span className="text-[11px] font-medium text-[#6B7280]">
                  Effort: <strong className="text-[#111827]">{item.effort}</strong>
                </span>
              </div>

              <h4 className="text-sm font-bold text-[#111827] mt-2">
                {item.title}
              </h4>
              <p className="text-xs text-[#4B5563] mt-1 leading-relaxed">
                {item.why}
              </p>
            </div>

            {/* Impact Strip */}
            <div className="pt-2 border-t border-[#F1F2F6] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#6B7280] font-medium">Impact on cash:</span>
                <span className="font-semibold text-[#15803D] flex items-center gap-1">
                  <TrendingDown className="w-3.5 h-3.5 rotate-180" />
                  {item.impact}
                </span>
              </div>

              {item.cost > 0 && (
                <div className="flex items-center justify-between text-[11px] text-[#6B7280]">
                  <span>Cost vs Cash Gain:</span>
                  <span>
                    Cost: <strong className="text-[#B42318]">{formatINR(item.cost)}</strong> to secure{' '}
                    <strong className="text-[#15803D]">{formatINR(item.cash_gain)}</strong>
                  </span>
                </div>
              )}

              <div className="pt-1 flex items-center justify-between">
                <span className="text-[11px] text-[#6B7280]">
                  Runway extends to: <strong>{item.after_runway >= 60 ? '60+ days' : `${item.after_runway} days`}</strong>
                </span>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    if (onTakeAction) {
                      onTakeAction(item);
                    } else if (item.category === 'receivable') {
                      navigate('/reminders');
                    } else if (item.category === 'payable') {
                      navigate('/forecast');
                    } else {
                      navigate('/pre-transaction');
                    }
                  }}
                  rightIcon={<ArrowRight className="w-3 h-3" />}
                >
                  {item.category === 'receivable' ? 'Send reminder' : 'Apply action'}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

