// Server-side auth — verify Bearer tokens for protected routes.
//
// Two acceptable token shapes:
//   - CDP access token (from cdp-hooks useGetAccessToken on the
//     client). Verified by CdpClient.endUser.validateAccessToken.
//     Auth ID format: `cdp:<endUserId>`.
//   - Mickle SIWS session JWT (from /api/auth/siws/verify). Verified
//     by jose against MICKLE_AUTH_SECRET. Auth ID format:
//     `siws:<base58 pubkey>`.
//
// Routes call verifyAuth(req) and don't need to know which provider
// the user signed in through.
//
// CDP credentials precedence:
//   1. Bundled COINBASE_API_KEY JSON. Tolerates the two field-name
//      conventions Coinbase ships:
//        { "name": "...", "privateKey": "..." }
//        { "apiKeyId": "...", "apiKeySecret": "...", "walletSecret"? }
//   2. Individual CDP_API_KEY_ID / CDP_API_KEY_SECRET / CDP_WALLET_SECRET
//      env vars (the SDK's default).

import { CdpClient } from "@coinbase/cdp-sdk";
import { verifyMickleSession } from "@/lib/siws";

let cachedClient: CdpClient | null = null;

type AnyKeyFormat = {
  name?: string;
  privateKey?: string;
  apiKeyId?: string;
  apiKeySecret?: string;
  walletSecret?: string;
};

function getClient(): CdpClient {
  if (cachedClient) return cachedClient;

  const bundled = process.env.COINBASE_API_KEY;
  if (bundled) {
    try {
      const k = JSON.parse(bundled) as AnyKeyFormat;
      const apiKeyId = k.apiKeyId ?? k.name;
      const apiKeySecret = (k.apiKeySecret ?? k.privateKey)?.replace(/\\n/g, "\n");
      if (apiKeyId && apiKeySecret) {
        cachedClient = new CdpClient({
          apiKeyId,
          apiKeySecret,
          ...(k.walletSecret ? { walletSecret: k.walletSecret } : {}),
        });
        return cachedClient;
      }
      throw new Error(
        "COINBASE_API_KEY JSON is missing required fields (need apiKeyId+apiKeySecret or name+privateKey).",
      );
    } catch (e) {
      // Fall through to env-var path on JSON parse failure; only
      // re-throw if neither approach yields credentials below.
      if ((e as Error).message?.includes("missing required fields")) throw e;
    }
  }

  const id = process.env.CDP_API_KEY_ID;
  const secret = process.env.CDP_API_KEY_SECRET;
  if (id && secret) {
    cachedClient = new CdpClient({
      apiKeyId: id,
      apiKeySecret: secret,
      ...(process.env.CDP_WALLET_SECRET
        ? { walletSecret: process.env.CDP_WALLET_SECRET }
        : {}),
    });
    return cachedClient;
  }

  throw new Error(
    "CDP credentials not configured. Set COINBASE_API_KEY (CDP JSON download) or CDP_API_KEY_ID + CDP_API_KEY_SECRET on Vercel.",
  );
}

export type CdpAuthClaims = {
  /** Stable identifier for the signed-in user (CDP end user ID). */
  userId: string;
};

/**
 * Verify a Bearer token from a Mickle API request. Tries the Mickle
 * SIWS path first (cheap local JWT verify), falls back to CDP's
 * remote validation. Returns whichever auth_id format succeeded.
 *
 * Throws if the header is missing or both providers reject the token.
 */
export async function verifyAuth(req: Request): Promise<CdpAuthClaims> {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) {
    throw new AuthError("missing token", 401);
  }
  const token = auth.slice(7);

  // 1. Try Mickle SIWS first — local HS256 verify, no network round-trip.
  try {
    const sub = await verifyMickleSession(token);
    return { userId: sub };
  } catch {
    // not a Mickle session token — fall through to CDP path
  }

  // 2. CDP access token — calls into Coinbase's API.
  try {
    const client = getClient();
    const account = await client.endUser.validateAccessToken({ accessToken: token });
    return { userId: `cdp:${account.userId}` };
  } catch (e) {
    throw new AuthError(`invalid token: ${(e as Error).message}`, 401);
  }
}

// Back-compat alias so older route files don't have to change.
export const verifyCdpAuth = verifyAuth;

export class AuthError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}
