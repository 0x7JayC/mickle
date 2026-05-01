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
// Docs: https://docs.cdp.coinbase.com/onramp/docs/api-initializing
//
// Expects COINBASE_API_KEY to be the modern CDP key format — a JSON
// blob with `name` and `privateKey` fields. Legacy plain-string keys
// are not supported here; regenerate via portal.cdp.coinbase.com.

import { SignJWT, importPKCS8 } from "jose";

type CdpKey = { name: string; privateKey: string };

function parseKey(): CdpKey {
  const raw = process.env.COINBASE_API_KEY;
  if (!raw) throw new Error("COINBASE_API_KEY not set");
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error(
      "COINBASE_API_KEY must be the new CDP JSON format (with name + privateKey). Regenerate at portal.cdp.coinbase.com → API keys.",
    );
  }
  const k = parsed as CdpKey;
  if (typeof k?.name !== "string" || typeof k?.privateKey !== "string") {
    throw new Error("COINBASE_API_KEY JSON missing 'name' or 'privateKey'");
  }
  return k;
}

async function signCdpJwt({
  method,
  host,
  path,
}: {
  method: "GET" | "POST";
  host: string;
  path: string;
}): Promise<string> {
  const { name, privateKey } = parseKey();
  // CDP keys are PKCS#8 EC P-256 PEMs. jose accepts the literal newline
  // form; if Vercel has stored the JSON with escaped \n we normalise here.
  const pem = privateKey.replace(/\\n/g, "\n");
  const key = await importPKCS8(pem, "ES256");

  const now = Math.floor(Date.now() / 1000);
  const nonce = crypto.randomUUID().replace(/-/g, "");

  return await new SignJWT({
    iss: "cdp",
    sub: name,
    aud: ["cdp_service"],
    uri: `${method} ${host}${path}`,
  })
    .setProtectedHeader({ alg: "ES256", kid: name, nonce, typ: "JWT" })
    .setIssuedAt(now)
    .setNotBefore(now)
    .setExpirationTime(now + 120)
    .sign(key);
}

export async function createOnrampSessionToken(opts: {
  destinationAddress: string;
  blockchain: string; // e.g. 'solana'
  asset: string; // e.g. 'USDC'
}): Promise<string> {
  const host = "api.developer.coinbase.com";
  const path = "/onramp/v1/token";
  const jwt = await signCdpJwt({ method: "POST", host, path });

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
