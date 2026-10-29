import React, { useState, useEffect } from 'react';
import { X, IndianRupee, Calendar, FileText, Camera, Check, Tag } from 'lucide-react';
import { useKhata } from '../context/KhataContext';
import { Transaction, TransactionType, PaymentMode } from '../types';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: TransactionType;
  customerId?: string;
  transactionToEdit?: Transaction | null;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  defaultType = 'UDHAAR',
  customerId,
  transactionToEdit,
}) => {
  const { customers, addTransaction, updateTransaction, t } = useKhata();

  const [selectedCustId, setSelectedCustId] = useState(customerId || '');
  const [type, setType] = useState<TransactionType>(defaultType);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [billNumber, setBillNumber] = useState('');
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('CASH');
  const [dateStr, setDateStr] = useState('');
  const [billPhotoUrl, setBillPhotoUrl] = useState<string | undefined>(undefined);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (transactionToEdit) {
      setSelectedCustId(transactionToEdit.customerId);
      setType(transactionToEdit.type);
      setAmount(String(transactionToEdit.amount));
      setDescription(transactionToEdit.description || '');
      setBillNumber(transactionToEdit.billNumber || '');
      setPaymentMode(transactionToEdit.paymentMode || 'CASH');
      setDateStr(transactionToEdit.date ? transactionToEdit.date.slice(0, 16) : '');
      setBillPhotoUrl(transactionToEdit.billPhotoUrl);
    } else {
      setSelectedCustId(customerId || (customers.length > 0 ? customers[0].id : ''));
      setType(defaultType);
      setAmount('');
      setDescription('');
      setBillNumber('');
      setPaymentMode(defaultType === 'JAMA' ? 'UPI' : 'CASH');
      // Format current local datetime for datetime-local input
      const now = new Date();
      const localIso = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
      setDateStr(localIso);
      setBillPhotoUrl(undefined);
    }
    setError('');
    setIsSubmitting(false);
  }, [transactionToEdit, defaultType, customerId, isOpen, customers]);

  if (!isOpen) return null;

  const handlePresetAmount = (preset: number) => {
    const current = Number(amount) || 0;
    setAmount(String(current + preset));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        setError('Photo size should be less than 3MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setBillPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustId) {
      setError('Please select a customer');
      return;
    }
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid amount greater than ₹0');
      return;
    }

    setIsSubmitting(true);

    try {
      const txDate = dateStr ? new Date(dateStr).toISOString() : new Date().toISOString();

      if (transactionToEdit) {
        updateTransaction(transactionToEdit.id, {
          customerId: selectedCustId,
          type,
          amount: numAmount,
          description: description.trim(),
          billNumber: billNumber.trim() || undefined,
          paymentMode,
          date: txDate,
          billPhotoUrl,
        });
      } else {
        addTransaction({
          customerId: selectedCustId,
          type,
          amount: numAmount,
          description: description.trim(),
          billNumber: billNumber.trim() || undefined,
          paymentMode,
          date: txDate,
          billPhotoUrl,
        });
      }
      onClose();
    } catch (err) {
      console.error(err);
      setError('Failed to save transaction');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentCustomer = customers.find((c) => c.id === selectedCustId);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 no-print">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-in slide-in-from-bottom duration-200">
        {/* Dynamic Color Banner depending on Udhaar vs Jama */}
        <div
          className={`px-5 py-3.5 flex items-center justify-between text-white transition-colors ${
            type === 'UDHAAR' ? 'bg-rose-600' : 'bg-emerald-600'
          }`}
        >
          <div>
            <span className="text-[11px] font-bold tracking-wider uppercase opacity-90">
              {type === 'UDHAAR' ? 'Udhaar / Credit Given' : 'Payment Received / Jama'}
            </span>
            <h2 className="text-base font-extrabold">
              {type === 'UDHAAR' ? 'You Gave ₹ (मैंने दिए)' : 'You Received ₹ (मुझे मिले)'}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1 rounded-full text-white/80 hover:text-white hover:bg-black/20 min-w-[36px] min-h-[36px] flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Toggle Type: Udhaar vs Jama */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <button
              type="button"
              onClick={() => setType('UDHAAR')}
              className={`py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                type === 'UDHAAR'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-rose-600'
              }`}
            >
              <span>YOU GAVE (उधार)</span>
            </button>
            <button
              type="button"
              onClick={() => setType('JAMA')}
              className={`py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                type === 'JAMA'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-emerald-600'
              }`}
            >
              <span>YOU GOT (जमा)</span>
            </button>
          </div>

          {/* Customer Selection (if not locked by props) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Customer *
            </label>
            {customerId && currentCustomer ? (
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{currentCustomer.name}</p>
                  <p className="text-xs text-slate-500">{currentCustomer.phone}</p>
                </div>
                <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Selected</span>
              </div>
            ) : (
              <select
                value={selectedCustId}
                onChange={(e) => setSelectedCustId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                required
              >
                <option value="">Select Customer</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.phone})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Large Amount Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {t('amount')} *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-700 dark:text-slate-300 font-bold text-xl">
                ₹
              </div>
              <input
                type="number"
                min="0.01"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className={`w-full pl-9 pr-4 py-3 rounded-2xl border-2 text-2xl font-black tabular-nums transition-colors ${
                  type === 'UDHAAR'
                    ? 'border-rose-300 dark:border-rose-900/60 focus:border-rose-600 focus:ring-rose-500/20 text-rose-700 dark:text-rose-400'
                    : 'border-emerald-300 dark:border-emerald-900/60 focus:border-emerald-600 focus:ring-emerald-500/20 text-emerald-700 dark:text-emerald-400'
                } bg-white dark:bg-slate-800 focus:outline-hidden`}
                required
                autoFocus
              />
            </div>

            {/* Quick Amount Preset Chips */}
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              <span className="text-[11px] text-slate-400 font-medium mr-1">Add:</span>
              {[100, 500, 1000, 2000, 5000].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handlePresetAmount(preset)}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors"
                >
                  +₹{preset}
                </button>
              ))}
            </div>
          </div>

          {/* Description / Item Details */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {t('description')}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <FileText className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. 5kg Atta, Fortune Oil 2L / Cement 10 bags"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Payment Mode & Bill Number Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t('paymentMode')}
              </label>
              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value as PaymentMode)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              >
                <option value="CASH">Cash (नकद)</option>
                <option value="UPI">UPI / GPay / PhonePe</option>
                <option value="BANK_TRANSFER">Bank Transfer / NEFT</option>
                <option value="CHEQUE">Cheque</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t('billNumber')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                  <Tag className="w-3.5 h-3.5" />
                </div>
                <input
                  type="text"
                  value={billNumber}
                  onChange={(e) => setBillNumber(e.target.value)}
                  placeholder="e.g. INV-104"
                  className="w-full pl-8 pr-2.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Date & Time */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Date & Time
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Calendar className="w-4 h-4" />
              </div>
              <input
                type="datetime-local"
                value={dateStr}
                onChange={(e) => setDateStr(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Attach Bill Photo */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {t('attachBill')}
            </label>
            {billPhotoUrl ? (
              <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 p-2 flex items-center gap-3">
                <img
                  src={billPhotoUrl}
                  alt="Bill attachment"
                  className="w-14 h-14 object-cover rounded-lg border border-slate-300 dark:border-slate-700"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                    Bill Photo Attached
                  </p>
                  <button
                    type="button"
                    onClick={() => setBillPhotoUrl(undefined)}
                    className="text-xs text-rose-600 hover:text-rose-700 font-medium mt-1"
                  >
                    {t('removePhoto')}
                  </button>
                </div>
              </div>
            ) : (
              <label className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 cursor-pointer bg-slate-50 dark:bg-slate-800/40 transition-colors">
                <Camera className="w-4 h-4 text-slate-500" />
                <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                  Take photo / Upload bill slip
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 py-3 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex-1 py-3 rounded-xl text-white font-extrabold text-sm shadow-md flex items-center justify-center gap-2 active:scale-[0.98] transition-all ${
                type === 'UDHAAR'
                  ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20'
                  : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>{transactionToEdit ? 'Update Entry' : 'Save Entry'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
