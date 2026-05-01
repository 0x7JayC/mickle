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

// Mickle brand palette mapped onto CDP's theme tokens. The Apple
// Liquid Glass chrome (drawer backdrop blur, soft shadow, rounded
// container) lives in LandingSignInPanel.tsx — we don't try to
// recreate it inside CDP's own surfaces.
//
// Foreground / background tokens use Mickle's exact hex values from
// globals.css, and the primary accent is the brand coral instead of
// CDP's default orange. Border radii lean on CDP's full-pill tokens
// so buttons match Mickle's glass-button-primary aesthetic.
const theme: Partial<Theme> = {
  // Surfaces
  "colors-bg-default": "#ffffff",
  "colors-bg-alternate": "#faf6ee", // Mickle calm-bg cream
  "colors-bg-primary": "#ff7a59",   // Mickle coral
  "colors-bg-secondary": "#f4efe6", // soft cream
  // Foregrounds
  "colors-fg-default": "#0c0a14",   // Mickle foreground deep
  "colors-fg-muted": "rgba(12, 10, 20, 0.62)",
  "colors-fg-primary": "#ff7a59",
  "colors-fg-onPrimary": "#ffffff",
  "colors-fg-onSecondary": "#0c0a14",
  // Status colors — keep CDP defaults; they meet WCAG and aren't
  // opinionated like the brand accent.
  "colors-fg-positive": "#098551",
  "colors-fg-negative": "#cf202f",
  "colors-fg-warning": "#ed702f",
  // Lines — Mickle uses very subtle dividers (foreground @ 8-10%).
  "colors-line-default": "rgba(12, 10, 20, 0.10)",
  "colors-line-heavy": "rgba(12, 10, 20, 0.35)",
  // Border radii — match Mickle's pill-and-card vocabulary.
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
