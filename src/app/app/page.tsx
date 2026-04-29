"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getTodaysParable } from "@/lib/parables";
import TimeMachine from "@/components/TimeMachine";

const STORAGE_KEY = "mickle:state:v1";

type State = {
  streak: number;
  lastTapDate: string | null; // YYYY-MM-DD
  totalContributed: number;
  startDate: string;
};

const initial: State = {
  streak: 0,
  lastTapDate: null,
  totalContributed: 0,
  startDate: new Date().toISOString().slice(0, 10),
};

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function dayDiff(a: string, b: string) {
  const ms = new Date(b).getTime() - new Date(a).getTime();
  return Math.round(ms / 86_400_000);
}

export default function AppPage() {
  const [state, setState] = useState<State>(initial);
  const [hydrated, setHydrated] = useState(false);
  const [justTapped, setJustTapped] = useState(false);

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
    setJustTapped(true);
    setTimeout(() => setJustTapped(false), 1200);
  };

  const handleReset = () => {
    if (confirm("Reset your demo state? (Local only — this is the demo build.)")) {
      setState(initial);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  return (
    <main className="flex-1 px-6 sm:px-10 max-w-5xl mx-auto w-full">
      <nav className="py-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-accent" />
          <span className="font-bold text-lg tracking-tight">Mickle</span>
        </Link>
        <button
          onClick={handleReset}
          className="text-xs text-muted hover:text-foreground font-mono"
        >
          reset demo
        </button>
      </nav>

      <div className="py-8 sm:py-12">
        {/* Banner */}
        <div className="rounded-lg border border-accent/30 bg-accent/5 px-4 py-2.5 text-xs text-muted mb-8 font-mono">
          Demo build · streak persists locally · wallet + on-chain deposit not wired yet
        </div>

        {/* Streak hero */}
        <div className="mb-12">
          <div className="text-xs uppercase tracking-[0.2em] text-muted font-mono mb-2">
            Your streak
          </div>
          <div className="flex items-end gap-4">
            <div
              className={`font-mono text-7xl sm:text-9xl font-extrabold tracking-tighter text-accent transition ${
                justTapped ? "scale-110" : ""
              }`}
            >
              {state.streak}
            </div>
            <div className="pb-3 text-muted">
              <div className="text-sm">
                {state.streak === 0
                  ? "Tap below to begin."
                  : state.streak === 1
                  ? "day"
                  : "days"}
              </div>
              {state.totalContributed > 0 && (
                <div className="text-xs font-mono mt-1">
                  ${state.totalContributed} contributed
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Parable */}
        <div className="mb-10 max-w-2xl">
          <div className="text-xs uppercase tracking-[0.2em] text-muted font-mono mb-3">
            Today&apos;s parable
          </div>
          <blockquote className="border-l-2 border-accent pl-5 py-1">
            <p className="text-xl sm:text-2xl text-foreground leading-snug font-medium">
              &ldquo;{parable.text}&rdquo;
            </p>
            {parable.source && (
              <cite className="block mt-3 text-sm text-muted not-italic">— {parable.source}</cite>
            )}
          </blockquote>
        </div>

        {/* Tap */}
        <div className="mb-16">
          <button
            onClick={handleTap}
            disabled={tappedToday}
            className={`w-full sm:w-auto px-12 py-5 rounded-xl font-semibold text-lg transition ${
              tappedToday
                ? "bg-surface text-muted cursor-not-allowed border border-border"
                : "bg-accent text-background hover:opacity-90 active:scale-[0.98]"
            }`}
          >
            {tappedToday ? "✓ Today's $1 in" : "Add today's $1"}
          </button>
          {tappedToday && (
            <p className="text-sm text-muted mt-3">
              Come back tomorrow. The streak grows by showing up.
            </p>
          )}
        </div>

        {/* Time machine */}
        <div className="border-t border-border pt-12">
          <div className="text-xs uppercase tracking-[0.2em] text-muted font-mono mb-3">
            Where you&apos;re headed
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6">
            The Time Machine
          </h2>
          <TimeMachine />
        </div>
      </div>
    </main>
  );
}
