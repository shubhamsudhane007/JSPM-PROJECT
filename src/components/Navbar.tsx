import React, { useState } from 'react';
import {
  Store,
  Moon,
  Sun,
  Globe,
  Download,
  Menu,
  Zap,
  Mic,
  ChevronDown,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Language } from '../types';

export const Navbar: React.FC<{ onOpenInstallGuide: () => void }> = ({ onOpenInstallGuide }) => {
  const {
    settings,
    updateSettings,
    language,
    setLanguage,
    setMoreDrawerOpen,
    setShowWelcome,
    setVoiceModalOpen,
  } = useApp();

  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  const toggleDarkMode = () => {
    updateSettings({ darkMode: !settings.darkMode });
  };

  const handleInstallClick = async () => {
    if (isInstallable) {
      await install();
    } else if (isIOS) {
      onOpenInstallGuide();
    } else {
      onOpenInstallGuide();
    }
  };

  const currentLangLabel =
    language === 'hi' ? 'हिंदी' : language === 'mr' ? 'मराठी' : 'ENG';

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-2">
        {/* Left: App Logo & Shop Name */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 shrink-0">
            <Store className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white tracking-tight truncate">
                {settings.shopName}
              </span>
              <span className="hidden md:inline-flex px-2 py-0.5 text-[10px] font-bold uppercase rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                DukaanSaathi
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
              {settings.ownerName}&apos;s Dukaan • {settings.tagline}
            </p>
          </div>
        </div>

        {/* Right Action Icons & Toggles */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Quick Mic for Voice Khata */}
          <button
            onClick={() => setVoiceModalOpen(true)}
            title="Voice Khata Entry"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800/60 transition-all font-semibold text-xs active:scale-95 cursor-pointer"
          >
            <Mic className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden sm:inline">Voice</span>
          </button>

          {/* Re-open Welcome Motivation */}
          <button
            onClick={() => setShowWelcome(true)}
            title="Today's Morning Energy & Quote"
            className="p-2 rounded-xl text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 border border-transparent hover:border-amber-200 dark:hover:border-amber-800 transition active:scale-95 cursor-pointer"
          >
            <Zap className="w-4 h-4 fill-amber-500 text-amber-500" />
          </button>

          {/* Language Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-slate-500" />
              <span>{currentLangLabel}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {langMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setLangMenuOpen(false)}
                />
                <div className="absolute right-0 mt-1.5 w-32 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1 z-50">
                  {(
                    [
                      { code: 'en', label: 'English' },
                      { code: 'hi', label: 'हिंदी (Hindi)' },
                      { code: 'mr', label: 'मराठी (Marathi)' },
                    ] as const
                  ).map((item) => (
                    <button
                      key={item.code}
                      onClick={() => {
                        setLanguage(item.code as Language);
                        setLangMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs font-semibold flex items-center justify-between ${
                        language === item.code
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                          : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                      }`}
                    >
                      <span>{item.label}</span>
                      {language === item.code && <span className="text-emerald-600">✓</span>}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* PWA Install Button (Always visible unless standalone, guided for iOS) */}
          {!isInstalled && (
            <button
              onClick={handleInstallClick}
              title="Install DukaanSaathi App"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-sm shadow-orange-500/30 transition active:scale-95 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Install App</span>
            </button>
          )}

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            title={settings.darkMode ? 'Light Mode' : 'Dark Mode'}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition active:scale-95 cursor-pointer"
          >
            {settings.darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Menu Button for More Drawer */}
          <button
            onClick={() => setMoreDrawerOpen(true)}
            title="More Options"
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition active:scale-95 cursor-pointer"
          >
            <Menu className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
