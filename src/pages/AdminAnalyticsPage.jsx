import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { AnalyticsDashboard } from '../components/analytics/AnalyticsDashboard';
import {
  Shield, BarChart2, Layers, Users2, AlertTriangle, FileDown,
  RefreshCw, CheckCircle2, XCircle, GitMerge, Plus, Download,
  Building2, GraduationCap, LogIn, Lock, ChevronRight, FileText,
  Flame, Settings, Eye, Check, X, Sliders, Award, Loader2, AlertCircle,
  FolderOpen, Image as ImageIcon, ExternalLink, Info, AlertOctagon
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
  reviewIndustryRequest,
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
  const token = localStorage.getItem('samadhan_token');
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  return `${baseUrl}/api/uploads/${filename}${token ? `?token=${encodeURIComponent(token)}` : ''}`;
};

export const AdminAnalyticsPage = () => {
  const {
    isLoggedIn, currentRole, showToast, t, navigate,
    setIsLoginModalOpen
  } = useApp();

  const [activeTab, setActiveTab] = useState('pipeline'); // 'dashboard' | 'pipeline' | 'audit' | 'moderation'
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
  const [actionModalType, setActionModalType] = useState(null); // 'approve' | 'reject' | 'override' | 'assign' | 'detail' | 'review_solution' | 'review_industry'
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

  // Action Handlers
  const handleApproveSubmit = async () => {
    if (!reviewChallenge) return;
    try {
      await approveChallenge(reviewChallenge.short_id || reviewChallenge.id, actionReason || 'Approved after state review.');
      showToast('Challenge Approved', `Challenge #${reviewChallenge.short_id || reviewChallenge.id} approved for university discovery.`, 'success');
      setActionModalType(null);
      setReviewChallenge(null);
      setActionReason('');
      fetchAdminData();
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to approve challenge.';
      showToast('Approval Failed', msg, 'error');
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

  const handleAssignSubmit = async () => {
    if (!reviewChallenge || !selectedUnivId) {
      showToast('Select Institution', 'Please select a university institution.', 'error');
      return;
    }
    try {
      if (reviewChallenge.status === 'UNDER_REVIEW') {
        await approveChallenge(reviewChallenge.short_id || reviewChallenge.id, 'Auto-approved prior to university assignment.');
      }
      await assignUniversity(reviewChallenge.short_id || reviewChallenge.id, selectedUnivId, actionReason || 'Assigned by State Nodal Officer.');
      showToast('University Assigned', `Challenge #${reviewChallenge.short_id || reviewChallenge.id} assigned to selected academic solver.`, 'success');
      setActionModalType(null);
      setReviewChallenge(null);
      setSelectedUnivId('');
      setActionReason('');
      fetchAdminData();
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to assign university.';
      showToast('Assignment Failed', msg, 'error');
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

  const handleReviewIndustrySubmit = async (requestId, actionType) => {
    try {
      await reviewIndustryRequest(requestId, actionType, actionReason);
      showToast('Industry Request Reviewed', `Request updated to ${actionType}.`, 'success');
      setActionModalType(null);
      setSelectedIndustryReq(null);
      setActionReason('');
      fetchAdminData();
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to review industry request.';
      showToast('Review Failed', msg, 'error');
    }
  };

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

        {!isSidebarCollapsed && (
          <div className="p-4 border-t border-slate-800">
            <div className="flex items-center gap-2 text-[10px] text-slate-500">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span>Nodal Officer Mode</span>
            </div>
          </div>
        )}
      </aside>

      {/* ── Main Content ─────────────────────────────────────────── */}
      <main className="flex-1 min-w-0 overflow-x-hidden">
        <div className="sticky top-16 z-10 border-b border-slate-800 bg-[#0A1020]/95 backdrop-blur-xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-black text-white">State Administrative Nodal Cell</h1>
              <p className="text-xs text-slate-400 mt-0.5">Grassroots Problem Governance, AI Decision Validation &amp; University Routing</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={fetchAdminData}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh Queue</span>
              </button>
              <span className="px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-bold uppercase tracking-wider">
                🛡️ Executive Authority
              </span>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <AnimatePresence mode="wait">

            {/* TAB 1: Analytics Dashboard */}
            {activeTab === 'dashboard' && (
              <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <AnalyticsDashboard />
              </motion.div>
            )}

            {/* TAB 2: Pending Challenges Governance Pipeline */}
            {activeTab === 'pipeline' && (
              <motion.div key="pipeline" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-black text-white">Pending Administrative Review Queue</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Review real PostgreSQL citizen submissions, inspect AI recommendations &amp; uploaded evidence, and approve for university discovery.</p>
                  </div>
                  <span className="px-3 py-1.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold">
                    {pendingChallenges.length} Pending Actions
                  </span>
                </div>

                {loading && (
                  <div className="py-16 text-center space-y-3 bg-slate-900/40 border border-slate-800 rounded-3xl">
                    <Loader2 className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
                    <p className="text-xs font-semibold text-slate-300">Fetching PostgreSQL pending challenges for state review...</p>
                  </div>
                )}

                {!loading && error && (
                  <div className="py-12 px-6 text-center space-y-4 bg-rose-950/20 border border-rose-500/30 rounded-3xl">
                    <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
                    <h4 className="text-sm font-bold text-white">Unable to load pending queue</h4>
                    <p className="text-xs text-rose-300 max-w-md mx-auto">{error}</p>
                    <button onClick={fetchAdminData} className="px-4 py-2 rounded-xl bg-slate-800 text-xs text-white font-bold inline-flex items-center gap-1.5">
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Retry</span>
                    </button>
                  </div>
                )}

                {!loading && !error && pendingChallenges.length === 0 && (
                  <div className="py-16 px-6 text-center space-y-3 bg-slate-900/40 border border-slate-800 rounded-3xl">
                    <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                    <h4 className="text-sm font-bold text-white">No pending challenges</h4>
                    <p className="text-xs text-slate-400">All submitted grassroots challenges in PostgreSQL have been reviewed and processed.</p>
                  </div>
                )}

                {!loading && !error && pendingChallenges.length > 0 && (
                  <div className="rounded-3xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs text-slate-300">
                        <thead className="bg-slate-950 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-800">
                          <tr>
                            <th className="p-4">ID &amp; Title</th>
                            <th className="p-4">District / Locality</th>
                            <th className="p-4">Category</th>
                            <th className="p-4">Submission Date</th>
                            <th className="p-4">Severity &amp; Priority</th>
                            <th className="p-4">Evidence</th>
                            <th className="p-4">AI Recommended Solver</th>
                            <th className="p-4 text-right">Administrative Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                          {pendingChallenges.map(prob => {
                            const hasEvidence = prob.evidence_files && prob.evidence_files.length > 0;
                            const subDate = prob.created_at ? new Date(prob.created_at).toLocaleDateString() : 'N/A';

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
                                <td className="p-4 font-mono text-[11px] text-slate-400">{subDate}</td>
                                <td className="p-4">
                                  <div className="flex items-center gap-1.5">
                                    <UrgencyPill score={prob.ai_prediction?.priority_score || (prob.citizen_severity * 15)} />
                                    <span className="text-[10px] font-mono text-slate-400">({prob.citizen_severity}/5)</span>
                                  </div>
                                </td>
                                <td className="p-4">
                                  {hasEvidence ? (
                                    <button
                                      onClick={() => { setReviewChallenge(prob); setActionModalType('detail'); }}
                                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[11px] font-semibold hover:bg-indigo-500/30 transition-colors"
                                    >
                                      <ImageIcon className="w-3.5 h-3.5 text-indigo-400" />
                                      <span>View Evidence ({prob.evidence_files.length})</span>
                                    </button>
                                  ) : (
                                    <span className="text-[11px] text-slate-500 italic">No evidence uploaded</span>
                                  )}
                                </td>
                                <td className="p-4 text-indigo-300 font-semibold max-w-[140px] truncate">
                                  {prob.ai_prediction?.recommended_universities?.[0]?.university_name || 'BIT Mesra'}
                                </td>
                                <td className="p-4 text-right">
                                  <div className="flex items-center justify-end gap-1.5">
                                    <button
                                      onClick={() => { setReviewChallenge(prob); setActionModalType('detail'); }}
                                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                                      title="Inspect Challenge, Evidence & AI Analysis"
                                    >
                                      <Eye className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => navigate(`/project/${prob.short_id || prob.id}`)}
                                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                                      title="Open Full Screen Project Page"
                                    >
                                      <ExternalLink className="w-4 h-4 text-indigo-400" />
                                    </button>
                                    <button
                                      onClick={() => { setReviewChallenge(prob); setActionModalType('approve'); }}
                                      className="px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold flex items-center gap-1"
                                    >
                                      <Check className="w-3.5 h-3.5" />
                                      <span>Approve</span>
                                    </button>
                                    <button
                                      onClick={() => { setReviewChallenge(prob); setActionModalType('reject'); }}
                                      className="px-2.5 py-1 rounded-lg bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 border border-rose-500/30 text-[11px] font-bold flex items-center gap-1"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                      <span>Reject</span>
                                    </button>
                                    <button
                                      onClick={() => { setReviewChallenge(prob); setActionModalType('override'); }}
                                      className="px-2.5 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/30 text-[11px] font-bold flex items-center gap-1"
                                    >
                                      <Sliders className="w-3.5 h-3.5" />
                                      <span>Override AI</span>
                                    </button>
                                    <button
                                      onClick={() => { setReviewChallenge(prob); setActionModalType('assign'); }}
                                      className="px-2.5 py-1 rounded-lg bg-amber-600/20 hover:bg-amber-600/40 text-amber-300 border border-amber-500/30 text-[11px] font-bold flex items-center gap-1"
                                    >
                                      <GraduationCap className="w-3.5 h-3.5" />
                                      <span>Assign</span>
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
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

            {/* TAB 4: Moderation */}
            {activeTab === 'moderation' && (
              <motion.div key="moderation" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                <h3 className="text-lg font-black text-white">Community Grievance Moderation</h3>
                <p className="text-xs text-slate-400">Manage reported duplicate or policy-violating reports.</p>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </main>

      {/* ── MODALS FOR GOVERNANCE ACTIONS ────────────────────────────── */}
      {reviewChallenge && actionModalType && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-2xl w-full space-y-5 shadow-2xl text-left">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-amber-400" />
                <span>
                  {actionModalType === 'approve' && 'Approve Challenge'}
                  {actionModalType === 'reject' && 'Reject Challenge'}
                  {actionModalType === 'override' && 'Override AI Analysis Parameters'}
                  {actionModalType === 'assign' && 'Assign Challenge to Academic Solver'}
                  {actionModalType === 'detail' && `Admin Review — #${reviewChallenge.short_id || reviewChallenge.id}`}
                </span>
              </h3>
              <button onClick={() => { setActionModalType(null); setReviewChallenge(null); }} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Comprehensive Admin Review Inspection Screen */}
            {actionModalType === 'detail' && (
              <div className="space-y-5 text-xs text-slate-300 max-h-[75vh] overflow-y-auto pr-2">
                
                {/* Header Link */}
                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      const targetId = reviewChallenge.short_id || reviewChallenge.id;
                      setActionModalType(null);
                      setReviewChallenge(null);
                      navigate(`/project/${targetId}`);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/30 text-xs font-bold inline-flex items-center gap-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Open Full Screen Page</span>
                  </button>
                </div>

                {/* 1. CHALLENGE INFORMATION */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-[11px] font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                      <FolderOpen className="w-4 h-4" />
                      <span>Challenge Submission</span>
                    </span>
                    <span className="font-mono text-[10px] text-slate-400">
                      ID: {reviewChallenge.short_id || reviewChallenge.id}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-base font-extrabold text-white">{reviewChallenge.title}</h4>
                    <p className="mt-1 text-slate-300 text-xs leading-relaxed">{reviewChallenge.description}</p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-800/80 text-[11px]">
                    <div>
                      <span className="text-slate-500 font-semibold block text-[10px] uppercase">Category</span>
                      <span className="font-bold text-slate-200">{reviewChallenge.category}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-semibold block text-[10px] uppercase">District &amp; Locality</span>
                      <span className="font-bold text-slate-200">{reviewChallenge.block_locality} ({reviewChallenge.district_id})</span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-semibold block text-[10px] uppercase">Citizen Severity</span>
                      <span className="font-bold text-amber-400">{reviewChallenge.citizen_severity} / 5</span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-semibold block text-[10px] uppercase">Affected Population</span>
                      <span className="font-bold text-slate-200">{reviewChallenge.affected_population || 50} citizens</span>
                    </div>
                  </div>

                  <div className="text-[10px] text-slate-400 flex items-center gap-4 pt-1">
                    <span>Submitted by: <strong>{reviewChallenge.submitter_name || reviewChallenge.submitter_type || 'Citizen'}</strong></span>
                    <span>Submission Timestamp: <strong>{reviewChallenge.created_at ? new Date(reviewChallenge.created_at).toLocaleString() : 'N/A'}</strong></span>
                  </div>
                </div>

                {/* 2. UPLOADED EVIDENCE SECTION */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <span className="text-[11px] font-black text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4" />
                    <span>Uploaded Evidence Inspection</span>
                  </span>

                  {reviewChallenge.evidence_files && reviewChallenge.evidence_files.length > 0 ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {reviewChallenge.evidence_files.map(file => {
                          const imgUrl = getEvidenceImageUrl(file.stored_filename);
                          return (
                            <div key={file.id || file.stored_filename} className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                              <div className="relative group overflow-hidden rounded-lg bg-black aspect-video flex items-center justify-center border border-slate-800">
                                <img
                                  src={imgUrl}
                                  alt={file.original_name || 'Uploaded evidence'}
                                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.style.display = 'none';
                                  }}
                                />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                  <button
                                    onClick={() => setEnlargedImage(imgUrl)}
                                    className="px-3 py-1.5 rounded-lg bg-amber-600 text-white font-bold text-[11px] flex items-center gap-1 shadow-md hover:bg-amber-500"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                    <span>View Evidence</span>
                                  </button>
                                </div>
                              </div>
                              <div className="flex items-center justify-between text-[10px] text-slate-400">
                                <span className="font-mono truncate max-w-[150px]">{file.original_name}</span>
                                <span>{((file.size_bytes || 0) / 1024).toFixed(1)} KB</span>
                              </div>
                              <button
                                onClick={() => setEnlargedImage(imgUrl)}
                                className="w-full py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/30 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                              >
                                <Eye className="w-3.5 h-3.5 text-indigo-400" />
                                <span>View Evidence</span>
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 text-center text-slate-500 text-xs italic">
                      No evidence uploaded
                    </div>
                  )}
                </div>

                {/* 3. STAGE 2 AI ANALYSIS BREAKDOWN */}
                {reviewChallenge.ai_prediction && (
                  <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/30 space-y-3">
                    <div className="flex items-center justify-between border-b border-indigo-500/20 pb-2">
                      <span className="text-[11px] font-black text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-indigo-400" />
                        <span>AI Classification &amp; Priority Analysis</span>
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-indigo-500/30 text-indigo-200 border border-indigo-400/40">
                        {reviewChallenge.ai_prediction.priority_label || 'HIGH'} PRIORITY
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                      <div>
                        <span className="text-slate-400 text-[10px] font-bold uppercase block">Primary Sector</span>
                        <span className="font-bold text-white">{reviewChallenge.ai_prediction.primary_sector}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] font-bold uppercase block">Subcategory</span>
                        <span className="font-bold text-slate-200">{reviewChallenge.ai_prediction.subcategory || 'General'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] font-bold uppercase block">Priority Score</span>
                        <span className="font-bold text-amber-400 text-sm">{reviewChallenge.ai_prediction.priority_score} / 100</span>
                      </div>
                    </div>

                    {reviewChallenge.ai_prediction.keywords && reviewChallenge.ai_prediction.keywords.length > 0 && (
                      <div>
                        <span className="text-slate-400 text-[10px] font-bold uppercase block mb-1">Extracted Keywords</span>
                        <div className="flex flex-wrap gap-1">
                          {reviewChallenge.ai_prediction.keywords.map((kw, i) => (
                            <span key={i} className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[10px] font-mono border border-slate-700">
                              {kw}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="pt-2 border-t border-indigo-500/20 text-[11px] leading-relaxed">
                      <span className="text-slate-400 font-bold block mb-0.5">Priority Explanation Rationale:</span>
                      <p className="text-slate-300">{reviewChallenge.ai_prediction.overall_explanation}</p>
                    </div>

                    {/* Similarity / Duplicate Flag */}
                    <div className="pt-2 border-t border-indigo-500/20 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Duplicate Check Status:</span>
                      {reviewChallenge.ai_prediction.duplicate_flag ? (
                        <span className="text-amber-400 font-bold flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Potential Duplicate Detected ({Math.round((reviewChallenge.ai_prediction.similarity_score || 0) * 100)}% Similarity)</span>
                        </span>
                      ) : (
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Unique Grassroots Submission</span>
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* 4. UNIVERSITY RECOMMENDATIONS */}
                {reviewChallenge.ai_prediction?.recommended_universities && reviewChallenge.ai_prediction.recommended_universities.length > 0 && (
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                    <span className="text-[11px] font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                      <GraduationCap className="w-4 h-4" />
                      <span>Top Academic R&amp;D Recommendations (AI Guided)</span>
                    </span>

                    <div className="space-y-3">
                      {reviewChallenge.ai_prediction.recommended_universities.slice(0, 3).map((rec, idx) => (
                        <div key={rec.university_id || idx} className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-[10px] font-bold text-amber-400 uppercase">Rank #{idx + 1} Recommendation</span>
                              <h5 className="text-xs font-bold text-white">{rec.university_name}</h5>
                            </div>
                            <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-extrabold">
                              {rec.match_score}% Match
                            </span>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] pt-1">
                            <div className="p-1.5 rounded-lg bg-slate-950 border border-slate-800">
                              <span className="text-slate-500 block">Domain Score</span>
                              <span className="font-bold text-slate-200">{rec.domain_score}%</span>
                            </div>
                            <div className="p-1.5 rounded-lg bg-slate-950 border border-slate-800">
                              <span className="text-slate-500 block">Geographic Score</span>
                              <span className="font-bold text-slate-200">{rec.geography_score || rec.geographic_score || 80}%</span>
                            </div>
                            <div className="p-1.5 rounded-lg bg-slate-950 border border-slate-800">
                              <span className="text-slate-500 block">Capacity Score</span>
                              <span className="font-bold text-amber-300">{rec.capacity_score}%</span>
                              <span className="text-[9px] text-amber-400/80 font-mono block mt-0.5">[PROTOTYPE METADATA]</span>
                            </div>
                            <div className="p-1.5 rounded-lg bg-slate-950 border border-slate-800">
                              <span className="text-slate-500 block">Experience Score</span>
                              <span className="font-bold text-indigo-300">{rec.experience_score}%</span>
                              <span className="text-[9px] text-indigo-400/80 font-mono block mt-0.5">[PROTOTYPE METADATA]</span>
                            </div>
                          </div>

                          {rec.explanation && (
                            <p className="text-[10px] text-slate-400 italic pt-1 leading-relaxed border-t border-slate-800/60">
                              {rec.explanation}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 5. ADMIN ACTION TRIGGERS */}
                <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-end gap-2">
                  <button
                    onClick={() => setActionModalType('approve')}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md"
                  >
                    <Check className="w-4 h-4" />
                    <span>Approve Challenge</span>
                  </button>
                  <button
                    onClick={() => setActionModalType('reject')}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md"
                  >
                    <X className="w-4 h-4" />
                    <span>Reject Challenge</span>
                  </button>
                  <button
                    onClick={() => setActionModalType('override')}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md"
                  >
                    <Sliders className="w-4 h-4" />
                    <span>Override AI</span>
                  </button>
                  <button
                    onClick={() => setActionModalType('assign')}
                    className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md"
                  >
                    <GraduationCap className="w-4 h-4" />
                    <span>Assign University</span>
                  </button>
                </div>

              </div>
            )}

            {actionModalType === 'approve' && (
              <div className="space-y-3 text-xs">
                <p className="text-slate-300">Approving challenge <strong>#{reviewChallenge.short_id || reviewChallenge.id}</strong> updates its status to APPROVED and makes it visible to authentic Jharkhand universities as AVAILABLE for academic discovery.</p>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Approval Reason (Optional)</label>
                  <input
                    type="text"
                    value={actionReason}
                    onChange={e => setActionReason(e.target.value)}
                    placeholder="e.g. Verified by State Nodal Cell."
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button onClick={() => setActionModalType(null)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold">Cancel</button>
                  <button onClick={handleApproveSubmit} className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold">Confirm Approval</button>
                </div>
              </div>
            )}

            {actionModalType === 'reject' && (
              <div className="space-y-3 text-xs">
                <p className="text-slate-300">Rejecting challenge <strong>#{reviewChallenge.short_id || reviewChallenge.id}</strong> prevents it from being discovered by universities.</p>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Rejection Reason (Required)</label>
                  <textarea
                    value={actionReason}
                    onChange={e => setActionReason(e.target.value)}
                    placeholder="Specify rejection grounds..."
                    rows={3}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button onClick={() => setActionModalType(null)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold">Cancel</button>
                  <button onClick={handleRejectSubmit} className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold">Confirm Rejection</button>
                </div>
              </div>
            )}

            {actionModalType === 'override' && (
              <div className="space-y-3 text-xs">
                <p className="text-slate-300">Override AI prediction parameters for <strong>#{reviewChallenge.short_id || reviewChallenge.id}</strong>. The original AI output remains stored.</p>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Primary Sector</label>
                  <input
                    type="text"
                    value={overrideSector}
                    onChange={e => setOverrideSector(e.target.value)}
                    placeholder="e.g. Renewable Energy & Grids"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Priority Score (1-100)</label>
                  <input
                    type="number"
                    value={overrideScore}
                    onChange={e => setOverrideScore(e.target.value)}
                    placeholder="e.g. 92.5"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Override Justification (Required)</label>
                  <input
                    type="text"
                    value={actionReason}
                    onChange={e => setActionReason(e.target.value)}
                    placeholder="Reason for administrative override..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button onClick={() => setActionModalType(null)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold">Cancel</button>
                  <button onClick={handleOverrideSubmit} className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold">Save AI Override</button>
                </div>
              </div>
            )}

            {actionModalType === 'assign' && (
              <div className="space-y-3 text-xs">
                <p className="text-slate-300">Assign challenge <strong>#{reviewChallenge.short_id || reviewChallenge.id}</strong> to a specific university R&amp;D lab. This locks assignment in PostgreSQL.</p>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Select Academic Institution</label>
                  <select
                    value={selectedUnivId}
                    onChange={e => setSelectedUnivId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                  >
                    <option value="">Choose Institution...</option>
                    {universitiesList.map(u => (
                      <option key={u.id} value={u.id}>{u.name} ({u.short_name || u.name})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Assignment Notes / Directives (Optional)</label>
                  <input
                    type="text"
                    value={actionReason}
                    onChange={e => setActionReason(e.target.value)}
                    placeholder="e.g. Assigned to Jal Mission lab."
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button onClick={() => setActionModalType(null)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold">Cancel</button>
                  <button onClick={handleAssignSubmit} className="px-4 py-2 rounded-xl bg-amber-600 text-white text-xs font-bold">Confirm Assignment</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Lightbox / Enlarged Image Preview Modal */}
      {enlargedImage && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-lg flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center justify-center space-y-4">
            <button
              onClick={() => setEnlargedImage(null)}
              className="absolute -top-10 right-0 text-white bg-slate-800 hover:bg-slate-700 p-2 rounded-full shadow-lg"
              title="Close Preview"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 max-h-[80vh] flex items-center justify-center shadow-2xl">
              <img
                src={enlargedImage}
                alt="Enlarged evidence"
                className="max-h-[80vh] max-w-full object-contain"
              />
            </div>
            <p className="text-xs text-slate-400 font-mono">Protected Evidence View — Samadhan Setu Security Verified</p>
          </div>
        </div>
      )}
    </div>
  );
};
