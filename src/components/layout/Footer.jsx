import React from 'react';
import { useApp } from '../../context/AppContext';
import { Sparkles, Shield, MapPin, ExternalLink, Heart } from 'lucide-react';

export const Footer = () => {
  const { navigate, t } = useApp();

  return (
    <footer className="border-t border-slate-800/80 bg-slate-950 text-slate-400 text-xs mt-20">
      {/* Endorsement Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border-b border-slate-800/60 py-6 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-left">
            <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-emerald-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">
                Samadhan Setu — Societal Innovation Collaboration Portal
              </h4>
              <p className="text-xs text-slate-400">
                A digital platform for the Government of Jharkhand.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1.5 rounded-full bg-slate-800/90 border border-slate-700 text-slate-300 font-mono text-[11px]">
              TRL-9 Pilot Framework
            </span>
            <span className="px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-[11px]">
              Jharkhand GIS Grid v2.4
            </span>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand column */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-600 text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="text-base font-bold text-white">{t.appName}</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Bridging citizens, academia, and industry to co-create sustainable solutions for Jharkhand's most pressing grassroots challenges.
          </p>
          <p className="text-[11px] text-slate-500">
            Powered by Deep Learning Vector Deduplication & GIS Urgency Heatmap Technology.
          </p>
        </div>

        {/* Portals */}
        <div>
          <h5 className="font-bold text-white text-xs uppercase tracking-wider mb-3">Stakeholder Portals</h5>
          <ul className="space-y-2">
            <li>
              <button onClick={() => navigate('/dashboard/citizen')} className="hover:text-indigo-400 transition-colors">
                Citizen Grievance & Tracking
              </button>
            </li>
            <li>
              <button onClick={() => navigate('/dashboard/university')} className="hover:text-indigo-400 transition-colors">
                University R&D Workspace
              </button>
            </li>
            <li>
              <button onClick={() => navigate('/dashboard/industry')} className="hover:text-indigo-400 transition-colors">
                Industry & CSR Grant Portal
              </button>
            </li>
            <li>
              <button onClick={() => navigate('/dashboard/admin')} className="hover:text-indigo-400 transition-colors">
                State Executive Dashboard
              </button>
            </li>
          </ul>
        </div>

        {/* GIS & Heatmap */}
        <div>
          <h5 className="font-bold text-white text-xs uppercase tracking-wider mb-3">Districts & GIS</h5>
          <ul className="space-y-2">
            <li>
              <button onClick={() => navigate('/heatmap')} className="hover:text-indigo-400 transition-colors">
                Interactive Urgency Heatmap
              </button>
            </li>
            <li>
              <span className="text-slate-500">Palamu Division (Fluorosis Corridor)</span>
            </li>
            <li>
              <span className="text-slate-500">North Chotanagpur (Coal Belt Remediation)</span>
            </li>
            <li>
              <span className="text-slate-500">South Chotanagpur (Tribal Agri Tech)</span>
            </li>
            <li>
              <span className="text-slate-500">Santhal Pargana (Forest Produce & Silk)</span>
            </li>
          </ul>
        </div>

        {/* Academic Partners */}
        <div>
          <h5 className="font-bold text-white text-xs uppercase tracking-wider mb-3">Academic Consortium</h5>
          <p className="text-xs text-slate-400 leading-relaxed mb-3">
            IIT (ISM) Dhanbad, BIT Mesra, NIT Jamshedpur, Birsa Agricultural University, AIIMS Deoghar, IIIT Ranchi.
          </p>
          <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-center gap-1">
            <span>Built for Smart India Hackathon 2026</span>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="max-w-7xl mx-auto px-4 py-4 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400">
        <div>© 2026 Samadhan Setu. All rights reserved. Govt of Jharkhand Innovation Cell.</div>
        <div className="flex items-center gap-1 mt-2 sm:mt-0">
          <span>Designed with high SaaS standards</span>
        </div>
      </div>
    </footer>
  );
};
