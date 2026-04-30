"use client";

import Link from "next/link";
import { LangToggle } from "./LangToggle";
import { useLang, t, type Dict } from "@/lib/i18n";

const dict: Dict = {
  how: { en: "How", zh: "如何运作" },
  treasury: { en: "Treasury", zh: "金库" },
};

// Single source of truth for the floating glass nav. Used on every
// public page (landing, treasury, dashboard) so the chrome reads as
// one product. Pages pass their context-specific actions as children.
//
// Surface: Liquid Glass (`liquid-glass` class in globals.css) — the iOS 26
// material. Higher transparency, top specular gleam, lensing brightness.
// Theme-aware via --glass-* tokens, so all five palettes look right.
export function SiteNav({ children }: { children?: React.ReactNode }) {
  const lang = useLang();
  return (
    <nav className="sticky top-4 z-50 px-4 sm:px-6 mt-4">
      <div className="max-w-6xl mx-auto liquid-glass px-2 sm:px-3 py-2 flex items-center justify-between gap-2">
        <Link href="/" className="flex items-center gap-2 pl-2 sm:pl-3 min-w-0">
          <div className="w-7 h-7 shrink-0 rounded-full bg-gradient-to-br from-[#ff8a6b] to-[#f5b94a] shadow-[0_4px_12px_rgba(255,122,89,0.4)]" />
          <span className="font-semibold text-base tracking-tight truncate">Mickle</span>
        </Link>
        <div className="flex items-center gap-1 sm:gap-3 shrink-0">
          <Link
            href="/#how"
            className="hidden sm:inline px-3 py-2 text-sm text-muted hover:text-foreground transition rounded-full"
          >
            {t(dict, "how", lang)}
          </Link>
          <Link
            href="/treasury"
            className="hidden sm:inline px-3 py-2 text-sm text-muted hover:text-foreground transition rounded-full"
          >
            {t(dict, "treasury", lang)}
          </Link>
          <LangToggle />
          {children}
        </div>
      </div>
    </nav>
  );
}
