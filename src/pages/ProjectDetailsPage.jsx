import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ArrowLeft, Heart, MapPin, Building2, GraduationCap, 
  Sparkles, FileText, CheckCircle2, Award, Clock, ShieldCheck, 
  Users, GitMerge, Share2, Download, HandCoins, Loader2, AlertCircle, RefreshCw, ExternalLink,
  Eye, Check, X, Sliders, Image as ImageIcon, Shield, Play, Send, MessageSquare
} from 'lucide-react';
import { CategoryBadge, StatusBadge, UrgencyPill } from '../components/common/Badge';
import { ProjectTimeline } from '../components/lifecycle/ProjectTimeline';
import { DiscussionThread } from '../components/lifecycle/DiscussionThread';
import { ExpressInterestModal } from '../components/industry/ExpressInterestModal';
import { getChallengeDetail } from '../services/challengeService';
import { startProject, submitSolution, postProgressUpdate } from '../services/universityService';
import { approveChallenge, rejectChallenge, overrideAi, assignUniversity, reviewSolution, getAdminUniversities } from '../services/adminService';

const getEvidenceImageUrl = (filename) => {
  if (!filename) return '';
  const token = localStorage.getItem('samadhan_token');
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  return `${baseUrl}/api/uploads/${filename}${token ? `?token=${encodeURIComponent(token)}` : ''}`;
};

