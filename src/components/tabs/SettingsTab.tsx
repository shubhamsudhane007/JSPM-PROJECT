import React, { useState } from 'react';
import {
  Settings,
  Store,
  User,
  Phone,
  MapPin,
  QrCode,
  Globe,
  Moon,
  Sun,
  Download,
  RotateCcw,
  CheckCircle2,
  Sparkles,
  Zap,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Language } from '../../types';

export const SettingsTab: React.FC<{ onOpenInstallGuide: () => void }> = ({
  onOpenInstallGuide,
}) => {
  const {
    settings,
    updateSettings,
    language,
    setLanguage,
    resetToSampleData,
    setShowWelcome,
    t,
  } = useApp();

  const [ownerName, setOwnerName] = useState(settings.ownerName);
  const [shopName, setShopName] = useState(settings.shopName);
  const [tagline, setTagline] = useState(settings.tagline);
  const [phone, setPhone] = useState(settings.phone);
  const [address, setAddress] = useState(settings.address);
  const [upiId, setUpiId] = useState(settings.upiId);
  const [showWelcomeScreenOnLaunch, setShowWelcomeScreenOnLaunch] = useState(
    settings.showWelcomeScreenOnLaunch
  );
  const [showToast, setShowToast] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      ownerName: ownerName.trim() || 'Shubham',
      shopName: shopName.trim() || 'Shubham Kirana',
      tagline: tagline.trim(),
      phone: phone.trim(),
      address: address.trim(),
      upiId: upiId.trim(),
      showWelcomeScreenOnLaunch,
    });

    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleResetData = () => {
    if (window.confirm(t.settings.resetConfirm)) {
      resetToSampleData();
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  return (
    <div className="space-y-6 pb-20 max-w-3xl mx-auto">
      {/* Top Banner */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {t.settings.title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Configure shop profile, payment credentials & preferences
          </p>
        </div>

        <button
          onClick={() => setShowWelcome(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 text-xs font-bold cursor-pointer"
        >
          <Zap className="w-4 h-4 fill-amber-500 text-amber-500" />
          <span>Welcome Screen</span>
        </button>
      </div>

      {showToast && (
        <div className="p-4 rounded-2xl bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg animate-in fade-in slide-in-from-top duration-200">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{t.settings.savedSuccess}</span>
        </div>
      )}

      {/* Profile Form */}
      <form onSubmit={handleSave} className="space-y-5">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
            Shop & Owner Profile
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1">
                {t.settings.ownerName}:
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:outline-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1">
                {t.settings.shopName}:
              </label>
              <div className="relative">
                <Store className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:outline-emerald-500"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1">
                {t.settings.tagline}:
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="e.g. Shuddhata aur Sahi Bhaav"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1">
                {t.settings.phone}:
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 9876543210"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:outline-emerald-500"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 block mb-1">
              {t.settings.address}:
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <textarea
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-emerald-500"
              />
            </div>
          </div>

          {/* UPI ID */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <label className="text-xs font-bold text-slate-500 block mb-1">
              {t.settings.upiId}:
            </label>
            <div className="relative">
              <QrCode className="w-4 h-4 text-emerald-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="e.g. yourshop@okaxis or 9876543210@paytm"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono font-bold focus:outline-emerald-500"
              />
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">
              This UPI ID will appear on customer bills and WhatsApp payment reminder links.
            </span>
          </div>
        </div>

        {/* Preferences: Language & Theme */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
            Language & Experience
          </h3>

          <div>
            <label className="text-xs font-bold text-slate-500 block mb-2">
              {t.settings.language}:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { code: 'en', label: 'English' },
                  { code: 'hi', label: 'हिंदी (Hindi)' },
                  { code: 'mr', label: 'मराठी (Marathi)' },
                ] as const
              ).map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => setLanguage(lang.code as Language)}
                  className={`p-3 rounded-2xl text-xs font-extrabold border transition cursor-pointer ${
                    language === lang.code
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-xs font-bold text-slate-800 dark:text-white block">
                {t.settings.theme}
              </span>
              <span className="text-[11px] text-slate-400">
                {settings.darkMode ? t.settings.dark : t.settings.light}
              </span>
            </div>

            <button
              type="button"
              onClick={() => updateSettings({ darkMode: !settings.darkMode })}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer"
            >
              {settings.darkMode ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span>Switch to Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4" />
                  <span>Switch to Dark</span>
                </>
              )}
            </button>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-xs font-bold text-slate-800 dark:text-white block">
                {t.settings.welcomeScreenToggle}
              </span>
              <span className="text-[11px] text-slate-400">
                Displays clock, today&apos;s date, and morning business quotes
              </span>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={showWelcomeScreenOnLaunch}
                onChange={(e) => setShowWelcomeScreenOnLaunch(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>
        </div>

        {/* PWA Section */}
        <div className="bg-gradient-to-br from-orange-50 to-amber-50/50 dark:from-slate-900 dark:to-slate-900 p-6 rounded-3xl border border-orange-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between gap-4">
          <div>
            <span className="text-xs font-extrabold text-orange-800 dark:text-orange-400 uppercase tracking-wider block">
              {t.settings.pwaTitle}
            </span>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-sm">
              {t.settings.pwaDesc}
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenInstallGuide}
            className="px-4 py-2.5 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-orange-500/25 shrink-0 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Install Guide</span>
          </button>
        </div>

        {/* Submit Save Button */}
        <button
          type="submit"
          className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm shadow-lg shadow-emerald-600/30 transition active:scale-98 cursor-pointer"
        >
          {t.common.save} Settings
        </button>

        {/* Reset Data Danger Zone */}
        <div className="text-center pt-4">
          <button
            type="button"
            onClick={handleResetData}
            className="text-xs font-semibold text-rose-500 hover:text-rose-600 flex items-center justify-center gap-1.5 mx-auto transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t.settings.resetData}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
