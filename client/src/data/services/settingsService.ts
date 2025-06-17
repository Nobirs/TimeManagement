import type { UserSettings } from '@time-management/shared-types';
import { storageService } from './storageService';

const STORAGE_KEY = 'userSettings';

const DEFAULT_SETTINGS: UserSettings = {
  theme: 'light',
  language: 'en',
  notifications: true,
  soundEnabled: true,
  fontSize: 'medium',
  customTheme: {
    primary: '#3b82f6',
    background: '#ffffff',
    text: '#1f2937',
    secondary: '#6b7280'
  }
};

class SettingsService {
  getSettings(): UserSettings {
    return storageService.get<UserSettings>(STORAGE_KEY) || DEFAULT_SETTINGS;
  }

  updateSettings(settings: Partial<UserSettings>): UserSettings {
    const currentSettings = this.getSettings();
    const newSettings = { ...currentSettings, ...settings };
    storageService.set(STORAGE_KEY, newSettings);
    return newSettings;
  }

  resetSettings(): UserSettings {
    storageService.set(STORAGE_KEY, DEFAULT_SETTINGS);
    return DEFAULT_SETTINGS;
  }

  getTheme(): string {
    return this.getSettings().theme;
  }

  setTheme(theme: string): void {
    this.updateSettings({ theme });
  }

  getLanguage(): string {
    return this.getSettings().language;
  }

  setLanguage(language: string): void {
    this.updateSettings({ language });
  }

  toggleNotifications(): boolean {
    const currentSettings = this.getSettings();
    const newValue = !currentSettings.notifications;
    this.updateSettings({ notifications: newValue });
    return newValue;
  }

  toggleSound(): boolean {
    const currentSettings = this.getSettings();
    const newValue = !currentSettings.soundEnabled;
    this.updateSettings({ soundEnabled: newValue });
    return newValue;
  }

  setFontSize(size: 'small' | 'medium' | 'large'): void {
    this.updateSettings({ fontSize: size });
  }
}

export const settingsService = new SettingsService(); 