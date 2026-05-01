import { NextResponse } from "next/server";
import { verifyCdpAuth, AuthError } from "@/lib/cdp-server";
import { supabaseAdmin } from "@/lib/supabase";


export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  let userId: string;
  try {
    ({ userId } = await verifyCdpAuth(req));
  } catch (e) {
    const err = e as AuthError;
    return NextResponse.json({ error: err.message }, { status: err.status });
  }

  const sb = supabaseAdmin();
  const { data: user } = await sb
    .from("users")
    .select("id")
    .eq("auth_id", userId)
    .single();
  if (!user) return NextResponse.json({ milestones: [] });

  const { data, error } = await sb
    .from("milestones")
    .select("kind, asset_address, minted_at")
    .eq("user_id", user.id)
    .order("minted_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ milestones: data ?? [] });
}
