import React from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, CheckCircle2, AlertTriangle, BrainCircuit, 
  ArrowRight, GraduationCap, ShieldCheck, MapPin, GitMerge, Info, Clock
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AiProcessingModal = ({ challengeData, onComplete, onCancel }) => {
  const { navigate, showToast } = useApp();

  const ai = challengeData?.ai_prediction;
  const universities = ai?.recommended_universities || [];

  const handleFinish = () => {
    showToast(
      'Challenge Registered', 
      `Challenge #${challengeData.short_id} registered under status: UNDER REVIEW.`, 
      'success'
    );
    onComplete(challengeData);
    navigate(`/dashboard/citizen`);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl rounded-3xl bg-[#0F172A] border border-indigo-500/50 shadow-2xl overflow-hidden text-left"
      >
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-indigo-950/80 via-slate-900 to-indigo-950/80 border-b border-indigo-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-600 text-white shadow-lg">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <span>AI Problem Analysis & Recommendation Engine</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                  {ai?.model_version || 'rule-hybrid-v1'}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Transparent sector classification, priority index calculation, and Jharkhand institution matching.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Status Banner */}
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Clock className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <h5 className="text-xs font-bold text-white">Challenge Status: UNDER REVIEW</h5>
                <p className="text-[11px] text-amber-300">Registered with ID <strong>{challengeData.short_id}</strong>. Awaiting Nodal Admin review before university routing.</p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40 shrink-0">
              Priority: {ai?.priority_score || 70}/100 ({ai?.priority_label || 'HIGH'})
            </span>
          </div>

          {/* Sector Classification & Rationale */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-700/80 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                AI Primary Sector Classification
              </span>
              <span className="text-xs font-bold text-indigo-300 bg-indigo-500/20 px-2.5 py-0.5 rounded-full border border-indigo-500/30">
                {ai?.primary_sector || challengeData.category}
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {ai?.overall_explanation || 'Priority score calculated from citizen severity, affected population, and critical health keywords.'}
            </p>
            {ai?.keywords && ai.keywords.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {ai.keywords.map((kw, i) => (
                  <span key={i} className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                    #{kw}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Deduplication Card */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-700/80 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-300 flex items-center gap-1.5">
                <GitMerge className="w-4 h-4 text-indigo-400" />
                District Similarity & Duplicate Check
              </span>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${ai?.duplicate_flag ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'}`}>
                {ai?.duplicate_flag ? `Possible Duplicate (${ai.similarity_score}%)` : `Unique Issue (${ai?.similarity_score || 0}%)`}
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {ai?.duplicate_flag
                ? `Found similar existing challenge(s) [${ai.similar_challenge_ids.join(', ')}] in district. Automatically flagged for administrative review.`
                : `No duplicate issues detected in current district database.`}
            </p>
          </div>

          {/* Recommended Universities Card */}
          <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/40 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-indigo-400" />
                Top Recommended Jharkhand Institutions
              </span>
              <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md border border-slate-700">
                Rule-Weighted Match Engine
              </span>
            </div>

            <div className="space-y-2.5">
              {universities.map((u, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-bold text-white flex items-center gap-2">
                        <span>{u.university_name || u.name}</span>
                        <span className="text-[9px] font-semibold text-indigo-300 bg-indigo-500/15 px-1.5 py-0.5 rounded border border-indigo-500/30">
                          {u.type}
                        </span>
                      </h4>
                      <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-500" />
                        <span>{u.city}, Jharkhand</span>
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-indigo-600 text-white shadow-md shrink-0">
                      {u.match_score}% Match
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-300 leading-snug">
                    {u.explanation}
                  </p>

                  <div className="flex items-center gap-2 text-[10px] text-slate-400 pt-0.5">
                    <span className="px-1.5 py-0.5 rounded bg-slate-800 text-indigo-300 border border-slate-700">
                      Domain: {u.domain_score}% [{u.domain_source_type || 'OFFICIAL_DEPARTMENT'}]
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-700">
                      Geo: {u.geography_score}%
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                      PROTOTYPE METADATA
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <Info className="w-3.5 h-3.5 text-indigo-400" />
              <span>Matching uses official Jharkhand institutional reference data.</span>
            </div>
            <button
              onClick={handleFinish}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 flex items-center gap-2 transition-all hover:scale-105"
            >
              <span>Go to Citizen Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
