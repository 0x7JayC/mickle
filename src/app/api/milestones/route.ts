import { NextResponse } from "next/server";
import { PrivyClient } from "@privy-io/server-auth";
import { supabaseAdmin } from "@/lib/supabase";

const privy = new PrivyClient(
  process.env.NEXT_PUBLIC_PRIVY_APP_ID || "",
  process.env.PRIVY_APP_SECRET || "",
);

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "missing token" }, { status: 401 });
  }
  let claims;
  try {
    claims = await privy.verifyAuthToken(auth.slice(7));
  } catch {
    return NextResponse.json({ error: "invalid token" }, { status: 401 });
  }

  const sb = supabaseAdmin();
  const { data: user } = await sb
    .from("users")
    .select("id")
    .eq("privy_id", claims.userId)
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
