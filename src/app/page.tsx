import Link from "next/link";
import TimeMachine from "@/components/TimeMachine";

export default function Home() {
  return (
    <main className="flex-1">
      {/* Floating glass nav */}
      <nav className="sticky top-4 z-50 px-4 sm:px-6 mt-4">
        <div className="max-w-6xl mx-auto glass-pill px-2 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2 pl-3">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#ff8a6b] to-[#f5b94a] shadow-[0_4px_12px_rgba(255,122,89,0.4)]" />
            <span className="font-semibold text-base tracking-tight">Mickle</span>
          </div>
          <div className="flex items-center gap-1">
            <a href="#how" className="px-4 py-2 text-sm text-muted hover:text-foreground transition rounded-full">
              How
            </a>
            <a href="#why" className="hidden sm:inline px-4 py-2 text-sm text-muted hover:text-foreground transition rounded-full">
              Why on-chain
            </a>
            <Link href="/app" className="glass-button-primary px-5 py-2 text-sm font-semibold ml-1">
              Start
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-4 sm:px-6 pt-16 sm:pt-24 pb-16 max-w-6xl mx-auto w-full">
        <div className="fade-up text-center">
          <span className="inline-block glass-pill px-4 py-1.5 text-xs uppercase tracking-[0.18em] font-semibold text-foreground/70 mb-8">
            The patience product crypto doesn&apos;t have
          </span>
          <h1 className="text-display text-6xl sm:text-8xl font-extrabold leading-[0.95] mb-8">
            Every little
            <br />
            makes a mickle.
          </h1>
          <p className="text-lg sm:text-2xl text-muted max-w-2xl mx-auto mb-12 leading-relaxed">
            $1 a day into the S&P 500. On Solana. Global. On-chain.
            Watch what consistency actually compounds into.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mb-20">
            <Link href="/app" className="glass-button-primary px-7 py-3.5 font-semibold">
              Start your streak →
            </Link>
            <a href="#how" className="glass-button px-7 py-3.5 font-semibold text-foreground">
              How it works
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

      {/* How */}
      <section id="how" className="px-4 sm:px-6 py-24 max-w-6xl mx-auto w-full">
        <div className="text-center mb-14">
          <span className="text-xs uppercase tracking-[0.2em] text-muted font-mono">A daily ritual</span>
          <h2 className="text-display text-4xl sm:text-6xl font-bold mt-3">How it works.</h2>
        </div>
        <div className="grid sm:grid-cols-3 gap-5">
          <Step n="01" title="Sign in with email" body="A wallet appears in 5 seconds. No seed phrase. No app to install." />
          <Step n="02" title="Authorize $1 a day" body="Each day you tap once. Funds route via Jupiter into SPYx — tokenized SPDR S&P 500." />
          <Step n="03" title="Watch consistency compound" body="A live Time Machine. A streak. A daily parable. The opposite of degen." />
        </div>
      </section>

      {/* Why */}
      <section id="why" className="px-4 sm:px-6 py-24 max-w-6xl mx-auto w-full">
        <div className="max-w-3xl mb-12">
          <span className="text-xs uppercase tracking-[0.2em] text-muted font-mono">Why on-chain</span>
          <h2 className="text-display text-4xl sm:text-6xl font-bold mt-3 mb-6">
            This only works on-chain.
          </h2>
          <p className="text-lg sm:text-xl text-muted leading-relaxed">
            Robinhood doesn&apos;t work in Lagos. eToro charges spreads that eat $1 deposits.
            UK ISAs are tax wrappers. There is no Web2 path to fractional S&P at $1, globally,
            24/7, with portable proof of consistency.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 gap-5">
          <Why title="$1 fractional S&P, anywhere" body="Tokenized rails make $1 sizes economically viable in 60+ countries. No brokerage, no minimums." />
          <Why title="24/7 ritual, not market hours" body="A daily ritual must work any time. Tokenized equities trade around the clock." />
          <Why title="Portable proof of consistency" body="Your streak is a soulbound credential. Composable. Verifiable. A discipline NFT." />
          <Why title="Aligned revenue, no AUM gating" body="Jupiter platform fees scale with use, not with locked assets." />
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 sm:px-6 pt-12 pb-20 max-w-4xl mx-auto w-full">
        <div className="glass-strong p-10 sm:p-16 text-center">
          <h2 className="text-display text-4xl sm:text-6xl font-bold mb-5">
            Start with $1.
          </h2>
          <p className="text-lg text-muted max-w-xl mx-auto mb-8">
            Every great mickle began with the smallest possible thing, done one more time.
          </p>
          <Link href="/app" className="glass-button-primary inline-flex px-8 py-4 font-semibold">
            Begin your streak →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 sm:px-6 py-12 max-w-6xl mx-auto w-full">
        <div className="glass-pill px-6 py-3 flex flex-wrap items-center justify-between gap-4 text-sm">
          <span className="text-muted">© Mickle · Every little makes a mickle.</span>
          <div className="flex gap-5 text-subtle">
            <span>Solana</span>
            <span>SPYx</span>
            <span>Jupiter</span>
          </div>
        </div>
        <div className="text-xs text-subtle mt-4 max-w-3xl mx-auto px-2 leading-relaxed">
          Not investment advice. SPYx is issued by Backed Finance under EU prospectus.
          Not available to UK or US retail. Past performance is not indicative of future results.
        </div>
      </footer>
    </main>
  );
}

function Step({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <div className="glass p-7 fade-up">
      <div className="font-mono text-xs text-accent mb-4 tracking-[0.2em] font-semibold">{n}</div>
      <h3 className="text-xl font-semibold mb-2 tracking-tight">{title}</h3>
      <p className="text-[15px] text-muted leading-relaxed">{body}</p>
    </div>
  );
}

function Why({ title, body }: { title: string; body: string }) {
  return (
    <div className="glass p-7">
      <h3 className="text-base font-semibold mb-2 text-foreground tracking-tight">{title}</h3>
      <p className="text-[15px] text-muted leading-relaxed">{body}</p>
    </div>
  );
}
