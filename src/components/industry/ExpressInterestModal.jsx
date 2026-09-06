import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';
import { Building2, HandCoins, CheckCircle2, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';

export const ExpressInterestModal = ({ isOpen, onClose, problem }) => {
  const { expressIndustryInterest } = useApp();

  const [partnerName, setPartnerName] = useState('Tata Steel CSR Foundation');
  const [supportType, setSupportType] = useState('Pilot Grant & Industrial Co-Development');
  const [amount, setAmount] = useState('₹35,00,000');
  const [contactPerson, setContactPerson] = useState('Dr. S. K. Roy (Chief Innovation Officer)');
  const [commitmentNotes, setCommitmentNotes] = useState('We will provide testing grounds, chemical lab characterization, and pilot deployment sponsorship for 5 target Panchayats.');

  const handleSubmit = (e) => {
    e.preventDefault();
    expressIndustryInterest(problem.id, {
      partnerName,
      supportType,
      amount,
      contactPerson,
      commitmentNotes
    });
    onClose();
  };

  if (!problem) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Express Industry & CSR Partnership Interest"
      subtitle={`Pledge CSR grant, pilot testing ground, or co-development support for #${problem.id}`}
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
            Industry / Corporate Entity Name *
          </label>
          <input
            type="text"
            value={partnerName}
            onChange={(e) => setPartnerName(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
            Mode of Collaboration / Partnership *
          </label>
          <select
            value={supportType}
            onChange={(e) => setSupportType(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="CSR Grant & Direct Funding">CSR Grant & Direct Funding</option>
            <option value="Pilot Grant & Industrial Co-Development">Pilot Grant & Industrial Co-Development</option>
            <option value="Technical Mentorship & Lab Testing Access">Technical Mentorship & Lab Testing Access</option>
            <option value="Commercial Off-take & State Procurement">Commercial Off-take & State Procurement</option>
            <option value="Technology Transfer & Exclusive Licensing">Technology Transfer & Exclusive Licensing</option>
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Pledged Funding / In-Kind Valuation
            </label>
            <input
              type="text"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. ₹25,00,000"
              className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Authorized Signatory / Contact
            </label>
            <input
              type="text"
              value={contactPerson}
              onChange={(e) => setContactPerson(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
            Partnership Scope & Deployment Timeline
          </label>
          <textarea
            rows={3}
            value={commitmentNotes}
            onChange={(e) => setCommitmentNotes(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500 resize-none"
          />
        </div>

        <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Automated tripartite MoU template will be generated with Govt of Jharkhand.</span>
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
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-500/25 flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4" />
            Dispatch Partnership MoU
          </button>
        </div>
      </form>
    </Modal>
  );
};
