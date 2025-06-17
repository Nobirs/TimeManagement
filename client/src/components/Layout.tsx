import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import Icon from './Icon';
import ThemeSelector from './ThemeSelector';
import { useApp } from '../context/AppContext.tsx';

interface LayoutProps {
  children: React.ReactNode;
}

const NavLink: React.FC<{ to: string; icon: string; children: React.ReactNode }> = ({ to, icon, children }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={`flex items-center px-6 py-3 text-sm font-medium rounded-md mb-1 ${
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

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isLoading } = useApp();
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) {
        setIsSidebarOpen(true);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      {/* Toggle button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="fixed top-4 left-4 z-50 p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
        aria-label="Toggle sidebar"
      >
        {isSidebarOpen ? (
          <XMarkIcon className="h-6 w-6" />
        ) : (
          <Bars3Icon className="h-6 w-6" />
        )}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-200 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full bg-white relative">
          <div 
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: 'url(/dragon.svg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          />
          <div className="relative z-10">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between pl-12">
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
              <NavLink to="/projects" icon="projects">Projects</NavLink>
              <NavLink to="/notes" icon="notes">Notes</NavLink>
              <NavLink to="/tracker" icon="tracker">Tracker</NavLink>
              <NavLink to="/goals" icon="goals">Goals</NavLink>
              <NavLink to="/habits" icon="habits">Habits</NavLink>
              <NavLink to="/pomodoro" icon="pomodoro" >Pomodoro Timer</NavLink>
              <NavLink to="/roadmap" icon="roadmap" >Roadmap</NavLink>
            </nav>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {isSidebarOpen && isMobile && (
        <div
          className="fixed inset-0 z-30 bg-gray-600 bg-opacity-75"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <main className={`flex-1 overflow-hidden p-6 transition-all duration-200 ${
        isSidebarOpen ? 'lg:pl-72' : ''
      }`}>
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout; 