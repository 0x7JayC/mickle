import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { verifyCdpAuth, AuthError } from "@/lib/cdp-server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let userId: string;
  try {
    ({ userId } = await verifyCdpAuth(req));
  } catch (e) {
    const err = e as AuthError;
    return NextResponse.json({ error: err.message }, { status: err.status });
  }

  const body = (await req.json().catch(() => null)) as
    | { amount_gbp?: number; tx_sig?: string }
    | null;
  const amount = Number(body?.amount_gbp);
  if (!Number.isFinite(amount) || amount <= 0 || amount > 10_000) {
    return NextResponse.json({ error: "invalid amount" }, { status: 400 });
  }

  const sb = supabaseAdmin();
  const { data, error } = await sb.rpc("record_deposit", {
    p_auth_id: userId,
    p_amount_gbp: amount,
    p_tx_sig: body?.tx_sig ?? null,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ user: data });
}
