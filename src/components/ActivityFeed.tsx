"use client";

import { useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";

type ActivityItem = {
  type: "tap" | "deposit" | "milestone" | "batch";
  at: string;
  label: string;
  detail?: string;
  amount?: string;
};

const ICON: Record<ActivityItem["type"], string> = {
  tap: "·",
  deposit: "+",
  milestone: "★",
  batch: "↻",
};

const COLOR: Record<ActivityItem["type"], string> = {
  tap: "var(--accent)",
  deposit: "#10b981",
  milestone: "#6d5ef5",
  batch: "#0c0a14",
};

function timeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const min = Math.floor(ms / 60_000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const d = Math.floor(hr / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export default function ActivityFeed({ refreshKey }: { refreshKey: number }) {
  const { authenticated, getAccessToken } = usePrivy();
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!authenticated) return;
    (async () => {
      const token = await getAccessToken();
      if (!token) return;
      const r = await fetch("/api/activity", {
        headers: { authorization: `Bearer ${token}` },
      });
      if (r.ok) setItems((await r.json()).activity ?? []);
    })();
  }, [authenticated, refreshKey, getAccessToken]);

  if (items.length === 0) return null;

  const visible = open ? items : items.slice(0, 5);

  return (
    <details
      className="glass rounded-[18px] px-4 py-3 mb-3 group"
      onToggle={(e) => setOpen((e.target as HTMLDetailsElement).open)}
    >
      <summary className="flex items-center justify-between cursor-pointer list-none gap-3">
        <span className="text-[11px] uppercase tracking-[0.22em] font-mono text-foreground/55">
          Activity
        </span>
        <span className="text-[13px] text-foreground/70 truncate">
          {items.length} event{items.length === 1 ? "" : "s"}
        </span>
        <span className="text-foreground/40 text-xs ml-auto">{open ? "−" : "+"}</span>
      </summary>
      <div className="mt-3">
        {visible.map((it, idx) => (
          <div
            key={`${it.type}-${it.at}-${idx}`}
            className="flex items-baseline gap-3 py-2 border-t border-foreground/[0.06] first:border-0"
          >
            <span
              className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[12px] font-bold text-white"
              style={{ background: COLOR[it.type] }}
              aria-hidden
            >
              {ICON[it.type]}
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-[14px] font-medium text-foreground truncate">{it.label}</div>
              {it.detail && (
                <div className="text-[12px] text-foreground/55 truncate">{it.detail}</div>
              )}
            </div>
            <div className="text-right shrink-0">
              {it.amount && (
                <div className="text-[13px] font-mono font-semibold tabular-nums">
                  {it.amount}
                </div>
              )}
              <div className="text-[11px] text-foreground/45 font-mono">{timeAgo(it.at)}</div>
            </div>
          </div>
        ))}
      </div>
    </details>
  );
}
