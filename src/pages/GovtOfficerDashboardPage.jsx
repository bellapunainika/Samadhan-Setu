import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { getAdminStats, getPipelineChallenges, getIndustryRequests } from '../services/adminService';
import { JHARKHAND_DISTRICTS } from '../data/jharkhandDistricts';
import { JharkhandHeatmap } from '../components/heatmap/JharkhandHeatmap';
import {
  BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  BarChart3, MapPin, Building2, Award, CheckCircle2,
  Clock, Shield, Eye, FileText, Layers, TrendingUp, RefreshCw,
  Users, HandCoins, Sparkles, ChevronRight, Zap, Target, ArrowUpRight
} from 'lucide-react';

// Color Palette for Pie Chart
const COLORS = ['#10B981', '#6366F1', '#F59E0B', '#EC4899', '#14B8A6', '#8B5CF6'];

// Rich Mock State Analytics Data (State Nodal Oversight)
const MONTHLY_ANALYTICS = [
  { month: 'Jan', reported: 112, resolved: 88, csrfunding: 1.2 },
  { month: 'Feb', reported: 145, resolved: 110, csrfunding: 1.8 },
  { month: 'Mar', reported: 168, resolved: 135, csrfunding: 2.1 },
  { month: 'Apr', reported: 185, resolved: 152, csrfunding: 2.4 },
  { month: 'May', reported: 210, resolved: 178, csrfunding: 3.0 },
  { month: 'Jun', reported: 195, resolved: 170, csrfunding: 2.7 },
  { month: 'Jul', reported: 230, resolved: 198, csrfunding: 3.5 },
  { month: 'Aug', reported: 245, resolved: 215, csrfunding: 4.1 },
  { month: 'Sep', reported: 260, resolved: 236, csrfunding: 4.8 }
];

const SECTOR_DISTRIBUTION = [
  { name: 'Water & Sanitation', value: 35, color: '#10B981' },
  { name: 'Rural Energy & Microgrids', value: 22, color: '#6366F1' },
  { name: 'Mining & Heavy Safety', value: 18, color: '#F59E0B' },
  { name: 'Sustainable Agriculture', value: 15, color: '#EC4899' },
  { name: 'Healthcare Logistics', value: 10, color: '#14B8A6' }
];

const UNIVERSITY_PERFORMANCE = [
  { name: 'BIT Mesra', projects: 42, patents: 8, avgDays: 32 },
  { name: 'IIT Dhanbad', projects: 38, patents: 12, avgDays: 28 },
  { name: 'NIT Jamshedpur', projects: 29, patents: 5, avgDays: 35 },
  { name: 'BAU Ranchi', projects: 24, patents: 3, avgDays: 40 },
  { name: 'Ranchi Univ', projects: 18, patents: 2, avgDays: 44 }
];

const DISTRICT_PERFORMANCE_TABLE = [
  { name: 'Ranchi', district_id: 'RNC', total: 148, resolved: 128, active: 16, csr: '₹2.8 Cr', rate: '86.4%' },
  { name: 'East Singhbhum', district_id: 'JSR', total: 132, resolved: 115, active: 14, csr: '₹3.4 Cr', rate: '87.1%' },
  { name: 'Dhanbad', district_id: 'DHN', total: 118, resolved: 98, active: 17, csr: '₹4.1 Cr', rate: '83.0%' },
  { name: 'Bokaro', district_id: 'BKR', total: 96, resolved: 82, active: 11, csr: '₹1.9 Cr', rate: '85.4%' },
  { name: 'Hazaribagh', district_id: 'HZB', total: 84, resolved: 74, active: 8, csr: '₹1.2 Cr', rate: '88.0%' },
  { name: 'Giridih', district_id: 'GRD', total: 78, resolved: 65, active: 10, csr: '₹0.9 Cr', rate: '83.3%' },
  { name: 'Palamu', district_id: 'PLM', total: 72, resolved: 61, active: 9, csr: '₹0.8 Cr', rate: '84.7%' },
  { name: 'West Singhbhum', district_id: 'WSB', total: 68, resolved: 58, active: 7, csr: '₹1.1 Cr', rate: '85.2%' }
];

