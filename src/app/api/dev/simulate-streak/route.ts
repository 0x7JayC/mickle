// Demo-only fast-forward. Lets a judge scrub a streak to Day 7 / 30 / 100
// without waiting weeks. Gated by ALLOW_DEMO_CHEAT=true so it can never
// run in a real production deploy.

import { NextResponse } from "next/server";
import { PrivyClient } from "@privy-io/server-auth";
import { supabaseAdmin } from "@/lib/supabase";

const privy = new PrivyClient(
  process.env.NEXT_PUBLIC_PRIVY_APP_ID || "",
  process.env.PRIVY_APP_SECRET || "",
);

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (process.env.ALLOW_DEMO_CHEAT !== "true") {
    return NextResponse.json({ error: "demo cheat disabled" }, { status: 403 });
  }

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

  const body = (await req.json().catch(() => null)) as { target?: number } | null;
  const target = Number(body?.target);
  if (!Number.isFinite(target) || target < 0 || target > 365) {
    return NextResponse.json({ error: "invalid target" }, { status: 400 });
  }

  const sb = supabaseAdmin();
  const { data, error } = await sb.rpc("simulate_streak", {
    p_privy_id: claims.userId,
    p_target_streak: Math.floor(target),
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ user: data });
}
