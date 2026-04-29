"use client";

import { useEffect, useState } from "react";

export type ThemeId = "a1" | "a2" | "a4" | "a5";

const STORAGE_KEY = "mickle:theme";
const DEFAULT_THEME: ThemeId = "a1";

const THEMES: { id: ThemeId; label: string; swatch: string }[] = [
  { id: "a1", label: "Sunrise", swatch: "linear-gradient(135deg, #ff7a59, #f5b94a)" },
  { id: "a2", label: "Dawn", swatch: "linear-gradient(135deg, #38bdf8, #a78bfa)" },
  { id: "a4", label: "Cream", swatch: "linear-gradient(135deg, #d8b48a, #b15932)" },
  { id: "a5", label: "Aurora", swatch: "linear-gradient(135deg, #2dd4bf, #a855f7, #ec4899)" },
];

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
    <>
      {/* Cross-fading fixed ambient layers — only the active one is visible */}
      {THEMES.map((t) => (
        <div
          key={t.id}
          className={`ambient-fixed ambient-${t.id}`}
          style={{ opacity: theme === t.id ? 1 : 0 }}
          aria-hidden
        />
      ))}

      {children}

      {/* Floating switcher */}
      <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[60]">
        <div className="glass-pill flex items-center gap-1 p-1.5">
          {THEMES.map((t) => {
            const active = theme === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                aria-label={`Switch to ${t.label} palette`}
                title={t.label}
                className={`group flex items-center gap-2 px-3 py-1.5 rounded-full transition ${
                  active ? "bg-foreground/95 text-white shadow-[0_4px_12px_rgba(12,10,20,0.3)]" : "hover:bg-white/30"
                }`}
              >
                <span
                  className="w-4 h-4 rounded-full ring-1 ring-white/40 shrink-0"
                  style={{ background: t.swatch }}
                />
                <span className={`text-xs font-medium ${active ? "" : "text-foreground/70"}`}>
                  {t.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
