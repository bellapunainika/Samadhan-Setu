import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Building2, HandCoins, CheckCircle2, ShieldCheck, ArrowRight, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { expressInterest } from '../../services/industryService';

export const ExpressInterestModal = ({ isOpen, onClose, problem }) => {
  const [partnerName, setPartnerName] = useState('Tata Steel CSR Foundation');
  const [contactEmail, setContactEmail] = useState('csr@tatasteel.com');
  const [supportType, setSupportType] = useState('CSR Grant & Direct Funding');
  const [message, setMessage] = useState('We would like to support pilot deployment and laboratory characterization for this project.');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!problem) return;
    setLoading(true);
    setError('');
    try {
      await expressInterest(problem.rawId || problem.id, {
        company_name: partnerName,
        contact_email: contactEmail,
        support_type: supportType,
        message: message
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1500);
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to submit industry interest request.';
      setError(msg);
    } finally {
      setLoading(false);
    }
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
        {error && (
          <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Interest submitted successfully! Sent to State Admin for review.</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
            Industry / Corporate Entity Name *
          </label>
          <input
            type="text"
            required
            value={partnerName}
            onChange={(e) => setPartnerName(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
            Official Corporate Email *
          </label>
          <input
            type="email"
            required
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
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
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
            Partnership Scope & Message *
          </label>
          <textarea
            rows={3}
            required
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500 resize-none"
          />
        </div>

        <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Interest requests are stored in PostgreSQL and reviewed by State Admin.</span>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || success}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-500/25 flex items-center gap-1.5 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            Submit Partnership Request
          </button>
        </div>
      </form>
    </Modal>
  );
};
