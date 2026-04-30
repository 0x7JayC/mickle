"use client";

import { useEffect, useState } from "react";
import { useLang, t, type Dict } from "@/lib/i18n";

const KEY = "mickle:onboarded";

const dict: Dict = {
  dismiss: { en: "Dismiss", zh: "关闭" },
  welcome: { en: "Welcome to Mickle", zh: "欢迎来到 Mickle" },
  title: { en: "Your wallet is ready. Two steps to your first streak.", zh: "钱包已就绪。两步开启你的连续打卡。" },
  step1: { en: "Top up £10 / £30 / £90 — pre-funds your daily ritual.", zh: "充值 £10 / £30 / £90 —— 为每日仪式预付资金。" },
  step2: { en: "Tap once a day. £1 routes into the S&P 500. Watch your streak compound.", zh: "每天打卡一次。£1 自动投入 S&P 500。看连胜复利。" },
  topUpStart: { en: "Top up to start →", zh: "充值开始 →" },
  later: { en: "Maybe later", zh: "稍后再说" },
};

export default function OnboardingBanner({
  streak,
  contributed,
  onTopUp,
}: {
  streak: number;
  contributed: number;
  onTopUp: () => void;
}) {
  const lang = useLang();
  const [dismissed, setDismissed] = useState(true); // hidden until hydrated

  useEffect(() => {
    setDismissed(localStorage.getItem(KEY) === "1");
  }, []);

  // Auto-dismiss once user has tapped or topped up
  if (streak > 0 || contributed > 0 || dismissed) return null;

  const close = () => {
    localStorage.setItem(KEY, "1");
    setDismissed(true);
  };

  return (
    <div
      className="rounded-[18px] p-5 mb-6 border relative overflow-hidden"
      style={{
        background: "rgba(255,122,89,0.08)",
        borderColor: "rgba(255,122,89,0.28)",
      }}
    >
      <button
        onClick={close}
        aria-label={t(dict, "dismiss", lang)}
        className="absolute top-2 right-3 text-foreground/40 hover:text-foreground text-xl leading-none"
      >
        ×
      </button>
      <div className="flex items-start gap-4">
        <div
          className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-xl"
          style={{ background: "var(--accent)" }}
          aria-hidden
        >
          👋
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[11px] uppercase tracking-[0.22em] font-mono text-accent font-bold">
            {t(dict, "welcome", lang)}
          </div>
          <h3 className="text-lg sm:text-xl font-bold tracking-tight mt-0.5">
            {t(dict, "title", lang)}
          </h3>
          <ol className="mt-3 space-y-1.5 text-[14px] text-foreground/75">
            <li className="flex items-start gap-2">
              <span className="text-foreground/40 font-mono text-[12px] mt-0.5">1.</span>
              <span>{t(dict, "step1", lang)}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-foreground/40 font-mono text-[12px] mt-0.5">2.</span>
              <span>{t(dict, "step2", lang)}</span>
            </li>
          </ol>
          <div className="mt-4 flex items-center gap-2">
            <button
              onClick={() => {
                close();
                onTopUp();
              }}
              className="glass-button-primary px-5 py-2 text-sm font-semibold"
            >
              {t(dict, "topUpStart", lang)}
            </button>
            <button
              onClick={close}
              className="text-[13px] text-foreground/55 hover:text-foreground px-3 py-2"
            >
              {t(dict, "later", lang)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
