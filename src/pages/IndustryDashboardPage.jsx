import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Building2, HandCoins, Award, ShieldCheck, Sparkles, 
  ArrowUpRight, CheckCircle2, TrendingUp, Loader2, AlertCircle, RefreshCw, FolderOpen,
  Clock, Layers, FileText, CheckCircle, ChevronRight, DollarSign, MessageSquare
} from 'lucide-react';
import { ExpressInterestModal } from '../components/industry/ExpressInterestModal';
import { CategoryBadge, StatusBadge } from '../components/common/Badge';
import {
  getIndustryOpportunities,
  getMyInterests,
  getActiveFunding,
  getIndustryHistory,
  getIndustryStats,
  updateProposalStatus
} from '../services/industryService';

// ── Proposal status stepper ─────────────────────────────────────────────────
const PROPOSAL_STAGES = [
  { key: 'INTEREST_EXPRESSED',        label: 'Interest Expressed' },
  { key: 'PROPOSAL_INITIATED',        label: 'Proposal Initiated' },
  { key: 'PROPOSAL_UNDER_DISCUSSION', label: 'Proposal Under Discussion' },
  { key: 'SUPPORT_CONFIRMED',         label: 'Support Confirmed' },
  { key: 'FUNDING_CONFIRMED',         label: 'Funding Confirmed' },
  { key: 'PROJECT_FUNDED',            label: 'Project Funded' },
];

