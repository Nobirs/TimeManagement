import { useEffect } from 'react';
import { useApp } from '../context/AppContext';

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

export const useInitialTheme = () => {
  const { theme, setTheme, setCustomTheme } = useApp();

  useEffect(() => {
    const applyTheme = (selectedTheme: string, colors: Record<string, string>) => {
      document.documentElement.setAttribute('data-theme', selectedTheme);
      document.documentElement.style.setProperty('--primary-color', colors.primary);
      document.documentElement.style.setProperty('--background-color', colors.background);
      document.documentElement.style.setProperty('--text-color', colors.text);
      document.documentElement.style.setProperty('--secondary-color', colors.secondary);
    };

    const currentTheme = theme || 'forest';
    const themeColors = predefinedThemes[currentTheme as keyof typeof predefinedThemes];
    
    if (themeColors) {
      applyTheme(currentTheme, themeColors);
      setTheme(currentTheme);
      setCustomTheme(themeColors);
    }
  }, []); // Пустой массив зависимостей, чтобы эффект выполнился только при монтировании
}; 