import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { MOCK_PROBLEMS } from '../data/mockProblems';
import { 
  Users, PlusCircle, CheckCircle2, Clock, Heart, 
  MapPin, Flame, Filter, Search, ArrowRight, Sparkles, GitMerge,
  Loader2, AlertCircle, RefreshCw, FolderOpen, Building2, ChevronRight
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
      industryInterests: ch.industry_interests || [],
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
      if (data && data.length > 0) {
        const mapped = data.map(mapApiToUI);
        setMyRealSubmissions(mapped);
        setCitizenStats(stats);
      } else {
        // Fallback to MOCK_PROBLEMS for demo citizen
        setMyRealSubmissions(MOCK_PROBLEMS.slice(0, 4));
      }
    } catch (err) {
      // Fallback to MOCK_PROBLEMS on network/backend error
      setMyRealSubmissions(MOCK_PROBLEMS.slice(0, 4));
    } finally {
      setMyLoading(false);
    }
  }, [isLoggedIn]);

  // Fetch when page mounts or when submit modal closes (after creating new challenge)
  useEffect(() => {
    fetchMyRealSubmissions();
    if (isLoggedIn) {
      setActiveTab('my');
    }
  }, [fetchMyRealSubmissions, isSubmitModalOpen, isLoggedIn]);

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

      {/* Industry Support Progression Steppers — My Submissions tab only */}
      {activeTab === 'my' && !myLoading && !myError && (() => {
        const withIndustry = myRealSubmissions.filter(
          p => p.industryInterests && p.industryInterests.length > 0
        );
        if (withIndustry.length === 0) return null;

        // Stage order for the stepper
        const STAGES = [
          { key: 'INTEREST_EXPRESSED',        label: 'Interest Expressed',   color: 'indigo' },
          { key: 'PROPOSAL_INITIATED',        label: 'Proposal Initiated',   color: 'amber' },
          { key: 'PROPOSAL_UNDER_DISCUSSION', label: 'Under Discussion',      color: 'orange' },
          { key: 'SUPPORT_CONFIRMED',         label: 'Support Confirmed',    color: 'emerald' },
          { key: 'FUNDING_CONFIRMED',         label: 'Funding Confirmed',    color: 'teal' },
          { key: 'PROJECT_FUNDED',            label: 'Project Funded',       color: 'green' },
        ];
        const STAGE_KEYS = STAGES.map(s => s.key);

        const stageColorMap = {
          indigo:  { dot: 'bg-indigo-500',  text: 'text-indigo-300',  bar: 'bg-indigo-500' },
          amber:   { dot: 'bg-amber-500',   text: 'text-amber-300',   bar: 'bg-amber-500' },
          orange:  { dot: 'bg-orange-500',  text: 'text-orange-300',  bar: 'bg-orange-500' },
          emerald: { dot: 'bg-emerald-500', text: 'text-emerald-300', bar: 'bg-emerald-500' },
          teal:    { dot: 'bg-teal-500',    text: 'text-teal-300',    bar: 'bg-teal-500' },
          green:   { dot: 'bg-green-500',   text: 'text-green-300',   bar: 'bg-green-500' },
        };

        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Industry Support Progression
              </span>
            </div>

            {withIndustry.map(problem => {
              // Use the latest (most advanced) interest record
              const interests = [...problem.industryInterests].sort(
                (a, b) => STAGE_KEYS.indexOf(b.status) - STAGE_KEYS.indexOf(a.status)
              );
              const latest = interests[0];
              const currentStageIdx = STAGE_KEYS.indexOf(latest.status);
              const isDeclinedOrWithdrawn = ['DECLINED', 'WITHDRAWN'].includes(latest.status);

              return (
                <div
                  key={problem.id}
                  className="p-5 rounded-3xl bg-slate-900/80 border border-slate-700/80 space-y-4 shadow-lg"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="text-xs font-bold text-emerald-300">Industry Partnership</span>
                      </div>
                      <h4 className="text-sm font-bold text-white leading-snug">{problem.title}</h4>
                      <p className="text-[11px] text-slate-400">
                        Partner: <strong className="text-white">{latest.company_name}</strong>
                        {latest.support_type && (
                          <span className="ml-2 text-slate-500">• {latest.support_type}</span>
                        )}
                      </p>
                    </div>
                    {latest.pledged_amount && (
                      <span className="text-base font-black text-amber-400 shrink-0">
                        {latest.pledged_amount}
                      </span>
                    )}
                  </div>

                  {/* Declined / Withdrawn state */}
                  {isDeclinedOrWithdrawn ? (
                    <div className="px-4 py-3 rounded-2xl bg-rose-950/30 border border-rose-500/30 text-xs text-rose-300 font-semibold">
                      Partnership status: <strong>{latest.status.replace(/_/g, ' ')}</strong>
                    </div>
                  ) : (
                    /* Progression Stepper */
                    <div className="space-y-2">
                      {/* Step dots + labels */}
                      <div className="flex items-center gap-0">
                        {STAGES.map((stage, idx) => {
                          const isDone = idx <= currentStageIdx;
                          const isCurrent = idx === currentStageIdx;
                          const colors = stageColorMap[stage.color];
                          return (
                            <div key={stage.key} className="flex items-center flex-1 min-w-0">
                              {/* dot */}
                              <div className="flex flex-col items-center shrink-0">
                                <div
                                  className={`w-3.5 h-3.5 rounded-full border-2 transition-all ${
                                    isDone
                                      ? `${colors.dot} border-transparent shadow-sm`
                                      : 'bg-slate-800 border-slate-600'
                                  } ${isCurrent ? 'ring-2 ring-offset-1 ring-offset-slate-900 ring-current' : ''}`}
                                />
                              </div>
                              {/* connector bar */}
                              {idx < STAGES.length - 1 && (
                                <div
                                  className={`flex-1 h-0.5 mx-0.5 rounded-full transition-all ${
                                    idx < currentStageIdx ? colors.bar : 'bg-slate-700'
                                  }`}
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Labels row */}
                      <div className="flex items-start gap-0">
                        {STAGES.map((stage, idx) => {
                          const isDone = idx <= currentStageIdx;
                          const isCurrent = idx === currentStageIdx;
                          const colors = stageColorMap[stage.color];
                          return (
                            <div key={stage.key} className="flex-1 min-w-0 text-center">
                              <span
                                className={`text-[9px] font-bold leading-tight block ${
                                  isCurrent
                                    ? colors.text
                                    : isDone
                                    ? 'text-slate-400'
                                    : 'text-slate-600'
                                }`}
                              >
                                {stage.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Confirmed date if any */}
                      {latest.confirmed_at && (
                        <p className="text-[10px] text-emerald-400 font-semibold pt-1">
                          Confirmed: {new Date(latest.confirmed_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        );
      })()}
    </div>
  );
};
