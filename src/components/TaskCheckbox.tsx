import React from 'react';
import { CheckIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

interface TaskCheckboxProps {
  status: 'todo' | 'in-progress' | 'completed';
  onChange: () => void;
  size?: 'sm' | 'md';
}

const TaskCheckbox: React.FC<TaskCheckboxProps> = ({ status, onChange, size = 'md' }) => {
  const getBaseClasses = () => {
    const sizeClasses = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';
    return `relative rounded-full transition-all duration-200 cursor-pointer ${sizeClasses}`;
  };

  const getStatusClasses = () => {
    switch (status) {
      case 'completed':
        return 'bg-green-500 border-transparent hover:bg-green-600';
      case 'in-progress':
        return 'bg-blue-500 border-transparent hover:bg-blue-600';
      default:
        return 'bg-white border-gray-300 hover:border-gray-400';
    }
  };

  const getIconClasses = () => {
    const sizeClasses = size === 'sm' ? 'w-2.5 h-2.5' : 'w-3 h-3';
    return `absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 ${sizeClasses} text-white`;
  };

  return (
    <button
      onClick={onChange}
      className={`${getBaseClasses()} ${getStatusClasses()} border-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 group`}
    >
      {status === 'completed' && (
        <CheckIcon className={`${getIconClasses()} transition-transform duration-200 group-hover:scale-110`} />
      )}
      {status === 'in-progress' && (
        <ArrowPathIcon className={`${getIconClasses()} animate-spin`} />
      )}
    </button>
  );
};

export default TaskCheckbox; 