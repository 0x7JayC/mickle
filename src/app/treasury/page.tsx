"use client";

// CDP hooks (used by OpenAppButton) need a client-side context that
// doesn't exist at prerender time, so opt the route out of SSG.
export const dynamic = "force-dynamic";

import Link from "next/link";
import { useEffect, useState } from "react";
import { OpenAppButton } from "@/components/LandingAuth";
import { SiteNav } from "@/components/SiteNav";
import { useLang, t, type Dict } from "@/lib/i18n";

type TreasuryData = {
  cohort: {
    users: number;
    active_streaks: number;
    longest_streak: number;
    total_taps: number;
    pending_taps: number;
    total_contributed_gbp: number;
  };
  treasury: {
    total_deposited_usdc: number;
    total_swapped_usdc: number;
    spyx_held: number;
    float_usdc: number;
    onchain: {
      address: string;
      sol: number;
      usdc: number;
      spyx: number;
    } | null;
  };
  recent_batches: {
    id: string;
    executed_at: string;
    total_usdc: number;
    spyx_received: number | null;
    tx_sig: string | null;
  }[];
};

const dict: Dict = {
  treasury: { en: "Treasury", zh: "金库" },
  hero: { en: "Proof, not pitches.", zh: "链上为证,无需推销。" },
  sub: {
    en: "Every tap, every deposit, every daily swap. Aggregated across the whole cohort. Open Mickle is a daily ritual; the treasury is the receipt.",
    zh: "每一次打卡、每一笔充值、每一次每日兑换。整个用户群体的汇总数据。Mickle 是每日仪式;金库是它的凭证。",
  },
  initialising: { en: "Treasury is initialising. Check back in a minute.", zh: "金库正在初始化,请稍后再来。" },
  cohort: { en: "Cohort", zh: "用户群体" },
  users: { en: "Users", zh: "用户数" },
  activeStreaks: { en: "Active streaks", zh: "活跃连胜" },
  longestStreak: { en: "Longest streak", zh: "最长连胜" },
  totalTaps: { en: "Total taps", zh: "总打卡数" },
  contributedLifetime: { en: "Contributed (lifetime)", zh: "累计投入" },
  pendingTaps: { en: "Pending taps · next batch", zh: "待结算打卡 · 下一批次" },
  taps: { en: "taps", zh: "次打卡" },
  daySuffix: { en: "d", zh: "天" },
  pooledHeader: { en: "Treasury (pooled, on Solana)", zh: "金库(在 Solana 上汇总)" },
  deposited: { en: "Deposited", zh: "已存入" },
  swappedSpyx: { en: "Swapped → pbUSDC", zh: "已兑换 → pbUSDC" },
  spyxHeld: { en: "pbUSDC held", zh: "pbUSDC 持仓" },
  floatIdle: { en: "Float idle", zh: "闲置浮动资金" },
  recentBatches: { en: "Recent batches", zh: "最近批次" },
  updatedJustNow: { en: "updated just now", zh: "刚刚更新" },
  updatedSecsAgo: { en: "updated {n}s ago", zh: "{n} 秒前更新" },
  updatedMinAgo: { en: "updated {n}m ago", zh: "{n} 分钟前更新" },
  staleHint: { en: "data may be stale — retrying", zh: "数据可能过时 — 正在重试" },
  thirtyDays: { en: "Last 30 days", zh: "最近 30 天" },
  subscribe: { en: "Subscribe to receipts (RSS) ↗", zh: "订阅 RSS 凭证 ↗" },
  noBatchesYet: { en: "No batches yet — first swap fires the day after the first user tap.", zh: "暂无批次 —— 首次用户打卡后一天会执行第一笔。" },
  noBatches: { en: "No batches yet. The first one runs the day after the first user tap.", zh: "还没有批次。首次用户打卡后的第二天会运行第一批。" },
  quoteOnly: { en: "quote only", zh: "仅报价" },
  onchain: { en: "On-chain ↗", zh: "链上查看 ↗" },
  demoQuoted: { en: "Demo · quoted", zh: "演示 · 报价" },
  footer: { en: "© Mickle · Proof, not pitches.", zh: "© Mickle · 链上为证,无需推销。" },
  back: { en: "← Back to landing", zh: "← 返回首页" },
  liveOnchain: { en: "Live on-chain", zh: "链上实时" },
  walletShort: { en: "Treasury wallet", zh: "金库钱包" },
  viewOnSolscan: { en: "View on Solscan ↗", zh: "在 Solscan 查看 ↗" },
};

const fmtGbp = (v: number) =>
  v.toLocaleString("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 2 });
const fmtUsd = (v: number) =>
  v.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 });
