import Link from "next/link";
import MiniTimeMachine from "@/components/MiniTimeMachine";

const PALETTES = [
  {
    id: "a1",
    name: "A1 — Warm Sunrise",
    note: "Coral · honey · indigo · pink. Energetic, optimistic.",
  },
  {
    id: "a2",
    name: "A2 — Cool Dawn",
    note: "Sky · mint · lilac · pale gold. Calm, premium.",
  },
  {
    id: "a4",
    name: "A4 — Monochrome Cream",
    note: "Warm cream + terracotta. Editorial, restrained.",
  },
  {
    id: "a5",
    name: "A5 — Aurora",
    note: "Teal · violet · magenta on near-black. Vivid, futuristic.",
  },
];

export default function ComparePage() {
  return (
    <main className="flex-1 relative">
      {/* Floating chooser */}
      <nav className="sticky top-4 z-50 px-4 sm:px-6 mt-4">
        <div className="max-w-6xl mx-auto glass-pill px-4 py-2.5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#ff8a6b] to-[#f5b94a]" />
            <span className="font-semibold text-sm tracking-tight">Mickle</span>
          </Link>
          <div className="text-xs font-mono text-foreground/60">palette comparison</div>
          <Link href="/" className="text-xs text-foreground/60 hover:text-foreground">← back</Link>
        </div>
      </nav>

      <div className="px-4 sm:px-6 pt-12 pb-20 max-w-6xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tighter mb-2">
          Pick a palette.
        </h1>
        <p className="text-foreground/60 mb-12">
          Each panel is the live hero + Time Machine in that palette&apos;s ambient + glass treatment.
        </p>

        <div className="grid lg:grid-cols-2 gap-8">
          {PALETTES.map((p) => (
            <PalettePreview key={p.id} {...p} />
          ))}
        </div>
      </div>
    </main>
  );
}

function PalettePreview({ id, name, note }: { id: string; name: string; note: string }) {
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

      {/* Preview frame */}
      <div className={`relative rounded-3xl overflow-hidden border border-white/40 shadow-[0_20px_60px_-20px_rgba(12,10,20,0.18)] ${themeClass}`}
        style={{ minHeight: 520 }}>
        <div className={ambientClass} />
        <div className="relative z-10 p-6 sm:p-8 flex flex-col gap-5 h-full">
          {/* Mock nav pill */}
          <div className="glass-pill px-3 py-1.5 inline-flex self-start items-center gap-2 text-xs">
            <div className="w-4 h-4 rounded-full" style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-2))" }} />
            <span className="font-semibold">Mickle</span>
            <span className="opacity-50 mx-1">·</span>
            <span className="opacity-60">How</span>
          </div>

          {/* Hero */}
          <div>
            <div className="glass-pill inline-block px-3 py-1 text-[10px] uppercase tracking-[0.18em] font-semibold opacity-80 mb-3">
              The patience product
            </div>
            <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tighter leading-[0.95] mb-2">
              Every little<br/>makes a mickle.
            </h3>
            <p className="text-sm opacity-70 max-w-sm">
              $1 a day into the S&P 500. On Solana. Watch consistency compound.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-2">
            <button className="glass-button-primary px-5 py-2.5 text-sm font-semibold text-white">
              Start your streak
            </button>
            <button className="glass-button px-5 py-2.5 text-sm font-semibold">
              How it works
            </button>
          </div>

          {/* Mini Time Machine glass card */}
          <div className="glass-strong p-4 mt-auto">
            <div className="text-[10px] uppercase tracking-[0.2em] opacity-60 font-mono font-semibold mb-2">
              The Time Machine · 30y · $1/day
            </div>
            <MiniTimeMachine years={30} daily={1} />
          </div>
        </div>
      </div>
    </section>
  );
}
