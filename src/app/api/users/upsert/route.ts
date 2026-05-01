import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { verifyCdpAuth, AuthError } from "@/lib/cdp-server";

export const dynamic = "force-dynamic";

// Upsert the signed-in user's row.
//
// The CDP token tells us who the request is from. We rely on the
// frontend to pass the user's Solana address + email since cdp-hooks
// already has them locally — saves a round-trip to fetch the
// EndUser from CDP again.
export async function POST(req: Request) {
  let userId: string;
  try {
    ({ userId } = await verifyCdpAuth(req));
  } catch (e) {
    const err = e as AuthError;
    return NextResponse.json({ error: err.message }, { status: err.status });
  }

  const body = (await req.json().catch(() => null)) as
    | { wallet?: string | null; email?: string | null }
    | null;

  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("users")
    .upsert(
      {
        auth_id: userId,
        wallet: body?.wallet ?? null,
        email: body?.email ?? null,
      },
      { onConflict: "auth_id" },
    )
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ user: data });
}
