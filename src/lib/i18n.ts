"use client";

import { useSyncExternalStore } from "react";

/**
 * useLang — React hook that mirrors `LangToggle`'s external store.
 * Reads localStorage("mickle.lang") and re-renders on the same custom event
 * `LangToggle` already dispatches, so toggling the pill anywhere on the page
 * instantly retranslates every component using this hook.
 */
export type Lang = "en" | "zh";

const STORAGE_KEY = "mickle.lang";
const EVENT_NAME = "mickle:lang-change";

function read(): Lang {
  if (typeof window === "undefined") return "en";
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "zh" ? "zh" : "en";
  } catch {
    return "en";
  }
}

function subscribe(cb: () => void) {
  window.addEventListener("storage", cb);
  window.addEventListener(EVENT_NAME, cb);
  return () => {
    window.removeEventListener("storage", cb);
    window.removeEventListener(EVENT_NAME, cb);
  };
}

export function useLang(): Lang {
  return useSyncExternalStore<Lang>(subscribe, read, () => "en");
}

/**
 * Dict shape: each key maps to a per-language string. Lookup is exact;
 * a missing translation falls back to the English value, so half-translated
 * pages degrade to English instead of breaking the layout.
 */
export type Dict = Record<string, { en: string; zh: string }>;

export function t<D extends Dict>(dict: D, key: keyof D, lang: Lang): string {
  const entry = dict[key];
  if (!entry) return String(key);
  return entry[lang] ?? entry.en;
}
