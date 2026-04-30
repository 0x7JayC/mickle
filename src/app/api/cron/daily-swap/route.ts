// Daily treasury swap. Vercel triggers at 00:05 UTC (see vercel.json).
//
// Path: aggregate yesterday's unbatched taps → quote USDC→SPYx via
// Jupiter → optionally execute on-chain → write a swap_batches row →
// link taps to that batch. Pooled treasury model: SPYx is held by the
// treasury wallet; user share is computed off the deposits ledger.
//
// Auth: Vercel sends Authorization: Bearer $CRON_SECRET when the env
// var is set. We reject anything else.

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { executeSwap, quoteUsdcToSpyx, USDC_DECIMALS } from "@/lib/jupiter";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const SPYX_MINT = process.env.NEXT_PUBLIC_SPYX_MINT || "";
const RPC = process.env.NEXT_PUBLIC_SOLANA_RPC || "https://api.mainnet-beta.solana.com";
const SPYX_DECIMALS = 8; // Backed xStocks decimals — adjust if Backed publishes otherwise

export async function GET(req: Request) {
  // Vercel cron auth
  const expected = process.env.CRON_SECRET;
  if (expected) {
    const got = req.headers.get("authorization");
    if (got !== `Bearer ${expected}`) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  const sb = supabaseAdmin();
  const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);

  // Aggregate yesterday's unbatched taps
  const { data: taps, error: tapsErr } = await sb
    .from("taps")
    .select("id, amount_usdc")
    .eq("tap_date", yesterday)
    .is("swap_batch_id", null);
  if (tapsErr) return NextResponse.json({ error: tapsErr.message }, { status: 500 });
  if (!taps || taps.length === 0) {
    return NextResponse.json({ skipped: true, reason: "no taps", date: yesterday });
  }

  const totalUsdc = taps.reduce((s, t) => s + Number(t.amount_usdc), 0);
  if (!SPYX_MINT) {
    return NextResponse.json({ skipped: true, reason: "SPYX_MINT not set", date: yesterday });
  }

  // Quote → optional execute
  const quote = await quoteUsdcToSpyx({ spyxMint: SPYX_MINT, usdcAmount: totalUsdc });
  if (!quote) {
    return NextResponse.json({ error: "quote failed" }, { status: 502 });
  }
  const spyxOut = Number(quote.outAmount) / 10 ** SPYX_DECIMALS;

  let signature: string | null = null;
  let mode: "demo" | "executed" = "demo";
  try {
    const result = await executeSwap({ quote, rpcUrl: RPC });
    mode = result.mode;
    if (result.mode === "executed") signature = result.signature;
  } catch (e) {
    return NextResponse.json(
      { error: "swap execution failed", detail: (e as Error).message },
      { status: 502 },
    );
  }

  // Persist batch + link taps
  const { data: batch, error: batchErr } = await sb
    .from("swap_batches")
    .insert({
      total_usdc: totalUsdc,
      spyx_received: spyxOut,
      tx_sig: signature,
    })
    .select()
    .single();
  if (batchErr) return NextResponse.json({ error: batchErr.message }, { status: 500 });

  const tapIds = taps.map((t) => t.id);
  const { error: linkErr } = await sb
    .from("taps")
    .update({ swap_batch_id: batch.id })
    .in("id", tapIds);
  if (linkErr) return NextResponse.json({ error: linkErr.message }, { status: 500 });

  return NextResponse.json({
    date: yesterday,
    mode,
    taps: taps.length,
    total_usdc: Number(totalUsdc.toFixed(USDC_DECIMALS)),
    spyx_received: spyxOut,
    signature,
    batch_id: batch.id,
  });
}
