import React from 'react';
import { useApp } from '../../context/AppContext';
import { Bell, Sparkles, Building2, Award, Users, ExternalLink, CheckCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const NotificationDropdown = ({ isOpen, onClose }) => {
  const { notifications, markAllNotificationsRead, navigate } = useApp();

  const getIcon = (type) => {
    switch (type) {
      case 'ai':
        return <Sparkles className="w-4 h-4 text-indigo-400" />;
      case 'industry':
        return <Building2 className="w-4 h-4 text-emerald-400" />;
      case 'milestone':
        return <Award className="w-4 h-4 text-amber-400" />;
      default:
        return <Users className="w-4 h-4 text-blue-400" />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl bg-[#0F172A] border border-slate-700/80 shadow-2xl z-50 overflow-hidden"
          >
            {/* Dropdown Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/50">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-indigo-400" />
                <span className="text-sm font-bold text-white">Live System Feed</span>
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {notifications.filter(n => n.unread).length} New
                </span>
              </div>
              <button
                onClick={markAllNotificationsRead}
                className="text-[11px] text-slate-400 hover:text-indigo-400 flex items-center gap-1 transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>
            </div>

            {/* Notification List */}
            <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60 custom-scrollbar">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  No notifications at the moment.
                </div>
              ) : (
                notifications.map(notif => (
                  <div
                    key={notif.id}
                    onClick={() => {
                      if (notif.link) {
                        navigate(notif.link);
                        onClose();
                      }
                    }}
                    className={`p-3.5 hover:bg-slate-800/60 transition-colors cursor-pointer flex items-start gap-3 ${
                      notif.unread ? 'bg-indigo-950/20' : ''
                    }`}
                  >
                    <div className="mt-0.5 p-2 rounded-lg bg-slate-800 border border-slate-700/50">
                      {getIcon(notif.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h5 className="text-xs font-semibold text-slate-200 truncate">{notif.title}</h5>
                        <span className="text-[10px] text-slate-400 whitespace-nowrap">{notif.time}</span>
                      </div>
                      <p className="text-[11px] text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                        {notif.description}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Dropdown Footer */}
            <div className="p-3 text-center border-t border-slate-800 bg-slate-900/50">
              <span className="text-[11px] text-slate-400">Real-time WebSocket connection active</span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
