"use client";

import { useEffect } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { AuthButton } from "@coinbase/cdp-react";
import { useLang, t, type Dict } from "@/lib/i18n";

const dict: Dict = {
  startStreak: { en: "Start your streak →", zh: "开始连续打卡 →" },
  connectWallet: { en: "Connect Solana wallet", zh: "连接 Solana 钱包" },
  start: { en: "Start", zh: "开始" },
  openApp: { en: "Open app →", zh: "打开 App →" },
};

// Lives on the landing. Two CTAs:
//   • Primary — Coinbase CDP AuthButton (email · Apple · Google).
//     Provisions a Solana embedded wallet automatically. The grandma
//     path: no seed phrase, no wallet UI to learn.
//   • Secondary — Privy's wallet-only modal for crypto-native users
//     who want to connect Backpack / Phantom / Solflare directly.
//
// After CDP signs in, the AuthButton fires onSignInSuccess and we push
// to /dashboard. Privy users continue to be redirected by the existing
// useEffect.
export function LandingAuth() {
  const lang = useLang();
  const { ready, authenticated, login } = usePrivy();
  const router = useRouter();

  useEffect(() => {
    if (ready && authenticated) router.push("/dashboard");
  }, [ready, authenticated, router]);

  return (
    <div className="flex flex-col items-center gap-3 mb-12 sm:mb-12">
      <div className="flex flex-wrap justify-center gap-3">
        <AuthButton
          onSignInSuccess={() => router.push("/dashboard")}
          // CDP renders its own pill button — wrap so it inherits our
          // glass styling sibling-treatment in the row.
          className="cdp-auth-button"
        />
        <button
          onClick={() => login({ loginMethods: ["wallet"] })}
          className="glass-button px-7 py-3.5 font-semibold text-foreground"
        >
          {t(dict, "connectWallet", lang)}
        </button>
      </div>
      <p className="text-[11px] text-foreground/45 font-mono uppercase tracking-[0.18em]">
        {t(dict, "startStreak", lang)}
      </p>
    </div>
  );
}

// Compact version for the nav. Same Privy login() call, smaller pill.
export function LandingNavCta() {
  const lang = useLang();
  const { ready, authenticated, login } = usePrivy();
  const router = useRouter();

  useEffect(() => {
    if (ready && authenticated) router.push("/dashboard");
  }, [ready, authenticated, router]);

  return (
    <button
      onClick={() => login()}
      className="glass-button-primary px-5 py-2 text-sm font-semibold"
    >
      {t(dict, "start", lang)}
    </button>
  );
}

// Auth-aware "Open app" button used on /treasury (and any other public
// page where the user might be signed in or out). If signed in, sends
// them to the dashboard; if signed out, opens the Privy modal directly
// so they don't need to bounce through the landing first.
export function OpenAppButton({ className = "", children }: { className?: string; children?: React.ReactNode }) {
  const lang = useLang();
  const { ready, authenticated, login } = usePrivy();
  const router = useRouter();

  useEffect(() => {
    if (ready && authenticated) {
      // Don't auto-push here — we only want to redirect on click.
    }
  }, [ready, authenticated]);

  const onClick = () => {
    if (authenticated) {
      router.push("/dashboard");
    } else {
      login();
    }
  };

  return (
    <button
      onClick={onClick}
      className={className || "text-sm font-semibold text-foreground/70 hover:text-foreground"}
    >
      {children ?? t(dict, "openApp", lang)}
    </button>
  );
}
