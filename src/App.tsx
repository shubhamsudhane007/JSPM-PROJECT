import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { WelcomeScreen } from './components/WelcomeScreen';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { MoreDrawer } from './components/MoreDrawer';
import { VoiceEntryModal } from './components/VoiceEntryModal';
import { PWAInstallModal } from './components/PWAInstallModal';

// Tabs
import { HomeTab } from './components/tabs/HomeTab';
import { LedgerTab } from './components/tabs/LedgerTab';
import { CreditTab } from './components/tabs/CreditTab';
import { AdMakerTab } from './components/tabs/AdMakerTab';
import { PricesTab } from './components/tabs/PricesTab';
import { StockTab } from './components/tabs/StockTab';
import { BillTab } from './components/tabs/BillTab';
import { SettingsTab } from './components/tabs/SettingsTab';
import { WifiOff } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { activeTab, showWelcome } = useApp();
  const [installModalOpen, setInstallModalOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif] transition-colors duration-200">
      {/* 1. Welcome Screen (First Turn Screen) */}
      {showWelcome && <WelcomeScreen />}

      {/* 2. Top Header Navigation */}
      <Navbar onOpenInstallGuide={() => setInstallModalOpen(true)} />

      {/* 3. Offline Mode Indicator (PWA best-practice) */}
      {!isOnline && (
        <div className="bg-amber-500 text-white text-xs font-bold py-1.5 px-4 text-center flex items-center justify-center gap-2">
          <WifiOff className="w-3.5 h-3.5" />
          <span>Offline Mode — All transactions & records are saved safely in your browser!</span>
        </div>
      )}

      {/* 4. Tab Views Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-5">
        {activeTab === 'home' && <HomeTab />}
        {activeTab === 'ledger' && <LedgerTab />}
        {activeTab === 'credit' && <CreditTab />}
        {activeTab === 'adMaker' && <AdMakerTab />}
        {activeTab === 'prices' && <PricesTab />}
        {activeTab === 'stock' && <StockTab />}
        {activeTab === 'bills' && <BillTab />}
        {activeTab === 'settings' && (
          <SettingsTab onOpenInstallGuide={() => setInstallModalOpen(true)} />
        )}
      </main>

      {/* 5. Mobile 5-Tab Bottom Navigation */}
      <BottomNav />

      {/* 6. More Drawer (Stock, Bills, Settings, PWA) */}
      <MoreDrawer onOpenInstallGuide={() => setInstallModalOpen(true)} />

      {/* 7. Voice Entry Speech Recognition Modal */}
      <VoiceEntryModal />

      {/* 8. PWA Install Guide Modal */}
      <PWAInstallModal
        isOpen={installModalOpen}
        onClose={() => setInstallModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
