import React, { useRef } from 'react';
import { useApp } from '../context/AppContext';
import Icon from './Icon';

interface ThemeSelectorProps {
  onClose?: () => void;
}

const predefinedThemes = {
  light: {
    primary: '#0ea5e9',
    background: '#f9fafb',
    text: '#111827',
    secondary: '#6b7280'
  },
  dark: {
    primary: '#38bdf8',
    background: '#1f2937',
    text: '#f9fafb',
    secondary: '#9ca3af'
  },
  forest: {
    primary: '#059669',
    background: '#f0fdf4',
    text: '#064e3b',
    secondary: '#65a30d'
  },
  sunset: {
    primary: '#db2777',
    background: '#fff1f2',
    text: '#881337',
    secondary: '#ea580c'
  },
  ocean: {
    primary: '#0891b2',
    background: '#ecfeff',
    text: '#164e63',
    secondary: '#0284c7'
  },
  lavender: {
    primary: '#7c3aed',
    background: '#f5f3ff',
    text: '#4c1d95',
    secondary: '#8b5cf6'
  },
  autumn: {
    primary: '#d97706',
    background: '#fffbeb',
    text: '#78350f',
    secondary: '#b45309'
  },
  mint: {
    primary: '#059669',
    background: '#f0fdfa',
    text: '#134e4a',
    secondary: '#14b8a6'
  }
};

const ThemeSelector: React.FC<ThemeSelectorProps> = ({ onClose }) => {
  const { theme, setTheme, setCustomTheme } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const applyTheme = (selectedTheme: string, colors: Record<string, string>) => {
    document.documentElement.setAttribute('data-theme', selectedTheme);
    document.documentElement.style.setProperty('--primary-color', colors.primary);
    document.documentElement.style.setProperty('--background-color', colors.background);
    document.documentElement.style.setProperty('--text-color', colors.text);
    document.documentElement.style.setProperty('--secondary-color', colors.secondary);
  };

  const handleThemeChange = (selectedTheme: string) => {
    if (predefinedThemes[selectedTheme as keyof typeof predefinedThemes]) {
      const themeColors = predefinedThemes[selectedTheme as keyof typeof predefinedThemes];
      setTheme(selectedTheme);
      setCustomTheme(themeColors);
      applyTheme(selectedTheme, themeColors);
    }
    onClose?.();
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const css = e.target?.result as string;
          const style = document.createElement('style');
          style.textContent = css;
          document.head.appendChild(style);
          setTheme('custom');
          onClose?.();
        } catch (error) {
          console.error('Error loading custom theme:', error);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <select
          value={theme}
          onChange={(e) => handleThemeChange(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 bg-white"
        >
          <option value="light">Light</option>
          <option value="dark">Dark</option>
          <option value="forest">Forest</option>
          <option value="sunset">Sunset</option>
          <option value="ocean">Ocean</option>
          <option value="lavender">Lavender</option>
          <option value="autumn">Autumn</option>
          <option value="mint">Mint</option>
        </select>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
        >
          Upload Custom Theme
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".css"
          className="hidden"
          onChange={handleFileUpload}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        {Object.entries(predefinedThemes).map(([themeName, colors]) => (
          <div
            key={themeName}
            className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
              theme === themeName ? 'ring-2 ring-primary-500 shadow-md' : 'hover:border-primary-300'
            }`}
            style={{ backgroundColor: colors.background }}
            onClick={() => handleThemeChange(themeName)}
          >
            <div className="flex items-center space-x-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: colors.primary }}
              >
                <Icon 
                  name="settings" 
                  className={`w-5 h-5 text-white ${theme === themeName ? 'opacity-100' : 'opacity-0'}`} 
                />
              </div>
              <div className="min-w-0 flex-1">
                {/* <span className="font-medium capitalize block truncate" style={{ color: colors.text }}>{themeName}</span> */}
                <div className="flex space-x-1 mt-1">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors.primary }} />
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors.secondary }} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ThemeSelector; 