import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, Clock, ShieldCheck, Award, FileText, Download, Check } from 'lucide-react';

export const ProjectTimeline = ({ problem }) => {
  const { toggleMilestone, currentRole } = useApp();

  const lifecycleStages = [
    { name: '1. Problem Identified & Crowdsourced', desc: 'Verified ground coordinates & citizen endorsement', done: true },
    { name: '2. AI Clustering & University Routing', desc: 'Vector deduplication & faculty lab matching', done: true },
    { name: '3. R&D Team Formed & Milestone Scope', desc: 'Principal Investigator & Student researchers locked', done: problem.status !== 'Under Review' },
    { name: '4. Lab Bench-Scale Prototyping', desc: 'Material formulation & simulated stress testing', done: ['In Progress', 'Testing', 'Submitted for Review', 'Solved'].includes(problem.status) || problem.kanbanStage !== 'To Do' },
    { name: '5. Industry CSR Partner Onboarded', desc: 'Tripartite MoU signed & pilot funding committed', done: !!problem.industryPartner?.name && problem.industryPartner?.name !== 'Pending Industry Match' },
    { name: '6. Field Demonstration & Panchayat Trial', desc: 'Live operational trial under rural field conditions', done: ['Testing', 'Submitted for Review', 'Solved'].includes(problem.kanbanStage) || problem.status === 'Solved' },
    { name: '7. Patent / IP & Regulatory Filing', desc: 'Indian Patent Office filing & Pollution Board standards', done: problem.status === 'Solved' || problem.patentsFiled !== 'None' },
    { name: '8. Statewide Commercial Scale-up', desc: 'Full adoption across targeted Jharkhand districts', done: problem.status === 'Solved' }
  ];

  return (
    <div className="space-y-6 text-left">
      {/* 8-Stage Visual Timeline */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-400" />
            <span>Jharkhand Innovation Lifecycle Pipeline (8 Stages)</span>
          </h4>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
            {problem.trlLevel || 'TRL 6 Prototype'}
          </span>
        </div>

        <div className="space-y-3 pt-2">
          {lifecycleStages.map((stg, idx) => (
            <div key={idx} className="flex items-start gap-3">
              <div className="flex flex-col items-center">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  stg.done ? 'bg-emerald-500 text-white shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-slate-800 text-slate-500 border border-slate-700'
                }`}>
                  {stg.done ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                </div>
                {idx < lifecycleStages.length - 1 && (
                  <div className={`w-0.5 h-6 my-1 ${stg.done ? 'bg-emerald-500/50' : 'bg-slate-800'}`} />
                )}
              </div>
              <div className="flex-1 min-w-0 pt-0.5">
                <h5 className={`text-xs font-bold ${stg.done ? 'text-white' : 'text-slate-400'}`}>
                  {stg.name}
                </h5>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {stg.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Milestone Checkoff Repository */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Verifiable Project Milestones & Evidence Logs</span>
          </h4>
          <span className="text-[11px] text-slate-400">
            {['university', 'admin'].includes(currentRole) ? 'Click milestone to toggle verification' : 'Audited by State Nodal Cell'}
          </span>
        </div>

        <div className="space-y-2.5">
          {problem.milestones?.map((milestone, idx) => (
            <div
              key={idx}
              onClick={() => {
                if (['university', 'admin'].includes(currentRole)) {
                  toggleMilestone(problem.id, idx);
                }
              }}
              className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                ['university', 'admin'].includes(currentRole) ? 'cursor-pointer hover:border-indigo-400' : ''
              } ${
                milestone.completed
                  ? 'bg-emerald-950/20 border-emerald-500/40 text-slate-200'
                  : 'bg-slate-950/40 border-slate-800 text-slate-400'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-lg flex items-center justify-center border ${
                  milestone.completed ? 'bg-emerald-500 border-emerald-400 text-white' : 'border-slate-700 bg-slate-900'
                }`}>
                  {milestone.completed && <Check className="w-3.5 h-3.5" />}
                </div>
                <div>
                  <h5 className={`text-xs font-bold ${milestone.completed ? 'text-white' : 'text-slate-300'}`}>
                    {milestone.title}
                  </h5>
                  <span className="text-[10px] text-slate-500">{milestone.date}</span>
                </div>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                milestone.completed ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
              }`}>
                {milestone.completed ? 'Verified' : 'Pending'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
