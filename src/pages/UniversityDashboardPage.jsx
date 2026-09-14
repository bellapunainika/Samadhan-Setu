import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { 
  GraduationCap, Sparkles, CheckCircle2, Flame, 
  ArrowRight, Users, Award, BookOpen, Layers, Clock, Loader2, AlertCircle, RefreshCw, FolderOpen, ShieldCheck, HandCoins, Building2, CheckCircle, UserCheck, Settings, FileText, CheckCircle as CheckIcon, ChevronRight
} from 'lucide-react';
import { ChallengeCard } from '../components/citizen/ChallengeCard';
import { Modal } from '../components/common/Modal';
import { getAvailableChallenges, getMyAssignments, getUniversityStats, getUniversityIndustryInterests, configureTeam } from '../services/universityService';
import { updateProposalStatus } from '../services/industryService';

export const UniversityDashboardPage = () => {
  const { navigate, isLoggedIn, currentUser } = useApp();

  const [activeTab, setActiveTab] = useState('assigned'); // 'assigned' | 'available' | 'industry-support' | 'workflow-guide'
  const [availableList, setAvailableList] = useState([]);
  const [assignedList, setAssignedList] = useState([]);
  const [industryInterests, setIndustryInterests] = useState([]);
  const [stats, setStats] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  // Team Configuration Modal State
  const [selectedProblemForTeam, setSelectedProblemForTeam] = useState(null);
  const [teamName, setTeamName] = useState('BIT Mesra R&D Cell Alpha');
  const [facultyMentor, setFacultyMentor] = useState('Dr. A. K. Sharma (HOD Environmental Science)');
  const [studentMembers, setStudentMembers] = useState('Rahul Kumar (M.Tech), Priya Singh (B.Tech 4th Yr), Amit Verma (Ph.D.)');
  const [savingTeam, setSavingTeam] = useState(false);

  const mapApiToUI = (ch) => {
    const distName = ch.district_id 
      ? ch.district_id.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
      : 'Jharkhand';

    const assignedUnivName = ch.assignment?.university_name || ch.assigned_university_name || null;

    return {
      id: ch.short_id || ch.id,
      rawId: ch.id,
      title: ch.title,
      description: ch.description,
      category: ch.category,
      subcategory: ch.subcategory,
      districtId: ch.district_id,
      districtName: distName,
      location: ch.block_locality,
      severity: ch.citizen_severity,
      urgencyScore: ch.ai_prediction?.priority_score || (ch.citizen_severity * 15),
      priorityLabel: ch.ai_prediction?.priority_label || 'HIGH',
      status: ch.status,
      rawStatus: ch.status,
      submitterType: ch.submitter_type || 'Citizen',
      submitterName: ch.submitter_name || 'Citizen Advocate',
      submittedAt: ch.created_at ? new Date(ch.created_at).toLocaleDateString() : 'Just now',
      upvotes: 1,
      hasUpvoted: false,
      comments: [],
      duplicateCount: ch.ai_prediction?.similar_challenge_ids?.length || 0,
      aiPrediction: ch.ai_prediction,
      evidenceFiles: ch.evidence_files || [],
      assignment: ch.assignment || null,
      assignedUniversity: assignedUnivName ? { name: assignedUnivName } : null,
      isRealDatabaseRecord: true
    };
  };

  const fetchUniversityData = useCallback(async () => {
    if (!isLoggedIn) return;
    setLoading(true);
    setError('');
    try {
      const [availData, assignData, statsData, interestsData] = await Promise.all([
        getAvailableChallenges(),
        getMyAssignments(),
        getUniversityStats().catch(() => null),
        getUniversityIndustryInterests().catch(() => [])
      ]);
      setAvailableList(availData.map(mapApiToUI));
      setAssignedList(assignData.map(mapApiToUI));
      setStats(statsData);
      setIndustryInterests(interestsData);
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to load university discovery workspace data.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    fetchUniversityData();
  }, [fetchUniversityData]);

  const handleSaveTeam = async (e) => {
    e.preventDefault();
    if (!selectedProblemForTeam) return;
    setSavingTeam(true);
    try {
      await configureTeam(selectedProblemForTeam.rawId || selectedProblemForTeam.id, {
        team_name: teamName,
        faculty_mentor: facultyMentor,
        student_members: studentMembers
      });
      setActionSuccess(`Research team configured for #${selectedProblemForTeam.id}`);
      setTimeout(() => setActionSuccess(''), 3000);
      setSelectedProblemForTeam(null);
      fetchUniversityData();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save team configuration.');
    } finally {
      setSavingTeam(false);
    }
  };

  const handleUpdateStatus = async (requestId, newStatus) => {
    try {
      await updateProposalStatus(requestId, {
        status: newStatus,
        proposal_summary: 'University R&D Cell agreed terms and confirmed support agreement with corporate partner.'
      });
      setActionSuccess(`Proposal status updated to ${newStatus}`);
      setTimeout(() => setActionSuccess(''), 3000);
      fetchUniversityData();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update proposal status.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left">
      {/* University Portal Header */}
      <div className="relative rounded-3xl bg-gradient-to-r from-indigo-950/80 via-slate-900 to-purple-950/80 border border-indigo-500/40 p-6 sm:p-8 backdrop-blur-xl shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>University R&amp;D &amp; Co-Innovation Workspace</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Academic R&amp;D &amp; Industry Collaboration Hub
            </h1>
            <p className="text-xs text-slate-300 leading-relaxed">
              Logged in as <strong className="text-indigo-300">{currentUser?.full_name || 'BIT Mesra R&D Cell'}</strong>. Manage assigned grassroots allocations, configure research team details, and coordinate CSR funding.
            </p>
          </div>

          {/* Quick stats badge */}
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 shrink-0">
            <div className="p-2.5 rounded-2xl bg-slate-800/80 border border-slate-700 text-center">
              <span className="text-[9px] text-slate-400 font-bold uppercase block">Assigned</span>
              <span className="text-lg font-extrabold text-emerald-400 mt-0.5 block">{stats?.my_assigned ?? assignedList.length}</span>
            </div>
            <div className="p-2.5 rounded-2xl bg-slate-800/80 border border-slate-700 text-center">
              <span className="text-[9px] text-slate-400 font-bold uppercase block">Discovery</span>
              <span className="text-lg font-extrabold text-indigo-400 mt-0.5 block">{stats?.available_discovery ?? availableList.length}</span>
            </div>
            <div className="p-2.5 rounded-2xl bg-slate-800/80 border border-slate-700 text-center">
              <span className="text-[9px] text-slate-400 font-bold uppercase block">In Progress</span>
              <span className="text-lg font-extrabold text-blue-400 mt-0.5 block">{stats?.in_progress ?? 2}</span>
            </div>
            <div className="p-2.5 rounded-2xl bg-slate-800/80 border border-slate-700 text-center">
              <span className="text-[9px] text-slate-400 font-bold uppercase block">Submitted</span>
              <span className="text-lg font-extrabold text-purple-400 mt-0.5 block">{stats?.solutions_submitted ?? 2}</span>
            </div>
            <div className="p-2.5 rounded-2xl bg-slate-800/80 border border-slate-700 text-center">
              <span className="text-[9px] text-slate-400 font-bold uppercase block">Industry Grants</span>
              <span className="text-lg font-extrabold text-teal-400 mt-0.5 block">{industryInterests.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Success Alert */}
      {actionSuccess && (
        <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 overflow-x-auto">
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('assigned')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'assigned'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>1. Assigned R&amp;D Projects &amp; Teams ({assignedList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('available')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'available'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>2. Available for Discovery ({availableList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('industry-support')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'industry-support'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <HandCoins className="w-3.5 h-3.5" />
            <span>3. Industry CSR Support ({industryInterests.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('workflow-guide')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'workflow-guide'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>4. Prototype Workflow Guide</span>
          </button>
        </div>

        <button
          onClick={fetchUniversityData}
          className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-white text-xs font-bold flex items-center gap-1.5 shrink-0"
          title="Refresh Data"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* TAB 1: ASSIGNED R&D PROJECTS & TEAM DETAILS */}
      {activeTab === 'assigned' && (
        <div className="space-y-6">
          {assignedList.length === 0 ? (
            <div className="py-16 px-6 text-center space-y-4 bg-slate-900/40 border border-slate-800 rounded-3xl">
              <FolderOpen className="w-10 h-10 text-slate-500 mx-auto" />
              <div className="space-y-1 max-w-md mx-auto">
                <h4 className="text-sm font-bold text-white">No Active Assignments Found</h4>
                <p className="text-xs text-slate-400">
                  Your institution has not been assigned any active challenges by the State Nodal Cell yet.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {assignedList.map(problem => {
                const teamData = problem.assignment || {};
                const hasTeam = !!teamData.team_name;

                return (
                  <div key={problem.id} className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-6 shadow-xl text-left">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-amber-400 font-bold">{problem.id}</span>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            {problem.status}
                          </span>
                        </div>
                        <h3
                          onClick={() => navigate(`/project/${problem.id}`)}
                          className="text-lg font-bold text-white hover:text-indigo-300 cursor-pointer transition-colors"
                        >
                          {problem.title}
                        </h3>
                        <p className="text-xs text-slate-400">{problem.location} ({problem.districtName} District)</p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => navigate(`/project/${problem.id}`)}
                          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md flex items-center gap-1.5"
                        >
                          <span>Open Project Portal</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* ASSIGNED RESEARCH TEAM DETAILS BOX */}
                    <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-indigo-400" />
                          <h4 className="text-xs font-bold text-white uppercase tracking-wider">Assigned R&amp;D Research Team Details</h4>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedProblemForTeam(problem);
                            if (teamData.team_name) setTeamName(teamData.team_name);
                            if (teamData.faculty_mentor) setFacultyMentor(teamData.faculty_mentor);
                            if (teamData.student_members) setStudentMembers(teamData.student_members);
                          }}
                          className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-bold border border-slate-700 flex items-center gap-1.5"
                        >
                          <Settings className="w-3.5 h-3.5" />
                          <span>{hasTeam ? 'Configure Team' : 'Assign Team Members'}</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
                        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800/80">
                          <span className="text-[10px] text-slate-400 font-bold uppercase block">R&amp;D Team Name</span>
                          <span className="font-bold text-white mt-0.5 block">{teamData.team_name || 'BIT Mesra Innovation Cell Alpha'}</span>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800/80">
                          <span className="text-[10px] text-slate-400 font-bold uppercase block">Faculty Mentor</span>
                          <span className="font-bold text-indigo-300 mt-0.5 block">{teamData.faculty_mentor || 'Dr. A. K. Sharma (HOD Dept of Civil & Env)'}</span>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800/80">
                          <span className="text-[10px] text-slate-400 font-bold uppercase block">Student Researchers</span>
                          <span className="font-bold text-slate-300 mt-0.5 block">{teamData.student_members || 'Rahul Kumar (M.Tech), Priya Singh (B.Tech)'}</span>
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

      {/* TAB 2: AVAILABLE FOR DISCOVERY */}
      {activeTab === 'available' && (
        <div className="space-y-6">
          {availableList.length === 0 ? (
            <div className="py-16 px-6 text-center space-y-4 bg-slate-900/40 border border-slate-800 rounded-3xl">
              <FolderOpen className="w-10 h-10 text-slate-500 mx-auto" />
              <div className="space-y-1 max-w-md mx-auto">
                <h4 className="text-sm font-bold text-white">No Unassigned Approved Challenges</h4>
                <p className="text-xs text-slate-400">
                  There are currently no unassigned state-approved challenges open for discovery.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableList.map(problem => (
                <ChallengeCard key={problem.id} problem={problem} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: INDUSTRY SUPPORT */}
      {activeTab === 'industry-support' && (
        <div className="space-y-4">
          {industryInterests.length === 0 ? (
            <div className="py-16 px-6 text-center space-y-4 bg-slate-900/40 border border-slate-800 rounded-3xl">
              <HandCoins className="w-10 h-10 text-slate-500 mx-auto" />
              <div className="space-y-1 max-w-md mx-auto">
                <h4 className="text-sm font-bold text-white">No Industry Funding Interests Yet</h4>
                <p className="text-xs text-slate-400">
                  Once your university's solution is approved by State Admin, corporate CSR partners can express interest and offer funding.
                </p>
              </div>
            </div>
          ) : (
            industryInterests.map(req => (
              <div key={req.id} className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 text-left">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-emerald-400" />
                      <span className="font-bold text-white text-base">{req.company_name}</span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {req.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">Contact Email: <strong>{req.contact_email}</strong></p>
                  </div>
                  <span className="text-xs font-extrabold text-emerald-400">
                    {req.pledged_amount || 'Support Offered'}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Proposal Message</span>
                  <p className="text-xs text-slate-200 leading-relaxed">{req.message}</p>
                </div>

                {/* Interactive Status Controls */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
                  <div className="text-xs text-slate-400">
                    Mode of Support: <strong className="text-white">{req.support_type}</strong>
                  </div>

                  <div className="flex items-center gap-2">
                    {req.status !== 'PROPOSAL_UNDER_DISCUSSION' && req.status !== 'SUPPORT_CONFIRMED' && (
                      <button
                        onClick={() => handleUpdateStatus(req.id, 'PROPOSAL_UNDER_DISCUSSION')}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-amber-300 border border-slate-700"
                      >
                        Move to Discussion
                      </button>
                    )}

                    {req.status !== 'SUPPORT_CONFIRMED' && (
                      <button
                        onClick={() => handleUpdateStatus(req.id, 'SUPPORT_CONFIRMED')}
                        className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-md flex items-center gap-1.5"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Confirm Support &amp; Finalize Project</span>
                      </button>
                    )}

                    {req.status === 'SUPPORT_CONFIRMED' && (
                      <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Partnership Confirmed &amp; Logged</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 4: PROTOTYPE WORKFLOW GUIDE */}
      {activeTab === 'workflow-guide' && (
        <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 text-left max-w-4xl">
          <div className="space-y-1 border-b border-slate-800 pb-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold mb-1">
              <BookOpen className="w-3.5 h-3.5" />
              <span>SIH 2026 Selection Prototype Workflow Guide</span>
            </div>
            <h2 className="text-xl font-bold text-white">Samadhan Setu Academic &amp; Industry Co-Innovation Lifecycle</h2>
            <p className="text-xs text-slate-300">Complete multi-stakeholder governance sequence for university solvers and corporate partners.</p>
          </div>

          <div className="space-y-4">
            {[
              {
                step: '1',
                title: 'Problem Submission & AI Matching',
                desc: 'Citizens or advocates submit grassroots problems. The rule-hybrid AI engine classifies the sector, computes priority score (0-100), filters duplicates, and recommends the Top 3 Jharkhand Universities.',
                status: 'UNDER_REVIEW → ASSIGNED'
              },
              {
                step: '2',
                title: 'State Admin 1-Step Approve & Assign',
                desc: 'State Nodal Admin reviews the problem, evidence images, and AI recommendations, executing 1-step Approve & Assign to allocate the project to your university institution in PostgreSQL.',
                status: 'ASSIGNED'
              },
              {
                step: '3',
                title: 'University Team Configuration & Project Start',
                desc: 'Your university R&D Cell assigns a faculty mentor, student researchers, and team name, then clicks "Start Project" to transition status to IN_PROGRESS.',
                status: 'IN_PROGRESS'
              },
              {
                step: '4',
                title: 'Milestone Updates & R&D Prototype Submission',
                desc: 'Post lab progress updates, test metrics, and submit the final R&D solution prototype details along with GitHub repository link.',
                status: 'SOLUTION_SUBMITTED'
              },
              {
                step: '5',
                title: 'State Admin Solution Validation',
                desc: 'State Admin reviews the solution prototype. Upon approval, status becomes SOLUTION_APPROVED, releasing the solution to Industry Opportunities.',
                status: 'SOLUTION_APPROVED'
              },
              {
                step: '6',
                title: 'Industry CSR Co-Funding & Project Resolution',
                desc: 'Corporate CSR partners (e.g. Tata Steel CSR) express interest, pledge grants, and co-fund pilot manufacturing. University confirms partnership → COMPLETED.',
                status: 'SUPPORT_CONFIRMED → COMPLETED'
              }
            ].map(s => (
              <div key={s.step} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-start gap-4">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-bold text-sm flex items-center justify-center shrink-0">
                  {s.step}
                </div>
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-bold text-white text-sm">{s.title}</h4>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-900 text-indigo-300 border border-slate-800 shrink-0">
                      {s.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TEAM CONFIGURATION MODAL */}
      {selectedProblemForTeam && (
        <Modal
          isOpen={!!selectedProblemForTeam}
          onClose={() => setSelectedProblemForTeam(null)}
          title="Configure Assigned R&D Research Team"
          subtitle={`Assign faculty mentor and student researchers for #${selectedProblemForTeam.id}`}
          maxWidth="max-w-md"
        >
          <form onSubmit={handleSaveTeam} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Research Team Name *
              </label>
              <input
                type="text"
                required
                value={teamName}
                onChange={e => setTeamName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Faculty Mentor Name &amp; Title *
              </label>
              <input
                type="text"
                required
                value={facultyMentor}
                onChange={e => setFacultyMentor(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Student Team Members *
              </label>
              <textarea
                rows={3}
                required
                value={studentMembers}
                onChange={e => setStudentMembers(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500 resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedProblemForTeam(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingTeam}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md flex items-center gap-1.5"
              >
                {savingTeam ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                <span>Save Team Details</span>
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
