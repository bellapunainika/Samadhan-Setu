import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { AnalyticsDashboard } from '../components/analytics/AnalyticsDashboard';
import {
  Shield, BarChart2, Layers, Users2, AlertTriangle, FileDown,
  RefreshCw, CheckCircle2, XCircle, GitMerge, Plus, Download,
  Building2, GraduationCap, LogIn, Lock, ChevronRight, FileText,
  Flame, Settings, Eye, Check, X, Sliders, Award, Loader2, AlertCircle,
  FolderOpen, Image as ImageIcon, ExternalLink, Info, AlertOctagon,
  Sparkles, CheckCircle, ArrowRight, Clock
} from 'lucide-react';
import { StatusBadge, UrgencyPill, CategoryBadge } from '../components/common/Badge';
import { motion, AnimatePresence } from 'framer-motion';
import {
  getPendingChallenges,
  getApprovedChallenges,
  getAssignedChallenges,
  getPendingSolutions,
  reviewSolution,
  getIndustryRequests,
  getAdminStats,
  approveChallenge,
  rejectChallenge,
  overrideAi,
  assignUniversity,
  getAuditLogs,
  getAdminUniversities
} from '../services/adminService';

const SIDEBAR_ITEMS = [
  { id: 'dashboard', labelKey: 'dashboard', icon: BarChart2 },
  { id: 'pipeline', labelKey: 'pipeline', icon: Layers },
  { id: 'audit', labelKey: 'reports', icon: Shield },
  { id: 'moderation', labelKey: 'moderation', icon: AlertTriangle },
];

const SEEDED_UNIVERSITIES = [
  { id: 'bit-mesra', name: 'Birla Institute of Technology, Mesra', short_name: 'BIT Mesra' },
  { id: 'iit-dhanbad', name: 'Indian Institute of Technology (ISM) Dhanbad', short_name: 'IIT (ISM) Dhanbad' },
  { id: 'nit-jamshedpur', name: 'National Institute of Technology Jamshedpur', short_name: 'NIT Jamshedpur' },
  { id: 'bau-kanke', name: 'Birsa Agricultural University', short_name: 'BAU Kanke' },
  { id: 'cuj-brambe', name: 'Central University of Jharkhand', short_name: 'CUJ Brambe' }
];

const getEvidenceImageUrl = (filename) => {
  if (!filename) return '';
  const token = sessionStorage.getItem('samadhan_token');
  const baseUrl = import.meta.env.VITE_API_URL || '';
  return `${baseUrl}/api/uploads/${filename}${token ? `?token=${encodeURIComponent(token)}` : ''}`;
};

