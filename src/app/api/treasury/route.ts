// Public treasury stats. No auth — this is the transparency page.
// Aggregates the cohort: total taps, total contributed, total swapped,
// recent batches, and a modelled float-yield number so visitors can
// see the three-leg revenue model in action.

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const revalidate = 60;

// Kamino USDC vault APY. Update if/when we move the float to a different
// venue. As of April 2026, Kamino main USDC vault was paying ~4.5%.
const FLOAT_APY = 0.045;

export async function GET() {
  const sb = supabaseAdmin();

  const [usersAgg, taps, deposits, batches] = await Promise.all([
    sb.from("users").select("streak_count, total_contributed_gbp"),
    sb.from("taps").select("id, swap_batch_id"),
    sb.from("deposits").select("amount_usdc"),
    sb
      .from("swap_batches")
      .select("id, executed_at, total_usdc, spyx_received, tx_sig")
      .order("executed_at", { ascending: false })
      .limit(7),
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
  const annualFloatYieldUsdc = floatUsdc * FLOAT_APY;

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
      float_apy: FLOAT_APY,
      annual_float_yield_usdc: Number(annualFloatYieldUsdc.toFixed(2)),
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
