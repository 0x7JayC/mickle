"use client";

import { SignIn } from "@coinbase/cdp-react";
import { useRouter } from "next/navigation";

// Inline sign-in panel. CDP provider is mounted at root layout so the
// SignIn component reads from the page-wide context — this means the
// same provider survives OAuth redirect-returns to the landing.
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
        className="bg-white rounded-[18px] w-full max-w-md p-6 sm:p-8 shadow-[0_24px_60px_-12px_rgba(12,10,20,0.35)] relative"
      >
        {onClose && (
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute top-3 right-3 text-foreground/40 hover:text-foreground text-2xl leading-none px-2 z-10"
          >
            ×
          </button>
        )}
        <SignIn onSuccess={handleSuccess} />
      </div>
    </div>
  );
}
