"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useIsSignedIn } from "@coinbase/cdp-hooks";
import { useLang, t, type Dict } from "@/lib/i18n";

// The drawer is heavy (CDP form internals + assets); load it on first
// click so it's not in the landing's initial bundle.
const LandingSignInPanel = dynamic(() => import("./LandingSignInPanel"), {
  ssr: false,
});

const dict: Dict = {
  startStreak: { en: "Sign in with email · Apple · Google", zh: "邮箱 · Apple · Google 登录" },
  start: { en: "Sign in", zh: "登录" },
  openApp: { en: "Open app →", zh: "打开 App →" },
};

// Watch CDP auth state on landing so an OAuth round-trip (Google /
// Apple) lands the user on /dashboard automatically when they return
// signed in. Without this the drawer's onSuccess callback is gone by
// the time the redirect comes back and the user sees the landing.
function useRedirectWhenSignedIn() {
  const router = useRouter();
  const { isSignedIn } = useIsSignedIn();
  useEffect(() => {
    if (isSignedIn) router.push("/dashboard");
  }, [isSignedIn, router]);
}

// Primary CTA used at the bottom of the landing.
export function LandingAuth() {
  const lang = useLang();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  useRedirectWhenSignedIn();
  return (
    <>
      <div className="flex flex-col items-center gap-3 mb-12 sm:mb-12">
        <button
          onClick={() => setOpen(true)}
          className="glass-button-primary px-7 py-3.5 font-semibold"
        >
          {t(dict, "start", lang)}
        </button>
        <p className="text-[11px] text-foreground/45 font-mono uppercase tracking-[0.18em]">
          {t(dict, "startStreak", lang)}
        </p>
      </div>
      {open && (
        <LandingSignInPanel
          onClose={() => setOpen(false)}
          onSuccess={() => {
            setOpen(false);
            router.push("/dashboard");
          }}
        />
      )}
    </>
  );
}

// Compact version for the floating nav.
export function LandingNavCta() {
  const lang = useLang();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  useRedirectWhenSignedIn();
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="glass-button-primary px-5 py-2 text-sm font-semibold"
      >
        {t(dict, "start", lang)}
      </button>
      {open && (
        <LandingSignInPanel
          onClose={() => setOpen(false)}
          onSuccess={() => {
            setOpen(false);
            router.push("/dashboard");
          }}
        />
      )}
    </>
  );
}

// 'Open app' button used on /treasury. Opens the same inline drawer
// for signed-out visitors, or routes straight to /dashboard for
// signed-in ones.
export function OpenAppButton({
  className = "",
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  const lang = useLang();
  const router = useRouter();
  const { isSignedIn } = useIsSignedIn();
  const [open, setOpen] = useState(false);
  if (isSignedIn) {
    return (
      <button
        onClick={() => router.push("/dashboard")}
        className={className || "text-sm font-semibold text-foreground/70 hover:text-foreground"}
      >
        {children ?? t(dict, "openApp", lang)}
      </button>
    );
  }
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={className || "text-sm font-semibold text-foreground/70 hover:text-foreground"}
      >
        {children ?? t(dict, "openApp", lang)}
      </button>
      {open && (
        <LandingSignInPanel
          onClose={() => setOpen(false)}
          onSuccess={() => {
            setOpen(false);
            router.push("/dashboard");
          }}
        />
      )}
    </>
  );
}
