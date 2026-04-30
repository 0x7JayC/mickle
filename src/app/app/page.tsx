"use client";

import { useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useWallets as useSolanaWallets } from "@privy-io/react-auth/solana";
import Link from "next/link";
import { useRouter } from "next/navigation";
import MiniTimeMachine from "@/components/MiniTimeMachine";
import { getTodaysParable } from "@/lib/parables";
import DepositModal from "@/components/DepositModal";
import ActivityFeed from "@/components/ActivityFeed";
import OnboardingBanner from "@/components/OnboardingBanner";
import SettingsDrawer from "@/components/SettingsDrawer";
import QuoteOfDay from "@/components/QuoteOfDay";

type DbUser = {
  id: string;
  wallet: string | null;
  email: string | null;
  streak_count: number;
  last_tap_date: string | null;
  total_contributed_gbp: number | string;
};

type Position = {
  balance: number;
  usdPrice: number | null;
  usdValue: number;
  configured: boolean;
};


export default function App() {
  const router = useRouter();
  const { ready, authenticated, user, logout, linkWallet, getAccessToken } = usePrivy();
  // Sign out → land on the marketing site, not the unauthenticated /app
  // welcome modal. Wraps logout so settings drawer + nav share the same
  // post-logout destination.
  const signOut = async () => {
    await logout();
    router.push("/");
  };
  const { wallets: solanaWallets } = useSolanaWallets();
  const allWallets = solanaWallets.map((w) => ({
    address: w.address,
    embedded:
      "walletClientType" in w &&
      (w as { walletClientType?: string }).walletClientType === "privy",
    label:
      "walletClientType" in w &&
      (w as { walletClientType?: string }).walletClientType === "privy"
        ? "Mickle"
        : "Solana",
  }));
  const [dbUser, setDbUser] = useState<DbUser | null>(null);
  const [position, setPosition] = useState<Position | null>(null);
  const [walletShown, setWalletShown] = useState(false);
  const [depositOpen, setDepositOpen] = useState(false);
  const [horizon, setHorizon] = useState<number>(10);
  const [tapping, setTapping] = useState(false);
  const [tapToast, setTapToast] = useState<string | null>(null);
  const [lastBatch, setLastBatch] = useState<{
    executed_at: string;
    total_usdc: number;
    spyx_received: number | null;
    tx_sig: string | null;
  } | null>(null);
  const [milestones, setMilestones] = useState<
    { kind: string; asset_address: string | null; minted_at: string }[]
  >([]);
  const [demoEnabled, setDemoEnabled] = useState(false);
  const [celebration, setCelebration] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  // Bumped after any state change that should refresh the activity feed
  const [activityKey, setActivityKey] = useState(0);

  const wallet = solanaWallets[0]?.address ?? null;

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

  // Last treasury batch — load once for the activity strip
  useEffect(() => {
    if (!authenticated) return;
    fetch("/api/last-batch")
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => j && setLastBatch(j.batch));
    fetch("/api/dev/status")
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => j && setDemoEnabled(j.demo_cheat));
  }, [authenticated]);

  // Milestones — refetch after every tap (a tap can mint a day_7/30/100)
  const refreshMilestones = async () => {
    const token = await getAccessToken();
    if (!token) return;
    const r = await fetch("/api/milestones", {
      headers: { authorization: `Bearer ${token}` },
    });
    if (r.ok) {
      const { milestones } = await r.json();
      setMilestones(milestones);
    }
  };
  useEffect(() => {
    if (!authenticated) return;
    refreshMilestones();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authenticated, dbUser?.streak_count]);

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

  // Single source of truth for auth UI is the landing page. If someone
  // hits /app while signed out, bounce them to / so they see the same
  // CTAs (Start your streak · Connect Solana wallet) as everyone else.
  if (ready && !authenticated) {
    if (typeof window !== "undefined") router.replace("/");
    return (
      <main className="flex-1 flex items-center justify-center">
        <div className="text-muted">Redirecting…</div>
      </main>
    );
  }

  if (!ready) {
    return (
      <main className="flex-1 flex items-center justify-center">
        <div className="text-muted">Loading…</div>
      </main>
    );
  }

  const today = new Date().toISOString().slice(0, 10);
  const tappedToday = dbUser?.last_tap_date === today;
  const email = user?.email?.address ?? dbUser?.email ?? "—";
  const handle = email.split("@")[0];
  const streak = dbUser?.streak_count ?? 0;
  const contributed = Number(dbUser?.total_contributed_gbp ?? 0);
  const hour = new Date().getHours();
  const greeting = hour < 5 ? "Late night" : hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const parable = getTodaysParable(Math.max(streak, 1));

  const onTap = async () => {
    if (tapping || tappedToday) return;
    setTapping(true);
    try {
      const token = await getAccessToken();
      if (!token) return;
      const r = await fetch("/api/tap", {
        method: "POST",
        headers: { authorization: `Bearer ${token}` },
      });
      if (!r.ok) {
        setTapToast("Couldn't record your tap. Try again.");
        return;
      }
      const { user: u } = await r.json();
      const prevStreak = dbUser?.streak_count ?? 0;
      setDbUser(u);
      setActivityKey((k) => k + 1);
      const newStreak = u.streak_count;
      // Celebration when crossing a milestone threshold
      const crossed = [7, 30, 100].find((t) => prevStreak < t && newStreak >= t);
      if (crossed) {
        setCelebration(
          crossed === 7
            ? "Week one · 🌱"
            : crossed === 30
              ? "The mickle · 🔥"
              : "The muckle · 💎",
        );
        setTimeout(() => setCelebration(null), 4500);
      }
      setTapToast(
        newStreak === 1
          ? "Day 1. The hardest one is now behind you."
          : newStreak % 7 === 0
          ? `${newStreak} days. Quietly compounding.`
          : `Day ${newStreak} · keep showing up.`,
      );
    } finally {
      setTapping(false);
      setTimeout(() => setTapToast(null), 4000);
    }
  };

  const onDemoSimulate = async (target: number) => {
    const token = await getAccessToken();
    if (!token) return;
    const prevStreak = dbUser?.streak_count ?? 0;
    const r = await fetch("/api/dev/simulate-streak", {
      method: "POST",
      headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
      body: JSON.stringify({ target }),
    });
    if (!r.ok) return;
    const { user: u } = await r.json();
    setDbUser(u);
    setActivityKey((k) => k + 1);
    const crossed = [7, 30, 100].find((t) => prevStreak < t && target >= t);
    if (crossed) {
      setCelebration(
        crossed === 7
          ? "Week one · 🌱"
          : crossed === 30
            ? "The mickle · 🔥"
            : "The muckle · 💎",
      );
      setTimeout(() => setCelebration(null), 4500);
    }
  };

  const onConfirmDemoDeposit = async (gbp: number) => {
    const token = await getAccessToken();
    if (!token) return;
    const r = await fetch("/api/deposits", {
      method: "POST",
      headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
      body: JSON.stringify({ amount_gbp: gbp }),
    });
    if (r.ok) {
      const { user: u } = await r.json();
      setDbUser(u);
      setActivityKey((k) => k + 1);
      setTapToast(`+£${gbp} top-up recorded (demo).`);
      setTimeout(() => setTapToast(null), 4000);
    }
  };

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
            onClick={() => setSettingsOpen(true)}
            aria-label="Account settings"
            className="text-foreground/55 hover:text-foreground px-2 sm:px-3 py-1.5"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
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

      {/* Daily quote — sits at the top of the day */}
      <QuoteOfDay />

      {/* First-run welcome — disappears after first tap or top-up */}
      <OnboardingBanner
        streak={streak}
        contributed={contributed}
        onTopUp={() => setDepositOpen(true)}
      />

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
          {tappedToday ? "Done for today." : "Tap once for £1."}
        </h2>
        <button
          onClick={onTap}
          disabled={tappedToday || tapping}
          aria-label={tappedToday ? "Already tapped today" : "Tap £1 into your S&P 500 position"}
          className="glass-button-primary px-10 py-5 font-bold text-xl w-full max-w-xs mx-auto block disabled:opacity-50 disabled:cursor-not-allowed transition active:scale-[0.98]"
        >
          {tapping ? "Recording…" : tappedToday ? "✓ Tapped" : "£1 · Tap"}
        </button>
        <p className="text-[13px] text-foreground/55 mt-5 italic max-w-xs mx-auto leading-relaxed">
          {parable.text}
        </p>
      </section>

      {/* Stats — Position is live, Contributed reads ledger */}
      <div className="grid sm:grid-cols-2 gap-3 mb-6">
        <PositionStat position={position} />
        <ContributedStat gbp={contributed} />
      </div>

      {/* Treasury activity — visible only when a batch has actually run */}
      {lastBatch && (
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-full bg-foreground/[0.04] border border-foreground/10 mb-6 text-[12px]">
          <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-emerald-500" aria-hidden />
          <span className="font-mono uppercase tracking-[0.16em] text-foreground/55 shrink-0">
            Treasury
          </span>
          <span className="text-foreground/75 truncate">
            {new Date(lastBatch.executed_at).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
            })}{" "}
            · ${Number(lastBatch.total_usdc).toFixed(2)} swapped
            {lastBatch.spyx_received
              ? ` · ${Number(lastBatch.spyx_received).toFixed(4)} SPYx`
              : ""}
          </span>
          {lastBatch.tx_sig && (
            <a
              href={`https://solscan.io/tx/${lastBatch.tx_sig}`}
              target="_blank"
              rel="noreferrer"
              className="ml-auto shrink-0 text-accent font-semibold hover:underline"
            >
              View ↗
            </a>
          )}
        </div>
      )}

      {/* Milestones — earned card if Day 30 reached, else progress bar */}
      <MilestoneCard streak={streak} milestones={milestones} />

      {/* Time Machine — projection with year selector */}
      <section className="glass rounded-[18px] p-5 sm:p-7 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <span className="text-[11px] uppercase tracking-[0.22em] font-mono text-foreground/55">
            Your projection · £1 / day
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
          onConfirmDemo={onConfirmDemoDeposit}
        />
      )}

      <SettingsDrawer
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        email={email}
        contributed={contributed}
        streak={streak}
        walletCount={allWallets.length}
        onSignOut={() => {
          setSettingsOpen(false);
          signOut();
        }}
      />

      {tapToast && (
        <div
          role="status"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[70] bg-foreground text-white px-5 py-3 rounded-full text-[14px] font-medium shadow-[0_12px_32px_-8px_rgba(12,10,20,0.5)] fade-up"
          style={{ animationDuration: "0.3s" }}
        >
          {tapToast}
        </div>
      )}

      {celebration && (
        <div
          role="status"
          aria-label="Milestone earned"
          className="fixed inset-0 z-[75] flex items-center justify-center pointer-events-none"
        >
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at center, rgba(255,122,89,0.35), transparent 60%)",
              animation: "fade-up 0.5s ease both",
            }}
          />
          <div
            className="relative bg-foreground text-white px-7 py-5 rounded-[18px] text-center shadow-[0_24px_60px_-12px_rgba(12,10,20,0.5)]"
            style={{ animation: "fade-up 0.6s cubic-bezier(0.2,0.7,0.2,1) both" }}
          >
            <div className="text-[10px] uppercase tracking-[0.22em] font-mono text-white/60 mb-1">
              Milestone earned
            </div>
            <div className="text-2xl font-bold tracking-tight">{celebration}</div>
            <div className="text-[12px] text-white/60 mt-1">Soulbound NFT minted</div>
          </div>
        </div>
      )}

      {demoEnabled && (
        <div className="fixed bottom-20 right-4 z-[65] glass-strong rounded-[18px] p-3 shadow-[0_12px_32px_-8px_rgba(12,10,20,0.25)]">
          <div className="text-[10px] uppercase tracking-[0.22em] font-mono text-foreground/55 mb-2">
            Demo · jump to
          </div>
          <div className="flex gap-2">
            {[0, 7, 30, 100].map((d) => (
              <button
                key={d}
                onClick={() => onDemoSimulate(d)}
                className="px-3 py-1.5 rounded-full text-[12px] font-mono font-semibold border border-foreground/15 hover:border-accent/40 hover:bg-accent/5 transition tabular-nums"
              >
                Day {d}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Recent activity — taps, deposits, milestones, batches */}
      <ActivityFeed refreshKey={activityKey} />

      {/* Wallets — Solana embedded by default, plus any linked Solana or Base wallet */}
      <details
        className="glass rounded-[18px] px-4 py-3 group"
        onToggle={(e) => setWalletShown((e.target as HTMLDetailsElement).open)}
      >
        <summary className="flex items-center justify-between cursor-pointer list-none gap-3">
          <span className="text-[11px] uppercase tracking-[0.22em] font-mono text-foreground/55">
            Wallets
          </span>
          <span className="text-[13px] text-foreground/70 font-mono truncate">
            {allWallets.length > 0 ? `${allWallets.length} connected` : "Provisioning…"}
          </span>
          <span className="text-foreground/40 text-xs ml-auto">{walletShown ? "−" : "+"}</span>
        </summary>
        <div className="mt-3 space-y-2">
          {allWallets.map((w) => (
            <div
              key={w.address}
              className="flex items-center gap-3 px-1 py-2 border-t border-foreground/[0.06] first:border-0"
            >
              <span
                className="shrink-0 w-2 h-2 rounded-full"
                style={{ background: w.embedded ? "var(--accent)" : "#10b981" }}
                aria-hidden
              />
              <div className="min-w-0 flex-1">
                <div className="text-[11px] uppercase tracking-[0.18em] font-mono text-foreground/55">
                  {w.embedded ? `Embedded · ${w.label}` : w.label}
                </div>
                <code className="block font-mono text-[13px] text-foreground/85 break-all leading-tight mt-1">
                  {w.address}
                </code>
              </div>
            </div>
          ))}
          <button
            onClick={() => linkWallet()}
            className="w-full mt-1 text-[13px] font-semibold text-accent border border-accent/30 hover:bg-accent/5 rounded-full px-4 py-2 transition"
          >
            + Connect Solana wallet (Phantom · Backpack · Solflare)
          </button>
        </div>
      </details>
    </main>
  );
}

const MILESTONE_KINDS: { kind: string; days: number; label: string; emoji: string }[] = [
  { kind: "day_7", days: 7, label: "Week one", emoji: "🌱" },
  { kind: "day_30", days: 30, label: "The mickle", emoji: "🔥" },
  { kind: "day_100", days: 100, label: "The muckle", emoji: "💎" },
];

function MilestoneCard({
  streak,
  milestones,
}: {
  streak: number;
  milestones: { kind: string; asset_address: string | null; minted_at: string }[];
}) {
  // Next un-earned milestone
  const earned = new Set(milestones.map((m) => m.kind));
  const next = MILESTONE_KINDS.find((m) => !earned.has(m.kind));
  const latest = MILESTONE_KINDS.findLast?.((m) => earned.has(m.kind))
    ?? [...MILESTONE_KINDS].reverse().find((m) => earned.has(m.kind));

  if (!next) {
    // All earned — show the highest one in a celebratory state
    return latest ? (
      <div className="mb-6">
        <EarnedCard kind={latest} milestoneCount={milestones.length} all />
      </div>
    ) : null;
  }

  if (latest) {
    // At least one earned — show celebrate + progress to next stacked
    return (
      <div className="space-y-3 mb-6">
        <EarnedCard kind={latest} milestoneCount={milestones.length} />
        <ProgressCard streak={streak} target={next} />
      </div>
    );
  }

  return (
    <div className="mb-6">
      <ProgressCard streak={streak} target={next} />
    </div>
  );
}

function EarnedCard({
  kind,
  milestoneCount,
  all = false,
}: {
  kind: { kind: string; days: number; label: string; emoji: string };
  milestoneCount: number;
  all?: boolean;
}) {
  return (
    <section
      className="rounded-[18px] p-5 sm:p-6 border"
      style={{
        background: "rgba(255,122,89,0.08)",
        borderColor: "rgba(255,122,89,0.28)",
      }}
    >
      <div className="flex items-center gap-4">
        <div
          className="shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-2xl"
          style={{ background: "var(--accent)" }}
          aria-hidden
        >
          {kind.emoji}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[11px] uppercase tracking-[0.22em] font-mono text-accent font-bold">
            Milestone earned
          </div>
          <div className="text-lg sm:text-xl font-bold tracking-tight mt-0.5">
            Day {kind.days} · {kind.label}
          </div>
          <div className="text-[12px] text-foreground/60 mt-1">
            Soulbound NFT minted to your wallet
            {milestoneCount > 1 ? ` · ${milestoneCount} earned total` : ""}
            {all ? " · every milestone in the bag" : ""}
          </div>
        </div>
      </div>
    </section>
  );
}

function ProgressCard({
  streak,
  target,
}: {
  streak: number;
  target: { kind: string; days: number; label: string; emoji: string };
}) {
  const progress = Math.min(streak / target.days, 1);
  return (
    <section className="glass-strong rounded-[18px] p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3 mb-3">
        <span className="text-[11px] uppercase tracking-[0.22em] font-mono text-foreground/55">
          Next milestone
        </span>
        <span className="text-[12px] font-semibold text-accent whitespace-nowrap">
          Day {target.days} · {target.label}
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
        {streak} of {target.days} days
      </div>
    </section>
  );
}

function ContributedStat({ gbp }: { gbp: number }) {
  const fmt = (v: number) =>
    v.toLocaleString("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 2 });
  const empty = gbp <= 0;
  return (
    <div className="glass-strong rounded-[18px] p-5">
      <div className="text-[11px] uppercase tracking-[0.22em] font-mono text-foreground/55 mb-3">
        Contributed
      </div>
      {empty ? (
        <>
          <div className="text-3xl font-bold tracking-tight text-foreground/30 tabular-nums">£0</div>
          <div className="text-[12px] text-foreground/50 mt-2 leading-relaxed">
            Top up to start your streak
          </div>
        </>
      ) : (
        <>
          <div className="text-3xl font-bold tracking-tight text-foreground tabular-nums">
            {fmt(gbp)}
          </div>
          <div className="text-[12px] text-foreground/55 mt-2 leading-relaxed">
            Total deposited to date
          </div>
        </>
      )}
    </div>
  );
}

function PositionStat({ position }: { position: Position | null }) {
  // Display in GBP since users think in £. Quote stays in USD because the
  // S&P 500 is USD-priced; that's a per-share fact, not a UI choice.
  const USD_TO_GBP = 0.79;
  const usd = position?.usdValue ?? 0;
  const gbp = usd * USD_TO_GBP;
  const balance = position?.balance ?? 0;
  const live = !!position && position.configured && usd > 0;
  const fmtGbp = (v: number) =>
    v.toLocaleString("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 2 });
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
            {fmtGbp(gbp)}
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

