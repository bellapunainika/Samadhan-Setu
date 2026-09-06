import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  GraduationCap, Sparkles, Plus, CheckCircle2, Flame, 
  ArrowRight, Users, Award, BookOpen, Layers, Clock
} from 'lucide-react';
import { KanbanBoard } from '../components/university/KanbanBoard';
import { TeamFormationModal } from '../components/university/TeamFormationModal';
import { SolutionProposalModal } from '../components/university/SolutionProposalModal';
import { UrgencyPill, CategoryBadge, StatusBadge } from '../components/common/Badge';

export const UniversityDashboardPage = () => {
  const { problems, navigate } = useApp();

  const [selectedProblemForTeam, setSelectedProblemForTeam] = useState(null);
  const [selectedProblemForProposal, setSelectedProblemForProposal] = useState(null);
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' | 'inbox'

  // Problems routed to universities
  const routedProblems = problems.filter(p => p.status === 'Routed to University' || p.status === 'In Progress');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left">
      {/* University Portal Header */}
      <div className="relative rounded-3xl bg-gradient-to-r from-indigo-950/70 via-slate-900 to-purple-950/70 border border-indigo-500/40 p-6 sm:p-8 backdrop-blur-xl shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>University R&D & Co-Innovation Workspace</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Academic Problem Solving & Prototyping Hub
            </h1>
            <p className="text-xs text-slate-300 leading-relaxed">
              Accept AI-routed societal challenges matched to your department. Form multidisciplinary faculty & student research teams, manage milestones, and submit field-tested prototypes for industry scaling.
            </p>
          </div>

          {/* Quick stats badge */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700 text-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Active Projects</span>
              <span className="text-xl font-extrabold text-white mt-0.5 block">{routedProblems.length}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700 text-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Patents Filed</span>
              <span className="text-xl font-extrabold text-emerald-400 mt-0.5 block">19</span>
            </div>
          </div>
        </div>
      </div>

      {/* View Switcher Bar */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('kanban')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              viewMode === 'kanban'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Interactive Kanban Board</span>
          </button>
          <button
            onClick={() => setViewMode('inbox')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              viewMode === 'inbox'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Routed Challenges Inbox ({routedProblems.length})</span>
          </button>
        </div>

        <span className="text-xs text-slate-400 font-medium hidden sm:inline">
          Jharkhand Academic Consortium: BIT Mesra • IIT ISM • NIT Jamshedpur • BAU
        </span>
      </div>

      {/* View Mode 1: Kanban Board */}
      {viewMode === 'kanban' ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Drag or click advance to transition projects through R&D stages</span>
            <span className="text-indigo-400 font-semibold">5 Active Stages</span>
          </div>
          <KanbanBoard />
        </div>
      ) : (
        /* View Mode 2: Routed Inbox */
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {routedProblems.map(problem => (
              <div
                key={problem.id}
                className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/50 transition-all space-y-3"
              >
                <div className="flex items-center justify-between">
                  <CategoryBadge category={problem.category} />
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                    {problem.assignedUniversity?.matchScore || 95}% Domain Match
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white leading-snug">
                  {problem.title}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-2">
                  {problem.description}
                </p>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-xs space-y-1">
                  <div className="text-indigo-300 font-bold">
                    🏛️ {problem.assignedUniversity?.name}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {problem.assignedUniversity?.department}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={() => navigate(`/project/${problem.id}`)}
                    className="text-xs font-semibold text-slate-400 hover:text-white"
                  >
                    View Details
                  </button>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedProblemForTeam(problem)}
                      className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-sm"
                    >
                      Assign Team
                    </button>
                    <button
                      onClick={() => setSelectedProblemForProposal(problem)}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm"
                    >
                      Submit Proposal
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Team Formation Modal */}
      {selectedProblemForTeam && (
        <TeamFormationModal
          isOpen={!!selectedProblemForTeam}
          onClose={() => setSelectedProblemForTeam(null)}
          problem={selectedProblemForTeam}
        />
      )}

      {/* Solution Proposal Modal */}
      {selectedProblemForProposal && (
        <SolutionProposalModal
          isOpen={!!selectedProblemForProposal}
          onClose={() => setSelectedProblemForProposal(null)}
          problem={selectedProblemForProposal}
        />
      )}
    </div>
  );
};
