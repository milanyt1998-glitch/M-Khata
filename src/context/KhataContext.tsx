import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { Customer, Transaction, ShopProfile, UserSession, Language, ActiveTab, TransactionType } from '../types';
import { INITIAL_CUSTOMERS, INITIAL_TRANSACTIONS, INITIAL_SHOP_PROFILE } from '../data/sampleData';
import { translations, TranslationKey } from '../locales/translations';

interface KhataContextType {
  customers: Customer[];
  transactions: Transaction[];
  profile: ShopProfile;
  language: Language;
  theme: 'light' | 'dark';
  isMobileFrame: boolean;
  userSession: UserSession;
  selectedCustomerId: string | null;
  activeTab: ActiveTab;
  
  // Translation helper
  t: (key: TranslationKey) => string;

  // Calculators
  getCustomerBalance: (customerId: string) => number;
  getCustomerTransactions: (customerId: string) => Transaction[];
  totals: {
    totalUdhaar: number;
    totalAdvance: number;
    netBalance: number;
    todayUdhaar: number;
    todayJama: number;
    todayCount: number;
    totalCustomerCount: number;
    activeDebtorCount: number;
  };

  // Actions
  addCustomer: (data: { name: string; phone: string; address: string; notes?: string; openingBalance?: { type: TransactionType; amount: number } }) => Customer;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  addTransaction: (data: Omit<Transaction, 'id' | 'createdAt'>) => Transaction;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  updateProfile: (profile: Partial<ShopProfile>) => void;
  setLanguage: (lang: Language) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setIsMobileFrame: (val: boolean) => void;
  setActiveTab: (tab: ActiveTab) => void;
  setSelectedCustomerId: (id: string | null) => void;
  login: (mobile: string, name?: string) => void;
  logout: () => void;
  exportBackupJSON: () => void;
  restoreBackupJSON: (jsonString: string) => boolean;
  resetToSampleData: () => void;
  exportTransactionsCSV: (startDate?: string, endDate?: string) => void;
}

const STORAGE_KEYS = {
  CUSTOMERS: 'mykhata_customers_v1',
  TRANSACTIONS: 'mykhata_transactions_v1',
  PROFILE: 'mykhata_profile_v1',
  SESSION: 'mykhata_session_v1',
  LANGUAGE: 'mykhata_language_v1',
  THEME: 'mykhata_theme_v1',
  MOBILE_FRAME: 'mykhata_mobile_frame_v1',
};

const KhataContext = createContext<KhataContextType | null>(null);

