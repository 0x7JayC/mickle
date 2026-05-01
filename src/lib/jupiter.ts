// Minimal Jupiter v1 client. When JUP_API_KEY is set we hit the paid
// endpoint (higher rate limits, better routing); otherwise the lite
// endpoint is used. Swap requires a treasury keypair via TREASURY_PRIVATE_KEY
// (base58). Without it, callers run in demo mode — real quote, no on-chain
// execution.

const apiKey = process.env.JUP_API_KEY;
const BASE = apiKey ? "https://api.jup.ag" : "https://lite-api.jup.ag";
const QUOTE_URL = `${BASE}/swap/v1/quote`;
const SWAP_URL = `${BASE}/swap/v1/swap`;
const jupHeaders: Record<string, string> = apiKey ? { "x-api-key": apiKey } : {};

export const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
export const USDC_DECIMALS = 6;

export type Quote = {
  inAmount: string;
  outAmount: string;
  priceImpactPct: string;
  routePlan: unknown[];
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
  const params = new URLSearchParams({
    inputMint: USDC_MINT,
    outputMint: spyxMint,
    amount: String(lamports),
    slippageBps: String(slippageBps),
    onlyDirectRoutes: "false",
    asLegacyTransaction: "false",
  });
  const r = await fetch(`${QUOTE_URL}?${params}`, { cache: "no-store", headers: jupHeaders });
  if (!r.ok) return null;
  return (await r.json()) as Quote;
}

export type ExecutedSwap =
  | { mode: "demo"; quote: Quote }
  | { mode: "executed"; quote: Quote; signature: string };

export async function executeSwap({
  quote,
  rpcUrl,
}: {
  quote: Quote;
  rpcUrl: string;
}): Promise<ExecutedSwap> {
  const privKey = process.env.TREASURY_PRIVATE_KEY;
  if (!privKey) return { mode: "demo", quote };

  // Lazy-load heavy crypto deps so demo-mode requests never pay the cost.
  const [{ Connection, Keypair, VersionedTransaction }, bs58] = await Promise.all([
    import("@solana/web3.js"),
    import("bs58").then((m) => m.default ?? m),
  ]);

  const treasury = Keypair.fromSecretKey(bs58.decode(privKey));
  const swapRes = await fetch(SWAP_URL, {
    method: "POST",
    headers: { "content-type": "application/json", ...jupHeaders },
    body: JSON.stringify({
      quoteResponse: quote,
      userPublicKey: treasury.publicKey.toBase58(),
      wrapAndUnwrapSol: true,
      dynamicComputeUnitLimit: true,
      prioritizationFeeLamports: "auto",
    }),
  });
  if (!swapRes.ok) throw new Error(`swap build failed: ${swapRes.status}`);
  const { swapTransaction } = (await swapRes.json()) as { swapTransaction: string };

  const tx = VersionedTransaction.deserialize(Buffer.from(swapTransaction, "base64"));
  tx.sign([treasury]);
  const conn = new Connection(rpcUrl, "confirmed");
  const sig = await conn.sendRawTransaction(tx.serialize(), { skipPreflight: false });
  await conn.confirmTransaction(sig, "confirmed");
  return { mode: "executed", quote, signature: sig };
}
