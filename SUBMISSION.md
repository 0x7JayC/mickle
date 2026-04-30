# Colosseum Submission · Mickle

Track target: **Consumer**.

Live demo: **https://mickle-gamma.vercel.app**

---

## 1. Project name

**Mickle**

## 2. Tagline (one-liner, ≤100 chars)

Every little makes a mickle. $1 a day into the S&P 500. On Solana. Global.

## 3. Short description (≤280 chars, like a tweet)

Mickle is a daily ritual: $1 a day into the tokenized S&P 500 on Solana. Email login, no seed phrase, 60+ countries. The patience product crypto doesn't have. Many a mickle makes a muckle.

## 4. Long description (markdown)

> Paste this into Colosseum Arena's "Description" field.

### What Mickle is

Mickle is the daily-ritual investment app crypto doesn't have. One tap, once a day, £1 routes into the S&P 500 on Solana. No seed phrases, no app store, no minimums, no market hours.

### The problem

I tried to set up a $1-a-day DCA into the S&P 500 for someone in my family. Robinhood doesn't open accounts in their country. eToro's spread eats the dollar. UK ISAs are tax wrappers, not products. **There is no Web2 path to fractional S&P at $1, globally, 24/7.** The most boring trade in finance is locked away from billions of people.

### Why now

Three rails matured in the last twelve months:

1. **Tokenized SPY went live on Solana.** Backed Finance's `SPYx` (mint `XsoCS1TfEyfFhfvj8EtZ528L3CaKBDBRqRapnBbDF2W`) trades 24/7 under EU prospectus.
2. **Privy embedded wallets.** A non-crypto user gets a Solana wallet from their email in 5 seconds. No seed phrase.
3. **Stablecoins matured globally.** USDC moves a dollar from Lagos to Solana for free.

The window for this product opened in the last year. Before that it was impossible.

### How it works

```
Sign in with email / Apple / Google
        ↓ Privy provisions a Solana embedded wallet (5s)
Pre-fund £10 / £30 / £90
        ↓ Open Banking → USDC on Solana (1% on-ramp)
Tap once a day for £1
        ↓ Atomic Postgres RPC: insert tap + bump streak
Daily treasury batch (Vercel cron, 00:05 UTC)
        ↓ One Jupiter swap for the cohort, USDC → SPYx
Pooled position, pro-rata share
        ↓ Live SPYx balance × Jupiter price API v3
Day 7 / 30 / 100 streaks → soulbound NFT (Metaplex Core)
```

### What's live (demo)

- **Email / Apple / Google / Phantom / Backpack / Solflare** sign-in via Privy.
- **Live SPYx position** — Solana RPC `getTokenAccountsByOwner` × Jupiter Price API v3, refreshed every 30s.
- **Daily ritual** — £1 tap inserted atomically into the ledger; streak counter bumps via a single Postgres RPC. Idempotent (same-day taps no-op).
- **GBP top-up** — Transak hosted widget for Open Banking GBP → USDC on Solana. Demo mode by default; production adds a Kraken-treasury path documented in `MONEY.md`.
- **Daily treasury swap engine** — Vercel cron at 00:05 UTC pulls yesterday's unbatched taps, fetches a real Jupiter v1 quote for the cohort, optionally executes the swap with a treasury keypair, writes a `swap_batches` row, links the taps. Dashboard shows the most recent batch.
- **Streak milestones** — Day 7 (Week one 🌱), Day 30 (The mickle 🔥), Day 100 (The muckle 💎). Soulbound NFT row emitted by the same Postgres function that records the tap. Demo-mode address; full Metaplex Core mint is a single post-tap callback once the treasury is funded.
- **Activity feed** — merged chronological view of taps, deposits, milestones, and treasury batches.
- **iOS app** — Capacitor shell wraps the live web app, full safe-area support, FaceID-ready Apple Sign In.
- **PWA** — Add-to-Home-Screen on any iPhone Safari, custom coral gem icon.

### Demo flow (90 seconds)

1. Sign in with Apple — Solana wallet appears.
2. Top up £30 (demo mode) — contributed jumps to £30.
3. Tap £1 — streak goes 0 → 1, parable updates.
4. Hit "Day 7" in the demo panel → 🌱 celebration → milestone earned card.
5. Hit "Day 30" → 🔥 celebration → "The mickle" earned.
6. Hit "Day 100" → 💎 celebration.
7. Open Activity → every event back-read in order, with timestamps and amounts.
8. Watch the Time Machine project the user's actual contribution forward 1 / 2 / 3 / 5 / 10 years.

