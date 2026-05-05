// Daily treasury swap. Vercel triggers at 00:05 UTC (see vercel.json).
//
// Path: aggregate yesterday's unbatched taps → quote USDC→pbSPYx via
// Jupiter (secondary market) → optionally execute on-chain → write a
// swap_batches row → link taps to that batch. Pooled treasury model:
// pbSPYx is held by the treasury wallet (PiggyBank SPYx vault token,
// 5x Oinks); user share is computed off the deposits ledger.
// See MONEY.md § Leg 2b for the rationale behind pbSPYx vs raw SPYx.
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
