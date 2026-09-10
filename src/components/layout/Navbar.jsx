import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Sparkles, Bell, Globe, PlusCircle, Menu, X,
  LogIn, LogOut, Users, GraduationCap, Building2, Shield, ChevronDown
} from 'lucide-react';
import { NotificationDropdown } from './NotificationDropdown';
import { motion, AnimatePresence } from 'framer-motion';

const ROLE_ICONS = {
  citizen: Users,
  university: GraduationCap,
  industry: Building2,
  admin: Shield
};

const ROLE_COLORS = {
  citizen: 'text-blue-400',
  university: 'text-indigo-400',
  industry: 'text-emerald-400',
  admin: 'text-amber-400'
};

export const Navbar = () => {
  const {
    currentPath,
    navigate,
    language,
    setLanguage,
    notifications,
    setIsSubmitModalOpen,
    isLoggedIn,
    currentRole,
    logout,
    setIsLoginModalOpen,
    setPendingAfterLogin,
    t
  } = useApp();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const unreadCount = notifications.filter(n => n.unread).length;

  // Role visibility control: Only anonymous or logged-in citizens can see "Submit Challenge"
  const showSubmitButton = !isLoggedIn || currentRole === 'citizen';

  // Public center nav links (no login required)
  const publicNavLinks = [
    { label: t.nav.home, path: '/' },
    { label: t.nav.heatmap, path: '/heatmap', badge: 'GIS' },
    { label: t.nav.stateAnalytics, path: '/analytics' }
  ];

  const RoleIcon = currentRole ? ROLE_ICONS[currentRole] : null;
  const roleColor = currentRole ? ROLE_COLORS[currentRole] : '';

  const handleSubmitClick = () => {
    if (!isLoggedIn) {
      setPendingAfterLogin(() => () => setIsSubmitModalOpen(true));
      setIsLoginModalOpen(true);
    } else if (currentRole === 'citizen') {
      setIsSubmitModalOpen(true);
    }
  };

  const handleLogoClick = () => {
    if (!isLoggedIn || !currentRole) {
      navigate('/');
      return;
    }
    const roleDashboardMap = {
      citizen: '/dashboard/citizen',
      university: '/dashboard/university',
      industry: '/dashboard/industry',
      admin: '/dashboard/admin',
    };
    const targetPath = roleDashboardMap[currentRole] || '/';
    navigate(targetPath);
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#0B1120]/90 backdrop-blur-xl transition-all">
        {/* Top Mini Government Bar */}
        <div className="bg-slate-950/70 border-b border-slate-800/50 py-1 px-4 sm:px-8 text-[11px] text-slate-400 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-semibold text-slate-300">Government of Jharkhand</span>
            <span className="hidden sm:inline text-slate-500">|</span>
            <span className="hidden sm:inline text-slate-400">Department of Higher &amp; Technical Education</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden md:inline-flex items-center gap-1.5 text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              State Innovation Engine Online
            </span>
            {/* Language Toggle */}
            <button
              onClick={() => setLanguage(l => (l === 'en' ? 'hi' : 'en'))}
              className="flex items-center gap-1 text-slate-300 hover:text-white font-medium transition-colors"
              aria-label="Toggle language"
            >
              <Globe className="w-3.5 h-3.5 text-indigo-400" />
              <span className="font-bold">{t.nav.language}</span>
            </button>
          </div>
        </div>

        {/* ── Main Navbar ─────────────────────────────────────────────────── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">

          {/* LEFT: Logo */}
          <div
            onClick={handleLogoClick}
            className="flex items-center gap-3 cursor-pointer group shrink-0"
          >
            <div className="relative p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-emerald-500 text-white shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 border border-slate-900" />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-white font-sans">{t.appName}</span>
              <p className="text-[10px] font-medium text-slate-400 hidden sm:block tracking-wide">{t.tagline}</p>
            </div>
          </div>

          {/* CENTER: Public nav links (desktop) */}
          <nav className="hidden lg:flex items-center gap-1 mx-auto">
            {publicNavLinks.map((link) => {
              const isActive = currentPath === link.path;
              return (
                <button
                  key={link.path}
                  onClick={() => navigate(link.path)}
                  className={`relative px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    isActive
                      ? 'text-white bg-slate-800/80 shadow-inner'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                  }`}
                >
                  <span>{link.label}</span>
                  {link.badge && (
                    <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black bg-indigo-500 text-white shadow-sm">
                      {link.badge}
                    </span>
                  )}
                  {isActive && (
                    <span className="absolute bottom-1 left-3.5 right-3.5 h-0.5 rounded-full bg-gradient-to-r from-indigo-400 to-emerald-400" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* RIGHT: Actions */}
          <div className="flex items-center gap-2 shrink-0">

            {/* Submit a Challenge CTA — Restricted strictly to Citizens & Guests */}
            {showSubmitButton && (
              <button
                onClick={handleSubmitClick}
                className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <PlusCircle className="w-4 h-4" />
                <span>{t.submitProblemBtn}</span>
              </button>
            )}

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setIsNotifOpen(prev => !prev)}
                className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-slate-300 hover:text-white transition-colors relative"
                aria-label={t.nav.notifications}
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center animate-bounce">
                    {unreadCount}
                  </span>
                )}
              </button>
              <NotificationDropdown isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
            </div>

            {/* Login / User Menu */}
            {!isLoggedIn ? (
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700/60 text-slate-200 text-xs font-bold transition-all hover:border-indigo-500/50"
              >
                <LogIn className="w-4 h-4 text-indigo-400" />
                <span className="hidden sm:inline">{t.nav.login}</span>
              </button>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(p => !p)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700/60 text-xs font-bold transition-all ${roleColor}`}
                >
                  {RoleIcon && <RoleIcon className="w-4 h-4" />}
                  <span className="hidden sm:inline capitalize">{currentRole}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-52 rounded-2xl bg-slate-900/95 border border-slate-700/80 shadow-2xl backdrop-blur-xl overflow-hidden z-50 text-left"
                    >
                      <div className="px-4 py-3 border-b border-slate-800">
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">{t.nav.loggedInAs}</p>
                        <p className={`text-xs font-bold mt-0.5 capitalize ${roleColor}`}>{currentRole}</p>
                      </div>
                      <div className="p-2 space-y-1">
                        <button
                          onClick={() => { setIsLoginModalOpen(true); setIsUserMenuOpen(false); }}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-slate-800 transition-all text-left font-semibold"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                          {t.nav.switchRoleLabel}
                        </button>
                        <button
                          onClick={() => { logout(); setIsUserMenuOpen(false); }}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all text-left font-semibold"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          {t.nav.logout}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Mobile Hamburger */}
            <button
              onClick={() => setIsMobileMenuOpen(prev => !prev)}
              className="lg:hidden p-2 rounded-xl bg-slate-800/80 border border-slate-700/60 text-slate-300 hover:text-white"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden overflow-hidden border-t border-slate-800 bg-slate-900/95 backdrop-blur-xl"
            >
              <div className="px-4 pt-3 pb-6 space-y-2">
                {showSubmitButton && (
                  <button
                    onClick={() => { handleSubmitClick(); setIsMobileMenuOpen(false); }}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-emerald-600 text-white font-bold text-xs shadow-md mb-3"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>{t.submitProblemBtn}</span>
                  </button>
                )}

                {publicNavLinks.map(link => (
                  <button
                    key={link.path}
                    onClick={() => { navigate(link.path); setIsMobileMenuOpen(false); }}
                    className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between ${
                      currentPath === link.path
                        ? 'bg-slate-800 text-white font-bold'
                        : 'text-slate-300 hover:bg-slate-800/50'
                    }`}
                  >
                    <span>{link.label}</span>
                    {link.badge && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-indigo-500 text-white">
                        {link.badge}
                      </span>
                    )}
                  </button>
                ))}

                <div className="pt-2 border-t border-slate-800">
                  {!isLoggedIn ? (
                    <button
                      onClick={() => { setIsLoginModalOpen(true); setIsMobileMenuOpen(false); }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-indigo-300 hover:bg-slate-800"
                    >
                      <LogIn className="w-4 h-4" />
                      {t.nav.login}
                    </button>
                  ) : (
                    <button
                      onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-500/10"
                    >
                      <LogOut className="w-4 h-4" />
                      {t.nav.logout}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Click-away for user menu */}
      {isUserMenuOpen && (
        <div className="fixed inset-0 z-30" onClick={() => setIsUserMenuOpen(false)} />
      )}
    </>
  );
};
