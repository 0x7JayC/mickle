# Voiceover Recording Guide — Mickle Pitch Deck

Record each clip in order, export as MP3, drop in this folder (`public/audio/`).
**App:** QuickTime → File → New Audio Recording (or GarageBand, Voice Memos, Audacity)
**Pace:** slightly slower than conversational — the visuals carry the detail

---

## Clip 1 — `pd-title.mp3` · ~12 seconds

> "There's an old Scottish proverb: many a mickle makes a muckle.
> Mickle is £1 a day into the S&P 500, on Solana.
> Email login. Tap once a day.
> The patience product crypto doesn't have."

---

## Clip 2 — `pd-problem.mp3` · ~25 seconds

> "I tried to set up a one-pound-a-day investment into the S&P 500
> for someone in my family.
> Robinhood: not available in their country.
> eToro: the spread ate the pound.
> UK ISAs: a tax wrapper, not a product.
> The most boring trade in finance is locked away from billions.
> The rails existed on Solana. Nobody had built it."

---

## Clip 3 — `pd-why-now.mp3` · ~22 seconds

> "Three things had to happen for this product to exist.
> They all happened in the last twelve months.
> Backed Finance's SPYx: tokenised S&P 500, trading on Solana twenty-four seven.
> Privy: email to wallet in five seconds, no seed phrase.
> USDC: moves money globally for free.
> The window opened."

---

## Clip 4 — `pd-solution.mp3` · ~25 seconds

> "Sign in with email.
> A Solana wallet appears in five seconds — no seed phrase.
> Pre-fund your account, then tap once a day for one pound.
> Every day at midnight the treasury batches the cohort into SPYx.
> Day seven, a milestone. Day thirty, the mickle. Day one hundred, the muckle."

---

## Clip 5 — `pd-demo.mp3` · ~30 seconds

> "Everything here is live on mainnet today.
> Email and Apple sign-in. USDC deposits straight to the treasury.
> The daily tap and streak counter.
> Jupiter Ultra routing the cohort swap on-chain.
> Your pro-rata position card, updating live.
> One honest note: we're currently routing to pbUSDC — a yield-bearing USDC vault —
> while we finalise the SPYx whitelist.
> The swap pipeline is proven on-chain."

---

## Clip 6 — `pd-why-on-chain.mp3` · ~22 seconds

> "Strip out the blockchain and three things break.
> Permissionless access — a one-pound deposit from Lagos.
> Robinhood blocks sixty-plus countries.
> Twenty-four-seven settlement — the ritual must work any day, equity markets don't.
> Portable proof — the streak is a soulbound NFT, composable anywhere.
> This product cannot exist on Web2 rails."

---

## Clip 7 — `pd-stack.mp3` · ~20 seconds

> "Privy and CDP for auth and wallet.
> Supabase for the atomic streak ledger.
> Jupiter Ultra for the daily cohort swap — finding routes Swap V1 misses.
> pbUSDC as the live target, SPYx as the production asset.
> Metaplex Core for soulbound milestone NFTs.
> Five days, end to end."

---

## Clip 8 — `pd-ask.mp3` · ~24 seconds

> "Consumer track at Colosseum.
> Three honest revenue legs: deposit fee, cohort float yield, and Streak Premium.
> No token, no airdrop, no points.
> The prize goes toward the Backed Finance whitelist, Privy upgrade, and a security audit.
> Every great mickle began with the smallest possible thing, done one more time."

---

## Scene timing reference

| Clip | File | Start | Duration |
|---|---|---|---|
| 1 · Title | pd-title.mp3 | 0:00 | 12s |
| 2 · Problem | pd-problem.mp3 | 0:12 | 25s |
| 3 · Why Now | pd-why-now.mp3 | 0:37 | 22s |
| 4 · Solution | pd-solution.mp3 | 0:59 | 25s |
| 5 · Demo | pd-demo.mp3 | 1:24 | 30s |
| 6 · Why On-Chain | pd-why-on-chain.mp3 | 1:54 | 22s |
| 7 · Stack | pd-stack.mp3 | 2:16 | 20s |
| 8 · Ask | pd-ask.mp3 | 2:36 | 24s |
| **Total** | | | **3:00** |

## Render

```bash
# Preview with audio (open studio, select PitchDeck)
npm run video:dev

# Render final MP4
npm run video:render:pitchdeck
# → out/pitch-deck.mp4
```
