import { useState, type ReactNode } from "react";
import ThemeSelector from "../../ThemeSelector";
import Icon from "../../Icon";

export default function Header(): ReactNode {
  const [isThemeOpen, setIsThemeOpen] = useState(false);

  return (
    <div className="p-4 border-b">
      <div className="flex items-center justify-between pl-12">
        <h1 className="text-xl font-bold text-gray-800">TimeMaster</h1>
        <button
          onClick={() => setIsThemeOpen(!isThemeOpen)}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          title="Change theme"
        >
          <Icon name="settings" className="w-5 h-5 text-gray-600" />
        </button>
      </div>
      {isThemeOpen && (
        <div className="absolute left-4 top-16 w-64 bg-white rounded-lg shadow-xl border p-4 z-50">
          <ThemeSelector onClose={() => setIsThemeOpen(false)} />
        </div>
      )}
    </div>
  );
}