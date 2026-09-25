/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import { THEME_STORAGE_KEY, type ThemeMode } from "./themeStorage";

/* re-export so existing imports of `ThemeMode` keep working */
export type { ThemeMode };

interface ThemeContextValue {
  theme: ThemeMode;
  resolved: "light" | "dark";
  setTheme: (mode: ThemeMode) => void;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);
const STORAGE_KEY = THEME_STORAGE_KEY;

function isThemeMode(v: string | null): v is ThemeMode {
  return v === "light" || v === "dark" || v === "system";
}

/** Read the persisted preference. Only ever called from the client. */
function readStoredTheme(): ThemeMode | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return isThemeMode(saved) ? saved : null;
  } catch {
    return null;
  }
}

/**
 * ThemeProvider — app-wide Light / Dark / System theming, persisted to
 * localStorage and applied via the `data-theme` attribute (drive CSS vars).
 * "System" reacts to prefers-color-scheme.
 *
 * The state always starts at "light" so the server-rendered HTML and the first
 * client render agree (reading localStorage / matchMedia during render is a
 * classic hydration mismatch). The stored preference is applied in an effect
 * right after hydration; the inline script in the root layout paints the
 * correct `data-theme` before hydration, so there is no flash either.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>("light");
  const [system, setSystem] = useState<"light" | "dark">("light");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = readStoredTheme();
    if (stored) setThemeState(stored);
    setReady(true);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) =>
      setSystem(e.matches ? "dark" : "light");
    setSystem(mq.matches ? "dark" : "light");
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const resolved = theme === "system" ? system : theme;

  useEffect(() => {
    if (!ready) return;
    const root = document.documentElement;
    root.dataset.theme = resolved;
    root.style.colorScheme = resolved;
  }, [ready, resolved]);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* ignore storage errors */
    }
  }, [ready, theme]);

  const setTheme = useCallback((mode: ThemeMode) => setThemeState(mode), []);
  const toggle = useCallback(
    () => setThemeState((t) => (t === "dark" ? "light" : "dark")),
    [],
  );

  const value = useMemo(
    () => ({ theme, resolved, setTheme, toggle }),
    [theme, resolved, setTheme, toggle],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
