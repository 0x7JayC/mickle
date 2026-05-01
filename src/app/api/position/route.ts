import { NextResponse } from "next/server";
import { verifyCdpAuth, AuthError } from "@/lib/cdp-server";
import { supabaseAdmin } from "@/lib/supabase";


const RPC = process.env.NEXT_PUBLIC_SOLANA_RPC || "https://api.mainnet-beta.solana.com";
const SPYX_MINT = process.env.NEXT_PUBLIC_SPYX_MINT || "";

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
    .select("wallet")
    .eq("auth_id", userId)
    .single();

  const wallet = user?.wallet;
  if (!wallet) {
    return NextResponse.json({ wallet: null, balance: 0, usdPrice: null, usdValue: 0, configured: !!SPYX_MINT });
  }
  if (!SPYX_MINT) {
    return NextResponse.json({ wallet, balance: 0, usdPrice: null, usdValue: 0, configured: false });
  }

  const [balance, usdPrice] = await Promise.all([
    fetchSpyxBalance(wallet),
    fetchJupiterPrice(SPYX_MINT),
  ]);

  return NextResponse.json({
    wallet,
    balance,
    usdPrice,
    usdValue: usdPrice ? balance * usdPrice : 0,
    configured: true,
  });
}

async function fetchSpyxBalance(owner: string): Promise<number> {
  try {
    const r = await fetch(RPC, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "getTokenAccountsByOwner",
        params: [owner, { mint: SPYX_MINT }, { encoding: "jsonParsed" }],
      }),
      cache: "no-store",
    });
    const j = await r.json();
    const accounts = j?.result?.value ?? [];
    let total = 0;
    for (const a of accounts) {
      const ui = a?.account?.data?.parsed?.info?.tokenAmount?.uiAmount;
      if (typeof ui === "number") total += ui;
    }
    return total;
  } catch {
    return 0;
  }
}

async function fetchJupiterPrice(mint: string): Promise<number | null> {
  try {
    const r = await fetch(`https://lite-api.jup.ag/price/v3?ids=${mint}`, {
      cache: "no-store",
    });
    if (!r.ok) return null;
    const j = await r.json();
    const px = j?.[mint]?.usdPrice;
    return typeof px === "number" ? px : null;
  } catch {
    return null;
  }
}
