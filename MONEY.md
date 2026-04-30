# Mickle — Money Architecture

How GBP becomes SPYx exposure. Hackathon demo path vs production path, with the math.

## The core problem

A £1 daily deposit cannot economically use a hosted on-ramp (Transak / MoonPay / Ramp). They have flat-fee floors (typically £1–£3 per transaction) and £10–30 minimums. At £1/day, the fee floor alone destroys the deposit.

The solution is **never on-ramp per-user, per-tap.** Aggregate at the treasury and amortise the on-ramp cost across the whole cohort.

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
| GBP collection | TrueLayer / GoCardless / Stripe Open Banking | £0–£0.20 per deposit |
| FX + USDC purchase | Kraken Pro (taker) | 0.16% |
| Solana withdrawal | Kraken | ~$1 flat (amortised across cohort) |
| Jupiter swap | Jupiter | 0.10% |
| Slippage buffer | — | 0.10–0.30% |
| **Mickle margin** | — | **0.50–0.70%** |
| **User-visible fee** | — | **0.99%** (single line, no asterisks) |

This is the maths that lets Mickle hit a true 0.99% on £1/day at scale.

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

- **2026-04-30** — chose Transak for the hackathon demo. Production path documented here. EMI partnership conversation deferred until Mickle wins the Colosseum Consumer track or raises seed.
- **2026-04-30** — pooled treasury (one position, pro-rata share) chosen over per-user positions to keep on-chain costs viable at small deposit sizes.

## Open questions

- **Safeguarding ledger.** Even pre-EMI, holding user funds means a safeguarding ledger (segregated trust account at a bank). Griffin handles this; otherwise need Tide / Allica / Mettle business banking + manual reconciliation.
- **VAT on the 0.99% fee.** UK VAT treatment of crypto-related platform fees is unsettled. Worth checking with HMRC / a crypto-savvy accountant before charging real users.
- **Withdrawal flow.** Off-ramp adds another KYC + EMI step. v1 is deposit-only; ship withdrawal as a v2 feature once an EMI partner is live.
- **Tax reporting.** SPYx is an equity-tracked instrument. UK users will need a transaction record for self-assessment; Mickle should generate a CSV per tax year from the ledger.
