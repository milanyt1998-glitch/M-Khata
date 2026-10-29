import React, { useState, useEffect } from 'react';
import { Wifi, Battery, Signal, Smartphone, Monitor } from 'lucide-react';
import { useKhata } from '../context/KhataContext';

interface MobileFrameProps {
  children: React.ReactNode;
}

export const MobileFrame: React.FC<MobileFrameProps> = ({ children }) => {
  const { isMobileFrame, setIsMobileFrame } = useKhata();
  const [time, setTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col items-center justify-start transition-colors">
      {/* Top Floating Viewport Switcher Toolbar (Visible on Desktop / Non-Print) */}
      <div className="w-full bg-slate-900 text-white px-4 py-2 flex items-center justify-between text-xs no-print shrink-0 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="font-bold tracking-tight text-emerald-400">M Khata</span>
          <span className="text-slate-400">|</span>
          <span className="text-slate-300 font-medium">Digital Hisab Kitab</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMobileFrame(true)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-colors ${
              isMobileFrame ? 'bg-emerald-600 text-white font-medium' : 'text-slate-400 hover:text-white'
            }`}
            title="Switch to Android Phone View"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Android Phone Frame</span>
          </button>

          <button
            onClick={() => setIsMobileFrame(false)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-colors ${
              !isMobileFrame ? 'bg-emerald-600 text-white font-medium' : 'text-slate-400 hover:text-white'
            }`}
            title="Switch to Responsive Tablet/Desktop View"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Responsive View</span>
          </button>
        </div>
      </div>

      {/* Main Container: Mobile Frame vs Responsive Container */}
      {isMobileFrame ? (
        <div className="py-4 md:py-8 flex justify-center w-full px-2">
          {/* Authentic Android Handset Device Mockup */}
          <div className="relative w-full max-w-[430px] h-[880px] bg-white dark:bg-slate-900 rounded-[44px] shadow-2xl border-[10px] border-slate-800 dark:border-slate-800 flex flex-col overflow-hidden ring-1 ring-slate-900/10">
            {/* Camera Punch Hole & Android Status Bar */}
            <div className="h-10 bg-emerald-700 dark:bg-slate-900 text-white px-6 flex items-center justify-between text-xs select-none shrink-0 relative z-30">
              <span className="font-semibold text-xs tracking-tight">{time || '09:41'}</span>

              {/* Front Camera cutout */}
              <div className="absolute left-1/2 -translate-x-1/2 top-2.5 w-3.5 h-3.5 bg-black rounded-full ring-2 ring-emerald-800/40" />

              <div className="flex items-center gap-1.5 text-white/90">
                <Signal className="w-3.5 h-3.5" />
                <Wifi className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold">5G</span>
                <Battery className="w-4 h-4 fill-white" />
              </div>
            </div>

            {/* Inner App Container with Smooth Native Scrolling */}
            <div className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden no-scrollbar bg-slate-50 dark:bg-slate-950 relative">
              {children}
            </div>

            {/* Android Navigation Gesture Pill Bar */}
            <div className="h-4 bg-white dark:bg-slate-900 flex items-center justify-center shrink-0">
              <div className="w-28 h-1 bg-slate-300 dark:bg-slate-700 rounded-full" />
            </div>
          </div>
        </div>
      ) : (
        /* Full Screen / Responsive Layout for Web & Tablet */
        <div className="w-full max-w-4xl mx-auto flex-1 flex flex-col bg-white dark:bg-slate-900 min-h-[calc(100vh-40px)] shadow-sm">
          {children}
        </div>
      )}
    </div>
  );
};
