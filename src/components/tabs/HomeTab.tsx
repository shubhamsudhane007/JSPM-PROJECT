import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Users,
  AlertTriangle,
  Flame,
  PlusCircle,
  MinusCircle,
  UserPlus,
  Sparkles,
  Mic,
  ArrowUpRight,
  Receipt,
  Calendar,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TransactionCategory, TransactionType } from '../../types';

export const HomeTab: React.FC = () => {
  const {
    settings,
    transactions,
    customers,
    stock,
    setActiveTab,
    setVoiceModalOpen,
    addTransaction,
    t,
    language,
  } = useApp();

  const [quickModal, setQuickModal] = useState<{
    open: boolean;
    type: TransactionType;
    category: TransactionCategory;
    amount: string;
    note: string;
  }>({
    open: false,
    type: 'income',
    category: 'sales',
    amount: '',
    note: '',
  });

  const todayStr = new Date().toISOString().split('T')[0];

  // Calculate today's stats
  const todayTransactions = transactions.filter((tx) => tx.date === todayStr);
  const todayIncome = todayTransactions
    .filter((tx) => tx.type === 'income')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const todayExpense = todayTransactions
    .filter((tx) => tx.type === 'expense')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const todayProfit = todayIncome - todayExpense;

  // Total pending credit
  const totalPendingUdhaar = customers.reduce((sum, c) => sum + c.amountDue, 0);
  const pendingCustomersList = customers.filter((c) => c.amountDue > 0);

  // Low stock items
  const lowStockItems = stock.filter((item) => item.quantity <= item.minAlertLevel);

  // Best seller item
  const bestSeller = stock.find((item) => item.isBestSeller) || stock[0];

  // Weekly profit calculation (last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dStr = d.toISOString().split('T')[0];
    const dayIncome = transactions
      .filter((t) => t.date === dStr && t.type === 'income')
      .reduce((s, t) => s + t.amount, 0);
    const dayExpense = transactions
      .filter((t) => t.date === dStr && t.type === 'expense')
      .reduce((s, t) => s + t.amount, 0);
    const dayProfit = dayIncome - dayExpense;

    const dayName = d.toLocaleDateString(
      language === 'hi' ? 'hi-IN' : language === 'mr' ? 'mr-IN' : 'en-IN',
      { weekday: 'short' }
    );
    return { date: dStr, dayName, income: dayIncome, expense: dayExpense, profit: dayProfit };
  });

  const maxWeeklyProfit = Math.max(
    ...last7Days.map((d) => Math.max(d.profit, 500)),
    1000
  );

  const handleQuickSave = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(quickModal.amount);
    if (isNaN(amt) || amt <= 0) return;

    addTransaction({
      type: quickModal.type,
      amount: amt,
      category: quickModal.category,
      note: quickModal.note || (quickModal.type === 'income' ? 'Daily shop sale' : 'Shop expense'),
      date: todayStr,
      time: new Date().toTimeString().substring(0, 5),
    });

    setQuickModal({ ...quickModal, open: false, amount: '', note: '' });
  };

  const formattedDate = new Date().toLocaleDateString(
    language === 'hi' ? 'hi-IN' : language === 'mr' ? 'mr-IN' : 'en-IN',
    {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }
  );

  return (
    <div className="space-y-6 pb-20">
      {/* Top Banner Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🙏</span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {t.home.greeting}, {settings.ownerName}!
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="font-semibold text-slate-700 dark:text-slate-300 capitalize">
              {formattedDate}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('bills')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-orange-50 hover:bg-orange-100 dark:bg-orange-950/50 dark:hover:bg-orange-900/60 text-orange-700 dark:text-orange-300 text-xs font-bold border border-orange-200/80 dark:border-orange-800 transition cursor-pointer"
          >
            <Receipt className="w-4 h-4" />
            <span>Digital Bill</span>
          </button>
          <button
            onClick={() => setVoiceModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-sm shadow-emerald-600/30 transition cursor-pointer"
          >
            <Mic className="w-4 h-4" />
            <span>{t.home.voiceEntry}</span>
          </button>
        </div>
      </div>

      {/* 4 Gradient Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Today's Income */}
        <div className="relative overflow-hidden p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/15">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-bold text-emerald-100 uppercase tracking-wider">
              {t.home.todayIncome}
            </span>
            <div className="p-2 rounded-xl bg-white/20 backdrop-blur-xs">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black tracking-tight">
              ₹{todayIncome.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-emerald-100/90 font-medium mt-1">
              {todayTransactions.filter((tx) => tx.type === 'income').length} sales recorded
            </div>
          </div>
        </div>

        {/* Today's Expense */}
        <div className="relative overflow-hidden p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-lg shadow-rose-500/15">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-bold text-rose-100 uppercase tracking-wider">
              {t.home.todayExpense}
            </span>
            <div className="p-2 rounded-xl bg-white/20 backdrop-blur-xs">
              <TrendingDown className="w-4 h-4 text-white" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black tracking-tight">
              ₹{todayExpense.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-rose-100/90 font-medium mt-1">
              {todayTransactions.filter((tx) => tx.type === 'expense').length} expenses logged
            </div>
          </div>
        </div>

        {/* Today's Profit */}
        <div className="relative overflow-hidden p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg shadow-orange-500/15">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-bold text-amber-100 uppercase tracking-wider">
              {t.home.todayProfit}
            </span>
            <div className="p-2 rounded-xl bg-white/20 backdrop-blur-xs">
              <Wallet className="w-4 h-4 text-white" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black tracking-tight">
              ₹{todayProfit.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-amber-100/90 font-medium mt-1">
              Net balance in cash drawer
            </div>
          </div>
        </div>

        {/* Total Pending Credit / Udhaar */}
        <div
          onClick={() => setActiveTab('credit')}
          className="relative overflow-hidden p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-700 text-white shadow-lg shadow-indigo-600/15 cursor-pointer hover:brightness-105 transition"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-bold text-indigo-100 uppercase tracking-wider">
              {t.home.pendingCredit}
            </span>
            <div className="p-2 rounded-xl bg-white/20 backdrop-blur-xs">
              <Users className="w-4 h-4 text-white" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black tracking-tight">
              ₹{totalPendingUdhaar.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-indigo-100/90 font-medium mt-1 flex items-center justify-between">
              <span>{pendingCustomersList.length} customers pending</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-3">
          {t.home.quickActions}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          <button
            onClick={() =>
              setQuickModal({
                open: true,
                type: 'income',
                category: 'sales',
                amount: '',
                note: '',
              })
            }
            className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 transition active:scale-95 cursor-pointer"
          >
            <PlusCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400 mb-1" />
            <span className="text-xs font-bold">{t.home.addIncome}</span>
          </button>

          <button
            onClick={() =>
              setQuickModal({
                open: true,
                type: 'expense',
                category: 'stock purchase',
                amount: '',
                note: '',
              })
            }
            className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60 transition active:scale-95 cursor-pointer"
          >
            <MinusCircle className="w-6 h-6 text-rose-600 dark:text-rose-400 mb-1" />
            <span className="text-xs font-bold">{t.home.addExpense}</span>
          </button>

          <button
            onClick={() => setActiveTab('credit')}
            className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/60 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 transition active:scale-95 cursor-pointer"
          >
            <UserPlus className="w-6 h-6 text-indigo-600 dark:text-indigo-400 mb-1" />
            <span className="text-xs font-bold">{t.home.addCredit}</span>
          </button>

          <button
            onClick={() => setActiveTab('adMaker')}
            className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 transition active:scale-95 cursor-pointer"
          >
            <Sparkles className="w-6 h-6 text-amber-600 dark:text-amber-400 mb-1" />
            <span className="text-xs font-bold">{t.home.createAd}</span>
          </button>

          <button
            onClick={() => setVoiceModalOpen(true)}
            className="col-span-2 sm:col-span-1 flex flex-col items-center justify-center p-3.5 rounded-2xl bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/40 dark:hover:bg-teal-900/60 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800/60 transition active:scale-95 cursor-pointer"
          >
            <Mic className="w-6 h-6 text-teal-600 dark:text-teal-400 mb-1" />
            <span className="text-xs font-bold">{t.home.voiceEntry}</span>
          </button>
        </div>
      </div>

      {/* Daily Summary Card */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <span>{t.home.dailySummary}</span>
          </h3>
          <span className="text-xs font-bold text-slate-500">Live Status</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Best Selling Item */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50/50 dark:from-slate-800 dark:to-slate-800/60 border border-amber-200/80 dark:border-slate-700/80 flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500 text-white shrink-0 shadow-xs">
              <Flame className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 block">
                {t.home.bestSeller}
              </span>
              <div className="font-extrabold text-slate-900 dark:text-white text-sm truncate mt-0.5">
                {bestSeller?.name || 'Aashirvaad Atta'}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Selling at ₹{bestSeller?.sellingPrice} / {bestSeller?.unit}
              </div>
            </div>
          </div>

          {/* Low Stock Warning */}
          <div
            onClick={() => setActiveTab('stock')}
            className={`p-4 rounded-2xl border transition cursor-pointer flex items-start gap-3 ${
              lowStockItems.length > 0
                ? 'bg-rose-50/70 hover:bg-rose-100/70 dark:bg-rose-950/20 dark:hover:bg-rose-950/40 border-rose-200 dark:border-rose-900/60'
                : 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/60'
            }`}
          >
            <div
              className={`p-2.5 rounded-xl text-white shrink-0 ${
                lowStockItems.length > 0 ? 'bg-rose-500' : 'bg-emerald-500'
              }`}
            >
              {lowStockItems.length > 0 ? (
                <AlertTriangle className="w-5 h-5" />
              ) : (
                <CheckCircle2 className="w-5 h-5" />
              )}
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
                {t.home.lowStockAlerts}
              </span>
              <div className="font-extrabold text-slate-900 dark:text-white text-sm mt-0.5">
                {lowStockItems.length > 0
                  ? `${lowStockItems.length} items running low`
                  : t.home.noAlerts}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                {lowStockItems.length > 0
                  ? lowStockItems.map((i) => i.name).slice(0, 2).join(', ')
                  : 'All stocks sufficient'}
              </div>
            </div>
          </div>

          {/* Customers with dues */}
          <div
            onClick={() => setActiveTab('credit')}
            className="p-4 rounded-2xl bg-indigo-50/70 hover:bg-indigo-100/70 dark:bg-indigo-950/20 dark:hover:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60 transition cursor-pointer flex items-start gap-3"
          >
            <div className="p-2.5 rounded-xl bg-indigo-600 text-white shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400 block">
                {t.home.pendingCustomers}
              </span>
              <div className="font-extrabold text-slate-900 dark:text-white text-sm mt-0.5">
                {pendingCustomersList.length} customers have dues
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                {pendingCustomersList.map((c) => c.name).slice(0, 2).join(', ')}...
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Small Weekly Profit Chart */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              {t.home.weeklyTrend}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Net earnings over past 7 days
            </p>
          </div>
          <button
            onClick={() => setActiveTab('ledger')}
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 flex items-center gap-1 cursor-pointer"
          >
            <span>View Full Ledger</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Bar Visualizer */}
        <div className="flex items-end justify-between gap-2 sm:gap-4 h-40 pt-4 px-2">
          {last7Days.map((item, idx) => {
            const heightPct = Math.max(12, Math.min(100, (item.profit / maxWeeklyProfit) * 100));
            const isToday = item.date === todayStr;

            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                  ₹{Math.round(item.profit / 100) * 100}
                </span>

                <div className="w-full max-w-[36px] bg-slate-100 dark:bg-slate-800 rounded-t-xl h-full flex items-end overflow-hidden p-0.5">
                  <div
                    style={{ height: `${heightPct}%` }}
                    className={`w-full rounded-t-lg transition-all duration-500 ${
                      isToday
                        ? 'bg-gradient-to-t from-emerald-600 to-amber-400 shadow-md shadow-emerald-500/20'
                        : item.profit > 0
                        ? 'bg-gradient-to-t from-emerald-500 to-teal-400'
                        : 'bg-rose-400'
                    }`}
                  />
                </div>

                <span
                  className={`text-[11px] font-bold ${
                    isToday
                      ? 'text-emerald-600 dark:text-emerald-400 underline underline-offset-4 decoration-2'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {item.dayName}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Add Income/Expense Modal */}
      {quickModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white mb-3">
              {quickModal.type === 'income' ? '+ Add Quick Income' : '- Add Quick Expense'}
            </h3>

            <form onSubmit={handleQuickSave} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Amount (₹):</label>
                <input
                  type="number"
                  autoFocus
                  required
                  value={quickModal.amount}
                  onChange={(e) => setQuickModal({ ...quickModal, amount: e.target.value })}
                  placeholder="e.g. 500"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-lg font-bold focus:outline-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Category:</label>
                <select
                  value={quickModal.category}
                  onChange={(e) =>
                    setQuickModal({
                      ...quickModal,
                      category: e.target.value as TransactionCategory,
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:outline-emerald-500"
                >
                  <option value="sales">Customer Sales</option>
                  <option value="stock purchase">Stock Purchase</option>
                  <option value="rent">Shop Rent</option>
                  <option value="electricity">Electricity Bill</option>
                  <option value="salary">Worker Salary</option>
                  <option value="transport">Transport / Tempo</option>
                  <option value="other">Chai / Other Expense</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Note (Optional):</label>
                <input
                  type="text"
                  value={quickModal.note}
                  onChange={(e) => setQuickModal({ ...quickModal, note: e.target.value })}
                  placeholder="e.g. Rice & oil cash sale"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-emerald-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setQuickModal({ ...quickModal, open: false })}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`flex-1 py-2.5 rounded-xl text-white font-extrabold text-xs shadow-md transition cursor-pointer ${
                    quickModal.type === 'income'
                      ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30'
                      : 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/30'
                  }`}
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
