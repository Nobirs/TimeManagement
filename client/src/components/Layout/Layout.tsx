import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import {throttle} from 'lodash';
import Sidebar from './Sidebar/Sidebar.tsx';
import SidebarToggle from './Sidebar/SidebarToggle.tsx';
import MainContent from './MainContent.tsx';

interface LayoutProps {
  children: React.ReactNode;
}

const DESKTOP_BREAKPOINT = 1024;


const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isLoading } = useApp();
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = throttle(() => {
      const mobile = window.innerWidth < DESKTOP_BREAKPOINT;
      setIsMobile(mobile);
      if (!mobile) setIsSidebarOpen(true);
    }, 150);

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      (handleResize as any).cancel?.();
    };
  }, []);

  const toggleSidebar = useCallback(() => {
    const newState = !isSidebarOpen;
    setIsSidebarOpen(newState);
    if(!newState) {
      document.getElementById('sidebar-toggle')?.focus();
    }
  }, [isSidebarOpen]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      <SidebarToggle 
        isOpen={isSidebarOpen} 
        onClick={toggleSidebar} 
      />

      <Sidebar 
        isOpen={isSidebarOpen} 
        isMobile={isMobile}
        onClose={toggleSidebar} 
      />

      <MainContent isSidebarOpen={isSidebarOpen}>
        {children}
      </MainContent>
    </div>
  );
};

export default React.memo(Layout); 