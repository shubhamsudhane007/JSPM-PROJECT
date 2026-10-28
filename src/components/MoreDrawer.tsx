import React from 'react';
import {
  X,
  Boxes,
  ReceiptText,
  Settings,
  Download,
  Zap,
  RotateCcw,
  Store,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { useApp, AppTab } from '../context/AppContext';

export const MoreDrawer: React.FC<{ onOpenInstallGuide: () => void }> = ({
  onOpenInstallGuide,
}) => {
  const {
    moreDrawerOpen,
    setMoreDrawerOpen,
    setActiveTab,
    setShowWelcome,
    settings,
    resetToSampleData,
    t,
  } = useApp();

  if (!moreDrawerOpen) return null;

  const handleSelectTab = (tab: AppTab) => {
    setActiveTab(tab);
    setMoreDrawerOpen(false);
  };

  const handleReset = () => {
    if (window.confirm(t.settings.resetConfirm)) {
      resetToSampleData();
      setMoreDrawerOpen(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={() => setMoreDrawerOpen(false)}
      />

      {/* Drawer Body */}
      <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col justify-between p-6 z-10 overflow-y-auto animate-in slide-in-from-right duration-200">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-amber-500 flex items-center justify-center text-white">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                  {settings.shopName}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {settings.ownerName}&apos;s DukaanSaathi
                </p>
              </div>
            </div>
            <button
              onClick={() => setMoreDrawerOpen(false)}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Items */}
          <div className="mt-6 space-y-2">
            <button
              onClick={() => handleSelectTab('stock')}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-slate-200/80 dark:border-slate-800 transition text-left group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300">
                  <Boxes className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-sm text-slate-900 dark:text-white">
                    {t.tabs.stock}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {t.stock.subtitle}
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => handleSelectTab('bills')}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-orange-50 dark:hover:bg-orange-950/40 border border-slate-200/80 dark:border-slate-800 transition text-left group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300">
                  <ReceiptText className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-sm text-slate-900 dark:text-white">
                    {t.tabs.bills}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {t.bills.subtitle}
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => handleSelectTab('settings')}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800 transition text-left group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200">
                  <Settings className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-sm text-slate-900 dark:text-white">
                    {t.tabs.settings}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Shop Name, UPI ID, Language & Theme
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Quick Actions in Drawer */}
          <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
            <button
              onClick={() => {
                setShowWelcome(true);
                setMoreDrawerOpen(false);
              }}
              className="w-full flex items-center gap-3 p-3 rounded-xl text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-xs font-bold transition cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-amber-500 text-amber-500" />
              <span>Show Morning Motivation & Clock</span>
            </button>

            <button
              onClick={() => {
                onOpenInstallGuide();
                setMoreDrawerOpen(false);
              }}
              className="w-full flex items-center gap-3 p-3 rounded-xl text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-xs font-bold transition cursor-pointer"
            >
              <Download className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>How to Install on Phone (PWA Guide)</span>
            </button>

            <button
              onClick={handleReset}
              className="w-full flex items-center gap-3 p-3 rounded-xl text-slate-500 dark:text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 text-xs font-medium transition cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{t.settings.resetData}</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-6 border-t border-slate-200 dark:border-slate-800 text-center">
          <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>100% Offline & Private (Saved in Browser)</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            DukaanSaathi v2.4 • Made with pride for Indian Retailers
          </p>
        </div>
      </div>
    </div>
  );
};
