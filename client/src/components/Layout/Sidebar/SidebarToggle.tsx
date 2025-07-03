import React from 'react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

interface SidebarToggleProps {
    isOpen: boolean;
    onClick: () => void;
}

const SidebarToggle = ({ isOpen, onClick }: SidebarToggleProps) => (
    <button
        id="sidebar-toggle"
        onClick={onClick}
        className="fixed top-4 left-4 z-50 p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
        aria-label={isOpen ? 'Close sidebar' : 'Open sidebar'}
        aria-expanded={isOpen}
    >
        {isOpen ? (
            <XMarkIcon className="h-6 w-6" />
        ) : (
            <Bars3Icon className="h-6 w-6" />
        )}
        </button>
);

export default React.memo(SidebarToggle);