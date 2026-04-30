"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import { toSolanaWalletConnectors } from "@privy-io/react-auth/solana";

const solanaConnectors = toSolanaWalletConnectors();

export default function PrivyProviders({ children }: { children: React.ReactNode }) {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
  // Pass-through if Privy isn't configured. The landing renders without
  // auth; usePrivy() callers gracefully degrade (`ready` stays false,
  // login button hides). Keeps prerender working in environments
  // without the env var.
  if (!appId) return <>{children}</>;
  return (
    <PrivyProvider
      appId={appId}
      config={{
        // Solana-only. Apple is added so iPhone users get one-tap FaceID
        // sign-in inside the Capacitor iOS shell. Coinbase / Kraken login
        // intentionally deferred — Mickle treats those as future identity
        // providers, not wallet connectors.
        loginMethods: ["email", "apple", "google", "wallet"],
        appearance: {
          theme: "light",
          accentColor: "#ff7a59",
          // Lock the wallet picker to Solana for v1. Without this Privy's
          // link / connect modals fall back to including MetaMask /
          // Coinbase Wallet / WalletConnect from the EVM defaults.
          walletChainType: "solana-only",
          walletList: ["phantom", "backpack", "solflare"],
        },
        embeddedWallets: {
          solana: { createOnLogin: "users-without-wallets" },
        },
        externalWallets: { solana: { connectors: solanaConnectors } },
      }}
    >
      {children}
    </PrivyProvider>
  );
}
