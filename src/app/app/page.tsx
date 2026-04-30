"use client";

import { useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useWallets as useSolanaWallets } from "@privy-io/react-auth/solana";
import Link from "next/link";
import MiniTimeMachine from "@/components/MiniTimeMachine";
import { getTodaysParable } from "@/lib/parables";
import DepositModal from "@/components/DepositModal";

type DbUser = {
  id: string;
  wallet: string | null;
  email: string | null;
  streak_count: number;
  last_tap_date: string | null;
};

type Position = {
  balance: number;
  usdPrice: number | null;
  usdValue: number;
  configured: boolean;
};

const MILESTONE_DAYS = 30;

export default function App() {
  const { ready, authenticated, user, login, logout, getAccessToken } = usePrivy();
  const { wallets } = useSolanaWallets();
  const [dbUser, setDbUser] = useState<DbUser | null>(null);
  const [position, setPosition] = useState<Position | null>(null);
  const [walletShown, setWalletShown] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);
  const [depositOpen, setDepositOpen] = useState(false);
  const [horizon, setHorizon] = useState<number>(10);

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

  // Live SPYx position — refresh every 30s while the dashboard is open
  useEffect(() => {
    if (!authenticated || !dbUser?.wallet) return;
    let cancelled = false;
    const load = async () => {
      const token = await getAccessToken();
      if (!token) return;
      const r = await fetch("/api/position", {
        headers: { authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      if (!r.ok || cancelled) return;
      setPosition(await r.json());
    };
    load();
    const t = setInterval(load, 30_000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, [authenticated, dbUser?.wallet, getAccessToken]);

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
      <nav className="glass-pill px-3 sm:px-4 py-2 flex items-center justify-between gap-2 mb-8">
        <Link href="/" className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 shrink-0 rounded-full bg-gradient-to-br from-[#ff8a6b] to-[#f5b94a]" />
          <span className="font-semibold tracking-tight truncate">Mickle</span>
        </Link>
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <button
            onClick={() => setDepositOpen(true)}
            className="glass-button-primary px-3 sm:px-4 py-1.5 text-sm font-semibold"
          >
            Top up
          </button>
          <button
            onClick={logout}
            className="text-sm text-muted hover:text-foreground px-2 sm:px-3 py-1.5"
          >
            Sign out
          </button>
        </div>
      </nav>

      {/* Greeting + streak inline — wallet is no longer the first thing on screen */}
      <header className="flex items-end justify-between mb-7 gap-3">
        <div className="min-w-0 flex-1">
          <span className="text-[11px] uppercase tracking-[0.22em] font-mono text-foreground/55">
            {greeting}
          </span>
          <h1 className="text-display text-3xl sm:text-5xl font-bold mt-1 tracking-tight leading-none truncate">
            {handle}.
          </h1>
        </div>
        <div className="text-right shrink-0">
          <span className="text-[11px] uppercase tracking-[0.22em] font-mono text-foreground/55">
            Streak
          </span>
          <div className="font-mono font-bold text-2xl sm:text-4xl text-accent leading-none mt-1 tabular-nums">
            {streak}
            <span className="ml-1 text-xl sm:text-2xl" aria-hidden>
              {streak > 0 ? "🔥" : "·"}
            </span>
          </div>
        </div>
      </header>

      {/* Ritual — the hero. Single accent tint, hairline border, no shadow. */}
      <section
        className="relative rounded-[18px] p-7 sm:p-9 mb-6 text-center overflow-hidden border"
        style={{
          background: "rgba(255,122,89,0.08)",
          borderColor: "rgba(255,122,89,0.28)",
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

      {/* Stats — Position is live; Contributed wires up Day 3 */}
      <div className="grid sm:grid-cols-2 gap-3 mb-6">
        <PositionStat position={position} />
        <Stat label="Contributed" empty="Total deposited to date" />
      </div>

      {/* Milestone tracker — Day 30 → NFT */}
      <section className="glass-strong rounded-[18px] p-5 sm:p-6 mb-6">
        <div className="flex items-center justify-between gap-3 mb-3">
          <span className="text-[11px] uppercase tracking-[0.22em] font-mono text-foreground/55">
            Next milestone
          </span>
          <span className="text-[12px] font-semibold text-accent whitespace-nowrap">
            Day {MILESTONE_DAYS} · NFT
          </span>
        </div>
        <div className="h-2 rounded-full bg-foreground/10 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${Math.max(progress * 100, 2)}%`,
              background: "var(--accent)",
            }}
          />
        </div>
        <div className="text-[12px] text-foreground/55 mt-2 font-mono">
          {streak} of {MILESTONE_DAYS} days
        </div>
      </section>

      {/* Time Machine — projection with year selector */}
      <section className="glass rounded-[18px] p-5 sm:p-7 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <span className="text-[11px] uppercase tracking-[0.22em] font-mono text-foreground/55">
            Your projection · $1 / day
          </span>
          <div className="inline-flex items-center gap-1 rounded-full bg-foreground/[0.06] p-1 border border-foreground/10 self-start sm:self-auto">
            {[1, 2, 3, 5, 10].map((y) => {
              const active = horizon === y;
              return (
                <button
                  key={y}
                  onClick={() => setHorizon(y)}
                  className={`px-2.5 sm:px-3 py-1 rounded-full text-[12px] font-mono font-semibold transition tabular-nums ${
                    active
                      ? "bg-white text-foreground shadow-[0_2px_6px_rgba(12,10,20,0.08)]"
                      : "text-foreground/55 hover:text-foreground"
                  }`}
                  aria-pressed={active}
                >
                  {y}Y
                </button>
              );
            })}
          </div>
        </div>
        <MiniTimeMachine years={horizon} />
      </section>

      {depositOpen && (
        <DepositModal
          wallet={wallet}
          email={user?.email?.address ?? null}
          onClose={() => setDepositOpen(false)}
        />
      )}

      {/* Wallet — demoted to expandable footer (it's not what users come here for) */}
      <details
        className="glass rounded-[18px] px-4 py-3 mt-2 group"
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
    <div className="glass-strong rounded-[18px] p-5">
      <div className="text-[11px] uppercase tracking-[0.22em] font-mono text-foreground/55 mb-3">
        {label}
      </div>
      <div className="text-3xl font-bold tracking-tight text-foreground/30 tabular-nums">—</div>
      <div className="text-[12px] text-foreground/50 mt-2 leading-relaxed">{empty}</div>
    </div>
  );
}

function PositionStat({ position }: { position: Position | null }) {
  const usd = position?.usdValue ?? 0;
  const balance = position?.balance ?? 0;
  const live = !!position && position.configured && usd > 0;
  const fmtUsd = (v: number) =>
    v.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 });
  return (
    <div className="glass-strong rounded-[18px] p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] uppercase tracking-[0.22em] font-mono text-foreground/55">
          Position
        </span>
        {position && position.configured && (
          <span className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-[0.16em] text-emerald-700/80">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live
          </span>
        )}
      </div>
      {live ? (
        <>
          <div className="text-3xl font-bold tracking-tight text-foreground tabular-nums">
            {fmtUsd(usd)}
          </div>
          <div className="text-[12px] text-foreground/55 mt-2 font-mono tabular-nums">
            {balance.toLocaleString("en-US", { maximumFractionDigits: 4 })} SPYx
            {position?.usdPrice
              ? ` · ${fmtUsd(position.usdPrice)} / share`
              : ""}
          </div>
        </>
      ) : (
        <>
          <div className="text-3xl font-bold tracking-tight text-foreground/30 tabular-nums">—</div>
          <div className="text-[12px] text-foreground/50 mt-2 leading-relaxed">
            {position && !position.configured
              ? "SPYx mint not configured yet"
              : "Live once your first tap settles"}
          </div>
        </>
      )}
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