const fmtNum = (v: number, max = 4) =>
  v.toLocaleString("en-US", { maximumFractionDigits: max });

// P6: 30s polling cadence keeps the on-chain block credibly live.
// Anything older than this is shown as 'stale' (amber dot) so visitors
// can tell the difference between 'just confirmed' and 'we lost the
// connection 5 minutes ago'.
const POLL_INTERVAL_MS = 30_000;
const STALE_AFTER_MS = 90_000;

export default function TreasuryPage() {
  const lang = useLang();
  const [data, setData] = useState<TreasuryData | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const [now, setNow] = useState<number>(() => Date.now());

  // Poll the public treasury endpoint every 30s. The route already
  // caches for 30s server-side, so this is cheap on infra and the
  // user always sees a fresh-looking number.
  useEffect(() => {
    let cancelled = false;
    const tick = async () => {
      try {
        const r = await fetch("/api/treasury", { cache: "no-store" });
        if (!r.ok) return;
        const j = (await r.json()) as TreasuryData;
        if (cancelled) return;
        setData(j);
        setLastUpdated(Date.now());
      } finally {
        if (!cancelled) setLoaded(true);
      }
    };
    tick();
    const id = setInterval(tick, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  // Re-render every 5s so the 'updated Xs ago' label and stale-state
  // dot tick forward without waiting for the next poll.
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 5_000);
    return () => clearInterval(id);
  }, []);

  const ageMs = lastUpdated ? now - lastUpdated : null;
  const isStale = ageMs !== null && ageMs > STALE_AFTER_MS;
  const ageLabel = (() => {
    if (ageMs === null) return null;
    const sec = Math.floor(ageMs / 1000);
    if (sec < 5) return t(dict, "updatedJustNow", lang);
    if (sec < 60) return t(dict, "updatedSecsAgo", lang).replace("{n}", String(sec));
    const min = Math.floor(sec / 60);
    return t(dict, "updatedMinAgo", lang).replace("{n}", String(min));
  })();

  return (
    <main className="flex-1">
      <SiteNav>
        <OpenAppButton className="glass-button-primary px-5 py-2 text-sm font-semibold" />
      </SiteNav>

      <section className="px-4 sm:px-6 pt-10 sm:pt-14 pb-8 max-w-5xl mx-auto w-full">
        <span className="text-xs uppercase tracking-[0.2em] text-muted font-mono">
          {t(dict, "treasury", lang)}
        </span>
        <h1 className="text-display text-4xl sm:text-6xl font-extrabold leading-[0.95] mt-3 mb-4">
          {t(dict, "hero", lang)}
        </h1>
        <p className="text-base sm:text-lg text-foreground/70 leading-relaxed max-w-2xl">
          {t(dict, "sub", lang)}
        </p>
      </section>

      {loaded && !data ? (
        <section className="px-4 sm:px-6 pb-20 max-w-5xl mx-auto">
          <div className="rounded-[18px] border border-foreground/10 bg-white p-6 text-foreground/60">
            {t(dict, "initialising", lang)}
          </div>
        </section>
      ) : data ? (
        <>
          {/* P3: Lead with the on-chain block — that's the proof.
              Cohort vanity metrics drop to last. */}
          {data.treasury.onchain && (
            <section className="px-4 sm:px-6 pb-8 max-w-5xl mx-auto">
              <SectionLabel>
                <span className="inline-flex items-center gap-2">
                  {/* P6: dot pulses green when fresh, holds amber
                      when the last poll is older than STALE_AFTER_MS. */}
                  <span className="relative flex h-2 w-2">
                    {!isStale && (
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
                    )}
                    <span
                      className={`relative inline-flex rounded-full h-2 w-2 ${
                        isStale ? "bg-amber-500" : "bg-emerald-500"
                      }`}
                    />
                  </span>
                  {t(dict, "liveOnchain", lang)}
                  {ageLabel && (
                    <span
                      className={`text-[10px] tracking-[0.16em] font-mono ${
                        isStale ? "text-amber-700" : "text-foreground/45"
                      }`}
                    >
                      · {isStale ? t(dict, "staleHint", lang) : ageLabel}
                    </span>
                  )}
                </span>
              </SectionLabel>
              <div className="grid grid-cols-3 gap-3">
                <Card label="SOL" value={fmtNum(data.treasury.onchain.sol, 4)} suffix="SOL" />
                <Card
                  label="USDC"
                  value={fmtNum(data.treasury.onchain.usdc, 2)}
                  suffix="USDC"
                />
                <Card
                  label={t(dict, "spyxHeld", lang)}
                  value={fmtNum(data.treasury.onchain.spyx, 4)}
                  suffix="pbUSDC"
                />
              </div>
              <a
                href={`https://solscan.io/account/${data.treasury.onchain.address}`}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex items-center gap-2 text-[12px] font-mono text-foreground/55 hover:text-foreground"
              >
                <span className="uppercase tracking-[0.18em]">{t(dict, "walletShort", lang)}</span>
                <code className="font-mono">
                  {data.treasury.onchain.address.slice(0, 6)}…{data.treasury.onchain.address.slice(-4)}
                </code>
                <span className="text-foreground/85 underline-offset-4 underline decoration-foreground/25">{t(dict, "viewOnSolscan", lang)}</span>
              </a>
            </section>
          )}

          <section className="px-4 sm:px-6 pb-8 max-w-5xl mx-auto">
            <div className="flex items-baseline justify-between gap-3 mb-3 px-1">
              <SectionLabel>{t(dict, "recentBatches", lang)}</SectionLabel>
              <a
                href="/api/treasury/feed.xml"
                className="text-[11px] uppercase tracking-[0.18em] font-mono text-foreground/55 hover:text-foreground"
              >
                {t(dict, "subscribe", lang)}
              </a>
            </div>

            {/* P8 — 30-day bar chart promotes the most concrete
                artifact from 'footer' to 'feature'. One bar per
                executed swap, ordered chronologically, height
                proportional to total_usdc. */}
            <BatchChart
              batches={data.recent_batches}
              label={t(dict, "thirtyDays", lang)}
              empty={t(dict, "noBatchesYet", lang)}
              lang={lang}
            />

            <div className="rounded-[18px] border border-foreground/10 bg-white overflow-hidden mt-3">
              {data.recent_batches.length === 0 ? (
                <div className="p-5 text-foreground/55 text-[14px]">
                  {t(dict, "noBatches", lang)}
                </div>
              ) : (
                data.recent_batches.map((b) => (
                  <div
                    key={b.id}
                    className="flex items-center gap-3 px-4 py-3 border-t border-foreground/[0.06] first:border-0"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="text-[14px] font-medium text-foreground tabular-nums">
                        {new Date(b.executed_at).toLocaleString(lang === "zh" ? "zh-CN" : "en-GB", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                      <div className="text-[12px] text-foreground/55 tabular-nums">
                        {fmtUsd(b.total_usdc)} →{" "}
                        {b.spyx_received ? `${fmtNum(b.spyx_received, 6)} pbUSDC` : t(dict, "quoteOnly", lang)}
                      </div>
                    </div>
                    {b.tx_sig ? (
                      <a
                        href={`https://solscan.io/tx/${b.tx_sig}`}
                        target="_blank"
                        rel="noreferrer"
                        className="shrink-0 text-[12px] font-semibold text-foreground/85 hover:text-foreground underline-offset-4 underline decoration-foreground/25"
                      >
                        {t(dict, "onchain", lang)}
                      </a>
                    ) : (
                      <span className="shrink-0 text-[11px] uppercase tracking-[0.16em] font-mono text-foreground/45">
                        {t(dict, "demoQuoted", lang)}
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="px-4 sm:px-6 pb-8 max-w-5xl mx-auto">
            <SectionLabel>{t(dict, "pooledHeader", lang)}</SectionLabel>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Card label={t(dict, "deposited", lang)} value={fmtUsd(data.treasury.total_deposited_usdc)} />
              <Card label={t(dict, "swappedSpyx", lang)} value={fmtUsd(data.treasury.total_swapped_usdc)} />
              <Card
                label={t(dict, "spyxHeld", lang)}
                value={fmtNum(data.treasury.spyx_held, 6)}
                suffix="pbUSDC"
              />
              <Card label={t(dict, "floatIdle", lang)} value={fmtUsd(data.treasury.float_usdc)} />
            </div>
          </section>

          <section className="px-4 sm:px-6 pb-20 max-w-5xl mx-auto">
            <SectionLabel>{t(dict, "cohort", lang)}</SectionLabel>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Card label={t(dict, "users", lang)} value={fmtNum(data.cohort.users, 0)} />
              <Card label={t(dict, "activeStreaks", lang)} value={fmtNum(data.cohort.active_streaks, 0)} />
              <Card label={t(dict, "longestStreak", lang)} value={`${fmtNum(data.cohort.longest_streak, 0)} ${t(dict, "daySuffix", lang)}`} />
              <Card label={t(dict, "totalTaps", lang)} value={fmtNum(data.cohort.total_taps, 0)} />
            </div>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Card
                label={t(dict, "contributedLifetime", lang)}
                value={fmtGbp(data.cohort.total_contributed_gbp)}
              />
              <Card
                label={t(dict, "pendingTaps", lang)}
                value={`${fmtNum(data.cohort.pending_taps, 0)} ${t(dict, "taps", lang)}`}
              />
            </div>
          </section>

        </>
      ) : null}

      <footer className="px-4 sm:px-6 py-10 max-w-5xl mx-auto w-full">
        <div className="glass-pill px-6 py-3 flex flex-wrap items-center justify-between gap-4 text-sm">
          <span className="text-muted">{t(dict, "footer", lang)}</span>
          <Link href="/" className="text-subtle hover:text-foreground">
            {t(dict, "back", lang)}
          </Link>
        </div>
      </footer>
    </main>
  );
}

// P8: 30-day rolling bar chart of cohort swap volumes. Each batch
// is one bar; height ∝ total_usdc; the most recent batch sits on the
// right. The chart bucketizes by date so multiple batches in the
// same UTC day stack into one bar.
function BatchChart({
  batches,
  label,
  empty,
  lang,
}: {
  batches: TreasuryData["recent_batches"];
  label: string;
  empty: string;
  lang: ReturnType<typeof useLang>;
}) {
  // Bucket batches into 30 daily slots ending today (UTC).
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const days: { date: Date; total: number; key: string }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() - i);
    days.push({
      date: d,
      total: 0,
      key: d.toISOString().slice(0, 10),
    });
  }
  for (const b of batches) {
    const day = new Date(b.executed_at).toISOString().slice(0, 10);
    const slot = days.find((s) => s.key === day);
    if (slot) slot.total += Number(b.total_usdc);
  }

  const max = Math.max(...days.map((d) => d.total), 1);
  const total30d = days.reduce((s, d) => s + d.total, 0);
  const hasAnyData = total30d > 0;

  // Render even when no data — bars draw at zero, axis still helps
  // visitors orient on the cadence.
  return (
    <div className="rounded-[18px] border border-foreground/10 bg-white p-4 sm:p-5">
      <div className="flex items-baseline justify-between gap-3 mb-3">
        <span className="text-[10px] uppercase tracking-[0.18em] font-mono text-foreground/55">
          {label}
        </span>
        <span className="text-[12px] tabular-nums text-foreground/85">
          {hasAnyData
            ? total30d.toLocaleString("en-US", {
                style: "currency",
                currency: "USD",
                maximumFractionDigits: 0,
              })
            : "—"}
        </span>
      </div>
      <div className="flex items-end gap-[2px] h-24">
        {days.map((d) => {
          const h = hasAnyData ? Math.max((d.total / max) * 100, d.total > 0 ? 4 : 0) : 0;
          return (
            <div
              key={d.key}
              className="flex-1 rounded-sm transition-all"
              title={`${d.key} · $${d.total.toFixed(2)}`}
              style={{
                height: `${h}%`,
                background:
                  d.total > 0
                    ? "rgba(12, 10, 20, 0.85)"
                    : "rgba(12, 10, 20, 0.06)",
                minHeight: d.total > 0 ? 2 : 1,
              }}
              aria-label={`${d.key}: $${d.total.toFixed(2)}`}
            />
          );
        })}
      </div>
      <div className="flex justify-between text-[10px] font-mono uppercase tracking-[0.16em] text-foreground/45 mt-2">
        <span>
          {days[0].date.toLocaleDateString(lang === "zh" ? "zh-CN" : "en-GB", {
            day: "numeric",
            month: "short",
          })}
        </span>
        <span>
          {days[days.length - 1].date.toLocaleDateString(
            lang === "zh" ? "zh-CN" : "en-GB",
            { day: "numeric", month: "short" },
          )}
        </span>
      </div>
      {!hasAnyData && (
        <p className="text-[12px] text-foreground/55 mt-3 leading-relaxed">{empty}</p>
      )}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[11px] uppercase tracking-[0.22em] font-mono text-foreground/55 mb-3 px-1">
      {children}
    </div>
  );
}

function Card({
  label,
  value,
  suffix,
  accent = false,
}: {
  label: string;
  value: string;
  suffix?: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-[18px] border p-4 ${
        accent ? "border-foreground/15 bg-foreground/[0.03]" : "border-foreground/10 bg-white"
      }`}
    >
      <div className="text-[11px] uppercase tracking-[0.22em] font-mono text-foreground/55 mb-2">
        {label}
      </div>
      <div className="text-xl sm:text-2xl font-bold tracking-tight text-foreground tabular-nums">
        {value}
        {suffix && (
          <span className="text-sm font-normal text-foreground/55 ml-1.5">{suffix}</span>
        )}
      </div>
    </div>
  );
}

