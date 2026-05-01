# Mickle — Money Architecture

How GBP becomes SPYx exposure. Hackathon demo path vs production path, with the math.

## The core problem

A £1 daily deposit cannot economically use a hosted on-ramp (Transak / MoonPay / Ramp). They have flat-fee floors (typically £1–£3 per transaction) and £10–30 minimums. At £1/day, the fee floor alone destroys the deposit.

The solution is **never on-ramp per-user, per-tap.** Aggregate at the treasury and amortise the on-ramp cost across the whole cohort.

## v0 — crypto wallet path (what's shipped today)

The earliest viable path skips fiat entirely. Users who already hold USDC on Solana sign an SPL transfer from their wallet (Privy embedded or external) directly into the Mickle treasury. No EMI, no on-ramp, no FCA exposure.

```
User → Privy embedded wallet (or any Solana wallet)
       Signs USDC SPL transfer → NEXT_PUBLIC_MICKLE_TREASURY
                       ↓
   Client posts { amount_gbp, tx_sig } to /api/deposits
                       ↓
   Server records deposit in ledger (USDC equivalent of GBP preset)
                       ↓
   Daily streak tap debits ledger → cohort swap → SPYx
```

**Treasury address (current):** `9THd4U9orQUVcmng636ELmNnuSEkUdYivWRdMrhVWnqM`

**Why ship this first:**
- Zero regulatory surface — Mickle never custodies fiat.
- Crypto-native users can deposit in seconds; no KYC re-prompt.
- The ledger and daily-swap engine are exercised end-to-end on real funds, so when fiat on-ramps land later they plug into a proven pipeline.

**What's deferred:**
- GBP→USDC FX rate is read from a public quote (Coingecko / Jupiter) at deposit time and stored alongside the ledger row. Fee remains 0.99% on the GBP-quoted amount.
- Fiat on-ramp (Transak / Open Banking) is the next path, layered on top of the same ledger.

## Hackathon demo architecture (what's shipped)

```
User → Transak hosted widget (£10 / £30 / £90 preset)
       Open Banking GBP → USDC on Solana wallet
       ~1% on-ramp fee, charged once per top-up
                       ↓
   Internal ledger: each daily tap debits user's USDC balance
                       ↓
   Daily treasury swap: one Jupiter trade for the cohort
                       ↓
   Pooled SPYx position; user sees their pro-rata share
```

**Why it works for the demo:** £30 minimum amortises Transak's ~1% fee. Judges see a working end-to-end loop. No FCA registration needed because Transak is the regulated entity.

**Why it doesn't work at scale:**
- Transak's 1% on-ramp + min fee makes any deposit under £10 uneconomic
- Per-user transaction friction (KYC re-prompt, popup, wait for settlement)
- Margin is squeezed: if Mickle wants 0.5% margin, the user pays 1.5% effective
- No path to true £1/day — the "ritual" promise is structurally broken

## Production architecture (target)

```
User → Mickle GBP business account
       Open Banking direct debit / variable recurring payment
       (TrueLayer / GoCardless / Stripe Open Banking)
       ~£0.20 flat OR free per deposit
                       ↓
   Mickle batches all users' deposits daily
                       ↓
   Corporate CEX (Kraken Pro / Coinbase Advanced)
     • GBP → USDC at 0.16–0.26% taker
     • One withdrawal per day to Solana treasury (~$1 flat)
                       ↓
   Solana treasury → Jupiter swap → SPYx
                       ↓
   Pooled position; user share tracked in Mickle's ledger
```

### Cost breakdown — production

| Layer | Provider | Fee |
|---|---|---|
| GBP collection | TrueLayer / GoCardless / Stripe Open Banking | £0.20 flat per deposit |
| FX + USDC purchase | Kraken Pro (taker) | 0.16% |
| Solana withdrawal | Kraken | ~$1 flat (amortised across cohort) |
| Jupiter swap | Jupiter | 0.10% |
| Slippage buffer | — | 0.10–0.30% |

### Honest unit economics — why one revenue leg isn't enough

