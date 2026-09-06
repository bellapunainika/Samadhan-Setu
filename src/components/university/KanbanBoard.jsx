import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Plus, MoreHorizontal, ArrowRight, ArrowLeft, ArrowUpRight, 
  CheckCircle2, Clock, Flame, Sparkles, Building2, User
} from 'lucide-react';
import { CategoryBadge, UrgencyPill } from '../common/Badge';

export const KanbanBoard = () => {
  const { problems, updateKanbanStage, navigate } = useApp();

  const columns = [
    { id: 'To Do', label: '1. Routed / Queued', color: 'border-slate-700 bg-slate-900/40 text-slate-300' },
    { id: 'In Research', label: '2. In Research & Feasibility', color: 'border-indigo-500/30 bg-indigo-950/20 text-indigo-300' },
    { id: 'Prototyping', label: '3. Lab Prototyping', color: 'border-blue-500/30 bg-blue-950/20 text-blue-300' },
    { id: 'Testing', label: '4. Ground Field Testing', color: 'border-amber-500/30 bg-amber-950/20 text-amber-300' },
    { id: 'Submitted for Review', label: '5. Solved / Govt Review', color: 'border-emerald-500/30 bg-emerald-950/20 text-emerald-300' }
  ];

  return (
    <div className="w-full overflow-x-auto pb-4 custom-scrollbar">
      <div className="flex items-start gap-4 min-w-[1250px] text-left">
        {columns.map(col => {
          const columnProblems = problems.filter(p => (p.kanbanStage || 'To Do') === col.id);

          return (
            <div
              key={col.id}
              className={`flex-1 rounded-2xl border ${col.color} p-4 flex flex-col min-h-[500px] backdrop-blur-xl shadow-lg`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider">{col.label}</h4>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-800 text-white">
                    {columnProblems.length}
                  </span>
                </div>
              </div>

              {/* Problem Cards in this Stage */}
              <div className="space-y-3 flex-1">
                {columnProblems.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400 border border-dashed border-slate-800 rounded-xl">
                    No active challenges in this stage.
                  </div>
                ) : (
                  columnProblems.map(problem => (
                    <div
                      key={problem.id}
                      className="p-4 rounded-xl bg-slate-850/90 border border-slate-700/80 hover:border-indigo-500/60 shadow-md hover:shadow-lg transition-all space-y-3 group"
                    >
                      {/* Card Header */}
                      <div className="flex items-center justify-between gap-1">
                        <CategoryBadge category={problem.category} />
                        <UrgencyPill score={problem.urgencyScore} />
                      </div>

                      {/* Title */}
                      <h5
                        onClick={() => navigate(`/project/${problem.id}`)}
                        className="text-xs font-bold text-white group-hover:text-indigo-300 cursor-pointer transition-colors leading-snug line-clamp-2"
                      >
                        {problem.title}
                      </h5>

                      {/* District and University */}
                      <div className="text-[11px] text-slate-400 space-y-1">
                        <div className="flex items-center justify-between">
                          <span>{problem.districtName}</span>
                          <span className="font-mono text-[10px] text-slate-400">{problem.id}</span>
                        </div>
                        {problem.assignedUniversity && (
                          <div className="text-indigo-300 font-medium truncate">
                            🏛️ {problem.assignedUniversity.name}
                          </div>
                        )}
                      </div>

                      {/* TRL & Patent Status */}
                      {problem.trlLevel && (
                        <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-[10px] font-mono text-emerald-300">
                          {problem.trlLevel}
                        </div>
                      )}

                      {/* Quick Stage Progression Buttons */}
                      <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-1">
                        {/* Move Back */}
                        {col.id !== 'To Do' && (
                          <button
                            onClick={() => {
                              const currIdx = columns.findIndex(c => c.id === col.id);
                              if (currIdx > 0) updateKanbanStage(problem.id, columns[currIdx - 1].id);
                            }}
                            className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] flex items-center gap-0.5"
                            title="Move back"
                          >
                            <ArrowLeft className="w-3 h-3" />
                          </button>
                        )}

                        <button
                          onClick={() => navigate(`/project/${problem.id}`)}
                          className="text-[11px] font-bold text-indigo-300 hover:text-white flex items-center gap-1 transition-colors"
                        >
                          Details <ArrowUpRight className="w-3 h-3" />
                        </button>

                        {/* Move Next */}
                        {col.id !== 'Submitted for Review' && (
                          <button
                            onClick={() => {
                              const currIdx = columns.findIndex(c => c.id === col.id);
                              if (currIdx < columns.length - 1) updateKanbanStage(problem.id, columns[currIdx + 1].id);
                            }}
                            className="px-2 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold flex items-center gap-1 shadow-sm"
                            title="Promote stage"
                          >
                            <span>Advance</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
