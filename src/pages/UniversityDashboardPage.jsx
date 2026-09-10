import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { 
  GraduationCap, Sparkles, CheckCircle2, Flame, 
  ArrowRight, Users, Award, BookOpen, Layers, Clock, Loader2, AlertCircle, RefreshCw, FolderOpen, ShieldCheck
} from 'lucide-react';
import { ChallengeCard } from '../components/citizen/ChallengeCard';
import { getAvailableChallenges, getMyAssignments, getUniversityStats } from '../services/universityService';

export const UniversityDashboardPage = () => {
  const { navigate, isLoggedIn } = useApp();

  const [activeTab, setActiveTab] = useState('available'); // 'available' | 'assigned'
  const [availableList, setAvailableList] = useState([]);
  const [assignedList, setAssignedList] = useState([]);
  const [stats, setStats] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
      assignedUniversity: assignedUnivName ? { name: assignedUnivName } : null,
      isRealDatabaseRecord: true
    };
  };

  const fetchUniversityData = useCallback(async () => {
    if (!isLoggedIn) return;
    setLoading(true);
    setError('');
    try {
      const [availData, assignData, statsData] = await Promise.all([
        getAvailableChallenges(),
        getMyAssignments(),
        getUniversityStats().catch(() => null)
      ]);
      setAvailableList(availData.map(mapApiToUI));
      setAssignedList(assignData.map(mapApiToUI));
      setStats(statsData);
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

  const displayedList = activeTab === 'available' ? availableList : assignedList;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left">
      {/* University Portal Header */}
      <div className="relative rounded-3xl bg-gradient-to-r from-indigo-950/70 via-slate-900 to-purple-950/70 border border-indigo-500/40 p-6 sm:p-8 backdrop-blur-xl shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>University R&amp;D &amp; Co-Innovation Workspace</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Academic Problem Solving &amp; Discovery Hub
            </h1>
            <p className="text-xs text-slate-300 leading-relaxed">
              Explore state-approved grassroots challenges eligible for academic discovery or manage your institution's active R&amp;D allocations.
            </p>
          </div>

          {/* Quick stats badge */}
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 shrink-0">
            <div className="p-2.5 rounded-2xl bg-slate-800/80 border border-slate-700 text-center">
              <span className="text-[9px] text-slate-400 font-bold uppercase block">Discovery</span>
              <span className="text-lg font-extrabold text-indigo-400 mt-0.5 block">{stats?.available_discovery ?? availableList.length}</span>
            </div>
            <div className="p-2.5 rounded-2xl bg-slate-800/80 border border-slate-700 text-center">
              <span className="text-[9px] text-slate-400 font-bold uppercase block">Assigned</span>
              <span className="text-lg font-extrabold text-emerald-400 mt-0.5 block">{stats?.my_assigned ?? assignedList.length}</span>
            </div>
            <div className="p-2.5 rounded-2xl bg-slate-800/80 border border-slate-700 text-center">
              <span className="text-[9px] text-slate-400 font-bold uppercase block">In Progress</span>
              <span className="text-lg font-extrabold text-blue-400 mt-0.5 block">{stats?.in_progress ?? 0}</span>
            </div>
            <div className="p-2.5 rounded-2xl bg-slate-800/80 border border-slate-700 text-center">
              <span className="text-[9px] text-slate-400 font-bold uppercase block">Submitted</span>
              <span className="text-lg font-extrabold text-purple-400 mt-0.5 block">{stats?.solutions_submitted ?? 0}</span>
            </div>
            <div className="p-2.5 rounded-2xl bg-slate-800/80 border border-slate-700 text-center">
              <span className="text-[9px] text-slate-400 font-bold uppercase block">Completed</span>
              <span className="text-lg font-extrabold text-teal-400 mt-0.5 block">{stats?.completed ?? 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('available')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'available'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Available for Discovery ({availableList.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('assigned')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'assigned'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>My Assigned R&amp;D Challenges ({assignedList.length})</span>
          </button>
        </div>

        <button
          onClick={fetchUniversityData}
          className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-white text-xs font-bold flex items-center gap-1.5"
          title="Refresh Data"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="py-16 text-center space-y-3 bg-slate-900/40 border border-slate-800 rounded-3xl">
          <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-300">Fetching PostgreSQL records for University Portal...</p>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="py-12 px-6 text-center space-y-4 bg-rose-950/20 border border-rose-500/30 rounded-3xl">
          <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-white">Connection Error</h4>
            <p className="text-xs text-rose-300">{error}</p>
          </div>
          <button
            onClick={fetchUniversityData}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white inline-flex items-center gap-1.5 border border-slate-700"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Connection</span>
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && displayedList.length === 0 && (
        <div className="py-16 px-6 text-center space-y-4 bg-slate-900/40 border border-slate-800 rounded-3xl">
          <FolderOpen className="w-10 h-10 text-slate-500 mx-auto" />
          <div className="space-y-1 max-w-md mx-auto">
            <h4 className="text-sm font-bold text-white">
              {activeTab === 'available' ? 'No Approved Challenges Available' : 'No Active Assignments Found'}
            </h4>
            <p className="text-xs text-slate-400">
              {activeTab === 'available'
                ? 'There are currently no unassigned state-approved challenges available for academic discovery.'
                : 'Your institution has not been assigned any active challenges by the State Nodal Cell yet.'}
            </p>
          </div>
        </div>
      )}

      {/* Challenge Grid */}
      {!loading && !error && displayedList.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedList.map(problem => (
            <ChallengeCard key={problem.id} problem={problem} />
          ))}
        </div>
      )}
    </div>
  );
};
