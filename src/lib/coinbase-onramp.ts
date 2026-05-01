// Coinbase CDP — Onramp session-token exchange.
//
// Coinbase projects with "Secure Initialization" turned on can't be
// opened with a plain ?appId=... URL. The flow is:
//
//   1. Sign an ES256 JWT with the CDP API key (server-side).
//   2. POST that JWT as Bearer auth to /onramp/v1/token, body lists
//      the destination wallet(s) + assets.
//   3. Use the returned token as ?sessionToken=... in the Onramp URL.
//
// JWT signing is delegated to the official cdp-sdk helper, which
// handles both EC SEC1 PEMs (the default Coinbase ships) and Ed25519
// keys without us having to fight with PKCS#8 conversion.
//
// Credentials precedence (matches lib/cdp-server.ts):
//   1. COINBASE_API_KEY as a JSON blob — accepts {name, privateKey}
//      OR {apiKeyId, apiKeySecret}.
//   2. Individual env vars CDP_API_KEY_ID + CDP_API_KEY_SECRET (the
//      shape Coinbase tells you to use in their setup error message).

import { generateJwt } from "@coinbase/cdp-sdk/auth";

type CdpKey = { apiKeyId: string; apiKeySecret: string };

function parseKey(): CdpKey {
  // Path A — bundled JSON blob.
  const raw = process.env.COINBASE_API_KEY;
  if (raw) {
    try {
      const j = JSON.parse(raw) as {
        name?: string;
        privateKey?: string;
        apiKeyId?: string;
        apiKeySecret?: string;
      };
      const apiKeyId = j.apiKeyId ?? j.name;
      const apiKeySecret = (j.apiKeySecret ?? j.privateKey)?.replace(/\\n/g, "\n");
      if (apiKeyId && apiKeySecret) return { apiKeyId, apiKeySecret };
    } catch {
      // fall through to env-var path
    }
  }

  // Path B — individual env vars.
  const id = process.env.CDP_API_KEY_ID;
  const secret = process.env.CDP_API_KEY_SECRET?.replace(/\\n/g, "\n");
  if (id && secret) return { apiKeyId: id, apiKeySecret: secret };

  throw new Error(
    "CDP credentials not configured. Set COINBASE_API_KEY (JSON download from portal.cdp.coinbase.com) or CDP_API_KEY_ID + CDP_API_KEY_SECRET.",
  );
}

export async function createOnrampSessionToken(opts: {
  destinationAddress: string;
  blockchain: string; // e.g. 'solana'
  asset: string; // e.g. 'USDC'
}): Promise<string> {
  const host = "api.developer.coinbase.com";
  const path = "/onramp/v1/token";
  const { apiKeyId, apiKeySecret } = parseKey();
  const jwt = await generateJwt({
    apiKeyId,
    apiKeySecret,
    requestMethod: "POST",
    requestHost: host,
    requestPath: path,
  });

  const r = await fetch(`https://${host}${path}`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${jwt}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      addresses: [
        {
          address: opts.destinationAddress,
          blockchains: [opts.blockchain],
        },
      ],
      assets: [opts.asset],
    }),
  });
  if (!r.ok) {
    const detail = await r.text().catch(() => "");
    throw new Error(`onramp token exchange failed: ${r.status} ${detail.slice(0, 300)}`);
  }
  const j = (await r.json()) as { token?: string };
  if (!j.token) throw new Error("onramp token exchange returned no token");
  return j.token;
}
