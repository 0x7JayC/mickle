// Build a Coinbase Onramp hosted-widget URL pointing at the Mickle
// treasury. The user's Privy ID is passed as partnerUserRef so the
// success-return webhook (or polled lookup) can credit the right user.
//
// Onramp docs: https://docs.cdp.coinbase.com/onramp/docs/api-initializing
//
// The destinationWallets param tells Coinbase to send the purchased
// USDC straight to the treasury — bypassing the user-needs-a-wallet
// step that breaks the grandma thesis.

import { NextResponse } from "next/server";
import { PrivyClient } from "@privy-io/server-auth";

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

  const body = (await req.json().catch(() => null)) as { amount_gbp?: number } | null;
  const amount = Number(body?.amount_gbp);
  if (!Number.isFinite(amount) || amount <= 0 || amount > 10_000) {
    return NextResponse.json({ error: "invalid amount" }, { status: 400 });
  }

  const projectId = process.env.NEXT_PUBLIC_COINBASE_PROJECT_ID;
  const treasury = process.env.NEXT_PUBLIC_MICKLE_TREASURY;
  if (!projectId || !treasury) {
    return NextResponse.json(
      { error: "onramp not configured (project_id or treasury missing)" },
      { status: 500 },
    );
  }

  // Coinbase expects destinationWallets as JSON-encoded query param.
  const destinationWallets = JSON.stringify([
    { address: treasury, blockchains: ["solana"], assets: ["USDC"] },
  ]);

  // partnerUserRef must be ≤ 49 chars; truncate the Privy DID.
  const partnerUserRef = claims.userId.slice(0, 49);

  const params = new URLSearchParams({
    appId: projectId,
    destinationWallets,
    presetFiatAmount: String(amount),
    fiatCurrency: "GBP",
    defaultAsset: "USDC",
    defaultPaymentMethod: "APPLE_PAY",
    partnerUserRef,
    redirectUrl: `${new URL(req.url).origin}/app?onramp=success&amount=${amount}`,
  });

  const url = `https://pay.coinbase.com/buy/select-asset?${params.toString()}`;
  return NextResponse.json({ url, partnerUserRef });
}
