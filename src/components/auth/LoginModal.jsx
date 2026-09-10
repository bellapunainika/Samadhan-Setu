import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, GraduationCap, Building2, Shield,
  X, ArrowRight, Eye, EyeOff, Sparkles, Info, UserPlus, LogIn
} from 'lucide-react';

const ROLE_CONFIG = [
  {
    id: 'citizen',
    icon: Users,
    emoji: '👤',
    color: 'from-blue-600 to-cyan-500',
    border: 'border-blue-500/50',
    glow: 'shadow-blue-500/20',
    ring: 'ring-blue-500/40',
    textColor: 'text-blue-400',
    bg: 'bg-blue-500/10'
  },
  {
    id: 'university',
    icon: GraduationCap,
    emoji: '🎓',
    color: 'from-indigo-600 to-violet-500',
    border: 'border-indigo-500/50',
    glow: 'shadow-indigo-500/20',
    ring: 'ring-indigo-500/40',
    textColor: 'text-indigo-400',
    bg: 'bg-indigo-500/10'
  },
  {
    id: 'industry',
    icon: Building2,
    emoji: '🏭',
    color: 'from-emerald-600 to-teal-500',
    border: 'border-emerald-500/50',
    glow: 'shadow-emerald-500/20',
    ring: 'ring-emerald-500/40',
    textColor: 'text-emerald-400',
    bg: 'bg-emerald-500/10'
  },
  {
    id: 'admin',
    icon: Shield,
    emoji: '🛡️',
    color: 'from-amber-600 to-orange-500',
    border: 'border-amber-500/50',
    glow: 'shadow-amber-500/20',
    ring: 'ring-amber-500/40',
    textColor: 'text-amber-400',
    bg: 'bg-amber-500/10'
  }
];

// Admin cannot self-register — only login
const REGISTER_BLOCKED_ROLES = new Set(['admin']);

