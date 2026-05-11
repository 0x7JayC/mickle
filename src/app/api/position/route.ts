import { NextResponse } from "next/server";
import { verifyCdpAuth, AuthError } from "@/lib/cdp-server";
import { supabaseAdmin } from "@/lib/supabase";

const SPYX_MINT = process.env.NEXT_PUBLIC_POSITION_MINT || "";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  let userId: string;
  try {
    ({ userId } = await verifyCdpAuth(req));
  } catch (e) {
    const err = e as AuthError;
    return NextResponse.json({ error: err.message }, { status: err.status });
  }

  if (!SPYX_MINT) {
    return NextResponse.json({ balance: 0, usdPrice: null, usdValue: 0, configured: false });
  }

  const sb = supabaseAdmin();
  const { data: user } = await sb
    .from("users")
    .select("id")
    .eq("auth_id", userId)
    .single();

  if (!user) {
    return NextResponse.json({ balance: 0, usdPrice: null, usdValue: 0, configured: true });
  }

  // Fetch all this user's taps that have been included in a swap batch.
  const { data: taps } = await sb
    .from("taps")
    .select("amount_usdc, swap_batch_id")
    .eq("user_id", user.id)
    .not("swap_batch_id", "is", null);

  const balance = await calcProRataBalance(taps ?? [], sb);
  const usdPrice = await fetchJupiterPrice(SPYX_MINT);

  return NextResponse.json({
    balance,
    usdPrice,
    usdValue: usdPrice ? balance * usdPrice : balance, // pbUSDC ≈ $1 if price unavailable
    configured: true,
  });
}

type Tap = { amount_usdc: number | string; swap_batch_id: string };

async function calcProRataBalance(
  taps: Tap[],
  sb: ReturnType<typeof import("@/lib/supabase").supabaseAdmin>,
): Promise<number> {
  if (taps.length === 0) return 0;

  const batchIds = [...new Set(taps.map((t) => t.swap_batch_id))];
  const { data: batches } = await sb
    .from("swap_batches")
    .select("id, total_usdc, spyx_received")
    .in("id", batchIds);

  if (!batches || batches.length === 0) return 0;

  const batchMap = new Map(batches.map((b) => [b.id, b]));
  let total = 0;

  for (const tap of taps) {
    const batch = batchMap.get(tap.swap_batch_id);
    if (!batch || !batch.spyx_received || !batch.total_usdc) continue;
    const share = Number(tap.amount_usdc) / Number(batch.total_usdc);
    total += share * Number(batch.spyx_received);
  }

  return total;
}

async function fetchJupiterPrice(mint: string): Promise<number | null> {
  try {
    const r = await fetch(`https://lite-api.jup.ag/price/v3?ids=${mint}`, {
      cache: "no-store",
    });
    if (!r.ok) return null;
    const j = await r.json();
    const px = j?.[mint]?.usdPrice;
    return typeof px === "number" ? px : null;
  } catch {
    return null;
  }
}
