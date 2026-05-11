import { NextResponse } from "next/server";
import { waitUntil } from "@vercel/functions";
import { supabaseAdmin } from "@/lib/supabase";
import { verifyCdpAuth, AuthError } from "@/lib/cdp-server";
import { runDailySwap } from "@/lib/run-daily-swap";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let userId: string;
  try {
    ({ userId } = await verifyCdpAuth(req));
  } catch (e) {
    const err = e as AuthError;
    return NextResponse.json({ error: err.message }, { status: err.status });
  }

  const sb = supabaseAdmin();
  const { data, error } = await sb.rpc("record_tap", { p_auth_id: userId });
  if (error) {
    const insufficient = error.message?.toLowerCase().includes("insufficient balance");
    return NextResponse.json(
      { error: error.message },
      { status: insufficient ? 402 : 500 },
    );
  }

  // Fire the daily swap in the background so the user sees their position
  // update without waiting for the on-chain transaction to confirm.
  const today = new Date().toISOString().slice(0, 10);
  waitUntil(runDailySwap(today));

  return NextResponse.json({ user: data });
}
