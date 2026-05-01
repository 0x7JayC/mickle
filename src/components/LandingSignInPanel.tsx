"use client";

import { CDPReactProvider, SignIn, type Config, type Theme } from "@coinbase/cdp-react";
import { useRouter } from "next/navigation";

// Self-contained inline sign-in panel for public pages. Wraps itself
// in CDPReactProvider so the CDP SDK only initializes when this
// component actually mounts — never paid by static landing visitors
// who don't open the auth drawer.
//
// Lazy-loaded via next/dynamic from LandingAuth so the CDP bundle
// (~400 KB) isn't shipped in the landing's initial JS payload. Loads
// the moment the user clicks 'Sign in'.

const config: Config = {
  projectId: process.env.NEXT_PUBLIC_COINBASE_PROJECT_ID ?? "",
  solana: { createOnLogin: true },
  appName: "Mickle",
  appLogoUrl: "https://mickle-gamma.vercel.app/icon-192.png",
  authMethods: ["oauth:apple", "oauth:google", "email"],
  showCoinbaseFooter: true,
};

const theme: Partial<Theme> = {
  "colors-bg-primary": "#ff7a59",
  "colors-fg-primary": "#ff7a59",
  "colors-fg-onPrimary": "#ffffff",
  "borderRadius-cta": "var(--cdp-web-borderRadius-full)",
  "borderRadius-link": "var(--cdp-web-borderRadius-full)",
  "borderRadius-input": "var(--cdp-web-borderRadius-lg)",
  "borderRadius-modal": "var(--cdp-web-borderRadius-xl)",
};

export default function LandingSignInPanel({
  onClose,
  onSuccess,
}: {
  onClose?: () => void;
  onSuccess?: () => void;
}) {
  const router = useRouter();
  const handleSuccess = () => {
    onSuccess?.();
    router.push("/dashboard");
  };
  return (
    <div
      className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center px-4 py-6 bg-black/40 backdrop-blur-md fade-up"
      style={{ animationDuration: "0.25s" }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-[18px] w-full max-w-md p-6 sm:p-8 shadow-[0_24px_60px_-12px_rgba(12,10,20,0.35)]"
      >
        {onClose && (
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute top-3 right-3 text-foreground/40 hover:text-foreground text-2xl leading-none px-2"
          >
            ×
          </button>
        )}
        <CDPReactProvider config={config} theme={theme}>
          <SignIn onSuccess={handleSuccess} />
        </CDPReactProvider>
      </div>
    </div>
  );
}
