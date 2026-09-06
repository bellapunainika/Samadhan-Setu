import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { ToastContainer } from './components/common/ToastContainer';
import { HomePage } from './pages/HomePage';
import { HeatmapPage } from './pages/HeatmapPage';
import { CitizenDashboardPage } from './pages/CitizenDashboardPage';
import { UniversityDashboardPage } from './pages/UniversityDashboardPage';
import { IndustryDashboardPage } from './pages/IndustryDashboardPage';
import { AdminAnalyticsPage } from './pages/AdminAnalyticsPage';
import { ProjectDetailsPage } from './pages/ProjectDetailsPage';
import { ProblemSubmitModal } from './components/citizen/ProblemSubmitModal';
import { motion, AnimatePresence } from 'framer-motion';

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -8 },
};

const pageTransition = {
  type: 'tween',
  ease: 'easeInOut',
  duration: 0.25,
};

function AppContent() {
  const { currentPath, isSubmitModalOpen, setIsSubmitModalOpen } = useApp();

  // Router handler
  const renderPage = () => {
    if (currentPath.startsWith('/project/')) {
      const problemId = currentPath.replace('/project/', '');
      return <ProjectDetailsPage problemId={problemId} />;
    }

    switch (currentPath) {
      case '/heatmap':
        return <HeatmapPage />;
      case '/dashboard/citizen':
        return <CitizenDashboardPage />;
      case '/dashboard/university':
        return <UniversityDashboardPage />;
      case '/dashboard/industry':
        return <IndustryDashboardPage />;
      case '/dashboard/admin':
        return <AdminAnalyticsPage />;
      case '/':
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0B1120] text-slate-100 selection:bg-indigo-500 selection:text-white transition-colors duration-300">
      <Navbar />
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPath}
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
          >
            {renderPage()}
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
      <ToastContainer />
      <ProblemSubmitModal isOpen={isSubmitModalOpen} onClose={() => setIsSubmitModalOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </ThemeProvider>
  );
}

