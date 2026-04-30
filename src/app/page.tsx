import Link from "next/link";
import TimeMachine from "@/components/TimeMachine";
import { ThemeDots } from "@/components/ThemeShell";
import { LandingAuth, LandingNavCta } from "@/components/LandingAuth";

export default function Home() {
  return (
    <main className="flex-1">
      {/* Floating glass nav — theme dots inline so they don't block the CTA on mobile */}
      <nav className="sticky top-4 z-50 px-4 sm:px-6 mt-4">
        <div className="max-w-6xl mx-auto glass-pill px-2 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2 pl-3">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#ff8a6b] to-[#f5b94a] shadow-[0_4px_12px_rgba(255,122,89,0.4)]" />
            <span className="font-semibold text-base tracking-tight">Mickle</span>
          </div>
          <div className="flex items-center gap-3">
            <a href="#how" className="hidden sm:inline px-3 py-2 text-sm text-muted hover:text-foreground transition rounded-full">
              How
            </a>
            <Link href="/treasury" className="hidden sm:inline px-3 py-2 text-sm text-muted hover:text-foreground transition rounded-full">
              Treasury
            </Link>
            <ThemeDots className="hidden sm:flex mr-1" />
            <LandingNavCta />
          </div>
        </div>
      </nav>

      {/* Hero — tighter sub-copy, tech stack as footnote */}
      <section className="px-4 sm:px-6 pt-10 sm:pt-14 pb-10 sm:pb-8 max-w-6xl mx-auto w-full">
        <div className="fade-up text-center">
          <span className="inline-block glass-pill px-4 py-1.5 text-xs uppercase tracking-[0.18em] font-semibold text-foreground/70 mb-8">
            The patience product crypto doesn&apos;t have
          </span>
          <h1 className="text-display text-6xl sm:text-8xl font-extrabold leading-[0.95] mb-7">
            Every little
            <br />
            makes a mickle.
          </h1>
          <p className="text-xl sm:text-3xl text-foreground/80 max-w-2xl mx-auto mb-3 font-normal tracking-tight">
            £1 a day. S&amp;P 500 exposure. Global.
          </p>
          <p className="text-xs sm:text-sm text-subtle font-mono uppercase tracking-[0.2em] mb-12">
          </p>
          <LandingAuth />
          <div className="flex justify-center mb-12 sm:mb-12">
            <a href="#how" className="text-sm font-mono uppercase tracking-[0.2em] text-muted hover:text-foreground transition">
              How it works ↓
            </a>
          </div>
        </div>

        {/* Time Machine — the hero artifact */}
        <div className="fade-up" style={{ animationDelay: "0.18s" }}>
          <div className="text-center mb-5">
            <span className="text-xs uppercase tracking-[0.2em] text-muted font-mono">
              The Time Machine
            </span>
          </div>
          <div className="glass-strong p-5 sm:p-8">
            <TimeMachine />
          </div>
        </div>
      </section>

      {/* How — vertical, scannable, with icons (review point B) */}
      <section id="how" className="px-4 sm:px-6 py-10 sm:py-14 max-w-3xl mx-auto w-full">
        <div className="text-center mb-8 sm:mb-10">
          <span className="text-xs uppercase tracking-[0.2em] text-muted font-mono">A daily ritual</span>
          <h2 className="text-display text-4xl sm:text-6xl font-bold mt-3">How it works.</h2>
        </div>
        <div className="flex flex-col gap-3">
          <Step n="01" icon="✉" title="Sign in with email" body="A Solana wallet appears in 5 seconds. No seed phrase. No app store." />
          <Step n="02" icon="£" title="Tap once a day for £1" body="Funds route via Jupiter into SPYx — tokenized SPDR S&P 500." />
          <Step n="03" icon="↗" title="Watch consistency compound" body="Live Time Machine. A streak. A daily parable. The opposite of degen." />
        </div>
      </section>

      {/* Why — solid styling, no glass/gradient text. Was rendering invisibly. */}
      <section id="why" className="px-4 sm:px-6 py-10 sm:py-14 max-w-5xl mx-auto w-full relative">
        <div className="max-w-3xl mb-6 sm:mb-10">
          <span className="text-xs uppercase tracking-[0.2em] text-muted font-mono">
            Why on‑chain
          </span>
          <h2 className="text-4xl sm:text-6xl font-extrabold mt-3 mb-6 tracking-tight text-foreground leading-[0.95]">
            This only works on‑chain.
          </h2>
        </div>

        <div
          className="rounded-[18px] p-7 sm:p-10 mb-4 border"
          style={{
            background: "rgba(255,122,89,0.12)",
            borderColor: "rgba(255,122,89,0.28)",
          }}
        >
          <span className="text-[11px] uppercase tracking-[0.22em] font-mono text-foreground/55">
            The unlock
          </span>
          <h3 className="text-2xl sm:text-3xl font-bold tracking-tight mt-2 mb-3 text-foreground">
            £1 fractional S&amp;P, in 60+ countries.
          </h3>
          <p className="text-base sm:text-lg text-foreground/75 leading-relaxed max-w-2xl">
            No brokerage. No minimums. No market hours. Robinhood doesn&apos;t work in Lagos.
            eToro&apos;s spread eats £1 deposits. UK ISAs are tax wrappers. Mickle is the rail.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <Why title="24/7 ritual" body="A daily ritual must work any time. Tokenized equities trade around the clock." />
          <Why title="Portable proof" body="Your streak is a soulbound credential. Composable. Verifiable." />
          <Why title="Aligned revenue" body="Jupiter platform fees scale with use, not with locked assets." />
        </div>
      </section>

      {/* Footer with surfaced legal banner (review point F) — bottom CTA removed (review point D) */}
      <footer className="px-4 sm:px-6 py-12 max-w-6xl mx-auto w-full">
        <div className="rounded-2xl border border-amber-200/60 bg-amber-50/60 backdrop-blur-md px-5 py-3 mb-5 flex items-start gap-3">
          <span className="text-amber-600 text-base leading-none mt-0.5">⚠</span>
          <p className="text-[13px] text-amber-900/80 leading-relaxed">
            Not available to UK or US retail investors. SPYx is issued by Backed Finance under EU prospectus.
            Not investment advice. Past performance is not indicative of future results.
          </p>
        </div>
        <div className="glass-pill px-6 py-3 flex flex-wrap items-center justify-between gap-4 text-sm">
          <span className="text-muted">© Mickle · Every little makes a mickle.</span>
          <div className="flex gap-5 text-subtle">
            <span>Solana</span>
            <span>SPYx</span>
            <span>Jupiter</span>
          </div>
        </div>
      </footer>
    </main>
  );
}

function Step({ n, icon, title, body }: { n: string; icon: string; title: string; body: string }) {
  return (
    <div className="glass p-5 sm:p-6 flex items-start gap-5 fade-up">
      <div
        className="shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center text-2xl font-bold text-white shadow-[0_8px_20px_-4px_rgba(255,122,89,0.4),inset_0_1px_0_rgba(255,255,255,0.4)]"
        style={{ background: "var(--accent)" }}
        aria-hidden
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-mono text-[11px] text-foreground/55 mb-1 tracking-[0.22em] font-semibold">{n}</div>
        <h3 className="text-lg sm:text-xl font-semibold mb-1.5 tracking-tight">{title}</h3>
        <p className="text-[15px] text-foreground/70 leading-relaxed">{body}</p>
      </div>
    </div>
  );
}

function Why({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-[18px] p-6 bg-white/70 border border-foreground/10 backdrop-blur-md">
      <h3 className="text-base font-semibold mb-2 text-foreground tracking-tight">{title}</h3>
      <p className="text-[14px] text-foreground/70 leading-relaxed">{body}</p>
    </div>
  );
}
