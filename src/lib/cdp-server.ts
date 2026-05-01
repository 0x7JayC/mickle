// Server-side CDP auth — validate end-user access tokens.
//
// CdpClient.endUser.validateAccessToken takes a JWT access token from
// the frontend (issued by the CDP embedded-wallet SDK) and returns
// the EndUserAccount, including the canonical user ID. We use that
// ID as users.auth_id, prefixed `cdp:` for provider-namespacing.
//
// Credentials precedence:
//   1. Bundled COINBASE_API_KEY JSON. Tolerates the two field-name
//      conventions Coinbase ships:
//        { "name": "...", "privateKey": "..." }
//        { "apiKeyId": "...", "apiKeySecret": "...", "walletSecret"? }
//   2. Individual CDP_API_KEY_ID / CDP_API_KEY_SECRET / CDP_WALLET_SECRET
//      env vars (the SDK's default).
//
// If neither is set, a clear error is thrown ahead of the SDK's own
// generic 'missing required parameters' message.

import { CdpClient } from "@coinbase/cdp-sdk";

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
 * Verify a Bearer token from a Mickle API request and return the CDP
 * user ID. Throws if the header is missing/invalid or the token fails
 * CDP's validation.
 */
export async function verifyCdpAuth(req: Request): Promise<CdpAuthClaims> {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) {
    throw new AuthError("missing token", 401);
  }
  const token = auth.slice(7);
  try {
    const client = getClient();
    const account = await client.endUser.validateAccessToken({ accessToken: token });
    return { userId: `cdp:${account.userId}` };
  } catch (e) {
    throw new AuthError(`invalid token: ${(e as Error).message}`, 401);
  }
}

export class AuthError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}
