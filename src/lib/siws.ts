// Sign-in-with-Solana — server side.
//
// Flow:
//   1. Client requests a nonce.
//   2. We sign the nonce into a short-lived JWT (60s) so we don't
//      need server-side state for the challenge. The nonce includes
//      a UUID + the issued-at timestamp.
//   3. Client asks the user's wallet to sign a deterministic message
//      `"Sign in to Mickle\n\nNonce: <nonce>\nIssued: <iso>"`.
//   4. Client posts { pubkey, message, signature, nonceJwt } back.
//   5. We verify the JWT (proves we issued the nonce, hasn't expired),
//      verify the ed25519 signature against the wallet pubkey, and
//      then issue a long-lived Mickle JWT (30 days) used as the
//      bearer token for subsequent API calls.
//
// All JWTs use HS256 with MICKLE_AUTH_SECRET. Tweetnacl handles the
// Solana signature verification — it's a transitive dep via web3.js.

import { SignJWT, jwtVerify } from "jose";

const SECRET_NAME = "MICKLE_AUTH_SECRET";
const NONCE_TTL_SEC = 60;
const SESSION_TTL_SEC = 60 * 60 * 24 * 30; // 30 days

function getSecret(): Uint8Array {
  const raw = process.env[SECRET_NAME];
  if (!raw) {
    throw new Error(
      `${SECRET_NAME} not set. Generate with 'openssl rand -hex 32' and add to Vercel.`,
    );
  }
  return new TextEncoder().encode(raw);
}

export type SiwsClaims = {
  /** Mickle auth ID — `siws:<base58 pubkey>` for SIWS, never `cdp:*`. */
  sub: string;
  /** Issued-at, seconds. */
  iat: number;
};

/**
 * Mint a short-lived nonce token. The token contains a random nonce
 * + the issued-at timestamp; the client gets back the JWT and the
 * raw nonce string for inclusion in the signed message.
 */
export async function mintNonceJwt(): Promise<{
  nonceJwt: string;
  nonce: string;
  issuedAt: string;
}> {
  const nonce = crypto.randomUUID();
  const issuedAt = new Date().toISOString();
  const nonceJwt = await new SignJWT({ nonce, issuedAt })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${NONCE_TTL_SEC}s`)
    .sign(getSecret());
  return { nonceJwt, nonce, issuedAt };
}

/**
 * Verify a SIWS round-trip. Throws on any failure.
 *
 * @returns the canonical Mickle auth ID (`siws:<pubkey>`) and a
 *          freshly-minted session JWT for subsequent API calls.
 */
export async function verifySiws({
  nonceJwt,
  pubkey,
  signatureBase58,
}: {
  nonceJwt: string;
  pubkey: string;
  signatureBase58: string;
}): Promise<{ authId: string; sessionJwt: string }> {
  // 1. Validate the nonce JWT.
  const { payload } = await jwtVerify(nonceJwt, getSecret());
  const nonce = payload.nonce as string | undefined;
  const issuedAt = payload.issuedAt as string | undefined;
  if (!nonce || !issuedAt) {
    throw new Error("invalid nonce token");
  }

  // 2. Reconstruct the exact message we expect the client to have
  //    signed — must match what the client constructs verbatim.
  const message = `Sign in to Mickle\n\nNonce: ${nonce}\nIssued: ${issuedAt}`;

  // 3. Verify the ed25519 signature against the claimed pubkey.
  //    tweetnacl + bs58 are both transitive deps via @solana/web3.js.
  const [{ default: nacl }, bs58] = await Promise.all([
    import("tweetnacl"),
    import("bs58").then((m) => m.default ?? m),
  ]);
  const messageBytes = new TextEncoder().encode(message);
  const signatureBytes = bs58.decode(signatureBase58);
  const pubkeyBytes = bs58.decode(pubkey);
  const ok = nacl.sign.detached.verify(messageBytes, signatureBytes, pubkeyBytes);
  if (!ok) {
    throw new Error("signature does not match the claimed pubkey");
  }

  // 4. Issue a long-lived Mickle session JWT.
  const authId = `siws:${pubkey}`;
  const sessionJwt = await new SignJWT({ sub: authId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SEC}s`)
    .sign(getSecret());

  return { authId, sessionJwt };
}

/**
 * Verify a Mickle session JWT (used by API auth helpers). Returns
 * the canonical auth ID; throws on any failure.
 */
export async function verifyMickleSession(token: string): Promise<string> {
  const { payload } = await jwtVerify(token, getSecret());
  const sub = payload.sub;
  if (typeof sub !== "string" || !sub.startsWith("siws:")) {
    throw new Error("not a Mickle SIWS session");
  }
  return sub;
}
