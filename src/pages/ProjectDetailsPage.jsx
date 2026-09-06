import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ArrowLeft, Heart, MapPin, Building2, GraduationCap, 
  Sparkles, FileText, CheckCircle2, Award, Clock, ShieldCheck, 
  Users, GitMerge, Share2, Download, HandCoins
} from 'lucide-react';
import { CategoryBadge, StatusBadge, UrgencyPill } from '../components/common/Badge';
import { ProjectTimeline } from '../components/lifecycle/ProjectTimeline';
import { DiscussionThread } from '../components/lifecycle/DiscussionThread';
import { TeamFormationModal } from '../components/university/TeamFormationModal';
import { ExpressInterestModal } from '../components/industry/ExpressInterestModal';

export const ProjectDetailsPage = ({ problemId }) => {
  const { problems, toggleUpvote, navigate, navigateBack, currentRole, showToast } = useApp();

  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [isInterestModalOpen, setIsInterestModalOpen] = useState(false);

  // Extract ID from prop or URL
  const activeId = problemId || window.location.hash.split('/project/')[1] || 'JH-2026-003';
  const problem = problems.find(p => p.id === activeId) || problems[0];

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('Link Copied', 'Project link copied to clipboard for sharing!', 'info');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left">
      {/* Back Button & Top Action Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigateBack()}
          className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Feed / Map</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Share Project"
          >
            <Share2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => toggleUpvote(problem.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
              problem.hasUpvoted
                ? 'bg-rose-500/20 border-rose-500 text-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.3)]'
                : 'bg-slate-850 border-slate-700 text-slate-300 hover:text-white hover:border-rose-500/50'
            }`}
          >
            <Heart className={`w-4 h-4 ${problem.hasUpvoted ? 'fill-rose-400 text-rose-400' : ''}`} />
            <span>{problem.upvotes} Citizens Endorsed</span>
          </button>
        </div>
      </div>

      {/* Main Project Header Card */}
      <div className="rounded-3xl bg-[#0F172A]/90 border border-slate-700/80 backdrop-blur-xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CategoryBadge category={problem.category} />
            <span className="font-mono text-xs text-slate-400 font-bold">{problem.id}</span>
          </div>
          <div className="flex items-center gap-2.5">
            <StatusBadge status={problem.status} />
            <UrgencyPill score={problem.urgencyScore} />
          </div>
        </div>

        <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
          {problem.title}
        </h1>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-300">
          <span className="flex items-center gap-1.5 font-semibold text-white">
            <MapPin className="w-4 h-4 text-indigo-400" />
            {problem.location || problem.districtName} ({problem.districtName} District)
          </span>
          <span>•</span>
          <span>Submitted by: <strong>{problem.submitterName || problem.submitterType}</strong></span>
          <span>•</span>
          <span>Date: {problem.submittedAt}</span>
        </div>

        <p className="text-sm text-slate-300 leading-relaxed max-w-4xl">
          {problem.description}
        </p>

        {/* Vector Deduplication Cluster Banner */}
        {problem.clusterId && (
          <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <GitMerge className="w-5 h-5 text-indigo-400 shrink-0" />
              <div>
                <span className="font-bold text-white">AI Cluster: {problem.clusterId}</span>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  Consolidated <strong>{problem.duplicateCount || 3} related grassroots submissions</strong> across {problem.districtName} to form a unified funded project.
                </p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-[10px] font-extrabold whitespace-nowrap">
              Deduplication Active
            </span>
          </div>
        )}
      </div>

      {/* 2-Column Layout: Left = Partners & Timeline, Right = Solution Specs & Comments */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Assigned Academic Lab Card */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-indigo-500/30 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-400">
                <GraduationCap className="w-4 h-4" />
                <span>Assigned Academic R&D Solver</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-indigo-500 text-white">
                {problem.assignedUniversity?.matchScore || 96}% AI Match
              </span>
            </div>

            <div>
              <h3 className="text-lg font-bold text-white">
                {problem.assignedUniversity?.name || 'Academic Council'}
              </h3>
              <p className="text-xs text-indigo-300 mt-0.5">
                {problem.assignedUniversity?.department}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2 border-t border-slate-800">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Principal Investigator</span>
                <span className="font-semibold text-slate-200 mt-0.5 block">{problem.assignedUniversity?.facultyLead || 'Faculty Mentor'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Research Fellows</span>
                <span className="font-semibold text-slate-200 mt-0.5 block">
                  {(problem.assignedUniversity?.studentTeam || ['Research Lead', 'Student Scholar']).join(', ')}
                </span>
              </div>
            </div>

            {currentRole === 'university' && (
              <button
                onClick={() => setIsTeamModalOpen(true)}
                className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md transition-colors"
              >
                Modify R&D Team Allocation
              </button>
            )}
          </div>

          {/* Industry Partner & CSR Card */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-emerald-500/30 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
                <Building2 className="w-4 h-4" />
                <span>Industry / CSR Partner & Scale-Up</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                {problem.industryPartner?.pledgedAmount || 'Grant Seeking'}
              </span>
            </div>

            <div>
              <h3 className="text-lg font-bold text-white">
                {problem.industryPartner?.name || 'Open for Corporate CSR Co-Sponsorship'}
              </h3>
              <p className="text-xs text-emerald-300 mt-0.5">
                Mode: {problem.industryPartner?.tier || 'CSR Innovation Grant & Field Testing'}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>Contact: {problem.industryPartner?.contactPerson || 'Govt Innovation Cell'}</span>
              <button
                onClick={() => setIsInterestModalOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm transition-colors flex items-center gap-1"
              >
                <HandCoins className="w-3.5 h-3.5" />
                <span>Pledge CSR Grant</span>
              </button>
            </div>
          </div>

          {/* 8-Stage Lifecycle Timeline */}
          <ProjectTimeline problem={problem} />
        </div>

        {/* Right Column (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Solution Whitepaper Summary Card */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-400" />
                <span>Engineered Solution Specifications</span>
              </h4>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300">
                {problem.trlLevel || 'TRL 6'}
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {problem.solutionSummary || 'University research team is running chemical formulation and rapid 3D prototyping.'}
            </p>

            {problem.patentsFiled && problem.patentsFiled !== 'None' && (
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-400" />
                  <div>
                    <span className="font-bold text-white">Patent Application</span>
                    <p className="font-mono text-[10px] text-slate-400">{problem.patentsFiled}</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                  Protected IP
                </span>
              </div>
            )}
          </div>

          {/* Multi-Stakeholder Threaded Discussion */}
          <DiscussionThread problem={problem} />
        </div>
      </div>

      {/* Team Formation Modal */}
      {isTeamModalOpen && (
        <TeamFormationModal
          isOpen={isTeamModalOpen}
          onClose={() => setIsTeamModalOpen(false)}
          problem={problem}
        />
      )}

      {/* Express Interest Modal */}
      {isInterestModalOpen && (
        <ExpressInterestModal
          isOpen={isInterestModalOpen}
          onClose={() => setIsInterestModalOpen(false)}
          problem={problem}
        />
      )}
    </div>
  );
};