export const ProjectDetailsPage = ({ problemId }) => {
  const { toggleUpvote, navigate, navigateBack, currentRole, showToast } = useApp();

  const [isInterestModalOpen, setIsInterestModalOpen] = useState(false);
  const [enlargedImage, setEnlargedImage] = useState(null);

  // Extract ID from prop or URL hash
  const activeId = problemId || window.location.hash.split('/project/')[1] || '';

  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Action Modals & Form State
  const [actionModal, setActionModal] = useState(null); // 'approve' | 'reject' | 'override' | 'assign' | 'solution' | 'progress' | 'review_solution'
  const [actionReason, setActionReason] = useState('');
  const [selectedUnivId, setSelectedUnivId] = useState('');
  const [overrideSector, setOverrideSector] = useState('');
  const [overrideScore, setOverrideScore] = useState('');
  const [universitiesList, setUniversitiesList] = useState([]);

  // Solution Form
  const [solutionTitle, setSolutionTitle] = useState('');
  const [solutionDesc, setSolutionDesc] = useState('');
  const [solutionUrl, setSolutionUrl] = useState('');
  const [solutionTech, setSolutionTech] = useState('');

  // Progress Form
  const [progressTitle, setProgressTitle] = useState('');
  const [progressDesc, setProgressDesc] = useState('');
  const [progressPercent, setProgressPercent] = useState(25);

  const loadDetail = () => {
    if (!activeId) {
      setError('No project ID provided.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    getChallengeDetail(activeId)
      .then((apiData) => {
        if (!apiData) {
          setError(`Challenge with ID "${activeId}" was not found.`);
          return;
        }

        const distName = apiData.district_id 
          ? apiData.district_id.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
          : 'Jharkhand';

        const isUnderReview = apiData.status === 'UNDER_REVIEW';

        const mapped = {
          id: apiData.short_id || apiData.id,
          rawId: apiData.id,
          title: apiData.title || 'Untitled Challenge',
          description: apiData.description || 'No description provided.',
          category: apiData.category || 'General',
          subcategory: apiData.subcategory,
          districtId: apiData.district_id || 'JH',
          districtName: distName,
          location: apiData.block_locality || 'Block / Locality',
          citizen_severity: apiData.citizen_severity || 3,
          affectedPopulation: apiData.affected_population || 50,
          urgencyScore: apiData.ai_prediction?.priority_score || ((apiData.citizen_severity || 3) * 15),
          priorityLabel: apiData.ai_prediction?.priority_label || 'HIGH',
          status: isUnderReview ? 'Under Review' : apiData.status,
          rawStatus: apiData.status,
          submitterType: apiData.submitter_type || 'Individual Citizen',
          submitterName: apiData.submitter_name || 'Citizen Advocate',
          submittedAt: apiData.created_at ? new Date(apiData.created_at).toLocaleString() : 'Recent Submission',
          created_at: apiData.created_at,
          upvotes: 1,
          hasUpvoted: false,
          comments: [],
          duplicateCount: apiData.ai_prediction?.similar_challenge_ids?.length || 0,
          aiPrediction: apiData.ai_prediction || null,
          evidenceFiles: apiData.evidence_files || [],
          assignment: apiData.assignment || null,
          assignedUniversity: (apiData.assignment?.university_name || apiData.assigned_university_name) ? {
            name: apiData.assignment?.university_name || apiData.assigned_university_name
          } : null,
          solutionSubmission: apiData.solution_submission || null,
          progressUpdates: apiData.progress_updates || [],
          industryInterests: apiData.industry_interests || [],
          isRealDatabaseRecord: true
        };

        setProblem(mapped);
      })
      .catch((err) => {
        const msg = err.response?.data?.detail || `Unable to load challenge details for ID "${activeId}".`;
        setError(msg);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadDetail();
    if (currentRole === 'admin') {
      getAdminUniversities().then(setUniversitiesList).catch(() => {});
    }
  }, [activeId, currentRole]);

  // Action Handlers
  const handleApprove = async () => {
    try {
      await approveChallenge(problem.rawId || problem.id, actionReason || 'Approved after review.');
      showToast('Challenge Approved', `Challenge #${problem.id} approved for university discovery.`, 'success');
      setActionModal(null);
      loadDetail();
    } catch (err) {
      showToast('Approval Failed', err.response?.data?.detail || 'Failed to approve.', 'error');
    }
  };

  const handleReject = async () => {
    if (!actionReason.trim()) {
      showToast('Reason Required', 'Please provide a rejection reason.', 'error');
      return;
    }
    try {
      await rejectChallenge(problem.rawId || problem.id, actionReason);
      showToast('Challenge Rejected', `Challenge #${problem.id} rejected.`, 'info');
      setActionModal(null);
      loadDetail();
    } catch (err) {
      showToast('Rejection Failed', err.response?.data?.detail || 'Failed to reject.', 'error');
    }
  };

  const handleOverride = async () => {
    if (!actionReason.trim()) {
      showToast('Reason Required', 'Please enter justification for AI override.', 'error');
      return;
    }
    try {
      await overrideAi(problem.rawId || problem.id, {
        primary_sector: overrideSector || undefined,
        priority_score: overrideScore ? parseFloat(overrideScore) : undefined,
        reason: actionReason
      });
      showToast('AI Overridden', `Admin final decision recorded for #${problem.id}.`, 'success');
      setActionModal(null);
      loadDetail();
    } catch (err) {
      showToast('Override Failed', err.response?.data?.detail || 'Failed to override AI.', 'error');
    }
  };

  const handleAssign = async () => {
    if (!selectedUnivId) {
      showToast('Select Institution', 'Please select a university institution.', 'error');
      return;
    }
    try {
      if (problem.rawStatus === 'UNDER_REVIEW') {
        await approveChallenge(problem.rawId || problem.id, 'Auto-approved prior to assignment.');
      }
      await assignUniversity(problem.rawId || problem.id, selectedUnivId, actionReason || 'Assigned by State Admin.');
      showToast('University Assigned', `Challenge #${problem.id} assigned.`, 'success');
      setActionModal(null);
      loadDetail();
    } catch (err) {
      showToast('Assignment Failed', err.response?.data?.detail || 'Failed to assign.', 'error');
    }
  };

  const handleStartProject = async () => {
    try {
      await startProject(problem.rawId || problem.id);
      showToast('Project Started', `Work initiated on #${problem.id}. Status updated to IN_PROGRESS.`, 'success');
      loadDetail();
    } catch (err) {
      showToast('Action Failed', err.response?.data?.detail || 'Failed to start project.', 'error');
    }
  };

  const handleSubmitSolution = async () => {
    if (!solutionTitle.trim() || !solutionDesc.trim()) {
      showToast('Form Incomplete', 'Please provide a solution title and description.', 'error');
      return;
    }
    try {
      await submitSolution(problem.rawId || problem.id, {
        title: solutionTitle,
        description: solutionDesc,
        prototype_url: solutionUrl || undefined,
        technology_stack: solutionTech || undefined
      });
      showToast('Solution Submitted', 'Solution submitted successfully! Awaiting State Admin review.', 'success');
      setActionModal(null);
      setSolutionTitle('');
      setSolutionDesc('');
      loadDetail();
    } catch (err) {
      showToast('Submission Failed', err.response?.data?.detail || 'Failed to submit solution.', 'error');
    }
  };

  const handleReviewSolution = async (actionType) => {
    try {
      await reviewSolution(problem.rawId || problem.id, actionType, actionReason);
      showToast('Review Recorded', `Solution updated to ${actionType === 'ACCEPT' ? 'COMPLETED' : 'IN_PROGRESS'}.`, 'success');
      setActionModal(null);
      setActionReason('');
      loadDetail();
    } catch (err) {
      showToast('Review Failed', err.response?.data?.detail || 'Failed to review solution.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center space-y-4">
        <Loader2 className="w-10 h-10 text-indigo-400 animate-spin mx-auto" />
        <h3 className="text-lg font-bold text-white">Loading Challenge Record from Database...</h3>
        <p className="text-xs text-slate-400">Fetching authoritative PostgreSQL state &amp; predictions.</p>
      </div>
    );
  }

  if (error || !problem) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="p-8 rounded-3xl bg-slate-900/90 border border-rose-500/30 space-y-5 shadow-2xl backdrop-blur-xl">
          <AlertCircle className="w-12 h-12 text-rose-400 mx-auto" />
          <h2 className="text-xl font-bold text-white">Unable to Load Challenge Details</h2>
          <p className="text-xs text-rose-300 max-w-md mx-auto leading-relaxed">
            {error || `Challenge record with ID "${activeId}" could not be retrieved.`}
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={loadDetail}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold inline-flex items-center gap-2 shadow-lg"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retry Load</span>
            </button>
            <button
              onClick={() => navigateBack()}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold inline-flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isUnderReview = problem.rawStatus === 'UNDER_REVIEW';
  const isApproved = problem.rawStatus === 'APPROVED';
  const isAssigned = problem.rawStatus === 'ASSIGNED';
  const isInProgress = problem.rawStatus === 'IN_PROGRESS';
  const isSubmittedSolution = problem.rawStatus === 'SOLUTION_SUBMITTED';
  const isCompleted = problem.rawStatus === 'COMPLETED' || problem.rawStatus === 'VALIDATED';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left">
      {/* Top Navigation & Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          onClick={() => navigateBack()}
          className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Feed / Dashboard</span>
        </button>

        {/* Role-Based Action Controls */}
        <div className="flex items-center gap-2">
          {/* Admin Controls */}
          {currentRole === 'admin' && (
            <div className="flex items-center gap-1.5 bg-slate-900 border border-amber-500/30 p-1.5 rounded-2xl">
              {isUnderReview && (
                <>
                  <button
                    onClick={() => setActionModal('approve')}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 text-xs font-bold flex items-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Approve</span>
                  </button>
                  <button
                    onClick={() => setActionModal('reject')}
                    className="px-3 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 text-xs font-bold flex items-center gap-1"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>
                </>
              )}
              {isApproved && (
                <button
                  onClick={() => setActionModal('assign')}
                  className="px-3 py-1.5 rounded-xl bg-amber-600/20 hover:bg-amber-600/40 text-amber-300 text-xs font-bold flex items-center gap-1"
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>Assign University</span>
                </button>
              )}
              {isSubmittedSolution && (
                <button
                  onClick={() => setActionModal('review_solution')}
                  className="px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 text-xs font-bold flex items-center gap-1"
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>Review Solution</span>
                </button>
              )}
              <button
                onClick={() => setActionModal('override')}
                className="px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 text-xs font-bold flex items-center gap-1"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Override AI</span>
              </button>
            </div>
          )}

          {/* University Controls */}
          {currentRole === 'university' && (
            <div className="flex items-center gap-2">
              {isAssigned && (
                <button
                  onClick={handleStartProject}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold shadow-md flex items-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Start Project</span>
                </button>
              )}
              {isInProgress && (
                <button
                  onClick={() => setActionModal('solution')}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-bold shadow-md flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Solution</span>
                </button>
              )}
              {isSubmittedSolution && (
                <span className="px-3 py-1.5 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Solution Submitted - Waiting for Admin Review</span>
                </span>
              )}
            </div>
          )}

          {/* Industry Controls */}
          {currentRole === 'industry' && (
            <button
              onClick={() => setIsInterestModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-bold shadow-md flex items-center gap-1.5"
            >
              <HandCoins className="w-3.5 h-3.5" />
              <span>Express CSR Interest</span>
            </button>
          )}

          {/* Citizen Endorse Button */}
          <button
            onClick={() => toggleUpvote(problem.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
              problem.hasUpvoted
                ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                : 'bg-slate-850 border-slate-700 text-slate-300 hover:text-white'
            }`}
          >
            <Heart className={`w-4 h-4 ${problem.hasUpvoted ? 'fill-rose-400 text-rose-400' : ''}`} />
            <span>{problem.upvotes} Citizens Endorsed</span>
          </button>
        </div>
      </div>

      {/* Main Project Header Card */}
      <div className="rounded-3xl bg-[#0F172A]/90 border border-slate-700/80 backdrop-blur-xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CategoryBadge category={problem.category} />
            <span className="font-mono text-xs text-slate-400 font-bold">{problem.id}</span>
          </div>
          <div className="flex items-center gap-2.5">
            <StatusBadge status={problem.status} />
            <UrgencyPill score={problem.urgencyScore} />
          </div>
        </div>

        <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
          {problem.title}
        </h1>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-300">
          <span className="flex items-center gap-1.5 font-semibold text-white">
            <MapPin className="w-4 h-4 text-indigo-400" />
            {problem.location} ({problem.districtName} District)
          </span>
          <span>•</span>
          <span>Submitted by: <strong>{problem.submitterName || problem.submitterType}</strong></span>
          <span>•</span>
          <span>Timestamp: <strong>{problem.submittedAt}</strong></span>
        </div>

        <p className="text-sm text-slate-300 leading-relaxed max-w-4xl">
          {problem.description}
        </p>

        {/* Status Indicator Banners */}
        {problem.assignedUniversity && (
          <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 flex items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-indigo-400 shrink-0" />
              <div>
                <span className="text-slate-400 block text-[10px] font-bold uppercase">Assigned R&amp;D Institution</span>
                <span className="font-bold text-white text-sm">{problem.assignedUniversity.name}</span>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-[11px] font-bold">
              {problem.rawStatus}
            </span>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-800 text-xs">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Category</span>
            <span className="font-bold text-slate-200">{problem.category}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Citizen Severity</span>
            <span className="font-bold text-amber-400">{problem.citizen_severity} / 5</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Affected Population</span>
            <span className="font-bold text-slate-200">{problem.affectedPopulation} citizens</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Governance Stage</span>
            <span className="font-bold text-emerald-400">{isUnderReview ? 'Under Review' : problem.rawStatus}</span>
          </div>
        </div>
      </div>

      {/* Solution Submission Banner (if submitted or completed) */}
      {problem.solutionSubmission && (
        <div className="p-6 rounded-3xl bg-purple-950/30 border border-purple-500/40 backdrop-blur-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-purple-400" />
              <h3 className="text-base font-bold text-white">University R&amp;D Solution Prototype</h3>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
              problem.solutionSubmission.status === 'ACCEPTED' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
              problem.solutionSubmission.status === 'CHANGES_REQUESTED' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
              'bg-purple-500/20 text-purple-300 border-purple-500/30'
            }`}>
              {problem.solutionSubmission.status}
            </span>
          </div>

          <h4 className="text-sm font-bold text-purple-200">{problem.solutionSubmission.title}</h4>
          <p className="text-xs text-slate-300 leading-relaxed">{problem.solutionSubmission.description}</p>

          {problem.solutionSubmission.prototype_url && (
            <a
              href={problem.solutionSubmission.prototype_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-300 hover:text-white"
            >
              <span>View Prototype Repository / Demo</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}

          {problem.solutionSubmission.admin_feedback && (
            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
              <span className="font-bold text-amber-400 block text-[10px] uppercase">Admin Review Feedback:</span>
              <span>{problem.solutionSubmission.admin_feedback}</span>
            </div>
          )}
        </div>
      )}

      {/* 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (7 cols) */}
        <div className="lg:col-span-7 space-y-6">

          {/* Academic Solver / AI Recommendations Card */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
                <GraduationCap className="w-4 h-4" />
                <span>Academic R&amp;D Solver Workspace</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {problem.assignedUniversity ? 'Assigned' : isUnderReview ? 'Under Review' : 'Available for Discovery'}
              </span>
            </div>

            <div>
              <h3 className="text-lg font-bold text-white">
                {problem.assignedUniversity ? problem.assignedUniversity.name : isUnderReview ? 'Pending Administrative Assignment' : 'Eligible for Academic Discovery'}
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                {problem.assignedUniversity 
                  ? 'Active university assigned by State Governance Nodal Cell.' 
                  : isUnderReview 
                  ? 'This submission is currently undergoing state administrative review.'
                  : 'Approved challenge open for discovery by authentic Jharkhand academic institutions.'}
              </p>
            </div>

            {/* AI Top 3 University Recommendations */}
            {problem.aiPrediction?.recommended_universities?.length > 0 && !problem.assignedUniversity && (
              <div className="pt-3 border-t border-slate-800 space-y-3">
                <span className="text-[11px] font-black text-amber-400 uppercase tracking-wider block flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI Recommended Universities (Top 3 Matches)</span>
                </span>
                <div className="space-y-2">
                  {problem.aiPrediction.recommended_universities.slice(0, 3).map((rec, idx) => (
                    <div key={idx} className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">{rec.university_name || rec.short_name}</span>
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-extrabold">
                          {rec.match_score}% Match
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 8-Stage Lifecycle Timeline */}
          <ProjectTimeline problem={problem} />
        </div>

        {/* Right Column (5 cols) */}
        <div className="lg:col-span-5 space-y-6">

          {/* Uploaded Evidence Section */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
            <h4 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              <span>Uploaded Evidence Media</span>
            </h4>

            {problem.evidenceFiles && problem.evidenceFiles.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {problem.evidenceFiles.map((file, idx) => {
                  const imgUrl = getEvidenceImageUrl(file.stored_filename);
                  return (
                    <div key={file.id || idx} className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                      <div className="relative group overflow-hidden rounded-xl bg-black aspect-video flex items-center justify-center border border-slate-800">
                        <img
                          src={imgUrl}
                          alt={file.original_name || 'Evidence image'}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.style.display = 'none';
                          }}
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button
                            onClick={() => setEnlargedImage(imgUrl)}
                            className="px-3 py-1.5 rounded-lg bg-amber-600 text-white font-bold text-[11px] flex items-center gap-1 shadow-md"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View Evidence</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 text-center text-slate-500 text-xs italic">
                No evidence files uploaded
              </div>
            )}
          </div>

          {/* AI Sector & Priority Analysis Breakdown */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-indigo-500/30 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>AI Automated Classification</span>
              </h4>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 uppercase">
                {problem.priorityLabel} PRIORITY
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Primary Sector</span>
                <span className="font-bold text-white text-sm mt-0.5 block">{problem.aiPrediction?.primary_sector || problem.category}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Priority Score</span>
                <span className="font-bold text-amber-400 text-sm mt-0.5 block">{problem.urgencyScore} / 100</span>
              </div>
            </div>
          </div>

          {/* Discussion Thread */}
          <DiscussionThread problem={problem} />
        </div>
      </div>

      {/* Action Modals */}
      {actionModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl text-left">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-amber-400" />
                <span>
                  {actionModal === 'approve' && 'Approve Challenge'}
                  {actionModal === 'reject' && 'Reject Challenge'}
                  {actionModal === 'override' && 'Override AI Prediction'}
                  {actionModal === 'assign' && 'Assign Academic Institution'}
                  {actionModal === 'solution' && 'Submit Solution Prototype'}
                  {actionModal === 'review_solution' && 'Review Solution Submission'}
                </span>
              </h3>
              <button onClick={() => setActionModal(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {actionModal === 'approve' && (
              <div className="space-y-3 text-xs">
                <p className="text-slate-300">Approve challenge <strong>#{problem.id}</strong> to set status to APPROVED and allow university discovery.</p>
                <input
                  type="text"
                  value={actionReason}
                  onChange={e => setActionReason(e.target.value)}
                  placeholder="Approval notes (Optional)..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                />
                <div className="flex justify-end gap-2 pt-2">
                  <button onClick={() => setActionModal(null)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300">Cancel</button>
                  <button onClick={handleApprove} className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold">Confirm Approval</button>
                </div>
              </div>
            )}

            {actionModal === 'reject' && (
              <div className="space-y-3 text-xs">
                <p className="text-slate-300">Reject challenge <strong>#{problem.id}</strong>.</p>
                <textarea
                  value={actionReason}
                  onChange={e => setActionReason(e.target.value)}
                  placeholder="Rejection justification (Required)..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                />
                <div className="flex justify-end gap-2 pt-2">
                  <button onClick={() => setActionModal(null)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300">Cancel</button>
                  <button onClick={handleReject} className="px-4 py-2 rounded-xl bg-rose-600 text-white font-bold">Confirm Rejection</button>
                </div>
              </div>
            )}

            {actionModal === 'assign' && (
              <div className="space-y-3 text-xs">
                <p className="text-slate-300">Assign challenge <strong>#{problem.id}</strong> to a university.</p>
                <select
                  value={selectedUnivId}
                  onChange={e => setSelectedUnivId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                >
                  <option value="">Select Institution...</option>
                  {universitiesList.map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.short_name || u.name})</option>
                  ))}
                </select>
                <input
                  type="text"
                  value={actionReason}
                  onChange={e => setActionReason(e.target.value)}
                  placeholder="Assignment Directive Notes (Optional)..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                />
                <div className="flex justify-end gap-2 pt-2">
                  <button onClick={() => setActionModal(null)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300">Cancel</button>
                  <button onClick={handleAssign} className="px-4 py-2 rounded-xl bg-amber-600 text-white font-bold">Confirm Assignment</button>
                </div>
              </div>
            )}

            {actionModal === 'solution' && (
              <div className="space-y-3 text-xs">
                <p className="text-slate-300">Submit solution prototype for <strong>#{problem.id}</strong>.</p>
                <input
                  type="text"
                  required
                  value={solutionTitle}
                  onChange={e => setSolutionTitle(e.target.value)}
                  placeholder="Solution Title *"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                />
                <textarea
                  required
                  rows={3}
                  value={solutionDesc}
                  onChange={e => setSolutionDesc(e.target.value)}
                  placeholder="Detailed Description of Solution Prototype *"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs resize-none"
                />
                <input
                  type="url"
                  value={solutionUrl}
                  onChange={e => setSolutionUrl(e.target.value)}
                  placeholder="Prototype / Demo Repo URL (Optional)"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                />
                <div className="flex justify-end gap-2 pt-2">
                  <button onClick={() => setActionModal(null)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300">Cancel</button>
                  <button onClick={handleSubmitSolution} className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold">Submit Solution</button>
                </div>
              </div>
            )}

            {actionModal === 'review_solution' && (
              <div className="space-y-3 text-xs">
                <p className="text-slate-300">Review solution submission for <strong>#{problem.id}</strong>.</p>
                <textarea
                  rows={3}
                  value={actionReason}
                  onChange={e => setActionReason(e.target.value)}
                  placeholder="Admin feedback / review notes..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs resize-none"
                />
                <div className="flex justify-end gap-2 pt-2">
                  <button onClick={() => handleReviewSolution('REQUEST_CHANGES')} className="px-4 py-2 rounded-xl bg-amber-600 text-white font-bold">Request Changes</button>
                  <button onClick={() => handleReviewSolution('ACCEPT')} className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold">Accept &amp; Complete</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Express Interest Modal for Industry */}
      {isInterestModalOpen && (
        <ExpressInterestModal
          isOpen={isInterestModalOpen}
          onClose={() => setIsInterestModalOpen(false)}
          problem={problem}
        />
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
