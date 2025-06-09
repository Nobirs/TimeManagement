import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';

import Dashboard from './pages/Dashboard';
import Calendar from './pages/Calendar';
import Tasks from './pages/Tasks';
import Projects from './pages/Projects';
import Notes from './pages/Notes';
import TimeTracker from "./pages/TimeTracker";
import Layout from './components/Layout';

import { useInitialTheme } from './hooks/useInitialTheme';
import Goals from "./pages/Goals";
import Habits from "./pages/Habits";
import PomodoroTimer from "./pages/PomodoroTimer";
import RoadmapPage from "./pages/RoadmapPage";

const AppContent: React.FC = () => {
  useInitialTheme();

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/notes" element={<Notes />} />
          <Route path="/tracker" element={<TimeTracker />} />
          <Route path="/goals" element={<Goals />} />
          <Route path="/habits" element={<Habits />} />
          <Route path="/pomodoro" element={<PomodoroTimer />} />
          <Route path="/roadmap" element={<RoadmapPage />} />
        </Routes>
      </Layout>
    </Router>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App; 