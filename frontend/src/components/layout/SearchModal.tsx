import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowRight, CornerDownLeft } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { navigationItems } from '@/config/navigation';
import { Badge } from '@/components/ui/Badge';

export interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  // Keyboard shortcut Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const filteredItems = navigationItems.filter(
    (item) =>
      item.label.toLowerCase().includes(query.toLowerCase()) ||
      item.description.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (path: string) => {
    navigate(path);
    onClose();
    setQuery('');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="lg">
      <div className="space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-5 h-5 text-primary-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a section or feature to jump to..."
            className="w-full pl-11 pr-4 py-3 bg-elevated border border-border rounded-xl text-base text-primary placeholder-primary-muted/70 focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue"
          />
        </div>

        {/* Results list */}
        <div className="max-h-80 overflow-y-auto space-y-1 py-1">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item.path)}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-elevated cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 rounded-lg bg-surface border border-border group-hover:border-accent-blue/50 text-accent-blue transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-primary">
                          {item.label}
                        </span>
                        {item.badge && (
                          <Badge variant={item.badgeVariant || 'neutral'} size="sm">
                            {item.badge}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-primary-muted truncate">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <ArrowRight className="w-4 h-4 text-primary-muted group-hover:text-accent-blue group-hover:translate-x-1 transition-all" />
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-primary-muted text-sm">
              No matching sections found for "{query}".
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="flex items-center justify-between pt-3 border-t border-border/50 text-[11px] text-primary-muted">
          <span>Navigate with mouse or keyboard</span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-elevated border border-border font-mono text-[10px]">ESC</kbd> to close
          </span>
        </div>
      </div>
    </Modal>
  );
};

