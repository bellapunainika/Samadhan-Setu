import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AnalyticsDashboard } from '../components/analytics/AnalyticsDashboard';
import { Shield, Sparkles, AlertTriangle, CheckCircle2, ArrowRight, RefreshCw, FileText } from 'lucide-react';
import { StatusBadge, UrgencyPill, CategoryBadge } from '../components/common/Badge';

export const AdminAnalyticsPage = () => {
  const { problems, updateKanbanStage, showToast, navigate } = useApp();

  const [overrideModalProblem, setOverrideModalProblem] = useState(null);
  const [selectedTab, setSelectedTab] = useState('analytics'); // 'analytics' | 'pipeline'

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left">
      {/* Govt Admin Header */}
      <div className="relative rounded-3xl bg-gradient-to-r from-amber-950/70 via-slate-900 to-orange-950/70 border border-amber-500/40 p-6 sm:p-8 backdrop-blur-xl shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold">
              <Shield className="w-3.5 h-3.5" />
              <span>Government of Jharkhand • State Nodal Administration</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              State Societal Innovation Command Center
            </h1>
            <p className="text-xs text-slate-300 leading-relaxed">
              Real-time executive oversight across 24 district innovation cells, AI routing governance, milestone sign-offs, and inter-departmental CSR fund allocation.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedTab('analytics')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedTab === 'analytics'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                  : 'bg-slate-800 text-slate-300 border border-slate-700'
              }`}
            >
              Macro Analytics
            </button>
            <button
              onClick={() => setSelectedTab('pipeline')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedTab === 'pipeline'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                  : 'bg-slate-800 text-slate-300 border border-slate-700'
              }`}
            >
              AI Pipeline Control
            </button>
          </div>
        </div>
      </div>

      {/* Tab 1: Analytics Dashboard */}
      {selectedTab === 'analytics' ? (
        <AnalyticsDashboard />
      ) : (
        /* Tab 2: Admin Pipeline Management */
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-white">
                All 248 Jharkhand Challenges (State Administrative Table)
              </h3>
              <p className="text-xs text-slate-400">
                Audit AI categorization, re-assign universities, or override priority weights.
              </p>
            </div>
          </div>

          <div className="rounded-3xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="p-4">ID & Title</th>
                    <th className="p-4">District</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Urgency</th>
                    <th className="p-4">Assigned University</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {problems.map(prob => (
                    <tr key={prob.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-white max-w-xs truncate">{prob.title}</div>
                        <div className="font-mono text-[10px] text-slate-400">{prob.id}</div>
                      </td>
                      <td className="p-4 font-semibold text-slate-200">{prob.districtName}</td>
                      <td className="p-4"><CategoryBadge category={prob.category} /></td>
                      <td className="p-4"><UrgencyPill score={prob.urgencyScore} /></td>
                      <td className="p-4 text-indigo-300 font-semibold">{prob.assignedUniversity?.name || 'Pending'}</td>
                      <td className="p-4"><StatusBadge status={prob.status} /></td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => navigate(`/project/${prob.id}`)}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-indigo-600 text-white text-xs font-bold transition-colors"
                        >
                          Audit 360°
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
