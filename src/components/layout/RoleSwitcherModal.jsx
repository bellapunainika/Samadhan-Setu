import React from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';
import { Users, GraduationCap, Building2, Shield, Check, Sparkles, ArrowRight } from 'lucide-react';

export const RoleSwitcherModal = ({ isOpen, onClose }) => {
  const { currentRole, setCurrentRole, navigate, showToast } = useApp();

  const roles = [
    {
      id: 'citizen',
      title: 'Citizen / Community Advocate',
      hindiTitle: 'नागरिक / ग्राम पंचायत प्रतिनिधि',
      desc: 'Submit ground challenges, track status, upvote local issues, and attach multimedia evidence.',
      badge: 'Grassroots Input',
      icon: Users,
      color: 'from-blue-600 to-cyan-600',
      borderColor: 'border-blue-500/40',
      textColor: 'text-blue-400',
      dashboardPath: '/dashboard/citizen'
    },
    {
      id: 'university',
      title: 'University Faculty & Student Team',
      hindiTitle: 'विश्वविद्यालय प्राध्यापक एवं शोध टीम',
      desc: 'Browse AI-routed problems, form R&D project teams, manage Kanban stages, and upload solution prototypes.',
      badge: 'R&D Solver',
      icon: GraduationCap,
      color: 'from-indigo-600 to-violet-600',
      borderColor: 'border-indigo-500/40',
      textColor: 'text-indigo-400',
      dashboardPath: '/dashboard/university'
    },
    {
      id: 'industry',
      title: 'Industry / CSR & Startup Partner',
      hindiTitle: 'औद्योगिक एवं CSR साझेदार',
      desc: 'Discover validated university prototypes, pledge CSR grants, co-develop pilots, and track commercial MoUs.',
      badge: 'Funding & Scale',
      icon: Building2,
      color: 'from-emerald-600 to-teal-600',
      borderColor: 'border-emerald-500/40',
      textColor: 'text-emerald-400',
      dashboardPath: '/dashboard/industry'
    },
    {
      id: 'admin',
      title: 'Government Nodal Officer / Admin',
      hindiTitle: 'राज्य नोडल प्रशासनिक अधिकारी',
      desc: 'Statewide macro analytics, district GIS urgency control, AI routing overrides, and policy report exports.',
      badge: 'State Oversight',
      icon: Shield,
      color: 'from-amber-600 to-orange-600',
      borderColor: 'border-amber-500/40',
      textColor: 'text-amber-400',
      dashboardPath: '/dashboard/admin'
    }
  ];

  const handleSelectRole = (role) => {
    setCurrentRole(role.id);
    showToast('Role Switched', `Active view changed to: ${role.title}`, 'info');
    navigate(role.dashboardPath);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Switch Demo Persona"
      subtitle="Select a stakeholder view to experience tailored dashboards, permissions, and collaborative workflows."
      maxWidth="max-w-3xl"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {roles.map(role => {
          const Icon = role.icon;
          const isSelected = currentRole === role.id;

          return (
            <div
              key={role.id}
              onClick={() => handleSelectRole(role)}
              className={`relative p-5 rounded-2xl border text-left cursor-pointer transition-all duration-300 group ${
                isSelected
                  ? `bg-slate-800/90 ${role.borderColor} ring-2 ring-indigo-500/50 shadow-xl`
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
              }`}
            >
              {isSelected && (
                <div className="absolute top-4 right-4 p-1 rounded-full bg-indigo-500 text-white shadow-md">
                  <Check className="w-3.5 h-3.5" />
                </div>
              )}

              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl bg-gradient-to-br ${role.color} text-white shadow-md group-hover:scale-105 transition-transform`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${role.borderColor} ${role.textColor} bg-slate-950/60`}>
                    {role.badge}
                  </span>
                  <h4 className="text-sm font-bold text-white mt-1 group-hover:text-indigo-300 transition-colors">
                    {role.title}
                  </h4>
                </div>
              </div>

              <p className="text-xs text-slate-400 mt-3 leading-relaxed">
                {role.desc}
              </p>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-slate-300 group-hover:text-white">
                <span>Switch to this persona</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>
    </Modal>
  );
};
