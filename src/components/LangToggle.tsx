"use client";

import { useSyncExternalStore } from "react";

/**
 * Language toggle — segmented EN / 中 pill that lives in the site nav.
 *
 * What it does today:
 *   · Persists user choice in localStorage (`mickle.lang`)
 *   · Updates <html lang> attribute (so screen readers + future i18n hook in)
 *   · Sets <html data-lang> so any CSS / JS can react
 *   · Cross-tab sync via `storage` event + same-tab sync via custom event
 *
 * What it does NOT do yet:
 *   · Translate site copy. The site is English-only at the moment.
 *     Once strings are extracted into a dictionary, this toggle drives them.
 *
 * Pattern: useSyncExternalStore — the React-recommended way to subscribe to
 * an external source of truth (here: localStorage). Avoids the
 * "setState-inside-useEffect" anti-pattern.
 */
type Lang = "en" | "zh";

const STORAGE_KEY = "mickle.lang";
const EVENT_NAME = "mickle:lang-change";

function readStored(): Lang {
  if (typeof window === "undefined") return "en";
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "zh" ? "zh" : "en";
  } catch {
    return "en";
  }
}

function writeStored(lang: Lang) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    /* private mode etc. */
  }
  document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
  document.documentElement.dataset.lang = lang;
  window.dispatchEvent(new Event(EVENT_NAME));
}

function subscribe(cb: () => void) {
  window.addEventListener("storage", cb);
  window.addEventListener(EVENT_NAME, cb);
  return () => {
    window.removeEventListener("storage", cb);
    window.removeEventListener(EVENT_NAME, cb);
  };
}

export function LangToggle() {
  const lang = useSyncExternalStore<Lang>(
    subscribe,
    readStored,
    () => "en", // server snapshot — SSR is always English
  );

  const onPick = (next: Lang) => {
    if (next !== lang) writeStored(next);
  };

  return (
    <div
      role="group"
      aria-label="Language"
      className="inline-flex items-center rounded-full p-[3px] border"
      style={{
        background: "rgba(10,10,10,0.05)",
        borderColor: "rgba(10,10,10,0.06)",
        boxShadow: "inset 0 1px 0 rgba(10,10,10,0.04)",
      }}
    >
      <LangButton active={lang === "en"} onClick={() => onPick("en")} label="EN" />
      <LangButton active={lang === "zh"} onClick={() => onPick("zh")} label="中" />
    </div>
  );
}

function LangButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className="px-[11px] py-[5px] text-[12px] font-bold tracking-wide rounded-full leading-none transition-[background-color,color,opacity,box-shadow,transform] active:scale-[0.94]"
      style={{
        background: active ? "var(--foreground, #0a0a0a)" : "transparent",
        color: active ? "#fff" : "var(--foreground, #0a0a0a)",
        opacity: active ? 1 : 0.55,
        boxShadow: active
          ? "inset 0 1px 0 rgba(255,255,255,0.14), 0 1px 2px rgba(10,10,10,0.2)"
          : "none",
      }}
    >
      {label}
    </button>
  );
}
