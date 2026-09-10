import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Building2, HandCoins, Award, ShieldCheck, Sparkles, 
  ArrowUpRight, Filter, Search, CheckCircle2, TrendingUp, Loader2, AlertCircle, RefreshCw, FolderOpen
} from 'lucide-react';
import { ExpressInterestModal } from '../components/industry/ExpressInterestModal';
import { CategoryBadge, StatusBadge } from '../components/common/Badge';
import { getIndustryOpportunities, getMyInterests, getIndustryStats } from '../services/industryService';

export const IndustryDashboardPage = () => {
  const { navigate, isLoggedIn } = useApp();

  const [activeTab, setActiveTab] = useState('opportunities'); // 'opportunities' | 'my-interests'
  const [opportunities, setOpportunities] = useState([]);
  const [myInterests, setMyInterests] = useState([]);
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
      const [oppData, statsData, interestsData] = await Promise.all([
        getIndustryOpportunities(),
        getIndustryStats().catch(() => null),
        isLoggedIn ? getMyInterests().catch(() => []) : Promise.resolve([])
      ]);
      setOpportunities(oppData.map(mapApiToUI));
      setStats(statsData);
      setMyInterests(interestsData);
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left">
      {/* Industry Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-emerald-950/70 via-slate-900 to-teal-950/70 border border-emerald-500/40 p-6 sm:p-8 backdrop-blur-xl shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
              <Building2 className="w-3.5 h-3.5" />
              <span>Corporate CSR, Startup &amp; MSME Partnership Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Invest in Validated Grassroots Solutions
            </h1>
            <p className="text-xs text-slate-300 leading-relaxed">
              Explore state-approved grassroots challenges and university R&amp;D projects eligible for CSR funding, technical mentorship, and pilot scale.
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
              <span className="text-lg font-extrabold text-indigo-400 mt-0.5 block">{stats?.total_my_interests ?? myInterests.length}</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700 text-center">
              <span className="text-[9px] text-slate-400 font-bold uppercase block">Pending</span>
              <span className="text-lg font-extrabold text-amber-400 mt-0.5 block">{stats?.pending_requests ?? 0}</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700 text-center">
              <span className="text-[9px] text-slate-400 font-bold uppercase block">Accepted</span>
              <span className="text-lg font-extrabold text-teal-400 mt-0.5 block">{stats?.accepted_requests ?? 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('opportunities')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'opportunities'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Eligible R&amp;D Opportunities ({opportunities.length})</span>
          </button>
          {isLoggedIn && (
            <button
              onClick={() => setActiveTab('my-interests')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'my-interests'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <HandCoins className="w-3.5 h-3.5" />
              <span>My Expressed Requests ({myInterests.length})</span>
            </button>
          )}
        </div>

        <button
          onClick={fetchIndustryData}
          className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-white text-xs font-bold flex items-center gap-1.5"
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
          <p className="text-xs font-semibold text-slate-300">Fetching PostgreSQL opportunity records for Industry Portal...</p>
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

      {/* Empty State */}
      {!loading && !error && activeTab === 'opportunities' && opportunities.length === 0 && (
        <div className="py-16 px-6 text-center space-y-4 bg-slate-900/40 border border-slate-800 rounded-3xl">
          <FolderOpen className="w-10 h-10 text-slate-500 mx-auto" />
          <div className="space-y-1 max-w-md mx-auto">
            <h4 className="text-sm font-bold text-white">No Opportunities Available</h4>
            <p className="text-xs text-slate-400">
              There are currently no approved or active R&amp;D projects available for industry co-development.
            </p>
          </div>
        </div>
      )}

      {/* My Interests List */}
      {!loading && !error && activeTab === 'my-interests' && (
        <div className="space-y-4">
          {myInterests.length === 0 ? (
            <div className="py-12 px-6 text-center bg-slate-900/40 border border-slate-800 rounded-3xl text-slate-400 text-xs">
              You have not submitted any partnership interest requests yet.
            </div>
          ) : (
            myInterests.map(req => (
              <div key={req.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{req.company_name}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      req.status === 'ACCEPTED' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                      req.status === 'DECLINED' ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' :
                      'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    }`}>
                      {req.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">{req.message}</p>
                  <div className="text-[11px] text-slate-400 flex items-center gap-3 pt-1">
                    <span>Support: {req.support_type}</span>
                    <span>Contact: {req.contact_email}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Opportunities Grid */}
      {!loading && !error && activeTab === 'opportunities' && opportunities.length > 0 && (
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

                {/* University Info */}
                <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Assigned R&amp;D Institution:</span>
                    <span className="font-bold text-indigo-300">
                      {prob.assignedUniversity?.name || 'Awaiting Assignment'}
                    </span>
                  </div>
                  {prob.solutionSubmission && (
                    <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-800">
                      <span className="text-slate-400">Solution:</span>
                      <span className="font-bold text-emerald-400">{prob.solutionSubmission.title}</span>
                    </div>
                  )}
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
