import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Themes, ThemeName } from "../themePresets";

export type HSL = { h: number; s: number; l: number };
export type ThemeMode = "light" | "dark" | "system";

type ThemeContextType = {
  theme: ThemeName;
  themeMode: ThemeMode;
  applyTheme: (name: ThemeName) => void;
  setThemeMode: (mode: ThemeMode) => void;

  applyCustomVars: (vars: Record<string, string>) => void;

  setTileColor: (id: string, hsl: HSL) => void;
  getTileColor: (id: string) => HSL | null;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_THEME = "saathi_theme_v2";
const STORAGE_MODE = "saathi_theme_mode_v1";
const STORAGE_TILES = "saathi_tile_colors_hsl_v1";

/* Detect system mode */
function getSystemTheme(): ThemeMode {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyTileColors(colors: Record<string, HSL>) {
  Object.entries(colors).forEach(([id, hsl]) => {
    const base = `--tile-${id}`;
    document.documentElement.style.setProperty(`${base}-h`, `${hsl.h}`);
    document.documentElement.style.setProperty(`${base}-s`, `${hsl.s}%`);
    document.documentElement.style.setProperty(`${base}-l`, `${hsl.l}%`);
    document.documentElement.style.setProperty(
      `${base}-hsl`,
      `hsl(${hsl.h}deg ${hsl.s}% ${hsl.l}%)`
    );
  });
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeName>("default");
  const [themeMode, setThemeModeState] = useState<ThemeMode>("system");

  /* ✅ SAFE initialization (from second file) */
  const [tileColors, setTileColors] = useState<Record<string, HSL>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_TILES);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const applyVars = useCallback((vars: Record<string, string>) => {
    Object.entries(vars).forEach(([k, v]) =>
      document.documentElement.style.setProperty(k, v)
    );
  }, []);

  const applyTheme = useCallback((name: ThemeName) => {
    const preset = Themes[name];
    if (!preset) return;

    applyVars(preset);
    setTheme(name);
    localStorage.setItem(STORAGE_THEME, name);
  }, [applyVars]);

  const updateDocumentMode = useCallback((mode: ThemeMode) => {
    const applied = mode === "system" ? getSystemTheme() : mode;
    document.documentElement.classList.toggle("dark", applied === "dark");
  }, []);

  const setThemeMode = useCallback((mode: ThemeMode) => {
    setThemeModeState(mode);
    localStorage.setItem(STORAGE_MODE, mode);
    updateDocumentMode(mode);
  }, [updateDocumentMode]);

  /* ✅ Persist tile colors safely */
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_TILES, JSON.stringify(tileColors));
      applyTileColors(tileColors);
    } catch (err) {
      console.error("Failed to persist tile colors:", err);
    }
  }, [tileColors]);

  /* Load on Startup */
  useEffect(() => {
    const savedTheme = localStorage.getItem(STORAGE_THEME) as ThemeName | null;
    if (savedTheme) applyTheme(savedTheme);

    const savedMode = localStorage.getItem(STORAGE_MODE) as ThemeMode | null;
    if (savedMode) {
      setThemeMode(savedMode);
    } else {
      updateDocumentMode("system");
    }

    /* ✅ Apply tiles only (do NOT reset state) */
    const savedTiles = JSON.parse(localStorage.getItem(STORAGE_TILES) || "{}");
    applyTileColors(savedTiles);
  }, [applyTheme, setThemeMode, updateDocumentMode]);

  const setTileColor = (id: string, hsl: HSL) => {
    setTileColors((prev) => {
      const updated = { ...prev, [id]: hsl };
      localStorage.setItem(STORAGE_TILES, JSON.stringify(updated));
      applyTileColors(updated);
      return updated;
    });
  };

  const getTileColor = useCallback(
    (id: string) => tileColors[id] || null,
    [tileColors]
  );

  const value = useMemo(
    () => ({
      theme,
      themeMode,
      applyTheme,
      setThemeMode,
      applyCustomVars: applyVars,
      setTileColor,
      getTileColor,
    }),
    [theme, themeMode, applyVars, applyTheme, setThemeMode, getTileColor]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/* eslint-disable-next-line react-refresh/only-export-components -- useTheme is tightly
   coupled to ThemeProvider/ThemeContext; splitting into a separate file would require
   updating every import across the codebase. Only affects dev Fast Refresh, not production. */
export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>");
  return ctx;
}