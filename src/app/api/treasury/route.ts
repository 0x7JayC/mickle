// Public treasury stats. No auth — this is the transparency page.
// Aggregates the cohort: total taps, total contributed, total swapped,
// recent batches. All numbers are derived from Supabase (ledger) and
// live RPC reads of the treasury wallet — no modelled / aspirational
// figures are surfaced here.

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";
// Cache for 30s — on-chain reads are cheap but the cohort aggregates aren't.
export const revalidate = 30;

const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
const RPC = process.env.NEXT_PUBLIC_SOLANA_RPC || "https://api.mainnet-beta.solana.com";
const TREASURY = process.env.NEXT_PUBLIC_MICKLE_TREASURY || "";
const SPYX_MINT = process.env.NEXT_PUBLIC_SPYX_MINT || "";

async function rpc<T>(method: string, params: unknown[]): Promise<T | null> {
  try {
    const r = await fetch(RPC, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
      cache: "no-store",
    });
    if (!r.ok) return null;
    const j = (await r.json()) as { result?: T };
    return j.result ?? null;
  } catch {
    return null;
  }
}

async function readOnchain() {
  if (!TREASURY) return null;
  type SolBal = { value: number };
  type TokenAccs = {
    value: { account: { data: { parsed: { info: { tokenAmount: { uiAmount: number } } } } } }[];
  };
  const [sol, usdcAccs, spyxAccs] = await Promise.all([
    rpc<SolBal>("getBalance", [TREASURY]),
    rpc<TokenAccs>("getTokenAccountsByOwner", [
      TREASURY,
      { mint: USDC_MINT },
      { encoding: "jsonParsed" },
    ]),
    SPYX_MINT
      ? rpc<TokenAccs>("getTokenAccountsByOwner", [
          TREASURY,
          { mint: SPYX_MINT },
          { encoding: "jsonParsed" },
        ])
      : Promise.resolve(null),
  ]);

  const solBal = sol ? sol.value / 1e9 : 0;
  const usdcBal =
    usdcAccs?.value.reduce(
      (s, a) => s + (a.account.data.parsed.info.tokenAmount.uiAmount ?? 0),
      0,
    ) ?? 0;
  const spyxBal =
    spyxAccs?.value.reduce(
      (s, a) => s + (a.account.data.parsed.info.tokenAmount.uiAmount ?? 0),
      0,
    ) ?? 0;

  return {
    address: TREASURY,
    sol: Number(solBal.toFixed(6)),
    usdc: Number(usdcBal.toFixed(6)),
    spyx: Number(spyxBal.toFixed(6)),
  };
}

export async function GET() {
  const sb = supabaseAdmin();

  const [usersAgg, taps, deposits, batches, onchain] = await Promise.all([
    sb.from("users").select("streak_count, total_contributed_gbp"),
    sb.from("taps").select("id, swap_batch_id"),
    sb.from("deposits").select("amount_usdc"),
    sb
      .from("swap_batches")
      .select("id, executed_at, total_usdc, spyx_received, tx_sig")
      .order("executed_at", { ascending: false })
      .limit(7),
    readOnchain(),
  ]);

  const userRows = usersAgg.data ?? [];
  const tapRows = taps.data ?? [];
  const depositRows = deposits.data ?? [];
  const batchRows = batches.data ?? [];

  const totalUsers = userRows.length;
  const activeStreaks = userRows.filter((u) => (u.streak_count ?? 0) > 0).length;
  const longestStreak = userRows.reduce((m, u) => Math.max(m, u.streak_count ?? 0), 0);
  const totalContributedGbp = userRows.reduce(
    (s, u) => s + Number(u.total_contributed_gbp ?? 0),
    0,
  );
  const totalDepositedUsdc = depositRows.reduce((s, d) => s + Number(d.amount_usdc), 0);
  const totalSwappedUsdc = batchRows.reduce((s, b) => s + Number(b.total_usdc), 0);
  const totalSpyx = batchRows.reduce((s, b) => s + Number(b.spyx_received ?? 0), 0);
  const pendingTaps = tapRows.filter((t) => !t.swap_batch_id).length;

  // Float = USDC sitting in the treasury between deposit and the next
  // daily swap. Approximation: total deposited minus total swapped.
  const floatUsdc = Math.max(totalDepositedUsdc - totalSwappedUsdc, 0);

  return NextResponse.json({
    cohort: {
      users: totalUsers,
      active_streaks: activeStreaks,
      longest_streak: longestStreak,
      total_taps: tapRows.length,
      pending_taps: pendingTaps,
      total_contributed_gbp: Number(totalContributedGbp.toFixed(2)),
    },
    treasury: {
      total_deposited_usdc: Number(totalDepositedUsdc.toFixed(2)),
      total_swapped_usdc: Number(totalSwappedUsdc.toFixed(2)),
      spyx_held: Number(totalSpyx.toFixed(6)),
      float_usdc: Number(floatUsdc.toFixed(2)),
      onchain,
    },
    recent_batches: batchRows.map((b) => ({
      id: b.id,
      executed_at: b.executed_at,
      total_usdc: Number(b.total_usdc),
      spyx_received: b.spyx_received ? Number(b.spyx_received) : null,
      tx_sig: b.tx_sig,
    })),
  });
}