export const KhataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Initial State Hydration with safe fallbacks
  const [customers, setCustomers] = useState<Customer[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
      return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
    } catch {
      return INITIAL_CUSTOMERS;
    }
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
    } catch {
      return INITIAL_TRANSACTIONS;
    }
  });

  const [profile, setProfile] = useState<ShopProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROFILE);
      return saved ? JSON.parse(saved) : INITIAL_SHOP_PROFILE;
    } catch {
      return INITIAL_SHOP_PROFILE;
    }
  });

  const [userSession, setUserSession] = useState<UserSession>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SESSION);
      return saved ? JSON.parse(saved) : { mobile: '9876543210', name: 'Ramesh Sharma', isLoggedIn: true };
    } catch {
      return { mobile: '9876543210', name: 'Ramesh Sharma', isLoggedIn: true };
    }
  });

  const [language, setLanguageState] = useState<Language>(() => {
    try {
      return (localStorage.getItem(STORAGE_KEYS.LANGUAGE) as Language) || 'hi';
    } catch {
      return 'hi';
    }
  });

  const [theme, setThemeState] = useState<'light' | 'dark'>(() => {
    try {
      return (localStorage.getItem(STORAGE_KEYS.THEME) as 'light' | 'dark') || 'light';
    } catch {
      return 'light';
    }
  });

  const [isMobileFrame, setIsMobileFrameState] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MOBILE_FRAME);
      // default to false on desktop so user sees responsive view, but can switch anytime
      return saved !== null ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });

  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');

  // Persistence Effects
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
    } catch (e) {
      console.error('Failed to save customers', e);
    }
  }, [customers]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    } catch (e) {
      console.error('Failed to save transactions', e);
    }
  }, [transactions]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    } catch (e) {
      console.error('Failed to save profile', e);
    }
  }, [profile]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(userSession));
    } catch (e) {
      console.error('Failed to save session', e);
    }
  }, [userSession]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.LANGUAGE, language);
    } catch (e) {
      console.error('Failed to save language', e);
    }
  }, [language]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, theme);
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch (e) {
      console.error('Failed to save theme', e);
    }
  }, [theme]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.MOBILE_FRAME, JSON.stringify(isMobileFrame));
    } catch (e) {
      console.error('Failed to save frame setting', e);
    }
  }, [isMobileFrame]);

  // Translation function
  const t = (key: TranslationKey): string => {
    const langDict = translations[language] || translations.en;
    return (langDict as Record<string, string>)[key] || translations.en[key] || key;
  };

  // Helper: Get running balance for a customer
  // UDHAAR means customer owes you money (+)
  // JAMA means customer paid you money (-)
  // Net positive = Customer owes you (You will get)
  // Net negative = You owe customer / Advance (You will give)
  const getCustomerBalance = (customerId: string): number => {
    const custTxs = transactions.filter((tx) => tx.customerId === customerId);
    return custTxs.reduce((balance, tx) => {
      if (tx.type === 'UDHAAR') {
        return balance + Number(tx.amount || 0);
      } else {
        return balance - Number(tx.amount || 0);
      }
    }, 0);
  };

  const getCustomerTransactions = (customerId: string): Transaction[] => {
    return transactions
      .filter((tx) => tx.customerId === customerId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  // Totals & KPI Metrics
  const totals = useMemo(() => {
    let totalUdhaar = 0;
    let totalAdvance = 0;
    let activeDebtorCount = 0;

    customers.forEach((cust) => {
      const bal = getCustomerBalance(cust.id);
      if (bal > 0) {
        totalUdhaar += bal;
        activeDebtorCount++;
      } else if (bal < 0) {
        totalAdvance += Math.abs(bal);
      }
    });

    // Today's stats
    const todayStr = new Date().toISOString().split('T')[0];
    let todayUdhaar = 0;
    let todayJama = 0;
    let todayCount = 0;

    transactions.forEach((tx) => {
      const txDay = tx.date ? tx.date.split('T')[0] : '';
      if (txDay === todayStr) {
        todayCount++;
        if (tx.type === 'UDHAAR') {
          todayUdhaar += Number(tx.amount || 0);
        } else {
          todayJama += Number(tx.amount || 0);
        }
      }
    });

    return {
      totalUdhaar,
      totalAdvance,
      netBalance: totalUdhaar - totalAdvance,
      todayUdhaar,
      todayJama,
      todayCount,
      totalCustomerCount: customers.length,
      activeDebtorCount,
    };
  }, [customers, transactions]);

  // Actions
  const addCustomer = (data: {
    name: string;
    phone: string;
    address: string;
    notes?: string;
    openingBalance?: { type: TransactionType; amount: number };
  }): Customer => {
    const newCust: Customer = {
      id: `cust-${Date.now()}`,
      name: data.name.trim(),
      phone: data.phone.trim(),
      address: data.address.trim(),
      notes: data.notes?.trim() || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setCustomers((prev) => [newCust, ...prev]);

    if (data.openingBalance && data.openingBalance.amount > 0) {
      const openingTx: Transaction = {
        id: `tx-open-${Date.now()}`,
        customerId: newCust.id,
        type: data.openingBalance.type,
        amount: Number(data.openingBalance.amount),
        date: new Date().toISOString(),
        description: data.openingBalance.type === 'UDHAAR' ? 'Purana Udhaar (Opening Balance)' : 'Advance Jama (Opening Balance)',
        paymentMode: 'CASH',
        createdAt: new Date().toISOString(),
      };
      setTransactions((prev) => [openingTx, ...prev]);
    }

    return newCust;
  };

  const updateCustomer = (id: string, updates: Partial<Customer>) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c))
    );
  };

  const deleteCustomer = (id: string) => {
    setCustomers((prev) => prev.filter((c) => c.id !== id));
    setTransactions((prev) => prev.filter((t) => t.customerId !== id));
    if (selectedCustomerId === id) {
      setSelectedCustomerId(null);
    }
  };

  const addTransaction = (data: Omit<Transaction, 'id' | 'createdAt'>): Transaction => {
    const newTx: Transaction = {
      ...data,
      id: `tx-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    setTransactions((prev) => [newTx, ...prev]);

    // Update customer's updatedAt
    setCustomers((prev) =>
      prev.map((c) => (c.id === data.customerId ? { ...c, updatedAt: new Date().toISOString() } : c))
    );

    return newTx;
  };

  const updateTransaction = (id: string, updates: Partial<Transaction>) => {
    setTransactions((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  };

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const updateProfile = (updates: Partial<ShopProfile>) => {
    setProfile((prev) => ({ ...prev, ...updates }));
  };

  const setLanguage = (lang: Language) => setLanguageState(lang);
  const setTheme = (th: 'light' | 'dark') => setThemeState(th);
  const setIsMobileFrame = (val: boolean) => setIsMobileFrameState(val);

  const login = (mobile: string, name?: string) => {
    setUserSession({
      mobile: mobile.trim(),
      name: name?.trim() || 'Store Owner',
      isLoggedIn: true,
      token: `sess_${Date.now()}`,
    });
  };

  const logout = () => {
    setUserSession((prev) => ({ ...prev, isLoggedIn: false }));
  };

  // Cloud/Local JSON Backup & Restore
  const exportBackupJSON = () => {
    const backupData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      profile,
      customers,
      transactions,
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MKhata_Backup_${profile.businessName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const restoreBackupJSON = (jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      if (Array.isArray(parsed.customers) && Array.isArray(parsed.transactions)) {
        setCustomers(parsed.customers);
        setTransactions(parsed.transactions);
        if (parsed.profile) {
          setProfile(parsed.profile);
        }
        return true;
      }
      return false;
    } catch (err) {
      console.error('Backup restoration failed:', err);
      return false;
    }
  };

  const resetToSampleData = () => {
    setCustomers(INITIAL_CUSTOMERS);
    setTransactions(INITIAL_TRANSACTIONS);
    setProfile(INITIAL_SHOP_PROFILE);
    setSelectedCustomerId(null);
  };

  // Export CSV for Excel
  const exportTransactionsCSV = (startDate?: string, endDate?: string) => {
    let filtered = [...transactions];
    if (startDate) {
      filtered = filtered.filter((t) => t.date >= startDate);
    }
    if (endDate) {
      filtered = filtered.filter((t) => t.date <= endDate);
    }

    const customerMap = new Map(customers.map((c) => [c.id, c]));

    const headers = [
      'Transaction ID',
      'Date & Time',
      'Customer Name',
      'Customer Phone',
      'Type (Udhaar/Jama)',
      'Amount (INR)',
      'Payment Mode',
      'Bill Number',
      'Description',
    ];

    const rows = filtered.map((tx) => {
      const cust = customerMap.get(tx.customerId);
      const formattedDate = new Date(tx.date).toLocaleString('en-IN');
      const typeLabel = tx.type === 'UDHAAR' ? 'Udhaar (Gave)' : 'Jama (Got)';
      return [
        `"${tx.id}"`,
        `"${formattedDate}"`,
        `"${(cust?.name || 'Unknown').replace(/"/g, '""')}"`,
        `"${cust?.phone || ''}"`,
        `"${typeLabel}"`,
        tx.amount,
        `"${tx.paymentMode}"`,
        `"${tx.billNumber || ''}"`,
        `"${(tx.description || '').replace(/"/g, '""')}"`,
      ].join(',');
    });

    // UTF-8 BOM for Microsoft Excel compatibility
    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `MKhata_Transactions_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <KhataContext.Provider
      value={{
        customers,
        transactions,
        profile,
        language,
        theme,
        isMobileFrame,
        userSession,
        selectedCustomerId,
        activeTab,
        t,
        getCustomerBalance,
        getCustomerTransactions,
        totals,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        updateProfile,
        setLanguage,
        setTheme,
        setIsMobileFrame,
        setActiveTab,
        setSelectedCustomerId,
        login,
        logout,
        exportBackupJSON,
        restoreBackupJSON,
        resetToSampleData,
        exportTransactionsCSV,
      }}
    >
      {children}
    </KhataContext.Provider>
  );
};

export const useKhata = () => {
  const context = useContext(KhataContext);
  if (!context) {
    throw new Error('useKhata must be used within a KhataProvider');
  }
  return context;
};
