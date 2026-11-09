import React, { useState } from 'react';
import { Search, Bell, HelpCircle } from 'lucide-react';
import { Drawer } from '@/components/ui/Drawer';
import { Button } from '@/components/ui/Button';
import { useOnboarding } from '@/context/OnboardingContext';

export interface TopBarProps {
  onSearch?: (query: string) => void;
}

export const TopBar: React.FC<TopBarProps> = () => {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(2);
  const { setIsHelpOpen } = useOnboarding();

  const notifications = [
    {
      id: '1',
      title: 'Shortage expected around 20 November',
      message: 'GST payment and raw material bills will require about ₹4.8L more than current cash reserves.',
      time: 'Today',
      severity: 'caution' as const,
    },
    {
      id: '2',
      title: 'Kalyani Powertrain bill overdue',
      message: '₹6,40,000 from Kalyani Powertrain Ltd is 8 days past due date.',
      time: 'Yesterday',
      severity: 'danger' as const,
    },
  ];

  return (
    <>
      <header className="fixed top-0 right-0 left-[232px] z-20 h-14 bg-white border-b border-[#E5E7EB] flex items-center justify-between px-6 select-none">
        {/* Company name & quiet Demo data label */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-[#111827]">
            Deccan Precision Components
          </span>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#F3F4F6] text-[#6B7280]">
            Demo data
          </span>
        </div>

        {/* Right side: search, notifications, profile */}
        <div className="flex items-center gap-4">
          <div className="relative hidden sm:block w-64">
            <Search className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-9 pr-3 py-1.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg text-sm text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:bg-white focus:border-[#2548C9] transition-colors"
            />
          </div>

          {/* Help Button */}
          <button
            id="tour-help-button"
            onClick={() => setIsHelpOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#4B5563] hover:text-[#111827] hover:bg-[#F3F4F6] transition-colors"
            title="Help and guided tour"
          >
            <HelpCircle className="w-4 h-4 text-[#3F3DDB]" />
            <span className="hidden sm:inline">Help</span>
          </button>

          {/* Notification Bell */}
          <button
            onClick={() => setNotificationsOpen(true)}
            className="relative p-1.5 rounded-lg text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6] transition-colors"
            title="Notifications"
          >
            <Bell className="w-[18px] h-[18px]" strokeWidth={1.75} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#B42318]" />
            )}
          </button>

          {/* User profile initials */}
          <div className="flex items-center gap-2 pl-2 border-l border-[#E5E7EB]">
            <div className="w-7 h-7 rounded-full bg-[#EEF0FD] text-[#3F3DDB] font-medium text-xs flex items-center justify-center">
              RR
            </div>
            <span className="text-sm text-[#374151] hidden md:inline font-medium">
              Rakesh Reddy
            </span>
          </div>
        </div>
      </header>

      {/* Notifications Drawer */}
      <Drawer
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        title="Notifications"
        description="Important alerts that need your review."
        footer={
          <div className="w-full flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setUnreadCount(0)}
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
          {notifications.map((item) => (
            <div
              key={item.id}
              className="p-3.5 rounded-[10px] border border-[#E5E7EB] bg-[#F9FAFB]"
            >
              <div className="flex items-start justify-between gap-2">
                <h4 className="text-sm font-medium text-[#111827]">
                  {item.title}
                </h4>
                <span className="text-xs text-[#9CA3AF] shrink-0">
                  {item.time}
                </span>
              </div>
              <p className="text-xs text-[#6B7280] mt-1 leading-relaxed">
                {item.message}
              </p>
            </div>
          ))}
        </div>
      </Drawer>
    </>
  );
};
