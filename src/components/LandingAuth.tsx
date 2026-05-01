"use client";

import { useRouter } from "next/navigation";
import { useLang, t, type Dict } from "@/lib/i18n";

const dict: Dict = {
  startStreak: { en: "Sign in with email · Apple · Google", zh: "邮箱 · Apple · Google 登录" },
  start: { en: "Sign in", zh: "登录" },
  openApp: { en: "Open app →", zh: "打开 App →" },
};

// Public-page sign-in buttons. CDP no longer initializes on landing /
// treasury — that init only happens inside /dashboard's layout. So
// these buttons are simple navigations to /dashboard, where CDP
// loads once and the inline AuthButton handles the actual auth flow.
//
// This keeps landing first-paint fast (no SDK handshake) and means
// crawlers / preview cards see the marketing UI without waiting on
// any client-side auth provider to mount.

// Primary CTA used at the bottom of the landing.
export function LandingAuth() {
  const lang = useLang();
  const router = useRouter();
  return (
    <div className="flex flex-col items-center gap-3 mb-12 sm:mb-12">
      <button
        onClick={() => router.push("/dashboard")}
        className="glass-button-primary px-7 py-3.5 font-semibold"
      >
        {t(dict, "start", lang)}
      </button>
      <p className="text-[11px] text-foreground/45 font-mono uppercase tracking-[0.18em]">
        {t(dict, "startStreak", lang)}
      </p>
    </div>
  );
}

// Compact version for the floating nav.
export function LandingNavCta() {
  const lang = useLang();
  const router = useRouter();
  return (
    <button
      onClick={() => router.push("/dashboard")}
      className="glass-button-primary px-5 py-2 text-sm font-semibold"
    >
      {t(dict, "start", lang)}
    </button>
  );
}

// 'Open app' button used on /treasury. Same navigation either way —
// /dashboard handles signed-out visitors with its inline auth prompt.
export function OpenAppButton({
  className = "",
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  const lang = useLang();
  const router = useRouter();
  return (
    <button
      onClick={() => router.push("/dashboard")}
      className={className || "text-sm font-semibold text-foreground/70 hover:text-foreground"}
    >
      {children ?? t(dict, "openApp", lang)}
    </button>
  );
}
