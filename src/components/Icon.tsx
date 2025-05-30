import React from 'react';
import { icons } from '../assets/icons';

interface IconProps {
  name: keyof typeof icons;
  className?: string;
}

const Icon: React.FC<IconProps> = ({ name, className = 'w-6 h-6' }) => {
  const iconSvg = icons[name];
  
  if (!iconSvg) {
    console.warn(`Icon "${name}" not found`);
    return null;
  }

  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: iconSvg }}
    />
  );
};

export default Icon; 