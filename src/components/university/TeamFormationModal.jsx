import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';
import { GraduationCap, Users, Calendar, Plus, Trash2, CheckCircle2 } from 'lucide-react';

export const TeamFormationModal = ({ isOpen, onClose, problem }) => {
  const { acceptChallenge } = useApp();

  const [facultyLead, setFacultyLead] = useState('Dr. S. K. Bhattacharya (Associate Professor)');
  const [targetDate, setTargetDate] = useState('2026-11-30');
  const [students, setStudents] = useState([
    'Ananya Verma (PhD Scholar - Lead)',
    'Aakash Soren (B.Tech Final Year)'
  ]);
  const [newStudent, setNewStudent] = useState('');

  const handleAddStudent = () => {
    if (newStudent.trim()) {
      setStudents([...students, newStudent.trim()]);
      setNewStudent('');
    }
  };

  const handleRemoveStudent = (idx) => {
    setStudents(students.filter((_, i) => i !== idx));
  };

  const handleConfirm = () => {
    acceptChallenge(problem.id, {
      facultyLead,
      studentTeam: students,
      targetDate
    });
    onClose();
  };

  if (!problem) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Accept Challenge & Assemble R&D Team"
      subtitle={`Formalize institutional commitment for #${problem.id}: ${problem.title}`}
      maxWidth="max-w-xl"
    >
      <div className="space-y-4 text-left">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
            Designated Faculty Mentor / Principal Investigator *
          </label>
          <input
            type="text"
            value={facultyLead}
            onChange={(e) => setFacultyLead(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
            Student Research Leads & Fellows ({students.length})
          </label>
          <div className="space-y-2 mb-2">
            {students.map((st, idx) => (
              <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200">
                <span className="flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-indigo-400" />
                  {st}
                </span>
                <button
                  onClick={() => handleRemoveStudent(idx)}
                  className="text-rose-400 hover:text-rose-300 p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newStudent}
              onChange={(e) => setNewStudent(e.target.value)}
              placeholder="e.g. Rahul Singh (M.Tech Robotics)"
              className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <button
              onClick={handleAddStudent}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add Member
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
            Target Prototype Milestone Date
          </label>
          <input
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-xs text-indigo-300 flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
          <span>
            Upon acceptance, this challenge will be provisioned in the University Project Management Workspace and state grant milestone escrow will be initialized.
          </span>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-emerald-600 text-white text-xs font-bold shadow-lg shadow-indigo-500/25"
          >
            Confirm & Lock Team
          </button>
        </div>
      </div>
    </Modal>
  );
};
