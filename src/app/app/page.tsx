"use client";

import { useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useWallets as useSolanaWallets } from "@privy-io/react-auth/solana";
import Link from "next/link";
import MiniTimeMachine from "@/components/MiniTimeMachine";
import { getTodaysParable } from "@/lib/parables";

type DbUser = {
  id: string;
  wallet: string | null;
  email: string | null;
  streak_count: number;
  last_tap_date: string | null;
};

const MILESTONE_DAYS = 30;

export default function App() {
  const { ready, authenticated, user, login, logout, getAccessToken } = usePrivy();
  const { wallets } = useSolanaWallets();
  const [dbUser, setDbUser] = useState<DbUser | null>(null);
  const [walletShown, setWalletShown] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);

  const wallet = wallets[0]?.address ?? null;

  useEffect(() => {
    if (!authenticated) return;
    setLoggingIn(false);
    (async () => {
      const token = await getAccessToken();
      if (!token) return;
      const r = await fetch("/api/users/upsert", {
        method: "POST",
        headers: { authorization: `Bearer ${token}` },
      });
      if (r.ok) {
        const { user } = await r.json();
        setDbUser(user);
      }
    })();
  }, [authenticated, wallet, getAccessToken]);

  if (!ready) {
    return (
      <main className="flex-1 flex items-center justify-center">
        <div className="text-muted">Loading…</div>
      </main>
    );
  }

  if (!authenticated) {
    const onContinue = () => {
      setLoggingIn(true);
      login();
    };
    return (
      <main className="flex-1 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center px-6 pointer-events-none select-none">
          <h1 className="text-display text-7xl sm:text-9xl font-extrabold leading-[0.9] text-center opacity-30 blur-[2px]">
            Every little
            <br />
            makes a mickle.
          </h1>
        </div>
        <div className="absolute inset-0 bg-[var(--glass-tint-deep)] backdrop-blur-2xl" />
        <div className="relative min-h-full flex items-center justify-center px-4 py-10">
          <div
            role="dialog"
            aria-modal="true"
            className="glass-strong p-9 sm:p-10 max-w-sm w-full text-center fade-up shadow-[0_24px_60px_-12px_rgba(12,10,20,0.25),inset_0_1px_0_var(--glass-stroke-inner)]"
            style={{ animationDuration: "0.5s" }}
          >
            <div className="w-12 h-12 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-[#ff8a6b] to-[#f5b94a] shadow-[0_8px_24px_-4px_rgba(255,122,89,0.5),inset_0_1px_0_rgba(255,255,255,0.5)]" />
            <h1 className="text-display text-2xl sm:text-3xl font-bold mb-2 tracking-tight">
              Welcome to Mickle.
            </h1>
            <p className="text-[15px] text-muted mb-7 leading-relaxed">
              {loggingIn
                ? "Provisioning your Solana wallet…"
                : "Sign in with email. A Solana wallet appears in 5 seconds. No seed phrase."}
            </p>
            <button
              onClick={onContinue}
              disabled={loggingIn}
              className="glass-button-primary px-7 py-3.5 font-semibold w-full disabled:opacity-70"
            >
              {loggingIn ? (
                <span className="inline-flex items-center justify-center gap-2">
                  <Spinner /> One moment…
                </span>
              ) : (
                "Continue with email"
              )}
            </button>
            <Link
              href="/"
              className="block mt-5 text-xs uppercase tracking-[0.18em] font-mono text-subtle hover:text-foreground transition"
            >
              ← Back
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const today = new Date().toISOString().slice(0, 10);
  const tappedToday = dbUser?.last_tap_date === today;
  const email = user?.email?.address ?? dbUser?.email ?? "—";
  const handle = email.split("@")[0];
  const streak = dbUser?.streak_count ?? 0;
  const hour = new Date().getHours();
  const greeting = hour < 5 ? "Late night" : hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const parable = getTodaysParable(Math.max(streak, 1));
  const progress = Math.min(streak / MILESTONE_DAYS, 1);

  return (
    <main className="flex-1 px-4 sm:px-6 max-w-3xl w-full mx-auto pt-6 pb-20">
      <nav className="glass-pill px-4 py-2 flex items-center justify-between mb-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#ff8a6b] to-[#f5b94a]" />
          <span className="font-semibold tracking-tight">Mickle</span>
        </Link>
        <button onClick={logout} className="text-sm text-muted hover:text-foreground px-3 py-1.5">
          Sign out
        </button>
      </nav>

      {/* Greeting + streak inline — wallet is no longer the first thing on screen */}
      <header className="flex items-end justify-between mb-7 gap-4">
        <div>
          <span className="text-[11px] uppercase tracking-[0.22em] font-mono text-foreground/55">
            {greeting}
          </span>
          <h1 className="text-display text-4xl sm:text-5xl font-bold mt-1 tracking-tight leading-none">
            {handle}.
          </h1>
        </div>
        <div className="text-right">
          <span className="text-[11px] uppercase tracking-[0.22em] font-mono text-foreground/55">
            Streak
          </span>
          <div className="font-mono font-bold text-3xl sm:text-4xl text-accent leading-none mt-1 tabular-nums">
            {streak}
            <span className="ml-1 text-2xl" aria-hidden>
              {streak > 0 ? "🔥" : "·"}
            </span>
          </div>
        </div>
      </header>

      {/* Ritual — the hero, with ceremony */}
      <section
        className="relative rounded-[28px] p-7 sm:p-9 mb-6 text-center overflow-hidden border-2"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,122,89,0.16), rgba(245,185,74,0.14) 50%, rgba(109,94,245,0.10))",
          borderColor: "rgba(255,122,89,0.32)",
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.7), 0 24px 60px -16px rgba(255,122,89,0.35)",
        }}
      >
        <span className="text-[11px] uppercase tracking-[0.22em] font-mono text-accent font-bold">
          Today&apos;s ritual
        </span>
        <h2 className="text-display text-3xl sm:text-4xl font-bold mt-2 mb-6 tracking-tight">
          {tappedToday ? "Done for today." : "Tap once for $1."}
        </h2>
        <button
          disabled={tappedToday}
          aria-label={tappedToday ? "Already tapped today" : "Tap $1 into your S&P 500 position"}
          className="glass-button-primary px-10 py-5 font-bold text-xl w-full max-w-xs mx-auto block disabled:opacity-50 disabled:cursor-not-allowed transition active:scale-[0.98]"
          style={{
            boxShadow: tappedToday
              ? undefined
              : "0 12px 32px -8px rgba(255,122,89,0.55), 0 4px 12px rgba(255,122,89,0.3), inset 0 1px 0 rgba(255,255,255,0.4)",
          }}
        >
          {tappedToday ? "✓ Tapped" : "$1 · Tap"}
        </button>
        <p className="text-[13px] text-foreground/55 mt-5 italic max-w-xs mx-auto leading-relaxed">
          {parable.text}
        </p>
      </section>

      {/* Stats — no pending badges, real empty-state copy */}
      <div className="grid sm:grid-cols-2 gap-3 mb-6">
        <Stat label="Position" empty="Live once your first tap settles" />
        <Stat label="Contributed" empty="Total deposited to date" />
      </div>

      {/* Milestone tracker — Day 30 → NFT */}
      <section className="glass-strong rounded-[24px] p-5 sm:p-6 mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] uppercase tracking-[0.22em] font-mono text-foreground/55">
            Next milestone
          </span>
          <span className="text-[12px] font-semibold text-accent">
            Day {MILESTONE_DAYS} → soulbound NFT
          </span>
        </div>
        <div className="h-2 rounded-full bg-foreground/10 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${Math.max(progress * 100, 2)}%`,
              background: "linear-gradient(90deg, var(--accent), var(--accent-2))",
            }}
          />
        </div>
        <div className="text-[12px] text-foreground/55 mt-2 font-mono">
          {streak} of {MILESTONE_DAYS} days
        </div>
      </section>

      {/* Time Machine — fed by user's projection */}
      <section className="glass rounded-[24px] p-5 sm:p-7 mb-6">
        <div className="text-center mb-4">
          <span className="text-[11px] uppercase tracking-[0.22em] font-mono text-foreground/55">
            Your projection · $1 / day
          </span>
        </div>
        <MiniTimeMachine />
      </section>

      {/* Wallet — demoted to expandable footer (it's not what users come here for) */}
      <details
        className="glass rounded-[20px] px-4 py-3 mt-2 group"
        onToggle={(e) => setWalletShown((e.target as HTMLDetailsElement).open)}
      >
        <summary className="flex items-center justify-between cursor-pointer list-none gap-3">
          <span className="text-[11px] uppercase tracking-[0.22em] font-mono text-foreground/55">
            Wallet
          </span>
          <span className="text-[13px] text-foreground/70 font-mono truncate">
            {wallet ? `${wallet.slice(0, 4)}…${wallet.slice(-4)}` : "Provisioning…"}
          </span>
          <span className="text-foreground/40 text-xs ml-auto">{walletShown ? "−" : "+"}</span>
        </summary>
        <code className="block font-mono text-[13px] text-foreground/85 break-all leading-relaxed mt-3 px-1">
          {wallet ?? "Provisioning wallet…"}
        </code>
      </details>
    </main>
  );
}

function Stat({ label, empty }: { label: string; empty: string }) {
  return (
    <div className="glass-strong rounded-3xl p-5">
      <div className="text-[11px] uppercase tracking-[0.22em] font-mono text-foreground/55 mb-3">
        {label}
      </div>
      <div className="text-3xl font-bold tracking-tight text-foreground/30 tabular-nums">—</div>
      <div className="text-[12px] text-foreground/50 mt-2 leading-relaxed">{empty}</div>
    </div>
  );
}

function Spinner() {
  return (
    <span
      className="inline-block w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"
      aria-hidden
    />
  );
}
