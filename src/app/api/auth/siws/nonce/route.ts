// SIWS step 1 — issue a nonce JWT for the client to embed in the
// signed message. Stateless: no DB write, the JWT itself is the
// challenge record. 60s TTL.

import { NextResponse } from "next/server";
import { mintNonceJwt } from "@/lib/siws";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const result = await mintNonceJwt();
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json(
      { error: "siws nonce mint failed", detail: (e as Error).message },
      { status: 500 },
    );
  }
}
