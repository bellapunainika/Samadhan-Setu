import React, { createContext, useContext, useState, useEffect } from 'react';
import { MOCK_PROBLEMS, MOCK_STATS } from '../data/mockProblems';
import { JHARKHAND_DISTRICTS } from '../data/jharkhandDistricts';
import { MOCK_NOTIFICATIONS } from '../data/mockNotifications';
import { TRANSLATIONS } from '../data/translations';
import confetti from 'canvas-confetti';

const AppContext = createContext();

export function AppProvider({ children }) {
  // Global State
  const [currentRole, setCurrentRole] = useState('citizen'); // 'citizen' | 'university' | 'industry' | 'admin'
  const [language, setLanguage] = useState('en'); // 'en' | 'hi'
  const [currentPath, setCurrentPath] = useState(window.location.hash.replace('#', '') || '/');
  const [problems, setProblems] = useState(() => {
    const saved = localStorage.getItem('samadhan_problems');
    return saved ? JSON.parse(saved) : MOCK_PROBLEMS;
  });
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [toasts, setToasts] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  // Persist problems to localStorage
  useEffect(() => {
    localStorage.setItem('samadhan_problems', JSON.stringify(problems));
  }, [problems]);

  // Sync route on hash change
  useEffect(() => {
    const handleHashChange = () => {
      const path = window.location.hash.replace('#', '') || '/';
      setCurrentPath(path);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (path) => {
    window.location.hash = path;
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      navigate('/');
    }
  };

  const showToast = (title, message, type = 'success') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Upvote toggle
  const toggleUpvote = (problemId) => {
    setProblems(prev =>
      prev.map(p => {
        if (p.id === problemId) {
          const hasUpvoted = !p.hasUpvoted;
          const upvotes = hasUpvoted ? p.upvotes + 1 : p.upvotes - 1;
          if (hasUpvoted) {
            confetti({
              particleCount: 30,
              spread: 60,
              origin: { y: 0.8 }
            });
            showToast('Endorsement Recorded', 'Thank you for prioritizing this grassroots issue!', 'success');
          }
          return { ...p, hasUpvoted, upvotes };
        }
        return p;
      })
    );
  };

  // Add new problem (called after AI processing)
  const addProblem = (newProblem) => {
    setProblems(prev => [newProblem, ...prev]);
    // Also push notification
    const newNotif = {
      id: `notif-${Date.now()}`,
      title: 'New Problem Routed',
      description: `Challenge #${newProblem.id} routed to ${newProblem.assignedUniversity?.name || 'Academic Council'}.`,
      time: 'Just now',
      unread: true,
      type: 'ai',
      link: `/project/${newProblem.id}`
    };
    setNotifications(prev => [newNotif, ...prev]);
    showToast('Problem Registered & AI-Routed', `Assigned ID ${newProblem.id} with priority ${newProblem.urgencyScore}/100`, 'success');
    confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
  };

  // University Accept Challenge
  const acceptChallenge = (problemId, teamDetails) => {
    setProblems(prev =>
      prev.map(p => {
        if (p.id === problemId) {
          return {
            ...p,
            status: 'In Progress',
            kanbanStage: 'In Research',
            assignedUniversity: {
              ...p.assignedUniversity,
              facultyLead: teamDetails.facultyLead,
              studentTeam: teamDetails.studentTeam,
              targetCompletionDate: teamDetails.targetDate
            }
          };
        }
        return p;
      })
    );
    showToast('Challenge Accepted!', 'Your research team has been provisioned and workspace unlocked.', 'success');
    confetti({ particleCount: 60, spread: 70 });
  };

  // Update Kanban Stage
  const updateKanbanStage = (problemId, newStage) => {
    setProblems(prev =>
      prev.map(p => {
        if (p.id === problemId) {
          let status = p.status;
          if (newStage === 'Submitted for Review') status = 'Solved';
          else if (newStage === 'To Do') status = 'Routed to University';
          else status = 'In Progress';
          return { ...p, kanbanStage: newStage, status };
        }
        return p;
      })
    );
    showToast('Lifecycle Updated', `Project moved to "${newStage}" stage`, 'info');
  };

  // Industry Express Interest / Pledge Grant
  const expressIndustryInterest = (problemId, interestDetails) => {
    setProblems(prev =>
      prev.map(p => {
        if (p.id === problemId) {
          return {
            ...p,
            industryPartner: {
              name: interestDetails.partnerName,
              tier: interestDetails.supportType,
              pledgedAmount: interestDetails.amount || 'Technical Mentorship',
              contactPerson: interestDetails.contactPerson
            }
          };
        }
        return p;
      })
    );
    showToast('Partnership Interest Registered', `MoU request sent for #${problemId}`, 'success');
    confetti({ particleCount: 50, spread: 60 });
  };

  // Toggle milestone completion
  const toggleMilestone = (problemId, milestoneIndex) => {
    setProblems(prev =>
      prev.map(p => {
        if (p.id === problemId) {
          const updatedMilestones = p.milestones.map((m, idx) => {
            if (idx === milestoneIndex) {
              return { ...m, completed: !m.completed };
            }
            return m;
          });
          return { ...p, milestones: updatedMilestones };
        }
        return p;
      })
    );
    showToast('Milestone Updated', 'Verification log recorded on state ledger', 'info');
  };

  // Add comment / discussion
  const addComment = (problemId, text, authorRole) => {
    const roleLabels = {
      citizen: 'Citizen Advocate',
      university: 'Faculty Researcher',
      industry: 'Industry Partner',
      admin: 'Nodal Officer (Govt)'
    };
    const newComment = {
      id: `c-${Date.now()}`,
      author: `${roleLabels[authorRole || currentRole]}`,
      role: authorRole || currentRole,
      text,
      time: 'Just now'
    };

    setProblems(prev =>
      prev.map(p => {
        if (p.id === problemId) {
          return { ...p, comments: [...(p.comments || []), newComment] };
        }
        return p;
      })
    );
    showToast('Comment Added', 'Message broadcasted to project stakeholders', 'info');
  };

  // Mark notifications read
  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  return (
    <AppContext.Provider
      value={{
        currentRole,
        setCurrentRole,
        language,
        setLanguage,
        currentPath,
        navigate,
        navigateBack,
        problems,
        setProblems,
        notifications,
        markAllNotificationsRead,
        toasts,
        showToast,
        removeToast,
        selectedDistrict,
        setSelectedDistrict,
        isSubmitModalOpen,
        setIsSubmitModalOpen,
        toggleUpvote,
        addProblem,
        acceptChallenge,
        updateKanbanStage,
        expressIndustryInterest,
        toggleMilestone,
        addComment,
        t,
        districts: JHARKHAND_DISTRICTS,
        stats: MOCK_STATS
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
