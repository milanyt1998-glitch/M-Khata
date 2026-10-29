import React, { useState, useMemo } from 'react';
import {
  FileSpreadsheet,
  Download,
  Calendar,
  Filter,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Printer,
} from 'lucide-react';
import { useKhata } from '../context/KhataContext';

export const ReportsScreen: React.FC = () => {
  const { transactions, customers, totals, exportTransactionsCSV, t } = useKhata();

  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'all'>('month');

  // Filter transactions based on date range
  const filteredTransactions = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const weekStart = todayStart - 7 * 24 * 3600 * 1000;
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    return transactions.filter((tx) => {
      const txTime = new Date(tx.date).getTime();
      if (dateRange === 'today') return txTime >= todayStart;
      if (dateRange === 'week') return txTime >= weekStart;
      if (dateRange === 'month') return txTime >= monthStart;
      return true;
    });
  }, [transactions, dateRange]);

  // Aggregate metrics for filtered range
  const rangeMetrics = useMemo(() => {
    let totalUdhaar = 0;
    let totalJama = 0;
    let udhaarCount = 0;
    let jamaCount = 0;

    filteredTransactions.forEach((tx) => {
      if (tx.type === 'UDHAAR') {
        totalUdhaar += Number(tx.amount || 0);
        udhaarCount++;
      } else {
        totalJama += Number(tx.amount || 0);
        jamaCount++;
      }
    });

    const netCashflow = totalJama - totalUdhaar;
    const totalVolume = totalUdhaar + totalJama;
    const jamaPercent = totalVolume > 0 ? Math.round((totalJama / totalVolume) * 100) : 0;
    const udhaarPercent = totalVolume > 0 ? Math.round((totalUdhaar / totalVolume) * 100) : 0;

    return {
      totalUdhaar,
      totalJama,
      udhaarCount,
      jamaCount,
      netCashflow,
      jamaPercent,
      udhaarPercent,
      totalEntries: filteredTransactions.length,
    };
  }, [filteredTransactions]);

  const customerMap = useMemo(() => new Map(customers.map((c) => [c.id, c])), [customers]);

  const handleExportCSV = () => {
    exportTransactionsCSV();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950 overflow-y-auto no-scrollbar p-4 space-y-4">
      {/* Top Range Tabs & Actions */}
      <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {/* Date Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-x-auto no-scrollbar">
          {[
            { id: 'today' as const, label: 'Today' },
            { id: 'week' as const, label: 'This Week' },
            { id: 'month' as const, label: 'This Month' },
            { id: 'all' as const, label: 'All Time' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setDateRange(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                dateRange === tab.id
                  ? 'bg-white dark:bg-slate-900 text-emerald-800 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all active:scale-95"
            title="Download Excel / CSV Spreadsheet"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{t('exportCSV')}</span>
          </button>

          <button
            onClick={handlePrint}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
            title="Print Report"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Highlights for selected range */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              {t('totalCollections')}
            </span>
            <ArrowUpRight className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
            ₹{rangeMetrics.totalJama.toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">{rangeMetrics.jamaCount} payment entries</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-rose-600 dark:text-rose-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              {t('totalCredit')}
            </span>
            <ArrowDownRight className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black text-rose-600 dark:text-rose-400 tabular-nums">
            ₹{rangeMetrics.totalUdhaar.toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">{rangeMetrics.udhaarCount} credit entries</p>
        </div>
      </div>

      {/* Visual Udhaar vs Jama Ratio Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
          <span>Business Cash Flow Ratio</span>
          <span className="text-slate-500 font-mono text-[11px]">
            {rangeMetrics.totalEntries} Transactions
          </span>
        </div>

        {/* Dual Progress Bar */}
        <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
          <div
            style={{ width: `${rangeMetrics.jamaPercent}%` }}
            className="bg-emerald-600 h-full transition-all duration-300"
            title={`Jama: ${rangeMetrics.jamaPercent}%`}
          />
          <div
            style={{ width: `${rangeMetrics.udhaarPercent}%` }}
            className="bg-rose-500 h-full transition-all duration-300"
            title={`Udhaar: ${rangeMetrics.udhaarPercent}%`}
          />
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between text-xs font-semibold">
          <div className="flex items-center gap-1.5 text-emerald-600">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
            <span>Jama {rangeMetrics.jamaPercent}%</span>
          </div>

          <div className="flex items-center gap-1.5 text-rose-600">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span>Udhaar {rangeMetrics.udhaarPercent}%</span>
          </div>
        </div>
      </div>

      {/* Transaction Records Table */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Detailed Ledger Log</h3>
          <span className="text-xs text-slate-400 font-mono">
            {filteredTransactions.length} Records
          </span>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            No transaction records found in this time range.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-96 overflow-y-auto no-scrollbar">
            {filteredTransactions.map((tx) => {
              const cust = customerMap.get(tx.customerId);
              const isUdhaar = tx.type === 'UDHAAR';
              return (
                <div key={tx.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="min-w-0 pr-2">
                    <p className="font-bold text-slate-900 dark:text-white truncate">
                      {cust?.name || 'Customer'}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate">
                      {new Date(tx.date).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}{' '}
                      · <span className="uppercase">{tx.paymentMode}</span>
                      {tx.billNumber && ` · Bill #${tx.billNumber}`}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <p
                      className={`font-black tabular-nums ${
                        isUdhaar ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {isUdhaar ? '-' : '+'}₹{tx.amount.toLocaleString('en-IN')}
                    </p>
                    <span className="text-[10px] text-slate-400">
                      {isUdhaar ? 'Udhaar (Given)' : 'Jama (Got)'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
