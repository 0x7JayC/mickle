// Jupiter Ultra API client. Ultra provides pre-built transactions with
// better routing than swap v1 — specifically needed for pbUSDC which
// only has routes via Raydium CLMM (not discoverable on lite swap v1).
//
// Flow: GET /ultra/v1/order (quote + pre-built tx) → sign → POST /ultra/v1/execute
//
// Swap requires TREASURY_PRIVATE_KEY (base58). Without it, callers run
// in demo mode — real quote, no on-chain execution.

const apiKey = process.env.JUP_API_KEY;
const BASE = apiKey ? "https://api.jup.ag" : "https://lite-api.jup.ag";
const jupHeaders: Record<string, string> = apiKey ? { "x-api-key": apiKey } : {};

export const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
export const USDC_DECIMALS = 6;

export type Quote = {
  inAmount: string;
  outAmount: string;
  priceImpactPct: string;
  routePlan: unknown[];
  // Ultra-specific — present when taker is provided
  transaction?: string;
  requestId?: string;
  [k: string]: unknown;
};

export async function quoteUsdcToSpyx({
  spyxMint,
  usdcAmount,
  slippageBps = 100,
}: {
  spyxMint: string;
  usdcAmount: number;
  slippageBps?: number;
}): Promise<Quote | null> {
  const lamports = Math.floor(usdcAmount * 10 ** USDC_DECIMALS);
  if (lamports <= 0) return null;

  const privKey = process.env.TREASURY_PRIVATE_KEY;
  const taker = privKey ? await getTreasuryAddress(privKey) : undefined;

  const params = new URLSearchParams({
    inputMint: USDC_MINT,
    outputMint: spyxMint,
    amount: String(lamports),
    slippageBps: String(slippageBps),
  });
  if (taker) params.set("taker", taker);

  const r = await fetch(`${BASE}/ultra/v1/order?${params}`, {
    cache: "no-store",
    headers: jupHeaders,
  });
  if (!r.ok) return null;
  return (await r.json()) as Quote;
}

export type ExecutedSwap =
  | { mode: "demo"; quote: Quote }
  | { mode: "executed"; quote: Quote; signature: string };

export async function executeSwap({
  quote,
}: {
  quote: Quote;
  rpcUrl: string; // kept for API compat, Ultra execute doesn't need it
}): Promise<ExecutedSwap> {
  const privKey = process.env.TREASURY_PRIVATE_KEY;
  if (!privKey) return { mode: "demo", quote };
  if (!quote.transaction || !quote.requestId) return { mode: "demo", quote };

  const [{ Keypair, VersionedTransaction }, bs58] = await Promise.all([
    import("@solana/web3.js"),
    import("bs58").then((m) => m.default ?? m),
  ]);

  const treasury = Keypair.fromSecretKey(bs58.decode(privKey));
  const tx = VersionedTransaction.deserialize(
    Buffer.from(quote.transaction as string, "base64"),
  );
  tx.sign([treasury]);
  const signedTransaction = Buffer.from(tx.serialize()).toString("base64");

  const execRes = await fetch(`${BASE}/ultra/v1/execute`, {
    method: "POST",
    headers: { "content-type": "application/json", ...jupHeaders },
    body: JSON.stringify({ signedTransaction, requestId: quote.requestId }),
  });
  if (!execRes.ok) throw new Error(`ultra execute failed: ${execRes.status}`);
  const result = (await execRes.json()) as { signature?: string; status?: string; error?: string };
  if (result.status !== "Success" || !result.signature) {
    throw new Error(`swap failed: ${result.error ?? result.status}`);
  }
  return { mode: "executed", quote, signature: result.signature };
}

async function getTreasuryAddress(privKeyBase58: string): Promise<string> {
  const [{ Keypair }, bs58] = await Promise.all([
    import("@solana/web3.js"),
    import("bs58").then((m) => m.default ?? m),
  ]);
  return Keypair.fromSecretKey(bs58.decode(privKeyBase58)).publicKey.toBase58();
}
