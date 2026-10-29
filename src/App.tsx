/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { KhataProvider, useKhata } from './context/KhataContext';
import { MobileFrame } from './components/MobileFrame';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { Dashboard } from './components/Dashboard';
import { CustomerList } from './components/CustomerList';
import { CustomerKhata } from './components/CustomerKhata';
import { ReportsScreen } from './components/ReportsScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { AuthScreen } from './components/AuthScreen';
import { SplashScreen } from './components/SplashScreen';
import { APKGuideModal } from './components/APKGuideModal';
import { WindowsAppModal } from './components/WindowsAppModal';
import { GoogleDriveModal } from './components/GoogleDriveModal';
import { WifiOff } from 'lucide-react';

const KhataAppInner: React.FC = () => {
  const {
    userSession,
    selectedCustomerId,
    setSelectedCustomerId,
    customers,
    activeTab,
    setActiveTab,
    t,
  } = useKhata();

  const [showSplash, setShowSplash] = useState(true);
  const [isAPKGuideOpen, setIsAPKGuideOpen] = useState(false);
  const [isWindowsGuideOpen, setIsWindowsGuideOpen] = useState(false);
  const [isDriveModalOpen, setIsDriveModalOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  // Monitor network status
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

  // 1. Splash Screen
  if (showSplash) {
    return (
      <MobileFrame>
        <SplashScreen onFinish={() => setShowSplash(false)} />
      </MobileFrame>
    );
  }

  // 2. Authentication Screen (if logged out)
  if (!userSession.isLoggedIn) {
    return (
      <MobileFrame>
        <AuthScreen />
      </MobileFrame>
    );
  }

  // Find selected customer if currently in customer khata
  const selectedCustomer = selectedCustomerId
    ? customers.find((c) => c.id === selectedCustomerId)
    : null;

  return (
    <MobileFrame>
      {/* Offline Toast */}
      {!isOnline && (
        <div className="bg-amber-500 text-white text-[11px] font-bold px-3 py-1 flex items-center justify-center gap-1.5 shadow-xs sticky top-0 z-50">
          <WifiOff className="w-3.5 h-3.5" />
          <span>Offline Mode — All transactions saved securely to phone memory.</span>
        </div>
      )}

      {/* Main Top Header */}
      <Header
        title={
          selectedCustomer
            ? selectedCustomer.name
            : activeTab === 'customers'
            ? t('customers')
            : activeTab === 'reports'
            ? t('reports')
            : activeTab === 'settings'
            ? t('settings')
            : undefined
        }
        showBack={!!selectedCustomerId}
        onBack={() => setSelectedCustomerId(null)}
        onOpenAPK={() => setIsAPKGuideOpen(true)}
        onOpenWindows={() => setIsWindowsGuideOpen(true)}
        onOpenDrive={() => setIsDriveModalOpen(true)}
      />

      {/* Screen Body */}
      <main className="flex-1 flex flex-col min-h-0 relative">
        {selectedCustomer ? (
          <CustomerKhata
            customer={selectedCustomer}
            onBack={() => setSelectedCustomerId(null)}
          />
        ) : (
          <>
            {activeTab === 'home' && (
              <Dashboard
                onSelectCustomer={(id) => setSelectedCustomerId(id)}
                onOpenQR={() => setActiveTab('settings')}
                onOpenAPK={() => setIsAPKGuideOpen(true)}
                onOpenWindows={() => setIsWindowsGuideOpen(true)}
                onOpenDrive={() => setIsDriveModalOpen(true)}
              />
            )}
            {activeTab === 'customers' && (
              <CustomerList onSelectCustomer={(id) => setSelectedCustomerId(id)} />
            )}
            {activeTab === 'reports' && <ReportsScreen />}
            {activeTab === 'settings' && (
              <SettingsScreen
                onOpenAPKGuide={() => setIsAPKGuideOpen(true)}
                onOpenWindows={() => setIsWindowsGuideOpen(true)}
                onOpenDrive={() => setIsDriveModalOpen(true)}
              />
            )}
          </>
        )}
      </main>

      {/* Fixed Bottom Navigation (visible when not deep in customer khata) */}
      {!selectedCustomerId && <BottomNav />}

      {/* APK Guide Modal */}
      <APKGuideModal isOpen={isAPKGuideOpen} onClose={() => setIsAPKGuideOpen(false)} />

      {/* Windows PC Guide & Install Modal */}
      <WindowsAppModal isOpen={isWindowsGuideOpen} onClose={() => setIsWindowsGuideOpen(false)} />

      {/* Google Drive Cloud Sync Modal */}
      <GoogleDriveModal isOpen={isDriveModalOpen} onClose={() => setIsDriveModalOpen(false)} />
    </MobileFrame>
  );
};

export default function App() {
  return (
    <KhataProvider>
      <KhataAppInner />
    </KhataProvider>
  );
}
