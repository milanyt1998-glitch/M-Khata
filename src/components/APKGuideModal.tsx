import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  X,
  Smartphone,
  Download,
  QrCode,
  CheckCircle2,
  ExternalLink,
  Copy,
  Check,
  Terminal,
  HelpCircle,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface APKGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const APKGuideModal: React.FC<APKGuideModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'mobile' | 'code'>('mobile');

  // Production app URL for phone scanning
  const appUrl =
    typeof window !== 'undefined'
      ? window.location.origin
      : 'https://ais-pre-mzybx5x4jateuojac5ijgy-803328444093.asia-northeast1.run.app';

  useEffect(() => {
    const generateAppQR = async () => {
      try {
        const url = await QRCode.toDataURL(appUrl, {
          width: 280,
          margin: 2,
          color: {
            dark: '#047857',
            light: '#FFFFFF',
          },
        });
        setQrDataUrl(url);
      } catch (err) {
        console.error('Failed to generate app QR', err);
      }
    };
    generateAppQR();
  }, [appUrl]);

  if (!isOpen) return null;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(appUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const capacitorCommands = `# 1. Install Capacitor Native Android Bridge
npm install @capacitor/core @capacitor/cli @capacitor/android

# 2. Initialize Capacitor project
npx cap init "M Khata" "com.mkhata.digitalhisab" --web-dir dist

# 3. Build production web bundle
npm run build

# 4. Add Android native package
npx cap add android

# 5. Sync web code to Android project
npx cap sync android

# 6. Open in Android Studio to build APK
npx cap open android
# (In Android Studio: Build > Build Bundle(s) / APK(s) > Build APK(s))`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-3 sm:p-4 no-print">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-slate-900 dark:text-white animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-emerald-700 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-white">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">Android APK & Phone Installation</h2>
              <p className="text-xs text-emerald-100">अपने एंड्रॉयड फोन में ऐप इंस्टॉल करें</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch: Mobile QR / WebAPK vs Android Studio Source */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 p-1">
          <button
            onClick={() => setActiveTab('mobile')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'mobile'
                ? 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            1. Phone Scan & Instant WebAPK
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'code'
                ? 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            2. Android Studio (.APK Binary)
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs sm:text-sm">
          {activeTab === 'mobile' ? (
            <>
              {/* Direct WebAPK One-Click Button (if running on mobile/Chrome) */}
              {isInstallable && (
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-500 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-800 dark:text-emerald-300">
                      ✓ Ready for Instant 1-Click Install
                    </span>
                    <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-bold">
                      WebAPK
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Your browser supports direct Android APK installation without downloading extra files.
                  </p>
                  <button
                    onClick={install}
                    className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
                  >
                    <Download className="w-4 h-4" />
                    <span>Install M Khata App on Android</span>
                  </button>
                </div>
              )}

              {/* QR Code to Open on Phone */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col items-center text-center space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200">
                  <QrCode className="w-4 h-4 text-emerald-600" />
                  <span>Scan with Android Phone Camera to Open & Install:</span>
                </div>

                {qrDataUrl ? (
                  <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-200">
                    <img src={qrDataUrl} alt="App QR Code" className="w-48 h-48 mx-auto" />
                  </div>
                ) : (
                  <div className="w-48 h-48 bg-slate-200 dark:bg-slate-700 rounded-2xl animate-pulse" />
                )}

                <div className="w-full flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    readOnly
                    value={appUrl}
                    className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-[11px] font-mono truncate"
                  />
                  <button
                    onClick={handleCopyUrl}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shrink-0 flex items-center gap-1"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* How Android WebAPK Works (Hindi & English Explanation) */}
              <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 space-y-2 text-xs">
                <p className="font-bold text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-blue-600" />
                  <span>मोबाइल में APK कैसे काम करता है? (How it works)</span>
                </p>
                <ol className="list-decimal list-inside space-y-1.5 text-slate-700 dark:text-slate-300 leading-relaxed">
                  <li>
                    अपने Android फोन के <strong>Google Chrome</strong> में ऊपर दिया गया लिंक खोलें।
                  </li>
                  <li>
                    स्क्रीन पर नीचे <strong>"Install App"</strong> या ऊपर 3 डॉट्स (⋮) पर क्लिक करके <strong>"Add to Home screen / Install App"</strong> चुनें।
                  </li>
                  <li>
                    Google Play Services स्वचालित रूप से आपके फोन के लिए एक आधिकारिक <strong>WebAPK (.apk)</strong> बना कर फोन के ऐप ड्रॉअर में इंस्टॉल कर देती है!
                  </li>
                  <li>
                    यह बिना इंटरनेट के भी फुल स्क्रीन में काम करता है और आपका सारा हिसाब फोन में सुरक्षित रखता है।
                  </li>
                </ol>
              </div>
            </>
          ) : (
            /* Tab 2: Standalone APK via Capacitor */
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Terminal className="w-4 h-4 text-emerald-600" />
                  <span>Build Raw .APK file using Capacitor</span>
                </span>
                <button
                  onClick={() => handleCopyCode(capacitorCommands, 'cap')}
                  className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 hover:underline"
                >
                  {copiedCode === 'cap' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode === 'cap' ? 'Copied!' : 'Copy Commands'}</span>
                </button>
              </div>

              <pre className="p-3.5 rounded-2xl bg-slate-950 text-slate-200 font-mono text-[11px] overflow-x-auto leading-relaxed border border-slate-800">
                {capacitorCommands}
              </pre>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400 space-y-1">
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  Android Studio में APK कहां मिलेगा?
                </p>
                <p>
                  Android Studio में ऊपर मेनू से <strong>Build &gt; Build Bundle(s) / APK(s) &gt; Build APK(s)</strong> पर क्लिक करें। आपका <code>app-debug.apk</code> या <code>app-release.apk</code> तैयार हो जाएगा, जिसे आप व्हाट्सएप या ब्लूटूथ से किसी भी फोन में भेजकर इंस्टॉल कर सकते हैं!
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium">M Khata · Made for Indian Merchants</span>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
