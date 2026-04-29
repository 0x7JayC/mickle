"use client";

import { useMemo, useState } from "react";

const HISTORICAL_SP_CAGR = 0.102;

type Horizon = { years: number; label: string };

const HORIZONS: Horizon[] = [
  { years: 1, label: "1 yr" },
  { years: 5, label: "5 yrs" },
  { years: 10, label: "10 yrs" },
  { years: 20, label: "20 yrs" },
  { years: 30, label: "30 yrs" },
];

function projectFutureValue(daily: number, years: number, rate = HISTORICAL_SP_CAGR) {
  const monthly = daily * (365 / 12);
  const r = rate / 12;
  const n = years * 12;
  if (r === 0) return monthly * n;
  return monthly * ((Math.pow(1 + r, n) - 1) / r);
}

function projectContributed(daily: number, years: number) {
  return daily * 365 * years;
}

function fmtMoney(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}k`;
  return `$${n.toFixed(0)}`;
}

export default function TimeMachine() {
  const [daily, setDaily] = useState(1);
  const [horizon, setHorizon] = useState<Horizon>(HORIZONS[3]);

  const future = useMemo(() => projectFutureValue(daily, horizon.years), [daily, horizon]);
  const contributed = useMemo(() => projectContributed(daily, horizon.years), [daily, horizon]);
  const growth = future - contributed;

  // Build chart points
  const points = useMemo(() => {
    const months = horizon.years * 12;
    const step = Math.max(1, Math.floor(months / 60));
    const pts: { m: number; v: number; c: number }[] = [];
    const monthly = daily * (365 / 12);
    const r = HISTORICAL_SP_CAGR / 12;
    let v = 0;
    for (let m = 0; m <= months; m++) {
      v = (v + monthly) * (1 + r);
      if (m % step === 0 || m === months) {
        pts.push({ m, v, c: monthly * (m + 1) });
      }
    }
    return pts;
  }, [daily, horizon]);

  const max = points[points.length - 1]?.v ?? 1;
  const W = 800;
  const H = 320;
  const PAD = 24;

  const xAt = (i: number) => PAD + (i / (points.length - 1)) * (W - PAD * 2);
  const yAt = (v: number) => H - PAD - (v / max) * (H - PAD * 2);

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${xAt(i)} ${yAt(p.v)}`).join(" ");
  const areaPath = `${linePath} L ${xAt(points.length - 1)} ${H - PAD} L ${xAt(0)} ${H - PAD} Z`;
  const contribPath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${xAt(i)} ${yAt(p.c)}`)
    .join(" ");

  return (
    <div className="w-full">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-surface">
          <span className="text-xs text-muted uppercase tracking-wider">Daily</span>
          <span className="text-accent font-mono text-lg">${daily}</span>
          <input
            type="range"
            min={1}
            max={20}
            step={1}
            value={daily}
            onChange={(e) => setDaily(Number(e.target.value))}
            className="w-32 accent-accent"
          />
        </div>
        <div className="flex gap-1 p-1 rounded-lg border border-border bg-surface">
          {HORIZONS.map((h) => (
            <button
              key={h.years}
              onClick={() => setHorizon(h)}
              className={`px-3 py-1.5 text-sm rounded-md transition ${
                h.years === horizon.years
                  ? "bg-accent text-background font-semibold"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {h.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="rounded-xl border border-border bg-surface p-4 sm:p-6">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" preserveAspectRatio="none">
          <defs>
            <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.4" />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={areaPath} fill="url(#grad)" />
          <path d={contribPath} fill="none" stroke="var(--muted)" strokeWidth="1.5" strokeDasharray="4 4" />
          <path d={linePath} fill="none" stroke="var(--accent)" strokeWidth="2.5" />
        </svg>
        <div className="flex items-center gap-4 text-xs text-muted mt-2">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-0.5 bg-accent" /> Projected value
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-px border-t border-dashed border-muted" /> Total contributed
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mt-6">
        <Stat label={`In ${horizon.label}`} value={fmtMoney(future)} accent />
        <Stat label="You contributed" value={fmtMoney(contributed)} />
        <Stat label="Compounding gave you" value={fmtMoney(growth)} positive />
      </div>

      <p className="text-xs text-muted mt-4 max-w-prose">
        Projection uses historical S&P 500 CAGR of 10.2%. Past performance does not guarantee future results.
        SPYx (Backed Finance) is a tokenized claim on the SPDR S&P 500 ETF, redeemable 1:1.
      </p>
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
  positive,
}: {
  label: string;
  value: string;
  accent?: boolean;
  positive?: boolean;
}) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <div className="text-[10px] uppercase tracking-widest text-muted mb-1.5">{label}</div>
      <div
        className={`font-mono text-2xl sm:text-3xl font-bold tracking-tight ${
          accent ? "text-accent" : positive ? "text-positive" : "text-foreground"
        }`}
      >
        {value}
      </div>
    </div>
  );
}
