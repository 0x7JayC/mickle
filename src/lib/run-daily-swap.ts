// Shared daily-swap logic. Used by the Vercel cron (yesterday's taps) and
// by the dev manual-trigger endpoint (any date) so Jay can prove the loop
// without waiting for 00:05 UTC.

import { supabaseAdmin } from "@/lib/supabase";
import { executeSwap, quoteUsdcToSpyx, USDC_DECIMALS } from "@/lib/jupiter";

// Phase 1: pbUSDC (6 decimals, same as USDC). Change to 8 when switching to pbSPYx.
const SPYX_DECIMALS = 6;

export type SwapRunResult =
  | { ok: true; skipped: true; reason: string; date: string }
  | {
      ok: true;
      skipped?: false;
      date: string;
      mode: "demo" | "executed";
      taps: number;
      total_usdc: number;
      spyx_received: number;
      signature: string | null;
      batch_id: string;
    }
  | { ok: false; status: number; error: string; detail?: string };

export async function runDailySwap(date: string): Promise<SwapRunResult> {
  const SPYX_MINT = process.env.NEXT_PUBLIC_SPYX_MINT || "";
  const RPC = process.env.NEXT_PUBLIC_SOLANA_RPC || "https://api.mainnet-beta.solana.com";

  const sb = supabaseAdmin();
  const { data: taps, error: tapsErr } = await sb
    .from("taps")
    .select("id, amount_usdc")
    .eq("tap_date", date)
    .is("swap_batch_id", null);
  if (tapsErr) return { ok: false, status: 500, error: tapsErr.message };
  if (!taps || taps.length === 0) {
    return { ok: true, skipped: true, reason: "no taps", date };
  }

  const totalUsdc = taps.reduce((s, t) => s + Number(t.amount_usdc), 0);
  if (!SPYX_MINT) return { ok: true, skipped: true, reason: "SPYX_MINT not set", date };

  const quote = await quoteUsdcToSpyx({ spyxMint: SPYX_MINT, usdcAmount: totalUsdc });
  if (!quote) return { ok: false, status: 502, error: "quote failed" };
  const spyxOut = Number(quote.outAmount) / 10 ** SPYX_DECIMALS;

  let signature: string | null = null;
  let mode: "demo" | "executed" = "demo";
  try {
    const result = await executeSwap({ quote, rpcUrl: RPC });
    mode = result.mode;
    if (result.mode === "executed") signature = result.signature;
  } catch (e) {
    return { ok: false, status: 502, error: "swap execution failed", detail: (e as Error).message };
  }

  const { data: batch, error: batchErr } = await sb
    .from("swap_batches")
    .insert({ total_usdc: totalUsdc, spyx_received: spyxOut, tx_sig: signature })
    .select()
    .single();
  if (batchErr) return { ok: false, status: 500, error: batchErr.message };

  const tapIds = taps.map((t) => t.id);
  const { error: linkErr } = await sb
    .from("taps")
    .update({ swap_batch_id: batch.id })
    .in("id", tapIds);
  if (linkErr) return { ok: false, status: 500, error: linkErr.message };

  return {
    ok: true,
    date,
    mode,
    taps: taps.length,
    total_usdc: Number(totalUsdc.toFixed(USDC_DECIMALS)),
    spyx_received: spyxOut,
    signature,
    batch_id: batch.id,
  };
}
