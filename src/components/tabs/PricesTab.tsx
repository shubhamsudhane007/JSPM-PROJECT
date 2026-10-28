import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  RefreshCw,
  Plus,
  Edit3,
  Calendar,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  Tag,
  ArrowRight,
  X,
  Flame,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PriceItem } from '../../types';

export const PricesTab: React.FC = () => {
  const { priceItems, updatePriceItem, addPriceItem, setAllPriceItems, language, t } = useApp();

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [opportunitiesBanner, setOpportunitiesBanner] = useState<string>(
    () =>
      language === 'hi'
        ? 'आज के बेस्ट बाय अवसर: बासमती चावल, प्याज और टमाटर के थोक दाम गिरे हैं, स्टॉक बढ़ाने का बढ़िया समय!'
        : language === 'mr'
        ? 'आजच्या सर्वोत्तम खरेदी संधी: कांदा आणि टोमॅटोचे दर घसरले आहेत, लगेच साठा वाढवून घ्या!'
        : "Today's Best Buy Opportunities: Basmati Rice, Onion & Tomato wholesale rates have dipped; prime time to restock!"
  );

  const [updateModalItem, setUpdateModalItem] = useState<PriceItem | null>(null);
  const [newPriceInput, setNewPriceInput] = useState('');

  const [addNewModal, setAddNewModal] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemUnit, setNewItemUnit] = useState('₹ / kg');
  const [newItemPrice, setNewItemPrice] = useState('');

  // Call Gemini to re-analyze prices
  const handleAnalyzeWithGemini = async () => {
    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/ai/price-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: priceItems,
          language,
        }),
      });

      const data = await response.json();
      if (data.success) {
        if (data.opportunitiesSummary) {
          setOpportunitiesBanner(data.opportunitiesSummary);
        }

        if (Array.isArray(data.insights)) {
          setAllPriceItems((prev) =>
            prev.map((item) => {
              const matched = data.insights.find((ins: any) => ins.itemId === item.id);
              if (matched) {
                return {
                  ...item,
                  trend: matched.trend,
                  badgeText: matched.badgeText,
                  reason: matched.reason,
                  suggestion: matched.suggestion,
                  isBestBuy: matched.isBestBuy,
                };
              }
              return item;
            })
          );
        }
      }
    } catch (e) {
      console.warn('Price insights error, using local fallback:', e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handlePriceUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!updateModalItem) return;
    const p = parseFloat(newPriceInput);
    if (isNaN(p) || p <= 0) return;

    updatePriceItem(updateModalItem.id, p);
    setUpdateModalItem(null);
    setNewPriceInput('');
  };

  const handleAddNewItemSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const p = parseFloat(newItemPrice);
    if (!newItemName.trim() || isNaN(p) || p <= 0) return;

    addPriceItem({
      name: newItemName.trim(),
      unit: newItemUnit,
      currentPrice: p,
      previousPrice: p,
      trend: 'stable',
      badgeText: 'Stable',
      reason: 'Newly registered commodity item.',
      suggestion: 'Track for 3 days to establish market pattern.',
      isBestBuy: false,
    });

    setAddNewModal(false);
    setNewItemName('');
    setNewItemPrice('');
  };

  // Helper SVG Line Chart for 7 day price history
  const renderLineChart = (item: PriceItem) => {
    const history = item.priceHistory || [];
    if (history.length < 2) return null;

    const prices = history.map((h) => h.price);
    const minP = Math.min(...prices) * 0.95;
    const maxP = Math.max(...prices) * 1.05;
    const range = maxP - minP || 1;

    const width = 240;
    const height = 55;
    const padding = 8;

    const points = history.map((h, i) => {
      const x = padding + (i / (history.length - 1)) * (width - padding * 2);
      const y = height - padding - ((h.price - minP) / range) * (height - padding * 2);
      return { x, y, price: h.price, date: h.date };
    });

    const pathD = points.reduce(
      (acc, pt, i) => (i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`),
      ''
    );

    const isRising = item.trend === 'rising';
    const isFalling = item.trend === 'falling';
    const strokeColor = isRising ? '#e11d48' : isFalling ? '#059669' : '#0284c7';

    return (
      <div className="w-full mt-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-2.5 border border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 mb-1">
          <span>7-Day Price History</span>
          <span>
            Low: ₹{Math.min(...prices)} • High: ₹{Math.max(...prices)}
          </span>
        </div>
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-14 overflow-visible">
          <defs>
            <linearGradient id={`grad-${item.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={strokeColor} stopOpacity="0.25" />
              <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Area fill */}
          <path
            d={`${pathD} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`}
            fill={`url(#grad-${item.id})`}
          />

          {/* Line */}
          <path
            d={pathD}
            fill="none"
            stroke={strokeColor}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Point Dots */}
          {points.map((pt, i) => (
            <circle
              key={i}
              cx={pt.x}
              cy={pt.y}
              r={i === points.length - 1 ? '4' : '2'}
              fill={strokeColor}
              stroke="#ffffff"
              strokeWidth="1.5"
            />
          ))}
        </svg>
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {t.prices.title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {t.prices.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleAnalyzeWithGemini}
            disabled={isAnalyzing}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 text-xs font-bold transition active:scale-95 cursor-pointer disabled:opacity-50"
          >
            <Sparkles className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
            <span>{isAnalyzing ? 'Analyzing...' : 'AI Re-Analyze'}</span>
          </button>

          <button
            onClick={() => setAddNewModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-sm shadow-emerald-600/30 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t.prices.addItem}</span>
          </button>
        </div>
      </div>

      {/* TOP BANNER: Today's Best Buy Opportunities */}
      <div className="relative overflow-hidden p-5 rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white shadow-xl shadow-emerald-600/15">
        <div className="flex items-start gap-3">
          <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl shrink-0">
            <Flame className="w-6 h-6 text-amber-300 fill-amber-300" />
          </div>
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-emerald-200 block">
              {t.prices.bestBuyBanner}
            </span>
            <p className="text-sm sm:text-base font-bold text-white mt-1 leading-snug">
              {opportunitiesBanner}
            </p>
            <span className="inline-block text-[11px] text-emerald-100/80 font-medium mt-1">
              {t.prices.notice}
            </span>
          </div>
        </div>
      </div>

      {/* Grid of Commodity Cards with Colored Badges & Suggestions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {priceItems.map((item) => {
          const isRising = item.trend === 'rising';
          const isFalling = item.trend === 'falling';

          return (
            <div
              key={item.id}
              className={`p-5 rounded-3xl border transition-all duration-200 flex flex-col justify-between ${
                item.isBestBuy
                  ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/80 shadow-md shadow-emerald-500/10'
                  : 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 shadow-xs'
              }`}
            >
              <div>
                {/* Header: Item Name, Best Buy Badge, Trend Tag */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-extrabold text-slate-900 dark:text-white text-base">
                      {item.name}
                    </h4>
                    <span className="text-xs text-slate-400 font-medium">Unit: {item.unit}</span>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    {/* Rising / Falling / Stable Badge */}
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black tracking-tight ${
                        isRising
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300'
                          : isFalling
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                          : 'bg-sky-100 text-sky-800 dark:bg-sky-950/80 dark:text-sky-300'
                      }`}
                    >
                      {isRising ? (
                        <TrendingUp className="w-3.5 h-3.5" />
                      ) : isFalling ? (
                        <TrendingDown className="w-3.5 h-3.5" />
                      ) : (
                        <Minus className="w-3.5 h-3.5" />
                      )}
                      <span>{item.badgeText || (isRising ? 'Rising' : isFalling ? 'Falling' : 'Stable')}</span>
                    </span>

                    {item.isBestBuy && (
                      <span className="px-2 py-0.5 rounded-md bg-amber-400 text-slate-950 font-black text-[10px] uppercase tracking-wider">
                        ★ Best Buy
                      </span>
                    )}
                  </div>
                </div>

                {/* Price Display & Update Trigger */}
                <div className="my-4 flex items-baseline justify-between">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-slate-900 dark:text-white">
                      ₹{item.currentPrice}
                    </span>
                    <span className="text-xs text-slate-500 font-semibold">{item.unit}</span>
                  </div>

                  <button
                    onClick={() => {
                      setUpdateModalItem(item);
                      setNewPriceInput(item.currentPrice.toString());
                    }}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 hover:text-emerald-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{t.prices.updatePrice}</span>
                  </button>
                </div>

                {/* Line Chart */}
                {renderLineChart(item)}

                {/* Reason & Action Suggestion */}
                <div className="mt-4 space-y-2 text-xs">
                  {item.reason && (
                    <div className="text-slate-600 dark:text-slate-400">
                      <strong className="text-slate-700 dark:text-slate-300 font-bold">
                        {t.prices.marketReason}{' '}
                      </strong>
                      {item.reason}
                    </div>
                  )}

                  {item.suggestion && (
                    <div className="p-3 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-800/50 text-amber-900 dark:text-amber-200 font-semibold flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <span>
                        <strong>{t.prices.suggestionLabel} </strong>
                        {item.suggestion}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Update Price Modal */}
      {updateModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white mb-1">
              Update Today&apos;s Price
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              {updateModalItem.name} ({updateModalItem.unit})
            </p>

            <form onSubmit={handlePriceUpdateSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">
                  New Price (₹):
                </label>
                <input
                  type="number"
                  step="any"
                  autoFocus
                  required
                  value={newPriceInput}
                  onChange={(e) => setNewPriceInput(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-2xl font-black focus:outline-emerald-500"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setUpdateModalItem(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/30 transition cursor-pointer"
                >
                  Save Price
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New Commodity Modal */}
      {addNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                {t.prices.addItem}
              </h3>
              <button
                onClick={() => setAddNewModal(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddNewItemSubmit} className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Item Name:</label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder="e.g. Desi Chana, Green Cardamom"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:outline-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Unit:</label>
                <select
                  value={newItemUnit}
                  onChange={(e) => setNewItemUnit(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:outline-emerald-500"
                >
                  <option value="₹ / kg">₹ / kg</option>
                  <option value="₹ / liter">₹ / liter</option>
                  <option value="₹ / quintal">₹ / quintal</option>
                  <option value="₹ / packet">₹ / packet</option>
                  <option value="₹ / dozen">₹ / dozen</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">
                  Today&apos;s Price (₹):
                </label>
                <input
                  type="number"
                  required
                  value={newItemPrice}
                  onChange={(e) => setNewItemPrice(e.target.value)}
                  placeholder="e.g. 75"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold focus:outline-emerald-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAddNewModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/30 transition cursor-pointer"
                >
                  Add Commodity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
