import React from 'react';
import Header from './Header.tsx';
import Navigation from './Navigation.tsx';
import Overlay from './Overlay.tsx';


interface SidebarProps {
    isOpen: boolean;
    isMobile: boolean;
    onClose: () => void;
}

const Sidebar = ({ isOpen, isMobile, onClose }: SidebarProps) => (
    <>
        <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-hidden={!isOpen}
      >
        <div className="h-full bg-white relative">
          <div className="relative z-10">
            <Header />
            <Navigation />
          </div>
        </div>
      </aside>
      {isOpen && isMobile && <Overlay onClose={onClose} />}
    </>
);

export default React.memo(Sidebar);

