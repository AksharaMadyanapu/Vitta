import React from 'react';
import { NavLink } from 'react-router-dom';
import { Settings } from 'lucide-react';
import { navigationGroups } from '@/config/navigation';
import { cn } from '@/utils/cn';

export const Sidebar: React.FC = () => {
  return (
    <aside className="fixed top-0 left-0 bottom-0 z-30 w-[232px] bg-white border-r border-[#E5E7EB] flex flex-col justify-between select-none">
      {/* Brand Header */}
      <div>
        <div className="h-14 flex items-center px-5 border-b border-[#E5E7EB]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-[#2548C9] flex items-center justify-center text-white font-bold text-sm">
              R
            </div>
            <span className="text-base font-semibold tracking-tight text-[#111827]">
              Runway
            </span>
          </div>
        </div>

        {/* Navigation Groups */}
        <nav className="p-3 space-y-5 overflow-y-auto max-h-[calc(100vh-120px)]">
          {navigationGroups.map((group) => (
            <div key={group.heading} className="space-y-1">
              <div className="px-2.5 pb-1 text-[11px] font-semibold tracking-wider text-[#9CA3AF]">
                {group.heading}
              </div>
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.id}
                    to={item.path}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors duration-150",
                        isActive
                          ? "bg-[#EEF2FF] text-[#2548C9] font-medium"
                          : "text-[#4B5563] hover:text-[#111827] hover:bg-[#F9FAFB]"
                      )
                    }
                  >
                    <Icon className="w-[18px] h-[18px] shrink-0" strokeWidth={1.75} />
                    <span className="truncate">{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>
      </div>

      {/* Settings at the bottom */}
      <div className="p-3 border-t border-[#E5E7EB]">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            cn(
              "flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors duration-150",
              isActive
                ? "bg-[#EEF2FF] text-[#2548C9] font-medium"
                : "text-[#4B5563] hover:text-[#111827] hover:bg-[#F9FAFB]"
            )
          }
        >
          <Settings className="w-[18px] h-[18px] shrink-0" strokeWidth={1.75} />
          <span>Settings</span>
        </NavLink>
      </div>
    </aside>
  );
};
