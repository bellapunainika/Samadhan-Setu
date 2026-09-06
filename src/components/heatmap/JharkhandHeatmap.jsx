import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { JHARKHAND_DISTRICTS, CATEGORIES } from '../../data/jharkhandDistricts';
import { 
  Flame, AlertTriangle, Layers, Filter, Eye, ChevronRight, 
  Droplets, Wheat, HeartPulse, Leaf, Zap, Trees, GraduationCap, ShieldCheck,
  Search, RefreshCw, Info, Sparkles
} from 'lucide-react';
import { DistrictSidePanel } from './DistrictSidePanel';
import { motion } from 'framer-motion';

export const JharkhandHeatmap = ({ compact = false }) => {
  const { problems, setSelectedDistrict, selectedDistrict, navigate } = useApp();

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredDistrict, setHoveredDistrict] = useState(null);

  // Compute live dynamic stats for each district based on problems in state
  const districtStats = JHARKHAND_DISTRICTS.map(dist => {
    const distProblems = problems.filter(p => {
      const matchDist = p.districtId === dist.id || p.districtName?.toLowerCase().includes(dist.id);
      const matchCat = selectedCategory === 'All' || p.category === selectedCategory;
      const matchStat = selectedStatus === 'All' || p.status === selectedStatus;
      return matchDist && matchCat && matchStat;
    });

    const activeCount = distProblems.filter(p => p.status !== 'Solved').length;
    const solvedCount = distProblems.filter(p => p.status === 'Solved').length;
    const total = distProblems.length;

    // Calculate dynamic urgency score based on density and problem severities
    let dynamicScore = dist.baseUrgency;
    if (distProblems.length > 0) {
      const avgSeverity = distProblems.reduce((acc, p) => acc + (p.severity || 3), 0) / distProblems.length;
      dynamicScore = Math.min(99, Math.round((dist.baseUrgency * 0.5) + (activeCount * 4) + (avgSeverity * 5)));
    }

    return {
      ...dist,
      filteredProblems: distProblems,
      activeProblems: activeCount,
      solvedProblems: solvedCount,
      totalProblems: total,
      dynamicUrgency: dynamicScore
    };
  });

  // Calculate heatmap color for a district
  const getDistrictColor = (urgency, activeCount) => {
    if (activeCount === 0 && selectedCategory !== 'All') {
      return { fill: '#1E293B', stroke: '#334155', glow: 'none' };
    }
    if (urgency >= 92) {
      return { fill: '#E11D48', stroke: '#FDA4AF', glow: 'rgba(225, 29, 72, 0.7)' }; // Critical Rose/Red
    } else if (urgency >= 85) {
      return { fill: '#EA580C', stroke: '#FDBA74', glow: 'rgba(234, 88, 12, 0.6)' }; // High Orange
    } else if (urgency >= 78) {
      return { fill: '#D97706', stroke: '#FDE68A', glow: 'rgba(217, 119, 6, 0.4)' }; // Amber
    } else if (urgency >= 70) {
      return { fill: '#4F46E5', stroke: '#A5B4FC', glow: 'rgba(79, 70, 229, 0.4)' }; // Indigo
    } else {
      return { fill: '#0D9488', stroke: '#99F6E4', glow: 'rgba(13, 148, 136, 0.4)' }; // Teal/Green
    }
  };

  const handleDistrictClick = (district) => {
    setSelectedDistrict(district);
  };

  // Top 3 hotspots for pulsing radar rings
  const topHotspots = [...districtStats]
    .sort((a, b) => b.dynamicUrgency - a.dynamicUrgency)
    .slice(0, 3);

  const filteredDistrictsList = districtStats.filter(d => 
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    d.hq.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative w-full rounded-3xl bg-[#0F172A]/90 border border-slate-700/60 backdrop-blur-2xl shadow-2xl overflow-hidden">
      {/* Top Filter Bar */}
      <div className="p-4 sm:p-6 border-b border-slate-800 bg-slate-900/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Flame className="w-4 h-4" />
            </span>
            <h3 className="text-lg font-bold text-white tracking-tight">
              Jharkhand GIS Urgency Heatmap
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
              LIVE 24-DISTRICT TELEMETRY
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            District color intensity scales with unresolved problem density, severity factors, and response latency.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Category filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="All">All Categories ({problems.length})</option>
            {CATEGORIES.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.label}
              </option>
            ))}
          </select>

          {/* Status filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="All">All Statuses</option>
            <option value="In Progress">In Progress (R&D / Prototyping)</option>
            <option value="Routed to University">Routed to University</option>
            <option value="Under Review">Under Review</option>
            <option value="Solved">Solved (TRL 8-9)</option>
          </select>

          {/* Reset button */}
          {(selectedCategory !== 'All' || selectedStatus !== 'All') && (
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSelectedStatus('All');
              }}
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 border border-slate-700 transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Main Map + Side Panel Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[560px]">
        {/* SVG Map Canvas (8 cols on desktop) */}
        <div className="lg:col-span-8 p-4 sm:p-8 flex flex-col items-center justify-center relative bg-gradient-to-b from-slate-950/40 via-slate-900/20 to-slate-950/60 overflow-hidden">
          {/* Subtle Map Grid Background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:24px_24px]" />

          {/* Map Compass / Coordinate HUD */}
          <div className="absolute top-4 left-4 p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-[10px] text-slate-400 font-mono space-y-1 backdrop-blur-md z-10 hidden sm:block">
            <div className="text-white font-bold flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-indigo-400" />
              JH-GIS GRID COORD
            </div>
            <div>LAT: 21°58'N - 25°18'N</div>
            <div>LON: 83°19'E - 87°57'E</div>
            <div className="text-emerald-400">STATE COVERAGE: 100% (24/24)</div>
          </div>

          {/* Legend */}
          <div className="absolute bottom-4 left-4 p-3 rounded-xl bg-slate-900/85 border border-slate-800 text-xs backdrop-blur-md z-10 hidden sm:block">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
              Urgency Heat Scale
            </span>
            <div className="flex items-center gap-2">
              <div className="w-20 h-2.5 rounded-full bg-gradient-to-r from-teal-500 via-indigo-500 via-amber-500 to-rose-600 shadow-inner" />
              <div className="flex items-center justify-between w-28 text-[10px] font-bold text-slate-300">
                <span>Low</span>
                <span>Critical</span>
              </div>
            </div>
          </div>

          {/* Interactive SVG Map */}
          <div className="relative w-full max-w-[720px] aspect-[1000/700] flex items-center justify-center z-10">
            <svg
              viewBox="80 30 900 660"
              className="w-full h-full filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.6)]"
            >
              {/* Render District Polygons */}
              {districtStats.map((dist) => {
                const color = getDistrictColor(dist.dynamicUrgency, dist.totalProblems);
                const isSelected = selectedDistrict?.id === dist.id;
                const isHovered = hoveredDistrict?.id === dist.id;

                return (
                  <g key={dist.id} className="cursor-pointer group">
                    <path
                      d={dist.path}
                      fill={color.fill}
                      stroke={isSelected ? '#FFFFFF' : isHovered ? '#6366F1' : color.stroke}
                      strokeWidth={isSelected ? '3.5' : isHovered ? '2.5' : '1.5'}
                      fillOpacity={isSelected ? 0.95 : isHovered ? 0.9 : 0.75}
                      className="district-path transition-all duration-300"
                      onClick={() => handleDistrictClick(dist)}
                      onMouseEnter={() => setHoveredDistrict(dist)}
                      onMouseLeave={() => setHoveredDistrict(null)}
                      style={{
                        filter: isSelected
                          ? `drop-shadow(0 0 16px ${color.glow})`
                          : isHovered
                          ? `drop-shadow(0 0 12px ${color.glow})`
                          : 'none'
                      }}
                    />

                    {/* District Label on Centroid */}
                    <text
                      x={dist.cx}
                      y={dist.cy}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="fill-white font-bold text-[13px] pointer-events-none select-none drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]"
                    >
                      {dist.name.split(' ')[0]}
                    </text>

                    {/* Problem count pill */}
                    <text
                      x={dist.cx}
                      y={dist.cy + 14}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="fill-slate-200 font-extrabold text-[10px] pointer-events-none select-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]"
                    >
                      {dist.totalProblems} Issues ({dist.dynamicUrgency})
                    </text>
                  </g>
                );
              })}

              {/* Pulsing Hotspot Radar Rings on Top 3 Most Urgent Districts */}
              {topHotspots.map((spot, idx) => (
                <g key={`hotspot-${spot.id}`} pointerEvents="none">
                  {/* Outer pulsing ring */}
                  <circle
                    cx={spot.cx}
                    cy={spot.cy}
                    r="24"
                    fill="none"
                    stroke="#F43F5E"
                    strokeWidth="2"
                    className="animate-ping origin-center opacity-75"
                    style={{ transformOrigin: `${spot.cx}px ${spot.cy}px` }}
                  />
                  {/* Core glowing dot */}
                  <circle
                    cx={spot.cx}
                    cy={spot.cy - 12}
                    r="4.5"
                    fill="#FFE4E6"
                    stroke="#E11D48"
                    strokeWidth="2"
                    className="animate-pulse"
                  />
                  {/* Hotspot # badge */}
                  <rect
                    x={spot.cx - 24}
                    y={spot.cy - 34}
                    width="48"
                    height="16"
                    rx="8"
                    fill="#E11D48"
                    fillOpacity="0.9"
                  />
                  <text
                    x={spot.cx}
                    y={spot.cy - 23}
                    textAnchor="middle"
                    className="fill-white font-black text-[9px]"
                  >
                    🔥 TOP #{idx + 1}
                  </text>
                </g>
              ))}
            </svg>

            {/* Hover Tooltip Card */}
            {hoveredDistrict && !selectedDistrict && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute top-4 right-4 p-4 rounded-2xl bg-slate-900/95 border border-indigo-500/50 shadow-2xl backdrop-blur-xl text-left w-64 z-20 pointer-events-none"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                    {hoveredDistrict.division}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                    Score {hoveredDistrict.dynamicUrgency}/100
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white mt-1">
                  {hoveredDistrict.name} ({hoveredDistrict.hindiName})
                </h4>
                <div className="mt-3 pt-2 border-t border-slate-800 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Active Issues</span>
                    <span className="font-bold text-rose-400">{hoveredDistrict.activeProblems}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Solved Prototypes</span>
                    <span className="font-bold text-emerald-400">{hoveredDistrict.solvedProblems}</span>
                  </div>
                </div>
                <div className="mt-2 text-[10px] text-indigo-300 flex items-center gap-1 font-semibold">
                  <Eye className="w-3 h-3" /> Click district to open deep-dive telemetry
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Right Drawer / District Detail Panel (4 cols on desktop) */}
        <div className="lg:col-span-4 border-t lg:border-t-0 lg:border-l border-slate-800 bg-slate-900/80 p-4 sm:p-6 flex flex-col justify-between">
          <DistrictSidePanel
            district={selectedDistrict || districtStats.find(d => d.id === 'gumla') || districtStats[0]}
            onClose={() => setSelectedDistrict(null)}
          />
        </div>
      </div>

      {/* District Quick Search & Directory Bar */}
      <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search district name or headquarters..."
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-full sm:w-64"
          />
        </div>

        {/* Quick district selector pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto custom-scrollbar pb-1 sm:pb-0">
          {filteredDistrictsList.slice(0, 5).map(dist => (
            <button
              key={dist.id}
              onClick={() => setSelectedDistrict(dist)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors whitespace-nowrap ${
                selectedDistrict?.id === dist.id
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {dist.name.split(' ')[0]} ({dist.dynamicUrgency})
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
