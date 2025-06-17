import React from 'react';
import { icons, type IconName } from '../assets/icons';

interface IconProps {
  name: IconName;
  className?: string;
  title?: string;
  'aria-hidden'?: boolean;
}

const Icon: React.FC<IconProps> = ({ name, className = 'w-6 h-6 inline-block align-middle', title, 'aria-hidden': ariaHidden = false }) => {
  const iconSvg = icons[name];

  if (!iconSvg) {
    console.warn(`Icon "${name}" not found`);
    return (
      <span
        className={`${className} bg-red-100 text-red-800`}
        aria-hidden={ariaHidden}
        >
          [icon:{name}]
        </span>
    );
  }

  return (
    <span
      className={`icon ${className}`}
      aria-hidden={!title ? ariaHidden : undefined}
      role={title ? 'img' : undefined}
      aria-label={title}
      dangerouslySetInnerHTML={{ __html: iconSvg }}
      />
  );
};

export default React.memo(Icon); 