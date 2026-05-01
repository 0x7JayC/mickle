// Build a Coinbase Onramp hosted-widget URL pointing at the Mickle
// treasury. Uses the Secure Initialization flow: server-side JWT
// signed with the CDP API key, exchanged for a sessionToken via
// /onramp/v1/token, then surfaced as ?sessionToken=... in the URL.
//
// Coinbase delivers USDC straight to the treasury; on success they
// redirect the user back to /app?onramp=success&amount=N where the
// dashboard credits the deposit.

import { NextResponse } from "next/server";
import { PrivyClient } from "@privy-io/server-auth";
import { createOnrampSessionToken } from "@/lib/coinbase-onramp";

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

  const treasury = process.env.NEXT_PUBLIC_MICKLE_TREASURY;
  if (!treasury) {
    return NextResponse.json({ error: "treasury not configured" }, { status: 500 });
  }

  let sessionToken: string;
  try {
    sessionToken = await createOnrampSessionToken({
      destinationAddress: treasury,
      blockchain: "solana",
      asset: "USDC",
    });
  } catch (e) {
    return NextResponse.json(
      { error: "onramp init failed", detail: (e as Error).message },
      { status: 502 },
    );
  }

  // partnerUserId helps map the resulting transaction to a Mickle user
  // when we wire up the Transaction Status webhook later. ≤ 49 chars.
  const partnerUserId = claims.userId.slice(0, 49);

  const params = new URLSearchParams({
    sessionToken,
    presetFiatAmount: String(amount),
    fiatCurrency: "GBP",
    defaultAsset: "USDC",
    defaultPaymentMethod: "APPLE_PAY",
    partnerUserId,
    redirectUrl: `${new URL(req.url).origin}/app?onramp=success&amount=${amount}`,
  });

  return NextResponse.json({
    url: `https://pay.coinbase.com/buy/select-asset?${params.toString()}`,
  });
}
