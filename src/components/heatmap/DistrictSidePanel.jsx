import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Building2, GraduationCap, Flame, ArrowUpRight, CheckCircle2, 
  Clock, MapPin, BarChart3, Users, ExternalLink, ShieldCheck, Droplets, Wheat, HeartPulse, Leaf
} from 'lucide-react';
import { UrgencyPill, CategoryBadge, StatusBadge } from '../common/Badge';

export const DistrictSidePanel = ({ district, onClose }) => {
  const { problems, navigate } = useApp();

  if (!district) return null;

  // Filter problems for this specific district
  const districtProblems = problems.filter(
    p => p.districtId === district.id || p.districtName?.toLowerCase().includes(district.id)
  );

  const total = districtProblems.length || district.activeProblems + district.solvedProblems;
  const solved = districtProblems.filter(p => p.status === 'Solved').length || district.solvedProblems;
  const inProgress = districtProblems.filter(p => p.status === 'In Progress').length || district.inProgress || 4;
  const resolutionRate = total > 0 ? Math.round((solved / total) * 100) : 60;

  return (
    <div className="flex flex-col h-full space-y-5 text-left">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            {district.division} Division
          </span>
          <UrgencyPill score={district.dynamicUrgency || district.baseUrgency} />
        </div>

        <h3 className="text-2xl font-black text-white mt-2 tracking-tight">
          {district.name}
        </h3>
        <p className="text-xs text-slate-400">
          {district.hindiName} • HQ: {district.hq}
        </p>

        {district.hotspot && (
          <div className="mt-3 p-3 rounded-xl bg-rose-950/50 border border-rose-500/40 text-xs text-rose-200 flex items-start gap-2">
            <Flame className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span className="leading-relaxed font-medium">
              <strong className="text-white">State Hotspot Alert:</strong> {district.hotspotReason || 'High concentration of unresolved environmental and water challenges.'}
            </span>
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-2">
        <div className="p-3 rounded-xl bg-slate-800/70 border border-slate-700/60 text-center">
          <span className="text-[10px] text-slate-400 font-semibold uppercase block">Total</span>
          <span className="text-lg font-bold text-white mt-0.5 block">{total}</span>
        </div>
        <div className="p-3 rounded-xl bg-slate-800/70 border border-slate-700/60 text-center">
          <span className="text-[10px] text-slate-400 font-semibold uppercase block">Active</span>
          <span className="text-lg font-bold text-rose-400 mt-0.5 block">{total - solved}</span>
        </div>
        <div className="p-3 rounded-xl bg-slate-800/70 border border-slate-700/60 text-center">
          <span className="text-[10px] text-slate-400 font-semibold uppercase block">Resolution</span>
          <span className="text-lg font-bold text-emerald-400 mt-0.5 block">{resolutionRate}%</span>
        </div>
      </div>

      {/* Category Breakdown (Mini Horizontal Bars) */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
          <BarChart3 className="w-3.5 h-3.5 text-indigo-400" />
          <span>Category Distribution</span>
        </h4>
        <div className="space-y-1.5 bg-slate-950/50 p-3 rounded-xl border border-slate-800">
          {Object.entries(district.categories || { Water: 4, Agriculture: 3, Health: 3, Environment: 2 }).map(([cat, count]) => {
            const pct = Math.round((count / (total || 10)) * 100);
            return (
              <div key={cat} className="space-y-0.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-300 font-medium">{cat}</span>
                  <span className="text-slate-400 font-bold">{count} ({pct}%)</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full"
                    style={{ width: `${Math.min(100, Math.max(15, pct))}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Academic & Industry Ecosystem */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
          <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
          <span>Assigned Academic & Industry Hubs</span>
        </h4>
        <div className="flex flex-wrap gap-1.5">
          {(district.activeUniversities || ["Birsa Agricultural University", "BIT Mesra"]).map((univ, idx) => (
            <span key={idx} className="px-2.5 py-1 rounded-lg bg-indigo-950/60 border border-indigo-500/30 text-[11px] font-semibold text-indigo-300">
              {univ}
            </span>
          ))}
          {(district.activeIndustries || ["Tata Steel CSR", "Coal India Foundation"]).map((ind, idx) => (
            <span key={idx} className="px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-500/30 text-[11px] font-semibold text-emerald-300">
              {ind}
            </span>
          ))}
        </div>
      </div>

      {/* District Challenges Feed (Top 2) */}
      <div className="space-y-2 flex-1">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-300">
            District Challenges ({districtProblems.length})
          </h4>
          <span className="text-[10px] text-indigo-400 font-semibold">Click to inspect</span>
        </div>

        <div className="space-y-2">
          {districtProblems.slice(0, 2).map(prob => (
            <div
              key={prob.id}
              onClick={() => navigate(`/project/${prob.id}`)}
              className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/70 hover:border-indigo-400/50 hover:bg-slate-800 cursor-pointer transition-all group"
            >
              <div className="flex items-center justify-between gap-1">
                <span className="text-[10px] font-mono text-slate-400">{prob.id}</span>
                <StatusBadge status={prob.status} />
              </div>
              <h5 className="text-xs font-bold text-white mt-1 line-clamp-1 group-hover:text-indigo-300 transition-colors">
                {prob.title}
              </h5>
              <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                {prob.description}
              </p>
              <div className="mt-2 pt-2 border-t border-slate-700/50 flex items-center justify-between text-[10px] text-slate-400">
                <span>{prob.upvotes} Citizens Endorsed</span>
                <span className="text-indigo-300 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform font-bold">
                  View 360° Project <ArrowUpRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
