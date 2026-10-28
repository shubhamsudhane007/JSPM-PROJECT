import React from 'react';
import { Home, BookOpen, Users, Sparkles, TrendingUp, MoreHorizontal } from 'lucide-react';
import { useApp, AppTab } from '../context/AppContext';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, setMoreDrawerOpen, t } = useApp();

  const navItems: Array<{ id: AppTab; label: string; icon: React.FC<{ className?: string }> }> = [
    { id: 'home', label: t.tabs.home, icon: Home },
    { id: 'ledger', label: t.tabs.ledger, icon: BookOpen },
    { id: 'credit', label: t.tabs.credit, icon: Users },
    { id: 'adMaker', label: t.tabs.adMaker, icon: Sparkles },
    { id: 'prices', label: t.tabs.prices, icon: TrendingUp },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 pb-safe transition-colors duration-200">
      <div className="max-w-lg mx-auto px-2 flex items-center justify-between h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex-1 flex flex-col items-center justify-center py-1 transition-all duration-150 cursor-pointer ${
                isActive
                  ? 'text-emerald-600 dark:text-emerald-400 font-bold scale-105'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <div
                className={`relative p-1 rounded-xl transition-all ${
                  isActive ? 'bg-emerald-50 dark:bg-emerald-950/60' : ''
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                {item.id === 'adMaker' && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                )}
              </div>
              <span className="text-[11px] tracking-tight mt-0.5 truncate max-w-[62px]">
                {item.label}
              </span>
            </button>
          );
        })}

        {/* More Tab Trigger */}
        <button
          onClick={() => setMoreDrawerOpen(true)}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all duration-150 cursor-pointer ${
            ['stock', 'bills', 'settings'].includes(activeTab)
              ? 'text-orange-600 dark:text-orange-400 font-bold scale-105'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <div
            className={`p-1 rounded-xl transition-all ${
              ['stock', 'bills', 'settings'].includes(activeTab)
                ? 'bg-orange-50 dark:bg-orange-950/60'
                : ''
            }`}
          >
            <MoreHorizontal className="w-5 h-5" />
          </div>
          <span className="text-[11px] tracking-tight mt-0.5 truncate max-w-[62px]">
            {t.tabs.more}
          </span>
        </button>
      </div>
    </nav>
  );
};
