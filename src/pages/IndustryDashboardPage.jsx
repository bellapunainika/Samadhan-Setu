import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Building2, HandCoins, Award, ShieldCheck, Sparkles, 
  ArrowUpRight, Filter, Search, CheckCircle2, TrendingUp, Loader2, AlertCircle, RefreshCw, FolderOpen,
  UserCheck, ExternalLink, Clock, DollarSign, Layers, FileText, CheckCircle
} from 'lucide-react';
import { ExpressInterestModal } from '../components/industry/ExpressInterestModal';
import { CategoryBadge, StatusBadge } from '../components/common/Badge';
import { getIndustryOpportunities, getMyInterests, getIndustryHistory, getIndustryStats } from '../services/industryService';

export const IndustryDashboardPage = () => {
  const { navigate, isLoggedIn, user } = useApp();

  const [activeTab, setActiveTab] = useState('opportunities'); // 'opportunities' | 'my-interests' | 'active-funding' | 'funded-history' | 'profile'
  const [opportunities, setOpportunities] = useState([]);
  const [myInterests, setMyInterests] = useState([]);
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedProblemForInterest, setSelectedProblemForInterest] = useState(null);

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
      submittedAt: ch.created_at ? new Date(ch.created_at).toLocaleDateString() : 'Just now',
      aiPrediction: ch.ai_prediction,
      evidenceFiles: ch.evidence_files || [],
      assignedUniversity: assignedUnivName ? { name: assignedUnivName } : null,
      solutionSubmission: ch.solution_submission,
      isRealDatabaseRecord: true
    };
  };

  const fetchIndustryData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [oppData, statsData, interestsData, historyData] = await Promise.all([
        getIndustryOpportunities(),
        getIndustryStats().catch(() => null),
        isLoggedIn ? getMyInterests().catch(() => []) : Promise.resolve([]),
        isLoggedIn ? getIndustryHistory().catch(() => []) : Promise.resolve([])
      ]);
      setOpportunities(oppData.map(mapApiToUI));
      setStats(statsData);
      setMyInterests(interestsData);
      setHistory(historyData);
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to load industry opportunity data.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    fetchIndustryData();
  }, [fetchIndustryData]);

  // Filter interests into active vs pending
  const activeFundingInterests = myInterests.filter(i => 
    ['SUPPORT_CONFIRMED', 'FUNDING_CONFIRMED', 'PROJECT_FUNDED', 'ACCEPTED'].includes(i.status)
  );
  
  const pendingFundingInterests = myInterests.filter(i => 
    ['FUNDING_INTEREST', 'PROPOSAL_INITIATED', 'PROPOSAL_UNDER_DISCUSSION', 'PENDING_ADMIN_REVIEW'].includes(i.status)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left">
      {/* Industry Header Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-teal-950/80 border border-emerald-500/40 p-6 sm:p-8 backdrop-blur-xl shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
              <Building2 className="w-3.5 h-3.5" />
              <span>Corporate CSR, Startup &amp; Industry Ecosystem</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              State-Validated University R&amp;D Opportunities
            </h1>
            <p className="text-xs text-slate-300 leading-relaxed">
              Discover government-validated university R&amp;D solutions eligible for corporate CSR funding, technology mentorship, pilot deployment, and industrial scale.
            </p>
          </div>

          {/* Real Metrics Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 shrink-0">
            <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700 text-center">
              <span className="text-[9px] text-slate-400 font-bold uppercase block">Opportunities</span>
              <span className="text-lg font-extrabold text-emerald-400 mt-0.5 block">{stats?.available_opportunities ?? opportunities.length}</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700 text-center">
              <span className="text-[9px] text-slate-400 font-bold uppercase block">My Interests</span>
              <span className="text-lg font-extrabold text-indigo-400 mt-0.5 block">{pendingFundingInterests.length}</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700 text-center">
              <span className="text-[9px] text-slate-400 font-bold uppercase block">Active Funding</span>
              <span className="text-lg font-extrabold text-amber-400 mt-0.5 block">{activeFundingInterests.length}</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700 text-center">
              <span className="text-[9px] text-slate-400 font-bold uppercase block">Funded Projects</span>
              <span className="text-lg font-extrabold text-teal-400 mt-0.5 block">{history.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 5 Standard Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 overflow-x-auto">
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('opportunities')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'opportunities'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>1. Opportunities ({opportunities.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('my-interests')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'my-interests'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <HandCoins className="w-3.5 h-3.5" />
            <span>2. My Funding Interests ({pendingFundingInterests.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('active-funding')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'active-funding'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>3. Active Funding ({activeFundingInterests.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('funded-history')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'funded-history'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>4. Funded Projects / History ({history.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'profile'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>5. Profile</span>
          </button>
        </div>

        <button
          onClick={fetchIndustryData}
          className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-white text-xs font-bold flex items-center gap-1.5 shrink-0"
          title="Refresh Data"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="py-16 text-center space-y-3 bg-slate-900/40 border border-slate-800 rounded-3xl">
          <Loader2 className="w-8 h-8 text-emerald-400 animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-300">Fetching live PostgreSQL opportunity records for Industry Portal...</p>
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
            onClick={fetchIndustryData}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white inline-flex items-center gap-1.5 border border-slate-700"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Connection</span>
          </button>
        </div>
      )}

      {/* TAB 1: OPPORTUNITIES */}
      {!loading && !error && activeTab === 'opportunities' && (
        <div className="space-y-6">
          {opportunities.length === 0 ? (
            <div className="py-16 px-6 text-center space-y-4 bg-slate-900/40 border border-slate-800 rounded-3xl">
              <FolderOpen className="w-10 h-10 text-slate-500 mx-auto" />
              <div className="space-y-1 max-w-md mx-auto">
                <h4 className="text-sm font-bold text-white">No Opportunities Available</h4>
                <p className="text-xs text-slate-400">
                  There are currently no validated university solutions released for industry funding discovery.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {opportunities.map(prob => (
                <div
                  key={prob.id}
                  className="p-6 rounded-3xl bg-slate-900/85 border border-slate-700/80 hover:border-emerald-500/50 backdrop-blur-xl shadow-xl space-y-4 flex flex-col justify-between group text-left"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <CategoryBadge category={prob.category} />
                      <StatusBadge status={prob.status} />
                    </div>

                    <h3
                      onClick={() => navigate(`/project/${prob.id}`)}
                      className="text-base font-bold text-white group-hover:text-emerald-300 cursor-pointer transition-colors leading-snug line-clamp-2"
                    >
                      {prob.title}
                    </h3>

                    <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                      {prob.description}
                    </p>

                    {/* Metadata summary */}
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between text-slate-400 text-[11px]">
                        <span>District: <strong className="text-slate-200">{prob.districtName}</strong></span>
                        <span>Stage: <strong className="text-emerald-400">{prob.status}</strong></span>
                      </div>

                      <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1 text-[11px]">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">University R&amp;D Team:</span>
                          <span className="font-bold text-indigo-300">
                            {prob.assignedUniversity?.name || 'Assigned R&D Cell'}
                          </span>
                        </div>
                        {prob.solutionSubmission && (
                          <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[11px]">
                            <span className="text-slate-400">Validated Solution:</span>
                            <span className="font-bold text-emerald-400 line-clamp-1">{prob.solutionSubmission.title}</span>
                          </div>
                        )}
                      </div>

                      <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-500/20 text-[11px] text-emerald-300 flex items-center justify-between">
                        <span>Support Sought:</span>
                        <span className="font-semibold text-white">CSR Grant / Co-Development</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                    <button
                      onClick={() => navigate(`/project/${prob.id}`)}
                      className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1"
                    >
                      View Details <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => setSelectedProblemForInterest(prob)}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition-all hover:scale-105"
                    >
                      <HandCoins className="w-3.5 h-3.5" />
                      <span>Express Interest</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MY FUNDING INTERESTS */}
      {!loading && !error && activeTab === 'my-interests' && (
        <div className="space-y-4">
          {pendingFundingInterests.length === 0 ? (
            <div className="py-12 px-6 text-center bg-slate-900/40 border border-slate-800 rounded-3xl text-slate-400 text-xs">
              No active proposal negotiations currently in progress.
            </div>
          ) : (
            pendingFundingInterests.map(req => (
              <div key={req.id} className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 text-left">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{req.company_name}</span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {req.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">Message: "{req.message}"</p>
                  </div>
                  <span className="text-[11px] text-slate-400 shrink-0">
                    Submitted: {new Date(req.created_at).toLocaleDateString()}
                  </span>
                </div>

                {/* Status Stepper */}
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
                    <span className="text-emerald-400 flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> 1. Interest Expressed</span>
                    <span className={req.status === 'PROPOSAL_UNDER_DISCUSSION' ? 'text-amber-400' : 'text-slate-500'}>2. Proposal Under Discussion</span>
                    <span className="text-slate-500">3. Support Confirmed</span>
                    <span className="text-slate-500">4. Project Funded</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-emerald-500 to-amber-400 h-full w-1/2"></div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-400 border-t border-slate-800/80 pt-3">
                  <div>Support Type: <strong className="text-white">{req.support_type}</strong></div>
                  <div>Pledged Value: <strong className="text-emerald-400">{req.pledged_amount || 'Non-Financial Support'}</strong></div>
                  <div>Contact: <strong className="text-white">{req.contact_email}</strong></div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 3: ACTIVE FUNDING */}
      {!loading && !error && activeTab === 'active-funding' && (
        <div className="space-y-4">
          {activeFundingInterests.length === 0 ? (
            <div className="py-12 px-6 text-center bg-slate-900/40 border border-slate-800 rounded-3xl text-slate-400 text-xs">
              No active funded projects currently confirmed.
            </div>
          ) : (
            activeFundingInterests.map(req => (
              <div key={req.id} className="p-6 rounded-3xl bg-slate-900 border border-emerald-500/40 space-y-4 text-left">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      SUPPORT CONFIRMED / ACTIVE FUNDING
                    </span>
                    <h3 className="text-sm font-bold text-white">{req.company_name} ↔ University R&amp;D Collaboration</h3>
                  </div>
                  <span className="text-xs font-bold text-emerald-400">{req.pledged_amount || 'Support Confirmed'}</span>
                </div>

                <p className="text-xs text-slate-300">{req.proposal_summary || req.message}</p>

                <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between text-xs text-slate-300">
                  <span>Support Category: <strong className="text-emerald-300">{req.support_type}</strong></span>
                  <span>Confirmation Date: <strong>{req.confirmed_at ? new Date(req.confirmed_at).toLocaleDateString() : 'Confirmed'}</strong></span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 4: FUNDED PROJECTS / HISTORY */}
      {!loading && !error && activeTab === 'funded-history' && (
        <div className="space-y-4">
          {history.length === 0 ? (
            <div className="py-12 px-6 text-center bg-slate-900/40 border border-slate-800 rounded-3xl text-slate-400 text-xs">
              No historical completed funded projects found in PostgreSQL.
            </div>
          ) : (
            history.map(item => (
              <div key={item.id} className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-3 text-left">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">{item.company_name}</span>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        COMPLETED &amp; RESOLVED
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-800 text-slate-400">
                        DEMO DATA
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-extrabold text-emerald-400">{item.pledged_amount || 'Pledged Grant'}</span>
                </div>

                <p className="text-xs text-slate-300">{item.message}</p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                  <div>Support: <strong className="text-slate-200">{item.support_type}</strong></div>
                  <div>Contact: <strong className="text-slate-200">{item.contact_email}</strong></div>
                  <div>Status: <strong className="text-emerald-400">Project Funded &amp; Deployed</strong></div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 5: PROFILE */}
      {!loading && !error && activeTab === 'profile' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 text-left max-w-3xl">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-extrabold text-xl">
              T
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">{user?.full_name || 'Tata Steel CSR Foundation'}</h2>
              <p className="text-xs text-slate-400">{user?.email || 'csr@tatasteel.com'} • Corporate CSR Partner Identity</p>
              <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                PostgreSQL Authenticated Partner
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2 text-xs text-slate-300">
            <h4 className="font-bold text-white uppercase text-[11px] tracking-wider">CSR Mandate &amp; Focus Sectors</h4>
            <p>Directing corporate social responsibility grants toward university-developed R&amp;D solutions addressing clean water, rural infrastructure, mining safety, and agricultural technology across Jharkhand.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3 rounded-2xl bg-slate-800/50 border border-slate-700">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Authorized Signatory</span>
              <span className="font-bold text-white">Head of CSR &amp; Community Relations</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-800/50 border border-slate-700">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">State Governance Portal</span>
              <span className="font-bold text-emerald-400">Samadhan Setu SIH 2026</span>
            </div>
          </div>
        </div>
      )}

      {/* Express Interest Modal */}
      {selectedProblemForInterest && (
        <ExpressInterestModal
          isOpen={!!selectedProblemForInterest}
          onClose={() => {
            setSelectedProblemForInterest(null);
            fetchIndustryData();
          }}
          problem={selectedProblemForInterest}
        />
      )}
    </div>
  );
};
