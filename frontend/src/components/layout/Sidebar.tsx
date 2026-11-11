import React from 'react';
import { NavLink } from 'react-router-dom';
import { navigationItems } from '@/config/navigation';
import { cn } from '@/utils/cn';

export const Sidebar: React.FC = () => {
  return (
    // Rule 7: Deep green #0F3D33 background, cream text, active item as cream #FBF7F0 pill, collapse on narrow screens
    <aside className="fixed top-0 left-0 bottom-0 z-30 w-16 md:w-[232px] bg-[#0F3D33] text-[#FBF7F0] flex flex-col justify-between select-none shadow-soft transition-all duration-250">
      <div>
        {/* Brand Header */}
        <div className="h-20 flex items-center justify-center md:justify-start px-4 md:px-6">
          <div className="flex items-center gap-3">
            {/* Runway logo mark: rounded square with upward curve */}
            <div className="w-9 h-9 rounded-2xl bg-[#CDEBDD] text-[#0F3D33] flex items-center justify-center shadow-soft shrink-0">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 18c4-1 8-5 11-10" />
                <path d="M9 7h6v6" />
              </svg>
            </div>
            <div className="hidden md:block">
              <span className="text-xl font-semibold font-serif tracking-tight text-[#FBF7F0] block leading-none">
                Runway
              </span>
              <span className="text-[10px] text-[#8FB4AC] tracking-normal font-medium mt-0.5 block">
                Cash mentor
              </span>
            </div>
          </div>
        </div>

        {/* 5 Main Navigation Items */}
        <nav className="p-2 md:p-3 space-y-2 mt-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.id}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-3 py-3 rounded-full text-sm transition-all duration-250 justify-center md:justify-start",
                    isActive
                      ? "bg-[#FBF7F0] text-[#0F3D33] font-semibold shadow-soft"
                      : "text-[#FBF7F0]/80 hover:text-[#FBF7F0] hover:bg-[#194E42]"
                  )
                }
                title={item.label}
              >
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5" strokeWidth={2} />
                </div>
                <span className="hidden md:inline truncate">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer details */}
      <div className="hidden md:block p-5 m-3 rounded-2xl bg-[#194E42]/60 text-xs text-[#8FB4AC]">
        <p className="font-semibold font-serif text-[#FBF7F0]">Deccan Precision</p>
        <p className="text-[11px] mt-0.5 text-[#8FB4AC]">Auto-parts · Hyderabad</p>
      </div>
    </aside>
  );
};
