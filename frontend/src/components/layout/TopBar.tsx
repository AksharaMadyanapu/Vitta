import React, { useState } from 'react';
import { Search, Bell, HelpCircle } from 'lucide-react';
import { Drawer } from '@/components/ui/Drawer';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useOnboarding } from '@/context/OnboardingContext';

export interface TopBarProps {
  onSearch?: (query: string) => void;
}

export const TopBar: React.FC<TopBarProps> = () => {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(2);
  const { setIsHelpOpen } = useOnboarding();

  return (
    <>
      <header className="fixed top-0 right-0 left-16 md:left-[232px] z-20 h-16 bg-[#FBF7F0]/90 backdrop-blur-md flex items-center justify-between px-6 select-none transition-all duration-250">
        {/* Company name & friendly mentor indicator */}
        <div className="flex items-center gap-3">
          <span className="text-base font-semibold font-serif text-[#0F3D33]">
            Deccan Precision Components
          </span>
          <Badge variant="safe">Demo company</Badge>
        </div>

        {/* Right side: search, help, profile */}
        <div className="flex items-center gap-3">
          <div className="relative hidden sm:block w-56">
            <Search className="w-4 h-4 text-[#527A71] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search anything..."
              className="w-full pl-9 pr-4 py-2 bg-white rounded-full text-xs text-[#0F3D33] placeholder-[#8FB4AC] focus:outline-none focus:ring-2 focus:ring-[#0F3D33]/20 shadow-soft"
            />
          </div>

          {/* Help Drawer trigger */}
          <button
            onClick={() => setIsHelpOpen(true)}
            className="w-9 h-9 rounded-full bg-white text-[#0F3D33] flex items-center justify-center hover:bg-[#F1E9DC] transition-all shadow-soft"
            title="Help & Guide"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* User Avatar Circle */}
          <div className="flex items-center gap-2 pl-2">
            <div className="w-9 h-9 rounded-full bg-[#FFE8A3] text-[#8A5B00] font-serif font-bold text-sm flex items-center justify-center shadow-soft">
              RR
            </div>
            <span className="text-xs font-semibold text-[#0F3D33] hidden md:inline">
              Rakesh Reddy
            </span>
          </div>
        </div>
      </header>
    </>
  );
};
