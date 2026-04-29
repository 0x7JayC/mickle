"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getTodaysParable } from "@/lib/parables";
import TimeMachine from "@/components/TimeMachine";

const STORAGE_KEY = "mickle:state:v1";

type State = {
  streak: number;
  lastTapDate: string | null;
  totalContributed: number;
  startDate: string;
};

const initial: State = {
  streak: 0,
  lastTapDate: null,
  totalContributed: 0,
  startDate: new Date().toISOString().slice(0, 10),
};

const todayISO = () => new Date().toISOString().slice(0, 10);
const dayDiff = (a: string, b: string) =>
  Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86_400_000);

export default function AppPage() {
  const [state, setState] = useState<State>(initial);
  const [hydrated, setHydrated] = useState(false);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    const raw = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    if (raw) {
      try {
        setState(JSON.parse(raw));
      } catch {}
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, hydrated]);

  const today = todayISO();
  const tappedToday = state.lastTapDate === today;
  const parable = getTodaysParable(Math.max(1, state.streak || 1));

  const handleTap = () => {
    if (tappedToday) return;
    setState((s) => {
      let newStreak = 1;
      if (s.lastTapDate) {
        const diff = dayDiff(s.lastTapDate, today);
        newStreak = diff === 1 ? s.streak + 1 : 1;
      }
      return {
        ...s,
        streak: newStreak,
        lastTapDate: today,
        totalContributed: s.totalContributed + 1,
      };
    });
    setPulse(true);
    setTimeout(() => setPulse(false), 900);
  };

  const handleReset = () => {
    if (confirm("Reset your demo state? (Local only — this is the demo build.)")) {
      setState(initial);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  return (
    <main className="flex-1">
      <nav className="sticky top-4 z-50 px-4 sm:px-6 mt-4">
        <div className="max-w-5xl mx-auto glass-pill px-2 py-2 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 pl-3">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#ff8a6b] to-[#f5b94a] shadow-[0_4px_12px_rgba(255,122,89,0.4)]" />
            <span className="font-semibold text-base tracking-tight">Mickle</span>
          </Link>
          <button
            onClick={handleReset}
            className="px-4 py-2 text-xs text-muted hover:text-foreground font-mono rounded-full transition"
          >
            reset demo
          </button>
        </div>
      </nav>

      <div className="px-4 sm:px-6 py-12 max-w-3xl mx-auto w-full">
        {/* Demo banner */}
        <div className="glass-pill px-4 py-2 text-[11px] text-muted mb-10 font-mono inline-block">
          Demo build · local persistence · wallet not yet wired
        </div>

        {/* Streak hero */}
        <div className="glass-strong p-8 sm:p-12 mb-8 text-center fade-up">
          <div className="text-[10px] uppercase tracking-[0.22em] text-muted font-mono mb-4 font-semibold">
            Your streak
          </div>
          <div
            className={`font-mono text-8xl sm:text-[10rem] font-extrabold tracking-tighter leading-none transition-transform duration-500 ${
              pulse ? "scale-110" : ""
            }`}
            style={{
              background: "linear-gradient(140deg, #ff7a59 0%, #f5b94a 45%, #6d5ef5 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {state.streak}
          </div>
          <div className="mt-3 text-muted">
            {state.streak === 0
              ? "Tap below to begin."
              : `${state.streak === 1 ? "day" : "days"} of showing up`}
          </div>
          {state.totalContributed > 0 && (
            <div className="text-xs font-mono text-subtle mt-2 tabular-nums">
              ${state.totalContributed} contributed
            </div>
          )}
        </div>

        {/* Tap */}
        <div className="text-center mb-12 fade-up" style={{ animationDelay: "0.1s" }}>
          <button
            onClick={handleTap}
            disabled={tappedToday}
            className="glass-button-primary px-12 py-5 font-semibold text-lg disabled:hover:translate-y-0"
          >
            {tappedToday ? "✓ Today's $1 in" : "Add today's $1"}
          </button>
          {tappedToday && (
            <p className="text-sm text-muted mt-4">
              Come back tomorrow. The streak grows by showing up.
            </p>
          )}
        </div>

        {/* Parable */}
        <div className="glass p-8 sm:p-10 mb-12 fade-up" style={{ animationDelay: "0.18s" }}>
          <div className="text-[10px] uppercase tracking-[0.22em] text-muted font-mono mb-4 font-semibold">
            Today&apos;s parable
          </div>
          <p className="text-xl sm:text-2xl text-foreground leading-snug font-medium tracking-tight">
            &ldquo;{parable.text}&rdquo;
          </p>
          {parable.source && (
            <div className="mt-4 text-sm text-muted">— {parable.source}</div>
          )}
        </div>

        {/* Time machine */}
        <div className="fade-up" style={{ animationDelay: "0.26s" }}>
          <div className="text-center mb-5">
            <span className="text-[10px] uppercase tracking-[0.22em] text-muted font-mono font-semibold">
              Where you&apos;re headed
            </span>
          </div>
          <div className="glass-strong p-5 sm:p-8">
            <TimeMachine />
          </div>
        </div>
      </div>
    </main>
  );
}
