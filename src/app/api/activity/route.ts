// Merged chronological activity feed for the signed-in user.
// Pulls taps, deposits, milestones, and any swap_batches the user
// participated in (via taps.swap_batch_id), normalises them into a
// single sorted array, returns the last 30 events.

import { NextResponse } from "next/server";
import { verifyCdpAuth, AuthError } from "@/lib/cdp-server";
import { supabaseAdmin } from "@/lib/supabase";


export const dynamic = "force-dynamic";

type ActivityItem = {
  type: "tap" | "deposit" | "milestone" | "batch";
  at: string;
  label: string;
  detail?: string;
  amount?: string;
};

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
  if (!user) return NextResponse.json({ activity: [] });

  const [taps, deposits, milestones] = await Promise.all([
    sb
      .from("taps")
      .select("created_at, tap_date, amount_usdc, swap_batch_id")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(30),
    sb
      .from("deposits")
      .select("created_at, amount_usdc")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(30),
    sb
      .from("milestones")
      .select("kind, minted_at, asset_address")
      .eq("user_id", user.id)
      .order("minted_at", { ascending: false })
      .limit(10),
  ]);

  const batchIds = Array.from(
    new Set((taps.data ?? []).map((t) => t.swap_batch_id).filter(Boolean)),
  ) as string[];
  const batches =
    batchIds.length > 0
      ? (
          await sb
            .from("swap_batches")
            .select("id, executed_at, total_usdc, spyx_received, tx_sig")
            .in("id", batchIds)
        ).data ?? []
      : [];

  const items: ActivityItem[] = [];

  for (const t of taps.data ?? []) {
    items.push({
      type: "tap",
      at: t.created_at,
      label: "Daily tap",
      amount: `+£${Number(t.amount_usdc).toFixed(0)}`,
    });
  }
  for (const d of deposits.data ?? []) {
    items.push({
      type: "deposit",
      at: d.created_at,
      label: "Top-up",
      amount: `+$${Number(d.amount_usdc).toFixed(2)}`,
    });
  }
  for (const m of milestones.data ?? []) {
    const day = m.kind.replace("day_", "");
    items.push({
      type: "milestone",
      at: m.minted_at,
      label: `Day ${day} milestone`,
      detail: m.asset_address?.startsWith("demo:") ? "Soulbound NFT (demo)" : "Soulbound NFT minted",
    });
  }
  for (const b of batches) {
    items.push({
      type: "batch",
      at: b.executed_at,
      label: "Treasury swap",
      detail: b.tx_sig ? "Executed on Solana" : "Quoted (demo)",
      amount: `${Number(b.total_usdc).toFixed(2)} USDC → ${Number(b.spyx_received ?? 0).toFixed(4)} pbSPYx`,
    });
  }

  items.sort((a, b) => (a.at < b.at ? 1 : -1));
  return NextResponse.json({ activity: items.slice(0, 30) });
}
