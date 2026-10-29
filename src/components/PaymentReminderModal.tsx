import React, { useState } from 'react';
import { X, MessageSquare, Send, Copy, Check, ExternalLink, ShieldCheck } from 'lucide-react';
import { useKhata } from '../context/KhataContext';
import { Customer, Language } from '../types';

interface PaymentReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer;
  balance: number; // positive = customer owes us
}

export const PaymentReminderModal: React.FC<PaymentReminderModalProps> = ({
  isOpen,
  onClose,
  customer,
  balance,
}) => {
  const { profile } = useKhata();
  const [reminderLang, setReminderLang] = useState<Language>('hi');
  const [copied, setCopied] = useState(false);
  const [reminderType, setReminderType] = useState<'polite' | 'standard' | 'upi'>('standard');

  if (!isOpen) return null;

  // Clean 10-digit phone
  const cleanPhone = customer.phone.replace(/\D/g, '');
  const internationalPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

  // Message generation based on language & template
  const getMessageText = () => {
    const formattedAmount = `₹${Math.abs(balance).toLocaleString('en-IN')}`;

    if (reminderLang === 'hi') {
      if (reminderType === 'polite') {
        return `नमस्ते ${customer.name} जी! आशा है आप सकुशल हैं। ${profile.businessName} से आपका कुल बकाया ${formattedAmount} है। सुविधानुसार भुगतान कर दें। धन्यवाद! - ${profile.ownerName} (${profile.phone})`;
      } else if (reminderType === 'upi') {
        return `नमस्ते ${customer.name} जी! ${profile.businessName} से आपका बकाया ${formattedAmount} है। कृपया इस UPI ID पर भुगतान करें: ${profile.upiId} या काउंटर पर जमा करें। धन्यवाद!`;
      }
      return `नमस्ते ${customer.name} जी! ${profile.businessName} में आपका बकाया हिसाब ${formattedAmount} है। कृपया जल्द से जल्द चुकता करने की कृपा करें। हिसाब देखने या किसी प्रश्न के लिए संपर्क करें। धन्यवाद! - ${profile.ownerName}`;
    } else if (reminderLang === 'bn') {
      if (reminderType === 'polite') {
        return `নমস্কার ${customer.name} বাবু, ${profile.businessName} থেকে আপনার মোট বাকি রয়েছে ${formattedAmount}। আপনার সুবিধামতো পরিশোধ করবেন। ধন্যবাদ! - ${profile.ownerName} (${profile.phone})`;
      } else if (reminderType === 'upi') {
        return `নমস্কার ${customer.name} বাবু, ${profile.businessName} এর বাকি ${formattedAmount} মেটাতে এই UPI ID তে পেমেন্ট করতে পারেন: ${profile.upiId}। ধন্যবাদ!`;
      }
      return `নমস্কার ${customer.name} বাবু, ${profile.businessName} এর খাতা অনুযায়ী আপনার মোট বাকি ${formattedAmount}। অনুগ্রহ করে শীঘ্রই হিসাব পরিশোধ করুন। ধন্যবাদ! - ${profile.ownerName}`;
    } else {
      // English
      if (reminderType === 'polite') {
        return `Hello ${customer.name}, gentle reminder from ${profile.businessName}. Your outstanding balance is ${formattedAmount}. Please clear at your convenience. Thank you! - ${profile.ownerName} (${profile.phone})`;
      } else if (reminderType === 'upi') {
        return `Dear ${customer.name}, your pending balance at ${profile.businessName} is ${formattedAmount}. You can pay directly via UPI: ${profile.upiId}. Thank you!`;
      }
      return `Dear ${customer.name}, this is a payment reminder from ${profile.businessName}. Your pending udhaar balance is ${formattedAmount}. Please settle it at your earliest convenience. Thank you! - ${profile.ownerName}`;
    }
  };

  const messageText = getMessageText();

  const handleCopy = () => {
    navigator.clipboard.writeText(messageText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSendWhatsApp = () => {
    const encoded = encodeURIComponent(messageText);
    const url = `https://wa.me/${internationalPhone}?text=${encoded}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    onClose();
  };

  const handleSendSMS = () => {
    const encoded = encodeURIComponent(messageText);
    // Standard SMS URI
    window.location.href = `sms:${cleanPhone}?body=${encoded}`;
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 no-print">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-700 dark:text-emerald-400">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Send Payment Reminder</h2>
              <p className="text-xs text-slate-500">
                To: <span className="font-semibold text-slate-800 dark:text-slate-200">{customer.name}</span> (₹{balance.toLocaleString('en-IN')})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 min-w-[36px] min-h-[36px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Language Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Reminder Language
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { code: 'hi' as Language, label: 'हिंदी (Hindi)' },
                { code: 'bn' as Language, label: 'বাংলা (Bengali)' },
                { code: 'en' as Language, label: 'English' },
              ].map((item) => (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => setReminderLang(item.code)}
                  className={`py-2 px-2 text-xs font-bold rounded-xl border text-center transition-all ${
                    reminderLang === item.code
                      ? 'bg-emerald-50 dark:bg-emerald-950/70 border-emerald-500 text-emerald-700 dark:text-emerald-300 shadow-xs'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Template Style */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Reminder Tone
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'standard' as const, label: 'Standard' },
                { id: 'polite' as const, label: 'Polite' },
                { id: 'upi' as const, label: 'With UPI ID' },
              ].map((style) => (
                <button
                  key={style.id}
                  type="button"
                  onClick={() => setReminderType(style.id)}
                  className={`py-1.5 px-2 text-xs font-semibold rounded-lg border transition-all ${
                    reminderType === style.id
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {style.label}
                </button>
              ))}
            </div>
          </div>

          {/* Message Preview Box */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Message Preview
              </label>
              <button
                type="button"
                onClick={handleCopy}
                className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 hover:underline"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Text'}</span>
              </button>
            </div>
            <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-slate-800/80 border border-emerald-200/70 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-sans">
              {messageText}
            </div>
          </div>

          {/* Privacy & Confirmation Notice */}
          <div className="flex items-start gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              A reminder will open directly in WhatsApp or SMS app for your final confirmation before dispatch.
            </span>
          </div>

          {/* Send Buttons */}
          <div className="pt-2 space-y-2">
            <button
              onClick={handleSendWhatsApp}
              className="w-full py-3 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-sm shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
            >
              <Send className="w-4 h-4" />
              <span>Send via WhatsApp (+91 {customer.phone})</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </button>

            <button
              onClick={handleSendSMS}
              className="w-full py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center gap-2 transition-colors"
            >
              <span>Send via Regular SMS</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
