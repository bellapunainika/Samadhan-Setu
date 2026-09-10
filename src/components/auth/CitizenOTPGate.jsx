import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, ShieldCheck, X, Sparkles, CheckCircle2 } from 'lucide-react';

export const CitizenOTPGate = ({ isOpen, onClose, onSuccess }) => {
  const { t, showToast } = useApp();
  const [phase, setPhase] = useState('phone'); // 'phone' | 'otp' | 'verified'
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!phone.trim()) return;
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 800));
    setIsLoading(false);
    setPhase('otp');
    showToast('OTP Sent', 'A mock verification code has been dispatched.', 'info');
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError(t.otp.invalidOtp);
      return;
    }
    setError('');
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 600));
    setIsLoading(false);
    setPhase('verified');
    setTimeout(() => {
      handleClose();
      onSuccess?.();
    }, 900);
  };

  const handleSkip = () => {
    handleClose();
    onSuccess?.();
  };

  const handleClose = () => {
    setPhase('phone');
    setPhone('');
    setOtp('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 24 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className="relative w-full max-w-sm bg-[#0B1120]/95 border border-slate-700/80 rounded-3xl shadow-2xl backdrop-blur-xl overflow-hidden"
          >
            {/* Top accent bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-500" />

            {/* Close */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="p-8 space-y-6">
              <AnimatePresence mode="wait">
                {phase === 'verified' ? (
                  <motion.div
                    key="verified"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-4 space-y-3"
                  >
                    <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                    </div>
                    <h3 className="text-lg font-black text-white">Verified!</h3>
                    <p className="text-xs text-slate-400">Opening submission form…</p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="form"
                    initial={{ opacity: 0, x: phase === 'otp' ? 20 : 0 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    className="space-y-5"
                  >
                    {/* Icon + Title */}
                    <div className="text-center space-y-2">
                      <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center mx-auto">
                        {phase === 'otp' ? <ShieldCheck className="w-6 h-6 text-blue-400" /> : <Phone className="w-6 h-6 text-blue-400" />}
                      </div>
                      <h3 className="text-lg font-black text-white">{t.otp.title}</h3>
                      <p className="text-xs text-slate-400 leading-relaxed">{t.otp.subtitle}</p>
                    </div>

                    {/* Phone Phase */}
                    {phase === 'phone' && (
                      <form onSubmit={handleSendOtp} className="space-y-4">
                        <input
                          type="tel"
                          value={phone}
                          onChange={e => setPhone(e.target.value)}
                          placeholder={t.otp.phonePlaceholder}
                          required
                          className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all"
                        />
                        <button
                          type="submit"
                          disabled={isLoading}
                          className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                        >
                          {isLoading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
                          {t.otp.sendOtp}
                        </button>
                      </form>
                    )}

                    {/* OTP Phase */}
                    {phase === 'otp' && (
                      <form onSubmit={handleVerify} className="space-y-4">
                        <p className="text-xs text-slate-400 text-center">
                          OTP sent to <span className="text-white font-semibold">{phone}</span>
                        </p>
                        <input
                          type="text"
                          value={otp}
                          onChange={e => { setOtp(e.target.value.replace(/\D/g, '').slice(0, 6)); setError(''); }}
                          placeholder={t.otp.otpPlaceholder}
                          maxLength={6}
                          required
                          className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm text-center tracking-widest text-lg font-mono placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all"
                        />
                        {error && <p className="text-xs text-rose-400 text-center">{error}</p>}
                        <button
                          type="submit"
                          disabled={isLoading}
                          className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                        >
                          {isLoading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                          {t.otp.verify}
                        </button>
                      </form>
                    )}

                    {/* Demo skip */}
                    <button
                      onClick={handleSkip}
                      className="w-full py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 transition-all flex items-center justify-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                      {t.otp.skip}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
