"use client";

import { useEffect } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";

// Lives on the landing. Two CTAs:
//   • "Start your streak" → opens the full Privy modal (email · Apple ·
//     Google · Solana wallet)
//   • "Connect Solana wallet" → opens straight to the wallet picker
//
// Once authenticated, push to /app. While auth is in-flight Privy
// shows its own modal — we don't need a loading state here.
export function LandingAuth() {
  const { ready, authenticated, login } = usePrivy();
  const router = useRouter();

  useEffect(() => {
    if (ready && authenticated) router.push("/app");
  }, [ready, authenticated, router]);

  // While auth is in flight or we're about to redirect, render the
  // buttons in their default state — Privy's modal owns the spinner.
  return (
    <div className="flex flex-wrap justify-center gap-3 mb-12 sm:mb-12">
      <button
        onClick={() => login()}
        className="glass-button-primary px-7 py-3.5 font-semibold"
      >
        Start your streak →
      </button>
      <button
        onClick={() => login({ loginMethods: ["wallet"] })}
        className="glass-button px-7 py-3.5 font-semibold text-foreground"
      >
        Connect Solana wallet
      </button>
    </div>
  );
}

// Compact version for the nav. Same Privy login() call, smaller pill.
export function LandingNavCta() {
  const { ready, authenticated, login } = usePrivy();
  const router = useRouter();

  useEffect(() => {
    if (ready && authenticated) router.push("/app");
  }, [ready, authenticated, router]);

  return (
    <button
      onClick={() => login()}
      className="glass-button-primary px-5 py-2 text-sm font-semibold"
    >
      Start
    </button>
  );
}
