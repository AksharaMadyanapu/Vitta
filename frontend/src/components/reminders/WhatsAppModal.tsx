import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, MessageCircle, Globe, Check, Phone } from 'lucide-react';
import { ReminderItem, api } from '@/api/client';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';

interface WhatsAppModalProps {
  reminder: ReminderItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const WhatsAppModal: React.FC<WhatsAppModalProps> = ({
  reminder,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { success } = useToast();
  const [language, setLanguage] = useState<'en' | 'hi' | 'te'>('en');
  const [editableText, setEditableText] = useState('');

  React.useEffect(() => {
    if (reminder) {
      setEditableText(reminder.messages[language] || reminder.messages.en);
    }
  }, [reminder, language]);

  if (!isOpen || !reminder) return null;

  const handleLanguageChange = (lang: 'en' | 'hi' | 'te') => {
    setLanguage(lang);
    if (reminder) {
      setEditableText(reminder.messages[lang] || reminder.messages.en);
    }
  };

  const handleSendWhatsApp = async () => {
    // 1. Encode text and open WhatsApp
    const phoneClean = reminder.phone ? reminder.phone.replace(/[^0-9]/g, '') : '919849123456';
    const targetPhone = phoneClean.startsWith('91') ? phoneClean : `91${phoneClean}`;
    const encoded = encodeURIComponent(editableText);
    const url = `https://wa.me/${targetPhone}?text=${encoded}`;

    window.open(url, '_blank');

    // 2. Log reminder as sent in backend
    try {
      await api.sendReminder(reminder.invoice_id, 'whatsapp', language);
      success('Reminder logged', `WhatsApp reminder logged for ${reminder.party_name}.`);
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error(err);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#111827]/40"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          className="relative w-full max-w-lg rounded-[14px] bg-white border border-[#E8EAF0] shadow-2xl p-6 z-10 space-y-4"
        >
          {/* Header */}
          <div className="flex items-start justify-between pb-3 border-b border-[#E8EAF0]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#25D366]/15 text-[#16A34A] flex items-center justify-center shrink-0">
                <MessageCircle className="w-5 h-5 text-[#25D366]" />
              </div>
              <div>
                <h3 className="text-base font-bold font-heading text-[#111827]">
                  Send WhatsApp Reminder
                </h3>
                <p className="text-xs text-[#6B7280]">
                  To: <strong>{reminder.party_name}</strong> ({reminder.contact_person || 'Accounts'})
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#9CA3AF] hover:text-[#111827] hover:bg-[#F3F4F6] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Details strip */}
          <div className="p-3 rounded-[10px] bg-[#F5F6FA] border border-[#E8EAF0] flex items-center justify-between text-xs">
            <div>
              <span className="text-[#6B7280] block text-[11px]">Invoice:</span>
              <strong className="text-[#111827]">{reminder.invoice_number}</strong>
            </div>
            <div>
              <span className="text-[#6B7280] block text-[11px]">Amount:</span>
              <strong className="text-[#111827] tabular-nums">{reminder.amount_formatted}</strong>
            </div>
            <div>
              <span className="text-[#6B7280] block text-[11px]">Status:</span>
              <span className="font-semibold text-[#B42318]">{reminder.status_label}</span>
            </div>
            <div>
              <span className="text-[#6B7280] block text-[11px]">Phone:</span>
              <span className="font-medium text-[#4B5563]">{reminder.phone || '+91 98491 XXXXX'}</span>
            </div>
          </div>

          {/* Language Selector */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#374151] flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-[#3F3DDB]" />
              Template Language:
            </span>
            <div className="flex items-center gap-1 bg-[#F5F6FA] p-0.5 rounded-lg border border-[#E8EAF0]">
              {(
                [
                  { key: 'en', label: 'English' },
                  { key: 'hi', label: 'हिंदी' },
                  { key: 'te', label: 'తెలుగు' },
                ] as const
              ).map((l) => (
                <button
                  key={l.key}
                  onClick={() => handleLanguageChange(l.key)}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                    language === l.key
                      ? 'bg-white text-[#3F3DDB] shadow-sm font-semibold'
                      : 'text-[#6B7280] hover:text-[#111827]'
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          {/* Editable message body */}
          <div>
            <label className="text-[11px] font-semibold text-[#6B7280] block mb-1.5">
              Message text (editable):
            </label>
            <textarea
              rows={5}
              value={editableText}
              onChange={(e) => setEditableText(e.target.value)}
              className="w-full p-3 bg-white border border-[#CBD5E1] rounded-[10px] text-xs text-[#111827] focus:outline-none focus:border-[#3F3DDB] leading-relaxed resize-none shadow-sm"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-[#E8EAF0]">
            <Button variant="secondary" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSendWhatsApp}
              leftIcon={<Send className="w-3.5 h-3.5" />}
              className="bg-[#16A34A] hover:bg-[#15803D] focus:ring-[#16A34A]"
            >
              Open in WhatsApp & Log
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

