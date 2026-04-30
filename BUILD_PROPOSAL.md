# Mickle — Build Proposal

Real-time dashboard for the daily-$1 ritual. Goal: ship a working end-to-end loop (login → deposit → daily tap → live position → milestone NFT) in ~5 working days.

## Stack

| Layer | Choice | Why |
|---|---|---|
| Auth + wallet | **Privy** (email → embedded Solana wallet) | No seed phrases; users never see crypto UX. |
| DB + realtime | **Supabase** (Postgres + Realtime + RLS) | Streak/deposit rows push live to the dashboard for free. |
| Price feed | **Jupiter Price API v3** (free, no key) + **Pyth Hermes** for SPY underlying | Jupiter for SPL token USD; Pyth for the equity peg. |
| Swap | **Jupiter Swap API** (server-side, batched) | One swap per cohort/day, not per tap. |
| NFT milestones | **Metaplex Core** (`@metaplex-foundation/mpl-core`) | Single-instruction mint, ~80% cheaper than Token Metadata, no Merkle tree. |
| Fiat on-ramp | **Transak** (Open Banking GBP → USDC, Solana) | Hosted widget; bank-transfer fee ~1%. Card ~3%. |

## Data model (Supabase)

```sql
users (
  id uuid pk,
  privy_id text unique,
  wallet text unique,
  streak_count int default 0,
  last_tap_date date,
  created_at timestamptz
)

deposits (
  id uuid pk,
  user_id uuid fk,
  amount_usdc numeric,
  tx_sig text,
  created_at timestamptz
)

taps (
  id uuid pk,
  user_id uuid fk,
  tap_date date,
  amount_usdc numeric default 1,
  swap_batch_id uuid null,
  unique (user_id, tap_date)
)

swap_batches (
  id uuid pk,
  executed_at timestamptz,
  total_usdc numeric,
  spyx_received numeric,
  tx_sig text
)

milestones (
  id uuid pk,
  user_id uuid fk,
  kind text,            -- 'day_30', 'day_100', ...
  asset_address text,   -- Metaplex Core asset
  minted_at timestamptz
)
```

RLS: users can read only their own rows. Server (service role) writes deposits/taps/batches/milestones.

## Dashboard data sources

| What user sees | Source | Build cost |
|---|---|---|
| Wallet (email-derived) | Privy SDK | ½ day |
| Live SPYx balance | Solana RPC `getTokenAccountsByOwner` | 2 h |
| Live position value ($) | SPYx balance × Jupiter v3 | 2 h |
| Total contributed | Supabase `deposits` (Realtime) | 4 h |
| Streak (cross-device) | Supabase `users.streak_count` | 2 h |
| Today's $1 status | Supabase `users.last_tap_date` | 1 h |
| Time Machine from real principal | already built — feed live value | 30 min |
| Daily parable | static | done |
| Upcoming milestone (day 30 → NFT) | Supabase + Metaplex Core mint | ½ day |
| Deposit £ → SPYx (auto‑swap) | Transak hosted widget | ½ day |
| Execute swap on tap | Jupiter API, server-side daily batch | 1 day |

**Total: ~5 working days.**

## Build order

1. **Day 1 — Foundations.** Privy auth, Supabase project, schema + RLS, replace mock landing with logged-in dashboard shell. Wire wallet address + empty state.
2. **Day 2 — Live position.** RPC balance read, Jupiter price fetch, position value card. Feed real principal into the existing Time Machine.
3. **Day 3 — The ritual.** Tap action → insert into `taps`, update `users.streak_count` + `last_tap_date` in a single RPC. Realtime subscription updates the streak card. Solana Pay QR deposit flow writes to `deposits`.
4. **Day 4 — The swap engine.** Cron (Vercel) runs daily: aggregate yesterday's taps, execute one Jupiter swap with the treasury wallet, write `swap_batches`, distribute SPYx pro-rata. Or: skip pro-rata for v1 and treat the treasury as the position-of-record (simpler, ship faster).
5. **Day 5 — Milestones + polish.** Day-30 streak → Metaplex Core mint to user wallet, milestone card in dashboard, Realtime toast on mint. Decide one palette, remove `/compare` + switcher.

## Money flow (GBP-first, crypto invisible)

The user only ever sees GBP. USDC and SPYx are invisible plumbing.

```
£10 / £30 / £90 top-up
        ↓
  Open Banking (Transak)         ~1% on-ramp fee
        ↓
   USDC on Solana
        ↓
   Internal ledger: each £1 tap debits user balance, no on-chain tx
        ↓
   Daily treasury swap (one Jupiter trade for the cohort)   ~0.1% + slippage
        ↓
   SPYx position (pooled, user sees their share)
        ↓
   On withdrawal: SPYx → USDC → Open Banking GBP-out          ~1% off-ramp
```

**Why batch?** A £1 → USDC swap costs more in on-chain + on-ramp fees than the deposit itself. Pre-funding 30 / 90 days at once amortises the ~1% on-ramp across 30–90 taps.

## Fees

**Headline: 0.99% per deposit. No subscriptions. No exit fee.**

One number, one sentence. Survivable for Mickle, undercuts every consumer crypto app, comparable to Trading 212's 0.15% FX (we're more expensive but our product is fundamentally different — fractional global access, not zero-fee broker race).

**Hard costs absorbed:**

| Component | Cost | Notes |
|---|---|---|
| On-ramp (Transak Open Banking) | ~1.0% | Charged once per top-up, not per tap |
| Jupiter swap | ~0.1% | Plus pool slippage ~0.1–0.3% |
| Mickle margin | ~0.5% | What's left after the above |
| **User-visible fee** | **0.99%** | Single line, no asterisks |

For comparison:
- Robinhood: 0% commission + ~0.6% FX margin (UK users effectively pay ~0.6%)
- Trading 212: 0.15% FX (UK)
- Revolut free: 1.49% on stocks
- Coinbase retail: 1.49% spread
- MoonPay card: 3.99–4.99%

## Open decisions

- **Pooled vs per-user position.** Pooled (treasury holds all SPYx, users see their share) is dramatically simpler and avoids per-tap on-chain cost. Per-user requires a swap per tap or a complex distribution. **Recommend pooled for v1.**
- **Devnet vs mainnet for the demo.** Devnet has no SPYx liquidity. Either mainnet with tiny amounts, or mock the swap and surface real Jupiter quotes.
- **Custodial treasury wallet.** Needs a secure key (Privy server wallet, Turnkey, or Squads multisig). Privy server wallets are the lowest-friction.

## Out of scope (v1)

Push notifications, social/leaderboards, multi-asset baskets, GBP withdrawal flow (Transak supports it but adds KYC friction; ship deposit only for the hackathon demo).
