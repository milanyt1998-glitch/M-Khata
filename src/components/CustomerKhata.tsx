import React, { useState } from 'react';
import {
  Phone,
  MessageCircle,
  FileSpreadsheet,
  Edit2,
  Trash2,
  Calendar,
  AlertCircle,
  Tag,
  CheckCircle2,
  ChevronRight,
  ImageIcon,
  X,
} from 'lucide-react';
import { useKhata } from '../context/KhataContext';
import { Customer, Transaction, TransactionType } from '../types';
import { TransactionModal } from './TransactionModal';
import { CustomerModal } from './CustomerModal';
import { PaymentReminderModal } from './PaymentReminderModal';
import { StatementModal } from './StatementModal';

interface CustomerKhataProps {
  customer: Customer;
  onBack: () => void;
}

export const CustomerKhata: React.FC<CustomerKhataProps> = ({ customer, onBack }) => {
  const {
    getCustomerBalance,
    getCustomerTransactions,
    deleteCustomer,
    deleteTransaction,
    t,
  } = useKhata();

  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [txType, setTxType] = useState<TransactionType>('UDHAAR');
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isReminderOpen, setIsReminderOpen] = useState(false);
  const [isStatementOpen, setIsStatementOpen] = useState(false);

  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [txToDelete, setTxToDelete] = useState<Transaction | null>(null);
  const [confirmDeleteCustomer, setConfirmDeleteCustomer] = useState(false);

  const transactions = getCustomerTransactions(customer.id);
  const balance = getCustomerBalance(customer.id);

  const handleOpenAddTx = (type: TransactionType) => {
    setEditingTx(null);
    setTxType(type);
    setIsTxModalOpen(true);
  };

  const handleEditTx = (tx: Transaction) => {
    setEditingTx(tx);
    setTxType(tx.type);
    setIsTxModalOpen(true);
  };

  const handleDeleteCustConfirm = () => {
    deleteCustomer(customer.id);
    onBack();
  };

  const handleDeleteTxConfirm = () => {
    if (txToDelete) {
      deleteTransaction(txToDelete.id);
      setTxToDelete(null);
    }
  };

  // Group transactions by Date (e.g., 'Today', 'Yesterday', or '24 Oct 2026')
  const groupTransactionsByDate = () => {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    const groups: { [key: string]: Transaction[] } = {};

    transactions.forEach((tx) => {
      const day = tx.date ? tx.date.split('T')[0] : 'Other';
      let label = day;
      if (day === today) label = 'Today';
      else if (day === yesterday) label = 'Yesterday';
      else {
        const d = new Date(day);
        label = d.toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        });
      }

      if (!groups[label]) groups[label] = [];
      groups[label].push(tx);
    });

    return groups;
  };

  const dateGroups = groupTransactionsByDate();

  return (
    <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950 min-h-0">
      {/* Customer Header Info Card */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 shadow-xs">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white truncate">
              {customer.name}
            </h2>
            <p className="text-xs text-slate-500 font-mono flex items-center gap-1 mt-0.5">
              <span>+91 {customer.phone}</span>
            </p>
            {customer.address && (
              <p className="text-xs text-slate-500 truncate mt-0.5">{customer.address}</p>
            )}
            {customer.notes && (
              <p className="text-[11px] text-slate-400 italic truncate mt-0.5">"{customer.notes}"</p>
            )}
          </div>

          {/* Quick Action Icon Cluster */}
          <div className="flex items-center gap-1 shrink-0">
            <a
              href={`tel:${customer.phone}`}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950 text-slate-700 dark:text-slate-300 hover:text-emerald-600 transition-colors"
              title="Call Customer"
            >
              <Phone className="w-4 h-4" />
            </a>

            <button
              onClick={() => setIsCustomerModalOpen(true)}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950 text-slate-700 dark:text-slate-300 hover:text-blue-600 transition-colors"
              title="Edit Customer"
            >
              <Edit2 className="w-4 h-4" />
            </button>

            <button
              onClick={() => setConfirmDeleteCustomer(true)}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950 text-slate-700 dark:text-slate-300 hover:text-rose-600 transition-colors"
              title="Delete Customer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Current Balance Banner */}
        <div
          className={`mt-3.5 p-3.5 rounded-2xl border flex items-center justify-between ${
            balance > 0
              ? 'bg-rose-50/80 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/60'
              : balance < 0
              ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/60'
              : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
          }`}
        >
          <div>
            <span className="text-[10px] font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400">
              {balance > 0
                ? "You'll Get (Aapko Lene Hain)"
                : balance < 0
                ? "You'll Give (Aapko Dene Hain)"
                : 'Account Balance'}
            </span>
            <p
              className={`text-2xl font-black tabular-nums tracking-tight ${
                balance > 0
                  ? 'text-rose-600 dark:text-rose-400'
                  : balance < 0
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-slate-700 dark:text-slate-300'
              }`}
            >
              ₹{Math.abs(balance).toLocaleString('en-IN')}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {balance > 0 && (
              <button
                onClick={() => setIsReminderOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm active:scale-95 transition-all"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>Remind</span>
              </button>
            )}

            <button
              onClick={() => setIsStatementOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold shadow-xs hover:bg-slate-50 transition-all"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">Statement</span>
            </button>
          </div>
        </div>
      </div>

      {/* Ledger Column Headings */}
      <div className="grid grid-cols-2 text-center text-xs font-bold py-2 px-4 bg-slate-100 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">
        <span className="text-rose-600 dark:text-rose-400">YOU GAVE ₹ (मैंने दिए)</span>
        <span className="text-emerald-600 dark:text-emerald-400">YOU GOT ₹ (मुझे मिले)</span>
      </div>

      {/* Transaction List (Scrollable Area) */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {transactions.length === 0 ? (
          <div className="py-12 text-center text-slate-400 dark:text-slate-500 space-y-2">
            <Calendar className="w-10 h-10 mx-auto opacity-30" />
            <p className="text-sm font-semibold">{t('emptyTransactions')}</p>
            <p className="text-xs">Record credit or cash payments using the buttons below.</p>
          </div>
        ) : (
          Object.entries(dateGroups).map(([dateLabel, txs]) => (
            <div key={dateLabel} className="space-y-2">
              {/* Date Group Header */}
              <div className="flex items-center justify-center my-1">
                <span className="px-3 py-0.5 rounded-full bg-slate-200/80 dark:bg-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-400">
                  {dateLabel}
                </span>
              </div>

              {/* Transactions on this day */}
              {txs.map((tx) => {
                const isUdhaar = tx.type === 'UDHAAR';
                return (
                  <div
                    key={tx.id}
                    onClick={() => handleEditTx(tx)}
                    className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 cursor-pointer transition-all active:scale-[0.99]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2">
                          {tx.description || (isUdhaar ? 'Goods bought on credit' : 'Payment received')}
                        </p>

                        <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[10px] text-slate-400 font-medium">
                          <span>
                            {new Date(tx.date).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          <span>·</span>
                          <span className="uppercase">{tx.paymentMode}</span>
                          {tx.billNumber && (
                            <>
                              <span>·</span>
                              <span className="font-mono text-slate-500 dark:text-slate-300">
                                Bill #{tx.billNumber}
                              </span>
                            </>
                          )}
                          {tx.billPhotoUrl && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedPhoto(tx.billPhotoUrl || null);
                              }}
                              className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-0.5 hover:underline"
                            >
                              <ImageIcon className="w-3 h-3" />
                              <span>Photo</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Amount column */}
                      <div className="text-right shrink-0">
                        <p
                          className={`text-base font-black tabular-nums ${
                            isUdhaar ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                          }`}
                        >
                          ₹{tx.amount.toLocaleString('en-IN')}
                        </p>
                        <span className="text-[10px] font-semibold text-slate-400">
                          {isUdhaar ? 'Udhaar' : 'Jama'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
      </div>

      {/* Sticky Bottom Actions Bar (Signature Red & Green Buttons) */}
      <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shadow-lg shrink-0">
        <div className="grid grid-cols-2 gap-3 max-w-lg mx-auto">
          <button
            onClick={() => handleOpenAddTx('UDHAAR')}
            className="py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-sm shadow-md shadow-rose-600/20 active:scale-[0.98] transition-all flex flex-col items-center justify-center leading-tight"
          >
            <span>YOU GAVE ₹</span>
            <span className="text-[11px] font-normal opacity-90">मैंने दिए (उधार)</span>
          </button>

          <button
            onClick={() => handleOpenAddTx('JAMA')}
            className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-md shadow-emerald-600/20 active:scale-[0.98] transition-all flex flex-col items-center justify-center leading-tight"
          >
            <span>YOU RECEIVED ₹</span>
            <span className="text-[11px] font-normal opacity-90">मुझे मिले (जमा)</span>
          </button>
        </div>
      </div>

      {/* Modals */}
      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => {
          setIsTxModalOpen(false);
          setEditingTx(null);
        }}
        defaultType={txType}
        customerId={customer.id}
        transactionToEdit={editingTx}
      />

      <CustomerModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        customerToEdit={customer}
      />

      <PaymentReminderModal
        isOpen={isReminderOpen}
        onClose={() => setIsReminderOpen(false)}
        customer={customer}
        balance={balance}
      />

      <StatementModal
        isOpen={isStatementOpen}
        onClose={() => setIsStatementOpen(false)}
        customer={customer}
      />

      {/* Full Photo Preview Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="relative max-w-md w-full bg-slate-900 rounded-2xl overflow-hidden p-2">
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-black/60 text-white hover:bg-black"
            >
              <X className="w-5 h-5" />
            </button>
            <img src={selectedPhoto} alt="Bill attachment preview" className="w-full h-auto max-h-[80vh] object-contain rounded-xl" />
          </div>
        </div>
      )}

      {/* Customer Deletion Confirmation Modal */}
      {confirmDeleteCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Delete Customer Account</h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Are you sure you want to delete <span className="font-bold text-slate-900 dark:text-white">{customer.name}</span>? All {transactions.length} transaction entries will be permanently erased.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setConfirmDeleteCustomer(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteCustConfirm}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-xs font-bold text-white shadow-sm"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
