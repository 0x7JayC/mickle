"use client";

import { useEffect, useState } from "react";

const KEY = "mickle:onboarded";

export default function OnboardingBanner({
  streak,
  contributed,
  onTopUp,
}: {
  streak: number;
  contributed: number;
  onTopUp: () => void;
}) {
  const [dismissed, setDismissed] = useState(true); // hidden until hydrated

  useEffect(() => {
    setDismissed(localStorage.getItem(KEY) === "1");
  }, []);

  // Auto-dismiss once user has tapped or topped up
  if (streak > 0 || contributed > 0 || dismissed) return null;

  const close = () => {
    localStorage.setItem(KEY, "1");
    setDismissed(true);
  };

  return (
    <div
      className="rounded-[18px] p-5 mb-6 border relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, rgba(255,122,89,0.10), rgba(245,185,74,0.06))",
        borderColor: "rgba(255,122,89,0.28)",
      }}
    >
      <button
        onClick={close}
        aria-label="Dismiss"
        className="absolute top-2 right-3 text-foreground/40 hover:text-foreground text-xl leading-none"
      >
        ×
      </button>
      <div className="flex items-start gap-4">
        <div
          className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-xl"
          style={{
            background: "var(--accent)",
            boxShadow: "0 6px 18px -4px rgba(255,122,89,0.4)",
          }}
          aria-hidden
        >
          👋
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[11px] uppercase tracking-[0.22em] font-mono text-accent font-bold">
            Welcome to Mickle
          </div>
          <h3 className="text-lg sm:text-xl font-bold tracking-tight mt-0.5">
            Your wallet is ready. Two steps to your first streak.
          </h3>
          <ol className="mt-3 space-y-1.5 text-[14px] text-foreground/75">
            <li className="flex items-start gap-2">
              <span className="text-foreground/40 font-mono text-[12px] mt-0.5">1.</span>
              <span>Top up £10 / £30 / £90 — pre-funds your daily ritual.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-foreground/40 font-mono text-[12px] mt-0.5">2.</span>
              <span>Tap once a day. £1 routes into the S&amp;P 500. Watch your streak compound.</span>
            </li>
          </ol>
          <div className="mt-4 flex items-center gap-2">
            <button
              onClick={() => {
                close();
                onTopUp();
              }}
              className="glass-button-primary px-5 py-2 text-sm font-semibold"
            >
              Top up to start →
            </button>
            <button
              onClick={close}
              className="text-[13px] text-foreground/55 hover:text-foreground px-3 py-2"
            >
              Maybe later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