| Top-up | Hard cost | 0.99% revenue | Net per top-up |
|---|---|---|---|
| £10 | £0.26 | £0.10 | **−£0.16** |
| £30 | £0.35 | £0.30 | **−£0.05** |
| £90 | £0.62 | £0.89 | **+£0.27** |

The flat £0.20 Open Banking fee crushes anything below ~£35. Plus per-user
KYC at signup is ~£1.50 (Onfido/Veriff), which at 30% deposit-conversion
pencils to ~£5 effective customer-acquisition cost. The 0.99% transaction
fee alone cannot recover that on a £1/day cadence.

Every successful UK peer has reached the same conclusion. Acorns moved
to a $3–9/month subscription. Plum charges £2.99/month. Moneybox £1/month
+ 0.45% AUM. Trading 212 makes its money on FX margin + stock lending +
cash interest, not transaction fees.

## Revenue model — three legs, single 0.99% headline

The user-visible price stays **0.99% per deposit, no subscription**. Behind it:

### Leg 1 — Deposit fee (the headline)

0.99% on every top-up. £10–£25 deposits subsidise themselves; £30+ deposits
are net positive at ~£0.05–£0.50 per transaction. This is the line in the
deck and on the deposit modal.

### Leg 2 — Float yield (the silent leg)

Between the moment USDC lands in the Mickle treasury and the moment the
daily swap converts it to SPYx, the balance earns yield. On Solana,
**Kamino USDC vaults pay ~4.5% APY** as of April 2026 (verifiable on
DeFiLlama). At £10M of float, that's ~£450k/year of pure income with
no user-facing change.

This does not contradict "no AUM gating" — Mickle never charges the user
for keeping their position. Yield is captured on the *cohort float* (the
buffer between deposit and swap), which is Mickle's working capital, not
the user's invested principal.

| Float scale | Annual yield (4.5% APY) |
|---|---|
| £100k | £4.5k |
| £1M | £45k |
| £10M | £450k |
| £100M | £4.5M |

This is the leg that makes the model investable.

### Leg 3 — Streak Premium (optional subscription, not in v1 UI)

