"use client";

import Link from "next/link";
import { useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { LangToggle } from "./LangToggle";
import { useLang, t, type Dict } from "@/lib/i18n";

const dict: Dict = {
  treasury: { en: "Treasury", zh: "金库" },
  account: { en: "Account", zh: "账户" },
  menu: { en: "Open menu", zh: "打开菜单" },
};

// Single source of truth for the floating glass nav.
// Public visitors see only logo + LangToggle + CTA (clean landing).
// Once signed in, Account and Treasury links appear — desktop inline,
// mobile collapsed into a 3×3 dot-grid Liquid Glass menu.
export function SiteNav({ children }: { children?: React.ReactNode }) {
  const lang = useLang();
  const { ready, authenticated } = usePrivy();
  const showLinks = ready && authenticated;
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <nav className="sticky top-4 z-50 px-4 sm:px-6 mt-4 relative">
      <div className="max-w-6xl mx-auto liquid-glass px-2 sm:px-3 py-2 flex items-center justify-between gap-2">
        <Link
          href="/"
          onClick={close}
          className="flex items-center gap-2 pl-2 sm:pl-3 min-w-0"
        >
          <div className="w-7 h-7 shrink-0 rounded-full bg-gradient-to-br from-[#ff8a6b] to-[#f5b94a] shadow-[0_4px_12px_rgba(255,122,89,0.4)]" />
          <span className="font-semibold text-base tracking-tight truncate">Mickle</span>
        </Link>
        <div className="flex items-center gap-1 sm:gap-3 shrink-0">
          {/* Desktop inline links — only when signed in */}
          {showLinks && (
            <>
              <Link
                href="/dashboard"
                className="hidden sm:inline px-3 py-2 text-sm text-muted hover:text-foreground transition rounded-full"
              >
                {t(dict, "account", lang)}
              </Link>
              <Link
                href="/treasury"
                className="hidden sm:inline px-3 py-2 text-sm text-muted hover:text-foreground transition rounded-full"
              >
                {t(dict, "treasury", lang)}
              </Link>
            </>
          )}

          {/* Mobile menu trigger — dropdown lives outside the nav pill below */}
          {showLinks && (
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-label={t(dict, "menu", lang)}
              aria-expanded={open}
              className="sm:hidden p-2 rounded-full text-foreground/70 hover:text-foreground active:scale-95 transition"
            >
              <DotGridIcon />
            </button>
          )}

          <LangToggle />
          {children}
        </div>
      </div>

      {/* Mobile dropdown — anchored to the outer nav so it lands cleanly
          below the pill, not inside the centred dot-button wrapper. */}
      {showLinks && open && (
        <div
          className="sm:hidden absolute right-4 sm:right-6 top-full mt-3 min-w-[180px] liquid-glass-panel nav-menu-drop p-1.5"
          role="menu"
        >
          <Link
            href="/dashboard"
            onClick={close}
            role="menuitem"
            className="block px-4 py-3 text-[15px] font-medium text-foreground/85 hover:text-foreground hover:bg-foreground/[0.06] active:bg-foreground/[0.10] rounded-[14px] transition"
          >
            {t(dict, "account", lang)}
          </Link>
          <Link
            href="/treasury"
            onClick={close}
            role="menuitem"
            className="block px-4 py-3 text-[15px] font-medium text-foreground/85 hover:text-foreground hover:bg-foreground/[0.06] active:bg-foreground/[0.10] rounded-[14px] transition"
          >
            {t(dict, "treasury", lang)}
          </Link>
        </div>
      )}

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
