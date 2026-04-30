"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type ThemeId = "a1" | "a2" | "a4" | "a5";

const STORAGE_KEY = "mickle:theme";
const DEFAULT_THEME: ThemeId = "a1";

export const THEMES: { id: ThemeId; label: string; swatch: string }[] = [
  { id: "a1", label: "Sunrise", swatch: "linear-gradient(135deg, #ff7a59, #f5b94a)" },
  { id: "a2", label: "Dawn", swatch: "linear-gradient(135deg, #38bdf8, #a78bfa)" },
  { id: "a4", label: "Cream", swatch: "linear-gradient(135deg, #d8b48a, #b15932)" },
  { id: "a5", label: "Aurora", swatch: "linear-gradient(135deg, #2dd4bf, #a855f7, #ec4899)" },
];

type Ctx = { theme: ThemeId; setTheme: (t: ThemeId) => void };
const ThemeCtx = createContext<Ctx>({ theme: DEFAULT_THEME, setTheme: () => {} });

export function useTheme() {
  return useContext(ThemeCtx);
}

export default function ThemeShell({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeId>(DEFAULT_THEME);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const saved = (localStorage.getItem(STORAGE_KEY) as ThemeId | null) ?? DEFAULT_THEME;
    setTheme(saved);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    document.body.classList.remove("theme-a1", "theme-a2", "theme-a4", "theme-a5");
    document.body.classList.add(`theme-${theme}`);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme, hydrated]);

  return (
    <ThemeCtx.Provider value={{ theme, setTheme }}>
      {THEMES.map((t) => (
        <div
          key={t.id}
          className={`ambient-fixed ambient-${t.id}`}
          style={{ opacity: theme === t.id ? 1 : 0 }}
          aria-hidden
        />
      ))}
      {children}
    </ThemeCtx.Provider>
  );
}

export function ThemeDots({ className = "" }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {THEMES.map((t) => {
        const active = theme === t.id;
        return (
          <button
            key={t.id}
            onClick={() => setTheme(t.id)}
            aria-label={`Switch to ${t.label} palette`}
            title={t.label}
            className={`shrink-0 rounded-full transition ${
              active
                ? "ring-2 ring-foreground/80 ring-offset-2 ring-offset-transparent"
                : "opacity-60 hover:opacity-100"
            }`}
            style={{ width: 14, height: 14, background: t.swatch }}
          />
        );
      })}
    </div>
  );
}
