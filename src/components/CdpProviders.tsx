"use client";

import { CDPReactProvider, type Config, type Theme } from "@coinbase/cdp-react";

// Mickle wraps CDP's React provider so the embedded-wallet hooks
// (useCurrentUser, useSendSolanaTransaction, etc.) and the AuthButton
// are available anywhere in the tree.

const config: Config = {
  // Set on Vercel as NEXT_PUBLIC_COINBASE_PROJECT_ID — same project ID
  // that powers the Coinbase Onramp integration.
  projectId: process.env.NEXT_PUBLIC_COINBASE_PROJECT_ID ?? "",
  solana: {
    // Provision a Solana embedded wallet on first sign-in. The grandma
    // path — no seed phrase, no app store, just email or Google + tap.
    createOnLogin: true,
  },
  appName: "Mickle",
  appLogoUrl: "https://cdn-icons-png.flaticon.com/128/7298/7298787.png",
  authMethods: ["oauth:google", "email"],
  showCoinbaseFooter: true,
};

const theme: Partial<Theme> = {
  "colors-bg-default": "#ffffff",
  "colors-bg-alternate": "#eef0f3",
  "colors-bg-primary": "#e1591b",
  "colors-bg-secondary": "#eef0f3",
  "colors-fg-default": "#0a0b0d",
  "colors-fg-muted": "#5b616e",
  "colors-fg-primary": "#e1591b",
  "colors-fg-onPrimary": "#ffffff",
  "colors-fg-onSecondary": "#0a0b0d",
  "colors-fg-positive": "#098551",
  "colors-fg-negative": "#cf202f",
  "colors-fg-warning": "#ed702f",
  "colors-line-default": "#dcdfe4",
  "colors-line-heavy": "#9397a0",
  "borderRadius-banner": "var(--cdp-web-borderRadius-xl)",
  "borderRadius-cta": "var(--cdp-web-borderRadius-full)",
  "borderRadius-link": "var(--cdp-web-borderRadius-full)",
  "borderRadius-input": "var(--cdp-web-borderRadius-lg)",
  "borderRadius-select-trigger": "var(--cdp-web-borderRadius-lg)",
  "borderRadius-select-list": "var(--cdp-web-borderRadius-lg)",
  "borderRadius-modal": "var(--cdp-web-borderRadius-xl)",
};

export default function CdpProviders({ children }: { children: React.ReactNode }) {
  // Always render the provider so cdp-hooks calls don't throw 'useCDP
  // must be used within a CDPHooksProvider' during prerender. If the
  // project ID is empty the hooks will be inert — useIsSignedIn returns
  // { isSignedIn: false }, AuthButton renders disabled — which is the
  // correct behaviour in environments without CDP credentials.
  return (
    <CDPReactProvider config={config} theme={theme}>
      {children}
    </CDPReactProvider>
  );
}
