"use client";

import { CDPReactProvider, type Config, type Theme } from "@coinbase/cdp-react";

// Mickle wraps CDP's React provider so the embedded-wallet hooks
// (useCurrentUser, useSendSolanaTransaction, etc.) are available
// anywhere in the tree. Coexists with PrivyProviders during the
// migration — CDP and Privy own separate React contexts and don't
// interfere.

const config: Config = {
  // Same project ID as the Coinbase Onramp integration. Set on Vercel
  // as NEXT_PUBLIC_COINBASE_PROJECT_ID.
  projectId: process.env.NEXT_PUBLIC_COINBASE_PROJECT_ID ?? "",
  solana: {
    // Provision a Solana embedded wallet on first sign-in. This is the
    // grandma path — no seed phrase, no app store, just email + tap.
    createOnLogin: true,
  },
  appName: "Mickle",
  appLogoUrl: "https://mickle-gamma.vercel.app/icon-192.png",
  authMethods: ["oauth:apple", "oauth:google", "email"],
  showCoinbaseFooter: true,
};

// Match Mickle's coral accent + Apple-discipline radii. CDP exposes a
// CSS-variables map; only the keys we actually want to override are
// listed here. Anything not specified inherits CDP's defaults.
const theme: Partial<Theme> = {
  "colors-bg-primary": "#ff7a59",
  "colors-fg-primary": "#ff7a59",
  "colors-fg-onPrimary": "#ffffff",
  "borderRadius-cta": "var(--cdp-web-borderRadius-full)",
  "borderRadius-link": "var(--cdp-web-borderRadius-full)",
  "borderRadius-input": "var(--cdp-web-borderRadius-lg)",
  "borderRadius-modal": "var(--cdp-web-borderRadius-xl)",
};

export default function CdpProviders({ children }: { children: React.ReactNode }) {
  // Pass-through if the CDP project ID isn't configured. Same defensive
  // shape as PrivyProviders — keeps SSR / preview deploys working when
  // the env var is missing.
  if (!config.projectId) return <>{children}</>;
  return (
    <CDPReactProvider config={config} theme={theme}>
      {children}
    </CDPReactProvider>
  );
}
