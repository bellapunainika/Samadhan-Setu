import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Building2, HandCoins, Award, ShieldCheck, Sparkles, 
  ArrowUpRight, Filter, Search, CheckCircle2, TrendingUp
} from 'lucide-react';
import { ExpressInterestModal } from '../components/industry/ExpressInterestModal';
import { MOCK_INDUSTRY } from '../data/mockIndustry';
import { CategoryBadge, UrgencyPill } from '../components/common/Badge';

export const IndustryDashboardPage = () => {
  const { problems, navigate } = useApp();

  const [selectedProblemForInterest, setSelectedProblemForInterest] = useState(null);
  const [trlFilter, setTrlFilter] = useState('All');

  // Prototypes that have research underway or ready for partnership
  const investablePrototypes = problems.filter(p => 
    p.status === 'In Progress' || p.status === 'Solved' || p.kanbanStage !== 'To Do'
  );

  const filteredPrototypes = investablePrototypes.filter(p => {
    if (trlFilter === 'All') return true;
    return p.trlLevel?.includes(trlFilter);
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left">
      {/* Industry Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-emerald-950/70 via-slate-900 to-teal-950/70 border border-emerald-500/40 p-6 sm:p-8 backdrop-blur-xl shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
              <Building2 className="w-3.5 h-3.5" />
              <span>Corporate CSR, Startup & MSME Partnership Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Invest in Validated Grassroots Solutions
            </h1>
            <p className="text-xs text-slate-300 leading-relaxed">
              Explore university-validated prototypes engineered for Jharkhand's ground challenges. Direct your CSR funds, technical mentorship, and manufacturing scale to high-impact projects.
            </p>
          </div>

          {/* CSR Financial Highlights */}
          <div className="grid grid-cols-2 gap-3 shrink-0">
            <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700 text-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">CSR Mobilized</span>
              <span className="text-xl font-extrabold text-emerald-400 mt-0.5 block">₹18.4 Cr</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700 text-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Active MoUs</span>
              <span className="text-xl font-extrabold text-white mt-0.5 block">42</span>
            </div>
          </div>
        </div>
      </div>

      {/* Corporate Partner Logos Bar */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Active Corporate & Foundation Partners
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {MOCK_INDUSTRY.map(ind => (
            <div
              key={ind.id}
              className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-3 text-xs"
            >
              <Building2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div className="min-w-0">
                <h5 className="font-bold text-white truncate">{ind.name.split('(')[0]}</h5>
                <span className="text-[10px] text-slate-400">{ind.totalPledged} Pledged</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Validated Prototypes Showcase Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight">
            Validated Solutions Seeking Scale & Pilot Co-Development ({filteredPrototypes.length})
          </h2>
          <p className="text-xs text-slate-400">Filter by Technology Readiness Level (TRL)</p>
        </div>

        {/* TRL Filter pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
          {['All', 'TRL 5', 'TRL 6', 'TRL 7', 'TRL 8', 'TRL 9'].map(trl => (
            <button
              key={trl}
              onClick={() => setTrlFilter(trl)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                trlFilter === trl
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {trl}
            </button>
          ))}
        </div>
      </div>

      {/* Prototypes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPrototypes.map(prob => (
          <div
            key={prob.id}
            className="p-6 rounded-3xl bg-slate-900/85 border border-slate-700/80 hover:border-emerald-500/50 backdrop-blur-xl shadow-xl space-y-4 flex flex-col justify-between group"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <CategoryBadge category={prob.category} />
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  {prob.trlLevel || 'TRL 6'}
                </span>
              </div>

              <h3
                onClick={() => navigate(`/project/${prob.id}`)}
                className="text-base font-bold text-white group-hover:text-emerald-300 cursor-pointer transition-colors leading-snug line-clamp-2"
              >
                {prob.title}
              </h3>

              <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                {prob.solutionSummary || prob.description}
              </p>

              {/* University & Patent */}
              <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">R&D Institution:</span>
                  <span className="font-bold text-indigo-300">{prob.assignedUniversity?.name}</span>
                </div>
                {prob.patentsFiled && prob.patentsFiled !== 'None' && (
                  <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-800/60">
                    <span className="text-slate-400">Patent Reg:</span>
                    <span className="font-mono text-emerald-400 font-bold">{prob.patentsFiled}</span>
                  </div>
                )}
              </div>

              {/* Current funding / Partner */}
              {prob.industryPartner?.pledgedAmount && (
                <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                  <span>Current CSR Pledged:</span>
                  <span className="text-emerald-400 font-bold">{prob.industryPartner.pledgedAmount}</span>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
              <button
                onClick={() => navigate(`/project/${prob.id}`)}
                className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1"
              >
                View 360° <ArrowUpRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setSelectedProblemForInterest(prob)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition-all hover:scale-105"
              >
                <HandCoins className="w-3.5 h-3.5" />
                <span>Express Partnership</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Express Interest Modal */}
      {selectedProblemForInterest && (
        <ExpressInterestModal
          isOpen={!!selectedProblemForInterest}
          onClose={() => setSelectedProblemForInterest(null)}
          problem={selectedProblemForInterest}
        />
      )}
    </div>
  );
};
