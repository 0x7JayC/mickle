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

// Auth-aware "Open app" button used on /treasury (and any other public
// page where the user might be signed in or out). If signed in, sends
// them to the dashboard; if signed out, opens the Privy modal directly
// so they don't need to bounce through the landing first.
export function OpenAppButton({ className = "", children }: { className?: string; children?: React.ReactNode }) {
  const { ready, authenticated, login } = usePrivy();
  const router = useRouter();

  useEffect(() => {
    if (ready && authenticated) {
      // Don't auto-push here — we only want to redirect on click.
    }
  }, [ready, authenticated]);

  const onClick = () => {
    if (authenticated) {
      router.push("/app");
    } else {
      login();
    }
  };

  return (
    <button
      onClick={onClick}
      className={className || "text-sm font-semibold text-foreground/70 hover:text-foreground"}
    >
      {children ?? "Open app →"}
    </button>
  );
}
