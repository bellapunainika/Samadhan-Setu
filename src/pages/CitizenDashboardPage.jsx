import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Users, PlusCircle, CheckCircle2, Clock, Heart, 
  MapPin, Flame, Filter, Search, ArrowRight, Sparkles, GitMerge
} from 'lucide-react';
import { ChallengeCard } from '../components/citizen/ChallengeCard';
import { StatusBadge, UrgencyPill } from '../components/common/Badge';

export const CitizenDashboardPage = () => {
  const { problems, setIsSubmitModalOpen, isSubmitModalOpen, navigate } = useApp();

  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'my' | 'upvoted'
  const [districtFilter, setDistrictFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter problems for citizen view
  const mySubmissions = problems.filter(p => p.submitterType?.includes('Gram') || p.id === 'JH-2026-003' || p.id.startsWith('JH-2026-9'));
  const upvotedProblems = problems.filter(p => p.hasUpvoted);

  const displayedProblems = problems.filter(p => {
    if (activeTab === 'my') return mySubmissions.some(m => m.id === p.id);
    if (activeTab === 'upvoted') return p.hasUpvoted;
    const matchDist = districtFilter === 'All' || p.districtName === districtFilter;
    const matchQuery = !searchQuery.trim() || 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchDist && matchQuery;
  });

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
            onClick={() => setActiveTab('my')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'my'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            My Submissions ({mySubmissions.length})
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

        {/* Search */}
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

      {/* Challenge Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayedProblems.map(problem => (
          <ChallengeCard key={problem.id} problem={problem} />
        ))}
      </div>
    </div>
  );
};