### Why on-chain (the necessity test)

Strip out the blockchain and three things break:

- **Permissionless access** — a £1 deposit from Lagos. Robinhood says no in 60+ countries.
- **24/7 settlement** — the ritual must work any day. Equity markets don't.
- **Portable proof** — the streak is a soulbound credential. A vendor-locked badge isn't.

This product literally cannot exist on Web2 rails.

### Stack

| Layer | Choice |
|---|---|
| Auth + wallet | Privy (email · Apple · Google · Phantom · Backpack · Solflare) |
| Database + state | Supabase (Postgres + RLS, atomic record_tap RPC) |
| Price feed | Jupiter Price API v3 |
| Swap | Jupiter Swap API v1, Vercel cron |
| Asset | Backed Finance `SPYx` (Solana) |
| Milestones | Metaplex Core (planned mint, schema-ready) |
| iOS | Capacitor + Xcode |
| Frontend | Next.js 16 (App Router, Turbopack) + Tailwind v4 |
| Hosting | Vercel |

### What's not done (honest list)

- **Real Metaplex Core mint** — schema and demo-mode hooks done; treasury keypair + on-chain mint deferred until a funded mainnet treasury is in place.
- **Production deposits** — Transak demo mode shipped. Production architecture (Open Banking → Kraken Pro corporate treasury → Solana withdrawal) documented in `MONEY.md` but blocked on EMI partnership (Griffin / Modulr).
- **Fiat off-ramp** — deferred to v2. Adds another KYC layer.
- **GBP withdrawal** — same.
- **Push notifications** — out of scope for the hackathon window.

### Repo

GitHub: `https://github.com/0x7JayC/mickle`

Key files:
- `BUILD_PROPOSAL.md` — 5-day plan, what shipped each day.
- `MONEY.md` — production money architecture (Open Banking → Kraken Pro → Solana).
- `MOBILE.md` — iOS app via Capacitor.
- `DESIGN.md` — Apple-discipline design rules applied (single coral accent, 17px body, no decorative gradients).
- `AGENTS.md` — collaboration norms / project conventions.

---

## 5. 3-minute pitch script (video voiceover)

> Filming notes: shoot a clean screen recording of `mickle-gamma.vercel.app` in mobile-frame on the left, you on the right. The fast-forward demo panel makes the streak journey fit in under 90 seconds — leaves room for the pitch.

### 0:00 – 0:15 · The hook

> *"There's an old Scottish proverb: many a mickle makes a muckle. Lots of small things, quietly compounding, become a big thing. That's the entire pitch."*
>
> *"Mickle is one pound a day into the S&P 500, on Solana. Email login. Tap once a day. Watch what consistency actually compounds into."*

### 0:15 – 0:45 · The problem

> *"I tried to set up a one-pound-a-day DCA for someone in my family. Robinhood: not available in their country. eToro's spread eats the dollar. UK ISAs are tax wrappers, not products. The most boring trade in finance — buying the index — is locked away from billions of people. The rails for this exist on Solana. Nobody had built it."*

### 0:45 – 1:30 · The solution + live demo

> *"Sign in with Apple. Solana wallet appears in five seconds, no seed phrase. Top up — Open Banking, no minimums. Tap once a day. £1 goes into the S&P 500."*
>
> [Show demo panel: jump to Day 7, then Day 30, then Day 100. Celebration overlays fire.]
>
> *"Day seven. Day thirty. Day a hundred. Each milestone is a soulbound NFT — a discipline credential. Open Activity, you can see every tap, every batch, every milestone, in order — this is a real ledger."*

### 1:30 – 2:15 · Why on-chain

> *"Strip out the blockchain and three things break. Permissionless access — a £1 deposit from Lagos. Twenty-four-seven settlement — the ritual works any day. Portable proof — the streak is composable, vendor-locked badges aren't. This product literally cannot exist on Web2 rails."*
>
> *"Why now? Three rails matured in the last twelve months. Backed's SPYx — tokenized SPDR S&P 500, trading on Solana right now. Privy embedded wallets — five seconds, no seed. USDC matured globally. The window opened in the last year."*

### 2:15 – 2:45 · The build

