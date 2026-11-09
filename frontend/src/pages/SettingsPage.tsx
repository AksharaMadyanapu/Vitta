import React, { useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';

export const SettingsPage: React.FC = () => {
  const { success } = useToast();
  const [companyName, setCompanyName] = useState('Deccan Precision Components Pvt Ltd');
  const [owner, setOwner] = useState('Rakesh Reddy');
  const [location, setLocation] = useState('Hyderabad, Telangana');
  const [reminderDays, setReminderDays] = useState(7);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    success('Settings saved', 'Your business details and preferences have been updated.');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Company details, notification preferences, and bank connection settings."
      />

      <div className="max-w-2xl">
        <Card>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="pb-3 border-b border-[#E5E7EB]">
              <h3 className="text-base font-semibold text-[#111827]">
                Business profile
              </h3>
              <p className="text-xs text-[#6B7280] mt-0.5">
                Information displayed on invoices and financial reports
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#374151] mb-1">
                Company name
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#E5E7EB] rounded-lg text-sm text-[#111827] focus:outline-none focus:border-[#2548C9]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#374151] mb-1">
                  Owner / Managing director
                </label>
                <input
                  type="text"
                  value={owner}
                  onChange={(e) => setOwner(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#E5E7EB] rounded-lg text-sm text-[#111827] focus:outline-none focus:border-[#2548C9]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#374151] mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#E5E7EB] rounded-lg text-sm text-[#111827] focus:outline-none focus:border-[#2548C9]"
                />
              </div>
            </div>

            <div className="pt-2 pb-3 border-b border-[#E5E7EB]">
              <label className="block text-xs font-medium text-[#374151] mb-1">
                Days in advance to prepare reminders
              </label>
              <select
                value={reminderDays}
                onChange={(e) => setReminderDays(Number(e.target.value))}
                className="w-full sm:w-48 px-3 py-2 bg-white border border-[#E5E7EB] rounded-lg text-sm text-[#111827] focus:outline-none focus:border-[#2548C9]"
              >
                <option value={5}>5 days before due date</option>
                <option value={7}>7 days before due date (Recommended)</option>
                <option value={10}>10 days before due date</option>
              </select>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div>
                <span className="text-sm font-medium text-[#111827]">Bank sandbox connection</span>
                <p className="text-xs text-[#6B7280]">Simulating live balance feeds for HDFC and SBI</p>
              </div>
              <Badge variant="safe">Active</Badge>
            </div>

            <div className="pt-4 border-t border-[#E5E7EB] flex justify-end">
              <Button type="submit" variant="primary">
                Save settings
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

