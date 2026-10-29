import React, { useState } from 'react';
import {
  X,
  Monitor,
  Download,
  Terminal,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  Laptop,
  Printer,
  Keyboard,
  ShieldCheck,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface WindowsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WindowsAppModal: React.FC<WindowsAppModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'direct' | 'exe' | 'shortcuts'>('direct');

  if (!isOpen) return null;

  const appUrl =
    typeof window !== 'undefined'
      ? window.location.origin
      : 'https://ais-pre-mzybx5x4jateuojac5ijgy-803328444093.asia-northeast1.run.app';

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const electronCommands = `# 1. Install Electron & Builder for Windows
npm install -D electron electron-builder

# 2. Build the production web bundle
npm run build

# 3. Package into Windows Standalone .exe Installer
npx electron-builder --windows nsis:ia32,x64

# Output: dist/MKhata_Setup_Windows.exe ready to run!`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-3 sm:p-4 no-print">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-slate-900 dark:text-white animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-blue-700 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-white">
              <Monitor className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">Windows PC & Laptop Installation</h2>
              <p className="text-xs text-blue-100">कंप्यूटर / लैपटॉप (Windows 10, 11) में ऐप चलाएं</p>
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

        {/* Tab switch */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 p-1">
          <button
            onClick={() => setActiveTab('direct')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'direct'
                ? 'bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            1. Direct Windows App (1-Click)
          </button>
          <button
            onClick={() => setActiveTab('exe')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'exe'
                ? 'bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            2. Build .EXE Installer
          </button>
          <button
            onClick={() => setActiveTab('shortcuts')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'shortcuts'
                ? 'bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            3. Keyboard & Print
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs sm:text-sm">
          {activeTab === 'direct' ? (
            <>
              {/* Direct Desktop Install CTA */}
              {isInstallable && (
                <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border-2 border-blue-500 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-blue-900 dark:text-blue-300">
                      ✓ 1-Click Install Available on this PC
                    </span>
                    <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded-full font-bold">
                      Windows Native
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Click below to install M Khata directly to your Windows Desktop, Start Menu, and Taskbar.
                  </p>
                  <button
                    onClick={install}
                    className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm shadow-md shadow-blue-600/30 flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
                  >
                    <Download className="w-4 h-4" />
                    <span>Install M Khata on Windows PC</span>
                  </button>
                </div>
              )}

              {/* Step by Step Guide for Windows Users */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                  <Laptop className="w-4 h-4 text-blue-600" />
                  <span>Windows 10 / 11 में डेस्कटॉप ऐप कैसे बनाएं:</span>
                </div>

                <div className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 font-bold flex items-center justify-center shrink-0 mt-0.5">
                      1
                    </div>
                    <p>
                      अपने कंप्यूटर पर <strong>Microsoft Edge</strong> या <strong>Google Chrome</strong> ब्राउज़र में इस ऐप को खोलें।
                    </p>
                  </div>

                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 font-bold flex items-center justify-center shrink-0 mt-0.5">
                      2
                    </div>
                    <p>
                      ऊपर एड्रेस बार में दाईं ओर दिख रहे <strong>"App Available / Install"</strong> आइकन (कंप्यूटर और तीर का निशान) पर क्लिक करें।
                    </p>
                  </div>

                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 font-bold flex items-center justify-center shrink-0 mt-0.5">
                      3
                    </div>
                    <p>
                      <strong>"Install"</strong> पर क्लिक करें। यह ऐप तुरंत <strong>Windows Desktop Icon</strong>, <strong>Start Menu</strong> और <strong>Taskbar</strong> में पिन हो जाएगा!
                    </p>
                  </div>
                </div>
              </div>

              {/* Windows App Benefits */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <p className="font-bold text-slate-900 dark:text-white mb-1">⚡ Fast & Lightweight</p>
                  <p className="text-slate-500 text-[11px]">Opens in under 1 second without high RAM consumption.</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <p className="font-bold text-slate-900 dark:text-white mb-1">📴 100% Offline</p>
                  <p className="text-slate-500 text-[11px]">Works seamlessly even if your shop internet disconnects.</p>
                </div>
              </div>
            </>
          ) : activeTab === 'exe' ? (
            /* Tab 2: Standalone .EXE installer via Electron */
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Terminal className="w-4 h-4 text-blue-600" />
                  <span>Build Standalone Windows Setup (.EXE) via Electron</span>
                </span>
                <button
                  onClick={() => handleCopyCode(electronCommands, 'elec')}
                  className="text-xs text-blue-600 dark:text-blue-400 font-bold flex items-center gap-1 hover:underline"
                >
                  {copiedCode === 'elec' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode === 'elec' ? 'Copied!' : 'Copy Commands'}</span>
                </button>
              </div>

              <pre className="p-3.5 rounded-2xl bg-slate-950 text-slate-200 font-mono text-[11px] overflow-x-auto leading-relaxed border border-slate-800">
                {electronCommands}
              </pre>

              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-xs text-slate-700 dark:text-slate-300 space-y-1">
                <p className="font-semibold text-blue-900 dark:text-blue-300">
                  Setup.exe फाइल कहाँ बनेगी?
                </p>
                <p>
                  यह कमांड आपके <code>dist/</code> फोल्डर में <strong>MKhata_Setup_Windows.exe</strong> बना देगी। इसे आप किसी भी Windows लैपटॉप में डबल क्लिक करके सामान्य सॉफ्टवेयर की तरह इंस्टॉल कर सकते हैं!
                </p>
              </div>
            </div>
          ) : (
            /* Tab 3: Desktop Keyboard Shortcuts & Thermal Printing */
            <div className="space-y-3">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                  <Keyboard className="w-4 h-4 text-emerald-600" />
                  <span>Windows Keyboard Shortcuts (कीबोर्ड शॉर्टकट)</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <span className="text-slate-600 dark:text-slate-300">Search Customer</span>
                    <kbd className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 font-mono text-[10px] font-bold">
                      /
                    </kbd>
                  </div>
                  <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <span className="text-slate-600 dark:text-slate-300">Print Statement</span>
                    <kbd className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 font-mono text-[10px] font-bold">
                      Ctrl + P
                    </kbd>
                  </div>
                  <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <span className="text-slate-600 dark:text-slate-300">Close Window/Modal</span>
                    <kbd className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 font-mono text-[10px] font-bold">
                      Esc
                    </kbd>
                  </div>
                  <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <span className="text-slate-600 dark:text-slate-300">Save / Submit</span>
                    <kbd className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 font-mono text-[10px] font-bold">
                      Enter
                    </kbd>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-1.5 text-xs">
                <div className="flex items-center gap-2 font-bold text-emerald-900 dark:text-emerald-300">
                  <Printer className="w-4 h-4 text-emerald-600" />
                  <span>Printer & Billing Compatibility</span>
                </div>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  M Khata का स्टेटमेंट प्रिंटर सपोर्ट किसी भी <strong>A4 प्रिंटर</strong>, <strong>LaserJet</strong> या <strong>Thermal Pos Receipt Printer (80mm/58mm)</strong> के साथ पूरी तरह अनुकूल है।
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium">Windows 10, 11 & Desktop Ready</span>
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
