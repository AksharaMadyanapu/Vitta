import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowRight } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { navigationGroups, NavItem } from '@/config/navigation';

export interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const allItems: NavItem[] = navigationGroups.flatMap((g) => g.items);

  const filteredItems = allItems.filter((item) =>
    item.label.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (path: string) => {
    navigate(path);
    onClose();
    setQuery('');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="md">
      <div className="space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Go to page..."
            className="w-full pl-9 pr-3 py-2 bg-white border border-[#E5E7EB] rounded-lg text-sm text-[#111827] focus:outline-none focus:border-[#2548C9]"
          />
        </div>

        <div className="max-h-72 overflow-y-auto divide-y divide-[#F3F4F6]">
          {filteredItems.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                onClick={() => handleSelect(item.path)}
                className="flex items-center justify-between p-2.5 rounded-lg hover:bg-[#F9FAFB] cursor-pointer text-sm"
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 text-[#6B7280]" />
                  <span className="font-medium text-[#111827]">{item.label}</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-[#9CA3AF]" />
              </div>
            );
          })}
        </div>
      </div>
    </Modal>
  );
};
