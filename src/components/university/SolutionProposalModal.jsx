import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';
import { FileText, Upload, Link2, CheckCircle2, Sparkles } from 'lucide-react';

export const SolutionProposalModal = ({ isOpen, onClose, problem }) => {
  const { updateKanbanStage, showToast } = useApp();

  const [methodology, setMethodology] = useState('');
  const [trlLevel, setTrlLevel] = useState('TRL 6 (Field Validated Prototype)');
  const [patentFiled, setPatentFiled] = useState('');
  const [demoLink, setDemoLink] = useState('');

  const handleSubmitProposal = (e) => {
    e.preventDefault();
    if (!methodology.trim()) {
      showToast('Validation Error', 'Please enter technical methodology summary.', 'error');
      return;
    }
    updateKanbanStage(problem.id, 'Submitted for Review');
    showToast('Solution Proposal Submitted', 'Submitted for State Evaluation & Industry Pilot Matching', 'success');
    onClose();
  };

  if (!problem) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Submit Validated Solution Whitepaper & Demo"
      subtitle={`Upload technical milestone evidence and prototype documentation for #${problem.id}`}
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmitProposal} className="space-y-4 text-left">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
            Technical Methodology & Architecture Summary *
          </label>
          <textarea
            rows={4}
            value={methodology}
            onChange={(e) => setMethodology(e.target.value)}
            placeholder="Describe the scientific breakthrough, materials used, laboratory testing outcomes, and field trial efficiency..."
            className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500 resize-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Technology Readiness Level (TRL)
            </label>
            <select
              value={trlLevel}
              onChange={(e) => setTrlLevel(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="TRL 4 (Component Lab Validated)">TRL 4 (Component Lab Validated)</option>
              <option value="TRL 5 (Integrated System Lab Tested)">TRL 5 (Integrated System Lab Tested)</option>
              <option value="TRL 6 (Field Validated Prototype)">TRL 6 (Field Validated Prototype)</option>
              <option value="TRL 7 (Operational Demonstration)">TRL 7 (Operational Demonstration)</option>
              <option value="TRL 8 (Standardized Commercial Pilot)">TRL 8 (Standardized Commercial Pilot)</option>
              <option value="TRL 9 (Full Statewide Deployment)">TRL 9 (Full Statewide Deployment)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Patent / IP Application No. (If applicable)
            </label>
            <input
              type="text"
              value={patentFiled}
              onChange={(e) => setPatentFiled(e.target.value)}
              placeholder="e.g. IP/JH/2026/0491A"
              className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
            CAD Model / GitHub / Demo Video URL
          </label>
          <div className="flex items-center gap-2">
            <Link2 className="w-4 h-4 text-indigo-400" />
            <input
              type="url"
              value={demoLink}
              onChange={(e) => setDemoLink(e.target.value)}
              placeholder="https://github.com/..."
              className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Upload Documentation Dropzone */}
        <div className="border border-dashed border-slate-700 rounded-xl p-4 text-center bg-slate-900/50">
          <Upload className="w-6 h-6 text-indigo-400 mx-auto mb-1.5" />
          <span className="text-xs font-semibold text-slate-300 block">
            Attach Technical Whitepaper PDF & Bill of Materials (BOM)
          </span>
          <span className="text-[10px] text-slate-500">PDF up to 25MB</span>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-emerald-600 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4" />
            Submit for State Review
          </button>
        </div>
      </form>
    </Modal>
  );
};
