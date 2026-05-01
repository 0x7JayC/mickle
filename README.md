# Mickle

> Every little makes a mickle.

DCA into a tokenized S&P basket on Solana. £1 a day. Global. On-chain. Watch consistency compound.

Built for Breakout hackathon. See `../.superstack/idea-context.md` for the full thesis, MVP plan, GTM, risks, and validation sprint.

## Stack

- **Next.js 16** (App Router, Turbopack) + **React 19** + **Tailwind v4**
- **TypeScript**
- Planned integrations (not wired yet — stubs only):
  - **Privy** — embedded wallet (email login, no Phantom required)
  - **Jupiter** — USDC → SPYx routing, server-side batched
  - **Backed Finance / SPYx** — tokenized SPDR S&P 500 ETF on Solana
  - **Solana** — `@solana/web3.js`, compressed NFTs (Bubblegum) for streak milestones

## What ships in v0 (this commit)

- ✅ Landing page with **The Time Machine** — interactive S&P compounding visualization
- ✅ `/dashboard` daily-ritual UI — streak, parable, "Add today's £1" tap
- ✅ Local-storage persistence (so the demo works without a wallet on day 1)
- ⏳ Privy wallet integration
- ⏳ Jupiter swap (server-side batcher)
- ⏳ On-ramp (manual USDC fallback first, fiat partner v1.5)
- ⏳ Streak NFT milestones (cNFT)

## Run

```bash
npm install
npm run dev          # http://localhost:3000
npm run build && npm start
```

## Deploy to Vercel

Vanilla Next.js 16 app. Push to GitHub and import on Vercel — no env vars required for the demo build.

```bash
git add -A
git commit -m "Mickle v0: Time Machine + daily ritual demo"
# Push to GitHub, then 'New Project' on vercel.com
```

Or via CLI:
```bash
npm i -g vercel
vercel
```

## v0 → v1 build order

1. **Wire Privy** — replace localStorage with embedded wallet + Postgres
2. **Wire Jupiter swap** — USDC → SPYx route, single user happy path
3. **Add server-side batcher** — pool daily £1 deposits, execute one swap, distribute pro-rata
4. **Manual USDC deposit** — landing for advanced users while fiat on-ramp is in flight
5. **Streak cNFTs** — milestone mints at day 7 / 30 / 100 / 365
6. **Fiat on-ramp** — Jupiter's MoonPay/Coinbase partner integration

## Important notes

- **Not for UK or US retail.** SPYx is issued by Backed Finance under EU prospectus. Geo-block these on signup.
- **Not investment advice.** Disclose clearly.
- **Frame yourself as integrator, not issuer.** You provide the UX layer; Backed issues the tokenized claim.

## Project structure

```
src/
  app/
    page.tsx          # Landing — Time Machine hero
    app/page.tsx      # Daily ritual page
    layout.tsx
    globals.css
  components/
    TimeMachine.tsx   # The pitch. Design this in Figma before changing logic.
  lib/
    parables.ts       # 30 daily reflections
```

The Time Machine is the product. Everything else is plumbing.
