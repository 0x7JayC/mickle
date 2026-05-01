"use client";

import { useEffect, useState } from "react";
import { useIsSignedIn, useGetAccessToken } from "@coinbase/cdp-hooks";
import { useLang, t, type Dict, type Lang } from "@/lib/i18n";

const dict: Dict = {
  activity: { en: "Activity", zh: "动态" },
  events: { en: "events", zh: "条" },
  event: { en: "event", zh: "条" },
  justNow: { en: "just now", zh: "刚刚" },
  minAgo: { en: "{n}m ago", zh: "{n} 分钟前" },
  hrAgo: { en: "{n}h ago", zh: "{n} 小时前" },
  dayAgo: { en: "{n}d ago", zh: "{n} 天前" },
};

const fmtN = (s: string, n: number) => s.replace("{n}", String(n));

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

function timeAgo(iso: string, lang: Lang): string {
  const ms = Date.now() - new Date(iso).getTime();
  const min = Math.floor(ms / 60_000);
  if (min < 1) return t(dict, "justNow", lang);
  if (min < 60) return fmtN(t(dict, "minAgo", lang), min);
  const hr = Math.floor(min / 60);
  if (hr < 24) return fmtN(t(dict, "hrAgo", lang), hr);
  const d = Math.floor(hr / 24);
  if (d < 7) return fmtN(t(dict, "dayAgo", lang), d);
  return new Date(iso).toLocaleDateString(lang === "zh" ? "zh-CN" : "en-GB", { day: "numeric", month: "short" });
}

export default function ActivityFeed({ refreshKey }: { refreshKey: number }) {
  const lang = useLang();
  const { isSignedIn } = useIsSignedIn();
  const { getAccessToken } = useGetAccessToken();
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!isSignedIn) return;
    (async () => {
      const token = await getAccessToken();
      if (!token) return;
      const r = await fetch("/api/activity", {
        headers: { authorization: `Bearer ${token}` },
      });
      if (r.ok) setItems((await r.json()).activity ?? []);
    })();
  }, [isSignedIn, refreshKey, getAccessToken]);

  if (items.length === 0) return null;

  const visible = open ? items : items.slice(0, 5);

  return (
    <details
      className="glass rounded-[18px] px-4 py-3 mb-3 group"
      onToggle={(e) => setOpen((e.target as HTMLDetailsElement).open)}
    >
      <summary className="flex items-center justify-between cursor-pointer list-none gap-3">
        <span className="text-[11px] uppercase tracking-[0.22em] font-mono text-foreground/55">
          {t(dict, "activity", lang)}
        </span>
        <span className="text-[13px] text-foreground/70 truncate">
          {items.length} {items.length === 1 ? t(dict, "event", lang) : t(dict, "events", lang)}
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
              <div className="text-[11px] text-foreground/45 font-mono">{timeAgo(it.at, lang)}</div>
            </div>
          </div>
        ))}
      </div>
    </details>
  );
}
