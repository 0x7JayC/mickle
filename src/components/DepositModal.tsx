"use client";

import { useState } from "react";
import { useLang, t, type Dict } from "@/lib/i18n";

const dict: Dict = {
  topUp: { en: "Top up", zh: "充值" },
  close: { en: "Close", zh: "关闭" },
  howManyDays: { en: "How many days?", zh: "充几天?" },
  preFund: { en: "Pre-fund your streak. £1 routes into the S&P 500 each day you tap.", zh: "为你的连胜预付资金。每打卡一天,£1 自动投入 S&P 500。" },
  demoMode: { en: "Demo mode · no real money", zh: "演示模式 · 无真实资金" },
  demoBody: { en: "Production routes GBP through Open Banking to a Kraken treasury (~0.2% all-in). See ", zh: "正式版通过开放银行将 GBP 路由到 Kraken 金库(全程约 0.2%)。详见 " },
  demoBodyTail: { en: " for architecture.", zh: " 了解架构。" },
  days: { en: "days", zh: "天" },
  bestFit: { en: "best fit", zh: "推荐" },
  bestFee: { en: "best fee", zh: "费率最优" },
  fee: { en: "Fee · 0.99%", zh: "手续费 · 0.99%" },
  intoSpx: { en: "Into your S&P 500", zh: "进入你的 S&P 500" },
  recordingDemo: { en: "Recording demo top-up…", zh: "记录演示充值中…" },
  simulate: { en: "Simulate £{n} top-up", zh: "模拟充值 £{n}" },
  provisioning: { en: "Provisioning wallet…", zh: "钱包创建中…" },
  continue: { en: "Continue · £{n}", zh: "继续 · £{n}" },
  footerDemo: { en: "Hackathon demo. Production replaces this with Open Banking + Kraken treasury, sub-0.5% all-in.", zh: "黑客松演示。正式版替换为 Open Banking + Kraken 金库,全程 0.5% 以下。" },
  footerProd: { en: "Pay by UK bank transfer or card. Funds settle to USDC on Solana, then auto-swap into SPYx on your daily tap.", zh: "通过英国银行转账或银行卡支付。资金以 USDC 结算到 Solana,每日打卡时自动兑换为 SPYx。" },
};

const fmtN = (s: string, n: number | string) => s.replace("{n}", String(n));

const PRESETS = [
  { gbp: 10, days: 10, tag: null as null | "bestFit" | "bestFee" },
  { gbp: 30, days: 30, tag: "bestFit" as const },
  { gbp: 90, days: 90, tag: "bestFee" as const },
];

const FEE_PCT = 0.0099;