export const AdminAnalyticsPage = () => {
  const {
    isLoggedIn, currentRole, showToast, t, navigate,
    setIsLoginModalOpen
  } = useApp();

  const [activeTab, setActiveTab] = useState('pipeline'); // 'dashboard' | 'pipeline' | 'audit' | 'moderation'
  const [pipelineSubTab, setPipelineSubTab] = useState('pending'); // 'pending' | 'approved_assigned' | 'solutions' | 'industry'
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Stage 3 Backend Real Data State
  const [pendingChallenges, setPendingChallenges] = useState([]);
  const [approvedChallenges, setApprovedChallenges] = useState([]);
  const [assignedChallenges, setAssignedChallenges] = useState([]);
  const [pendingSolutions, setPendingSolutions] = useState([]);
  const [industryRequests, setIndustryRequests] = useState([]);
  const [adminStats, setAdminStats] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [universitiesList, setUniversitiesList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Selected challenge for modal actions
  const [reviewChallenge, setReviewChallenge] = useState(null);
  const [actionModalType, setActionModalType] = useState(null); // 'approve_assign' | 'reject' | 'override' | 'assign' | 'detail' | 'review_solution' | 'review_industry'
  const [selectedIndustryReq, setSelectedIndustryReq] = useState(null);
  const [enlargedImage, setEnlargedImage] = useState(null); // URL of image for lightbox modal
  
  // Action form inputs
  const [actionReason, setActionReason] = useState('');
  const [selectedUnivId, setSelectedUnivId] = useState('');
  const [overrideSector, setOverrideSector] = useState('');
  const [overrideScore, setOverrideScore] = useState('');

  const fetchAdminData = useCallback(async () => {
    if (!isLoggedIn || currentRole !== 'admin') return;
    setLoading(true);
    setError('');
    try {
      const [pendingData, approvedData, assignedData, solutionsData, industryData, statsData, auditData, univsData] = await Promise.all([
        getPendingChallenges().catch(() => []),
        getApprovedChallenges().catch(() => []),
        getAssignedChallenges().catch(() => []),
        getPendingSolutions().catch(() => []),
        getIndustryRequests().catch(() => []),
        getAdminStats().catch(() => null),
        getAuditLogs().catch(() => []),
        getAdminUniversities().catch(() => SEEDED_UNIVERSITIES)
      ]);
      setPendingChallenges(pendingData || []);
      setApprovedChallenges(approvedData || []);
      setAssignedChallenges(assignedData || []);
      setPendingSolutions(solutionsData || []);
      setIndustryRequests(industryData || []);
      setAdminStats(statsData);
      setAuditLogs(auditData || []);
      if (univsData && univsData.length > 0) setUniversitiesList(univsData);
      else setUniversitiesList(SEEDED_UNIVERSITIES);
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to load administrative governance data from PostgreSQL.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn, currentRole]);

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  // Auth guard
  if (!isLoggedIn || currentRole !== 'admin') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="text-center space-y-5 max-w-sm">
          <div className="w-20 h-20 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto">
            <Lock className="w-10 h-10 text-amber-400" />
          </div>
          <h2 className="text-2xl font-black text-white">{t.admin.accessDenied}</h2>
          <p className="text-sm text-slate-400 leading-relaxed">{t.admin.accessDeniedMsg}</p>
          <button
            onClick={() => setIsLoginModalOpen(true)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold text-sm hover:opacity-90 transition-all shadow-lg"
          >
            <LogIn className="w-4 h-4" />
            {t.admin.loginAsAdmin}
          </button>
        </div>
      </div>
    );
  }

  // 1-Step Immediate Approve & Assign Handler
  const handleApproveAndAssign = async (targetUnivId, targetUnivName) => {
    if (!reviewChallenge) return;
    try {
      const challengeId = reviewChallenge.short_id || reviewChallenge.id;
      
      // Step 1: If status is UNDER_REVIEW, approve first
      if (reviewChallenge.status === 'UNDER_REVIEW') {
        await approveChallenge(challengeId, 'Auto-approved prior to university assignment.');
      }
      
      // Step 2: Assign target university
      await assignUniversity(challengeId, targetUnivId, actionReason || `Assigned to ${targetUnivName} by State Admin.`);
      
      showToast('1-Step Approved & Assigned', `Challenge #${challengeId} assigned to ${targetUnivName}.`, 'success');
      setActionModalType(null);
      setReviewChallenge(null);
      setSelectedUnivId('');
      setActionReason('');
      fetchAdminData();
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to approve & assign university.';
      showToast('Assignment Failed', msg, 'error');
    }
  };

  const handleRejectSubmit = async () => {
    if (!reviewChallenge) return;
    if (!actionReason.trim()) {
      showToast('Reason Required', 'Please enter a rejection reason.', 'error');
      return;
    }
    try {
      await rejectChallenge(reviewChallenge.short_id || reviewChallenge.id, actionReason);
      showToast('Challenge Rejected', `Challenge #${reviewChallenge.short_id || reviewChallenge.id} rejected.`, 'info');
      setActionModalType(null);
      setReviewChallenge(null);
      setActionReason('');
      fetchAdminData();
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to reject challenge.';
      showToast('Rejection Failed', msg, 'error');
    }
  };

  const handleOverrideSubmit = async () => {
    if (!reviewChallenge) return;
    if (!actionReason.trim()) {
      showToast('Reason Required', 'Please enter justification for AI override.', 'error');
      return;
    }
    const payload = {
      primary_sector: overrideSector || undefined,
      priority_score: overrideScore ? parseFloat(overrideScore) : undefined,
      reason: actionReason
    };
    try {
      await overrideAi(reviewChallenge.short_id || reviewChallenge.id, payload);
      showToast('AI Overridden', `Admin final decision recorded for #${reviewChallenge.short_id || reviewChallenge.id}.`, 'success');
      setActionModalType(null);
      setReviewChallenge(null);
      setActionReason('');
      setOverrideSector('');
      setOverrideScore('');
      fetchAdminData();
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to override AI prediction.';
      showToast('Override Failed', msg, 'error');
    }
  };

  const handleReviewSolutionSubmit = async (actionType) => {
    if (!reviewChallenge) return;
    try {
      await reviewSolution(reviewChallenge.short_id || reviewChallenge.id, actionType, actionReason);
      showToast('Solution Reviewed', `Solution for #${reviewChallenge.short_id || reviewChallenge.id} updated to ${actionType === 'ACCEPT' ? 'COMPLETED' : 'IN_PROGRESS'}.`, 'success');
      setActionModalType(null);
      setReviewChallenge(null);
      setActionReason('');
      fetchAdminData();
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to review solution.';
      showToast('Review Failed', msg, 'error');
    }
  };

  // Combine assigned and approved challenges for "Approved & Assigned" pipeline view
  const approvedAndAssignedList = [...assignedChallenges, ...approvedChallenges].filter((item, index, self) =>
    index === self.findIndex(t => (t.id === item.id || t.short_id === item.short_id))
  );

  return (
    <div className="flex min-h-screen bg-[#070D1A]">
      {/* ── Sidebar ─────────────────────────────────────────────── */}
      <aside
        className={`sticky top-16 self-start h-[calc(100vh-4rem)] flex flex-col shrink-0 border-r border-slate-800/80 bg-[#0A1020]/90 backdrop-blur-xl transition-all duration-300 ${
          isSidebarCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        <div className="p-4 border-b border-slate-800 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-600 to-orange-600 text-white shadow-md shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          {!isSidebarCollapsed && (
            <div className="min-w-0">
              <p className="text-xs font-black text-white truncate">State Executive</p>
              <p className="text-[10px] text-amber-400 font-semibold truncate">Govt of Jharkhand</p>
            </div>
          )}
          <button
            onClick={() => setIsSidebarCollapsed(p => !p)}
            className="ml-auto text-slate-500 hover:text-white transition-colors shrink-0"
          >
            <ChevronRight className={`w-4 h-4 transition-transform ${isSidebarCollapsed ? '' : 'rotate-180'}`} />
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {SIDEBAR_ITEMS.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-amber-400' : ''}`} />
                {!isSidebarCollapsed && (
                  <span className="truncate">{item.id === 'audit' ? 'Governance Audit Log' : t.admin.sidebar[item.labelKey]}</span>
                )}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* ── Main Content Area ────────────────────────────────────── */}
      <main className="flex-1 p-6 md:p-8 overflow-x-hidden text-left">
        <div className="max-w-7xl mx-auto space-y-6">

          {/* Page Top Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl shadow-xl">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold">
                <Shield className="w-3.5 h-3.5" />
                <span>State Nodal Governance Portal</span>
              </div>
              <h1 className="text-2xl font-black text-white tracking-tight">
                State Nodal Administrative Control Panel
              </h1>
              <p className="text-xs text-slate-400">
                1-Step AI Approve &amp; Assign, University R&amp;D Allocation, and Corporate CSR Oversight.
              </p>
            </div>

            <button
              onClick={fetchAdminData}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-2 border border-slate-700 transition-all shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh PostgreSQL</span>
            </button>
          </div>

          {/* Active Tab Views */}
          <AnimatePresence mode="wait">

            {/* TAB 1: Analytics Dashboard */}
            {activeTab === 'dashboard' && (
              <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <AnalyticsDashboard />
              </motion.div>
            )}

            {/* TAB 2: Governance Pipeline */}
            {activeTab === 'pipeline' && (
              <motion.div key="pipeline" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                
                {/* Pipeline Sub-navigation */}
                <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
                  <button
                    onClick={() => setPipelineSubTab('pending')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      pipelineSubTab === 'pending'
                        ? 'bg-amber-500 text-slate-950 shadow-md'
                        : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Pending Review ({pendingChallenges.length})</span>
                  </button>

                  <button
                    onClick={() => setPipelineSubTab('approved_assigned')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      pipelineSubTab === 'approved_assigned'
                        ? 'bg-amber-500 text-slate-950 shadow-md'
                        : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    <GraduationCap className="w-3.5 h-3.5" />
                    <span>Approved &amp; Assigned ({approvedAndAssignedList.length})</span>
                  </button>

                  <button
                    onClick={() => setPipelineSubTab('solutions')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      pipelineSubTab === 'solutions'
                        ? 'bg-amber-500 text-slate-950 shadow-md'
                        : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>Solution Reviews ({pendingSolutions.length})</span>
                  </button>

                  <button
                    onClick={() => setPipelineSubTab('industry')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      pipelineSubTab === 'industry'
                        ? 'bg-amber-500 text-slate-950 shadow-md'
                        : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Industry Partnerships [READ-ONLY] ({industryRequests.length})</span>
                  </button>
                </div>

                {/* SUB-TAB 1: PENDING REVIEW QUEUE */}
                {pipelineSubTab === 'pending' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-base font-bold text-white">Pending Administrative Review Queue</h3>
                        <p className="text-xs text-slate-400">Review real PostgreSQL submissions, inspect AI recommendations, and execute 1-step Approve &amp; Assign.</p>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold">
                        {pendingChallenges.length} Pending Actions
                      </span>
                    </div>

                    {pendingChallenges.length === 0 ? (
                      <div className="py-16 px-6 text-center space-y-3 bg-slate-900/40 border border-slate-800 rounded-3xl">
                        <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                        <h4 className="text-sm font-bold text-white">No pending challenges</h4>
                        <p className="text-xs text-slate-400">All submitted grassroots challenges in PostgreSQL have been reviewed and assigned.</p>
                      </div>
                    ) : (
                      <div className="rounded-3xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-2xl">
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs text-slate-300">
                            <thead className="bg-slate-950 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-800">
                              <tr>
                                <th className="p-4">ID &amp; Title</th>
                                <th className="p-4">District / Locality</th>
                                <th className="p-4">Category</th>
                                <th className="p-4">AI Priority</th>
                                <th className="p-4">Top AI Recommended Solver</th>
                                <th className="p-4 text-right">Administrative Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60">
                              {pendingChallenges.map(prob => {
                                const topMatch = prob.ai_prediction?.recommended_universities?.[0];
                                return (
                                  <tr key={prob.id} className="hover:bg-slate-800/40 transition-colors">
                                    <td className="p-4">
                                      <div
                                        onClick={() => navigate(`/project/${prob.short_id || prob.id}`)}
                                        className="font-bold text-white max-w-xs truncate cursor-pointer hover:text-indigo-400 transition-colors"
                                      >
                                        {prob.title}
                                      </div>
                                      <div className="font-mono text-[10px] text-amber-400">{prob.short_id || prob.id}</div>
                                    </td>
                                    <td className="p-4 font-semibold text-slate-200">{prob.block_locality} ({prob.district_id})</td>
                                    <td className="p-4"><CategoryBadge category={prob.category} /></td>
                                    <td className="p-4">
                                      <UrgencyPill score={prob.ai_prediction?.priority_score || (prob.citizen_severity * 15)} />
                                    </td>
                                    <td className="p-4">
                                      {topMatch ? (
                                        <div>
                                          <span className="font-bold text-indigo-300 block">{topMatch.university_name}</span>
                                          <span className="text-[10px] text-emerald-400 font-mono">{topMatch.match_score}% AI Match</span>
                                        </div>
                                      ) : (
                                        <span className="text-slate-500 italic text-[11px]">Calculating AI Match...</span>
                                      )}
                                    </td>
                                    <td className="p-4 text-right">
                                      <button
                                        onClick={() => { setReviewChallenge(prob); setActionModalType('approve_assign'); }}
                                        className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md inline-flex items-center gap-1.5"
                                      >
                                        <Sparkles className="w-3.5 h-3.5" />
                                        <span>1-Step Approve &amp; Assign</span>
                                      </button>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* SUB-TAB 2: APPROVED & ASSIGNED PROBLEMS (PAST DATA VIEW) */}
                {pipelineSubTab === 'approved_assigned' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-base font-bold text-white">Approved &amp; Assigned Problems Pipeline</h3>
                        <p className="text-xs text-slate-400">View past approved challenges, active university allocations, team members, and AI top matches.</p>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-xs font-bold">
                        {approvedAndAssignedList.length} Active Allocations
                      </span>
                    </div>

                    {approvedAndAssignedList.length === 0 ? (
                      <div className="py-16 px-6 text-center space-y-3 bg-slate-900/40 border border-slate-800 rounded-3xl">
                        <FolderOpen className="w-10 h-10 text-slate-500 mx-auto" />
                        <h4 className="text-sm font-bold text-white">No assigned challenges found</h4>
                        <p className="text-xs text-slate-400">Approve and assign pending challenges to populate university allocations.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {approvedAndAssignedList.map(prob => {
                          const assignedUnivName = prob.assignment?.university_name || prob.assigned_university_name || 'Assigned R&D Institution';
                          const top3 = prob.ai_prediction?.recommended_universities?.slice(0, 3) || [];

                          return (
                            <div key={prob.id} className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
                              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono text-xs text-amber-400 font-bold">{prob.short_id || prob.id}</span>
                                    <CategoryBadge category={prob.category} />
                                    <StatusBadge status={prob.status} />
                                  </div>
                                  <h4
                                    onClick={() => navigate(`/project/${prob.short_id || prob.id}`)}
                                    className="text-base font-bold text-white hover:text-indigo-300 cursor-pointer transition-colors"
                                  >
                                    {prob.title}
                                  </h4>
                                  <p className="text-xs text-slate-400">{prob.block_locality} ({prob.district_id} District)</p>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                  <button
                                    onClick={() => { setReviewChallenge(prob); setActionModalType('detail'); }}
                                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1.5"
                                  >
                                    <Eye className="w-4 h-4" />
                                    <span>Inspect Details</span>
                                  </button>
                                  <button
                                    onClick={() => { setReviewChallenge(prob); setActionModalType('approve_assign'); }}
                                    className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md"
                                  >
                                    <Sliders className="w-3.5 h-3.5" />
                                    <span>Re-assign Solver</span>
                                  </button>
                                </div>
                              </div>

                              {/* Active Assignment Info & AI Top 3 Matches */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                                {/* Assigned University & Team */}
                                <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 space-y-2">
                                  <div className="flex items-center justify-between text-[11px]">
                                    <span className="text-indigo-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
                                      <GraduationCap className="w-4 h-4 text-indigo-400" />
                                      <span>Assigned University Institution</span>
                                    </span>
                                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                                      {prob.status}
                                    </span>
                                  </div>
                                  <h5 className="font-bold text-white text-sm">{assignedUnivName}</h5>

                                  {prob.assignment?.team_name && (
                                    <div className="pt-2 border-t border-indigo-500/20 space-y-1 text-[11px] text-slate-300">
                                      <div>Research Team: <strong className="text-white">{prob.assignment.team_name}</strong></div>
                                      <div>Faculty Mentor: <strong className="text-indigo-200">{prob.assignment.faculty_mentor}</strong></div>
                                      <div>Students: <strong className="text-slate-300">{prob.assignment.student_members}</strong></div>
                                    </div>
                                  )}
                                </div>

                                {/* AI 3 Predicted Universities */}
                                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                                  <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block flex items-center gap-1">
                                    <Sparkles className="w-3.5 h-3.5" />
                                    <span>Top 3 AI Predicted Recommendations</span>
                                  </span>

                                  <div className="space-y-1.5">
                                    {top3.length > 0 ? top3.map((rec, i) => {
                                      const isChosen = rec.university_name?.toLowerCase().includes(assignedUnivName.toLowerCase()) || assignedUnivName.toLowerCase().includes(rec.university_name?.toLowerCase());
                                      return (
                                        <div key={i} className={`p-2 rounded-xl border flex items-center justify-between text-[11px] ${
                                          isChosen ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' : 'bg-slate-900 border-slate-800 text-slate-300'
                                        }`}>
                                          <span className="font-semibold truncate max-w-[200px]">{rec.university_name}</span>
                                          <div className="flex items-center gap-2">
                                            <span className="font-bold text-emerald-400">{rec.match_score}% Match</span>
                                            {isChosen && <span className="px-1.5 py-0.5 rounded bg-emerald-500/30 text-emerald-200 font-extrabold text-[9px]">SELECTED</span>}
                                          </div>
                                        </div>
                                      );
                                    }) : (
                                      <div className="text-slate-500 italic text-[11px]">AI Recommendations Recorded</div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* SUB-TAB 3: SOLUTION REVIEWS */}
                {pipelineSubTab === 'solutions' && (
                  <div className="space-y-4">
                    <h3 className="text-base font-bold text-white">University R&amp;D Solution Prototype Reviews</h3>
                    <div className="divide-y divide-slate-800 bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden">
                      {pendingSolutions.length === 0 ? (
                        <div className="p-8 text-center text-xs text-slate-500">No solution submissions pending state review.</div>
                      ) : (
                        pendingSolutions.map(sol => (
                          <div key={sol.id} className="p-5 space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-white text-sm">{sol.title}</span>
                              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                {sol.status}
                              </span>
                            </div>
                            <p className="text-xs text-slate-300">{sol.description}</p>
                            <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                              <span className="text-slate-400">Tech Stack: <strong className="text-white">{sol.tech_stack || 'N/A'}</strong></span>
                              <button
                                onClick={() => { setReviewChallenge(sol.challenge); setActionModalType('review_solution'); }}
                                className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold"
                              >
                                Review Solution
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* SUB-TAB 4: INDUSTRY SUPPORT OVERSIGHT — READ-ONLY */}
                {pipelineSubTab === 'industry' && (() => {
                  // Build challenge lookup from already-fetched lists to resolve project title + university
                  const allFetchedChallenges = [
                    ...pendingChallenges,
                    ...approvedChallenges,
                    ...assignedChallenges,
                  ];
                  const challengeMap = {};
                  allFetchedChallenges.forEach(ch => {
                    const key = String(ch.id);
                    if (!challengeMap[key]) {
                      challengeMap[key] = {
                        title: ch.title,
                        short_id: ch.short_id || ch.id,
                        university_name:
                          ch.assignment?.university_name ||
                          ch.assigned_university_name ||
                          null,
                      };
                    }
                  });

                  return (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-base font-bold text-white">Corporate CSR &amp; Industry Partnership Oversight</h3>
                          <p className="text-xs text-slate-400 mt-0.5">
                            Read-only governance monitoring of industry funding interests, proposal stages, and support confirmations.
                            <strong className="text-amber-300 ml-1">Admin has no Accept/Decline action — partnerships are negotiated directly between University and Industry.</strong>
                          </p>
                        </div>
                        <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700 text-xs font-bold shrink-0 ml-4">
                          👁 READ-ONLY MONITORING
                        </span>
                      </div>

                      {industryRequests.length === 0 ? (
                        <div className="py-12 px-6 text-center space-y-3 bg-slate-900/40 border border-slate-800 rounded-3xl">
                          <Building2 className="w-10 h-10 text-slate-500 mx-auto" />
                          <h4 className="text-sm font-bold text-white">No Industry Partnership Records</h4>
                          <p className="text-xs text-slate-400">
                            Industry partnerships appear here once an Industry user expresses interest in a university solution that is INDUSTRY_SUPPORT_REQUESTED.
                          </p>
                        </div>
                      ) : (
                        <div className="rounded-3xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-2xl">
                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs text-slate-300">
                              <thead className="bg-slate-950 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-800">
                                <tr>
                                  <th className="p-4">Project</th>
                                  <th className="p-4">University</th>
                                  <th className="p-4">Industry Partner</th>
                                  <th className="p-4">Proposal Stage</th>
                                  <th className="p-4">Support Type</th>
                                  <th className="p-4">Pledged Amount</th>
                                  <th className="p-4">Submitted</th>
                                  <th className="p-4">Confirmed</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-800/60">
                                {industryRequests.map(req => {
                                  const chInfo = challengeMap[String(req.challenge_id)] || {};
                                  return (
                                    <tr key={req.id} className="hover:bg-slate-800/30 transition-colors">
                                      <td className="p-4 max-w-[180px]">
                                        {chInfo.title ? (
                                          <>
                                            <div
                                              onClick={() => navigate(`/project/${chInfo.short_id}`)}
                                              className="font-bold text-white truncate cursor-pointer hover:text-indigo-300 transition-colors"
                                              title={chInfo.title}
                                            >
                                              {chInfo.title}
                                            </div>
                                            <div className="font-mono text-[10px] text-amber-400 mt-0.5">{chInfo.short_id}</div>
                                          </>
                                        ) : (
                                          <span className="text-slate-500 italic text-[11px] font-mono">{String(req.challenge_id).slice(0, 8)}...</span>
                                        )}
                                      </td>
                                      <td className="p-4">
                                        {chInfo.university_name ? (
                                          <span className="font-semibold text-indigo-300">{chInfo.university_name}</span>
                                        ) : (
                                          <span className="text-slate-500 italic text-[11px]">—</span>
                                        )}
                                      </td>
                                      <td className="p-4">
                                        <div className="font-bold text-white">{req.company_name}</div>
                                        <div className="text-[10px] text-slate-500 mt-0.5">{req.contact_email}</div>
                                      </td>
                                      <td className="p-4">
                                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border whitespace-nowrap ${
                                          req.status === 'INTEREST_EXPRESSED'        ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' :
                                          req.status === 'PROPOSAL_INITIATED'        ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
                                          req.status === 'PROPOSAL_UNDER_DISCUSSION' ? 'bg-orange-500/20 text-orange-300 border-orange-500/30' :
                                          req.status === 'SUPPORT_CONFIRMED'         ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                                          req.status === 'FUNDING_CONFIRMED'         ? 'bg-teal-500/20 text-teal-300 border-teal-500/30' :
                                          req.status === 'PROJECT_FUNDED'            ? 'bg-green-500/20 text-green-300 border-green-500/30' :
                                          req.status === 'DECLINED'                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' :
                                          'bg-slate-700 text-slate-400 border-slate-600'
                                        }`}>
                                          {req.status?.replace(/_/g, ' ')}
                                        </span>
                                      </td>
                                      <td className="p-4 text-slate-200">{req.support_type || '—'}</td>
                                      <td className="p-4 font-bold text-emerald-400">{req.pledged_amount || '—'}</td>
                                      <td className="p-4 text-slate-400 whitespace-nowrap">
                                        {req.created_at ? new Date(req.created_at).toLocaleDateString() : '—'}
                                      </td>
                                      <td className="p-4 text-slate-400 whitespace-nowrap">
                                        {req.confirmed_at ? (
                                          <span className="text-emerald-400 font-semibold">{new Date(req.confirmed_at).toLocaleDateString()}</span>
                                        ) : '—'}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}

              </motion.div>
            )}

            {/* TAB 3: Governance Audit Log */}
            {activeTab === 'audit' && (
              <motion.div key="audit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                <div>
                  <h3 className="text-lg font-black text-white">State Administrative Audit Log</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Immutable audit trail of state executive approvals, rejections, AI overrides, and university allocations in PostgreSQL.</p>
                </div>

                <div className="rounded-3xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-2xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-300">
                      <thead className="bg-slate-950 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-800">
                        <tr>
                          <th className="p-4">Timestamp</th>
                          <th className="p-4">Action Type</th>
                          <th className="p-4">Entity ID</th>
                          <th className="p-4">Actor ID</th>
                          <th className="p-4">Justification / Reason</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {auditLogs.map(log => (
                          <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                            <td className="p-4 font-mono text-[11px] text-slate-400">{log.created_at ? new Date(log.created_at).toLocaleString() : 'N/A'}</td>
                            <td className="p-4">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                log.action_type === 'APPROVE_CHALLENGE' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
                                log.action_type === 'REJECT_CHALLENGE' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
                                log.action_type === 'OVERRIDE_AI' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40' :
                                'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              }`}>
                                {log.action_type}
                              </span>
                            </td>
                            <td className="p-4 font-mono font-bold text-white">{log.entity_id}</td>
                            <td className="p-4 font-mono text-[10px] text-slate-400 truncate max-w-[120px]">{log.actor_id}</td>
                            <td className="p-4 text-slate-300">{log.reason || 'State Nodal Action'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </main>

      {/* ── MODALS FOR GOVERNANCE ACTIONS ────────────────────────────── */}
      {reviewChallenge && actionModalType && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-2xl w-full space-y-5 shadow-2xl text-left max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-amber-400" />
                <span>
                  {actionModalType === 'approve_assign' && `1-Step Approve & Assign — #${reviewChallenge.short_id || reviewChallenge.id}`}
                  {actionModalType === 'reject' && 'Reject Challenge'}
                  {actionModalType === 'override' && 'Override AI Analysis Parameters'}
                  {actionModalType === 'detail' && `Admin Inspection — #${reviewChallenge.short_id || reviewChallenge.id}`}
                </span>
              </h3>
              <button onClick={() => { setActionModalType(null); setReviewChallenge(null); }} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 1-STEP APPROVE & ASSIGN MODAL (SHOWING 3 AI PREDICTED UNIVERSITIES) */}
            {actionModalType === 'approve_assign' && (
              <div className="space-y-5 text-xs text-slate-300">
                <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Select any of the 3 AI-recommended universities below for immediate 1-step Approve &amp; Assign to PostgreSQL.</span>
                </div>

                {/* Challenge Summary */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Challenge Title</span>
                  <h4 className="text-sm font-bold text-white">{reviewChallenge.title}</h4>
                  <p className="text-xs text-slate-400">{reviewChallenge.block_locality} ({reviewChallenge.district_id} District) • Category: {reviewChallenge.category}</p>
                </div>

                {/* Top 3 AI Predicted Universities */}
                {reviewChallenge.ai_prediction?.recommended_universities?.length > 0 ? (
                  <div className="space-y-3">
                    <span className="text-[11px] font-black text-amber-400 uppercase tracking-wider block flex items-center gap-1.5">
                      <GraduationCap className="w-4 h-4" />
                      <span>Top 3 AI Predicted Universities (Ranked Matches)</span>
                    </span>

                    <div className="space-y-3">
                      {reviewChallenge.ai_prediction.recommended_universities.slice(0, 3).map((rec, idx) => {
                        const univObj = universitiesList.find(u => u.name === rec.university_name || u.short_name === rec.university_name || u.id === rec.university_id) || { id: rec.university_id || `univ-${idx}`, name: rec.university_name };

                        return (
                          <div key={idx} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-indigo-500/50 transition-all">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-extrabold border border-amber-500/30">
                                  Rank #{idx + 1} Recommendation
                                </span>
                                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold border border-emerald-500/30">
                                  {rec.match_score}% AI Match
                                </span>
                              </div>
                              <h5 className="text-sm font-bold text-white">{rec.university_name}</h5>
                              <p className="text-[11px] text-slate-400 leading-relaxed">{rec.explanation || 'High domain expertise and geographic proximity alignment.'}</p>
                            </div>

                            <button
                              onClick={() => handleApproveAndAssign(univObj.id || rec.university_id || 'bit-mesra', rec.university_name)}
                              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs shadow-md flex items-center gap-1.5 shrink-0"
                            >
                              <CheckCircle className="w-4 h-4" />
                              <span>Approve &amp; Assign</span>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-slate-400 text-xs">
                    No explicit AI recommendations recorded. Select an institution from the full state dropdown below.
                  </div>
                )}

                {/* Custom University Selection Dropdown */}
                <div className="pt-3 border-t border-slate-800 space-y-3">
                  <label className="block text-slate-300 font-bold uppercase text-[10px]">Or Select Any Other Authentic Jharkhand Institution</label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <select
                      value={selectedUnivId}
                      onChange={e => setSelectedUnivId(e.target.value)}
                      className="flex-1 px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                    >
                      <option value="">Choose State University...</option>
                      {universitiesList.map(u => (
                        <option key={u.id} value={u.id}>{u.name} ({u.short_name || u.name})</option>
                      ))}
                    </select>

                    <button
                      onClick={() => {
                        const match = universitiesList.find(u => u.id === selectedUnivId);
                        handleApproveAndAssign(selectedUnivId, match?.name || 'Selected Institution');
                      }}
                      disabled={!selectedUnivId}
                      className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs disabled:opacity-50 shrink-0"
                    >
                      Assign Selected
                    </button>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                  <button onClick={() => setActionModalType(null)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold">Cancel</button>
                </div>
              </div>
            )}

            {/* DETAIL INSPECTION MODAL */}
            {actionModalType === 'detail' && (
              <div className="space-y-4 text-xs text-slate-300">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <h4 className="text-sm font-bold text-white">{reviewChallenge.title}</h4>
                  <p className="text-xs text-slate-300">{reviewChallenge.description}</p>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                  <button onClick={() => setActionModalType(null)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold">Close</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
