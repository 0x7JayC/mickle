"use client";

import { useMemo } from "react";
import { useLang, t, type Dict } from "@/lib/i18n";

const dict: Dict = {
  inYears: { en: "In {n}y", zh: "{n} 年后" },
  contributed: { en: "Contributed", zh: "已投入" },
};

const fmtN = (s: string, n: number) => s.replace("{n}", String(n));

const CAGR = 0.102;

function fv(daily: number, years: number) {
  const m = daily * (365 / 12);
  const r = CAGR / 12;
  const n = years * 12;
  return m * ((Math.pow(1 + r, n) - 1) / r);
}

function fmt(n: number) {
  if (n >= 1_000_000) return `£${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `£${(n / 1_000).toFixed(1)}k`;
  return `£${n.toFixed(0)}`;
}

export default function MiniTimeMachine({ years = 30, daily = 1 }: { years?: number; daily?: number }) {
  const lang = useLang();
  const points = useMemo(() => {
    const months = years * 12;
    const step = Math.max(1, Math.floor(months / 60));
    const pts: { v: number; c: number }[] = [];
    const monthly = daily * (365 / 12);
    const r = CAGR / 12;
    let v = 0;
    for (let m = 0; m <= months; m++) {
      v = (v + monthly) * (1 + r);
      if (m % step === 0 || m === months) pts.push({ v, c: monthly * (m + 1) });
    }
    return pts;
  }, [years, daily]);

  const future = points[points.length - 1].v;
  const contributed = points[points.length - 1].c;
  const max = future;
  const W = 600, H = 180, PAD = 12;
  const xAt = (i: number) => PAD + (i / (points.length - 1)) * (W - PAD * 2);
  const yAt = (v: number) => H - PAD - (v / max) * (H - PAD * 2);
  const line = points.map((p, i) => `${i === 0 ? "M" : "L"} ${xAt(i)} ${yAt(p.v)}`).join(" ");
  const area = `${line} L ${xAt(points.length - 1)} ${H - PAD} L ${xAt(0)} ${H - PAD} Z`;
  const contrib = points.map((p, i) => `${i === 0 ? "M" : "L"} ${xAt(i)} ${yAt(p.c)}`).join(" ");

  const id = `${years}-${daily}-${Math.random().toString(36).slice(2, 7)}`;

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
        <defs>
          <linearGradient id={`area-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.5" />
            <stop offset="60%" stopColor="var(--accent-2)" stopOpacity="0.18" />
            <stop offset="100%" stopColor="var(--accent-3)" stopOpacity="0" />
          </linearGradient>
          <linearGradient id={`line-${id}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--accent)" />
            <stop offset="50%" stopColor="var(--accent-2)" />
            <stop offset="100%" stopColor="var(--accent-3)" />
          </linearGradient>
        </defs>
        <path d={area} fill={`url(#area-${id})`} />
        <path d={contrib} fill="none" stroke="currentColor" strokeOpacity="0.3" strokeWidth="1.2" strokeDasharray="3 4" />
        <path d={line} fill="none" stroke={`url(#line-${id})`} strokeWidth="2.5" strokeLinecap="round" />
      </svg>
      <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
        <div>
          <div className="opacity-60 uppercase tracking-widest text-[9px] font-semibold">{fmtN(t(dict, "inYears", lang), years)}</div>
          <div className="font-mono font-bold text-lg" style={{ color: "var(--accent)" }}>{fmt(future)}</div>
        </div>
        <div>
          <div className="opacity-60 uppercase tracking-widest text-[9px] font-semibold">{t(dict, "contributed", lang)}</div>
          <div className="font-mono font-bold text-lg">{fmt(contributed)}</div>
        </div>
      </div>
    </div>
  );
}
