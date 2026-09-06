import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, Legend
} from 'recharts';
import { 
  Download, FileText, CheckCircle2, TrendingUp, Filter, 
  Sparkles, Award, Building2, GraduationCap, Shield, Flame
} from 'lucide-react';
import { StatCounter } from '../common/StatCounter';
import { Modal } from '../common/Modal';

export const AnalyticsDashboard = () => {
  const { problems, districts, stats, showToast } = useApp();
  const [isExportOpen, setIsExportOpen] = useState(false);

  // Time trend data
  const trendData = [
    { month: 'Apr 2026', submissions: 32, solved: 8, funding: 1.2 },
    { month: 'May 2026', submissions: 54, solved: 18, funding: 2.8 },
    { month: 'Jun 2026', submissions: 82, solved: 34, funding: 5.6 },
    { month: 'Jul 2026', submissions: 130, solved: 55, funding: 10.4 },
    { month: 'Aug 2026', submissions: 198, solved: 72, funding: 15.2 },
    { month: 'Sep 2026', submissions: 248, solved: 84, funding: 18.4 }
  ];

  // Category counts
  const categoryData = [
    { name: 'Water & Sanitation', value: 68, color: '#06B6D4' },
    { name: 'Agriculture & Agro-tech', value: 58, color: '#10B981' },
    { name: 'Healthcare & Telehealth', value: 42, color: '#F43F5E' },
    { name: 'Mining & Environment', value: 36, color: '#84CC16' },
    { name: 'Rural Infrastructure', value: 24, color: '#F59E0B' },
    { name: 'Tribal Livelihood', value: 20, color: '#8B5CF6' }
  ];

  // Top districts by problem volume & solved
  const topDistrictsData = districts.slice(0, 8).map(d => ({
    name: d.name.split(' ')[0],
    active: d.activeProblems || 6,
    solved: d.solvedProblems || 8,
    urgency: d.baseUrgency
  }));

  // Funnel Data
  const funnelData = [
    { stage: 'Crowdsourced Submissions', count: 248, fill: '#6366F1' },
    { stage: 'AI Validated & Deduplicated', count: 215, fill: '#8B5CF6' },
    { stage: 'Assigned to University Labs', count: 164, fill: '#3B82F6' },
    { stage: 'Lab Prototyping & Testing', count: 112, fill: '#06B6D4' },
    { stage: 'Industry MoUs & Deployed', count: 84, fill: '#10B981' }
  ];

  const handleExportPDF = () => {
    setIsExportOpen(false);
    showToast('Report Generated', 'Government Executive Briefing (Q3-2026.pdf) downloaded', 'success');
  };

  const handleExportCSV = () => {
    setIsExportOpen(false);
    showToast('Dataset Exported', '248 Problems with GIS Telemetry exported as CSV', 'success');
  };

  return (
    <div className="space-y-8 text-left">
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <span>Statewide Innovation & Impact Analytics</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Q3 EXECUTIVE BRIEF
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time telemetry measuring grassroots crowdsourcing, academic solving throughput, and CSR capital deployment across 24 Jharkhand districts.
          </p>
        </div>

        <button
          onClick={() => setIsExportOpen(true)}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-md"
        >
          <Download className="w-4 h-4 text-indigo-400" />
          <span>Export State Briefing</span>
        </button>
      </div>

      {/* KPI Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCounter
          endValue={248}
          label="Total Crowdsourced Issues"
          icon={Flame}
          color="rose"
        />
        <StatCounter
          endValue={84}
          label="Field Solved & Deployed"
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCounter
          endValue={19}
          label="Patents / IPs Filed"
          icon={Award}
          color="amber"
        />
        <StatCounter
          endValue="₹18.4 Cr"
          label="CSR & R&D Capital Mobilized"
          icon={Building2}
          color="indigo"
        />
      </div>

      {/* Charts Grid Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Trend Area Chart (8 cols) */}
        <div className="lg:col-span-8 p-6 rounded-3xl bg-[#0F172A]/85 border border-slate-700/60 backdrop-blur-xl shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                Challenge Submissions vs. Field Resolutions (2026)
              </h3>
              <p className="text-xs text-slate-400">Monthly progression of citizen engagement and academic problem solving</p>
            </div>
            <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30">
              +142% MoM Velocity
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorSub" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorSol" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="submissions" name="Submissions" stroke="#6366F1" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSub)" />
                <Area type="monotone" dataKey="solved" name="Solved Prototypes" stroke="#10B981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSol)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Donut (4 cols) */}
        <div className="lg:col-span-4 p-6 rounded-3xl bg-[#0F172A]/85 border border-slate-700/60 backdrop-blur-xl shadow-xl space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">
              Submissions by Category
            </h3>
            <p className="text-xs text-slate-400">Thematic distribution of Jharkhand societal needs</p>
          </div>

          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            {categoryData.slice(0, 4).map(cat => (
              <div key={cat.name} className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                <span className="truncate">{cat.name.split(' ')[0]}</span>
                <span className="text-slate-400 font-bold ml-auto">{cat.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Grid Row 2: District Leaderboard & Conversion Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* District Bar Chart (7 cols) */}
        <div className="lg:col-span-7 p-6 rounded-3xl bg-[#0F172A]/85 border border-slate-700/60 backdrop-blur-xl shadow-xl space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">
              District Innovation Throughput (Top 8 Districts)
            </h3>
            <p className="text-xs text-slate-400">Comparing active pipeline vs. verified deployed prototypes</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topDistrictsData}>
                <XAxis dataKey="name" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
                <Bar dataKey="active" name="Active Issues" fill="#F43F5E" radius={[4, 4, 0, 0]} />
                <Bar dataKey="solved" name="Solved Prototypes" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Funnel Pipeline (5 cols) */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-[#0F172A]/85 border border-slate-700/60 backdrop-blur-xl shadow-xl space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">
              State Innovation Conversion Funnel
            </h3>
            <p className="text-xs text-slate-400">From citizen crowdsourcing to commercial deployment</p>
          </div>

          <div className="space-y-3 pt-2">
            {funnelData.map((stage, idx) => {
              const maxCount = funnelData[0].count;
              const pct = Math.round((stage.count / maxCount) * 100);

              return (
                <div key={stage.stage} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-semibold">{stage.stage}</span>
                    <span className="font-bold text-white">{stage.count} ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: stage.fill
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Export Report Modal */}
      <Modal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        title="Export Government Innovation Dossier"
        subtitle="Generate formatted policy briefings and raw GIS telemetry data for district collectors and department heads."
        maxWidth="max-w-md"
      >
        <div className="space-y-4 text-left">
          <div
            onClick={handleExportPDF}
            className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500 cursor-pointer transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white group-hover:text-indigo-300">Executive PDF Briefing</h4>
                <p className="text-[11px] text-slate-400">Print-ready 8-page cabinet summary with charts & MoUs</p>
              </div>
            </div>
            <Download className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
          </div>

          <div
            onClick={handleExportCSV}
            className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500 cursor-pointer transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white group-hover:text-emerald-300">Raw GIS Dataset (CSV)</h4>
                <p className="text-[11px] text-slate-400">All 248 challenges with geo-coordinates, severities & solver tags</p>
              </div>
            </div>
            <Download className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
          </div>
        </div>
      </Modal>
    </div>
  );
};
