// Demo-only fast-forward. Lets a judge scrub a streak to Day 7 / 30 / 100
// without waiting weeks. Gated by ALLOW_DEMO_CHEAT=true so it can never
// run in a real production deploy.

import { NextResponse } from "next/server";
import { verifyCdpAuth, AuthError } from "@/lib/cdp-server";
import { supabaseAdmin } from "@/lib/supabase";


export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (process.env.ALLOW_DEMO_CHEAT !== "true") {
    return NextResponse.json({ error: "demo cheat disabled" }, { status: 403 });
  }

  let userId: string;
  try {
    ({ userId } = await verifyCdpAuth(req));
  } catch (e) {
    const err = e as AuthError;
    return NextResponse.json({ error: err.message }, { status: err.status });
  }

  const body = (await req.json().catch(() => null)) as { target?: number } | null;
  const target = Number(body?.target);
  if (!Number.isFinite(target) || target < 0 || target > 365) {
    return NextResponse.json({ error: "invalid target" }, { status: 400 });
  }

  const sb = supabaseAdmin();
  const { data, error } = await sb.rpc("simulate_streak", {
    p_auth_id: userId,
    p_target_streak: Math.floor(target),
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ user: data });
}
