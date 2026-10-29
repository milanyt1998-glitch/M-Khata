import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  Store,
  QrCode,
  Globe,
  Moon,
  Sun,
  Download,
  Upload,
  RefreshCw,
  LogOut,
  Smartphone,
  ShieldCheck,
  Check,
  HelpCircle,
  FileCode,
  Monitor,
  Cloud,
} from 'lucide-react';
import { useKhata } from '../context/KhataContext';
import { Language } from '../types';

interface SettingsScreenProps {
  onOpenAPKGuide: () => void;
  onOpenWindows?: () => void;
  onOpenDrive?: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ onOpenAPKGuide, onOpenWindows, onOpenDrive }) => {
  const {
    profile,
    updateProfile,
    language,
    setLanguage,
    theme,
    setTheme,
    isMobileFrame,
    setIsMobileFrame,
    exportBackupJSON,
    restoreBackupJSON,
    resetToSampleData,
    logout,
    t,
  } = useKhata();

  const [businessName, setBusinessName] = useState(profile.businessName);
  const [ownerName, setOwnerName] = useState(profile.ownerName);
  const [phone, setPhone] = useState(profile.phone);
  const [upiId, setUpiId] = useState(profile.upiId);
  const [address, setAddress] = useState(profile.address);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // QR Code State
  const [qrAmount, setQrAmount] = useState('');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [showCounterQR, setShowCounterQR] = useState(false);

  // Restore State
  const [restoreStatus, setRestoreStatus] = useState<string | null>(null);

  // Generate UPI QR Code whenever UPI ID, Owner name or amount changes
  useEffect(() => {
    const generateQR = async () => {
      try {
        const cleanUPI = upiId.trim() || 'sharma.store@okaxis';
        const cleanName = encodeURIComponent(businessName.trim() || 'M Khata Store');
        let upiUri = `upi://pay?pa=${cleanUPI}&pn=${cleanName}&cu=INR`;
        if (qrAmount && parseFloat(qrAmount) > 0) {
          upiUri += `&am=${parseFloat(qrAmount).toFixed(2)}`;
        }

        const dataUrl = await QRCode.toDataURL(upiUri, {
          width: 320,
          margin: 2,
          color: {
            dark: '#047857',
            light: '#FFFFFF',
          },
        });
        setQrCodeDataUrl(dataUrl);
      } catch (err) {
        console.error('Failed to generate UPI QR', err);
      }
    };
    generateQR();
  }, [upiId, businessName, qrAmount]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      businessName: businessName.trim(),
      ownerName: ownerName.trim(),
      phone: phone.trim(),
      upiId: upiId.trim(),
      address: address.trim(),
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        const ok = restoreBackupJSON(content);
        if (ok) {
          setRestoreStatus('Data restored successfully!');
        } else {
          setRestoreStatus('Invalid backup JSON file.');
        }
        setTimeout(() => setRestoreStatus(null), 3000);
      };
      reader.readAsText(file);
    }
  };

  const handleResetSampleConfirm = () => {
    if (window.confirm(t('resetConfirm'))) {
      resetToSampleData();
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950 overflow-y-auto no-scrollbar p-4 space-y-4">
      {/* 1. Shop Profile Form */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-700 dark:text-emerald-400">
              <Store className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">{t('shopProfile')}</h2>
          </div>
          {savedSuccess && (
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
              <Check className="w-4 h-4" /> Saved!
            </span>
          )}
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                {t('shopName')}
              </label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                {t('ownerName')}
              </label>
              <input
                type="text"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Mobile Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                {t('upiId')}
              </label>
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="e.g. yourstore@okaxis"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
              {t('shopAddress')}
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all active:scale-95"
          >
            {t('saveSettings')}
          </button>
        </form>
      </div>

      {/* 2. Shop Counter UPI Payment QR Code */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-700 dark:text-emerald-400">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Counter UPI QR Code</h3>
              <p className="text-[11px] text-slate-400">Let customers scan & pay from PhonePe, GPay, Paytm</p>
            </div>
          </div>

          <button
            onClick={() => setShowCounterQR(!showCounterQR)}
            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-200"
          >
            {showCounterQR ? 'Hide QR' : 'Show QR'}
          </button>
        </div>

        {showCounterQR && (
          <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/70 dark:border-emerald-900/40 flex flex-col items-center text-center space-y-3">
            <span className="text-[10px] font-bold tracking-widest uppercase text-emerald-800 dark:text-emerald-400">
              Direct Bank Settlement
            </span>
            <p className="text-xs font-extrabold text-slate-900 dark:text-white">{profile.businessName}</p>

            {/* Live QR Image */}
            {qrCodeDataUrl ? (
              <div className="p-3 bg-white rounded-2xl shadow-md border border-slate-200">
                <img src={qrCodeDataUrl} alt="Store UPI QR Code" className="w-48 h-48 mx-auto" />
              </div>
            ) : (
              <div className="w-48 h-48 bg-slate-200 rounded-2xl animate-pulse" />
            )}

            <p className="font-mono text-xs font-bold text-emerald-700 dark:text-emerald-400">
              UPI: {profile.upiId || 'sharma.store@okaxis'}
            </p>

            {/* Optional Amount input for customer */}
            <div className="w-full max-w-xs">
              <input
                type="number"
                value={qrAmount}
                onChange={(e) => setQrAmount(e.target.value)}
                placeholder="Custom Amount (Optional ₹)"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-center font-bold focus:outline-hidden"
              />
            </div>
          </div>
        )}
      </div>

      {/* 3. App Settings (Language, Dark Mode, Android View) */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">App Preferences</h3>

        {/* Language Selection */}
        <div className="flex items-center justify-between py-1">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-slate-500" />
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{t('language')}</span>
          </div>

          <div className="flex items-center gap-1">
            {[
              { code: 'hi' as Language, label: 'हिंदी' },
              { code: 'bn' as Language, label: 'বাংলা' },
              { code: 'en' as Language, label: 'English' },
            ].map((lang) => (
              <button
                key={lang.code}
                onClick={() => setLanguage(lang.code)}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                  language === lang.code
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>

        {/* Theme Toggle */}
        <div className="flex items-center justify-between py-1 border-t border-slate-100 dark:border-slate-800 pt-2">
          <div className="flex items-center gap-2">
            {theme === 'light' ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-blue-400" />}
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{t('theme')}</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setTheme('light')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                theme === 'light'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              Light
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                theme === 'dark'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              Dark
            </button>
          </div>
        </div>

        {/* Android Phone View Frame Toggle */}
        <div className="flex items-center justify-between py-1 border-t border-slate-100 dark:border-slate-800 pt-2">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-slate-500" />
            <div>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{t('deviceFrame')}</p>
              <p className="text-[10px] text-slate-400">Show authentic mobile handset mockup frame</p>
            </div>
          </div>

          <button
            onClick={() => setIsMobileFrame(!isMobileFrame)}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
              isMobileFrame
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            {isMobileFrame ? 'On' : 'Off'}
          </button>
        </div>
      </div>

      {/* 4. Secure Data Backup & Restore */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            {t('dataBackup')}
          </h3>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed">{t('backupDescription')}</p>

        {restoreStatus && (
          <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
            {restoreStatus}
          </div>
        )}

        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <button
            onClick={exportBackupJSON}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>Export JSON</span>
          </button>

          <label className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer">
            <Upload className="w-3.5 h-3.5 text-blue-600" />
            <span>Import Backup</span>
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>

        <button
          onClick={handleResetSampleConfirm}
          className="w-full py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 flex items-center justify-center gap-1.5 transition-colors"
        >
          <RefreshCw className="w-3 h-3" />
          <span>{t('resetSample')}</span>
        </button>

        {/* Google Drive Integration Option */}
        {onOpenDrive && (
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={onOpenDrive}
              className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-sky-50 to-blue-50 dark:from-sky-950/40 dark:to-blue-950/40 border border-sky-200 dark:border-sky-800/60 hover:border-sky-300 dark:hover:border-sky-700 text-sky-900 dark:text-sky-200 text-xs font-bold transition-all flex items-center justify-between shadow-xs"
            >
              <div className="flex items-center gap-2">
                <Cloud className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                <div className="text-left">
                  <p className="font-bold text-xs leading-none">Google Drive Cloud Sync</p>
                  <p className="text-[10px] text-sky-600/80 dark:text-sky-300/80 font-normal mt-0.5">
                    Save backups & CSV reports directly to your Google Drive
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-black text-sky-600 dark:text-sky-400">Open Drive &rarr;</span>
            </button>
          </div>
        )}
      </div>

      {/* 5. Android APK Building Instructions */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-slate-900 dark:to-emerald-950/40 border border-emerald-200/70 dark:border-emerald-900/40 shadow-xs flex items-center justify-between gap-3">
        <div>
          <h3 className="text-xs font-bold text-emerald-900 dark:text-emerald-300">📱 Android APK Installation</h3>
          <p className="text-[11px] text-emerald-700/80 dark:text-slate-400 mt-0.5">Install on Android phone or scan QR code</p>
        </div>

        <button
          onClick={onOpenAPKGuide}
          className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm whitespace-nowrap active:scale-95 transition-all"
        >
          Android Guide
        </button>
      </div>

      {/* 6. Windows PC App Setup */}
      {onOpenWindows && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-indigo-950/40 border border-blue-200/70 dark:border-indigo-900/40 shadow-xs flex items-center justify-between gap-3">
          <div>
            <h3 className="text-xs font-bold text-blue-900 dark:text-blue-300">💻 Windows PC & Desktop App</h3>
            <p className="text-[11px] text-blue-700/80 dark:text-slate-400 mt-0.5">Windows 10, 11 1-click install & .EXE guide</p>
          </div>

          <button
            onClick={onOpenWindows}
            className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm whitespace-nowrap active:scale-95 transition-all"
          >
            Windows Setup
          </button>
        </div>
      )}

      {/* 6. Logout */}
      <button
        onClick={logout}
        className="w-full py-3 rounded-2xl border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 font-bold text-xs hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center justify-center gap-2 transition-colors"
      >
        <LogOut className="w-4 h-4" />
        <span>{t('logout')}</span>
      </button>
    </div>
  );
};