function ProposalStepper({ status }) {
  const idx = PROPOSAL_STAGES.findIndex(s => s.key === status);
  const pct = Math.max(5, Math.round(((idx + 1) / PROPOSAL_STAGES.length) * 100));
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1 flex-wrap">
        {PROPOSAL_STAGES.map((s, i) => (
          <React.Fragment key={s.key}>
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded whitespace-nowrap ${
              i < idx ? 'bg-emerald-500/20 text-emerald-300' :
              i === idx ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
              'text-slate-600'
            }`}>{s.label}</span>
            {i < PROPOSAL_STAGES.length - 1 && (
              <ChevronRight className="w-3 h-3 text-slate-700 shrink-0" />
            )}
          </React.Fragment>
        ))}
      </div>
      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
        <div
          className="bg-gradient-to-r from-emerald-500 to-amber-400 h-full rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ── Status badge colours ────────────────────────────────────────────────────
function InterestStatusBadge({ status }) {
  const cfg = {
    INTEREST_EXPRESSED:        'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    PROPOSAL_INITIATED:        'bg-amber-500/20 text-amber-300 border-amber-500/30',
    PROPOSAL_UNDER_DISCUSSION: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    SUPPORT_CONFIRMED:         'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    FUNDING_CONFIRMED:         'bg-teal-500/20 text-teal-300 border-teal-500/30',
    PROJECT_FUNDED:            'bg-green-500/20 text-green-300 border-green-500/30',
    DECLINED:                  'bg-rose-500/20 text-rose-300 border-rose-500/30',
    WITHDRAWN:                 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  };
  const label = {
    INTEREST_EXPRESSED:        'Interest Expressed',
    PROPOSAL_INITIATED:        'Proposal Initiated',
    PROPOSAL_UNDER_DISCUSSION: 'Proposal Under Discussion',
    SUPPORT_CONFIRMED:         'Support Confirmed',
    FUNDING_CONFIRMED:         'Funding Confirmed',
    PROJECT_FUNDED:            'Project Funded',
    DECLINED:                  'Declined',
    WITHDRAWN:                 'Withdrawn',
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${cfg[status] || 'bg-slate-800 text-slate-400 border-slate-700'}`}>
      {label[status] || status}
    </span>
  );
}

// ── Main Component ──────────────────────────────────────────────────────────
export const IndustryDashboardPage = () => {
  const { navigate, isLoggedIn, user } = useApp();

  const [activeTab, setActiveTab] = useState('opportunities');
  const [opportunities, setOpportunities] = useState([]);
  const [myInterests, setMyInterests] = useState([]);       // INTEREST_EXPRESSED / PROPOSAL_*
  const [activeFunding, setActiveFunding] = useState([]);   // SUPPORT_CONFIRMED / FUNDING_CONFIRMED
  const [history, setHistory] = useState([]);               // PROJECT_FUNDED
  const [stats, setStats] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedProblemForInterest, setSelectedProblemForInterest] = useState(null);
  const [advancingId, setAdvancingId] = useState(null);

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
      status: ch.status,
      districtName: distName,
      assignedUniversity: assignedUnivName ? { name: assignedUnivName } : null,
      solutionSubmission: ch.solution_submission,
    };
  };

  const fetchIndustryData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [oppData, statsData, interestsData, activeFundData, historyData] = await Promise.all([
        getIndustryOpportunities(),
        getIndustryStats().catch(() => null),
        isLoggedIn ? getMyInterests().catch(() => []) : Promise.resolve([]),
        isLoggedIn ? getActiveFunding().catch(() => []) : Promise.resolve([]),
        isLoggedIn ? getIndustryHistory().catch(() => []) : Promise.resolve([]),
      ]);
      setOpportunities(oppData.map(mapApiToUI));
      setStats(statsData);
      setMyInterests(interestsData);
      setActiveFunding(activeFundData);
      setHistory(historyData);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load industry data.');
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn]);

  useEffect(() => { fetchIndustryData(); }, [fetchIndustryData]);

  const handleAdvanceStatus = async (requestId, targetStatus, label) => {
    setAdvancingId(requestId);
    try {
      await updateProposalStatus(requestId, { status: targetStatus });
      await fetchIndustryData();
    } catch (err) {
      alert(err.response?.data?.detail || `Failed to advance to ${label}.`);
    } finally {
      setAdvancingId(null);
    }
  };

  const tabs = [
    { id: 'opportunities',  label: `1. Validated Solutions`, icon: Sparkles,    count: opportunities.length },
    { id: 'my-interests',   label: `2. My Funding Interests`, icon: HandCoins,  count: myInterests.length },
    { id: 'active-funding', label: `3. Active Partnerships`, icon: TrendingUp,  count: activeFunding.length },
    { id: 'funded-history', label: `4. Funded Projects`,     icon: Award,       count: history.length },
    { id: 'profile',        label: `5. Profile`,              icon: Building2,   count: null },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left">

      {/* Header Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-teal-950/80 border border-emerald-500/40 p-6 sm:p-8 backdrop-blur-xl shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
              <Building2 className="w-3.5 h-3.5" />
              <span>Corporate CSR, Startup &amp; Industry Ecosystem</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Validated &amp; Deployed University Solutions
            </h1>
            <p className="text-xs text-slate-300 leading-relaxed">
              Discover government-validated university R&amp;D solutions actively seeking corporate CSR funding, technology mentorship, and pilot deployment support.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 shrink-0">
            <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700 text-center">
              <span className="text-[9px] text-slate-400 font-bold uppercase block">Opportunities</span>
              <span className="text-lg font-extrabold text-emerald-400 mt-0.5 block">{stats?.available_opportunities ?? opportunities.length}</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700 text-center">
              <span className="text-[9px] text-slate-400 font-bold uppercase block">Active Proposals</span>
              <span className="text-lg font-extrabold text-indigo-400 mt-0.5 block">{stats?.active_proposals ?? myInterests.length}</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700 text-center">
              <span className="text-[9px] text-slate-400 font-bold uppercase block">Partnerships</span>
              <span className="text-lg font-extrabold text-amber-400 mt-0.5 block">{stats?.active_funding ?? activeFunding.length}</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700 text-center">
              <span className="text-[9px] text-slate-400 font-bold uppercase block">Funded Projects</span>
              <span className="text-lg font-extrabold text-teal-400 mt-0.5 block">{stats?.funded_projects ?? history.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 overflow-x-auto gap-2">
        <div className="flex items-center gap-2 shrink-0">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}{tab.count !== null ? ` (${tab.count})` : ''}</span>
              </button>
            );
          })}
        </div>
        <button
          onClick={fetchIndustryData}
          className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-white flex items-center gap-1.5 shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span className="text-xs font-bold hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="py-16 text-center space-y-3 bg-slate-900/40 border border-slate-800 rounded-3xl">
          <Loader2 className="w-8 h-8 text-emerald-400 animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-300">Loading industry partnership data...</p>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="py-12 px-6 text-center space-y-4 bg-rose-950/20 border border-rose-500/30 rounded-3xl">
          <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
          <p className="text-xs text-rose-300">{error}</p>
          <button onClick={fetchIndustryData} className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-bold text-white inline-flex items-center gap-1.5">
            <RefreshCw className="w-3.5 h-3.5" /> Retry
          </button>
        </div>
      )}

      {/* ── TAB 1: VALIDATED & DEPLOYED SOLUTIONS (OPPORTUNITIES) ──────── */}
      {!loading && !error && activeTab === 'opportunities' && (
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Status: INDUSTRY_SUPPORT_REQUESTED
            </span>
            <span className="text-xs text-slate-400">Only validated solutions where the university is actively seeking industry support</span>
          </div>
          {opportunities.length === 0 ? (
            <div className="py-16 px-6 text-center space-y-4 bg-slate-900/40 border border-slate-800 rounded-3xl">
              <FolderOpen className="w-10 h-10 text-slate-500 mx-auto" />
              <div className="space-y-1 max-w-md mx-auto">
                <h4 className="text-sm font-bold text-white">No Opportunities Available</h4>
                <p className="text-xs text-slate-400">
                  No validated university solutions are currently seeking industry support. Check back as universities submit and seek funding for their approved R&amp;D solutions.
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
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        Seeking Industry Support
                      </span>
                    </div>
                    <h3
                      onClick={() => navigate(`/project/${prob.id}`)}
                      className="text-base font-bold text-white group-hover:text-emerald-300 cursor-pointer transition-colors leading-snug line-clamp-2"
                    >
                      {prob.title}
                    </h3>
                    <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">{prob.description}</p>
                    <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1 text-[11px]">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">University R&amp;D Team:</span>
                        <span className="font-bold text-indigo-300">{prob.assignedUniversity?.name || 'Assigned R&D Cell'}</span>
                      </div>
                      {prob.solutionSubmission && (
                        <div className="flex items-center justify-between pt-1 border-t border-slate-800">
                          <span className="text-slate-400">Validated Solution:</span>
                          <span className="font-bold text-emerald-400 line-clamp-1">{prob.solutionSubmission.title}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between pt-1 border-t border-slate-800">
                        <span className="text-slate-400">District:</span>
                        <span className="font-bold text-white">{prob.districtName}</span>
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
                      <span>Express Funding Interest</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 2: MY FUNDING INTERESTS (INTEREST_EXPRESSED → PROPOSAL_UNDER_DISCUSSION) ── */}
      {!loading && !error && activeTab === 'my-interests' && (
        <div className="space-y-4">
          <p className="text-xs text-slate-400">
            Active proposals in negotiation. <strong className="text-white">Interest Expressed</strong> does not mean funding has been committed.
            Use the action buttons to advance the proposal stage.
          </p>
          {myInterests.length === 0 ? (
            <div className="py-12 px-6 text-center bg-slate-900/40 border border-slate-800 rounded-3xl text-slate-400 text-xs">
              No active proposal negotiations in progress. Express interest in a validated solution above.
            </div>
          ) : (
            myInterests.map(req => (
              <div key={req.id} className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 text-left">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-white text-sm">{req.company_name}</span>
                      <InterestStatusBadge status={req.status} />
                    </div>
                    <p className="text-xs text-slate-400">Submitted: {new Date(req.created_at).toLocaleDateString()}</p>
                  </div>
                  <span className="text-xs font-bold text-emerald-400 shrink-0">
                    {req.pledged_amount || 'Non-financial support'}
                  </span>
                </div>

                <ProposalStepper status={req.status} />

                <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1.5 text-xs">
                  <div className="flex items-center gap-2 text-slate-400">
                    <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                    <span className="text-slate-300 italic">"{req.message}"</span>
                  </div>
                  {req.proposal_summary && (
                    <p className="text-slate-300 pt-1 border-t border-slate-800">{req.proposal_summary}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                  <div>Support Type: <strong className="text-white">{req.support_type}</strong></div>
                  <div>Contact: <strong className="text-white">{req.contact_email}</strong></div>
                </div>

                {/* Industry-role action buttons */}
                <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800">
                  {req.status === 'INTEREST_EXPRESSED' && (
                    <button
                      disabled={advancingId === req.id}
                      onClick={() => handleAdvanceStatus(req.id, 'PROPOSAL_INITIATED', 'Proposal Initiated')}
                      className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 disabled:opacity-60"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      {advancingId === req.id ? 'Advancing...' : 'Initiate Proposal'}
                    </button>
                  )}
                  {req.status === 'PROPOSAL_INITIATED' && (
                    <button
                      disabled={advancingId === req.id}
                      onClick={() => handleAdvanceStatus(req.id, 'PROPOSAL_UNDER_DISCUSSION', 'Proposal Under Discussion')}
                      className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center gap-1.5 disabled:opacity-60"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      {advancingId === req.id ? 'Advancing...' : 'Move to Discussion'}
                    </button>
                  )}
                  {(req.status === 'INTEREST_EXPRESSED' || req.status === 'PROPOSAL_INITIATED' || req.status === 'PROPOSAL_UNDER_DISCUSSION') && (
                    <button
                      disabled={advancingId === req.id}
                      onClick={() => { if (window.confirm('Withdraw your interest in this project?')) handleAdvanceStatus(req.id, 'WITHDRAWN', 'Withdrawn'); }}
                      className="px-3 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-bold"
                    >
                      Withdraw Interest
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── TAB 3: ACTIVE PARTNERSHIPS (SUPPORT_CONFIRMED / FUNDING_CONFIRMED) ── */}
      {!loading && !error && activeTab === 'active-funding' && (
        <div className="space-y-4">
          <p className="text-xs text-slate-400">
            Partnerships where support has been confirmed. Industry must confirm funding before the project is marked as funded.
          </p>
          {activeFunding.length === 0 ? (
            <div className="py-12 px-6 text-center bg-slate-900/40 border border-slate-800 rounded-3xl text-slate-400 text-xs">
              No active confirmed partnerships yet. These appear once University confirms support.
            </div>
          ) : (
            activeFunding.map(req => (
              <div key={req.id} className="p-6 rounded-3xl bg-slate-900 border border-emerald-500/40 space-y-4 text-left">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="space-y-1">
                    <InterestStatusBadge status={req.status} />
                    <h3 className="text-sm font-bold text-white mt-1">{req.company_name} ↔ University R&amp;D Collaboration</h3>
                  </div>
                  <span className="text-xs font-bold text-emerald-400">{req.pledged_amount || 'Support Confirmed'}</span>
                </div>

                <ProposalStepper status={req.status} />

                <p className="text-xs text-slate-300">{req.proposal_summary || req.message}</p>

                <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 grid grid-cols-2 gap-3 text-xs text-slate-300">
                  <div>Support Category: <strong className="text-emerald-300">{req.support_type}</strong></div>
                  <div>Confirmed: <strong>{req.confirmed_at ? new Date(req.confirmed_at).toLocaleDateString() : '—'}</strong></div>
                </div>

                {/* Industry confirms funding / marks project funded */}
                <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800">
                  {req.status === 'SUPPORT_CONFIRMED' && (
                    <button
                      disabled={advancingId === req.id}
                      onClick={() => handleAdvanceStatus(req.id, 'FUNDING_CONFIRMED', 'Funding Confirmed')}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold flex items-center gap-1.5 disabled:opacity-60"
                    >
                      <DollarSign className="w-3.5 h-3.5" />
                      {advancingId === req.id ? 'Confirming...' : 'Confirm Funding Commitment'}
                    </button>
                  )}
                  {req.status === 'FUNDING_CONFIRMED' && (
                    <button
                      disabled={advancingId === req.id}
                      onClick={() => {
                        if (window.confirm('Mark this project as fully funded? This will mark the challenge as COMPLETED.'))
                          handleAdvanceStatus(req.id, 'PROJECT_FUNDED', 'Project Funded');
                      }}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal-600 to-green-600 hover:from-teal-500 hover:to-green-500 text-white text-xs font-bold flex items-center gap-1.5 disabled:opacity-60"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {advancingId === req.id ? 'Processing...' : 'Mark Project Funded'}
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── TAB 4: FUNDED PROJECTS / HISTORY ─────────────────────────── */}
      {!loading && !error && activeTab === 'funded-history' && (
        <div className="space-y-4">
          {history.length === 0 ? (
            <div className="py-12 px-6 text-center bg-slate-900/40 border border-slate-800 rounded-3xl text-slate-400 text-xs">
              No completed funded projects yet.
            </div>
          ) : (
            history.map(item => (
              <div key={item.id} className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-3 text-left">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-white">{item.company_name}</span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-green-500/20 text-green-300 border border-green-500/30">
                      PROJECT FUNDED — PROBLEM RESOLVED
                    </span>
                  </div>
                  <span className="text-xs font-extrabold text-emerald-400">{item.pledged_amount || 'Support Provided'}</span>
                </div>
                <p className="text-xs text-slate-300">{item.proposal_summary || item.message}</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                  <div>Support: <strong className="text-slate-200">{item.support_type}</strong></div>
                  <div>Contact: <strong className="text-slate-200">{item.contact_email}</strong></div>
                  <div>Funded on: <strong className="text-emerald-400">{item.confirmed_at ? new Date(item.confirmed_at).toLocaleDateString() : '—'}</strong></div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── TAB 5: PROFILE ───────────────────────────────────────────── */}
      {!loading && !error && activeTab === 'profile' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 text-left max-w-3xl">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-extrabold text-xl">
              {(user?.full_name || user?.organization || 'I').charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">{user?.full_name || user?.organization || 'Industry Partner'}</h2>
              <p className="text-xs text-slate-400">{user?.email} • Corporate CSR Partner</p>
              <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Authenticated Industry Account
              </span>
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2 text-xs text-slate-300">
            <h4 className="font-bold text-white uppercase text-[11px] tracking-wider">Partnership Guidelines</h4>
            <ul className="space-y-1 list-disc list-inside text-slate-400">
              <li>Express interest in government-validated university solutions</li>
              <li>Negotiate support directly with the university R&amp;D team</li>
              <li>Confirm funding only when a real commitment is made</li>
              <li>Admin monitors partnerships as read-only governance oversight</li>
            </ul>
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
