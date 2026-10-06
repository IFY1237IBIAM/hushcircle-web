"use client";
// Matches mobile ThemeContext.js — DARK/LIGHT palettes, persisted to localStorage
import { createContext, useContext, useState, useEffect, useCallback } from "react";

const DARK = {
  bg:"#0F0A1E", card:"#1A1330", cardAlt:"#201840",
  border:"#2D2450", borderSoft:"#241E40",
  accent:"#9B6FD4", accentSoft:"#C4A3E8", accentMuted:"#6A4FA0",
  text:"#EDE8F5", textMuted:"#8B7FA8", textFaint:"#5C5478",
  success:"#4CAF8F", error:"#D4607A", warning:"#D4A44C",
  inputBg:"#0F0A1E", tabBar:"#120E22",
};
const LIGHT = {
  bg:"#F8F6FF", card:"#FFFFFF", cardAlt:"#F2EEFF",
  border:"#E0D8F5", borderSoft:"#EDE8F5",
  accent:"#7B52C7", accentSoft:"#9B6FD4", accentMuted:"#B89EDF",
  text:"#1A1330", textMuted:"#6B5F8A", textFaint:"#A898C8",
  success:"#2E9C72", error:"#C04060", warning:"#B8862A",
  inputBg:"#F2EEFF", tabBar:"#FFFFFF",
};

const KEY_THEME = "@hushcircle:theme";

function applyTheme(isDark) {
  const palette = isDark ? DARK : LIGHT;
  const root = document.documentElement;
  Object.entries(palette).forEach(([key, value]) => {
    // Convert camelCase to --hc-camel-case CSS var
    const cssKey = "--hc-" + key.replace(/([A-Z])/g, "-$1").toLowerCase();
    root.style.setProperty(cssKey, value);
  });
  root.setAttribute("data-theme", isDark ? "dark" : "light");
}

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(true);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY_THEME);
      const dark = saved ? saved === "dark" : true;
      setIsDark(dark);
      applyTheme(dark);
    } catch {}
    setLoaded(true);
  }, []);

  const toggleTheme = useCallback(() => {
    setIsDark(prev => {
      const next = !prev;
      try { localStorage.setItem(KEY_THEME, next ? "dark" : "light"); } catch {}
      applyTheme(next);
      return next;
    });
  }, []);

  const setTheme = useCallback((value) => {
    const next = value === "dark";
    setIsDark(next);
    try { localStorage.setItem(KEY_THEME, value); } catch {}
    applyTheme(next);
  }, []);

  const colors = isDark ? DARK : LIGHT;

  if (!loaded) return null;

  return (
    <ThemeContext.Provider value={{ isDark, theme: isDark?"dark":"light", toggleTheme, setTheme, colors, DARK, LIGHT }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be inside ThemeProvider");
  return ctx;
}
