import React, { useEffect, useState } from 'react';
import { ArrowRight, ShieldCheck } from 'lucide-react';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(onFinish, 200);
          return 100;
        }
        return prev + 25;
      });
    }, 250);

    return () => clearInterval(timer);
  }, [onFinish]);

  return (
    <div className="flex-1 flex flex-col items-center justify-between p-6 bg-gradient-to-b from-emerald-800 via-emerald-900 to-slate-950 text-white min-h-[550px] select-none">
      <div className="h-4" />

      {/* Center Logo & Brand Identity */}
      <div className="flex flex-col items-center text-center space-y-4 max-w-xs">
        {/* Generated High Fidelity App Logo Asset */}
        <div className="relative">
          <div className="w-28 h-28 rounded-3xl overflow-hidden shadow-2xl ring-4 ring-emerald-500/30 bg-white p-2">
            <img
              src="/src/assets/images/khata_app_logo_1793243905337.jpg"
              alt="M Khata App Logo"
              className="w-full h-full object-cover rounded-2xl"
              onError={(e) => {
                // Fallback container in case image load fails
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>
          <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-black text-sm shadow-md ring-2 ring-emerald-900">
            ₹
          </div>
        </div>

        <div>
          <h1 className="text-3xl font-black tracking-tight text-white">
            M Khata
          </h1>
          <p className="text-sm font-bold tracking-wider uppercase text-emerald-300 mt-0.5">
            Digital Hisab Kitab
          </p>
        </div>

        <p className="text-xs text-emerald-100/80 leading-relaxed font-medium">
          दुकानदारों और व्यापारियों के लिए सबसे आसान और सुरक्षित डिजिटल खाता बही
        </p>

        {/* Progress Bar */}
        <div className="w-48 h-1.5 bg-emerald-950 rounded-full overflow-hidden mt-6">
          <div
            style={{ width: `${progress}%` }}
            className="h-full bg-emerald-400 transition-all duration-200"
          />
        </div>
      </div>

      {/* Bottom Trust Badge & Skip Button */}
      <div className="w-full flex flex-col items-center space-y-3">
        <button
          onClick={onFinish}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-xs transition-colors"
        >
          <span>Open Dashboard</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>

        <div className="flex items-center gap-1.5 text-[11px] text-emerald-300/70">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Made in India · 100% Free & Secure</span>
        </div>
      </div>
    </div>
  );
};
