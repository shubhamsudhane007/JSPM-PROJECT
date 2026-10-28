import React from 'react';
import { X, Share2, PlusSquare, Smartphone, CheckCircle, Download } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { isInstallable, install, isIOS } = usePWAInstall();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                Install DukaanSaathi
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Works offline like a native app
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-5 space-y-4">
          {/* Direct Install button if browser triggers beforeinstallprompt */}
          {isInstallable && (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center space-y-3">
              <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                Your browser is ready to install DukaanSaathi directly to your home screen!
              </p>
              <button
                onClick={async () => {
                  await install();
                  onClose();
                }}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-600/30 transition cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Install on Device Now</span>
              </button>
            </div>
          )}

          {/* iOS Safari Instructions */}
          <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-4 border border-slate-200 dark:border-slate-700/60 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <span>Apple iPhone / iPad (Safari):</span>
            </div>
            <ol className="text-xs text-slate-600 dark:text-slate-300 space-y-2">
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                  1
                </span>
                <span>
                  Tap the <strong className="text-slate-900 dark:text-white">Share</strong>{' '}
                  icon (box with arrow <Share2 className="w-3.5 h-3.5 inline mx-0.5 text-blue-500" />) in Safari toolbar.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                  2
                </span>
                <span>
                  Scroll down and tap{' '}
                  <strong className="text-slate-900 dark:text-white">Add to Home Screen</strong>{' '}
                  (<PlusSquare className="w-3.5 h-3.5 inline mx-0.5 text-emerald-500" />).
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                  3
                </span>
                <span>
                  Tap <strong className="text-slate-900 dark:text-white">Add</strong> in the top right. You&apos;re done!
                </span>
              </li>
            </ol>
          </div>

          {/* Android Chrome Instructions */}
          <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-4 border border-slate-200 dark:border-slate-700/60 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <span>Android (Chrome / Edge / Samsung):</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Tap the browser menu <strong className="text-slate-900 dark:text-white">(3 vertical dots ⋮)</strong> at the top right, then tap <strong className="text-slate-900 dark:text-white">&quot;Install App&quot;</strong> or <strong className="text-slate-900 dark:text-white">&quot;Add to Home Screen&quot;</strong>.
            </p>
          </div>

          {/* Offline features badge */}
          <div className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-400 font-semibold px-1">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>Opens instantly, caches transactions & works with or without internet.</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition cursor-pointer"
        >
          Got It, Close
        </button>
      </div>
    </div>
  );
};
