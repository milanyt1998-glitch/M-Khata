import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  UserPlus,
  Plus,
  Search,
  Users,
  QrCode,
  Calendar,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  Cloud,
} from 'lucide-react';
import { useKhata } from '../context/KhataContext';
import { Customer, Transaction, TransactionType } from '../types';
import { TransactionModal } from './TransactionModal';
import { CustomerModal } from './CustomerModal';

interface DashboardProps {
  onSelectCustomer: (customerId: string) => void;
  onOpenQR: () => void;
  onOpenAPK?: () => void;
  onOpenWindows?: () => void;
  onOpenDrive?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onSelectCustomer,
  onOpenQR,
  onOpenAPK,
  onOpenWindows,
  onOpenDrive,
}) => {
  const {
    customers,
    transactions,
    totals,
    getCustomerBalance,
    setActiveTab,
    t,
  } = useKhata();

  const [searchQuery, setSearchQuery] = useState('');
  const [isAddTxOpen, setIsAddTxOpen] = useState(false);
  const [defaultTxType, setDefaultTxType] = useState<TransactionType>('UDHAAR');
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);

  // Top Customers with pending balance (Debtors)
  const pendingCustomers = customers
    .map((c) => ({ customer: c, balance: getCustomerBalance(c.id) }))
    .filter((item) => item.balance > 0)
    .sort((a, b) => b.balance - a.balance)
    .slice(0, 5);

  // Recent transactions (last 5)
  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 6);

  const customerMap = new Map(customers.map((c) => [c.id, c]));

  const handleOpenAddEntry = (type: TransactionType) => {
    setDefaultTxType(type);
    setIsAddTxOpen(true);
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950 overflow-y-auto no-scrollbar p-4 space-y-4">
      {/* App Installation Banner (Android & Windows) */}
      {(onOpenAPK || onOpenWindows) && (
        <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-700 via-teal-700 to-blue-700 text-white shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
          <div className="min-w-0">
            <p className="text-xs font-bold leading-tight flex items-center gap-1.5">
              <span>🚀</span>
              <span>Install M Khata App (Mobile & Windows PC)</span>
            </p>
            <p className="text-[11px] text-emerald-100 truncate mt-0.5">
              अपने मोबाइल (Android APK) या कंप्यूटर (Windows 10/11) में इंस्टॉल करें
            </p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {onOpenAPK && (
              <button
                onClick={onOpenAPK}
                className="flex-1 sm:flex-none px-3 py-1.5 rounded-xl bg-white text-emerald-800 text-xs font-black shadow-xs whitespace-nowrap active:scale-95 transition-all text-center"
              >
                📱 Android APK
              </button>
            )}
            {onOpenWindows && (
              <button
                onClick={onOpenWindows}
                className="flex-1 sm:flex-none px-3 py-1.5 rounded-xl bg-blue-900/90 hover:bg-blue-950 text-white border border-blue-400/40 text-xs font-black shadow-xs whitespace-nowrap active:scale-95 transition-all text-center"
              >
                💻 Windows PC
              </button>
            )}
            {onOpenDrive && (
              <button
                onClick={onOpenDrive}
                className="flex-1 sm:flex-none px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-950 text-white border border-slate-600/60 text-xs font-black shadow-xs whitespace-nowrap active:scale-95 transition-all text-center flex items-center justify-center gap-1"
              >
                <Cloud className="w-3.5 h-3.5 text-sky-400" />
                <span>Drive Cloud</span>
              </button>
            )}
          </div>
        </div>
      )}
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* You'll Get (Total Udhaar) */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-rose-50 to-white dark:from-rose-950/40 dark:to-slate-900 border border-rose-200/80 dark:border-rose-900/60 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-rose-600 dark:text-rose-400 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider">
                {t('youWillGet')}
              </span>
              <ArrowDownRight className="w-4 h-4" />
            </div>
            <p className="text-2xl font-black text-rose-600 dark:text-rose-400 tabular-nums tracking-tight">
              ₹{totals.totalUdhaar.toLocaleString('en-IN')}
            </p>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
            {totals.activeDebtorCount} customers owe you
          </p>
        </div>

        {/* You'll Give (Advance Payments) */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950/40 dark:to-slate-900 border border-emerald-200/80 dark:border-emerald-900/60 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider">
                {t('youWillGive')}
              </span>
              <ArrowUpRight className="w-4 h-4" />
            </div>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums tracking-tight">
              ₹{totals.totalAdvance.toLocaleString('en-IN')}
            </p>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
            Customer Advance Deposits
          </p>
        </div>
      </div>

      {/* Today's Transactions Strip */}
      <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200">
            <Calendar className="w-3.5 h-3.5 text-emerald-600" />
            <span>{t('todayTransactions')}</span>
          </div>
          <span className="text-[11px] text-slate-400 tabular-nums">
            {totals.todayCount} entries today
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 text-[11px]">{t('todayUdhaar')}</span>
            <span className="font-extrabold text-rose-600 tabular-nums">
              ₹{totals.todayUdhaar.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500 text-[11px]">{t('todayJama')}</span>
            <span className="font-extrabold text-emerald-600 tabular-nums">
              ₹{totals.todayJama.toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Merchant Action Buttons */}
      <div className="grid grid-cols-3 gap-2.5">
        <button
          onClick={() => setIsAddCustomerOpen(true)}
          className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 shadow-xs flex flex-col items-center justify-center gap-1.5 text-center active:scale-95 transition-all"
        >
          <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <UserPlus className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
            {t('addCustomer')}
          </span>
        </button>

        <button
          onClick={() => handleOpenAddEntry('UDHAAR')}
          className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-rose-500 shadow-xs flex flex-col items-center justify-center gap-1.5 text-center active:scale-95 transition-all"
        >
          <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950 flex items-center justify-center text-rose-600 dark:text-rose-400">
            <ArrowDownRight className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
            + Udhaar (Gave)
          </span>
        </button>

        <button
          onClick={() => handleOpenAddEntry('JAMA')}
          className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 shadow-xs flex flex-col items-center justify-center gap-1.5 text-center active:scale-95 transition-all"
        >
          <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <ArrowUpRight className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
            + Jama (Got)
          </span>
        </button>
      </div>

      {/* Top Pending Udhaar (Debtors Section) */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {t('topDebtors')}
            </h3>
            <span className="text-xs text-slate-400">({pendingCustomers.length})</span>
          </div>

          <button
            onClick={() => setActiveTab('customers')}
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-0.5"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {pendingCustomers.length === 0 ? (
          <div className="py-6 text-center text-slate-400 text-xs">
            No pending udhaar balance! All customer accounts are settled.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {pendingCustomers.map(({ customer, balance }) => (
              <div
                key={customer.id}
                onClick={() => onSelectCustomer(customer.id)}
                className="py-2.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-lg px-1 cursor-pointer transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {customer.name}
                  </p>
                  <p className="text-[11px] text-slate-400 font-mono">+91 {customer.phone}</p>
                </div>

                <div className="text-right shrink-0">
                  <p className="text-xs font-black text-rose-600 dark:text-rose-400 tabular-nums">
                    ₹{balance.toLocaleString('en-IN')}
                  </p>
                  <span className="text-[10px] text-slate-400 font-semibold">Due to receive</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Business Activity */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            {t('recentActivity')}
          </h3>
          <button
            onClick={() => setActiveTab('reports')}
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-0.5"
          >
            <span>Reports</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {recentTransactions.map((tx) => {
            const cust = customerMap.get(tx.customerId);
            const isUdhaar = tx.type === 'UDHAAR';
            return (
              <div
                key={tx.id}
                onClick={() => {
                  if (cust) onSelectCustomer(cust.id);
                }}
                className="py-2.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-lg px-1 cursor-pointer transition-colors"
              >
                <div className="min-w-0 pr-2">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                    {cust?.name || 'Customer'}
                  </p>
                  <p className="text-[11px] text-slate-400 line-clamp-1">
                    {tx.description || (isUdhaar ? 'Credit given' : 'Payment received')}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <p
                    className={`text-xs font-black tabular-nums ${
                      isUdhaar ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                    }`}
                  >
                    {isUdhaar ? '-' : '+'}₹{tx.amount.toLocaleString('en-IN')}
                  </p>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {new Date(tx.date).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Modals */}
      <TransactionModal
        isOpen={isAddTxOpen}
        onClose={() => setIsAddTxOpen(false)}
        defaultType={defaultTxType}
      />

      <CustomerModal
        isOpen={isAddCustomerOpen}
        onClose={() => setIsAddCustomerOpen(false)}
        onCustomerSaved={(newId) => onSelectCustomer(newId)}
      />
    </div>
  );
};
