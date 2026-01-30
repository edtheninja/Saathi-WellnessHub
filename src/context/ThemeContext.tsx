import {
  createContext,
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

  const applyVars = (vars: Record<string, string>) =>
    Object.entries(vars).forEach(([k, v]) =>
      document.documentElement.style.setProperty(k, v)
    );

  const applyTheme = (name: ThemeName) => {
    const preset = Themes[name];
    if (!preset) return;

    applyVars(preset);
    setTheme(name);
    localStorage.setItem(STORAGE_THEME, name);
  };

  const updateDocumentMode = (mode: ThemeMode) => {
    const applied = mode === "system" ? getSystemTheme() : mode;
    document.documentElement.classList.toggle("dark", applied === "dark");
  };

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    localStorage.setItem(STORAGE_MODE, mode);
    updateDocumentMode(mode);
  };

  /* ✅ Persist tile colors safely */
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_TILES, JSON.stringify(tileColors));
      applyTileColors(tileColors);
    } catch {}
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
  }, []);

  const setTileColor = (id: string, hsl: HSL) => {
    setTileColors((prev) => {
      const updated = { ...prev, [id]: hsl };
      localStorage.setItem(STORAGE_TILES, JSON.stringify(updated));
      applyTileColors(updated);
      return updated;
    });
  };

  const getTileColor = (id: string) => tileColors[id] || null;

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
    [theme, themeMode, tileColors]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>");
  return ctx;
}
