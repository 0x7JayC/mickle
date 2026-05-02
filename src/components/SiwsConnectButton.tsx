"use client";

import { useCallback, useState } from "react";
import { ConnectionProvider, WalletProvider, useWallet } from "@solana/wallet-adapter-react";
import { WalletModalProvider, useWalletModal } from "@solana/wallet-adapter-react-ui";
import "@solana/wallet-adapter-react-ui/styles.css";

// SIWS local-storage key. The dashboard's auth helper looks here
// when CDP isn't signed in. Reused on logout to clear.
export const MICKLE_SIWS_KEY = "mickle.siws.jwt";
export const MICKLE_SIWS_AUTHID_KEY = "mickle.siws.authId";

const RPC = process.env.NEXT_PUBLIC_SOLANA_RPC || "https://api.mainnet-beta.solana.com";

// Inner button — assumes WalletProvider context is present. Splits
// the click handler into 'connect → fetch nonce → sign → verify →
// onSuccess' so wallet-modal cancellation cleanly resets state.
function SiwsButton({
  onSuccess,
  label,
}: {
  onSuccess: () => void;
  label: string;
}) {
  const { publicKey, signMessage, connected } = useWallet();
  const { setVisible } = useWalletModal();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async () => {
    setError(null);
    if (!connected || !publicKey || !signMessage) {
      setVisible(true);
      return;
    }
    setBusy(true);
    try {
      // Step 1 — fetch nonce JWT from server.
      const nonceRes = await fetch("/api/auth/siws/nonce", { method: "POST" });
      if (!nonceRes.ok) throw new Error("nonce request failed");
      const { nonceJwt, nonce, issuedAt } = (await nonceRes.json()) as {
        nonceJwt: string;
        nonce: string;
        issuedAt: string;
      };

      // Step 2 — sign the canonical message with the connected wallet.
      const message = `Sign in to Mickle\n\nNonce: ${nonce}\nIssued: ${issuedAt}`;
      const messageBytes = new TextEncoder().encode(message);
      const signatureBytes = await signMessage(messageBytes);

      const bs58 = (await import("bs58").then((m) => m.default ?? m));
      const signatureBase58 = bs58.encode(signatureBytes);

      // Step 3 — verify with the server, get back a Mickle session JWT.
      const verifyRes = await fetch("/api/auth/siws/verify", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          nonceJwt,
          pubkey: publicKey.toBase58(),
          signatureBase58,
        }),
      });
      if (!verifyRes.ok) {
        const err = await verifyRes.json().catch(() => ({}));
        throw new Error(err.detail ?? err.error ?? "siws verify failed");
      }
      const { token, authId } = (await verifyRes.json()) as {
        token: string;
        authId: string;
      };

      // Step 4 — store locally so other components can read it.
      localStorage.setItem(MICKLE_SIWS_KEY, token);
      localStorage.setItem(MICKLE_SIWS_AUTHID_KEY, authId);
      onSuccess();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }, [connected, publicKey, signMessage, setVisible, onSuccess]);

  return (
    <>
      <button
        onClick={run}
        disabled={busy}
        className="w-full glass-button px-4 py-3 font-semibold text-foreground border border-foreground/15 hover:border-foreground/30 transition disabled:opacity-50"
      >
        {busy ? "Signing…" : connected ? "Sign in" : label}
      </button>
      {error && (
        <p className="text-[12px] text-red-600 mt-2 text-center leading-relaxed">{error}</p>
      )}
    </>
  );
}

// Outer wrapper — owns the wallet-adapter providers so the button is
// fully self-contained. Modal CSS comes in via the import above.
export default function SiwsConnectButton({
  onSuccess,
  label = "Connect Solana wallet",
}: {
  onSuccess: () => void;
  label?: string;
}) {
  return (
    <ConnectionProvider endpoint={RPC}>
      <WalletProvider wallets={[]} autoConnect>
        <WalletModalProvider>
          <SiwsButton onSuccess={onSuccess} label={label} />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
