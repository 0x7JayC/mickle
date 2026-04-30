import Link from "next/link";

export const dynamic = "force-dynamic";
export const revalidate = 60;

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
  };
  recent_batches: {
    id: string;
    executed_at: string;
    total_usdc: number;
    spyx_received: number | null;
    tx_sig: string | null;
  }[];
};

async function load(): Promise<TreasuryData | null> {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
  try {
    const r = await fetch(`${base}/api/treasury`, { next: { revalidate: 60 } });
    if (!r.ok) return null;
    return (await r.json()) as TreasuryData;
  } catch {
    return null;
  }
}

const fmtGbp = (v: number) =>
  v.toLocaleString("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 2 });
const fmtUsd = (v: number) =>
  v.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 });
const fmtNum = (v: number, max = 4) =>
  v.toLocaleString("en-US", { maximumFractionDigits: max });
const fmtPct = (v: number) => `${(v * 100).toFixed(2)}%`;

export default async function TreasuryPage() {
  const data = await load();

  return (
    <main className="flex-1">
      <nav className="sticky top-4 z-50 px-4 sm:px-6 mt-4">
        <div className="max-w-5xl mx-auto glass-pill px-3 sm:px-4 py-2.5 flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 shrink-0 rounded-full bg-gradient-to-br from-[#ff8a6b] to-[#f5b94a]" />
            <span className="font-semibold tracking-tight truncate">Mickle</span>
          </Link>
          <span className="text-[11px] uppercase tracking-[0.22em] font-mono text-foreground/55 hidden sm:block">
            Treasury · public ledger
          </span>
          <Link
            href="/app"
            className="text-sm font-semibold text-foreground/70 hover:text-foreground shrink-0"
          >
            Open app →
          </Link>
        </div>
      </nav>

      <section className="px-4 sm:px-6 pt-10 sm:pt-14 pb-8 max-w-5xl mx-auto w-full">
        <span className="text-xs uppercase tracking-[0.2em] text-muted font-mono">
          Treasury
        </span>
        <h1 className="text-display text-4xl sm:text-6xl font-extrabold leading-[0.95] mt-3 mb-4">
          Receipts, not promises.
        </h1>
        <p className="text-base sm:text-lg text-foreground/70 leading-relaxed max-w-2xl">
          Every tap, every deposit, every daily swap. Aggregated across the whole cohort.
          Open Mickle is a daily ritual; the treasury is the receipt.
        </p>
      </section>

      {!data ? (
        <section className="px-4 sm:px-6 pb-20 max-w-5xl mx-auto">
          <div className="rounded-[18px] border border-foreground/10 bg-white p-6 text-foreground/60">
            Treasury is initialising. Check back in a minute.
          </div>
        </section>
      ) : (
        <>
          <section className="px-4 sm:px-6 pb-8 max-w-5xl mx-auto">
            <SectionLabel>Cohort</SectionLabel>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Card label="Users" value={fmtNum(data.cohort.users, 0)} />
              <Card label="Active streaks" value={fmtNum(data.cohort.active_streaks, 0)} />
              <Card label="Longest streak" value={`${fmtNum(data.cohort.longest_streak, 0)} d`} />
              <Card label="Total taps" value={fmtNum(data.cohort.total_taps, 0)} />
            </div>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Card
                label="Contributed (lifetime)"
                value={fmtGbp(data.cohort.total_contributed_gbp)}
                accent
              />
              <Card
                label="Pending taps · next batch"
                value={`${fmtNum(data.cohort.pending_taps, 0)} taps`}
              />
            </div>
          </section>

          <section className="px-4 sm:px-6 pb-8 max-w-5xl mx-auto">
            <SectionLabel>Treasury (pooled, on Solana)</SectionLabel>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Card label="Deposited" value={fmtUsd(data.treasury.total_deposited_usdc)} />
              <Card label="Swapped → SPYx" value={fmtUsd(data.treasury.total_swapped_usdc)} />
              <Card
                label="SPYx held"
                value={fmtNum(data.treasury.spyx_held, 6)}
                suffix="SPYx"
              />
              <Card label="Float idle" value={fmtUsd(data.treasury.float_usdc)} />
            </div>
            <div className="mt-3 rounded-[18px] border border-foreground/10 bg-white p-5">
              <div className="flex items-baseline justify-between gap-3 mb-1">
                <span className="text-[11px] uppercase tracking-[0.22em] font-mono text-foreground/55">
                  Float yield · Kamino USDC vault
                </span>
                <span className="text-[12px] font-mono text-foreground/55 tabular-nums">
                  {fmtPct(data.treasury.float_apy)} APY
                </span>
              </div>
              <div className="text-2xl font-bold tracking-tight tabular-nums">
                {fmtUsd(data.treasury.annual_float_yield_usdc)}{" "}
                <span className="text-sm font-normal text-foreground/55">/ year, modelled</span>
              </div>
              <p className="text-[12px] text-foreground/55 mt-2 leading-relaxed">
                Cohort float — USDC sitting in the treasury between deposit and the next
                daily swap — earns ~4.5% APY in Kamino USDC vaults on Solana. This is leg 2
                of Mickle&apos;s revenue. Captured on working capital, never on user principal.
                See <code className="font-mono">MONEY.md</code> on the repo for the full model.
              </p>
            </div>
          </section>

          <section className="px-4 sm:px-6 pb-20 max-w-5xl mx-auto">
            <SectionLabel>Recent batches</SectionLabel>
            <div className="rounded-[18px] border border-foreground/10 bg-white overflow-hidden">
              {data.recent_batches.length === 0 ? (
                <div className="p-5 text-foreground/55 text-[14px]">
                  No batches yet. The first one runs the day after the first user tap.
                </div>
              ) : (
                data.recent_batches.map((b) => (
                  <div
                    key={b.id}
                    className="flex items-center gap-3 px-4 py-3 border-t border-foreground/[0.06] first:border-0"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="text-[14px] font-medium text-foreground tabular-nums">
                        {new Date(b.executed_at).toLocaleString("en-GB", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                      <div className="text-[12px] text-foreground/55 tabular-nums">
                        {fmtUsd(b.total_usdc)} →{" "}
                        {b.spyx_received ? `${fmtNum(b.spyx_received, 6)} SPYx` : "quote only"}
                      </div>
                    </div>
                    {b.tx_sig ? (
                      <a
                        href={`https://solscan.io/tx/${b.tx_sig}`}
                        target="_blank"
                        rel="noreferrer"
                        className="shrink-0 text-[12px] font-semibold text-accent hover:underline"
                      >
                        On-chain ↗
                      </a>
                    ) : (
                      <span className="shrink-0 text-[11px] uppercase tracking-[0.16em] font-mono text-foreground/45">
                        Demo · quoted
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="px-4 sm:px-6 pb-20 max-w-5xl mx-auto">
            <SectionLabel>Three-leg revenue · how Mickle survives</SectionLabel>
            <div className="grid sm:grid-cols-3 gap-3">
              <Leg
                kicker="Leg 1 · headline"
                title="0.99% deposit fee"
                body="Charged once per top-up. £30+ deposits net positive; smaller deposits subsidised by leg 2."
              />
              <Leg
                kicker="Leg 2 · the silent leg"
                title="Float yield"
                body="Treasury USDC earns ~4.5% APY in Kamino vaults between deposit and daily swap. Working-capital yield, no user-facing change."
              />
              <Leg
                kicker="Leg 3 · future"
                title="Streak Premium"
                body="£0.99/month after £30 lifetime contribution. Reminders, multi-asset baskets, tax CSV. Same shape as Plum / Moneybox."
              />
            </div>
          </section>
        </>
      )}

      <footer className="px-4 sm:px-6 py-10 max-w-5xl mx-auto w-full">
        <div className="glass-pill px-6 py-3 flex flex-wrap items-center justify-between gap-4 text-sm">
          <span className="text-muted">© Mickle · Receipts, not promises.</span>
          <Link href="/" className="text-subtle hover:text-foreground">
            ← Back to landing
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
