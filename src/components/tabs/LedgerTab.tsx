import React, { useState } from 'react';
import {
  Plus,
  Mic,
  Printer,
  Calendar,
  Filter,
  Trash2,
  Edit2,
  TrendingUp,
  TrendingDown,
  ArrowDownLeft,
  ArrowUpRight,
  Clock,
  Tag,
  DollarSign,
  FileSpreadsheet,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Transaction, TransactionCategory, TransactionType } from '../../types';

export const LedgerTab: React.FC = () => {
  const {
    transactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    setVoiceModalOpen,
    settings,
    t,
    language,
  } = useApp();

  const [dateFilter, setDateFilter] = useState<'today' | 'week' | 'month' | 'all'>('today');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [printModalOpen, setPrintModalOpen] = useState(false);

  // Form State
  const [formType, setFormType] = useState<TransactionType>('income');
  const [formAmount, setFormAmount] = useState('');
  const [formCategory, setFormCategory] = useState<TransactionCategory>('sales');
  const [formNote, setFormNote] = useState('');
  const [formDate, setFormDate] = useState(() => new Date().toISOString().split('T')[0]);

  const openAddModal = () => {
    setEditingTx(null);
    setFormType('income');
    setFormAmount('');
    setFormCategory('sales');
    setFormNote('');
    setFormDate(new Date().toISOString().split('T')[0]);
    setModalOpen(true);
  };

  const openEditModal = (tx: Transaction) => {
    setEditingTx(tx);
    setFormType(tx.type);
    setFormAmount(tx.amount.toString());
    setFormCategory(tx.category);
    setFormNote(tx.note);
    setFormDate(tx.date);
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(formAmount);
    if (isNaN(amt) || amt <= 0) return;

    if (editingTx) {
      updateTransaction(editingTx.id, {
        type: formType,
        amount: amt,
        category: formCategory,
        note: formNote,
        date: formDate,
      });
    } else {
      addTransaction({
        type: formType,
        amount: amt,
        category: formCategory,
        note: formNote,
        date: formDate,
        time: new Date().toTimeString().substring(0, 5),
      });
    }
    setModalOpen(false);
  };

  // Date filtering logic
  const todayStr = new Date().toISOString().split('T')[0];
  const now = new Date();

  const filteredTransactions = transactions.filter((tx) => {
    // Category match
    if (categoryFilter !== 'all' && tx.category !== categoryFilter) {
      return false;
    }

    if (dateFilter === 'all') return true;

    if (dateFilter === 'today') {
      return tx.date === todayStr;
    }

    const txDate = new Date(tx.date);
    if (dateFilter === 'week') {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(now.getDate() - 7);
      return txDate >= sevenDaysAgo && txDate <= now;
    }

    if (dateFilter === 'month') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(now.getDate() - 30);
      return txDate >= thirtyDaysAgo && txDate <= now;
    }

    return true;
  });

  // Calculate totals for filtered set
  const totalIncome = filteredTransactions
    .filter((tx) => tx.type === 'income')
    .reduce((s, tx) => s + tx.amount, 0);

  const totalExpense = filteredTransactions
    .filter((tx) => tx.type === 'expense')
    .reduce((s, tx) => s + tx.amount, 0);

  const netBalance = totalIncome - totalExpense;

  // Group transactions by date for Timeline view
  const groupedByDate: Record<string, Transaction[]> = {};
  filteredTransactions.forEach((tx) => {
    if (!groupedByDate[tx.date]) {
      groupedByDate[tx.date] = [];
    }
    groupedByDate[tx.date].push(tx);
  });

  const sortedDates = Object.keys(groupedByDate).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  const getCategoryBadgeClass = (cat: TransactionCategory) => {
    switch (cat) {
      case 'sales':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300';
      case 'stock purchase':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300';
      case 'rent':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-950/70 dark:text-purple-300';
      case 'salary':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300';
      case 'electricity':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950/70 dark:text-yellow-300';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300';
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Top Banner & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {t.ledger.title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {t.ledger.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setVoiceModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800 transition cursor-pointer"
          >
            <Mic className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>{t.ledger.voiceMic}</span>
          </button>

          <button
            onClick={() => setPrintModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">{t.ledger.downloadReport}</span>
          </button>

          <button
            onClick={openAddModal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-sm shadow-emerald-600/30 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t.ledger.addEntry}</span>
          </button>
        </div>
      </div>

      {/* Date Filters & Category Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Date Filter Tabs */}
        <div className="flex items-center p-1 bg-slate-200/70 dark:bg-slate-800/80 rounded-2xl">
          {(
            [
              { id: 'today', label: t.ledger.today },
              { id: 'week', label: t.ledger.thisWeek },
              { id: 'month', label: t.ledger.thisMonth },
              { id: 'all', label: t.ledger.allTime },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setDateFilter(tab.id)}
              className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition cursor-pointer ${
                dateFilter === tab.id
                  ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Category Dropdown */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-emerald-500"
          >
            <option value="all">{t.ledger.allCategories}</option>
            <option value="sales">Sales</option>
            <option value="stock purchase">Stock Purchase</option>
            <option value="rent">Rent</option>
            <option value="salary">Salary</option>
            <option value="electricity">Electricity</option>
            <option value="transport">Transport</option>
            <option value="other">Other / Chai</option>
          </select>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-3 gap-3 bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="text-center border-r border-slate-100 dark:border-slate-800">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            {t.ledger.income}
          </span>
          <span className="text-lg sm:text-xl font-black text-emerald-600 dark:text-emerald-400">
            +₹{totalIncome.toLocaleString('en-IN')}
          </span>
        </div>

        <div className="text-center border-r border-slate-100 dark:border-slate-800">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            {t.ledger.expense}
          </span>
          <span className="text-lg sm:text-xl font-black text-rose-600 dark:text-rose-400">
            -₹{totalExpense.toLocaleString('en-IN')}
          </span>
        </div>

        <div className="text-center">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            {t.ledger.profit}
          </span>
          <span
            className={`text-lg sm:text-xl font-black ${
              netBalance >= 0
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            ₹{netBalance.toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      {/* Timeline Style List Grouped by Date */}
      {sortedDates.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 p-8">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400 mb-3">
            <DollarSign className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
            {t.ledger.noEntries}
          </p>
          <button
            onClick={openAddModal}
            className="mt-3 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition cursor-pointer"
          >
            + Add First Transaction
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {sortedDates.map((dateKey) => {
            const dayTxs = groupedByDate[dateKey];
            const dayIncome = dayTxs
              .filter((tx) => tx.type === 'income')
              .reduce((s, tx) => s + tx.amount, 0);
            const dayExpense = dayTxs
              .filter((tx) => tx.type === 'expense')
              .reduce((s, tx) => s + tx.amount, 0);
            const dayProfit = dayIncome - dayExpense;

            const isToday = dateKey === todayStr;
            const displayDate = new Date(dateKey + 'T00:00:00').toLocaleDateString(
              language === 'hi' ? 'hi-IN' : language === 'mr' ? 'mr-IN' : 'en-IN',
              { weekday: 'long', day: 'numeric', month: 'short' }
            );

            return (
              <div
                key={dateKey}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden"
              >
                {/* Date Header Strip with Daily Totals */}
                <div className="bg-slate-50/80 dark:bg-slate-800/50 px-5 py-3 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white capitalize">
                      {isToday ? `${t.ledger.today} (${displayDate})` : displayDate}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs font-bold">
                    <span className="text-emerald-600 dark:text-emerald-400">
                      +{dayIncome}
                    </span>
                    <span className="text-rose-600 dark:text-rose-400">
                      -{dayExpense}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-md ${
                        dayProfit >= 0
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      }`}
                    >
                      Net: ₹{dayProfit}
                    </span>
                  </div>
                </div>

                {/* Timeline Items */}
                <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {dayTxs.map((tx) => (
                    <div
                      key={tx.id}
                      className="p-4 sm:px-5 flex items-center justify-between gap-3 hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Type Icon Pill */}
                        <div
                          className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                            tx.type === 'income'
                              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                              : 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                          }`}
                        >
                          {tx.type === 'income' ? (
                            <ArrowDownLeft className="w-5 h-5" />
                          ) : (
                            <ArrowUpRight className="w-5 h-5" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-sm text-slate-900 dark:text-white truncate">
                              {tx.note || (tx.type === 'income' ? 'Daily Sale' : 'Expense')}
                            </span>
                            <span
                              className={`px-2 py-0.5 text-[10px] font-extrabold uppercase rounded-md ${getCategoryBadgeClass(
                                tx.category
                              )}`}
                            >
                              {tx.category}
                            </span>
                          </div>

                          <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                            {tx.time && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {tx.time}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right Amount & Actions */}
                      <div className="flex items-center gap-3 shrink-0">
                        <span
                          className={`text-base sm:text-lg font-black tracking-tight ${
                            tx.type === 'income'
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          {tx.type === 'income' ? '+' : '-'}₹
                          {tx.amount.toLocaleString('en-IN')}
                        </span>

                        <div className="flex items-center gap-1 opacity-80 sm:opacity-0 group-hover:opacity-100 transition">
                          <button
                            onClick={() => openEditModal(tx)}
                            title="Edit"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(t.ledger.confirmDelete)) {
                                deleteTransaction(tx.id);
                              }
                            }}
                            title="Delete"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Entry Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                {editingTx ? t.ledger.editEntry : t.ledger.addEntry}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-4 space-y-4">
              {/* Income / Expense Switch */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setFormType('income')}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold transition cursor-pointer ${
                    formType === 'income'
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  + Income (Jama)
                </button>
                <button
                  type="button"
                  onClick={() => setFormType('expense')}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold transition cursor-pointer ${
                    formType === 'expense'
                      ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  - Expense (Kharcha)
                </button>
              </div>

              {/* Amount */}
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">
                  Amount in Rupees (₹):
                </label>
                <input
                  type="number"
                  required
                  autoFocus
                  value={formAmount}
                  onChange={(e) => setFormAmount(e.target.value)}
                  placeholder="e.g. 1500"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xl font-black focus:outline-emerald-500"
                />
              </div>

              {/* Category */}
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">
                  Category:
                </label>
                <select
                  value={formCategory}
                  onChange={(e) =>
                    setFormCategory(e.target.value as TransactionCategory)
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:outline-emerald-500"
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

              {/* Date */}
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">
                  Date:
                </label>
                <input
                  type="date"
                  required
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-emerald-500"
                />
              </div>

              {/* Note */}
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">
                  Note / Item description:
                </label>
                <input
                  type="text"
                  value={formNote}
                  onChange={(e) => setFormNote(e.target.value)}
                  placeholder="e.g. Afternoon grocery & oil sale"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-emerald-500"
                />
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-3 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 transition"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/30 transition cursor-pointer"
                >
                  {t.common.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Monthly Report Modal */}
      {printModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  Monthly Financial Statement
                </h3>
                <p className="text-xs text-slate-500">
                  {settings.shopName} • {settings.ownerName}
                </p>
              </div>
              <button
                onClick={() => setPrintModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Printable Statement Sheet */}
            <div className="p-4 my-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-4">
              <div className="text-center pb-3 border-b border-slate-200 dark:border-slate-700">
                <h4 className="text-lg font-black text-slate-900 dark:text-white">
                  {settings.shopName}
                </h4>
                <p className="text-xs text-slate-500">{settings.address}</p>
                <p className="text-xs font-bold text-emerald-600 mt-1">
                  Khata Summary Report (Filtered: {dateFilter.toUpperCase()})
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center py-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Income</span>
                  <span className="text-sm font-black text-emerald-600">+₹{totalIncome}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Expense</span>
                  <span className="text-sm font-black text-rose-600">-₹{totalExpense}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Net Profit</span>
                  <span className="text-sm font-black text-slate-900 dark:text-white">₹{netBalance}</span>
                </div>
              </div>

              {/* Transactions table preview */}
              <div className="max-h-60 overflow-y-auto text-xs">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-400">
                      <th className="py-1">Date</th>
                      <th className="py-1">Note</th>
                      <th className="py-1">Category</th>
                      <th className="py-1 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredTransactions.slice(0, 15).map((t) => (
                      <tr key={t.id} className="py-1">
                        <td className="py-1 font-mono text-slate-500">{t.date}</td>
                        <td className="py-1 font-medium">{t.note}</td>
                        <td className="py-1 uppercase text-[10px] text-slate-500">{t.category}</td>
                        <td
                          className={`py-1 text-right font-bold ${
                            t.type === 'income' ? 'text-emerald-600' : 'text-rose-600'
                          }`}
                        >
                          {t.type === 'income' ? '+' : '-'}₹{t.amount}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setPrintModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-extrabold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Document</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
