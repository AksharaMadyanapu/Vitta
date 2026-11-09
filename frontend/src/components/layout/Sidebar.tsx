import React from 'react';
import { NavLink } from 'react-router-dom';
import { Settings } from 'lucide-react';
import { navigationGroups } from '@/config/navigation';
import { cn } from '@/utils/cn';

export const Sidebar: React.FC = () => {
  return (
    <aside className="fixed top-0 left-0 bottom-0 z-30 w-[232px] bg-[#1E1B4B] text-white flex flex-col justify-between select-none shadow-lg">
      <div>
        {/* Brand Header with Runway inline SVG logo mark */}
        <div className="h-16 flex items-center px-5 border-b border-[#312E81]">
          <div className="flex items-center gap-3">
            {/* Inline SVG Logo Mark: rounded square with stylized upward chart line */}
            <div className="w-8 h-8 rounded-xl bg-[#3F3DDB] flex items-center justify-center text-white shadow-sm shrink-0">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 17l6-6 4 4 6-8" />
                <path d="M14 7h6v6" />
              </svg>
            </div>
            <div>
              <span className="text-base font-bold font-heading tracking-tight text-white block leading-none">
                Runway
              </span>
              <span className="text-[10px] text-[#A5B4FC] tracking-normal font-medium">
                Cash intelligence
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Groups */}
        <nav className="p-3 space-y-4 overflow-y-auto max-h-[calc(100vh-140px)]">
          {navigationGroups.map((group) => (
            <div key={group.heading} className="space-y-1">
              <div className="px-2.5 pb-1 text-[11px] font-semibold tracking-wider text-[#A5B4FC]">
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
                        "flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors duration-180",
                        isActive
                          ? "bg-[#312E81] text-white font-medium shadow-sm"
                          : "text-[#C7D2FE]/80 hover:text-white hover:bg-[#292569]"
                      )
                    }
                  >
                    <Icon className="w-[18px] h-[18px] shrink-0" strokeWidth={1.8} />
                    <span className="truncate">{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>
      </div>

      {/* Settings at the bottom */}
      <div className="p-3 border-t border-[#312E81]">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            cn(
              "flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors duration-180",
              isActive
                ? "bg-[#312E81] text-white font-medium shadow-sm"
                : "text-[#C7D2FE]/80 hover:text-white hover:bg-[#292569]"
            )
          }
        >
          <Settings className="w-[18px] h-[18px] shrink-0" strokeWidth={1.8} />
          <span>Settings</span>
        </NavLink>
      </div>
    </aside>
  );
};
