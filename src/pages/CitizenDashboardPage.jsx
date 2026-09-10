import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Users, PlusCircle, CheckCircle2, Clock, Heart, 
  MapPin, Flame, Filter, Search, ArrowRight, Sparkles, GitMerge,
  Loader2, AlertCircle, RefreshCw, FolderOpen
} from 'lucide-react';
import { ChallengeCard } from '../components/citizen/ChallengeCard';
import { getMyChallenges, getCitizenStats } from '../services/challengeService';

export const CitizenDashboardPage = () => {
  const { problems, setIsSubmitModalOpen, isSubmitModalOpen, isLoggedIn, currentUser } = useApp();

  const [activeTab, setActiveTab] = useState(isLoggedIn ? 'my' : 'all'); // 'my' | 'all' | 'upvoted'
  const [districtFilter, setDistrictFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Real Database Submissions & Stats State
  const [myRealSubmissions, setMyRealSubmissions] = useState([]);
  const [citizenStats, setCitizenStats] = useState(null);
  const [myLoading, setMyLoading] = useState(false);
  const [myError, setMyError] = useState('');

  // Normalize API model to match UI requirements
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
      districtId: ch.district_id,
      districtName: distName,
      location: ch.block_locality,
      severity: ch.citizen_severity,
      urgencyScore: ch.ai_prediction?.priority_score || (ch.citizen_severity * 15),
      priorityLabel: ch.ai_prediction?.priority_label || 'HIGH',
      status: ch.status,
      rawStatus: ch.status,
      submitterType: ch.submitter_type || 'Citizen',
      submitterName: ch.submitter_name || currentUser?.full_name || 'Citizen Advocate',
      submittedAt: ch.created_at ? new Date(ch.created_at).toLocaleDateString() : 'Just now',
      upvotes: 1,
      hasUpvoted: false,
      comments: [],
      duplicateCount: ch.ai_prediction?.similar_challenge_ids?.length || 0,
      assignedUniversity: assignedUnivName ? {
        name: assignedUnivName
      } : null,
      isRealDatabaseRecord: true
    };
  };

  const fetchMyRealSubmissions = useCallback(async () => {
    if (!isLoggedIn) {
      setMyRealSubmissions([]);
      return;
    }
    setMyLoading(true);
    setMyError('');
    try {
      const [data, stats] = await Promise.all([
        getMyChallenges(),
        getCitizenStats().catch(() => null)
      ]);
      const mapped = data.map(mapApiToUI);
      setMyRealSubmissions(mapped);
      setCitizenStats(stats);
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to load your submissions from database.';
      setMyError(msg);
    } finally {
      setMyLoading(false);
    }
  }, [isLoggedIn]);

  // Fetch when page mounts or when submit modal closes (after creating new challenge)
  useEffect(() => {
    fetchMyRealSubmissions();
  }, [fetchMyRealSubmissions, isSubmitModalOpen]);

  const upvotedProblems = problems.filter(p => p.hasUpvoted);

  // Compute displayed list based on active tab
  const getDisplayedProblems = () => {
    if (activeTab === 'my') {
      return myRealSubmissions.filter(p => {
        const matchDist = districtFilter === 'All' || p.districtName === districtFilter;
        const matchQuery = !searchQuery.trim() || 
          p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
          p.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchDist && matchQuery;
      });
    }
    
    if (activeTab === 'upvoted') {
      return upvotedProblems.filter(p => {
        const matchDist = districtFilter === 'All' || p.districtName === districtFilter;
        const matchQuery = !searchQuery.trim() || 
          p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
          p.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchDist && matchQuery;
      });
    }

    return problems.filter(p => {
      const matchDist = districtFilter === 'All' || p.districtName === districtFilter;
      const matchQuery = !searchQuery.trim() || 
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchDist && matchQuery;
    });
  };

  const displayedProblems = getDisplayedProblems();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left">
      {/* Citizen Welcome Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-blue-950/60 via-slate-900 to-indigo-950/60 border border-blue-500/30 p-6 sm:p-8 backdrop-blur-xl shadow-xl overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-bold">
              <Users className="w-3.5 h-3.5" />
              <span>Citizen & Community Action Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Crowdsource & Track Jharkhand's Grassroots Challenges
            </h1>
            <p className="text-xs text-slate-300 leading-relaxed">
              Submit your local village or urban ward issues. Our AI engine groups duplicate problems and routes them directly to university engineering departments with state CSR co-funding.
            </p>
          </div>

          <button
            onClick={() => setIsSubmitModalOpen(true)}
            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white font-extrabold text-xs shadow-xl shadow-indigo-500/25 flex items-center gap-2 transition-all hover:scale-105 shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Submit a New Challenge</span>
          </button>
        </div>
      </div>

      {/* Interactive Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('my')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'my'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            My Submissions ({myRealSubmissions.length})
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'all'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            All Challenges ({problems.length})
          </button>
          <button
            onClick={() => setActiveTab('upvoted')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'upvoted'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            My Endorsed ({upvotedProblems.length})
          </button>
        </div>

        {/* Search & Refresh */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={fetchMyRealSubmissions}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-white text-xs font-bold flex items-center gap-1.5"
            title="Refresh My Submissions"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${myLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search problems, keywords..."
              className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Loading State for My Submissions */}
      {activeTab === 'my' && myLoading && (
        <div className="py-16 text-center space-y-3 bg-slate-900/40 border border-slate-800 rounded-3xl">
          <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-300">Fetching your database submissions from PostgreSQL...</p>
        </div>
      )}

      {/* Error State for My Submissions */}
      {activeTab === 'my' && !myLoading && myError && (
        <div className="py-12 px-6 text-center space-y-4 bg-rose-950/20 border border-rose-500/30 rounded-3xl">
          <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-white">Failed to Load Submissions</h4>
            <p className="text-xs text-rose-300">{myError}</p>
          </div>
          <button
            onClick={fetchMyRealSubmissions}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white inline-flex items-center gap-1.5 border border-slate-700"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Connection</span>
          </button>
        </div>
      )}

      {/* Empty State for My Submissions */}
      {activeTab === 'my' && !myLoading && !myError && myRealSubmissions.length === 0 && (
        <div className="py-16 px-6 text-center space-y-4 bg-slate-900/40 border border-slate-800 rounded-3xl">
          <FolderOpen className="w-10 h-10 text-slate-500 mx-auto" />
          <div className="space-y-1 max-w-md mx-auto">
            <h4 className="text-sm font-bold text-white">No Database Submissions Found</h4>
            <p className="text-xs text-slate-400">
              You haven't submitted any grassroots challenges yet under this account.
            </p>
          </div>
          <button
            onClick={() => setIsSubmitModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-md"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Submit Your First Challenge</span>
          </button>
        </div>
      )}

      {/* Challenge Cards Grid */}
      {!(activeTab === 'my' && (myLoading || myError || myRealSubmissions.length === 0)) && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedProblems.map(problem => (
            <ChallengeCard key={problem.id} problem={problem} />
          ))}
        </div>
      )}
    </div>
  );
};
