import React, { useRef } from "react";
import Icon from "./Icon";
import { useSettings } from "../contexts/SettingsContext.tsx";
import { useAuth } from "../contexts/AuthContext.tsx";

interface ThemeSelectorProps {
  onClose?: () => void;
}

const predefinedThemes = {
  light: {
    primary: "#0ea5e9",
    background: "#f9fafb",
    text: "#111827",
    secondary: "#6b7280",
  },
  light2: {
    primary: "#304f5e",
    background: "#f9fafb",
    text: "#101215",
    secondary: "#66c1a7",
  },
  dark: {
    primary: "#38bdf8",
    background: "#1f2937",
    text: "#f9fafb",
    secondary: "#9ca3af",
  },
  forest: {
    primary: "#059669",
    background: "#f0fdf4",
    text: "#064e3b",
    secondary: "#65a30d",
  },
  sunset: {
    primary: "#db2777",
    background: "#fff1f2",
    text: "#881337",
    secondary: "#ea580c",
  },
  ocean: {
    primary: "#0891b2",
    background: "#ecfeff",
    text: "#164e63",
    secondary: "#0284c7",
  },
  lavender: {
    primary: "#7c3aed",
    background: "#f5f3ff",
    text: "#4c1d95",
    secondary: "#8b5cf6",
  },
  autumn: {
    primary: "#d97706",
    background: "#fffbeb",
    text: "#78350f",
    secondary: "#b45309",
  },
  mint: {
    primary: "#059669",
    background: "#f0fdfa",
    text: "#134e4a",
    secondary: "#14b8a6",
  },
  lufga: {
    primary: "#ebff57",
    background: "#28292C",
    text: "#000000",
    secondary: "#a2f7a1",
  },
};

const ThemeSelector: React.FC<ThemeSelectorProps> = ({ onClose }) => {
  const { theme, setTheme, setCustomTheme } = useSettings();
  const { logout } = useAuth();

  const applyTheme = (
    selectedTheme: string,
    colors: Record<string, string>
  ) => {
    document.documentElement.setAttribute("data-theme", selectedTheme);
    document.documentElement.style.setProperty(
      "--primary-color",
      colors.primary
    );
    document.documentElement.style.setProperty(
      "--background-color",
      colors.background
    );
    document.documentElement.style.setProperty("--text-color", colors.text);
    document.documentElement.style.setProperty(
      "--secondary-color",
      colors.secondary
    );
  };

  const handleThemeChange = (selectedTheme: string) => {
    if (predefinedThemes[selectedTheme as keyof typeof predefinedThemes]) {
      const themeColors =
        predefinedThemes[selectedTheme as keyof typeof predefinedThemes];
      setTheme(selectedTheme);
      setCustomTheme(themeColors);
      applyTheme(selectedTheme, themeColors);
    }
    onClose?.();
  };

  const handleLogout = () => {
    logout();
    onClose?.();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <select
          value={theme}
          onChange={(e) => handleThemeChange(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 bg-white"
        >
          {Object.keys(predefinedThemes).map((themeName) => (
            <option key={themeName} value={themeName}>
              {themeName.charAt(0).toUpperCase() + themeName.slice(1)}
            </option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {Object.entries(predefinedThemes).map(([themeName, colors]) => (
          <div
            key={themeName}
            className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
              theme === themeName
                ? "ring-2 ring-primary-500 shadow-md"
                : "hover:border-primary-300"
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
                  className={`w-5 h-5 text-white ${
                    theme === themeName ? "opacity-100" : "opacity-0"
                  }`}
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex space-x-1 mt-1">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: colors.primary }}
                  />
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: colors.secondary }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={handleLogout}
        className="w-full mt-4 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
      >
        <div className="flex items-center justify-center space-x-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z"
              clipRule="evenodd"
            />
          </svg>
          <span>Logout</span>
        </div>
      </button>
    </div>
  );
};

export default ThemeSelector;
