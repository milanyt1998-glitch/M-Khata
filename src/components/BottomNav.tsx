import React from 'react';
import { Home, Users, BarChart3, Settings } from 'lucide-react';
import { useKhata } from '../context/KhataContext';
import { ActiveTab } from '../types';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, setSelectedCustomerId, t } = useKhata();

  const handleTabClick = (tab: ActiveTab) => {
    setSelectedCustomerId(null); // Return to list if in customer details
    setActiveTab(tab);
  };

  const navItems: { id: ActiveTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'home', label: t('dashboard'), icon: Home },
    { id: 'customers', label: t('customers'), icon: Users },
    { id: 'reports', label: t('reports'), icon: BarChart3 },
    { id: 'settings', label: t('settings'), icon: Settings },
  ];

  return (
    <nav className="sticky bottom-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 shadow-lg no-print">
      <div className="grid grid-cols-4 items-center h-16 max-w-lg mx-auto px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`flex flex-col items-center justify-center h-full min-h-[48px] py-1 transition-colors relative ${
                isActive
                  ? 'text-emerald-700 dark:text-emerald-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium'
              }`}
            >
              <div
                className={`p-1 rounded-xl transition-all ${
                  isActive ? 'bg-emerald-50 dark:bg-emerald-950/60 scale-105' : ''
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              </div>
              <span className="text-[11px] tracking-tight mt-0.5 whitespace-nowrap">{item.label}</span>
              {isActive && (
                <div className="w-1.5 h-1.5 bg-emerald-600 dark:bg-emerald-400 rounded-full absolute bottom-1" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