> *"Five days, end-to-end. Privy auth, Supabase ledger with atomic streak RPCs, Jupiter quote and swap, daily Vercel cron for the treasury batch, Metaplex Core schema for the milestone NFTs. Live web. iPhone app via Capacitor. Apple-discipline design throughout."*
>
> *"What's not real yet: a funded mainnet treasury, EMI partnership for production deposits. Both planned, both documented in MONEY.md."*

### 2:45 – 3:00 · The ask + closing line

> *"This is the patience product Solana doesn't have. We're submitting to the Consumer track."*
>
> *"Every great mickle began with the smallest possible thing, done one more time."*

Total: 180 seconds.

---

## Generated assets

| Asset | File | Regen command |
|---|---|---|
| Cover image (OG / Arena cover slot) | `public/cover.png` (1200×630), `public/cover@2x.png` (2400×1260) | `npm run cover` |
| App icons (PWA · Apple Touch · favicon) | `public/icon-{192,512}.png`, `apple-touch-icon.png`, `favicon-32.png` | `npm run icons` |
| Pitch deck PDF | `pitch-deck-YYYYMMDD-HHMMSS.pdf` (next to the HTML source) | `npm run deck:pdf` |

## 6. Submission checklist

Use this when filling out [arena.colosseum.com](https://arena.colosseum.com).

- [ ] **Project name:** Mickle
- [ ] **One-liner:** Every little makes a mickle. $1/day into the S&P 500. Solana. Global.
- [ ] **Description:** paste section 4 (long description) above
- [ ] **Track:** Consumer (primary), DeFi/RWA (secondary)
- [ ] **Demo video:** record per script in section 5, upload to YouTube as **unlisted**, paste URL
- [ ] **Pitch deck:** export `pitch-deck-20260430-092308.html` to PDF (`npx playwright-pdf` or print → PDF), upload
- [ ] **GitHub repo URL:** `https://github.com/0x7JayC/mickle`
- [ ] **Live demo URL:** `https://mickle-gamma.vercel.app`
- [ ] **iOS demo (optional):** screen recording of the Capacitor build in iPhone simulator
- [ ] **Team:** Jay Chen — `j.chen@wec-uk.org`
- [ ] **Twitter / socials:** add if you have a project handle
- [ ] **Logo:** export `public/icon-512.png`
- [ ] **Cover image:** screenshot of the Time Machine card on landing
- [ ] **Confirm:** `ALLOW_DEMO_CHEAT=true` is on in Vercel production so judges can use the fast-forward panel

## 7. Pre-submission sanity checks (run these once before submitting)

| Check | How |
|---|---|
| Live URL loads | `curl -I https://mickle-gamma.vercel.app` returns 200 |
| Demo panel visible | Sign in, see "Demo · Jump to" panel bottom-right of `/app` |
| Tap → streak bumps | Click £1 button, streak goes 0 → 1 |
| Demo top-up records | Open Top up, simulate £30, Contributed shows £30.00 |
| Day 7 celebration fires | Click "Day 7" in panel, see 🌱 overlay |
| Activity feed populates | Open Activity drawer, see all events with timestamps |
| iOS PWA install works | Safari → Share → Add to Home Screen → coral gem icon appears |
| Build is green | `npx next build` finishes with no errors |
| No console errors | Open DevTools on `/app`, no red entries |

## 8. Q&A prep (top 3 likely judge questions)

**Q: Why doesn't Backed Finance just build this themselves?**
A: Backed is an issuer of tokenized equities — they're a regulated bridge between TradFi and on-chain. They're not a consumer-product team. Mickle is a customer of Backed's `SPYx`, not a competitor. Goal is partnership.

**Q: What happens in a bear market?**
A: DCA mathematically wins in bear markets — that's the whole reason it exists. The product narrative is *literally* designed for them; that's when streaks get sticky and the patience story resonates loudest.

**Q: Why does this need a token?**
A: It doesn't. Mickle has no token, no points, no airdrop. Revenue is the 0.99% deposit fee plus a small slice of Jupiter platform fees — scaling with use, not with locked assets, not with token speculation.

---

## 9. Post-submission (after winning the Consumer track)

In rough priority:

1. **EMI partnership** — Griffin or Modulr — to enable real GBP deposits.
2. **Treasury keypair + Metaplex Core mint** — turn `demo:` asset addresses into real on-chain NFTs.
3. **Backed Finance partnership conversation** — direct redemption flow for the treasury position.
4. **Privy upgrade** past the 1k MAW free tier.
5. **Security audit** before the first £1 of real user funds touches the treasury.
