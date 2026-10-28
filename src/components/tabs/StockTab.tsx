import React, { useState } from 'react';
import {
  Boxes,
  Plus,
  AlertTriangle,
  Flame,
  Clock,
  TrendingUp,
  Search,
  CheckCircle2,
  Trash2,
  Edit2,
  X,
  PlusCircle,
  MinusCircle,
  PackageCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StockItem } from '../../types';

export const StockTab: React.FC = () => {
  const { stock, addStockItem, updateStockItem, deleteStockItem, t } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'low' | 'bestSellers' | 'slowMoving'>('all');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<StockItem | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('Grains & Flours');
  const [formQuantity, setFormQuantity] = useState('');
  const [formUnit, setFormUnit] = useState<StockItem['unit']>('packet');
  const [formMinAlert, setFormMinAlert] = useState('5');
  const [formSellingPrice, setFormSellingPrice] = useState('');
  const [formCostPrice, setFormCostPrice] = useState('');
  const [formIsBestSeller, setFormIsBestSeller] = useState(false);
  const [formIsSlowMoving, setFormIsSlowMoving] = useState(false);

  const openAdd = () => {
    setEditingItem(null);
    setFormName('');
    setFormCategory('Grains & Flours');
    setFormQuantity('10');
    setFormUnit('packet');
    setFormMinAlert('5');
    setFormSellingPrice('100');
    setFormCostPrice('85');
    setFormIsBestSeller(false);
    setFormIsSlowMoving(false);
    setAddModalOpen(true);
  };

  const openEdit = (item: StockItem) => {
    setEditingItem(item);
    setFormName(item.name);
    setFormCategory(item.category);
    setFormQuantity(item.quantity.toString());
    setFormUnit(item.unit);
    setFormMinAlert(item.minAlertLevel.toString());
    setFormSellingPrice(item.sellingPrice.toString());
    setFormCostPrice(item.costPrice.toString());
    setFormIsBestSeller(!!item.isBestSeller);
    setFormIsSlowMoving(!!item.isSlowMoving);
    setAddModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseFloat(formQuantity) || 0;
    const minAlert = parseFloat(formMinAlert) || 5;
    const sp = parseFloat(formSellingPrice) || 0;
    const cp = parseFloat(formCostPrice) || 0;

    if (editingItem) {
      updateStockItem(editingItem.id, {
        name: formName,
        category: formCategory,
        quantity: qty,
        unit: formUnit,
        minAlertLevel: minAlert,
        sellingPrice: sp,
        costPrice: cp,
        isBestSeller: formIsBestSeller,
        isSlowMoving: formIsSlowMoving,
      });
    } else {
      addStockItem({
        name: formName,
        category: formCategory,
        quantity: qty,
        unit: formUnit,
        minAlertLevel: minAlert,
        sellingPrice: sp,
        costPrice: cp,
        isBestSeller: formIsBestSeller,
        isSlowMoving: formIsSlowMoving,
      });
    }

    setAddModalOpen(false);
  };

  const quickAdjustQty = (item: StockItem, delta: number) => {
    const newQty = Math.max(0, item.quantity + delta);
    updateStockItem(item.id, { quantity: newQty });
  };

  // Filter calculations
  const lowStockCount = stock.filter((i) => i.quantity <= i.minAlertLevel).length;
  const bestSellersCount = stock.filter((i) => i.isBestSeller).length;
  const slowMovingCount = stock.filter((i) => i.isSlowMoving).length;

  const filteredItems = stock.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterType === 'low') {
      return item.quantity <= item.minAlertLevel;
    }
    if (filterType === 'bestSellers') {
      return item.isBestSeller;
    }
    if (filterType === 'slowMoving') {
      return item.isSlowMoving;
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-20">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {t.stock.title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {t.stock.subtitle}
          </p>
        </div>

        <button
          onClick={openAdd}
          className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-sm shadow-emerald-600/30 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{t.stock.addItem}</span>
        </button>
      </div>

      {/* Stats Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => setFilterType('all')}
          className={`p-4 rounded-3xl border text-left transition cursor-pointer ${
            filterType === 'all'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent shadow-md'
              : 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800'
          }`}
        >
          <span className="text-[11px] font-bold uppercase tracking-wider opacity-70 block">
            {t.stock.totalItems}
          </span>
          <span className="text-2xl font-black mt-1 block">{stock.length}</span>
        </button>

        <button
          onClick={() => setFilterType('low')}
          className={`p-4 rounded-3xl border text-left transition cursor-pointer ${
            filterType === 'low'
              ? 'bg-rose-600 text-white border-transparent shadow-md shadow-rose-600/20'
              : 'bg-rose-50/60 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider block">
              {t.stock.lowStockCount}
            </span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <span className="text-2xl font-black mt-1 block">{lowStockCount}</span>
        </button>

        <button
          onClick={() => setFilterType('bestSellers')}
          className={`p-4 rounded-3xl border text-left transition cursor-pointer ${
            filterType === 'bestSellers'
              ? 'bg-amber-500 text-white border-transparent shadow-md shadow-amber-500/20'
              : 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/60 text-amber-800 dark:text-amber-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider block">
              Best Sellers
            </span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <span className="text-2xl font-black mt-1 block">{bestSellersCount}</span>
        </button>

        <button
          onClick={() => setFilterType('slowMoving')}
          className={`p-4 rounded-3xl border text-left transition cursor-pointer ${
            filterType === 'slowMoving'
              ? 'bg-indigo-600 text-white border-transparent shadow-md'
              : 'bg-indigo-50/60 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-900/60 text-indigo-800 dark:text-indigo-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider block">
              Slow Moving
            </span>
            <Clock className="w-4 h-4 text-indigo-500" />
          </div>
          <span className="text-2xl font-black mt-1 block">{slowMovingCount}</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search stock item or category..."
          className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-medium focus:outline-emerald-500 shadow-xs"
        />
      </div>

      {/* Stock Cards with Progress Bars */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item) => {
          const ratio = item.quantity / (item.minAlertLevel * 2 || 10);
          const isCritical = item.quantity <= item.minAlertLevel / 2;
          const isLow = item.quantity <= item.minAlertLevel;

          const progressPct = Math.min(100, Math.max(8, ratio * 100));
          const progressColor = isCritical
            ? 'bg-rose-500'
            : isLow
            ? 'bg-amber-500'
            : 'bg-emerald-500';

          const profitMargin =
            item.sellingPrice > 0
              ? Math.round(((item.sellingPrice - item.costPrice) / item.sellingPrice) * 100)
              : 0;

          return (
            <div
              key={item.id}
              className={`p-5 rounded-3xl border transition-all duration-200 flex flex-col justify-between ${
                isCritical
                  ? 'bg-rose-50/30 dark:bg-rose-950/20 border-rose-300 dark:border-rose-900/60 shadow-xs'
                  : isLow
                  ? 'bg-amber-50/20 dark:bg-amber-950/15 border-amber-300 dark:border-amber-900/60 shadow-xs'
                  : 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 shadow-xs'
              }`}
            >
              <div>
                {/* Header: Name, Badges */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base leading-snug">
                      {item.name}
                    </h4>
                    <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block mt-0.5">
                      {item.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    {item.isBestSeller && (
                      <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-extrabold text-[10px] uppercase">
                        🔥 Best Seller
                      </span>
                    )}
                    {item.isSlowMoving && (
                      <span className="px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 font-extrabold text-[10px] uppercase">
                        ⏳ Slow
                      </span>
                    )}
                  </div>
                </div>

                {/* Quantity and Status */}
                <div className="my-4 flex items-baseline justify-between">
                  <div>
                    <span className="text-3xl font-black text-slate-900 dark:text-white">
                      {item.quantity}
                    </span>
                    <span className="text-xs text-slate-500 font-semibold ml-1">
                      {item.unit} in stock
                    </span>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      isCritical
                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        : isLow
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    }`}
                  >
                    {isCritical ? t.stock.criticalLevel : isLow ? t.stock.lowLevel : t.stock.goodLevel}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden mb-3">
                  <div
                    style={{ width: `${progressPct}%` }}
                    className={`h-full rounded-full transition-all duration-300 ${progressColor}`}
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <span>Alert level: {item.minAlertLevel} {item.unit}</span>
                  <span>
                    Selling: ₹{item.sellingPrice} ({profitMargin}% margin)
                  </span>
                </div>
              </div>

              {/* Bottom Quick Adjust & Edit Controls */}
              <div className="flex items-center justify-between pt-3">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => quickAdjustQty(item, -1)}
                    disabled={item.quantity <= 0}
                    className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 disabled:opacity-40 text-slate-700 dark:text-slate-300 cursor-pointer"
                    title="-1 Qty"
                  >
                    <MinusCircle className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => quickAdjustQty(item, 5)}
                    className="px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 font-bold text-xs cursor-pointer"
                  >
                    +5 {item.unit}
                  </button>
                  <button
                    onClick={() => quickAdjustQty(item, 10)}
                    className="px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 font-bold text-xs cursor-pointer"
                  >
                    +10
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEdit(item)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`Delete item ${item.name}?`)) {
                        deleteStockItem(item.id);
                      }
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Stock Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                {editingItem ? 'Edit Stock Item' : t.stock.addItem}
              </h3>
              <button
                onClick={() => setAddModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Item Name:</label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Aashirvaad Atta 10kg"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:outline-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Category:</label>
                  <input
                    type="text"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    placeholder="Grains, Oil, Dairy..."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Unit:</label>
                  <select
                    value={formUnit}
                    onChange={(e) => setFormUnit(e.target.value as StockItem['unit'])}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:outline-emerald-500"
                  >
                    <option value="packet">packet</option>
                    <option value="kg">kg</option>
                    <option value="liter">liter</option>
                    <option value="piece">piece</option>
                    <option value="box">box</option>
                    <option value="quintal">quintal</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Quantity:</label>
                  <input
                    type="number"
                    required
                    value={formQuantity}
                    onChange={(e) => setFormQuantity(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold focus:outline-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">
                    Min Alert Level:
                  </label>
                  <input
                    type="number"
                    required
                    value={formMinAlert}
                    onChange={(e) => setFormMinAlert(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold focus:outline-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">
                    Selling Price (₹):
                  </label>
                  <input
                    type="number"
                    value={formSellingPrice}
                    onChange={(e) => setFormSellingPrice(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold focus:outline-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">
                    Cost Price (₹):
                  </label>
                  <input
                    type="number"
                    value={formCostPrice}
                    onChange={(e) => setFormCostPrice(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold focus:outline-emerald-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 pt-2">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsBestSeller}
                    onChange={(e) => setFormIsBestSeller(e.target.checked)}
                    className="rounded text-amber-500 focus:ring-amber-500"
                  />
                  <span>Mark as Best Seller 🔥</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsSlowMoving}
                    onChange={(e) => setFormIsSlowMoving(e.target.checked)}
                    className="rounded text-indigo-500 focus:ring-indigo-500"
                  />
                  <span>Slow Moving ⏳</span>
                </label>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/30 transition cursor-pointer"
                >
                  Save Stock Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
