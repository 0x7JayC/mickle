import { NextResponse } from "next/server";
import { PrivyClient } from "@privy-io/server-auth";
import { supabaseAdmin } from "@/lib/supabase";

const privy = new PrivyClient(
  process.env.NEXT_PUBLIC_PRIVY_APP_ID || "",
  process.env.PRIVY_APP_SECRET || "",
);

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
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
  const { data, error } = await sb.rpc("record_tap", { p_privy_id: claims.userId });
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
