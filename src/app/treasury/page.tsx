"use client";

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
    float_apy: number;
    annual_float_yield_usdc: number;
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
  hero: { en: "Receipts, not promises.", zh: "凭证,而非承诺。" },
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
  floatYield: { en: "Float yield · Kamino USDC vault", zh: "浮动收益 · Kamino USDC 金库" },
  apy: { en: "APY", zh: "年化" },
  perYearModelled: { en: "/ year, modelled", zh: "/ 年,估算" },
  floatBody: {
    en: "Cohort float — USDC sitting in the treasury between deposit and the next daily swap — earns ~4.5% APY in Kamino USDC vaults on Solana. This is leg 2 of Mickle's revenue. Captured on working capital, never on user principal. See ",
    zh: "用户群体的浮动资金 —— 存入后等待下一次每日兑换的 USDC —— 在 Solana 上的 Kamino USDC 金库中以约 4.5% 年化运转。这是 Mickle 的第二条收入腿,只对运营资金计息,永远不动用户本金。详见 ",
  },
  floatBodyTail: { en: " on the repo for the full model.", zh: " (在代码仓库)。" },
  recentBatches: { en: "Recent batches", zh: "最近批次" },
  noBatches: { en: "No batches yet. The first one runs the day after the first user tap.", zh: "还没有批次。首次用户打卡后的第二天会运行第一批。" },
  quoteOnly: { en: "quote only", zh: "仅报价" },
  onchain: { en: "On-chain ↗", zh: "链上查看 ↗" },
  demoQuoted: { en: "Demo · quoted", zh: "演示 · 报价" },
  threeLegHeader: { en: "Three-leg revenue · how Mickle survives", zh: "三腿收入 · Mickle 如何存活" },
  leg1Kicker: { en: "Leg 1 · headline", zh: "第一腿 · 显性" },
  leg1Title: { en: "0.99% deposit fee", zh: "0.99% 存款费" },
  leg1Body: { en: "Charged once per top-up. £30+ deposits net positive; smaller deposits subsidised by leg 2.", zh: "每次充值收取一次。£30 以上充值正向回报,较小充值由第二腿补贴。" },
  leg2Kicker: { en: "Leg 2 · the silent leg", zh: "第二腿 · 静默" },
  leg2Title: { en: "Float yield", zh: "浮动收益" },
  leg2Body: { en: "Treasury USDC earns ~4.5% APY in Kamino vaults between deposit and daily swap. Working-capital yield, no user-facing change.", zh: "金库 USDC 在存入与每日兑换之间于 Kamino 金库中以约 4.5% 年化运转。运营资金收益,对用户无任何影响。" },
  leg3Kicker: { en: "Leg 3 · future", zh: "第三腿 · 未来" },
  leg3Title: { en: "Streak Premium", zh: "连胜会员" },
  leg3Body: { en: "£0.99/month after £30 lifetime contribution. Reminders, multi-asset baskets, tax CSV. Same shape as Plum / Moneybox.", zh: "累计投入 £30 后每月 £0.99。提醒、多资产组合、税务 CSV。模式同 Plum / Moneybox。" },
  footer: { en: "© Mickle · Receipts, not promises.", zh: "© Mickle · 凭证,而非承诺。" },
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
const fmtPct = (v: number) => `${(v * 100).toFixed(2)}%`;

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
            <div className="mt-3 rounded-[18px] border border-foreground/10 bg-white p-5">
              <div className="flex items-baseline justify-between gap-3 mb-1">
                <span className="text-[11px] uppercase tracking-[0.22em] font-mono text-foreground/55">
                  {t(dict, "floatYield", lang)}
                </span>
                <span className="text-[12px] font-mono text-foreground/55 tabular-nums">
                  {fmtPct(data.treasury.float_apy)} {t(dict, "apy", lang)}
                </span>
              </div>
              <div className="text-2xl font-bold tracking-tight tabular-nums">
                {fmtUsd(data.treasury.annual_float_yield_usdc)}{" "}
                <span className="text-sm font-normal text-foreground/55">{t(dict, "perYearModelled", lang)}</span>
              </div>
              <p className="text-[12px] text-foreground/55 mt-2 leading-relaxed">
                {t(dict, "floatBody", lang)}
                <code className="font-mono">MONEY.md</code>
                {t(dict, "floatBodyTail", lang)}
              </p>
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

          <section className="px-4 sm:px-6 pb-20 max-w-5xl mx-auto">
            <SectionLabel>{t(dict, "threeLegHeader", lang)}</SectionLabel>
            <div className="grid sm:grid-cols-3 gap-3">
              <Leg kicker={t(dict, "leg1Kicker", lang)} title={t(dict, "leg1Title", lang)} body={t(dict, "leg1Body", lang)} />
              <Leg kicker={t(dict, "leg2Kicker", lang)} title={t(dict, "leg2Title", lang)} body={t(dict, "leg2Body", lang)} />
              <Leg kicker={t(dict, "leg3Kicker", lang)} title={t(dict, "leg3Title", lang)} body={t(dict, "leg3Body", lang)} />
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

function Leg({
  kicker,
  title,
  body,
}: {
  kicker: string;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-[18px] border border-foreground/10 bg-white p-5">
      <div className="text-[11px] uppercase tracking-[0.22em] font-mono text-accent font-bold mb-2">
        {kicker}
      </div>
      <h3 className="text-lg font-bold tracking-tight mb-2">{title}</h3>
      <p className="text-[13px] text-foreground/65 leading-relaxed">{body}</p>
    </div>
  );
}
