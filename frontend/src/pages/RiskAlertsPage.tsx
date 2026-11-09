import React, { useState } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  CheckCircle,
  Clock,
  Sparkles,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { SkeletonTable } from '@/components/ui/Skeleton';
import { formatINR } from '@/utils/format';
import { useToast } from '@/components/ui/Toast';

export const RiskAlertsPage: React.FC = () => {
  const [showSkeleton, setShowSkeleton] = useState(false);
  const { success, info } = useToast();

  const alerts = [
    {
      id: 'alt-1',
      severity: 'high' as const,
      title: 'Potential Shortfall Window Detected around Day 22-25',
      shortfallAmount: 480000,
      cause: 'Simultaneous GST liability payment (₹3.8L) and raw material batch delivery from Tata Steel (₹4.8L) without adequate collection cushion.',
      recommendations: [
        'Request 50% early payment discount (2%) from Kalyani Powertrain Ltd on Inv #0491.',
        'Negotiate a 10-day staggered dispatch on the Tata Steel raw material coils.',
        'Draw down ₹2,50,000 temporarily from SBI Overdraft facility.',
      ],
      date: 'Projected for Nov 22-25',
    },
    {
      id: 'alt-2',
      severity: 'caution' as const,
      title: 'Customer Payment Delay Drift: Varroc Engineering',
      cause: 'Historical delay average drifted from 14 days to 24.5 days over the last 3 billing cycles, tying up ₹11,20,000 in working capital.',
      recommendations: [
        'Shift future purchase orders to 30% milestone advance before tool casting.',
        'Trigger formal credit notice to Varroc finance desk with statement of account.',
      ],
      date: 'Active Trend',
    },
    {
      id: 'alt-3',
      severity: 'safe' as const,
      title: 'Working Capital Buffer Reconstitution',
      cause: 'Sundaram Fasteners settled ₹7,50,000 on schedule, elevating cash reserve above 30-day baseline requirement.',
      recommendations: [
        'Maintain buffer for scheduled machinery loan EMI deduction on Nov 28.',
      ],
      date: 'Settled Yesterday',
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Risk Alerts & Recommendations"
        description="Root-cause diagnostic engine explaining projected shortfalls with proactive operational recommendations."
        badge={
          <Badge variant="high" dot pulse>
            1 High Priority Alert
          </Badge>
        }
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSkeleton(!showSkeleton)}
          >
            {showSkeleton ? 'View Content' : 'Preview Skeletons'}
          </Button>
        }
      />

      {showSkeleton ? (
        <SkeletonTable rows={4} />
      ) : (
        <div className="space-y-5">
          {alerts.map((alert) => (
            <Card
              key={alert.id}
              className={`p-6 border-l-4 ${
                alert.severity === 'high'
                  ? 'border-l-risk-high border-border'
                  : alert.severity === 'caution'
                  ? 'border-l-risk-caution border-border'
                  : 'border-l-risk-safe border-border'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border/50">
                <div className="flex items-center gap-3">
                  <Badge variant={alert.severity} size="md" dot>
                    {alert.severity === 'high'
                      ? 'High Shortfall Risk'
                      : alert.severity === 'caution'
                      ? 'Payment Drift Warning'
                      : 'Positive Buffer'}
                  </Badge>
                  <h3 className="text-base font-bold text-primary">
                    {alert.title}
                  </h3>
                </div>
                <span className="text-xs font-mono text-primary-muted">
                  {alert.date}
                </span>
              </div>

              {/* Cause Explanation */}
              <div className="mt-4 p-4 rounded-xl bg-elevated/70 border border-border/60">
                <div className="text-xs font-semibold text-primary-muted uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-accent-amber" />
                  Underlying Root Cause:
                </div>
                <p className="text-sm text-primary leading-relaxed">
                  {alert.cause}
                </p>
                {alert.shortfallAmount && (
                  <div className="mt-2 text-xs font-medium text-risk-high-text">
                    Projected Max Deficit:{' '}
                    <strong className="font-mono text-sm">
                      {formatINR(alert.shortfallAmount)}
                    </strong>
                  </div>
                )}
              </div>

              {/* Recommended Action Checklist */}
              <div className="mt-4 space-y-2">
                <div className="text-xs font-semibold text-primary-muted uppercase tracking-wider flex items-center gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5 text-accent-teal" />
                  Recommended Preventive Steps:
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                  {alert.recommendations.map((rec, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-lg bg-surface border border-border flex items-start justify-between gap-3 group hover:border-accent-blue/40 transition-colors"
                    >
                      <p className="text-xs text-primary leading-relaxed flex-1">
                        {rec}
                      </p>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="text-[11px] py-1 px-2.5 shrink-0"
                        onClick={() => success('Recommendation Initiated', 'Workflow dispatched to accounting team.')}
                      >
                        Execute
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

