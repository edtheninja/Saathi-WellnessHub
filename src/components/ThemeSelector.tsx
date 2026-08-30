import React from "react";
import { useTheme } from "../context/ThemeContext";
import { ThemeName } from "../themePresets";
import ThemeEditor from "./ThemeEditor/ThemeEditor";

export default function ThemeSelector() {
  const { theme, applyTheme } = useTheme();

  return (
    <div className="space-y-4">
      {/* Theme Presets */}
      <div className="flex items-center gap-3">
        <select
          value={theme}
          onChange={(e) => applyTheme(e.target.value as ThemeName)}
          className="rounded-md p-2 border border-border bg-card text-card-foreground"
        >
          <option value="default">Default</option>
          <option value="ocean">Ocean</option>
          <option value="lavender">Lavender</option>
          <option value="warm">Warm</option>
        </select>
      </div>

      {/* Full Custom Editor */}
      <ThemeEditor />
    </div>
  );
}