import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, CheckCircle2, AlertTriangle, Layers, BrainCircuit, 
  Cpu, ArrowRight, Building2, GraduationCap, ShieldCheck, MapPin, GitMerge
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AiProcessingModal = ({ rawData, onComplete, onCancel }) => {
  const { addProblem } = useApp();
  const [stage, setStage] = useState('analyzing'); // 'analyzing' | 'complete'
  const [progress, setProgress] = useState(10);
  const [currentStepText, setCurrentStepText] = useState('Extracting linguistic embeddings & geo-coordinates...');

  // Simulated AI Output
  const [aiResult, setAiResult] = useState(null);

  useEffect(() => {
    // Step 1: Text analysis
    const t1 = setTimeout(() => {
      setProgress(40);
      setCurrentStepText('Running KNN vector deduplication against 240+ Jharkhand challenge clusters...');
    }, 800);

    // Step 2: Urgency scoring
    const t2 = setTimeout(() => {
      setProgress(75);
      setCurrentStepText('Calculating multi-factor urgency index & weighting local aquifer/health vulnerability...');
    }, 1600);

    // Step 3: University matching
    const t3 = setTimeout(() => {
      setProgress(100);
      setCurrentStepText('Matching problem vector to 6 Jharkhand university specialized research labs...');
      
      // Generate realistic AI analysis outcome
      const calculatedSeverity = rawData.severity || 4;
      const calculatedUrgency = Math.min(98, 70 + (calculatedSeverity * 5) + Math.floor(Math.random() * 8));

      const matchMap = {
        Water: { univ: "BIT Mesra", dept: "Dept of Chemical Engineering & Jal Mission Lab", match: 96, lead: "Prof. Nilima Priyadarshini" },
        Agriculture: { univ: "Birsa Agricultural University", dept: "Dept of Soil & Water Engg / Post-Harvest Tech", match: 97, lead: "Dr. Alok Kumar" },
        Health: { univ: "AIIMS Deoghar / NIT Jamshedpur", dept: "Dept of Telemedicine & Mechatronics", match: 94, lead: "Dr. Vivek Anand" },
        Environment: { univ: "IIT (ISM) Dhanbad", dept: "Dept of Environmental Science & Mining Engg", match: 98, lead: "Prof. S. K. Bhattacharya" },
        Infrastructure: { univ: "NIT Jamshedpur & Kolhan Univ", dept: "Dept of Electrical & Renewable Energy", match: 92, lead: "Dr. P. N. Singh" },
        Livelihood: { univ: "Birsa Agricultural University (BAU)", dept: "Dept of Agro-Processing & IINRG", match: 95, lead: "Prof. Vandana Kumari" },
        Education: { univ: "IIIT Ranchi & SKMU", dept: "Dept of Computer Science & Tribal Linguistics", match: 94, lead: "Dr. Sushil Soren" },
        Governance: { univ: "BIT Mesra Extension", dept: "Dept of Artificial Intelligence & Data Science", match: 90, lead: "Dr. Manish Ojha" }
      };

      const selectedMatch = matchMap[rawData.category] || matchMap.Environment;

      const fullProblem = {
        id: `JH-2026-${String(Math.floor(100 + Math.random() * 900))}`,
        title: rawData.title,
        description: rawData.description,
        category: rawData.category,
        districtId: rawData.districtId,
        districtName: rawData.districtName,
        location: rawData.location || `${rawData.districtName} Rural Block`,
        latitude: rawData.latitude || 23.3441,
        longitude: rawData.longitude || 85.3096,
        severity: calculatedSeverity,
        urgencyScore: calculatedUrgency,
        status: "Routed to University",
        kanbanStage: "To Do",
        submitterType: rawData.submitterType || "Citizen",
        submitterName: rawData.submitterName || "Local Community Member",
        submittedAt: new Date().toISOString().split('T')[0],
        upvotes: 1,
        hasUpvoted: true,
        clusterId: `CLUSTER-${rawData.districtId.substring(0, 3).toUpperCase()}-${rawData.category.substring(0, 3).toUpperCase()}-08`,
        duplicateCount: 2,
        images: rawData.images || ["https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=800&auto=format&fit=crop&q=60"],
        assignedUniversity: {
          name: selectedMatch.univ,
          department: selectedMatch.dept,
          matchScore: selectedMatch.match,
          facultyLead: selectedMatch.lead,
          studentTeam: ["Research Fellow (Lead)", "B.Tech Final Year Student"]
        },
        industryPartner: {
          name: "Pending Industry Match",
          tier: "Seeking CSR / Tech Transfer Partner",
          pledgedAmount: "Evaluating",
          contactPerson: "Jharkhand Innovation Cell"
        },
        solutionSummary: "AI-Routed challenge assigned to university laboratory for research & technical feasibility study.",
        trlLevel: "TRL 1-2 (Problem Conceptualization)",
        patentsFiled: "None",
        milestones: [
          { title: "Ground truth & baseline telemetry verification", completed: true, date: new Date().toISOString().split('T')[0] },
          { title: "Faculty Mentor Allocation & Student R&D Team Onboarding", completed: true, date: new Date().toISOString().split('T')[0] },
          { title: "Laboratory Bench-scale Prototype Design", completed: false, date: "Est. 30 Days" },
          { title: "Field Pilot Demonstration with District Officials", completed: false, date: "Est. 60 Days" }
        ],
        comments: [
          { id: "c1", author: "Samadhan Setu AI Engine", role: "admin", text: `Problem auto-routed to ${selectedMatch.univ} with a confidence score of ${selectedMatch.match}%.`, time: "Just now" }
        ]
      };

      setAiResult(fullProblem);
      setStage('complete');
    }, 2400);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [rawData]);

  const handleConfirmSubmission = () => {
    if (aiResult) {
      addProblem(aiResult);
      onComplete(aiResult);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl rounded-3xl bg-[#0F172A] border border-indigo-500/50 shadow-2xl overflow-hidden text-left"
      >
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-indigo-950/80 via-slate-900 to-indigo-950/80 border-b border-indigo-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-600 text-white shadow-lg animate-pulse">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <span>AI Problem Analysis & Routing Engine</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                  SAMADHAN-NEURAL v4
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Evaluating semantics, vector deduplication clusters, and university lab suitability.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {stage === 'analyzing' ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-6">
              {/* Animated Neural Spinner */}
              <div className="relative w-24 h-24 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
                <div className="absolute inset-2 rounded-full border-4 border-emerald-500/20 border-b-emerald-400 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
                <Cpu className="w-8 h-8 text-indigo-400 animate-pulse" />
              </div>

              <div className="space-y-2 max-w-md">
                <h4 className="text-base font-bold text-white tracking-tight">
                  Processing Challenge Vectors
                </h4>
                <p className="text-xs text-indigo-300 font-mono animate-pulse">
                  {currentStepText}
                </p>
              </div>

              {/* Progress Bar */}
              <div className="w-full max-w-md bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700">
                <motion.div
                  className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400"
                  animate={{ width: `${progress}%` }}
                  transition={{ ease: 'easeInOut', duration: 0.4 }}
                />
              </div>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <div>
                    <h5 className="text-xs font-bold text-white">AI Analysis & Deduplication Complete</h5>
                    <p className="text-[11px] text-emerald-300">Issue registered on Jharkhand Citizen Innovation Graph</p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  Priority Score: {aiResult.urgencyScore}/100
                </span>
              </div>

              {/* Deduplication Card */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-700/80 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-300 flex items-center gap-1.5">
                    <GitMerge className="w-4 h-4 text-indigo-400" />
                    Vector Deduplication Check
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">{aiResult.clusterId}</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Found <strong className="text-indigo-400">{aiResult.duplicateCount} similar reported problems</strong> within 15km in {aiResult.districtName}. Automatically grouped into an active grassroots cluster to prevent duplicate effort and mobilize joint funding.
                </p>
              </div>

              {/* University Match Card */}
              <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/40 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-indigo-400" />
                    Recommended University R&D Hub
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-indigo-500 text-white shadow-md">
                    {aiResult.assignedUniversity.matchScore}% Domain Match
                  </span>
                </div>

                <div className="flex items-start justify-between gap-4 pt-1">
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      {aiResult.assignedUniversity.name}
                    </h4>
                    <p className="text-xs text-indigo-300 mt-0.5">
                      {aiResult.assignedUniversity.department}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Faculty Guide Assigned: <strong>{aiResult.assignedUniversity.facultyLead}</strong>
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  onClick={onCancel}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors"
                >
                  Edit Information
                </button>
                <button
                  onClick={handleConfirmSubmission}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 flex items-center gap-2 transition-all hover:scale-105"
                >
                  <span>Publish Challenge & Dispatch to Lab</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
