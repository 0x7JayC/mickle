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

  const sb = supabaseAdmin();
  const { data, error } = await sb.rpc("record_tap", { p_auth_id: userId });
  if (error) {
    // record_tap raises 'insufficient balance' when the user has tapped
    // through their pre-funded streak. Surface that as 402 so the client
    // can prompt the user to top up.
    const insufficient = error.message?.toLowerCase().includes("insufficient balance");
    return NextResponse.json(
      { error: error.message },
      { status: insufficient ? 402 : 500 },
    );
  }

  return NextResponse.json({ user: data });
}
