"use client";

// Unified auth hook. Picks whichever sign-in path the user took:
//   - CDP (email / Apple / Google) → cdp-hooks own everything.
//   - SIWS (Solana wallet) → JWT in localStorage, pubkey is the
//     wallet address.
//
// Returns a single shape so dashboard / modal code doesn't have to
// branch on provider every time it needs a token or address.
// All callbacks are useCallback-stabilised so consumers can safely
// put them in useEffect deps without infinite-loop re-renders.

import { useCallback, useEffect, useRef, useState } from "react";
import {
  useIsInitialized,
  useIsSignedIn,
  useCurrentUser,
  useGetAccessToken,
  useSolanaAddress,
  useSignOut,
} from "@coinbase/cdp-hooks";
import {
  MICKLE_SIWS_KEY,
  MICKLE_SIWS_AUTHID_KEY,
} from "@/components/SiwsConnectButton";

export type MickleAuth = {
  /** SDK + storage have both finished initializing. */
  ready: boolean;
  /** True if either path has an active session. */
  isSignedIn: boolean;
  /** The user's primary Solana address — embedded (CDP) or external (SIWS). */
  solanaAddress: string | null;
  /** Verified email if the user took the CDP path; null on SIWS. */
  email: string | null;
  /** Bearer token for /api/* calls. Null if not signed in. */
  getAccessToken: () => Promise<string | null>;
  /** Drop both sessions and let callers redirect. */
  signOut: () => Promise<void>;
  /** 'cdp' | 'siws' | null — surfaced for analytics / UI hints. */
  provider: "cdp" | "siws" | null;
};

function readSiwsJwt(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(MICKLE_SIWS_KEY);
}

function readSiwsAuthId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(MICKLE_SIWS_AUTHID_KEY);
}

export function useMickleAuth(): MickleAuth {
  const { isInitialized: cdpReady } = useIsInitialized();
  const { isSignedIn: cdpSignedIn } = useIsSignedIn();
  const { currentUser } = useCurrentUser();
  const { solanaAddress: cdpAddress } = useSolanaAddress();
  const { getAccessToken: cdpGetToken } = useGetAccessToken();
  const { signOut: cdpSignOut } = useSignOut();

  // Read SIWS state from localStorage. Hydration-safe: start null,
  // populate after mount, listen for storage events from other tabs.
  const [siwsJwt, setSiwsJwt] = useState<string | null>(null);
  const [siwsAuthId, setSiwsAuthId] = useState<string | null>(null);

  useEffect(() => {
    setSiwsJwt(readSiwsJwt());
    setSiwsAuthId(readSiwsAuthId());
    const handler = () => {
      setSiwsJwt(readSiwsJwt());
      setSiwsAuthId(readSiwsAuthId());
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const cdpEmail = currentUser?.authenticationMethods?.email?.email ?? null;
  const siwsAddress = siwsAuthId?.startsWith("siws:")
    ? siwsAuthId.slice("siws:".length)
    : null;

  // CDP wins if the user is signed in there. SIWS is the fallback.
  const provider: MickleAuth["provider"] = cdpSignedIn
    ? "cdp"
    : siwsJwt
      ? "siws"
      : null;

  const isSignedIn = provider !== null;
  const ready = cdpReady; // SIWS reads sync once hydrated

  const solanaAddress =
    provider === "cdp" ? (cdpAddress as string | null) ?? null : siwsAddress;
  const email = provider === "cdp" ? cdpEmail : null;

  // Stash the live values in a ref so the stable callbacks below
  // always read fresh state without changing identity. Without this,
  // consumers that put getAccessToken in useEffect deps would loop:
  // every render builds a new function, effect re-fires, setState
  // triggers another render, repeat.
  const stateRef = useRef({ provider, siwsJwt, cdpGetToken, cdpSignedIn, cdpSignOut });
  stateRef.current = { provider, siwsJwt, cdpGetToken, cdpSignedIn, cdpSignOut };

  const getAccessToken = useCallback(async (): Promise<string | null> => {
    const s = stateRef.current;
    if (s.provider === "cdp") return await s.cdpGetToken();
    if (s.provider === "siws") return s.siwsJwt;
    return null;
  }, []);

  const signOut = useCallback(async () => {
    const s = stateRef.current;
    if (s.cdpSignedIn) {
      await s.cdpSignOut();
    }
    if (typeof window !== "undefined") {
      localStorage.removeItem(MICKLE_SIWS_KEY);
      localStorage.removeItem(MICKLE_SIWS_AUTHID_KEY);
    }
    setSiwsJwt(null);
    setSiwsAuthId(null);
  }, []);

  return {
    ready,
    isSignedIn,
    solanaAddress,
    email,
    getAccessToken,
    signOut,
    provider,
  };
}
