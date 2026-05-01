"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthButton } from "@coinbase/cdp-react";
import { useIsSignedIn } from "@coinbase/cdp-hooks";
import { useLang, t, type Dict } from "@/lib/i18n";

const dict: Dict = {
  startStreak: { en: "Sign in with email · Apple · Google", zh: "邮箱 · Apple · Google 登录" },
  start: { en: "Sign in", zh: "登录" },
  openApp: { en: "Open app →", zh: "打开 App →" },
  initialising: { en: "Sign in", zh: "登录" },
};

// Pill placeholders rendered while the CDP SDK is still initializing.
// Without these, AuthButton shows its default gray skeleton for 1-3s
// after every page load — perceptible enough that users think the
// page is broken. The placeholder is non-interactive but visually
// identical to the resolved sign-in pill, so the UI feels instant.
function PrimaryAuthPlaceholder({ label }: { label: string }) {
  return (
    <div
      className="glass-button-primary px-7 py-3.5 font-semibold opacity-60 pointer-events-none"
      aria-hidden
    >
      {label}
    </div>
  );
}

function CompactAuthPlaceholder({ label }: { label: string }) {
  return (
    <div
      className="glass-button-primary px-5 py-2 text-sm font-semibold opacity-60 pointer-events-none"
      aria-hidden
    >
      {label}
    </div>
  );
}

// Lives on the landing. Coinbase CDP <AuthButton/> handles the whole
// sign-in flow (email · Apple · Google → embedded Solana wallet).
// The "Connect crypto wallet" path is parked until we wire
// @solana/wallet-adapter — judges using Backpack can sign in with
// email for now, then connect their wallet inside the dashboard.
//
// After CDP signs in, the AuthButton fires onSignInSuccess and we
// push to /dashboard. We also push if the user reloads the landing
// while already signed in.
export function LandingAuth() {
  const lang = useLang();
  const { isSignedIn } = useIsSignedIn();
  const router = useRouter();
  const placeholderLabel = t(dict, "initialising", lang);

  useEffect(() => {
    if (isSignedIn) router.push("/dashboard");
  }, [isSignedIn, router]);

  return (
    <div className="flex flex-col items-center gap-3 mb-12 sm:mb-12">
      <AuthButton
        onSignInSuccess={() => router.push("/dashboard")}
        placeholder={() => <PrimaryAuthPlaceholder label={placeholderLabel} />}
      />
      <p className="text-[11px] text-foreground/45 font-mono uppercase tracking-[0.18em]">
        {t(dict, "startStreak", lang)}
      </p>
    </div>
  );
}

// Compact version for the nav. CDP's <AuthButton/> renders the
// label itself ("Sign in" / "Sign out") so we just expose it.
export function LandingNavCta() {
  const lang = useLang();
  const router = useRouter();
  const { isSignedIn } = useIsSignedIn();
  const placeholderLabel = t(dict, "start", lang);

  useEffect(() => {
    if (isSignedIn) router.push("/dashboard");
  }, [isSignedIn, router]);

  return (
    <AuthButton
      onSignInSuccess={() => router.push("/dashboard")}
      placeholder={() => <CompactAuthPlaceholder label={placeholderLabel} />}
    />
  );
}

// Auth-aware "Open app" button used on /treasury (and any other public
// page where the user might be signed in or out). If signed in, sends
// them to the dashboard; otherwise the user clicks the inline auth
// button to sign in.
export function OpenAppButton({ className = "", children }: { className?: string; children?: React.ReactNode }) {
  const lang = useLang();
  const { isSignedIn } = useIsSignedIn();
  const router = useRouter();
  const placeholderLabel = t(dict, "start", lang);

  if (isSignedIn) {
    return (
      <button
        onClick={() => router.push("/dashboard")}
        className={className || "text-sm font-semibold text-foreground/70 hover:text-foreground"}
      >
        {children ?? t(dict, "openApp", lang)}
      </button>
    );
  }
  return (
    <AuthButton
      onSignInSuccess={() => router.push("/dashboard")}
      placeholder={() => <CompactAuthPlaceholder label={placeholderLabel} />}
    />
  );
}
