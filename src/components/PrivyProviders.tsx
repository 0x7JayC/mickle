"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import { toSolanaWalletConnectors } from "@privy-io/react-auth/solana";
import { base, mainnet } from "viem/chains";

const solanaConnectors = toSolanaWalletConnectors();

export default function PrivyProviders({ children }: { children: React.ReactNode }) {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
  if (!appId) {
    return (
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="glass-strong p-8 max-w-md text-center">
          <h2 className="text-xl font-semibold mb-2">Privy not configured</h2>
          <p className="text-sm text-muted">
            Set <code className="font-mono">NEXT_PUBLIC_PRIVY_APP_ID</code> in <code className="font-mono">.env.local</code>.
          </p>
        </div>
      </div>
    );
  }
  return (
    <PrivyProvider
      appId={appId}
      config={{
        loginMethods: ["email", "google", "wallet"],
        appearance: {
          theme: "light",
          accentColor: "#ff7a59",
          // Surface Coinbase Wallet first for the Base / Coinbase audience.
          walletList: [
            "phantom",
            "coinbase_wallet",
            "metamask",
            "wallet_connect",
            "rainbow",
            "backpack",
            "solflare",
          ],
        },
        embeddedWallets: {
          solana: { createOnLogin: "users-without-wallets" },
          ethereum: { createOnLogin: "off" },
        },
        // Base is the headline EVM chain (Coinbase users land here by default).
        // Mainnet is included so Coinbase Wallet doesn't reject the session.
        defaultChain: base,
        supportedChains: [base, mainnet],
        externalWallets: { solana: { connectors: solanaConnectors } },
      }}
    >
      {children}
    </PrivyProvider>
  );
}
