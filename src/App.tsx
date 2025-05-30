import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Dashboard from './pages/Dashboard';
import Calendar from './pages/Calendar';
import Tasks from './pages/Tasks';
import Icon from './components/Icon';
import ThemeSelector from './components/ThemeSelector';
import { useInitialTheme } from './hooks/useInitialTheme';

const NavLink: React.FC<{ to: string; icon: string; children: React.ReactNode }> = ({ to, icon, children }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={`flex items-center px-4 py-3 text-sm font-medium rounded-md mb-1 ${
        isActive
          ? 'bg-primary-600 text-white'
          : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'
      }`}
    >
      <Icon name={icon as any} className="w-5 h-5 mr-3" />
      {children}
    </Link>
  );
};

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  useInitialTheme();

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      <div className="w-64 bg-white shadow-lg">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-800">TimeMaster</h1>
            <button
              onClick={() => setIsThemeOpen(!isThemeOpen)}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              title="Change theme"
            >
              <Icon name="settings" className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          {isThemeOpen && (
            <div className="absolute left-4 top-16 w-64 bg-white rounded-lg shadow-xl border p-4 z-50">
              <ThemeSelector onClose={() => setIsThemeOpen(false)} />
            </div>
          )}
        </div>
        <nav className="p-4">
          <NavLink to="/" icon="dashboard">Dashboard</NavLink>
          <NavLink to="/calendar" icon="calendar">Calendar</NavLink>
          <NavLink to="/tasks" icon="tasks">Tasks</NavLink>
        </nav>
      </div>
      <div className="flex-1 overflow-hidden p-6">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/tasks" element={<Tasks />} />
          </Routes>
        </Layout>
      </Router>
    </AppProvider>
  );
};

export default App; 