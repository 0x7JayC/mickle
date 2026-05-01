// Server-side CDP auth — validate end-user access tokens.
//
// CdpClient.endUser.validateAccessToken takes a JWT access token from
// the frontend (issued by the CDP embedded-wallet SDK) and returns
// the EndUserAccount, including the canonical user ID. We use that
// ID as users.auth_id, prefixed `cdp:` for provider-namespacing.
//
// The CDP SDK reads CDP_API_KEY_ID + CDP_API_KEY_SECRET from env by
// default. We also support the modern bundled COINBASE_API_KEY JSON
// format ({ name, privateKey }) — same blob the Onramp flow uses —
// by parsing it once at module load and feeding the values into the
// constructor.

import { CdpClient } from "@coinbase/cdp-sdk";

let cachedClient: CdpClient | null = null;

function getClient(): CdpClient {
  if (cachedClient) return cachedClient;

  // Prefer the bundled JSON if present — one env var, less to wire.
  const bundled = process.env.COINBASE_API_KEY;
  if (bundled) {
    try {
      const k = JSON.parse(bundled) as { name?: string; privateKey?: string };
      if (k.name && k.privateKey) {
        cachedClient = new CdpClient({
          apiKeyId: k.name,
          apiKeySecret: k.privateKey.replace(/\\n/g, "\n"),
        });
        return cachedClient;
      }
    } catch {
      // fall through to env-var path
    }
  }

  // Falls back to the SDK's default behaviour: reads CDP_API_KEY_ID,
  // CDP_API_KEY_SECRET, CDP_WALLET_SECRET from process.env directly.
  cachedClient = new CdpClient();
  return cachedClient;
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
