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
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="glass-strong p-10 max-w-md w-full text-center">
          <h1 className="text-display text-3xl font-bold mb-3">Begin your streak</h1>
          <p className="text-muted mb-6">
            Sign in with email. A Solana wallet appears in 5 seconds. No seed phrase.
          </p>
          <button onClick={login} className="glass-button-primary px-7 py-3 font-semibold w-full">
            Sign in
          </button>
          <Link href="/" className="block mt-4 text-sm text-muted hover:text-foreground">
            ← Back
          </Link>
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

      <div className="mb-8">
        <span className="text-xs uppercase tracking-[0.2em] text-muted font-mono">Today</span>
        <h1 className="text-display text-4xl sm:text-5xl font-bold mt-2 tracking-tight">
          Hello, {email.split("@")[0]}.
        </h1>
        <p className="text-muted mt-1 font-mono text-xs break-all">
          {wallet ?? "Provisioning wallet…"}
        </p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <Stat label="Streak" value={`${dbUser?.streak_count ?? 0}`} suffix="days" />
        <Stat label="Position" value="—" suffix="SPYx" hint="Day 2" />
        <Stat label="Contributed" value="$0" hint="Day 3" />
      </div>

      <div className="glass-strong p-6 sm:p-8 mb-8">
        <div className="flex items-center justify-between mb-2">
          <div>
            <span className="text-xs uppercase tracking-[0.2em] text-muted font-mono">Today&apos;s ritual</span>
            <h2 className="text-2xl font-semibold mt-1 tracking-tight">
              {tappedToday ? "Done for today." : "Tap once for $1."}
            </h2>
          </div>
          <button
            disabled={tappedToday}
            className="glass-button-primary px-6 py-3 font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {tappedToday ? "✓" : "Tap"}
          </button>
        </div>
        <p className="text-sm text-muted">Tap action wires up on Day 3.</p>
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

function Stat({
  label,
  value,
  suffix,
  hint,
}: {
  label: string;
  value: string;
  suffix?: string;
  hint?: string;
}) {
  return (
    <div className="glass p-5">
      <div className="text-xs uppercase tracking-[0.18em] text-muted font-mono mb-2">{label}</div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-3xl font-bold tracking-tight">{value}</span>
        {suffix && <span className="text-sm text-muted">{suffix}</span>}
      </div>
      {hint && <div className="text-xs text-subtle mt-2">{hint}</div>}
    </div>
  );
}
