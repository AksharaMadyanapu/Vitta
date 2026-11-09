import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Layers,
  CircleDot,
} from 'lucide-react';
import { navigationItems } from '@/config/navigation';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/utils/cn';

export interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  backendHealthy?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  onToggleCollapse,
  backendHealthy = true,
}) => {
  return (
    <aside
      className={cn(
        "fixed top-0 left-0 bottom-0 z-40 bg-surface border-r border-border transition-all duration-300 flex flex-col justify-between select-none shadow-2xl",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Brand Header */}
      <div>
        <div className="h-16 flex items-center justify-between px-4 border-b border-border/60">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-blue via-blue-600 to-accent-teal flex items-center justify-center text-white font-bold shadow-lg shadow-accent-blue/25 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex flex-col min-w-0"
              >
                <span className="text-base font-extrabold tracking-wider text-primary flex items-center gap-1.5">
                  RUNWAY
                  <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-accent-blue/20 text-accent-blue tracking-normal">
                    v1.0
                  </span>
                </span>
                <span className="text-[11px] text-primary-muted truncate">
                  MSME Cash Intelligence
                </span>
              </motion.div>
            )}
          </div>

          <button
            onClick={onToggleCollapse}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="p-1.5 rounded-lg text-primary-muted hover:text-primary hover:bg-elevated transition-colors"
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Navigation list */}
        <nav className="p-3 space-y-1.5 overflow-y-auto max-h-[calc(100vh-140px)]">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.id}
                to={item.path}
                title={collapsed ? item.label : undefined}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group relative",
                    isActive
                      ? "bg-accent-blue/15 text-accent-blue shadow-sm border border-accent-blue/30"
                      : "text-primary-muted hover:text-primary hover:bg-elevated/80 border border-transparent"
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={cn(
                        "w-5 h-5 shrink-0 transition-transform duration-200 group-hover:scale-110",
                        isActive ? "text-accent-blue" : "text-primary-muted group-hover:text-primary"
                      )}
                    />

                    {!collapsed && (
                      <span className="truncate flex-1 font-medium">
                        {item.label}
                      </span>
                    )}

                    {!collapsed && item.badge && (
                      <Badge
                        variant={item.badgeVariant || 'neutral'}
                        size="sm"
                        className="text-[10px] px-1.5 py-0"
                      >
                        {item.badge}
                      </Badge>
                    )}

                    {/* Active indicator dot when collapsed */}
                    {collapsed && isActive && (
                      <span className="absolute right-2 w-1.5 h-1.5 rounded-full bg-accent-blue shadow-glow-blue" />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer System Status */}
      <div className="p-3 border-t border-border/60 bg-surface/50">
        <div
          className={cn(
            "flex items-center rounded-xl p-2 bg-elevated/50 border border-border/50 text-xs",
            collapsed ? "justify-center" : "justify-between"
          )}
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="relative flex h-2 w-2 shrink-0">
              <span
                className={cn(
                  "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
                  backendHealthy ? "bg-risk-safe" : "bg-risk-high"
                )}
              />
              <span
                className={cn(
                  "relative inline-flex rounded-full h-2 w-2",
                  backendHealthy ? "bg-risk-safe" : "bg-risk-high"
                )}
              />
            </span>
            {!collapsed && (
              <span className="text-[11px] text-primary-muted truncate">
                {backendHealthy ? "Backend Online" : "Backend Disconnected"}
              </span>
            )}
          </div>
          {!collapsed && (
            <span className="text-[10px] text-accent-blue font-mono font-medium">
              :8000
            </span>
          )}
        </div>
      </div>
    </aside>
  );
};

