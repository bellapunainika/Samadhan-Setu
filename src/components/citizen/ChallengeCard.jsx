import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Heart, MapPin, Building2, GraduationCap, ArrowUpRight, 
  MessageSquare, Flame, CheckCircle2, Clock, Sparkles, GitMerge
} from 'lucide-react';
import { CategoryBadge, StatusBadge, UrgencyPill } from '../common/Badge';
import { motion } from 'framer-motion';

export const ChallengeCard = ({ problem }) => {
  const { toggleUpvote, navigate } = useApp();

  const stages = [
    'Submitted',
    'Under Review',
    'Routed to University',
    'In Progress',
    'Solved'
  ];

  const currentStageIdx = stages.indexOf(problem.status) !== -1 ? stages.indexOf(problem.status) : 2;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="rounded-3xl bg-[#0F172A]/85 border border-slate-700/60 hover:border-indigo-500/40 backdrop-blur-xl p-5 sm:p-6 shadow-xl hover:shadow-[0_0_30px_rgba(99,102,241,0.12)] transition-all duration-300 flex flex-col justify-between group text-left"
    >
      {/* Top Header */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CategoryBadge category={problem.category} />
            <span className="text-[10px] font-mono text-slate-400">{problem.id}</span>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={problem.status} />
            <UrgencyPill score={problem.urgencyScore} />
          </div>
        </div>

        {/* Title */}
        <h3
          onClick={() => navigate(`/project/${problem.id}`)}
          className="text-base sm:text-lg font-bold text-white mt-3.5 group-hover:text-indigo-300 cursor-pointer transition-colors leading-snug line-clamp-2"
        >
          {problem.title}
        </h3>

        {/* Location & Submitter */}
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
          <span className="flex items-center gap-1 text-slate-300 font-medium">
            <MapPin className="w-3.5 h-3.5 text-indigo-400" />
            {problem.location || problem.districtName} ({problem.districtName})
          </span>
          <span>•</span>
          <span className="text-[11px] text-slate-500">By {problem.submitterName || problem.submitterType}</span>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-300 mt-2.5 line-clamp-3 leading-relaxed">
          {problem.description}
        </p>

        {/* Deduplication cluster note if exists */}
        {problem.duplicateCount > 0 && (
          <div className="mt-3 p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-indigo-300 flex items-center gap-1.5">
            <GitMerge className="w-3.5 h-3.5 text-indigo-400" />
            <span>Clustered with {problem.duplicateCount} similar regional reports</span>
          </div>
        )}

        {/* Assigned Partners / Labs */}
        <div className="mt-4 pt-3.5 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {problem.assignedUniversity && (
            <div className="p-2.5 rounded-xl bg-indigo-950/30 border border-indigo-500/20">
              <span className="text-[10px] text-indigo-300 font-semibold uppercase tracking-wider block">
                Academic Solver
              </span>
              <span className="font-bold text-white text-xs truncate block mt-0.5">
                {problem.assignedUniversity.name}
              </span>
            </div>
          )}

          {problem.industryPartner && (
            <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-500/20">
              <span className="text-[10px] text-emerald-300 font-semibold uppercase tracking-wider block">
                Industry Partner
              </span>
              <span className="font-bold text-white text-xs truncate block mt-0.5">
                {problem.industryPartner.name}
              </span>
            </div>
          )}
        </div>

        {/* Horizontal Mini Stepper */}
        <div className="mt-4 pt-3 border-t border-slate-800/60">
          <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 mb-1.5">
            <span>Lifecycle Pipeline</span>
            <span className="text-indigo-300 font-semibold">{problem.status}</span>
          </div>
          <div className="grid grid-cols-5 gap-1">
            {stages.map((stg, idx) => {
              const isPassed = idx <= currentStageIdx;
              const isCurrent = idx === currentStageIdx;
              return (
                <div key={stg} className="space-y-1">
                  <div
                    className={`h-1.5 rounded-full transition-all ${
                      isCurrent
                        ? 'bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.7)]'
                        : isPassed
                        ? 'bg-indigo-500'
                        : 'bg-slate-800'
                    }`}
                  />
                  <span className="block text-[8px] text-slate-400 truncate text-center">
                    {stg.split(' ')[0]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Card Footer Actions */}
      <div className="mt-5 pt-3.5 border-t border-slate-800 flex items-center justify-between">
        {/* Upvote Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleUpvote(problem.id);
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
            problem.hasUpvoted
              ? 'bg-rose-500/20 border-rose-500 text-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.3)]'
              : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:border-rose-500/50'
          }`}
        >
          <Heart className={`w-3.5 h-3.5 ${problem.hasUpvoted ? 'fill-rose-400 text-rose-400' : ''}`} />
          <span>{problem.upvotes}</span>
          <span className="hidden sm:inline font-normal text-[10px]">Endorse</span>
        </button>

        {/* Discussion / Comments Pill */}
        <span className="text-xs text-slate-400 flex items-center gap-1">
          <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
          <span>{problem.comments?.length || 0}</span>
        </span>

        {/* 360 Details Link */}
        <button
          onClick={() => navigate(`/project/${problem.id}`)}
          className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-indigo-600 border border-slate-700 hover:border-indigo-500 text-white text-xs font-bold flex items-center gap-1 transition-all group/btn"
        >
          <span>View Project</span>
          <ArrowUpRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
        </button>
      </div>
    </motion.div>
  );
};
