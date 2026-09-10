import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Sparkles, Flame, MapPin, ArrowRight, ShieldCheck, 
  GraduationCap, Building2, Users, CheckCircle2, Droplets,
  Search, Filter, ChevronRight, Award, Zap
} from 'lucide-react';
import { StatCounter } from '../components/common/StatCounter';
import { ChallengeCard } from '../components/citizen/ChallengeCard';
import { JharkhandHeatmap } from '../components/heatmap/JharkhandHeatmap';
import { CATEGORIES } from '../data/jharkhandDistricts';
import { motion } from 'framer-motion';

export const HomePage = () => {
  const { 
    problems, 
    stats, 
    navigate, 
    setIsSubmitModalOpen,
    setIsLoginModalOpen,
    setPendingAfterLogin,
    isLoggedIn,
    currentRole,
    t 
  } = useApp();

  // Gate "Submit a Challenge" behind login — opens Login Modal if not authenticated,
  // then automatically opens the submission form after successful login.
  const handleSubmitClick = () => {
    if (!isLoggedIn) {
      setPendingAfterLogin(() => () => setIsSubmitModalOpen(true));
      setIsLoginModalOpen(true);
    } else {
      setIsSubmitModalOpen(true);
    }
  };

  // If already logged in, clicking a role card goes straight to their dashboard
  const handleRoleEntry = (role, path) => {
    if (isLoggedIn && currentRole === role) {
      navigate(path);
    } else {
      setIsLoginModalOpen(true);
    }
  };

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProblems = problems.filter(p => {
    const matchCat = selectedCategory === 'All' || p.category === selectedCategory;
    const matchQuery = !searchQuery.trim() || 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.districtName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchQuery;
  });

  const howItWorksSteps = [
    {
      num: '01',
      title: 'Citizen Crowdsources',
      desc: 'Villagers, Gram Panchayats & ULBs submit geo-tagged challenges with photo/video proof.',
      icon: Users,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      num: '02',
      title: 'AI Clusters & Routes',
      desc: 'Vector deduplication merges duplicate reports and matches domain to specialized university labs.',
      icon: Sparkles,
      color: 'from-indigo-500 to-violet-500'
    },
    {
      num: '03',
      title: 'University Solves',
      desc: 'Faculty & student teams prototype scalable solutions, test in labs & file joint patents.',
      icon: GraduationCap,
      color: 'from-emerald-500 to-teal-500'
    },
    {
      num: '04',
      title: 'Industry Deploys',
      desc: 'Corporate CSR funds & Startups commercialize validated prototypes across Jharkhand.',
      icon: Building2,
      color: 'from-amber-500 to-orange-500'
    }
  ];

  return (
    <div className="space-y-20 pb-16 text-left">
      {/* Hero Section */}
      <section className="relative pt-12 pb-16 overflow-hidden">
        {/* Glow ambient spots */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-indigo-600/20 via-purple-600/15 to-emerald-600/20 blur-[120px] rounded-full pointer-events-none -z-10" />

        <div className="max-w-5xl mx-auto text-center space-y-6 px-4">
          {/* Top Pill */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-850/90 border border-slate-700/80 shadow-lg text-xs font-semibold text-slate-200"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Jharkhand Societal Innovation Portal</span>
            <span className="text-slate-500">|</span>
            <span className="text-indigo-400 font-bold">Govt of Jharkhand</span>
          </motion.div>

          {/* Main Title */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-[1.1] font-sans"
          >
            Crowdsourcing Societal Needs.{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-emerald-400 bg-clip-text text-transparent">
              Powering University & Industry Solutions.
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-base sm:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed font-normal"
          >
            {t.heroSubtitle}
          </motion.p>

          {/* Hero CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="pt-4 flex flex-wrap items-center justify-center gap-4"
          >
            <button
              onClick={handleSubmitClick}
              className="px-7 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white font-extrabold text-sm shadow-xl shadow-indigo-500/25 flex items-center gap-2.5 transition-all hover:scale-105 active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>{t.submitProblemBtn}</span>
            </button>

            <button
              onClick={() => navigate('/heatmap')}
              className="px-7 py-3.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-slate-200 font-bold text-sm flex items-center gap-2 shadow-lg transition-all hover:scale-105"
            >
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span>{t.exploreHeatmapBtn}</span>
            </button>
          </motion.div>
        </div>
      </section>

      {/* Live Animated Stat Counters */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCounter
            endValue={248}
            label={t.stats.totalProblems}
            icon={Flame}
            color="rose"
          />
          <StatCounter
            endValue={84}
            label={t.stats.solvedProblems}
            icon={CheckCircle2}
            color="emerald"
          />
          <StatCounter
            endValue={28}
            label={t.stats.activeUniversities}
            icon={GraduationCap}
            color="indigo"
          />
          <StatCounter
            endValue="₹18.4 Cr"
            label={t.stats.csrFunds}
            icon={Building2}
            color="amber"
          />
        </div>
      </section>

      {/* ⭐ Signature GIS Urgency Heatmap Preview Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-400 mb-1">
              <MapPin className="w-4 h-4" />
              <span>Signature GIS Intelligence</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Statewide District Urgency Heatmap
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Interactive 24-district telemetry visualizing problem density, unresolved backlogs, and academic solver coverage.
            </p>
          </div>

          <button
            onClick={() => navigate('/heatmap')}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-indigo-600 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <span>Full GIS Screen</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Embedded Interactive Heatmap */}
        <JharkhandHeatmap compact={false} />
      </section>

      {/* How it Works 4-Step Flow */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
            Collaborative Pipeline
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            How Samadhan Setu Works
          </h2>
          <p className="text-xs text-slate-400">
            Connecting grassroots societal pain points with state-of-the-art university labs and CSR capital.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {howItWorksSteps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="p-6 rounded-3xl bg-[#0F172A]/80 border border-slate-700/60 backdrop-blur-xl shadow-lg relative overflow-hidden group hover:border-indigo-500/50 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl font-black text-slate-700 group-hover:text-indigo-400 transition-colors">
                    {step.num}
                  </span>
                  <div className={`p-3 rounded-2xl bg-gradient-to-br ${step.color} text-white shadow-md group-hover:scale-110 transition-transform`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>

                <h3 className="text-base font-bold text-white mb-2">
                  {step.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4 Role-Based Entry Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
            Tailored Stakeholder Portals
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Sign In to Collaborate
          </h2>
          <p className="text-xs text-slate-400">
            Each role unlocks a personalised dashboard, workflow tools, and collaboration features.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Citizen */}
          <div
            onClick={() => handleRoleEntry('citizen', '/dashboard/citizen')}
            className="p-6 rounded-3xl bg-slate-900/80 border border-blue-500/30 hover:border-blue-500 cursor-pointer transition-all hover:scale-[1.02] group space-y-3"
          >
            <div className="p-3 rounded-2xl bg-blue-500/20 text-blue-400 w-fit">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white group-hover:text-blue-300">I'm a Citizen</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Report local problems, upload photo proof, upvote nearby issues, and track solution delivery.
            </p>
            <div className="text-xs font-bold text-blue-400 flex items-center gap-1 pt-2">
              <span>Enter Citizen Hub</span> <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* University */}
          <div
            onClick={() => handleRoleEntry('university', '/dashboard/university')}
            className="p-6 rounded-3xl bg-slate-900/80 border border-indigo-500/30 hover:border-indigo-500 cursor-pointer transition-all hover:scale-[1.02] group space-y-3"
          >
            <div className="p-3 rounded-2xl bg-indigo-500/20 text-indigo-400 w-fit">
              <GraduationCap className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white group-hover:text-indigo-300">I'm a University</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Browse AI-routed problems, assemble student/faculty R&D teams, and build funded prototypes.
            </p>
            <div className="text-xs font-bold text-indigo-400 flex items-center gap-1 pt-2">
              <span>Open University Lab</span> <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Industry */}
          <div
            onClick={() => handleRoleEntry('industry', '/dashboard/industry')}
            className="p-6 rounded-3xl bg-slate-900/80 border border-emerald-500/30 hover:border-emerald-500 cursor-pointer transition-all hover:scale-[1.02] group space-y-3"
          >
            <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400 w-fit">
              <Building2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white group-hover:text-emerald-300">I'm an Industry Partner</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Pledge CSR funds, adopt validated prototypes, mentor startups, and execute deployment MoUs.
            </p>
            <div className="text-xs font-bold text-emerald-400 flex items-center gap-1 pt-2">
              <span>Explore CSR Prototypes</span> <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Admin */}
          <div
            onClick={() => handleRoleEntry('admin', '/dashboard/admin')}
            className="p-6 rounded-3xl bg-slate-900/80 border border-amber-500/30 hover:border-amber-500 cursor-pointer transition-all hover:scale-[1.02] group space-y-3"
          >
            <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400 w-fit">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white group-hover:text-amber-300">I'm a Govt Official</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              District urgency monitoring, policy intelligence, AI routing overrides, and cabinet export reports.
            </p>
            <div className="text-xs font-bold text-amber-400 flex items-center gap-1 pt-2">
              <span>State Executive View</span> <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Crowdsourced Challenges Feed */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1">
              <Flame className="w-3.5 h-3.5" /> Live Grassroots Feed
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
              Active Societal Challenges in Jharkhand
            </h2>
            <p className="text-xs text-slate-400">
              Community issues submitted across all 24 districts awaiting research, prototyping, or scale-up.
            </p>
          </div>

          {/* Search bar */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search challenges, keywords, districts..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
              selectedCategory === 'All'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            All Challenges ({problems.length})
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                selectedCategory === cat.id
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Challenge Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProblems.slice(0, 9).map(problem => (
            <ChallengeCard key={problem.id} problem={problem} />
          ))}
        </div>

        {filteredProblems.length > 9 && (
          <div className="text-center pt-4">
            <button
              onClick={() => navigate('/dashboard/citizen')}
              className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition-all shadow-md"
            >
              View All {filteredProblems.length} Challenges
            </button>
          </div>
        )}
      </section>
    </div>
  );
};
