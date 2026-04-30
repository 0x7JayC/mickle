import { NextResponse } from "next/server";
import { PrivyClient } from "@privy-io/server-auth";
import { supabaseAdmin } from "@/lib/supabase";

const privy = new PrivyClient(
  process.env.NEXT_PUBLIC_PRIVY_APP_ID || "",
  process.env.PRIVY_APP_SECRET || "",
);

const RPC = process.env.NEXT_PUBLIC_SOLANA_RPC || "https://api.mainnet-beta.solana.com";
const SPYX_MINT = process.env.NEXT_PUBLIC_SPYX_MINT || "";

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
    .select("wallet")
    .eq("privy_id", claims.userId)
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
