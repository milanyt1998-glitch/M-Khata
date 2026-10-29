import React from 'react';
import { X, Printer, Share2, ArrowDownRight, ArrowUpRight, IndianRupee } from 'lucide-react';
import { useKhata } from '../context/KhataContext';
import { Customer } from '../types';

interface StatementModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer;
}

export const StatementModal: React.FC<StatementModalProps> = ({ isOpen, onClose, customer }) => {
  const { profile, getCustomerTransactions, getCustomerBalance } = useKhata();

  if (!isOpen) return null;

  const transactions = getCustomerTransactions(customer.id);
  const currentBalance = getCustomerBalance(customer.id);

  // Compute totals
  let totalGiven = 0;
  let totalReceived = 0;

  transactions.forEach((tx) => {
    if (tx.type === 'UDHAAR') totalGiven += Number(tx.amount || 0);
    else totalReceived += Number(tx.amount || 0);
  });

  // Calculate chronological running balances
  const chronologicalTxs = [...transactions].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  let running = 0;
  const txsWithBalance = chronologicalTxs.map((tx) => {
    if (tx.type === 'UDHAAR') running += Number(tx.amount);
    else running -= Number(tx.amount);
    return { ...tx, runningBalance: running };
  });

  // Reverse back to newest first for table display
  const displayRows = [...txsWithBalance].reverse();

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    const text = `*${profile.businessName} - Account Statement*\nCustomer: ${customer.name}\nTotal Given (Udhaar): ₹${totalGiven.toLocaleString('en-IN')}\nTotal Received (Jama): ₹${totalReceived.toLocaleString('en-IN')}\n*Net Outstanding Balance: ₹${Math.abs(currentBalance).toLocaleString('en-IN')} ${currentBalance > 0 ? '(Due)' : currentBalance < 0 ? '(Advance)' : '(Settled)'}*\nDate: ${new Date().toLocaleDateString('en-IN')}\nContact: ${profile.phone}`;
    const cleanPhone = customer.phone.replace(/\D/g, '');
    const intPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    window.open(`https://wa.me/${intPhone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Top Floating Control Bar (Hidden in Print) */}
        <div className="px-5 py-3 bg-slate-900 text-white flex items-center justify-between no-print shrink-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold tracking-tight">Customer Account Statement</h3>
            <span className="text-xs text-slate-400">· {customer.name}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-sm"
              title="Print or Save as PDF"
            >
              <Printer className="w-4 h-4" />
              <span>Print / PDF</span>
            </button>

            <button
              onClick={handleShareWhatsApp}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-bold transition-all"
              title="Share via WhatsApp"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>

            <button
              onClick={onClose}
              aria-label="Close Statement"
              className="p-1 rounded-full text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Statement Sheet */}
        <div
          id="statement-print-area"
          className="flex-1 overflow-y-auto p-6 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans text-xs space-y-5"
        >
          {/* Shop Bill Header */}
          <div className="border-b-2 border-slate-900 dark:border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-700 dark:text-emerald-400">
                Official Digital Khata Statement
              </span>
              <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                {profile.businessName}
              </h1>
              <p className="text-xs text-slate-600 dark:text-slate-400">{profile.address}</p>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Proprietor: <span className="font-semibold">{profile.ownerName}</span> · Phone: {profile.phone}
              </p>
              {profile.upiId && (
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  UPI ID: <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">{profile.upiId}</span>
                </p>
              )}
            </div>

            <div className="sm:text-right bg-slate-50 dark:bg-slate-800/80 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
              <p className="text-[11px] text-slate-500 uppercase font-semibold">Statement Date</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                {new Date().toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </p>
              <p className="text-[11px] text-slate-500 mt-1 uppercase font-semibold">Total Entries</p>
              <p className="text-sm font-bold tabular-nums text-slate-900 dark:text-white">
                {transactions.length} Records
              </p>
            </div>
          </div>

          {/* Customer Meta Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Account Holder</p>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">{customer.name}</h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-mono">Mobile: +91 {customer.phone}</p>
              {customer.address && (
                <p className="text-xs text-slate-600 dark:text-slate-400">Address: {customer.address}</p>
              )}
            </div>

            <div className="sm:text-right flex flex-col sm:items-end justify-center">
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Net Outstanding Balance</p>
              <p
                className={`text-2xl font-black tabular-nums ${
                  currentBalance > 0
                    ? 'text-rose-600 dark:text-rose-400'
                    : currentBalance < 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                ₹{Math.abs(currentBalance).toLocaleString('en-IN')}
              </p>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                {currentBalance > 0
                  ? 'Due to Merchant (Aapko Milenge)'
                  : currentBalance < 0
                  ? 'Advance with Merchant'
                  : 'Account Fully Settled (₹0)'}
              </p>
            </div>
          </div>

          {/* Financial Totals Strip */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900">
              <span className="text-[10px] font-bold text-rose-700 dark:text-rose-300 uppercase">
                Total Udhaar (Given)
              </span>
              <p className="text-lg font-black text-rose-700 dark:text-rose-400 tabular-nums">
                ₹{totalGiven.toLocaleString('en-IN')}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900">
              <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 uppercase">
                Total Jama (Received)
              </span>
              <p className="text-lg font-black text-emerald-700 dark:text-emerald-400 tabular-nums">
                ₹{totalReceived.toLocaleString('en-IN')}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase">
                Balance Status
              </span>
              <p className="text-lg font-black text-slate-900 dark:text-white tabular-nums">
                {currentBalance === 0 ? 'Settled' : currentBalance > 0 ? 'Pending' : 'Advance'}
              </p>
            </div>
          </div>

          {/* Detailed Transaction Table */}
          <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 text-[11px] font-bold">
                  <th className="py-2.5 px-3">Date & Time</th>
                  <th className="py-2.5 px-3">Description / Bill</th>
                  <th className="py-2.5 px-3">Mode</th>
                  <th className="py-2.5 px-3 text-right text-rose-600">You Gave (₹)</th>
                  <th className="py-2.5 px-3 text-right text-emerald-600">You Got (₹)</th>
                  <th className="py-2.5 px-3 text-right">Balance (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {displayRows.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-slate-400">
                      No transaction records found for this customer.
                    </td>
                  </tr>
                ) : (
                  displayRows.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="py-2 px-3 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                        {new Date(row.date).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: '2-digit',
                        })}{' '}
                        <span className="text-slate-400">
                          {new Date(row.date).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </td>
                      <td className="py-2 px-3">
                        <p className="font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">
                          {row.description || (row.type === 'UDHAAR' ? 'Goods purchased on credit' : 'Payment received')}
                        </p>
                        {row.billNumber && (
                          <span className="text-[10px] text-slate-400 font-mono">Bill #{row.billNumber}</span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-slate-500 text-[11px] font-medium">{row.paymentMode}</td>
                      <td className="py-2 px-3 text-right font-bold text-rose-600 tabular-nums">
                        {row.type === 'UDHAAR' ? `₹${row.amount.toLocaleString('en-IN')}` : '-'}
                      </td>
                      <td className="py-2 px-3 text-right font-bold text-emerald-600 tabular-nums">
                        {row.type === 'JAMA' ? `₹${row.amount.toLocaleString('en-IN')}` : '-'}
                      </td>
                      <td className="py-2 px-3 text-right font-black tabular-nums text-slate-900 dark:text-white">
                        ₹{Math.abs(row.runningBalance).toLocaleString('en-IN')}
                        <span className="text-[10px] font-normal text-slate-400 ml-1">
                          {row.runningBalance > 0 ? 'Dr' : row.runningBalance < 0 ? 'Cr' : ''}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Statement Footer: Merchant Signature & Note */}
          <div className="pt-6 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-end justify-between gap-6 text-[11px] text-slate-500">
            <div>
              <p className="font-semibold text-slate-700 dark:text-slate-300">Terms & Verification:</p>
              <p>• Computer generated statement from {profile.businessName}.</p>
              <p>• Please report any discrepancies within 7 days of statement generation.</p>
              <p>• For online payments, use verified UPI ID: {profile.upiId}</p>
            </div>

            <div className="text-center w-48 sm:text-right">
              <div className="h-14 border-b border-dashed border-slate-400 dark:border-slate-600 mb-1" />
              <p className="font-bold text-slate-800 dark:text-slate-200">{profile.ownerName}</p>
              <p className="text-[10px] text-slate-400">Authorized Merchant Signature</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