const CORPORATE_PARTNERS = [
  { company: 'Tata Steel CSR Foundation', totalGrant: '₹5.2 Crore', projects: 18, sectors: 'Water, Metallurgy & Skilled Training' },
  { company: 'Coal India CSR (BCCL / CCL)', totalGrant: '₹4.8 Crore', projects: 14, sectors: 'Mine Safety, Dust Control & Bio-filters' },
  { company: 'Jindal Steel & Power CSR', totalGrant: '₹3.1 Crore', projects: 9, sectors: 'Solar Microgrids & Rural Cold Storage' },
  { company: 'NTPC Mining Division', totalGrant: '₹2.6 Crore', projects: 7, sectors: 'Water Filtration & Village Electrification' },
  { company: 'Rural Electrification Corp (REC)', totalGrant: '₹1.8 Crore', projects: 5, sectors: 'Agricultural Hydroponics & Tech Kits' }
];

export function GovtOfficerDashboardPage() {
  const { currentUser, navigate } = useApp();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [challenges, setChallenges] = useState([]);
  const [industryReqs, setIndustryReqs] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [s, c, i] = await Promise.all([
        getAdminStats(),
        getPipelineChallenges('all'),
        getIndustryRequests()
      ]);
      setStats(s);
      setChallenges(c);
      setIndustryReqs(i);
    } catch (err) {
      console.error('Failed to load oversight data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const completedProjects = challenges.filter(c => c.status === 'COMPLETED');
  const activeProjects = challenges.filter(c => ['ASSIGNED', 'IN_PROGRESS', 'SOLUTION_SUBMITTED', 'SOLUTION_APPROVED'].includes(c.status));

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-100 p-6 md:p-10 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-teal-950/40 to-slate-900 border border-teal-500/30 shadow-2xl backdrop-blur-xl">
        <div className="space-y-1 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 text-xs font-bold">
            <Shield className="w-3.5 h-3.5" />
            <span>State Nodal Oversight & Analytics Center • Government of Jharkhand</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
            Jharkhand State Governance Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Read-only executive monitoring of grassroots challenges, university R&amp;D allocations, and corporate CSR funding across 24 districts.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold border border-slate-700 hidden sm:inline">
            Officer Role: {currentUser?.full_name || 'Nodal Officer'}
          </span>
          <button
            onClick={loadData}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-teal-500/20 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Analytics</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 overflow-x-auto pb-2">
        {[
          { id: 'overview', label: '1. State Overview & Charts', icon: BarChart3 },
          { id: 'districts', label: '2. 24 Districts Performance', icon: MapPin },
          { id: 'universities', label: '3. University R&D Ranking', icon: Building2 },
          { id: 'industry', label: '4. Corporate CSR Support', icon: Award },
          { id: 'pipeline', label: '5. Live Project Pipeline', icon: Layers },
          { id: 'resolved', label: '6. Resolved Case Studies', icon: CheckCircle2 },
          { id: 'gis', label: '7. GIS Cluster Heatmap', icon: MapPin },
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-lg shadow-teal-500/10'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Top 6 KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-left">
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">Statewide Submissions</span>
          <div className="text-2xl font-black text-white">1,482</div>
          <span className="text-[10px] text-teal-400 font-semibold block">12 Live + Historical</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">Active R&amp;D Allocations</span>
          <div className="text-2xl font-black text-indigo-400">142</div>
          <span className="text-[10px] text-indigo-300 font-semibold block">{activeProjects.length} Live Seeded</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">Corporate CSR Pledged</span>
          <div className="text-2xl font-black text-amber-400">₹18.45 Cr</div>
          <span className="text-[10px] text-amber-300 font-semibold block">5 Corporate Donors</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">Citizens Benefited</span>
          <div className="text-2xl font-black text-emerald-400">4.2 Million</div>
          <span className="text-[10px] text-emerald-300 font-semibold block">Across 24 Districts</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">Avg R&amp;D Turnaround</span>
          <div className="text-2xl font-black text-purple-400">38 Days</div>
          <span className="text-[10px] text-purple-300 font-semibold block">-14% vs 2025 Target</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">State Resolution Rate</span>
          <div className="text-2xl font-black text-teal-400">88.4%</div>
          <span className="text-[10px] text-teal-300 font-semibold block">Verified by Nodal Cell</span>
        </div>
      </div>

      {/* TAB 1: STATE OVERVIEW & CHARTS */}
      {activeTab === 'overview' && (
        <div className="space-y-8 text-left">
          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Monthly Trend Area Chart */}
            <div className="lg:col-span-8 p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    <span>Monthly Grassroots Challenge Submissions vs Resolution Trend</span>
                  </h3>
                  <p className="text-xs text-slate-400">Monthly volume of reported issues, university R&amp;D resolutions, and CSR funding (₹ Cr)</p>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-teal-300 border border-slate-700">
                  STATE ANALYTICS • DEMO DATA
                </span>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={MONTHLY_ANALYTICS} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorReported" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                    <XAxis dataKey="month" stroke="#64748B" fontSize={11} />
                    <YAxis stroke="#64748B" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }} />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Area type="monotone" dataKey="reported" name="Reported Problems" stroke="#6366F1" fillOpacity={1} fill="url(#colorReported)" />
                    <Area type="monotone" dataKey="resolved" name="Resolved Solutions" stroke="#10B981" fillOpacity={1} fill="url(#colorResolved)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Sector Distribution Pie Chart */}
            <div className="lg:col-span-4 p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-indigo-400" />
                  <span>Sectoral Breakdown</span>
                </h3>
                <p className="text-xs text-slate-400">Distribution of grassroots issues by primary domain</p>
              </div>

              <div className="h-56 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={SECTOR_DISTRIBUTION}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {SECTOR_DISTRIBUTION.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                {SECTOR_DISTRIBUTION.map((s) => (
                  <div key={s.name} className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                    <span className="text-slate-300 truncate">{s.name} ({s.value}%)</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Combined Live Database Status + Analytics Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Live Database Seed Status */}
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>Live PostgreSQL Challenge Pipeline</span>
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  REAL DB RECORDS ({challenges.length})
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Pending Admin Review', count: stats?.pending_review || 2, color: 'text-amber-400' },
                  { label: 'Assigned to University', count: stats?.assigned || 2, color: 'text-indigo-400' },
                  { label: 'In Progress R&D', count: stats?.in_progress || 2, color: 'text-blue-400' },
                  { label: 'Solution Submitted', count: stats?.solutions_pending || 2, color: 'text-purple-400' },
                  { label: 'Completed & Resolved', count: stats?.completed || 1, color: 'text-emerald-400' },
                  { label: 'Rejected Out-of-Scope', count: stats?.rejected || 1, color: 'text-rose-400' },
                ].map(st => (
                  <div key={st.label} className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 text-center">
                    <div className="text-xs text-slate-400 font-medium">{st.label}</div>
                    <div className={`text-2xl font-black mt-0.5 ${st.color}`}>{st.count}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* State Nodal Key Metrics Summary */}
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Target className="w-4 h-4 text-indigo-400" />
                <span>Nodal Cell Key Governance Impact</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-300">Total Registered Citizen Advocates</span>
                  <span className="font-bold text-emerald-400 text-sm">34,520 Verified Users</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-300">Participating Academic Institutions</span>
                  <span className="font-bold text-indigo-400 text-sm">18 Jharkhand Universities</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-300">AI Duplicate Grouping Efficiency</span>
                  <span className="font-bold text-purple-400 text-sm">34.2% Spam Reduced</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-300">Average CSR Grant Pledged / Project</span>
                  <span className="font-bold text-amber-400 text-sm">₹13.2 Lakhs</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: 24 DISTRICTS PERFORMANCE */}
      {activeTab === 'districts' && (
        <div className="space-y-6 text-left">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">24 Jharkhand Districts Performance Index</h2>
              <p className="text-xs text-slate-400">Resolution rates, active university allocations, and CSR funding per district</p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-800 text-teal-300 border border-slate-700">
              STATE ANALYTICS • DEMO DATA
            </span>
          </div>

          <div className="overflow-x-auto rounded-3xl border border-slate-800 bg-slate-900/80">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 uppercase font-bold text-[10px]">
                  <th className="p-4">District Name</th>
                  <th className="p-4">District Code</th>
                  <th className="p-4">Total Challenges</th>
                  <th className="p-4">Resolved Items</th>
                  <th className="p-4">Active R&amp;D Projects</th>
                  <th className="p-4">Corporate CSR Pledged</th>
                  <th className="p-4">Resolution Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {DISTRICT_PERFORMANCE_TABLE.map(d => (
                  <tr key={d.name} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 font-bold text-white text-sm">{d.name}</td>
                    <td className="p-4 font-mono text-teal-400 font-semibold">{d.district_id}</td>
                    <td className="p-4 font-bold text-slate-200">{d.total}</td>
                    <td className="p-4 font-bold text-emerald-400">{d.resolved}</td>
                    <td className="p-4 font-bold text-indigo-400">{d.active}</td>
                    <td className="p-4 font-bold text-amber-400">{d.csr}</td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                        {d.rate}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: UNIVERSITY R&D RANKING */}
      {activeTab === 'universities' && (
        <div className="space-y-6 text-left">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">University R&amp;D Institution Ranking &amp; Performance</h2>
              <p className="text-xs text-slate-400">Institutional allocations, patent filings, and average solution delivery speed</p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-800 text-teal-300 border border-slate-700">
              STATE ANALYTICS • DEMO DATA
            </span>
          </div>

          {/* Bar Chart for University Performance */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Active R&amp;D Allocations by Institution</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={UNIVERSITY_PERFORMANCE} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                  <XAxis dataKey="name" stroke="#64748B" fontSize={11} />
                  <YAxis stroke="#64748B" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="projects" name="Assigned Projects" fill="#6366F1" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="patents" name="Patents Filed" fill="#10B981" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {UNIVERSITY_PERFORMANCE.map(u => (
              <div key={u.name} className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white text-base">{u.name}</h3>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    Ranked Institution
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs pt-2 border-t border-slate-800">
                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase font-bold">Projects</span>
                    <span className="font-extrabold text-indigo-400 text-sm">{u.projects}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase font-bold">Patents</span>
                    <span className="font-extrabold text-emerald-400 text-sm">{u.patents}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase font-bold">Avg Speed</span>
                    <span className="font-extrabold text-purple-400 text-sm">{u.avgDays} Days</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: CORPORATE CSR SUPPORT */}
      {activeTab === 'industry' && (
        <div className="space-y-6 text-left">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">Corporate CSR &amp; Industry Support Oversight</h2>
              <p className="text-xs text-slate-400">Participating corporate partners, total pledged grants, and focus sectors</p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-800 text-teal-300 border border-slate-700">
              STATE ANALYTICS • DEMO DATA
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400 font-bold uppercase block">Total Corporate Grants</span>
              <div className="text-3xl font-black text-amber-400">₹18.45 Crore</div>
              <span className="text-[11px] text-slate-400">Committed CSR Funds</span>
            </div>
            <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400 font-bold uppercase block">Funded Projects</span>
              <div className="text-3xl font-black text-emerald-400">57 Projects</div>
              <span className="text-[11px] text-slate-400">Across 24 Districts</span>
            </div>
            <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400 font-bold uppercase block">Corporate Partners</span>
              <div className="text-3xl font-black text-indigo-400">5 Enterprises</div>
              <span className="text-[11px] text-slate-400">Active MoUs Signed</span>
            </div>
          </div>

          <div className="space-y-3">
            {CORPORATE_PARTNERS.map(cp => (
              <div key={cp.company} className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-emerald-400" />
                    <span className="font-bold text-white text-base">{cp.company}</span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {cp.projects} Projects Funded
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">Focus Sectors: <strong>{cp.sectors}</strong></p>
                </div>
                <span className="text-base font-black text-amber-400 shrink-0">{cp.totalGrant}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: LIVE PROJECT PIPELINE */}
      {activeTab === 'pipeline' && (
        <div className="space-y-4 text-left">
          <h2 className="text-lg font-bold text-white">Full State Challenge Pipeline History</h2>
          <div className="divide-y divide-slate-800 bg-slate-900/60 border border-slate-800 rounded-3xl overflow-hidden">
            {challenges.map(c => (
              <div key={c.id} className="p-4 flex items-center justify-between hover:bg-slate-800/40 transition-all">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-teal-400">{c.short_id}</span>
                    <span className="text-xs font-bold text-slate-300">{c.category}</span>
                    <span className="text-xs text-slate-500">• {c.district_id}</span>
                  </div>
                  <h4 className="text-sm font-bold text-white">{c.title}</h4>
                </div>
                <div className="flex items-center gap-4">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700">
                    {c.status}
                  </span>
                  <button
                    onClick={() => navigate(`/project/${c.short_id}`)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: RESOLVED CASE STUDIES */}
      {activeTab === 'resolved' && (
        <div className="space-y-4 text-left">
          <h2 className="text-lg font-bold text-white">Statewide Resolved Problems &amp; Impact History</h2>
          <div className="divide-y divide-slate-800 bg-slate-900/60 border border-slate-800 rounded-3xl overflow-hidden">
            {completedProjects.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">No projects currently completed in live seed.</div>
            ) : (
              completedProjects.map(c => (
                <div key={c.id} className="p-5 flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-xs font-mono text-emerald-400">{c.short_id}</span>
                    <h4 className="text-sm font-bold text-white">{c.title}</h4>
                    <p className="text-xs text-slate-400">District: {c.district_id} • Resolved by University R&amp;D Solution</p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    RESOLVED
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 7: GIS HEATMAP */}
      {activeTab === 'gis' && (
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4 text-left">
          <h2 className="text-lg font-bold text-white">Geographic Information System (GIS) Heatmap</h2>
          <div className="h-[500px] rounded-2xl overflow-hidden">
            <JharkhandHeatmap problems={challenges} />
          </div>
        </div>
      )}
    </div>
  );
}
