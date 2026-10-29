import React, { useState } from 'react';
import { Phone, ArrowRight, ShieldCheck, CheckCircle2, Store } from 'lucide-react';
import { useKhata } from '../context/KhataContext';

export const AuthScreen: React.FC = () => {
  const { login, t, language, setLanguage } = useKhata();

  const [step, setStep] = useState<'mobile' | 'otp'>('mobile');
  const [mobile, setMobile] = useState('9876543210');
  const [name, setName] = useState('Ramesh Sharma');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = mobile.replace(/\D/g, '');
    if (clean.length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    setError('');
    setIsSending(true);

    setTimeout(() => {
      setIsSending(false);
      setStep('otp');
      setOtp('1234'); // Auto-fill test OTP for instantaneous smooth testing
    }, 400);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp !== '1234' && otp.length < 4) {
      setError('Please enter 4-digit OTP (hint: 1234)');
      return;
    }
    login(mobile, name);
  };

  return (
    <div className="flex-1 flex flex-col justify-between p-6 bg-white dark:bg-slate-900 text-slate-900 dark:text-white min-h-[500px]">
      {/* Top Brand Bar & Language Switcher */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-extrabold shadow-sm">
            MK
          </div>
          <span className="font-extrabold text-sm tracking-tight text-emerald-800 dark:text-emerald-400">
            M Khata
          </span>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 text-xs">
          {[
            { code: 'hi' as const, label: 'हिं' },
            { code: 'bn' as const, label: 'বাং' },
            { code: 'en' as const, label: 'EN' },
          ].map((l) => (
            <button
              key={l.code}
              onClick={() => setLanguage(l.code)}
              className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                language === l.code ? 'bg-white text-emerald-700 shadow-xs dark:bg-slate-700 dark:text-white' : 'text-slate-500'
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Form Center */}
      <div className="my-auto max-w-sm w-full mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            {step === 'mobile' ? t('loginTitle') : t('enterOtp')}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            {step === 'mobile' ? t('loginSubtitle') : `Enter the 4-digit code sent to +91 ${mobile}`}
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold">
            {error}
          </div>
        )}

        {step === 'mobile' ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Store / Merchant Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ramesh Sharma"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t('mobileNumber')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 font-bold text-xs">
                  +91
                </div>
                <input
                  type="tel"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="10-digit mobile number"
                  maxLength={10}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-mono font-bold tracking-wider focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  required
                  autoFocus
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSending}
              className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
            >
              <span>{isSending ? 'Sending OTP...' : t('sendOtp')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                4-Digit Security Code
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={4}
                placeholder="1234"
                className="w-full py-3 text-center rounded-xl border-2 border-emerald-500 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-2xl font-black tracking-[0.5em] focus:outline-hidden"
                required
                autoFocus
              />
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium text-center mt-2">
                ✓ {t('otpHint')} (Auto-filled)
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{t('verifyLogin')}</span>
            </button>

            <button
              type="button"
              onClick={() => setStep('mobile')}
              className="w-full text-center text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 py-1"
            >
              ← Change Mobile Number
            </button>
          </form>
        )}
      </div>

      {/* Trust & Privacy Marker */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center gap-2 text-[11px] text-slate-400 text-center">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
        <span>100% Secure & Private Digital Ledger. Encrypted local storage.</span>
      </div>
    </div>
  );
};
