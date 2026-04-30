"use client";

import { useMemo, useState } from "react";
import { useLang, t, type Dict } from "@/lib/i18n";

const dict: Dict = {
  daily: { en: "Daily", zh: "每日" },
  projected: { en: "Projected", zh: "预测" },
  contributed: { en: "Contributed", zh: "已投入" },
  compounding: { en: "Compounding", zh: "复利收益" },
  inHorizon: { en: "In {h}", zh: "{h} 后" },
};

const fmtH = (s: string, h: string) => s.replace("{h}", h);

const HISTORICAL_SP_CAGR = 0.102;

type Horizon = { years: number; label: string };

const HORIZONS: Horizon[] = [
  { years: 1, label: "1Y" },
  { years: 2, label: "2Y" },
  { years: 3, label: "3Y" },
  { years: 5, label: "5Y" },
  { years: 10, label: "10Y" },
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
  if (n >= 100_000_000) return `£${(n / 1_000_000).toFixed(0)}M`;
  if (n >= 1_000_000) return `£${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 100_000) return `£${(n / 1_000).toFixed(0)}k`;
  if (n >= 1_000) return `£${(n / 1_000).toFixed(1)}k`;
  return `£${n.toFixed(0)}`;
}

export default function TimeMachine() {
  const lang = useLang();
  const [daily, setDaily] = useState(1);
  const [horizon, setHorizon] = useState<Horizon>(HORIZONS[4]);

  const future = useMemo(() => projectFutureValue(daily, horizon.years), [daily, horizon]);
  const contributed = useMemo(() => projectContributed(daily, horizon.years), [daily, horizon]);
  const growth = future - contributed;

  const points = useMemo(() => {
    const months = horizon.years * 12;
    const step = Math.max(1, Math.floor(months / 80));
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
      <div className="flex flex-wrap items-center gap-3 mb-7">
        <div className="glass-pill flex items-center gap-3 pl-4 pr-4 py-2.5">
          <span className="text-[10px] text-muted uppercase tracking-[0.18em] font-semibold">{t(dict, "daily", lang)}</span>
          <span className="text-foreground font-mono text-lg font-semibold tabular-nums">£{daily}</span>
          <input
            type="range"
            min={1}
            max={20}
            step={1}
            value={daily}
            onChange={(e) => setDaily(Number(e.target.value))}
            className="w-32 sm:w-40 accent-[#ff7a59]"
          />
        </div>
        <div className="glass-pill flex gap-1 p-1">
          {HORIZONS.map((h) => {
            const active = h.years === horizon.years;
            return (
              <button
                key={h.years}
                onClick={() => setHorizon(h)}
                className={`px-3.5 py-1.5 text-sm rounded-full font-mono font-semibold tabular-nums transition ${
                  active
                    ? "bg-foreground text-white shadow-[0_4px_12px_rgba(12,10,20,0.3)]"
                    : "text-muted hover:text-foreground"
                }`}
                aria-pressed={active}
              >
                {h.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Chart */}
      <div className="glass-soft p-4 sm:p-6">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" preserveAspectRatio="none">
          <defs>
            <linearGradient id="grad-area" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ff7a59" stopOpacity="0.45" />
              <stop offset="60%" stopColor="#f5b94a" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#6d5ef5" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="grad-line" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#ff7a59" />
              <stop offset="50%" stopColor="#f5b94a" />
              <stop offset="100%" stopColor="#6d5ef5" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <path d={areaPath} fill="url(#grad-area)" />
          <path
            d={contribPath}
            fill="none"
            stroke="currentColor"
            strokeOpacity="0.32"
            strokeWidth="1.5"
            strokeDasharray="4 5"
          />
          <path d={linePath} fill="none" stroke="url(#grad-line)" strokeWidth="3" filter="url(#glow)" strokeLinecap="round" />
        </svg>
        <div className="flex items-center gap-5 text-xs text-muted mt-2 px-1">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3.5 h-0.5 rounded-full bg-gradient-to-r from-[#ff7a59] via-[#f5b94a] to-[#6d5ef5]" />
            {t(dict, "projected", lang)}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3.5 h-px border-t border-dashed border-current opacity-40" />
            {t(dict, "contributed", lang)}
          </span>
        </div>
      </div>

      {/* Stats — single label word so 3-col fits cleanly on mobile */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-5">
        <Stat label={fmtH(t(dict, "inHorizon", lang), horizon.label)} value={fmtMoney(future)} variant="primary" />
        <Stat label={t(dict, "contributed", lang)} value={fmtMoney(contributed)} />
        <Stat label={t(dict, "compounding", lang)} value={fmtMoney(growth)} variant="positive" />
      </div>

      <p className="text-xs text-subtle mt-5 max-w-prose leading-relaxed">
        Historical S&P 500 CAGR of 10.2%. Past performance is not indicative of future results.
        SPYx (Backed Finance) is a tokenized claim on SPDR S&P 500 ETF, redeemable 1:1.
      </p>
    </div>
  );
}

function Stat({
  label,
  value,
  variant,
}: {
  label: string;
  value: string;
  variant?: "primary" | "positive";
}) {
  const valueClass =
    variant === "primary"
      ? "bg-gradient-to-br from-[#ff7a59] via-[#f5b94a] to-[#ff7a59] bg-clip-text text-transparent"
      : variant === "positive"
      ? "text-[#10b981]"
      : "text-foreground";
  return (
    <div className="glass-soft p-3 sm:p-4 min-w-0">
      <div className="text-[9px] sm:text-[10px] uppercase tracking-[0.14em] sm:tracking-[0.18em] text-muted mb-1.5 sm:mb-2 font-semibold whitespace-nowrap overflow-hidden text-ellipsis">
        {label}
      </div>
      <div
        className={`font-mono text-lg sm:text-3xl font-bold tracking-tight tabular-nums whitespace-nowrap overflow-hidden text-ellipsis ${valueClass}`}
      >
        {value}
      </div>
    </div>
  );
}
