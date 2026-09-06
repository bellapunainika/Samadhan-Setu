import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';
import { JHARKHAND_DISTRICTS, CATEGORIES } from '../../data/jharkhandDistricts';
import { 
  Sparkles, Upload, AlertTriangle, ArrowRight, ArrowLeft, 
  Check, Image as ImageIcon, Flame, Shield, Users, Building, HelpCircle
} from 'lucide-react';
import { AiProcessingModal } from '../ai/AiProcessingModal';

export const ProblemSubmitModal = ({ isOpen, onClose }) => {
  const { navigate, showToast } = useApp();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    category: 'Water',
    description: '',
    districtId: 'gumla',
    districtName: 'Gumla',
    location: '',
    submitterType: 'Panchayati Raj Institution',
    submitterName: '',
    severity: 4,
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

  const handleImageMockUpload = (e) => {
    e.preventDefault();
    setFormData(prev => ({
      ...prev,
      images: [
        "https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=800&auto=format&fit=crop&q=60"
      ]
    }));
    showToast('Image Attached', 'Geo-tagged photographic evidence uploaded', 'success');
  };

  const handleProceedToAi = () => {
    if (!formData.title.trim()) {
      showToast('Validation Error', 'Please enter a problem title.', 'error');
      return;
    }
    if (!formData.description.trim()) {
      showToast('Validation Error', 'Please describe the problem details.', 'error');
      return;
    }
    setShowAiModal(true);
  };

  const handleAiComplete = (newProblem) => {
    setShowAiModal(false);
    onClose();
    // Reset form
    setStep(1);
    setFormData({
      title: '',
      category: 'Water',
      description: '',
      districtId: 'gumla',
      districtName: 'Gumla',
      location: '',
      submitterType: 'Panchayati Raj Institution',
      submitterName: '',
      severity: 4,
      images: []
    });
    navigate(`/project/${newProblem.id}`);
  };

  return (
    <>
      <Modal
        isOpen={isOpen && !showAiModal}
        onClose={onClose}
        title="Submit a Societal Challenge"
        subtitle="Empower your community by submitting grassroots issues for AI-driven university research & industry CSR funding."
        maxWidth="max-w-2xl"
      >
        <div className="space-y-6 text-left">
          {/* Multi-step Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2">
              <span className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center ${step >= 1 ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                1
              </span>
              <span className="text-xs font-semibold text-slate-300">Basic Info</span>
            </div>
            <div className="h-0.5 w-12 bg-slate-800" />
            <div className="flex items-center gap-2">
              <span className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center ${step >= 2 ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                2
              </span>
              <span className="text-xs font-semibold text-slate-300">Location & Submitter</span>
            </div>
            <div className="h-0.5 w-12 bg-slate-800" />
            <div className="flex items-center gap-2">
              <span className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center ${step >= 3 ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                3
              </span>
              <span className="text-xs font-semibold text-slate-300">Severity & Proof</span>
            </div>
          </div>

          {/* Step 1: Basic Info */}
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
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
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
                      className={`p-2.5 rounded-xl border text-xs font-semibold text-left flex flex-col items-start gap-1 transition-all ${
                        formData.category === cat.id
                          ? 'bg-indigo-950/80 border-indigo-500 text-white ring-1 ring-indigo-500'
                          : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300'
                      }`}
                    >
                      <span className="text-slate-200">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Problem Description & Ground Impact *
                </label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Explain the background, how many villagers are affected, current workarounds, and what kind of technical solution is needed..."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

            </div>
          )}

          {/* Step 2: Location & Submitter */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Jharkhand District *
                </label>
                <select
                  value={formData.districtId}
                  onChange={(e) => handleDistrictChange(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-500"
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
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
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
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-500"
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
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Severity & Proof */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Severity Self-Rating (1 to 5) *
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5].map((lvl) => {
                    const labels = ["Low", "Moderate", "High", "Severe", "Critical"];
                    const isSelected = formData.severity === lvl;
                    return (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setFormData({ ...formData, severity: lvl })}
                        className={`py-3 px-1 rounded-xl border text-center flex flex-col items-center justify-center gap-1 transition-all ${
                          isSelected
                            ? 'bg-rose-950/80 border-rose-500 text-white ring-2 ring-rose-500/50'
                            : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <span className="text-sm font-extrabold">{lvl}</span>
                        <span className="text-[10px] font-bold">{labels[lvl - 1]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Multimedia Upload */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Photo / Evidence Upload
                </label>
                <div
                  onClick={handleImageMockUpload}
                  className="border-2 border-dashed border-slate-700 hover:border-indigo-500/60 rounded-2xl p-6 text-center cursor-pointer bg-slate-900/40 transition-colors"
                >
                  <Upload className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-300">
                    Click to attach ground photos or drone video footage
                  </p>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Supports JPG, PNG, MP4 up to 50MB with automatic EXIF geo-tag verification.
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

          {/* Footer Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(s => s - 1)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Previous
              </button>
            ) : (
              <div />
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={() => setStep(s => s + 1)}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md"
              >
                Next Step
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleProceedToAi}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white text-xs font-extrabold flex items-center gap-2 shadow-lg shadow-indigo-500/25 transition-all hover:scale-105"
              >
                <Sparkles className="w-4 h-4" />
                Process with AI & Route
              </button>
            )}
          </div>
        </div>
      </Modal>

      {/* Neural AI Processing Overlay */}
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
