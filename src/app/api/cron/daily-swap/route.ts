// Daily treasury swap. Vercel triggers at 00:05 UTC (see vercel.json).
//
// Path: aggregate yesterday's unbatched taps → quote USDC→pbUSDC via
// Jupiter (secondary market) → optionally execute on-chain → write a
// swap_batches row → link taps to that batch. Pooled treasury model:
// pbUSDC is held by the treasury wallet (PiggyBank USDC yield vault,
// 1x Oinks). Phase 2 will switch to pbSPYx (5x Oinks, S&P 500 exposure).
// See MONEY.md § Leg 2b for full phase plan.
//
// Auth: Vercel sends Authorization: Bearer $CRON_SECRET when the env
// var is set. We reject anything else.

import { NextResponse } from "next/server";
import { runDailySwap } from "@/lib/run-daily-swap";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(req: Request) {
  const expected = process.env.CRON_SECRET;
  if (expected) {
    const got = req.headers.get("authorization");
    if (got !== `Bearer ${expected}`) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
  const result = await runDailySwap(yesterday);
  if (!result.ok) {
    return NextResponse.json(
      { error: result.error, ...(result.detail ? { detail: result.detail } : {}) },
      { status: result.status },
    );
  }
  return NextResponse.json(result);
}
