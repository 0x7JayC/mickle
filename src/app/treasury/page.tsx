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
  swappedSpyx: { en: "Swapped → SPYx", zh: "已兑换 → SPYx" },
  spyxHeld: { en: "SPYx held", zh: "SPYx 持仓" },
  floatIdle: { en: "Float idle", zh: "闲置浮动资金" },
  recentBatches: { en: "Recent batches", zh: "最近批次" },
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

export default function TreasuryPage() {
  const lang = useLang();
  const [data, setData] = useState<TreasuryData | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/treasury")
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => setData(j))
      .finally(() => setLoaded(true));
  }, []);

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
          <section className="px-4 sm:px-6 pb-8 max-w-5xl mx-auto">
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
                accent
              />
              <Card
                label={t(dict, "pendingTaps", lang)}
                value={`${fmtNum(data.cohort.pending_taps, 0)} ${t(dict, "taps", lang)}`}
              />
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
                suffix="SPYx"
              />
              <Card label={t(dict, "floatIdle", lang)} value={fmtUsd(data.treasury.float_usdc)} />
            </div>
          </section>

          {data.treasury.onchain && (
            <section className="px-4 sm:px-6 pb-8 max-w-5xl mx-auto">
              <SectionLabel>
                <span className="inline-flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  {t(dict, "liveOnchain", lang)}
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
                  suffix="SPYx"
                />
              </div>
              <a
                href={`https://solscan.io/account/${data.treasury.onchain.address}`}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex items-center gap-2 text-[12px] font-mono text-foreground/55 hover:text-accent"
              >
                <span className="uppercase tracking-[0.18em]">{t(dict, "walletShort", lang)}</span>
                <code className="font-mono">
                  {data.treasury.onchain.address.slice(0, 6)}…{data.treasury.onchain.address.slice(-4)}
                </code>
                <span className="text-accent">{t(dict, "viewOnSolscan", lang)}</span>
              </a>
            </section>
          )}

          <section className="px-4 sm:px-6 pb-20 max-w-5xl mx-auto">
            <SectionLabel>{t(dict, "recentBatches", lang)}</SectionLabel>
            <div className="rounded-[18px] border border-foreground/10 bg-white overflow-hidden">
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
                        {b.spyx_received ? `${fmtNum(b.spyx_received, 6)} SPYx` : t(dict, "quoteOnly", lang)}
                      </div>
                    </div>
                    {b.tx_sig ? (
                      <a
                        href={`https://solscan.io/tx/${b.tx_sig}`}
                        target="_blank"
                        rel="noreferrer"
                        className="shrink-0 text-[12px] font-semibold text-accent hover:underline"
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
        accent ? "border-accent/30 bg-accent/[0.06]" : "border-foreground/10 bg-white"
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

