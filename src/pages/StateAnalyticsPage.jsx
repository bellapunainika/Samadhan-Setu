import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { AnalyticsDashboard } from '../components/analytics/AnalyticsDashboard';
import {
  Globe, Search, Lock, ExternalLink, GraduationCap, Building2,
  Sparkles, Flame, CheckCircle2, Clock, ArrowRight, Filter, Eye
} from 'lucide-react';
import { StatusBadge, CategoryBadge, UrgencyPill } from '../components/common/Badge';
import { StatCounter } from '../components/common/StatCounter';
import { motion } from 'framer-motion';

export const StateAnalyticsPage = () => {
  const { problems, stats, navigate, isLoggedIn, setIsLoginModalOpen, t } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const statuses = ['All', 'Routed to University', 'In Progress', 'Solved', 'Pending Review'];
  const categories = ['All', 'Water & Sanitation', 'Agriculture', 'Healthcare', 'Mining & Environment', 'Rural Infrastructure', 'Tribal Livelihood', 'Education'];

  const filteredProblems = useMemo(() => {
    return problems.filter(p => {
      const matchStatus = statusFilter === 'All' || p.status === statusFilter;
      const matchCat = categoryFilter === 'All' || p.category === categoryFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch = !q ||
        p.title.toLowerCase().includes(q) ||
        p.districtName?.toLowerCase().includes(q) ||
        p.assignedUniversity?.name?.toLowerCase().includes(q) ||
        p.industryPartner?.name?.toLowerCase().includes(q);
      return matchStatus && matchCat && matchSearch;
    });
  }, [problems, statusFilter, categoryFilter, searchQuery]);

  const handleViewFull = (problemId) => {
    if (!isLoggedIn) {
      setIsLoginModalOpen(true);
    } else {
      navigate(`/project/${problemId}`);
    }
  };

  return (
    <div className="space-y-12 pb-16 text-left">
      {/* ── Page Header ──────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-indigo-950/40 to-transparent pt-10 pb-12 px-4">
        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600/10 via-purple-600/5 to-emerald-600/10 pointer-events-none" />
        <div className="max-w-5xl mx-auto text-center space-y-4">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-xs font-bold text-emerald-300"
          >
            <Globe className="w-3.5 h-3.5" />
            {t.stateAnalytics.publicBadge}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight"
          >
            {t.stateAnalytics.pageTitle}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-sm text-slate-300 max-w-3xl mx-auto leading-relaxed"
          >
            {t.stateAnalytics.pageSubtitle}
          </motion.p>
        </div>
      </section>

      {/* ── Aggregate KPI Counters ────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCounter endValue={248} label={t.stats.totalProblems} icon={Flame} color="rose" />
          <StatCounter endValue={84} label={t.stats.solvedProblems} icon={CheckCircle2} color="emerald" />
          <StatCounter endValue={28} label={t.stats.activeUniversities} icon={GraduationCap} color="indigo" />
          <StatCounter endValue="₹18.4 Cr" label={t.stats.csrFunds} icon={Building2} color="amber" />
        </div>
      </section>

      {/* ── Macro Analytics Charts (reused component) ────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 mb-6">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" />
            Statewide Analytics
          </span>
        </div>
        <AnalyticsDashboard />
      </section>

      {/* ── Project Explorer ─────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1">
              <Eye className="w-4 h-4" />
              <span>{t.stateAnalytics.projectExplorer}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {t.stateAnalytics.projectExplorer}
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              {t.stateAnalytics.projectExplorerSubtitle}
            </p>
          </div>

          {/* Login gate notice */}
          {!isLoggedIn && (
            <div
              onClick={() => setIsLoginModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700 text-xs text-slate-400 cursor-pointer hover:border-indigo-500/50 hover:text-slate-200 transition-all shrink-0"
            >
              <Lock className="w-3.5 h-3.5 text-indigo-400" />
              <span>{t.stateAnalytics.loginToViewDetails}</span>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={t.stateAnalytics.searchPlaceholder}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            {statuses.map(s => <option key={s} value={s}>{s === 'All' ? t.stateAnalytics.allStatuses : s}</option>)}
          </select>
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            {categories.map(c => <option key={c} value={c}>{c === 'All' ? t.stateAnalytics.filterByCategory : c}</option>)}
          </select>
        </div>

        <p className="text-xs text-slate-500">
          Showing {filteredProblems.length} of {problems.length} registered challenges
        </p>

        {/* Project Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProblems.map((prob, idx) => (
            <motion.div
              key={prob.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03, duration: 0.3 }}
              className="p-5 rounded-3xl bg-slate-900/80 border border-slate-700/80 hover:border-indigo-500/40 backdrop-blur-xl shadow-lg space-y-4 flex flex-col transition-all group"
            >
              {/* Top: category + urgency */}
              <div className="flex items-center justify-between">
                <CategoryBadge category={prob.category} />
                <UrgencyPill score={prob.urgencyScore} />
              </div>

              {/* Title */}
              <div>
                <h3 className="text-sm font-bold text-white leading-snug line-clamp-2 group-hover:text-indigo-300 transition-colors">
                  {prob.title}
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
                  📍 {prob.districtName}, Jharkhand
                </p>
              </div>

              {/* Public info grid */}
              <div className="rounded-2xl bg-slate-950/60 border border-slate-800/80 p-3 space-y-2 text-[11px]">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-slate-500 font-semibold shrink-0">{t.stateAnalytics.assignedUniversity}:</span>
                  <span className="text-indigo-300 font-bold text-right">
                    {prob.assignedUniversity?.name || 'Pending Assignment'}
                  </span>
                </div>
                {prob.assignedUniversity?.department && (
                  <div className="text-slate-500 text-[10px]">{prob.assignedUniversity.department}</div>
                )}
                {prob.industryPartner?.name && (
                  <div className="flex items-start justify-between gap-2 pt-1.5 border-t border-slate-800/60">
                    <span className="text-slate-500 font-semibold shrink-0">{t.stateAnalytics.assignedIndustry}:</span>
                    <span className="text-emerald-300 font-bold text-right">{prob.industryPartner.name}</span>
                  </div>
                )}
              </div>

              {/* Status + Outcome */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <StatusBadge status={prob.status} />
                </div>
                {prob.solutionSummary && (
                  <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">
                    {prob.solutionSummary}
                  </p>
                )}
                {!prob.solutionSummary && (
                  <p className="text-[11px] text-slate-600 italic">{t.stateAnalytics.noOutcomeYet}</p>
                )}
              </div>

              {/* CTA */}
              <div className="pt-2 border-t border-slate-800/60 mt-auto">
                <button
                  onClick={() => handleViewFull(prob.id)}
                  className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-slate-800/70 hover:bg-indigo-600 text-slate-300 hover:text-white text-xs font-bold transition-all group/btn"
                >
                  <span>{t.stateAnalytics.viewFullProject}</span>
                  {!isLoggedIn ? (
                    <Lock className="w-3.5 h-3.5 group-hover/btn:text-white" />
                  ) : (
                    <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                  )}
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredProblems.length === 0 && (
          <div className="text-center py-16">
            <p className="text-slate-500 text-sm">{t.common.noResults}</p>
          </div>
        )}
      </section>
    </div>
  );
};