export const LoginModal = ({ isOpen, onClose }) => {
  const { t, loginAs, registerUser } = useApp();

  // phase: 'role' | 'login' | 'register'
  const [phase, setPhase] = useState('role');
  const [selectedRole, setSelectedRole] = useState(null);

  // Login form state
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Register form state (extra fields)
  const [regFullName,     setRegFullName]     = useState('');
  const [regEmail,        setRegEmail]        = useState('');
  const [regPassword,     setRegPassword]     = useState('');
  const [regConfirm,      setRegConfirm]      = useState('');
  const [regOrg,          setRegOrg]          = useState('');
  const [regPhone,        setRegPhone]        = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const config = selectedRole ? ROLE_CONFIG.find(r => r.id === selectedRole.id) : null;

  const resetForm = () => {
    setEmail(''); setPassword(''); setShowPassword(false);
    setRegFullName(''); setRegEmail(''); setRegPassword('');
    setRegConfirm(''); setRegOrg(''); setRegPhone('');
    setShowRegPassword(false);
    setError(''); setSuccess('');
  };

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    resetForm();
    setPhase('login');
  };

  const handleBack = () => {
    setPhase('role');
    setSelectedRole(null);
    resetForm();
  };

  const handleSwitchToRegister = () => {
    resetForm();
    setRegEmail(email); // pre-fill email if already typed
    setPhase('register');
  };

  const handleSwitchToLogin = () => {
    resetForm();
    setEmail(regEmail); // carry email back
    setPhase('login');
  };

  const handleClose = () => {
    setPhase('role');
    setSelectedRole(null);
    resetForm();
    onClose();
  };

  // ── Login submit ────────────────────────────────────────────────────────────
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    const result = await loginAs(selectedRole.id, email, password);
    setIsLoading(false);
    if (!result.success) {
      setError(result.error || t.login.invalidCreds);
    } else {
      handleClose();
    }
  };

  // ── Register submit ─────────────────────────────────────────────────────────
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');

    if (regPassword !== regConfirm) {
      setError('Passwords do not match.');
      return;
    }
    if (regPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    const result = await registerUser({
      email:        regEmail,
      password:     regPassword,
      full_name:    regFullName,
      role:         selectedRole.id,
      organization: regOrg || undefined,
      phone:        regPhone || undefined,
    });
    setIsLoading(false);

    if (result.success) {
      setSuccess('Account created! Please log in below.');
      // Pre-fill login form and switch back
      setEmail(regEmail);
      setPassword('');
      setTimeout(() => handleSwitchToLogin(), 1800);
    } else {
      setError(result.error || 'Registration failed.');
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
          />

          {/* Modal Panel */}
          <motion.div
            key="panel"
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className="relative w-full max-w-2xl bg-[#0B1120]/95 border border-slate-700/80 rounded-3xl shadow-2xl shadow-indigo-500/10 backdrop-blur-xl overflow-hidden"
          >
            {/* Top gradient bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500" />
            {/* Ambient glow */}
            <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-48 bg-indigo-600/20 blur-[80px] rounded-full pointer-events-none" />

            {/* Header */}
            <div className="relative px-8 pt-8 pb-6 text-center">
              <button
                onClick={handleClose}
                className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/70 transition-all"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full bg-indigo-500/15 border border-indigo-500/30">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-xs font-bold text-indigo-300">Samadhan Setu</span>
              </div>

              <AnimatePresence mode="wait">
                {phase === 'role' && (
                  <motion.div key="role-heading" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                    <h2 className="text-2xl font-black text-white tracking-tight">{t.login.modalTitle}</h2>
                    <p className="text-sm text-slate-400 mt-2 max-w-md mx-auto leading-relaxed">{t.login.whoAreYou}</p>
                  </motion.div>
                )}
                {phase === 'login' && (
                  <motion.div key="login-heading" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-1">
                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${config?.bg} ${config?.textColor} text-xs font-bold mb-2`}>
                      <span>{selectedRole?.emoji}</span>
                      <span>{t.login[`${selectedRole?.id}Title`]}</span>
                    </div>
                    <h2 className="text-2xl font-black text-white">{t.login.formTitle}</h2>
                  </motion.div>
                )}
                {phase === 'register' && (
                  <motion.div key="register-heading" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-1">
                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${config?.bg} ${config?.textColor} text-xs font-bold mb-2`}>
                      <span>{selectedRole?.emoji}</span>
                      <span>Create {t.login[`${selectedRole?.id}Title`]} Account</span>
                    </div>
                    <h2 className="text-2xl font-black text-white">Create Account</h2>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Body */}
            <div className="px-8 pb-8">
              <AnimatePresence mode="wait">

                {/* ── Phase 1: Role Selector ──────────────────────────────── */}
                {phase === 'role' && (
                  <motion.div
                    key="role-grid"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="grid grid-cols-2 gap-3"
                  >
                    {ROLE_CONFIG.map((role) => {
                      const Icon = role.icon;
                      const titleKey = `${role.id}Title`;
                      const descKey  = `${role.id}Desc`;
                      return (
                        <motion.button
                          key={role.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleRoleSelect(role)}
                          className={`relative p-5 rounded-2xl border ${role.border} bg-slate-900/60 hover:bg-slate-800/60 text-left transition-all group shadow-lg ${role.glow} hover:ring-2 ${role.ring}`}
                        >
                          <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${role.color} flex items-center justify-center text-white shadow-md mb-3 group-hover:scale-110 transition-transform`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <h3 className="text-sm font-bold text-white mb-1">{t.login[titleKey]}</h3>
                          <p className="text-[11px] text-slate-400 leading-snug">{t.login[descKey]}</p>
                          <ArrowRight className={`absolute top-5 right-5 w-4 h-4 ${role.textColor} opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all`} />
                        </motion.button>
                      );
                    })}
                  </motion.div>
                )}

                {/* ── Phase 2: Login Form ─────────────────────────────────── */}
                {phase === 'login' && (
                  <motion.div
                    key="login-form"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-5"
                  >
                    <form onSubmit={handleLoginSubmit} className="space-y-4">
                      {/* Email */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-slate-300">{t.login.emailLabel}</label>
                        <input
                          type="email"
                          value={email}
                          onChange={e => { setEmail(e.target.value); setError(''); }}
                          placeholder="Enter your email"
                          required
                          autoComplete="email"
                          className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all"
                        />
                      </div>

                      {/* Password */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-slate-300">{t.login.passwordLabel}</label>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={e => { setPassword(e.target.value); setError(''); }}
                            placeholder="••••••••"
                            required
                            autoComplete="current-password"
                            className="w-full px-4 py-3 pr-11 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all"
                          />
                          <button type="button" onClick={() => setShowPassword(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Error */}
                      {error && (
                        <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300">
                          <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                          <span>{error}</span>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-3 pt-1">
                        <button type="button" onClick={handleBack} className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 transition-all border border-slate-700">
                          {t.login.backBtn}
                        </button>
                        <button
                          type="submit"
                          disabled={isLoading}
                          className={`flex-1 py-3 rounded-xl text-sm font-extrabold text-white bg-gradient-to-r ${config?.color} hover:opacity-90 shadow-lg transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-70`}
                        >
                          {isLoading ? (
                            <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /><span>Signing in…</span></>
                          ) : (
                            <><LogIn className="w-4 h-4" /><span>{t.login.continueBtn}</span></>
                          )}
                        </button>
                      </div>
                    </form>

                    {/* Register link — hidden for admin */}
                    {!REGISTER_BLOCKED_ROLES.has(selectedRole?.id) && (
                      <div className="text-center pt-1 border-t border-slate-800">
                        <p className="text-xs text-slate-500 mt-3">
                          Don't have an account?{' '}
                          <button onClick={handleSwitchToRegister} className="text-indigo-400 hover:text-indigo-300 font-bold transition-colors">
                            Create one
                          </button>
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* ── Phase 3: Register Form ──────────────────────────────── */}
                {phase === 'register' && (
                  <motion.div
                    key="register-form"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-4"
                  >
                    <form onSubmit={handleRegisterSubmit} className="space-y-3">
                      {/* Full Name */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-slate-300">Full Name *</label>
                        <input
                          type="text"
                          value={regFullName}
                          onChange={e => { setRegFullName(e.target.value); setError(''); }}
                          placeholder="Your full name"
                          required
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all"
                        />
                      </div>

                      {/* Email */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-slate-300">{t.login.emailLabel} *</label>
                        <input
                          type="email"
                          value={regEmail}
                          onChange={e => { setRegEmail(e.target.value); setError(''); }}
                          placeholder="your@email.com"
                          required
                          autoComplete="email"
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all"
                        />
                      </div>

                      {/* Organization (optional) */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-slate-300">
                          {selectedRole?.id === 'university' ? 'University / Institution' : 'Organization'}{' '}
                          <span className="text-slate-500">(optional)</span>
                        </label>
                        <input
                          type="text"
                          value={regOrg}
                          onChange={e => setRegOrg(e.target.value)}
                          placeholder={selectedRole?.id === 'university' ? 'e.g. BIT Mesra' : 'e.g. Tata Steel'}
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all"
                        />
                      </div>

                      {/* Password */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <label className="block text-xs font-semibold text-slate-300">Password *</label>
                          <div className="relative">
                            <input
                              type={showRegPassword ? 'text' : 'password'}
                              value={regPassword}
                              onChange={e => { setRegPassword(e.target.value); setError(''); }}
                              placeholder="Min 6 chars"
                              required
                              autoComplete="new-password"
                              className="w-full px-3 py-2.5 pr-9 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all"
                            />
                            <button type="button" onClick={() => setShowRegPassword(p => !p)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                              {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <label className="block text-xs font-semibold text-slate-300">Confirm Password *</label>
                          <input
                            type={showRegPassword ? 'text' : 'password'}
                            value={regConfirm}
                            onChange={e => { setRegConfirm(e.target.value); setError(''); }}
                            placeholder="Repeat password"
                            required
                            autoComplete="new-password"
                            className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all"
                          />
                        </div>
                      </div>

                      {/* Error / Success */}
                      {error && (
                        <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300">
                          <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                          <span>{error}</span>
                        </div>
                      )}
                      {success && (
                        <div className="flex items-start gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300">
                          <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                          <span>{success}</span>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-3 pt-1">
                        <button type="button" onClick={handleSwitchToLogin} className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 transition-all border border-slate-700">
                          Back to Login
                        </button>
                        <button
                          type="submit"
                          disabled={isLoading}
                          className={`flex-1 py-3 rounded-xl text-sm font-extrabold text-white bg-gradient-to-r ${config?.color} hover:opacity-90 shadow-lg transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-70`}
                        >
                          {isLoading ? (
                            <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /><span>Creating…</span></>
                          ) : (
                            <><UserPlus className="w-4 h-4" /><span>Create Account</span></>
                          )}
                        </button>
                      </div>
                    </form>
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
