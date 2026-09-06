import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { JHARKHAND_DISTRICTS, CATEGORIES } from '../data/jharkhandDistricts';
import {
  Sparkles, Upload, ArrowRight, ArrowLeft, Check
} from 'lucide-react';
import { AiProcessingModal } from '../components/ai/AiProcessingModal';
import { motion } from 'framer-motion';

export const SubmitChallengePage = () => {
  const { navigate, navigateBack, showToast } = useApp();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    category: 'Water',
    description: '',
    districtId: 'gumla',
    districtName: 'Gumla',
    location: '',
    submitterType: 'Individual Citizen',
    submitterName: '',
    severity: 3,
    images: []
  });
  const [showAiModal, setShowAiModal] = useState(false);

  const handleDistrictChange = (distId) => {
    const selected = JHARKHAND_DISTRICTS.find(d => d.id === distId);
    setFormData(prev => ({
      ...prev,
      districtId: distId,
      districtName: selected ? selected.name : distId
    }));
  };

  const handleImageMockUpload = () => {
    setFormData(prev => ({
      ...prev,
      images: ['https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=800&auto=format&fit=crop&q=60']
    }));
    showToast('Image Attached', 'Photographic evidence uploaded successfully', 'success');
  };

  const handleProceedToAi = () => {
    if (!formData.title.trim()) {
      showToast('Validation Error', 'Please enter a challenge title.', 'error');
      return;
    }
    if (!formData.description.trim()) {
      showToast('Validation Error', 'Please describe the problem in detail.', 'error');
      return;
    }
    setShowAiModal(true);
  };

  const handleAiComplete = (newProblem) => {
    setShowAiModal(false);
    navigate(`/project/${newProblem.id}`);
  };

  const stepLabels = ['Basic Info', 'Location & Submitter', 'Severity & Proof'];

  return (
    <>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 space-y-8">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <button
            onClick={() => navigateBack()}
            className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-600 to-emerald-600 text-white shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">Submit a Societal Challenge</h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Empower your community. Challenges are AI-routed to the right university research lab.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Step Progress Bar */}
        <div className="flex items-center gap-2">
          {stepLabels.map((label, i) => {
            const num = i + 1;
            const isActive = step === num;
            const isDone = step > num;
            return (
              <React.Fragment key={num}>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center transition-all ${
                    isDone ? 'bg-emerald-600 text-white' :
                    isActive ? 'bg-indigo-600 text-white' :
                    'bg-slate-800 text-slate-500'
                  }`}>
                    {isDone ? <Check className="w-3.5 h-3.5" /> : num}
                  </span>
                  <span className={`text-xs font-semibold transition-colors hidden sm:block ${isActive ? 'text-white' : 'text-slate-500'}`}>
                    {label}
                  </span>
                </div>
                {i < stepLabels.length - 1 && (
                  <div className={`flex-1 h-0.5 rounded-full transition-all ${step > num ? 'bg-emerald-600' : 'bg-slate-800'}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Form Card */}
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-5"
        >
          {/* ── Step 1: Basic Info ── */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Challenge Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Severe Fluoride Contamination in Village Handpumps..."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Problem Category *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, category: cat.id })}
                      className={`p-2.5 rounded-xl border text-xs font-semibold text-left transition-all ${
                        formData.category === cat.id
                          ? 'bg-indigo-950/80 border-indigo-500 text-white ring-1 ring-indigo-500'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Problem Description &amp; Ground Impact *
                </label>
                <textarea
                  rows={5}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Explain the background, how many people are affected, current workarounds, and what kind of technical solution is needed..."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none transition-colors"
                />
              </div>
            </div>
          )}

          {/* ── Step 2: Location & Submitter ── */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Jharkhand District *
                </label>
                <select
                  value={formData.districtId}
                  onChange={(e) => handleDistrictChange(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                >
                  {JHARKHAND_DISTRICTS.map(dist => (
                    <option key={dist.id} value={dist.id}>
                      {dist.name} ({dist.hindiName}) — {dist.division}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Village, Block, or Landmark *
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g. Block Dumri, Ward 4, Near Primary School"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Submitter Entity Type *
                  </label>
                  <select
                    value={formData.submitterType}
                    onChange={(e) => setFormData({ ...formData, submitterType: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  >
                    <option value="Individual Citizen">Individual Citizen</option>
                    <option value="Community Group / SHG">Community Group / SHG</option>
                    <option value="Gram Panchayat / PRI">Gram Panchayat / PRI</option>
                    <option value="Urban Local Body (ULB)">Urban Local Body (ULB)</option>
                    <option value="Govt Department / District Office">Govt Department / District Office</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Submitter / Contact Name
                  </label>
                  <input
                    type="text"
                    value={formData.submitterName}
                    onChange={(e) => setFormData({ ...formData, submitterName: e.target.value })}
                    placeholder="e.g. Ramesh Mahto"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ── Step 3: Severity & Proof ── */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Severity Self-Rating (1 to 5) *
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5].map((lvl) => {
                    const labels = ['Low', 'Moderate', 'High', 'Severe', 'Critical'];
                    const isSelected = formData.severity === lvl;
                    return (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setFormData({ ...formData, severity: lvl })}
                        className={`py-4 px-1 rounded-xl border text-center flex flex-col items-center justify-center gap-1 transition-all ${
                          isSelected
                            ? 'bg-rose-950/80 border-rose-500 text-white ring-2 ring-rose-500/50'
                            : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <span className="text-sm font-extrabold">{lvl}</span>
                        <span className="text-[10px] font-bold">{labels[lvl - 1]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Photo / Evidence Upload
                </label>
                <div
                  onClick={handleImageMockUpload}
                  className="border-2 border-dashed border-slate-700 hover:border-indigo-500/60 rounded-2xl p-8 text-center cursor-pointer bg-slate-950/40 transition-colors group"
                >
                  <Upload className="w-8 h-8 text-indigo-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                  <p className="text-xs font-semibold text-slate-300">
                    Click to attach ground photos or drone footage
                  </p>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Supports JPG, PNG, MP4 — up to 50 MB
                  </p>
                  {formData.images.length > 0 && (
                    <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold">
                      <Check className="w-3.5 h-3.5" /> 1 Image Attached
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(s => s - 1)}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Previous
            </button>
          ) : <div />}

          {step < 3 ? (
            <button
              type="button"
              onClick={() => setStep(s => s + 1)}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-colors"
            >
              Next Step
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleProceedToAi}
              className="px-7 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white text-xs font-extrabold flex items-center gap-2 shadow-lg shadow-indigo-500/25 transition-all hover:scale-105"
            >
              <Sparkles className="w-4 h-4" />
              Process with AI &amp; Route to Lab
            </button>
          )}
        </div>
      </div>

      {/* AI Processing Overlay */}
      {showAiModal && (
        <AiProcessingModal
          rawData={formData}
          onComplete={handleAiComplete}
          onCancel={() => setShowAiModal(false)}
        />
      )}
    </>
  );
};
