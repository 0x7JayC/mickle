"use client";

import Link from "next/link";
import { useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { LangToggle } from "./LangToggle";
import { useLang, t, type Dict } from "@/lib/i18n";

const dict: Dict = {
  how: { en: "How", zh: "如何运作" },
  treasury: { en: "Treasury", zh: "金库" },
  account: { en: "Account", zh: "账户" },
  menu: { en: "Open menu", zh: "打开菜单" },
};

// Single source of truth for the floating glass nav. Used on every
// public page (landing, treasury, dashboard) so the chrome reads as
// one product. Pages pass their context-specific actions as children.
//
// Mobile: How / Treasury / Account collapse into a 3×3 dot-grid menu
// so the logo and primary CTA always fit. Desktop: inline links.
export function SiteNav({ children }: { children?: React.ReactNode }) {
  const lang = useLang();
  const { ready, authenticated } = usePrivy();
  const showAccount = ready && authenticated;
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <nav className="sticky top-4 z-50 px-4 sm:px-6 mt-4">
      <div className="max-w-6xl mx-auto liquid-glass px-2 sm:px-3 py-2 flex items-center justify-between gap-2 relative">
        <Link
          href="/"
          onClick={close}
          className="flex items-center gap-2 pl-2 sm:pl-3 min-w-0"
        >
          <div className="w-7 h-7 shrink-0 rounded-full bg-gradient-to-br from-[#ff8a6b] to-[#f5b94a] shadow-[0_4px_12px_rgba(255,122,89,0.4)]" />
          <span className="font-semibold text-base tracking-tight truncate">Mickle</span>
        </Link>
        <div className="flex items-center gap-1 sm:gap-3 shrink-0">
          {/* Desktop inline links */}
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
          {showAccount && (
            <Link
              href="/app"
              className="hidden sm:inline px-3 py-2 text-sm text-muted hover:text-foreground transition rounded-full"
            >
              {t(dict, "account", lang)}
            </Link>
          )}

          {/* Mobile menu toggle — 3×3 dot grid */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={t(dict, "menu", lang)}
            aria-expanded={open}
            className="sm:hidden p-2 rounded-full text-foreground/70 hover:text-foreground active:scale-95 transition"
          >
            <DotGridIcon />
          </button>

          <LangToggle />
          {children}
        </div>

        {/* Mobile dropdown — sits just below the nav pill */}
        {open && (
          <div
            className="sm:hidden absolute right-2 top-[calc(100%+8px)] min-w-[180px] rounded-[18px] liquid-glass p-2 shadow-[0_12px_32px_-8px_rgba(12,10,20,0.25)]"
            role="menu"
          >
            <Link
              href="/#how"
              onClick={close}
              role="menuitem"
              className="block px-4 py-2.5 text-[15px] text-foreground/80 hover:text-foreground hover:bg-foreground/[0.04] rounded-xl transition"
            >
              {t(dict, "how", lang)}
            </Link>
            <Link
              href="/treasury"
              onClick={close}
              role="menuitem"
              className="block px-4 py-2.5 text-[15px] text-foreground/80 hover:text-foreground hover:bg-foreground/[0.04] rounded-xl transition"
            >
              {t(dict, "treasury", lang)}
            </Link>
            {showAccount && (
              <Link
                href="/app"
                onClick={close}
                role="menuitem"
                className="block px-4 py-2.5 text-[15px] text-foreground/80 hover:text-foreground hover:bg-foreground/[0.04] rounded-xl transition"
              >
                {t(dict, "account", lang)}
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Backdrop — closes the menu when tapping anywhere outside */}
      {open && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={close}
          className="sm:hidden fixed inset-0 z-[-1] cursor-default"
        />
      )}
    </nav>
  );
}

function DotGridIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
      <circle cx="4" cy="4" r="1.5" />
      <circle cx="10" cy="4" r="1.5" />
      <circle cx="16" cy="4" r="1.5" />
      <circle cx="4" cy="10" r="1.5" />
      <circle cx="10" cy="10" r="1.5" />
      <circle cx="16" cy="10" r="1.5" />
      <circle cx="4" cy="16" r="1.5" />
      <circle cx="10" cy="16" r="1.5" />
      <circle cx="16" cy="16" r="1.5" />
    </svg>
  );
}
