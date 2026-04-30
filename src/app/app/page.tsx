"use client";

import { useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useWallets as useSolanaWallets } from "@privy-io/react-auth/solana";
import Link from "next/link";
import MiniTimeMachine from "@/components/MiniTimeMachine";

type DbUser = {
  id: string;
  wallet: string | null;
  email: string | null;
  streak_count: number;
  last_tap_date: string | null;
};

export default function App() {
  const { ready, authenticated, user, login, logout, getAccessToken } = usePrivy();
  const { wallets } = useSolanaWallets();
  const [dbUser, setDbUser] = useState<DbUser | null>(null);

  const wallet = wallets[0]?.address ?? null;

  useEffect(() => {
    if (!authenticated) return;
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
              Begin your streak
            </h1>
            <p className="text-[15px] text-muted mb-7 leading-relaxed">
              Sign in with email. A Solana wallet appears in 5 seconds. No seed phrase.
            </p>
            <button
              onClick={login}
              className="glass-button-primary px-7 py-3.5 font-semibold w-full"
            >
              Continue with email
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

  return (
    <main className="flex-1 px-4 sm:px-6 max-w-5xl w-full mx-auto pt-6 pb-20">
      <nav className="glass-pill px-4 py-2 flex items-center justify-between mb-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#ff8a6b] to-[#f5b94a]" />
          <span className="font-semibold tracking-tight">Mickle</span>
        </Link>
        <button onClick={logout} className="text-sm text-muted hover:text-foreground px-3 py-1.5">
          Sign out
        </button>
      </nav>

      <header className="mb-8">
        <span className="text-[11px] uppercase tracking-[0.22em] font-mono text-foreground/55">
          Today
        </span>
        <h1 className="text-display text-4xl sm:text-5xl font-bold mt-1.5 tracking-tight">
          Hello, {email.split("@")[0]}.
        </h1>
      </header>

      <Field label="Wallet" className="mb-8">
        <code className="block font-mono text-[13px] sm:text-sm text-foreground/90 break-all leading-relaxed">
          {wallet ?? "Provisioning wallet…"}
        </code>
      </Field>

      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <Stat label="Streak" value={`${dbUser?.streak_count ?? 0}`} suffix="days" />
        <Stat label="Position" value="—" suffix="SPYx" pending="Day 2" />
        <Stat label="Contributed" value="$0" pending="Day 3" />
      </div>

      <div className="glass-strong p-6 sm:p-8 mb-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <span className="text-[11px] uppercase tracking-[0.22em] font-mono text-foreground/55">
              Today&apos;s ritual
            </span>
            <h2 className="text-2xl sm:text-3xl font-semibold mt-1.5 tracking-tight text-foreground">
              {tappedToday ? "Done for today." : "Tap once for $1."}
            </h2>
            <p className="text-sm text-foreground/65 mt-1.5">
              Tap action wires up on Day 3.
            </p>
          </div>
          <button
            disabled={tappedToday}
            className="glass-button-primary px-6 py-3 font-semibold disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          >
            {tappedToday ? "✓" : "Tap"}
          </button>
        </div>
      </div>

      <div className="glass p-6 sm:p-8">
        <div className="text-center mb-4">
          <span className="text-xs uppercase tracking-[0.2em] text-muted font-mono">Time Machine</span>
        </div>
        <MiniTimeMachine />
      </div>
    </main>
  );
}

function Field({
  label,
  className = "",
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <div className="text-[11px] uppercase tracking-[0.22em] font-mono text-foreground/55 mb-1.5 px-1">
        {label}
      </div>
      <div className="glass-strong px-4 py-3.5 rounded-2xl">{children}</div>
    </div>
  );
}

function Stat({
  label,
  value,
  suffix,
  pending,
}: {
  label: string;
  value: string;
  suffix?: string;
  pending?: string;
}) {
  return (
    <div className="glass-strong p-5 rounded-3xl">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] uppercase tracking-[0.22em] font-mono text-foreground/55">
          {label}
        </span>
        {pending && (
          <span className="text-[10px] uppercase tracking-[0.18em] font-mono text-foreground/60 bg-foreground/8 px-2 py-0.5 rounded-full border border-foreground/10">
            {pending}
          </span>
        )}
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-3xl font-bold tracking-tight text-foreground tabular-nums">
          {value}
        </span>
        {suffix && <span className="text-sm font-medium text-foreground/60">{suffix}</span>}
      </div>
    </div>
  );
}
