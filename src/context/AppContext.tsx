import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Transaction,
  CreditCustomer,
  StockItem,
  PriceItem,
  GeneratedAd,
  Bill,
  ShopSettings,
  Language,
} from '../types';
import {
  defaultSettings,
  sampleTransactions,
  sampleCustomers,
  sampleStock,
  samplePriceItems,
  sampleAdsHistory,
  sampleBills,
} from '../mockData';
import { translations } from '../translations';

export type AppTab =
  | 'home'
  | 'ledger'
  | 'credit'
  | 'adMaker'
  | 'prices'
  | 'stock'
  | 'bills'
  | 'settings';

interface AppContextType {
  settings: ShopSettings;
  updateSettings: (newSettings: Partial<ShopSettings>) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (typeof translations)['en'];
  
  transactions: Transaction[];
  addTransaction: (tx: Omit<Transaction, 'id'>) => void;
  updateTransaction: (id: string, tx: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;

  customers: CreditCustomer[];
  addCustomer: (cust: Omit<CreditCustomer, 'id'>) => void;
  updateCustomer: (id: string, cust: Partial<CreditCustomer>) => void;
  deleteCustomer: (id: string) => void;
  addCustomerCredit: (id: string, amount: number, items: string) => void;
  recordCustomerPayment: (id: string, amount: number, note?: string) => void;
  markCustomerFullyPaid: (id: string) => void;

  stock: StockItem[];
  addStockItem: (item: Omit<StockItem, 'id'>) => void;
  updateStockItem: (id: string, item: Partial<StockItem>) => void;
  deleteStockItem: (id: string) => void;

  priceItems: PriceItem[];
  updatePriceItem: (id: string, newPrice: number) => void;
  addPriceItem: (item: Omit<PriceItem, 'id' | 'priceHistory'>) => void;
  setAllPriceItems: React.Dispatch<React.SetStateAction<PriceItem[]>>;

  adsHistory: GeneratedAd[];
  saveGeneratedAd: (ad: GeneratedAd) => void;

  bills: Bill[];
  addBill: (bill: Omit<Bill, 'id'>) => void;

  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;

  showWelcome: boolean;
  setShowWelcome: (show: boolean) => void;

  moreDrawerOpen: boolean;
  setMoreDrawerOpen: (open: boolean) => void;

  voiceModalOpen: boolean;
  setVoiceModalOpen: (open: boolean) => void;

  resetToSampleData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  SETTINGS: 'ds_settings_v1',
  TRANSACTIONS: 'ds_transactions_v1',
  CUSTOMERS: 'ds_customers_v1',
  STOCK: 'ds_stock_v1',
  PRICES: 'ds_prices_v1',
  ADS: 'ds_ads_v1',
  BILLS: 'ds_bills_v1',
};

function loadStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse localStorage key:', key, e);
    return fallback;
  }
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<ShopSettings>(() =>
    loadStorage(STORAGE_KEYS.SETTINGS, defaultSettings)
  );

  const [transactions, setTransactions] = useState<Transaction[]>(() =>
    loadStorage(STORAGE_KEYS.TRANSACTIONS, sampleTransactions)
  );

  const [customers, setCustomers] = useState<CreditCustomer[]>(() =>
    loadStorage(STORAGE_KEYS.CUSTOMERS, sampleCustomers)
  );

  const [stock, setStock] = useState<StockItem[]>(() =>
    loadStorage(STORAGE_KEYS.STOCK, sampleStock)
  );

  const [priceItems, setPriceItems] = useState<PriceItem[]>(() =>
    loadStorage(STORAGE_KEYS.PRICES, samplePriceItems)
  );

  const [adsHistory, setAdsHistory] = useState<GeneratedAd[]>(() =>
    loadStorage(STORAGE_KEYS.ADS, sampleAdsHistory)
  );

  const [bills, setBills] = useState<Bill[]>(() =>
    loadStorage(STORAGE_KEYS.BILLS, sampleBills)
  );

  const [activeTab, setActiveTab] = useState<AppTab>('home');
  const [showWelcome, setShowWelcome] = useState<boolean>(true);
  const [moreDrawerOpen, setMoreDrawerOpen] = useState<boolean>(false);
  const [voiceModalOpen, setVoiceModalOpen] = useState<boolean>(false);

  // Sync dark mode class
  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.darkMode]);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STOCK, JSON.stringify(stock));
  }, [stock]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRICES, JSON.stringify(priceItems));
  }, [priceItems]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ADS, JSON.stringify(adsHistory));
  }, [adsHistory]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BILLS, JSON.stringify(bills));
  }, [bills]);

  const updateSettings = (newSettings: Partial<ShopSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const setLanguage = (lang: Language) => {
    updateSettings({ language: lang });
  };

  const t = translations[settings.language] || translations.en;

  // Transactions
  const addTransaction = (tx: Omit<Transaction, 'id'>) => {
    const newTx: Transaction = {
      ...tx,
      id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    };
    setTransactions((prev) => [newTx, ...prev]);
  };

  const updateTransaction = (id: string, tx: Partial<Transaction>) => {
    setTransactions((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...tx } : item))
    );
  };

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((item) => item.id !== id));
  };

  // Customers
  const addCustomer = (cust: Omit<CreditCustomer, 'id'>) => {
    const newCust: CreditCustomer = {
      ...cust,
      id: `cust-${Date.now()}`,
      history: cust.history || [],
    };
    setCustomers((prev) => [newCust, ...prev]);
  };

  const updateCustomer = (id: string, cust: Partial<CreditCustomer>) => {
    setCustomers((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...cust } : item))
    );
  };

  const deleteCustomer = (id: string) => {
    setCustomers((prev) => prev.filter((item) => item.id !== id));
  };

  const addCustomerCredit = (id: string, amount: number, items: string) => {
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const newDue = c.amountDue + amount;
        const newTotal = c.totalGiven + amount;
        const updatedItems = c.itemsTaken ? `${c.itemsTaken}, ${items}` : items;
        return {
          ...c,
          amountDue: newDue,
          totalGiven: newTotal,
          itemsTaken: updatedItems,
        };
      })
    );
  };

  const recordCustomerPayment = (id: string, amount: number, note?: string) => {
    const today = new Date().toISOString().split('T')[0];
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const newDue = Math.max(0, c.amountDue - amount);
        const paymentRecord = {
          id: `pay-${Date.now()}`,
          amount,
          date: today,
          note: note || 'Payment received',
        };
        const currentHist = c.history || [];
        return {
          ...c,
          amountDue: newDue,
          lastPaymentDate: today,
          history: [paymentRecord, ...currentHist],
        };
      })
    );

    // Also auto-record into daily ledger as customer sales income!
    const customer = customers.find((c) => c.id === id);
    addTransaction({
      type: 'income',
      amount,
      category: 'sales',
      note: `Udhaar received from ${customer?.name || 'Customer'}${note ? ` (${note})` : ''}`,
      date: today,
      time: new Date().toTimeString().substring(0, 5),
    });
  };

  const markCustomerFullyPaid = (id: string) => {
    const customer = customers.find((c) => c.id === id);
    if (!customer || customer.amountDue <= 0) return;
    recordCustomerPayment(id, customer.amountDue, 'Full settlement');
  };

  // Stock
  const addStockItem = (item: Omit<StockItem, 'id'>) => {
    const newItem: StockItem = {
      ...item,
      id: `st-${Date.now()}`,
    };
    setStock((prev) => [newItem, ...prev]);
  };

  const updateStockItem = (id: string, item: Partial<StockItem>) => {
    setStock((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...item } : s))
    );
  };

  const deleteStockItem = (id: string) => {
    setStock((prev) => prev.filter((s) => s.id !== id));
  };

  // Prices
  const updatePriceItem = (id: string, newPrice: number) => {
    const today = new Date().toISOString().split('T')[0];
    setPriceItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const prevPrice = item.currentPrice;
        const newHistory = [...item.priceHistory, { date: today, price: newPrice }].slice(-10);
        const trend = newPrice > prevPrice ? 'rising' : newPrice < prevPrice ? 'falling' : 'stable';
        const diff = newPrice - prevPrice;
        const pct = prevPrice > 0 ? Math.round((diff / prevPrice) * 100) : 0;
        const badge =
          diff > 0 ? `Rising (+${pct}%)` : diff < 0 ? `Falling (${pct}%)` : 'Stable';
        return {
          ...item,
          previousPrice: prevPrice,
          currentPrice: newPrice,
          priceHistory: newHistory,
          trend,
          badgeText: badge,
        };
      })
    );
  };

  const addPriceItem = (item: Omit<PriceItem, 'id' | 'priceHistory'>) => {
    const today = new Date().toISOString().split('T')[0];
    const newItem: PriceItem = {
      ...item,
      id: `pr-${Date.now()}`,
      trend: 'stable',
      badgeText: 'Stable',
      priceHistory: [
        { date: today, price: item.currentPrice },
      ],
    };
    setPriceItems((prev) => [...prev, newItem]);
  };

  // Ads
  const saveGeneratedAd = (ad: GeneratedAd) => {
    setAdsHistory((prev) => [ad, ...prev.filter((a) => a.id !== ad.id)].slice(0, 5));
  };

  // Bills
  const addBill = (bill: Omit<Bill, 'id'>) => {
    const newBill: Bill = {
      ...bill,
      id: `bill-${Date.now()}`,
    };
    setBills((prev) => [newBill, ...prev]);

    // If paid by cash/upi, add to ledger
    if (bill.paymentMode !== 'credit') {
      addTransaction({
        type: 'income',
        amount: bill.totalAmount,
        category: 'sales',
        note: `Bill ${bill.billNumber} (${bill.customerName || 'Walk-in'} - ${bill.paymentMode.toUpperCase()})`,
        date: bill.date,
        time: new Date().toTimeString().substring(0, 5),
      });
    }
  };

  const resetToSampleData = () => {
    setSettings(defaultSettings);
    setTransactions(sampleTransactions);
    setCustomers(sampleCustomers);
    setStock(sampleStock);
    setPriceItems(samplePriceItems);
    setAdsHistory(sampleAdsHistory);
    setBills(sampleBills);
  };

  return (
    <AppContext.Provider
      value={{
        settings,
        updateSettings,
        language: settings.language,
        setLanguage,
        t,
        transactions,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        customers,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        addCustomerCredit,
        recordCustomerPayment,
        markCustomerFullyPaid,
        stock,
        addStockItem,
        updateStockItem,
        deleteStockItem,
        priceItems,
        updatePriceItem,
        addPriceItem,
        setAllPriceItems: setPriceItems,
        adsHistory,
        saveGeneratedAd,
        bills,
        addBill,
        activeTab,
        setActiveTab,
        showWelcome,
        setShowWelcome,
        moreDrawerOpen,
        setMoreDrawerOpen,
        voiceModalOpen,
        setVoiceModalOpen,
        resetToSampleData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