export default function DepositModal({
  wallet,
  email,
  onClose,
  onConfirmDemo,
}: {
  wallet: string | null;
  email: string | null;
  onClose: () => void;
  onConfirmDemo?: (gbp: number) => void;
}) {
  const lang = useLang();
  const [amount, setAmount] = useState(30);
  const [confirming, setConfirming] = useState(false);
  const apiKey = process.env.NEXT_PUBLIC_TRANSAK_API_KEY;
  const env = process.env.NEXT_PUBLIC_TRANSAK_ENV || "STAGING";
  const isDemo = !apiKey;

  const fee = amount * FEE_PCT;
  const net = amount - fee;

  const start = async () => {
    if (isDemo) {
      setConfirming(true);
      await new Promise((r) => setTimeout(r, 700));
      onConfirmDemo?.(amount);
      onClose();
      return;
    }
    if (!wallet) return;
    const base =
      env === "PRODUCTION" ? "https://global.transak.com" : "https://global-stg.transak.com";
    const params = new URLSearchParams({
      apiKey: apiKey!,
      cryptoCurrencyCode: "USDC",
      network: "solana",
      fiatCurrency: "GBP",
      defaultFiatAmount: String(amount),
      walletAddress: wallet,
      disableWalletAddressForm: "true",
      hideMenu: "true",
      themeColor: "ff7a59",
      ...(email ? { email } : {}),
    });
    window.open(`${base}/?${params.toString()}`, "transak", "width=480,height=720");
    onClose();
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
        aria-label={t(dict, "topUp", lang)}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-[18px] w-full max-w-md p-6 sm:p-8 shadow-[0_24px_60px_-12px_rgba(12,10,20,0.35)]"
      >
        <div className="flex items-start justify-between mb-1">
          <span className="text-[11px] uppercase tracking-[0.22em] font-mono text-foreground/55">
            {t(dict, "topUp", lang)}
          </span>
          <button
            onClick={onClose}
            aria-label={t(dict, "close", lang)}
            className="text-foreground/40 hover:text-foreground text-2xl leading-none -mt-1 -mr-1 px-2"
          >
            ×
          </button>
        </div>
        <h2 className="text-display text-2xl sm:text-3xl font-bold tracking-tight mb-1">
          {t(dict, "howManyDays", lang)}
        </h2>
        <p className="text-[14px] text-foreground/65 mb-5 leading-relaxed">
          {t(dict, "preFund", lang)}
        </p>

        {isDemo && (
          <div className="rounded-2xl border border-amber-200/70 bg-amber-50 px-4 py-3 mb-5 flex items-start gap-3">
            <span className="text-amber-600 text-base leading-none mt-0.5">⚠</span>
            <div>
              <div className="text-[12px] font-semibold text-amber-900 mb-0.5">
                {t(dict, "demoMode", lang)}
              </div>
              <p className="text-[11px] text-amber-900/80 leading-relaxed">
                {t(dict, "demoBody", lang)}
                <code className="font-mono">MONEY.md</code>
                {t(dict, "demoBodyTail", lang)}
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-3 gap-2 mb-5">
          {PRESETS.map((p) => {
            const active = amount === p.gbp;
            return (
              <button
                key={p.gbp}
                onClick={() => setAmount(p.gbp)}
                className={`relative rounded-[18px] p-3 sm:p-4 text-left transition border-2 ${
                  active
                    ? "border-accent bg-accent/5 shadow-[0_8px_20px_-6px_rgba(255,122,89,0.35)]"
                    : "border-foreground/10 hover:border-foreground/25"
                }`}
              >
                <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-foreground/55 whitespace-nowrap">
                  {p.days} {t(dict, "days", lang)}
                </div>
                <div className="font-bold text-xl sm:text-2xl tracking-tight tabular-nums mt-1">
                  £{p.gbp}
                </div>
                {p.tag && (
                  <div className="font-mono text-[9px] uppercase tracking-[0.14em] text-accent/85 mt-1 hidden sm:block">
                    {t(dict, p.tag, lang)}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div className="rounded-2xl border border-foreground/10 p-4 mb-5 bg-foreground/[0.025]">
          <Row label={t(dict, "topUp", lang)} value={`£${amount.toFixed(2)}`} />
          <Row label={t(dict, "fee", lang)} value={`−£${fee.toFixed(2)}`} muted />
          <div className="h-px bg-foreground/10 my-2" />
          <Row label={t(dict, "intoSpx", lang)} value={`£${net.toFixed(2)}`} bold />
        </div>

        <button
          onClick={start}
          disabled={confirming || (!isDemo && !wallet)}
          className="glass-button-primary w-full py-4 font-bold text-base disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {confirming
            ? t(dict, "recordingDemo", lang)
            : isDemo
              ? fmtN(t(dict, "simulate", lang), amount)
              : !wallet
                ? t(dict, "provisioning", lang)
                : fmtN(t(dict, "continue", lang), amount)}
        </button>

        <p className="text-[11px] text-foreground/50 mt-4 leading-relaxed text-center">
          {isDemo ? t(dict, "footerDemo", lang) : t(dict, "footerProd", lang)}
        </p>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  muted = false,
  bold = false,
}: {
  label: string;
  value: string;
  muted?: boolean;
  bold?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between py-1">
      <span
        className={`text-[13px] ${muted ? "text-foreground/55" : "text-foreground/75"} ${
          bold ? "font-semibold text-foreground" : ""
        }`}
      >
        {label}
      </span>
      <span
        className={`tabular-nums ${
          bold
            ? "text-lg font-bold text-foreground"
            : muted
              ? "text-[13px] text-foreground/55"
              : "text-[14px] text-foreground/85"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