A future tier — **£0.99/month** — unlocks once a user has contributed
more than £30 lifetime. Premium adds:
- Push reminders (so the streak doesn't break)
- Multi-asset baskets (S&P 500 + tokenized gold + tokenized treasuries)
- Tax-year CSV export
- Early-access milestone NFTs

Same shape as Plum / Moneybox premium. Locks in a per-user revenue floor
once the user is engaged, without any change to the daily ritual itself.

### Combined LTV at 12 months (modelled)

Assumptions: avg user tops up £30 × 4 / year, 30% subscribe to Streak
Premium after first £30, average float held = 30 days × daily contribution.

| Source | Per-user / year |
|---|---|
| Deposit fees (4 × £30 × 0.99%) | £1.19 |
| Float yield (avg £15 held × 4.5% × 12mo) | £0.81 |
| Streak Premium (30% × £11.88) | £3.56 |
| **Total per-user / year** | **£5.56** |
| Hard CAC (KYC + variable) | £5.00 |
| **Net LTV — year 1** | **£0.56** |

Year 1 break-even, net-positive in year 2 onwards. The model only works
because of leg 2 (float yield) and leg 3 (subscription). Leg 1 alone is
underwater for the target audience.

### CEX provider comparison (April 2026)

| Provider | GBP FPS deposit | GBP→USDC | Solana USDC withdrawal | Notes |
|---|---|---|---|---|
| **Kraken Pro** | Free | 0.16–0.26% | ~$1 | UK-friendly, FCA registered. Recommended primary. |
| **Coinbase Advanced** | Free | 0.0–0.6% (volume tiers) | ~$1.50 | Higher base fee for low volume. |
| **Bybit** | Free FPS | 0.10% | ~$1 | Cheapest taker. UK access uncertain post-FCA changes. |
| **Binance UK** | Restricted to existing users | — | — | Skip for new UK accounts. |
| **Gemini** | Free | 0.0–0.4% | ~$1.50 | Solid backup. |

**Recommendation:** primary on Kraken Pro, secondary on Coinbase Advanced for redundancy. Avoid Bybit/Binance for UK regulatory reasons.

### Coinbase / Kraken as identity (future)

Distinct from the treasury role above. Once we're past EMI partnership, add **Sign in with Coinbase** and **Sign in with Kraken** as Privy OAuth identity providers (not wallet connectors).

Why it matters:
- ~10M users already have a verified Coinbase account with £/$ on it.
- After OAuth they grant a read-scope token; Mickle sees "user has £200 idle on Coinbase."
- Deposit shortcut: "Wire £30 from your Coinbase balance directly to Mickle — no Open Banking step." Coinbase Advanced supports outbound bank-to-third-party crypto withdrawals via internal transfer, sub-1% all-in.
- Same shape for Kraken (more UK-native, FCA registered).

Implementation order: ship after Privy + EMI are live. Privy supports custom OAuth providers via the `customAuth` config — Coinbase OAuth flow is documented at coinbase.com/cloud/products/sign-in. Kraken does not have a public OAuth flow today; would require partnership.

## Regulatory layer (the actual blocker)

The moment Mickle holds user GBP for any duration, you are subject to FCA Electronic Money Institution (EMI) rules.

Three paths:

| Path | Cost | Time | When right |
|---|---|---|---|
| **1. Small EMI registration** | ~£15k + ongoing compliance | ~6 months | Once you've validated demand |
| **2. EMI-as-a-Service** | Revenue share / monthly | 4–8 weeks | Right after hackathon win or seed round |
| **3. Stay under safeguarding thresholds** | Small EMI only | — | Bootstrapped path: avg balance < £5M, max £15k per user |

**EMI-as-a-Service providers (UK):**

- **Griffin** — modern API-first bank-as-a-service, FCA full bank licence, designed for fintechs
- **Modulr** — established, EMI licence, good for payments-heavy products
- **ClearBank** — clearing bank, used by Tide, Revolut Business, Coinbase
- **Currencycloud** (Visa-owned) — strong on FX, good for cross-border
- **Railsr** — EMI + cards, breadth of features

Recommendation: **Griffin** — they're the closest cultural fit (API-first, fintech-native) and have explicitly hosted crypto-adjacent products in the past. Modulr is the safe-pair-of-hands alternative.

## Decision log

- **2026-05-01** — shipped v0 wallet path (USDC SPL transfer → Mickle treasury) ahead of any fiat on-ramp. Rationale: zero regulatory surface, exercises ledger + swap end-to-end on real funds, and crypto-native users can deposit without KYC friction. Transak / Open Banking layered on top later.
- **2026-04-30** — chose Transak for the hackathon demo. Production path documented here. EMI partnership conversation deferred until Mickle wins the Colosseum Consumer track or raises seed.
- **2026-04-30** — pooled treasury (one position, pro-rata share) chosen over per-user positions to keep on-chain costs viable at small deposit sizes.
- **2026-04-30** — moved from a single-leg 0.99% transaction-fee model to the three-leg revenue model above (deposit fee + float yield + Streak Premium). The single-leg model was structurally underwater at £10–£25 top-ups; without leg 2 (float yield via Kamino USDC vaults) and leg 3 (£0.99/mo Streak Premium), Mickle could not recover hard CAC on its target audience. Reframes the deck's "no AUM gating" line — yield is captured on cohort *float* (working capital), never on the user's invested principal.

## Open questions

- **Safeguarding ledger.** Even pre-EMI, holding user funds means a safeguarding ledger (segregated trust account at a bank). Griffin handles this; otherwise need Tide / Allica / Mettle business banking + manual reconciliation.
- **VAT on the 0.99% fee.** UK VAT treatment of crypto-related platform fees is unsettled. Worth checking with HMRC / a crypto-savvy accountant before charging real users.
- **Withdrawal flow.** Off-ramp adds another KYC + EMI step. v1 is deposit-only; ship withdrawal as a v2 feature once an EMI partner is live.
- **Tax reporting.** SPYx is an equity-tracked instrument. UK users will need a transaction record for self-assessment; Mickle should generate a CSV per tax year from the ledger.
