import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MessageSquare, Send, Users, GraduationCap, Building2, Shield } from 'lucide-react';

export const DiscussionThread = ({ problem }) => {
  const { addComment, currentRole } = useApp();
  const [commentText, setCommentText] = useState('');

  const handleSend = (e) => {
    e.preventDefault();
    if (commentText.trim()) {
      addComment(problem.id, commentText.trim(), currentRole);
      setCommentText('');
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'University':
      case 'university':
        return { label: 'University PI', color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30', icon: GraduationCap };
      case 'Industry':
      case 'industry':
        return { label: 'Industry CSR Lead', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', icon: Building2 };
      case 'Admin':
      case 'admin':
        return { label: 'Govt Nodal Officer', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30', icon: Shield };
      default:
        return { label: 'Citizen Advocate', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30', icon: Users };
    }
  };

  return (
    <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-5 text-left">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-indigo-400" />
          <span>Multi-Stakeholder Collaboration Thread</span>
        </h4>
        <span className="text-xs text-slate-400">
          {(problem.comments || []).length} Updates
        </span>
      </div>

      {/* Messages Feed */}
      <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar pr-1">
        {(!problem.comments || problem.comments.length === 0) ? (
          <div className="p-6 text-center text-xs text-slate-400">
            No discussion yet. Post the first project coordination update!
          </div>
        ) : (
          problem.comments.map((comm) => {
            const roleInfo = getRoleBadge(comm.role);
            const RoleIcon = roleInfo.icon;

            return (
              <div
                key={comm.id}
                className="p-3.5 rounded-2xl bg-slate-850 border border-slate-800 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 ${roleInfo.color}`}>
                      <RoleIcon className="w-3 h-3" />
                      {roleInfo.label}
                    </span>
                    <span className="text-xs font-bold text-white">{comm.author}</span>
                  </div>
                  <span className="text-[10px] text-slate-400">{comm.time}</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed pl-1">
                  {comm.text}
                </p>
              </div>
            );
          })
        )}
      </div>

      {/* Post comment input */}
      <form onSubmit={handleSend} className="pt-3 border-t border-slate-800 flex gap-2">
        <input
          type="text"
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="Post a coordination update or query for this project..."
          className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
        />
        <button
          type="submit"
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Post</span>
        </button>
      </form>
    </div>
  );
};
