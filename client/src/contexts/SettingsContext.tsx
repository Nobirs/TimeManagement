import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Theme } from '@time-management/shared-types';
import { settingsService } from '../data/services/settingsService';

interface SettingsContextType {
  theme: string;
  setTheme: (theme: string) => void;
  customTheme: Theme;
  setCustomTheme: (theme: Theme) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<string>(settingsService.getTheme());
  const [customTheme, setCustomThemeState] = useState<Theme>(settingsService.getSettings().customTheme);

  const setTheme = (newTheme: string) => {
    settingsService.setTheme(newTheme);
    setThemeState(newTheme);
  };

  const setCustomTheme = (newTheme: Theme) => {
    settingsService.updateSettings({ customTheme: newTheme });
    setCustomThemeState(newTheme);
  };

  useEffect(() => {
    // Если нужно, можно слушать изменения в localStorage
  }, []);

  const value = {
    theme,
    setTheme,
    customTheme,
    setCustomTheme
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
