import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("swap_batches")
    .select("id, executed_at, total_usdc, spyx_received, tx_sig")
    .order("executed_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ batch: data });
}
