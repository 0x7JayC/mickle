import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { verifyAuth, AuthError } from "@/lib/cdp-server";

export const dynamic = "force-dynamic";

// Upsert the signed-in user's row.
//
// The auth token (CDP or SIWS Mickle JWT) tells us who is making the
// request. The frontend passes the user's Solana address + email
// since the auth providers already have them locally — saves a
// round-trip.
//
// users.wallet has a UNIQUE constraint (one wallet ≠ two users), so
// if a row already exists with the same wallet under a different
// auth_id we re-key it onto the current auth_id rather than failing
// the insert. This handles the legitimate case where someone signs
// in via SIWS using a wallet they previously connected via another
// auth provider.
export async function POST(req: Request) {
  let userId: string;
  try {
    ({ userId } = await verifyAuth(req));
  } catch (e) {
    const err = e as AuthError;
    return NextResponse.json({ error: err.message }, { status: err.status });
  }

  const body = (await req.json().catch(() => null)) as
    | { wallet?: string | null; email?: string | null }
    | null;
  const wallet = body?.wallet ?? null;
  const email = body?.email ?? null;

  const sb = supabaseAdmin();

  // If a row already owns this wallet, point it at the current auth_id.
  // Idempotent: if it already matches we just update email.
  if (wallet) {
    const { data: byWallet } = await sb
      .from("users")
      .select("id, auth_id")
      .eq("wallet", wallet)
      .maybeSingle();
    if (byWallet && byWallet.auth_id !== userId) {
      const { data: relinked, error: relinkErr } = await sb
        .from("users")
        .update({ auth_id: userId, email })
        .eq("id", byWallet.id)
        .select()
        .single();
      if (relinkErr) {
        return NextResponse.json({ error: relinkErr.message }, { status: 500 });
      }
      return NextResponse.json({ user: relinked });
    }
  }

  const { data, error } = await sb
    .from("users")
    .upsert(
      { auth_id: userId, wallet, email },
      { onConflict: "auth_id" },
    )
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ user: data });
}
