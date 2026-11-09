import React, { useState } from 'react';
import {
  Search,
  Bell,
  Building2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  Command,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Drawer } from '@/components/ui/Drawer';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';

export interface TopBarProps {
  sidebarCollapsed: boolean;
  onOpenSearch?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  sidebarCollapsed,
  onOpenSearch,
}) => {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(3);

  const notifications = [
    {
      id: '1',
      title: 'Shortfall Risk at Day 22',
      message: 'Projected GST liability + raw material payment creates a ₹4,80,000 cash deficit.',
      time: '10m ago',
      type: 'high' as const,
    },
    {
      id: '2',
      title: 'Invoice Due in 7 Days',
      message: '₹6,40,000 from Kalyani Powertrain Ltd is due next Tuesday.',
      time: '1h ago',
      type: 'caution' as const,
    },
    {
      id: '3',
      title: 'Bank Statement Synced',
      message: 'Simulated Current A/c balance updated to ₹18,45,200.',
      time: '2h ago',
      type: 'safe' as const,
    },
  ];

  return (
    <>
      <header
        className={cn(
          "fixed top-0 right-0 z-30 h-16 bg-surface/90 backdrop-blur-md border-b border-border transition-all duration-300 flex items-center justify-between px-6 select-none",
          sidebarCollapsed ? "left-20" : "left-64"
        )}
      >
        {/* Left: Company Identity & Demo badge */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-elevated border border-border flex items-center justify-center text-accent-blue">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold tracking-tight text-primary">
                  Deccan Precision Components
                </span>
                <Badge
                  variant="blue"
                  size="sm"
                  className="font-medium text-[10px] uppercase tracking-wider py-0 px-2"
                >
                  Demo data
                </Badge>
              </div>
              <p className="text-[11px] text-primary-muted truncate">
                Automotive Parts · Hyderabad, TS
              </p>
            </div>
          </div>
        </div>

        {/* Center: Global Search Input */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
          <div
            onClick={onOpenSearch}
            className="w-full flex items-center justify-between px-3.5 py-1.5 rounded-xl bg-elevated border border-border hover:border-accent-blue/40 text-primary-muted text-xs cursor-pointer transition-colors shadow-inner"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-primary-muted" />
              <span>Search invoices, customers, transactions...</span>
            </div>
            <kbd className="inline-flex items-center gap-1 font-mono text-[10px] bg-surface px-1.5 py-0.5 rounded border border-border/80 text-primary-muted">
              <Command className="w-2.5 h-2.5" /> K
            </kbd>
          </div>
        </div>

        {/* Right: Actions & User Info */}
        <div className="flex items-center gap-3">
          {/* Notification Bell */}
          <button
            onClick={() => setNotificationsOpen(true)}
            className="relative p-2 rounded-xl text-primary-muted hover:text-primary hover:bg-elevated transition-colors border border-transparent hover:border-border"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-risk-high text-[10px] font-bold text-white shadow-glow-red">
                {unreadCount}
              </span>
            )}
          </button>

          {/* User profile capsule */}
          <div className="flex items-center gap-2.5 pl-3 border-l border-border/60">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-accent-blue to-accent-teal flex items-center justify-center text-white text-xs font-bold shadow-md shadow-accent-blue/20">
              RR
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-semibold text-primary">Rakesh Reddy</div>
              <div className="text-[10px] text-primary-muted">Managing Director</div>
            </div>
          </div>
        </div>
      </header>

      {/* Notifications Drawer */}
      <Drawer
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        title="Notifications & Alerts"
        description="Real-time alerts generated from cash-flow intelligence"
        footer={
          <div className="w-full flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setUnreadCount(0);
              }}
            >
              Mark all as read
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setNotificationsOpen(false)}
            >
              Close
            </Button>
          </div>
        }
      >
        <div className="space-y-3">
          {notifications.map((item) => {
            const borderColors = {
              high: "border-risk-high/30 bg-risk-high-bg/50",
              caution: "border-risk-caution/30 bg-risk-caution-bg/50",
              safe: "border-risk-safe/30 bg-risk-safe-bg/50",
            };

            return (
              <div
                key={item.id}
                className={cn(
                  "p-4 rounded-xl border transition-all hover:bg-elevated/80",
                  borderColors[item.type]
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {item.type === 'high' && (
                      <span className="w-2 h-2 rounded-full bg-risk-high animate-pulse" />
                    )}
                    {item.type === 'caution' && (
                      <span className="w-2 h-2 rounded-full bg-risk-caution" />
                    )}
                    {item.type === 'safe' && (
                      <span className="w-2 h-2 rounded-full bg-risk-safe" />
                    )}
                    <h4 className="text-xs font-semibold text-primary">
                      {item.title}
                    </h4>
                  </div>
                  <span className="text-[10px] text-primary-muted font-mono">
                    {item.time}
                  </span>
                </div>
                <p className="text-xs text-primary-muted mt-2 leading-relaxed">
                  {item.message}
                </p>
              </div>
            );
          })}
        </div>
      </Drawer>
    </>
  );
};

