import React, { createContext, useContext, useState, useEffect } from 'react';
import { MOCK_PROBLEMS, MOCK_STATS } from '../data/mockProblems';
import { JHARKHAND_DISTRICTS } from '../data/jharkhandDistricts';
import { MOCK_NOTIFICATIONS } from '../data/mockNotifications';
import { TRANSLATIONS } from '../data/translations';
import confetti from 'canvas-confetti';
import {
  login as apiLogin,
  register as apiRegister,
  logout as apiLogout,
  fetchMe,
  getStoredUser,
  hasToken,
} from '../services/authService';
import { getPublicChallenges } from '../services/challengeService';

const AppContext = createContext();

// ─── Role → dashboard path mapping ───────────────────────────────────────────
const ROLE_DASHBOARD = {
  citizen:    '/dashboard/citizen',
  university: '/dashboard/university',
  industry:   '/dashboard/industry',
  admin:      '/dashboard/admin',
  officer:    '/dashboard/officer',
};

const ROLE_LABEL = {
  citizen:    'Citizen',
  university: 'University',
  industry:   'Industry Partner',
  admin:      'Government Admin',
  officer:    'Government Officer',
};

export function AppProvider({ children }) {
  // ─── Auth State ─────────────────────────────────────────────────────────────
  // Initialise from sessionStorage (closing/reopening tab or website starts logged out)
  const [isLoggedIn, setIsLoggedIn] = useState(() => hasToken() && !!getStoredUser());
  const [currentUser, setCurrentUser] = useState(() => getStoredUser()); // { id, email, full_name, role }
  const [authLoading, setAuthLoading] = useState(() => hasToken()); // true while /me is in-flight
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [pendingAfterLogin, setPendingAfterLogin] = useState(null);

  // ─── Global State ────────────────────────────────────────────────────────────
  const [currentRole, setCurrentRole] = useState(() => getStoredUser()?.role || null);
  const [language, setLanguage] = useState('en'); // 'en' | 'hi'
  const [currentPath, setCurrentPath] = useState(window.location.hash.replace('#', '') || '/');
  const [problems, setProblems] = useState([]);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [toasts, setToasts] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  // Persist problems to localStorage
  useEffect(() => {
    localStorage.setItem('samadhan_problems', JSON.stringify(problems));
  }, [problems]);

  // ── Load real public challenges from DB on mount ─────────────────────────────
  useEffect(() => {
    getPublicChallenges(100)
      .then((list) => {
        const mapped = list.map((ch) => {
          const distName = ch.district_id
            ? ch.district_id.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
            : 'Jharkhand';
          const assignedUnivName = ch.assignment?.university_name || ch.assigned_university_name || null;
          return {
            id: ch.short_id || ch.id,
            rawId: ch.id,
            title: ch.title,
            description: ch.description,
            category: ch.category,
            districtId: ch.district_id,
            districtName: distName,
            location: ch.block_locality,
            severity: ch.citizen_severity,
            urgencyScore: ch.ai_prediction?.priority_score || (ch.citizen_severity * 15),
            priorityLabel: ch.ai_prediction?.priority_label || 'HIGH',
            status: ch.status,
            rawStatus: ch.status,
            submitterType: ch.submitter_type || 'Citizen',
            submitterName: ch.submitter_name || 'Citizen Advocate',
            submittedAt: ch.created_at ? new Date(ch.created_at).toLocaleDateString() : 'Recent',
            upvotes: 1,
            hasUpvoted: false,
            comments: [],
            duplicateCount: ch.ai_prediction?.similar_challenge_ids?.length || 0,
            assignedUniversity: assignedUnivName ? { name: assignedUnivName } : null,
            isRealDatabaseRecord: true,
          };
        });
        setProblems(mapped);
      })
      .catch(() => {
        // Backend unreachable — keep empty array; individual dashboards show their own errors
      });
  }, []);

  // ── Session restore on mount ────────────────────────────────────────────────
  // If a token exists in localStorage, verify it with the backend (/auth/me).
  // This keeps the user logged in after a page refresh.
  useEffect(() => {
    if (!hasToken()) {
      setAuthLoading(false);
      return;
    }
    fetchMe()
      .then((user) => {
        if (user) {
          setCurrentUser(user);
          setCurrentRole(user.role);
          setIsLoggedIn(true);
        } else {
          // Token was invalid — clear stale state
          setIsLoggedIn(false);
          setCurrentRole(null);
          setCurrentUser(null);
        }
      })
      .finally(() => setAuthLoading(false));
  }, []); // runs once on mount

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

  // ─── Auth Actions ────────────────────────────────────────────────────────────
  /**
   * loginAs — calls the real backend API, stores JWT, updates auth state.
   * @param {string} _role  - selected role (used for UX only; backend role is the source of truth)
   * @param {string} email
   * @param {string} password
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  const loginAs = async (_role, email, password) => {
    try {
      const data = await apiLogin(email, password);
      const user = { id: data.user_id, email: data.email, full_name: data.full_name, role: data.role };
      setCurrentUser(user);
      setCurrentRole(data.role);
      setIsLoggedIn(true);
      setIsLoginModalOpen(false);

      const dashPath = ROLE_DASHBOARD[data.role] || '/';
      navigate(dashPath);
      showToast('Login Successful', `Welcome, ${data.full_name}! Signed in as ${ROLE_LABEL[data.role]}.`, 'success');
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.3 } });

      if (pendingAfterLogin) {
        setTimeout(() => {
          pendingAfterLogin();
          setPendingAfterLogin(null);
        }, 300);
      }

      return { success: true };
    } catch (err) {
      const message = err.response?.data?.detail || 'Login failed. Please check your credentials.';
      return { success: false, error: message };
    }
  };

  /**
   * registerUser — calls the public registration API.
   * Does NOT auto-login; user must login after registering.
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  const registerUser = async (payload) => {
    try {
      await apiRegister(payload);
      showToast('Account Created', 'Registration successful. Please log in.', 'success');
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.detail || 'Registration failed.';
      return { success: false, error: message };
    }
  };

  /** logout — clears JWT from localStorage and resets auth state */
  const logout = () => {
    apiLogout();
    setIsLoggedIn(false);
    setCurrentRole(null);
    setCurrentUser(null);
    navigate('/');
    showToast('Logged Out', 'You have been signed out successfully.', 'info');
  };

  /**
   * requireAuth — opens login modal if not logged in.
   * Optionally stores a callback to run after successful login.
   * @param {string|null} requiredRole - if set, also checks role
   * @param {Function|null} afterLoginCallback
   * @returns {boolean} true if already authenticated (or role matches)
   */
  const requireAuth = (requiredRole = null, afterLoginCallback = null) => {
    if (!isLoggedIn) {
      if (afterLoginCallback) setPendingAfterLogin(() => afterLoginCallback);
      setIsLoginModalOpen(true);
      return false;
    }
    if (requiredRole && currentRole !== requiredRole) {
      showToast('Role Mismatch', `This section requires the "${requiredRole}" role.`, 'error');
      return false;
    }
    return true;
  };

  // ─── Problem Actions ─────────────────────────────────────────────────────────
  const toggleUpvote = (problemId) => {
    setProblems(prev =>
      prev.map(p => {
        if (p.id === problemId) {
          const hasUpvoted = !p.hasUpvoted;
          const upvotes = hasUpvoted ? p.upvotes + 1 : p.upvotes - 1;
          if (hasUpvoted) {
            confetti({ particleCount: 30, spread: 60, origin: { y: 0.8 } });
            showToast('Endorsement Recorded', 'Thank you for prioritizing this grassroots issue!', 'success');
          }
          return { ...p, hasUpvoted, upvotes };
        }
        return p;
      })
    );
  };

  const addProblem = (newProblem) => {
    setProblems(prev => [newProblem, ...prev]);
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

  // Admin override actions
  const adminReassignUniversity = (problemId, newUniversityName) => {
    setProblems(prev =>
      prev.map(p => {
        if (p.id === problemId) {
          return {
            ...p,
            assignedUniversity: { ...p.assignedUniversity, name: newUniversityName }
          };
        }
        return p;
      })
    );
    showToast('University Reassigned', `Challenge reassigned to ${newUniversityName}`, 'success');
  };

  const adminOverrideUrgency = (problemId, newScore) => {
    setProblems(prev =>
      prev.map(p => {
        if (p.id === problemId) {
          return { ...p, urgencyScore: newScore };
        }
        return p;
      })
    );
    showToast('Urgency Score Updated', `Manual override applied: ${newScore}/100`, 'info');
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  return (
    <AppContext.Provider
      value={{
        // Auth
        isLoggedIn,
        authLoading,
        currentRole,
        currentUser,
        setCurrentRole,
        loginAs,
        registerUser,
        logout,
        requireAuth,
        isLoginModalOpen,
        setIsLoginModalOpen,
        pendingAfterLogin,
        setPendingAfterLogin,
        // Language
        language,
        setLanguage,
        t,
        // Routing
        currentPath,
        navigate,
        navigateBack,
        // Problems
        problems,
        setProblems,
        toggleUpvote,
        addProblem,
        acceptChallenge,
        updateKanbanStage,
        expressIndustryInterest,
        toggleMilestone,
        addComment,
        adminReassignUniversity,
        adminOverrideUrgency,
        // UI
        notifications,
        markAllNotificationsRead,
        toasts,
        showToast,
        removeToast,
        selectedDistrict,
        setSelectedDistrict,
        isSubmitModalOpen,
        setIsSubmitModalOpen,
        // Static data
        districts: JHARKHAND_DISTRICTS,
        stats: MOCK_STATS
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
