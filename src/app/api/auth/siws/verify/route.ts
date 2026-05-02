// SIWS step 2 — verify the user signed the nonce, then issue a
// 30-day Mickle session JWT. Returns the JWT to the client; the
// client stores it in localStorage and sends it as the Bearer
// token on subsequent API calls (see lib/cdp-server.ts verifyAuth).

import { NextResponse } from "next/server";
import { verifySiws } from "@/lib/siws";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as
    | { nonceJwt?: string; pubkey?: string; signatureBase58?: string }
    | null;
  if (!body?.nonceJwt || !body?.pubkey || !body?.signatureBase58) {
    return NextResponse.json(
      { error: "missing nonceJwt, pubkey, or signatureBase58" },
      { status: 400 },
    );
  }
  try {
    const { authId, sessionJwt } = await verifySiws({
      nonceJwt: body.nonceJwt,
      pubkey: body.pubkey,
      signatureBase58: body.signatureBase58,
    });
    return NextResponse.json({ authId, token: sessionJwt });
  } catch (e) {
    return NextResponse.json(
      { error: "siws verify failed", detail: (e as Error).message },
      { status: 401 },
    );
  }
}
