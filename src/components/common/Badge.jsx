import React from 'react';
import { 
  Droplets, Wheat, HeartPulse, Leaf, Zap, Trees, GraduationCap, ShieldCheck, 
  AlertTriangle, CheckCircle2, Clock, Flame, Sparkles, XCircle
} from 'lucide-react';

export const CategoryBadge = ({ category, className = "" }) => {
  const iconMap = {
    Water: Droplets,
    Agriculture: Wheat,
    Health: HeartPulse,
    Environment: Leaf,
    Infrastructure: Zap,
    Livelihood: Trees,
    Education: GraduationCap,
    Governance: ShieldCheck
  };

  const colorMap = {
    Water: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
    Agriculture: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    Health: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    Environment: 'bg-lime-500/15 text-lime-400 border-lime-500/30',
    Infrastructure: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    Livelihood: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    Education: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    Governance: 'bg-pink-500/15 text-pink-400 border-pink-500/30'
  };

  const IconComponent = iconMap[category] || Sparkles;
  const colorClass = colorMap[category] || 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30';

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border backdrop-blur-sm ${colorClass} ${className}`}>
      <IconComponent className="w-3.5 h-3.5" />
      <span>{category}</span>
    </span>
  );
};

export const StatusBadge = ({ status, className = "" }) => {
  const config = {
    'SUBMITTED': { label: 'Submitted', color: 'bg-slate-500/20 text-slate-300 border-slate-500/30', icon: Clock },
    'Submitted': { label: 'Submitted', color: 'bg-slate-500/20 text-slate-300 border-slate-500/30', icon: Clock },

    'UNDER_REVIEW': { label: 'Under Review', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30', icon: Clock },
    'Under Review': { label: 'Under Review', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30', icon: Clock },

    'APPROVED': { label: 'Approved', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', icon: CheckCircle2 },
    'Approved': { label: 'Approved', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', icon: CheckCircle2 },

    'ASSIGNED': { label: 'Assigned', color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30', icon: Sparkles },
    'Assigned': { label: 'Assigned', color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30', icon: Sparkles },
    'Routed to University': { label: 'Assigned', color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30', icon: Sparkles },

    'REJECTED': { label: 'Rejected', color: 'bg-rose-500/20 text-rose-300 border-rose-500/30', icon: XCircle },
    'Rejected': { label: 'Rejected', color: 'bg-rose-500/20 text-rose-300 border-rose-500/30', icon: XCircle },

    'IN_PROGRESS': { label: 'In Progress', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30', icon: Flame },
    'In Progress': { label: 'In Progress', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30', icon: Flame },

    'SOLUTION_SUBMITTED': { label: 'Solution Submitted', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30', icon: Sparkles },
    'Solution Submitted': { label: 'Solution Submitted', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30', icon: Sparkles },

    'SOLUTION_APPROVED': { label: 'Solution Approved', color: 'bg-teal-500/20 text-teal-300 border-teal-500/30', icon: CheckCircle2 },
    'Solution Approved': { label: 'Solution Approved', color: 'bg-teal-500/20 text-teal-300 border-teal-500/30', icon: CheckCircle2 },

    'INDUSTRY_SUPPORT_REQUESTED': { label: 'Seeking Industry Support', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40', icon: Sparkles },

    'VALIDATED': { label: 'Validated', color: 'bg-teal-500/20 text-teal-300 border-teal-500/30', icon: CheckCircle2 },
    'Validated': { label: 'Validated', color: 'bg-teal-500/20 text-teal-300 border-teal-500/30', icon: CheckCircle2 },

    'COMPLETED': { label: 'Completed', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', icon: CheckCircle2 },
    'Completed': { label: 'Completed', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', icon: CheckCircle2 },
    'Solved': { label: 'Completed', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', icon: CheckCircle2 },
  };

  const current = config[status] || { label: status || 'Under Review', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30', icon: Clock };
  const Icon = current.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border backdrop-blur-sm ${current.color} ${className}`}>
      <Icon className="w-3.5 h-3.5" />
      <span>{current.label}</span>
    </span>
  );
};

export const UrgencyPill = ({ score, className = "" }) => {
  let label = "Low";
  let color = "bg-slate-700/60 text-slate-300 border-slate-600";
  let glow = "";

  if (score >= 90) {
    label = "Critical";
    color = "bg-rose-950/80 text-rose-300 border-rose-500/50";
    glow = "shadow-[0_0_12px_rgba(244,63,94,0.35)]";
  } else if (score >= 80) {
    label = "High";
    color = "bg-amber-950/80 text-amber-300 border-amber-500/50";
    glow = "shadow-[0_0_10px_rgba(245,158,11,0.25)]";
  } else if (score >= 65) {
    label = "Medium";
    color = "bg-blue-950/80 text-blue-300 border-blue-500/50";
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${color} ${glow} ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${score >= 90 ? 'bg-rose-400 animate-pulse' : score >= 80 ? 'bg-amber-400' : 'bg-blue-400'}`} />
      <span>{label} Urgency ({score}/100)</span>
    </span>
  );
};
