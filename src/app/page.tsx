import Link from "next/link";
import TimeMachine from "@/components/TimeMachine";

export default function Home() {
  return (
    <main className="flex-1">
      {/* Nav */}
      <nav className="px-6 sm:px-10 py-6 flex items-center justify-between max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-accent" />
          <span className="font-bold text-lg tracking-tight">Mickle</span>
        </div>
        <div className="flex items-center gap-6">
          <a href="#how" className="text-sm text-muted hover:text-foreground transition">
            How it works
          </a>
          <a href="#why" className="text-sm text-muted hover:text-foreground transition hidden sm:inline">
            Why crypto
          </a>
          <Link
            href="/app"
            className="px-4 py-2 text-sm bg-accent text-background font-semibold rounded-lg hover:opacity-90 transition"
          >
            Start
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 sm:px-10 pt-12 sm:pt-20 pb-16 max-w-7xl mx-auto w-full">
        <div className="fade-up">
          <span className="inline-block text-xs uppercase tracking-[0.2em] text-accent font-semibold mb-6">
            The patience product crypto doesn&apos;t have
          </span>
          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tighter leading-[0.95] mb-6">
            Every little
            <br />
            makes a mickle.
          </h1>
          <p className="text-lg sm:text-xl text-muted max-w-2xl mb-10">
            $1 a day into the S&P 500. On Solana. Global. On-chain. Watch what consistency
            actually compounds into.
          </p>
          <div className="flex flex-wrap gap-3 mb-12">
            <Link
              href="/app"
              className="px-6 py-3 bg-accent text-background font-semibold rounded-lg hover:opacity-90 transition"
            >
              Start your streak
            </Link>
            <a
              href="#how"
              className="px-6 py-3 border border-border rounded-lg hover:bg-surface transition"
            >
              How it works
            </a>
          </div>
        </div>

        {/* Time Machine — the hero feature */}
        <div className="fade-up" style={{ animationDelay: "0.15s" }}>
          <div className="text-xs uppercase tracking-[0.2em] text-muted font-mono mb-3">
            The Time Machine
          </div>
          <TimeMachine />
        </div>
      </section>

      {/* How */}
      <section id="how" className="px-6 sm:px-10 py-20 max-w-7xl mx-auto w-full border-t border-border">
        <h2 className="text-3xl sm:text-5xl font-bold tracking-tight mb-12">How it works.</h2>
        <div className="grid sm:grid-cols-3 gap-6">
          <Step
            num="01"
            title="Sign in with email"
            body="A wallet appears in 5 seconds. No seed phrase. No app to install. Powered by embedded wallets."
          />
          <Step
            num="02"
            title="Authorize $1 a day"
            body="Each day you tap once. We route via Jupiter into SPYx — a tokenized SPDR S&P 500 ETF on Solana."
          />
          <Step
            num="03"
            title="Watch consistency compound"
            body="A live Time Machine. A streak. A daily parable. Soulbound proof of discipline. The opposite of degen."
          />
        </div>
      </section>

      {/* Why crypto */}
      <section id="why" className="px-6 sm:px-10 py-20 max-w-7xl mx-auto w-full border-t border-border">
        <h2 className="text-3xl sm:text-5xl font-bold tracking-tight mb-6">
          Why this only works on-chain.
        </h2>
        <p className="text-lg text-muted max-w-3xl mb-10">
          Robinhood doesn&apos;t work in Lagos. eToro charges spreads that eat $1 deposits.
          UK ISAs are tax wrappers. There is no Web2 path to fractional S&P at $1, globally,
          24/7, with portable proof of consistency. We needed crypto to build it.
        </p>
        <div className="grid sm:grid-cols-2 gap-4">
          <Why title="$1 fractional S&P, anywhere" body="Tokenized rails make $1 sizes economically viable in 60+ countries. No brokerage account, no minimums." />
          <Why title="24/7 ritual, not market hours" body="A daily ritual only works if it works any time. Tokenized equities trade around the clock." />
          <Why title="On-chain proof of consistency" body="Your streak is a soulbound credential. Composable, verifiable, portable. A discipline NFT." />
          <Why title="Aligned revenue, no AUM gating" body="Jupiter platform fees mean the product scales with use, not with locked assets." />
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 sm:px-10 py-12 max-w-7xl mx-auto w-full border-t border-border">
        <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-muted">
          <div>© Mickle · Every little makes a mickle.</div>
          <div className="flex gap-6">
            <span>Solana</span>
            <span>Backed Finance · SPYx</span>
            <span>Jupiter</span>
          </div>
        </div>
        <div className="text-xs text-muted/70 mt-4 max-w-3xl">
          Not investment advice. SPYx is issued by Backed Finance under EU prospectus.
          Not available to UK or US retail. Past performance is not indicative of future results.
        </div>
      </footer>
    </main>
  );
}

function Step({ num, title, body }: { num: string; title: string; body: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-6">
      <div className="font-mono text-xs text-accent mb-3 tracking-widest">{num}</div>
      <h3 className="text-lg font-bold mb-2">{title}</h3>
      <p className="text-sm text-muted leading-relaxed">{body}</p>
    </div>
  );
}

function Why({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-6">
      <h3 className="text-base font-bold mb-2 text-accent-2">{title}</h3>
      <p className="text-sm text-muted leading-relaxed">{body}</p>
    </div>
  );
}
