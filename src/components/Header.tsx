import { Store, Moon, Sun, ArrowLeft, Download, Smartphone, Monitor, Cloud } from 'lucide-react';
import { useKhata } from '../context/KhataContext';
import { Language } from '../types';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  onOpenAPK?: () => void;
  onOpenWindows?: () => void;
  onOpenDrive?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  showBack,
  onBack,
  rightAction,
  onOpenAPK,
  onOpenWindows,
  onOpenDrive,
}) => {
  const { profile, language, setLanguage, theme, setTheme, selectedCustomerId, setSelectedCustomerId } = useKhata();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (selectedCustomerId) {
      setSelectedCustomerId(null);
    }
  };

  const languages: { code: Language; label: string }[] = [
    { code: 'hi', label: 'हिं' },
    { code: 'bn', label: 'বাং' },
    { code: 'en', label: 'EN' },
  ];

  return (
    <header className="sticky top-0 z-30 bg-emerald-700 dark:bg-slate-900 text-white shadow-md border-b border-emerald-800/50 dark:border-slate-800 no-print">
      <div className="px-4 py-3 flex items-center justify-between gap-3">
        {/* Left Slot: Back Button or Brand Store Icon */}
        <div className="flex items-center gap-2.5 min-w-0">
          {showBack || selectedCustomerId ? (
            <button
              onClick={handleBack}
              aria-label="Go Back"
              className="p-1.5 -ml-1 rounded-full hover:bg-emerald-600 dark:hover:bg-slate-800 text-white transition-colors flex items-center justify-center min-w-[36px] min-h-[36px]"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          ) : (
            <div className="w-9 h-9 rounded-xl bg-emerald-800/70 dark:bg-emerald-950 flex items-center justify-center text-white shrink-0 border border-emerald-600/50">
              <Store className="w-5 h-5 text-emerald-200" />
            </div>
          )}

          <div className="min-w-0">
            <h1 className="text-base font-bold truncate leading-tight tracking-tight">
              {title || profile.businessName}
            </h1>
            {!title && (
              <p className="text-[11px] text-emerald-200 dark:text-slate-400 truncate">
                {profile.ownerName} · {profile.phone}
              </p>
            )}
          </div>
        </div>

        {/* Right Slot: Custom Action or Language + Dark Mode controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          {rightAction ? (
            rightAction
          ) : (
            <>
              {/* Language Switcher Button Strip */}
              <div className="flex items-center bg-emerald-800/80 dark:bg-slate-800 rounded-lg p-0.5 border border-emerald-600/40 dark:border-slate-700 text-xs font-semibold">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className={`px-2 py-0.5 rounded transition-all text-[11px] ${
                      language === lang.code
                        ? 'bg-white text-emerald-800 dark:bg-emerald-600 dark:text-white shadow-xs font-bold'
                        : 'text-emerald-100 hover:text-white'
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>

              {/* Install APK Button */}
              {onOpenAPK && (
                <button
                  onClick={onOpenAPK}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-900/80 hover:bg-emerald-950 text-white text-[11px] font-bold border border-emerald-500/50 transition-colors shadow-xs"
                  title="Install Android APK"
                >
                  <Smartphone className="w-3.5 h-3.5 text-emerald-300" />
                  <span>APK</span>
                </button>
              )}

              {/* Install Windows App Button */}
              {onOpenWindows && (
                <button
                  onClick={onOpenWindows}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-900/80 hover:bg-blue-950 text-white text-[11px] font-bold border border-blue-400/50 transition-colors shadow-xs"
                  title="Install on Windows PC"
                >
                  <Monitor className="w-3.5 h-3.5 text-blue-300" />
                  <span>PC</span>
                </button>
              )}

              {/* Google Drive Cloud Sync Button */}
              {onOpenDrive && (
                <button
                  onClick={onOpenDrive}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-800/90 hover:bg-slate-800 text-white text-[11px] font-bold border border-slate-600/60 transition-colors shadow-xs"
                  title="Google Drive Cloud Sync"
                >
                  <Cloud className="w-3.5 h-3.5 text-sky-400" />
                  <span>Drive</span>
                </button>
              )}

              {/* Theme Toggle Button */}
              <button
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                aria-label="Toggle Theme"
                className="p-1.5 rounded-lg text-emerald-100 hover:text-white hover:bg-emerald-800 dark:hover:bg-slate-800 transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
              >
                {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-400" />}
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
