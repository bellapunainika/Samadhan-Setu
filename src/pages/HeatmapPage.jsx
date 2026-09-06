import React from 'react';
import { useApp } from '../context/AppContext';
import { JharkhandHeatmap } from '../components/heatmap/JharkhandHeatmap';
import { MapPin, Flame, Shield, Sparkles, Building2, GraduationCap } from 'lucide-react';

export const HeatmapPage = () => {
  const { districts, problems } = useApp();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30">
              <MapPin className="w-5 h-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Jharkhand GIS Urgency & Spatial Priority Heatmap
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl">
            State-level real-time spatial decision support system visualizing crowdsourced problem density, aquifer fluorosis, mining overburden leachate, and tribal health access indices.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 text-xs font-mono">
            24 / 24 Districts Mapped
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
            Live Telemetry Sync
          </span>
        </div>
      </div>

      {/* Main Heatmap Canvas */}
      <JharkhandHeatmap compact={false} />

      {/* Regional Division Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {[
          { name: 'South Chotanagpur', hq: 'Ranchi', districts: 'Ranchi, Gumla, Khunti, Simdega, Lohardaga', focus: 'Tribal Agri, Fluorosis, Cold-chain' },
          { name: 'North Chotanagpur', hq: 'Hazaribagh', districts: 'Dhanbad, Bokaro, Hazaribagh, Ramgarh, Giridih, Chatra, Koderma', focus: 'Mine Runoff, Fly Ash, Soil Acidity' },
          { name: 'Palamu Division', hq: 'Medininagar', districts: 'Palamu, Garhwa, Latehar', focus: 'Drought, Fluorosis, Telehealth Drones' },
          { name: 'Kolhan Division', hq: 'Chaibasa', districts: 'East Singhbhum, West Singhbhum, Saraikela', focus: 'Elephant Corridors, Tailings Dust' },
          { name: 'Santhal Pargana', hq: 'Dumka', districts: 'Dumka, Deoghar, Godda, Sahibganj, Pakur, Jamtara', focus: 'Language Classrooms, River Silt, Quarry Dust' }
        ].map(div => (
          <div key={div.name} className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 block">
              Division HQ: {div.hq}
            </span>
            <h4 className="text-xs font-bold text-white">{div.name}</h4>
            <p className="text-[11px] text-slate-400">{div.districts}</p>
            <div className="pt-2 border-t border-slate-800 text-[10px] text-emerald-300 font-medium">
              Primary R&D: {div.focus}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
