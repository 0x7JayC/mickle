"use client";

import Link from "next/link";
import { ThemeDots } from "./ThemeShell";

// Single source of truth for the floating glass nav. Used on every
// public page (landing, treasury, dashboard) so the chrome reads as
// one product. Pages pass their context-specific actions as children.
export function SiteNav({ children }: { children?: React.ReactNode }) {
  return (
    <nav className="sticky top-4 z-50 px-4 sm:px-6 mt-4">
      <div className="max-w-6xl mx-auto glass-pill px-2 sm:px-3 py-2 flex items-center justify-between gap-2">
        <Link href="/" className="flex items-center gap-2 pl-2 sm:pl-3 min-w-0">
          <div className="w-7 h-7 shrink-0 rounded-full bg-gradient-to-br from-[#ff8a6b] to-[#f5b94a] shadow-[0_4px_12px_rgba(255,122,89,0.4)]" />
          <span className="font-semibold text-base tracking-tight truncate">Mickle</span>
        </Link>
        <div className="flex items-center gap-1 sm:gap-3 shrink-0">
          <Link
            href="/#how"
            className="hidden sm:inline px-3 py-2 text-sm text-muted hover:text-foreground transition rounded-full"
          >
            How
          </Link>
          <Link
            href="/treasury"
            className="hidden sm:inline px-3 py-2 text-sm text-muted hover:text-foreground transition rounded-full"
          >
            Treasury
          </Link>
          <ThemeDots className="hidden sm:flex sm:mr-1" />
          {children}
        </div>
      </div>
    </nav>
  );
}
