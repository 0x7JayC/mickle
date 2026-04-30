"use client";

import Link from "next/link";
import MiniTimeMachine from "@/components/MiniTimeMachine";
import { useLang, t, type Dict } from "@/lib/i18n";

const dict: Dict = {
  paletteComparison: { en: "palette comparison", zh: "配色对比" },
  back: { en: "← back", zh: "← 返回" },
  hero: { en: "Pick a palette.", zh: "选一个配色。" },
  sub: {
    en: "Each panel is the live hero + Time Machine in that palette's ambient + glass treatment.",
    zh: "每个面板都是该配色下真实的主视觉 + 时间机器,带氛围与玻璃质感。",
  },
  thePatience: { en: "The patience product", zh: "耐心产物" },
  heroTitle1: { en: "Every little", zh: "积少" },
  heroTitle2: { en: "makes a mickle.", zh: "成多。" },
  heroSub: {
    en: "£1 a day into the S&P 500. On Solana. Watch consistency compound.",
    zh: "每天 £1 投入 S&P 500,在 Solana 上。看坚持如何复利。",
  },
  startStreak: { en: "Start your streak", zh: "开始连续打卡" },
  how: { en: "How it works", zh: "如何运作" },
  tmLabel: { en: "The Time Machine · 30y · £1/day", zh: "时间机器 · 30 年 · 每日 £1" },
  how2: { en: "How", zh: "如何运作" },
};

const PALETTES = [
  {
    id: "a1",
    name: { en: "A1 — Warm Sunrise", zh: "A1 — 暖日初升" },
    note: { en: "Coral · honey · indigo · pink. Energetic, optimistic.", zh: "珊瑚 · 蜂蜜 · 靛蓝 · 粉。活力、乐观。" },
  },
  {
    id: "a2",
    name: { en: "A2 — Cool Dawn", zh: "A2 — 冷清晨曦" },
    note: { en: "Sky · mint · lilac · pale gold. Calm, premium.", zh: "天蓝 · 薄荷 · 紫丁香 · 浅金。平静、高级。" },
  },
  {
    id: "a4",
    name: { en: "A4 — Monochrome Cream", zh: "A4 — 单色奶油" },
    note: { en: "Warm cream + terracotta. Editorial, restrained.", zh: "暖奶油 + 赤陶。编辑感、克制。" },
  },
  {
    id: "a5",
    name: { en: "A5 — Aurora", zh: "A5 — 极光" },
    note: { en: "Teal · violet · magenta on near-black. Vivid, futuristic.", zh: "青绿 · 紫罗兰 · 品红,近黑底。明艳、未来感。" },
  },
];

export default function ComparePage() {
  const lang = useLang();
  return (
    <main className="flex-1 relative">
      <nav className="sticky top-4 z-50 px-4 sm:px-6 mt-4">
        <div className="max-w-6xl mx-auto glass-pill px-4 py-2.5 flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 shrink-0 rounded-full bg-gradient-to-br from-[#ff8a6b] to-[#f5b94a]" />
            <span className="font-semibold text-sm tracking-tight truncate">Mickle</span>
          </Link>
          <div className="hidden sm:block text-xs font-mono text-foreground/60">{t(dict, "paletteComparison", lang)}</div>
          <Link href="/" className="text-xs text-foreground/60 hover:text-foreground shrink-0">{t(dict, "back", lang)}</Link>
        </div>
      </nav>

      <div className="px-4 sm:px-6 pt-8 sm:pt-12 pb-12 sm:pb-20 max-w-6xl mx-auto">
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tighter mb-2">
          {t(dict, "hero", lang)}
        </h1>
        <p className="text-foreground/60 mb-8 sm:mb-12 text-[15px]">
          {t(dict, "sub", lang)}
        </p>

        <div className="grid lg:grid-cols-2 gap-8">
          {PALETTES.map((p) => (
            <PalettePreview key={p.id} id={p.id} name={p.name[lang]} note={p.note[lang]} />
          ))}
        </div>
      </div>
    </main>
  );
}

function PalettePreview({ id, name, note }: { id: string; name: string; note: string }) {
  const lang = useLang();
  const themeClass = `theme-${id}`;
  const ambientClass = `ambient-${id}`;
  return (
    <section className="space-y-3">
      <div className="flex items-baseline justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight">{name}</h2>
          <p className="text-xs text-foreground/55">{note}</p>
        </div>
        <span className="font-mono text-[10px] uppercase tracking-widest text-foreground/40">
          {id}
        </span>
      </div>

      <div className={`relative rounded-3xl overflow-hidden border border-white/40 shadow-[0_20px_60px_-20px_rgba(12,10,20,0.18)] ${themeClass}`}
        style={{ minHeight: 520 }}>
        <div className={ambientClass} />
        <div className="relative z-10 p-6 sm:p-8 flex flex-col gap-5 h-full">
          <div className="glass-pill px-3 py-1.5 inline-flex self-start items-center gap-2 text-xs">
            <div className="w-4 h-4 rounded-full" style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-2))" }} />
            <span className="font-semibold">Mickle</span>
            <span className="opacity-50 mx-1">·</span>
            <span className="opacity-60">{t(dict, "how2", lang)}</span>
          </div>

          <div>
            <div className="glass-pill inline-block px-3 py-1 text-[10px] uppercase tracking-[0.18em] font-semibold opacity-80 mb-3">
              {t(dict, "thePatience", lang)}
            </div>
            <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tighter leading-[0.95] mb-2">
              {t(dict, "heroTitle1", lang)}<br/>{t(dict, "heroTitle2", lang)}
            </h3>
            <p className="text-sm opacity-70 max-w-sm">
              {t(dict, "heroSub", lang)}
            </p>
          </div>

          <div className="flex gap-2">
            <button className="glass-button-primary px-5 py-2.5 text-sm font-semibold text-white">
              {t(dict, "startStreak", lang)}
            </button>
            <button className="glass-button px-5 py-2.5 text-sm font-semibold">
              {t(dict, "how", lang)}
            </button>
          </div>

          <div className="glass-strong p-4 mt-auto">
            <div className="text-[10px] uppercase tracking-[0.2em] opacity-60 font-mono font-semibold mb-2">
              {t(dict, "tmLabel", lang)}
            </div>
            <MiniTimeMachine years={30} daily={1} />
          </div>
        </div>
      </div>
    </section>
  );
}
