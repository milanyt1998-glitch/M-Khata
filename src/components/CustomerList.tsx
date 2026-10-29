import React, { useState } from 'react';
import { Search, UserPlus, Phone, MessageSquare, ChevronRight, Filter, Users } from 'lucide-react';
import { useKhata } from '../context/KhataContext';
import { Customer } from '../types';
import { CustomerModal } from './CustomerModal';
import { PaymentReminderModal } from './PaymentReminderModal';

interface CustomerListProps {
  onSelectCustomer: (customerId: string) => void;
}

export const CustomerList: React.FC<CustomerListProps> = ({ onSelectCustomer }) => {
  const { customers, getCustomerBalance, t } = useKhata();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'due' | 'advance' | 'settled'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'amount_desc' | 'name'>('amount_desc');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [reminderTarget, setReminderTarget] = useState<{ customer: Customer; balance: number } | null>(null);

  // Filter & Search
  const filteredCustomers = customers.filter((cust) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      cust.name.toLowerCase().includes(q) || cust.phone.includes(q) || cust.address.toLowerCase().includes(q);

    if (!matchesSearch) return false;

    const balance = getCustomerBalance(cust.id);
    if (activeFilter === 'due') return balance > 0;
    if (activeFilter === 'advance') return balance < 0;
    if (activeFilter === 'settled') return balance === 0;

    return true;
  });

  // Sorting
  const sortedCustomers = [...filteredCustomers].sort((a, b) => {
    const balA = getCustomerBalance(a.id);
    const balB = getCustomerBalance(b.id);

    if (sortBy === 'amount_desc') {
      return balB - balA;
    }
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    }
    // recent
    return new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime();
  });

  return (
    <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950 min-h-0">
      {/* Search & Filter Header Strip */}
      <div className="p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 space-y-3">
        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-slate-400 hover:text-slate-600"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar pb-0.5">
          <div className="flex items-center gap-1.5 shrink-0">
            {[
              { id: 'all' as const, label: t('allCustomers') },
              { id: 'due' as const, label: t('dueFilter') },
              { id: 'advance' as const, label: t('advanceFilter') },
              { id: 'settled' as const, label: t('settledFilter') },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  activeFilter === tab.id
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Sort Selector */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-300 focus:outline-hidden shrink-0"
          >
            <option value="amount_desc">Highest Udhaar</option>
            <option value="recent">Recent Active</option>
            <option value="name">Name A-Z</option>
          </select>
        </div>
      </div>

      {/* Customer Cards List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
        {sortedCustomers.length === 0 ? (
          <div className="py-16 text-center text-slate-400 dark:text-slate-500 space-y-3">
            <Users className="w-12 h-12 mx-auto opacity-30 text-emerald-600" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{t('emptyCustomers')}</p>
            <p className="text-xs max-w-xs mx-auto">
              Add customers to keep track of their udhaar credit, payment receipts, and send WhatsApp reminders.
            </p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-md hover:bg-emerald-700"
            >
              <UserPlus className="w-4 h-4" />
              <span>{t('addCustomer')}</span>
            </button>
          </div>
        ) : (
          sortedCustomers.map((cust) => {
            const balance = getCustomerBalance(cust.id);
            const initials = cust.name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .slice(0, 2)
              .toUpperCase();

            return (
              <div
                key={cust.id}
                onClick={() => onSelectCustomer(cust.id)}
                className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer flex items-center justify-between gap-3 active:scale-[0.99]"
              >
                {/* Left: Avatar + Details */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-extrabold text-sm flex items-center justify-center shrink-0 border border-emerald-200 dark:border-emerald-900/60">
                    {initials || 'KH'}
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {cust.name}
                    </h3>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">+91 {cust.phone}</p>
                    {cust.address && (
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">{cust.address}</p>
                    )}
                  </div>
                </div>

                {/* Right: Balance & Actions */}
                <div className="text-right shrink-0 flex items-center gap-2">
                  <div>
                    <p
                      className={`text-base font-black tabular-nums tracking-tight ${
                        balance > 0
                          ? 'text-rose-600 dark:text-rose-400'
                          : balance < 0
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      ₹{Math.abs(balance).toLocaleString('en-IN')}
                    </p>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider block ${
                        balance > 0
                          ? 'text-rose-600 dark:text-rose-400'
                          : balance < 0
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-slate-400'
                      }`}
                    >
                      {balance > 0 ? t('dueBadge') : balance < 0 ? t('advanceBadge') : t('settledBadge')}
                    </span>
                  </div>

                  {/* WhatsApp Reminder Quick Trigger if Due */}
                  {balance > 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setReminderTarget({ customer: cust, balance });
                      }}
                      className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 transition-colors"
                      title="Send WhatsApp Reminder"
                    >
                      <MessageSquare className="w-4 h-4 fill-emerald-600 dark:fill-emerald-400" />
                    </button>
                  )}

                  <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Floating Add Customer Action Bar */}
      <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shadow-md flex items-center justify-between gap-3">
        <span className="text-xs text-slate-500 font-semibold pl-2">
          {sortedCustomers.length} of {customers.length} {t('customers')}
        </span>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
        >
          <UserPlus className="w-4 h-4" />
          <span>{t('addCustomer')}</span>
        </button>
      </div>

      {/* Add Customer Modal */}
      <CustomerModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onCustomerSaved={(newId) => onSelectCustomer(newId)}
      />

      {/* Reminder Modal */}
      {reminderTarget && (
        <PaymentReminderModal
          isOpen={true}
          onClose={() => setReminderTarget(null)}
          customer={reminderTarget.customer}
          balance={reminderTarget.balance}
        />
      )}
    </div>
  );
};
