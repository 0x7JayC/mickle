"use client";

import { useEffect, useState } from "react";
import { useLang, t, type Dict } from "@/lib/i18n";
import { useSolanaAddress, useSendSolanaTransaction } from "@coinbase/cdp-hooks";
import bs58 from "bs58";

const dict: Dict = {
  topUp: { en: "Top up", zh: "充值" },
  close: { en: "Close", zh: "关闭" },
  howManyDays: { en: "How many days?", zh: "充几天?" },
  preFund: { en: "Pre-fund your streak. £1 routes into the S&P 500 each day you tap.", zh: "为你的连胜预付资金。每打卡一天,£1 自动投入 S&P 500。" },
  demoMode: { en: "Demo mode · no real money", zh: "演示模式 · 无真实资金" },
  demoBody: { en: "Production routes GBP through Open Banking to a Kraken treasury (~0.2% all-in). See ", zh: "正式版通过开放银行将 GBP 路由到 Kraken 金库(全程约 0.2%)。详见 " },
  demoBodyTail: { en: " for architecture.", zh: " 了解架构。" },
  walletMode: { en: "Pay from your Solana wallet", zh: "用 Solana 钱包支付" },
  walletBody: { en: "Sign a USDC or SOL transfer from your Solana wallet to the Mickle treasury. No fiat on-ramp needed.", zh: "从你的 Solana 钱包向 Mickle 金库签署 USDC 或 SOL 转账。无需法币入金。" },
  applePayCta: { en: "Pay £{n} with Apple Pay", zh: "用 Apple Pay 支付 £{n}" },
  applePayBody: { en: "Card or Apple Pay → USDC, settled to the Mickle treasury via Coinbase. Includes a ~2% on-ramp fee.", zh: "银行卡或 Apple Pay → USDC,通过 Coinbase 结算至 Mickle 金库。包含约 2% 入金费。" },
  orPayCrypto: { en: "or pay with crypto wallet", zh: "或使用加密钱包支付" },
  openingOnramp: { en: "Opening Coinbase…", zh: "正在打开 Coinbase…" },
  rateLineUsdc: { en: "≈ {n} USDC at today's rate", zh: "按今日汇率 ≈ {n} USDC" },
  rateLineSol: { en: "≈ {n} SOL at today's rate", zh: "按今日汇率 ≈ {n} SOL" },
  onrampFee: { en: "On-ramp fee · ~2% (Coinbase)", zh: "入金费 · 约 2%(Coinbase)" },
  mickleFee: { en: "Mickle fee · 0.99%", zh: "Mickle 手续费 · 0.99%" },
  payToken: { en: "Pay with", zh: "支付方式" },
  days: { en: "days", zh: "天" },
  bestFit: { en: "best fit", zh: "推荐" },
  bestFee: { en: "best fee", zh: "费率最优" },
  fee: { en: "Fee · 0.99%", zh: "手续费 · 0.99%" },
  intoSpx: { en: "Into your S&P 500", zh: "进入你的 S&P 500" },
  recordingDemo: { en: "Recording demo top-up…", zh: "记录演示充值中…" },
  simulate: { en: "Simulate £{n} top-up", zh: "模拟充值 £{n}" },
  provisioning: { en: "Provisioning wallet…", zh: "钱包创建中…" },
  continue: { en: "Continue · £{n}", zh: "继续 · £{n}" },
  payUsdc: { en: "Pay £{n} with USDC", zh: "用 USDC 支付 £{n}" },
  paySol: { en: "Pay £{n} with SOL", zh: "用 SOL 支付 £{n}" },
  signing: { en: "Confirm in wallet…", zh: "请在钱包中确认…" },
  txError: { en: "Transfer failed. Make sure your wallet has enough balance plus a little SOL for fees.", zh: "转账失败。请确认钱包余额充足,且有少量 SOL 作为手续费。" },
  footerDemo: { en: "Hackathon demo. Production replaces this with Open Banking + Kraken treasury, sub-0.5% all-in.", zh: "黑客松演示。正式版替换为 Open Banking + Kraken 金库,全程 0.5% 以下。" },
  footerWallet: { en: "USDC settles to the Mickle treasury on Solana, then auto-swaps into SPYx on your daily tap.", zh: "USDC 结算至 Solana 上的 Mickle 金库,在每日打卡时自动兑换为 SPYx。" },
  footerProd: { en: "Pay by UK bank transfer or card. Funds settle to USDC on Solana, then auto-swap into SPYx on your daily tap.", zh: "通过英国银行转账或银行卡支付。资金以 USDC 结算到 Solana,每日打卡时自动兑换为 SPYx。" },
};

const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
const USDC_DECIMALS = 6;
const SOL_DECIMALS = 9;
type PayToken = "USDC" | "SOL";

const fmtN = (s: string, n: number | string) => s.replace("{n}", String(n));

const PRESETS = [
  { gbp: 5, days: 5, tag: null as null | "bestFit" | "bestFee" },
  { gbp: 30, days: 30, tag: "bestFit" as const },
  { gbp: 90, days: 90, tag: "bestFee" as const },
];

const FEE_PCT = 0.0099;

export default function DepositModal({
  wallet,
  email,
  onClose,
  onConfirmDemo,
  onConfirmDeposit,
  onLaunchOnramp,
}: {
  wallet: string | null;
  email: string | null;
  onClose: () => void;
  onConfirmDemo?: (gbp: number) => void;
  onConfirmDeposit?: (gbp: number, txSig: string) => void;
  onLaunchOnramp?: (gbp: number) => Promise<void>;
}) {
  const lang = useLang();
  const [amount, setAmount] = useState(30);
  const [confirming, setConfirming] = useState(false);
  const [openingOnramp, setOpeningOnramp] = useState(false);
  const [showWalletPath, setShowWalletPath] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gbpUsdRate, setGbpUsdRate] = useState<number | null>(null);
  const [gbpPerSol, setGbpPerSol] = useState<number | null>(null);
  const [token, setToken] = useState<PayToken>("USDC");
  const transakKey = process.env.NEXT_PUBLIC_TRANSAK_API_KEY;
  const transakEnv = process.env.NEXT_PUBLIC_TRANSAK_ENV || "STAGING";
  const treasury = process.env.NEXT_PUBLIC_MICKLE_TREASURY;
  const onrampEnabled = !!process.env.NEXT_PUBLIC_COINBASE_PROJECT_ID;

  // Mode: wallet-first (v0). Falls through to Transak if it's wired, else demo.
  const mode: "wallet" | "transak" | "demo" = treasury
    ? "wallet"
    : transakKey
      ? "transak"
      : "demo";

  const { solanaAddress } = useSolanaAddress();
  const { sendSolanaTransaction } = useSendSolanaTransaction();

  // GBP→USDC + GBP→SOL reference rates. Coingecko public endpoint, no key.
  useEffect(() => {
    if (mode !== "wallet") return;
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=usd-coin,solana&vs_currencies=gbp",
          { cache: "no-store" },
        );
        const j = (await r.json()) as {
          "usd-coin"?: { gbp?: number };
          solana?: { gbp?: number };
        };
        const gbpPerUsdc = j["usd-coin"]?.gbp;
        const solGbp = j.solana?.gbp;
        if (!cancelled) {
          if (typeof gbpPerUsdc === "number" && gbpPerUsdc > 0) setGbpUsdRate(gbpPerUsdc);
          if (typeof solGbp === "number" && solGbp > 0) setGbpPerSol(solGbp);
        }
      } catch {
        if (!cancelled) {
          setGbpUsdRate(0.79); // ~ April 2026 fallback
          setGbpPerSol(120); // ~ April 2026 fallback (£/SOL)
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [mode]);

  const fee = amount * FEE_PCT;
  // Coinbase Onramp's headline fee for card / Apple Pay flows is around
  // 2%. Show it inline when the user is on the Apple Pay path so the
  // breakdown matches what Coinbase will actually charge.
  const ONRAMP_FEE_PCT = 0.02;
  const showOnrampFee = mode === "wallet" && onrampEnabled && !showWalletPath;
  const onrampFee = showOnrampFee ? amount * ONRAMP_FEE_PCT : 0;
  const net = amount - fee - onrampFee;
  const usdcAmount = gbpUsdRate ? amount / gbpUsdRate : null;
  const solAmount = gbpPerSol ? amount / gbpPerSol : null;
  const tokenAmount = token === "USDC" ? usdcAmount : solAmount;

  const start = async () => {
    setError(null);
    if (mode === "demo") {
      setConfirming(true);
      await new Promise((r) => setTimeout(r, 700));
      onConfirmDemo?.(amount);
      setConfirming(false);
      onClose();
      return;
    }

    if (mode === "transak") {
      if (!wallet) return;
      const base =
        transakEnv === "PRODUCTION"
          ? "https://global.transak.com"
          : "https://global-stg.transak.com";
      const params = new URLSearchParams({
        apiKey: transakKey!,
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
      return;
    }

    // mode === "wallet" — sign a USDC SPL or native SOL transfer to the
    // treasury via the CDP embedded wallet. The wallet prop and the
    // CDP-managed solanaAddress should match (both come from the same
    // signed-in user's embedded account).
    const owner = solanaAddress ?? wallet;
    if (!owner || !treasury || !tokenAmount) return;
    setConfirming(true);
    try {
      const web3 = await import("@solana/web3.js");
      const { Connection, PublicKey, TransactionMessage, VersionedTransaction, SystemProgram } = web3;

      const rpc = process.env.NEXT_PUBLIC_SOLANA_RPC || "https://api.mainnet-beta.solana.com";
      const conn = new Connection(rpc, "confirmed");
      const ownerPk = new PublicKey(owner);
      const treasuryPk = new PublicKey(treasury);

      let ixs;
      if (token === "USDC") {
        const spl = await import("@solana/spl-token");
        const mint = new PublicKey(USDC_MINT);
        const srcAta = spl.getAssociatedTokenAddressSync(mint, ownerPk);
        const destAta = spl.getAssociatedTokenAddressSync(mint, treasuryPk);
        const lamports = BigInt(Math.round(tokenAmount * 10 ** USDC_DECIMALS));
        ixs = [
          // Idempotent: no-op if treasury ATA already exists.
          spl.createAssociatedTokenAccountIdempotentInstruction(ownerPk, destAta, treasuryPk, mint),
          spl.createTransferCheckedInstruction(srcAta, mint, destAta, ownerPk, lamports, USDC_DECIMALS),
        ];
      } else {
        // Native SOL — SystemProgram.transfer in lamports.
        const lamports = Math.round(tokenAmount * 10 ** SOL_DECIMALS);
        ixs = [
          SystemProgram.transfer({ fromPubkey: ownerPk, toPubkey: treasuryPk, lamports }),
        ];
      }

      const { blockhash } = await conn.getLatestBlockhash("confirmed");
      const msg = new TransactionMessage({
        payerKey: ownerPk,
        recentBlockhash: blockhash,
        instructions: ixs,
      }).compileToV0Message();
      const tx = new VersionedTransaction(msg);
      // CDP expects the transaction as base64. SolanaAddress here is
      // typed; we cast the string to the branded type CDP expects.
      const txBase64 = Buffer.from(tx.serialize()).toString("base64");
      const result = await sendSolanaTransaction({
        solanaAccount: owner as `${string}`,
        network: "solana",
        transaction: txBase64,
      });
      const txSig = result.transactionSignature;
      onConfirmDeposit?.(amount, txSig);
      setConfirming(false);
      onClose();
    } catch (e) {
      console.error("[deposit] wallet path failed", e);
      // Surface the underlying message so we can debug live tests.
      const msg = (e as { message?: string })?.message;
      setError(msg ? `${t(dict, "txError", lang)} (${msg})` : t(dict, "txError", lang));
      setConfirming(false);
    }
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

        {mode === "demo" && (
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

        {mode === "wallet" && (!onrampEnabled || showWalletPath) && (
          <>
            <div className="rounded-2xl border border-foreground/10 bg-foreground/[0.03] px-4 py-3 mb-4">
              <div className="text-[12px] font-semibold text-foreground/85 mb-0.5">
                {t(dict, "walletMode", lang)}
              </div>
              <p className="text-[11px] text-foreground/65 leading-relaxed">
                {t(dict, "walletBody", lang)}
              </p>
            </div>
            <div className="mb-5">
              <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/55 mb-2">
                {t(dict, "payToken", lang)}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {(["USDC", "SOL"] as const).map((tok) => {
                  const active = token === tok;
                  return (
                    <button
                      key={tok}
                      onClick={() => setToken(tok)}
                      className={`rounded-[14px] py-2.5 text-sm font-semibold tracking-tight transition border-2 ${
                        active
                          ? "border-accent bg-accent/5 text-foreground"
                          : "border-foreground/10 text-foreground/65 hover:border-foreground/25"
                      }`}
                    >
                      {tok}
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {mode === "wallet" && onrampEnabled && !showWalletPath && (
          <div className="rounded-2xl border border-foreground/10 bg-foreground/[0.03] px-4 py-3 mb-5">
            <p className="text-[12px] text-foreground/70 leading-relaxed">
              {t(dict, "applePayBody", lang)}
            </p>
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
          {showOnrampFee && (
            <Row
              label={t(dict, "onrampFee", lang)}
              value={`−£${onrampFee.toFixed(2)}`}
              muted
            />
          )}
          <Row
            label={t(dict, showOnrampFee ? "mickleFee" : "fee", lang)}
            value={`−£${fee.toFixed(2)}`}
            muted
          />
          <div className="h-px bg-foreground/10 my-2" />
          <Row label={t(dict, "intoSpx", lang)} value={`£${net.toFixed(2)}`} bold />
          {mode === "wallet" && tokenAmount && (
            <p className="text-[11px] text-foreground/55 mt-2 text-right tabular-nums">
              {fmtN(
                t(dict, token === "USDC" ? "rateLineUsdc" : "rateLineSol", lang),
                token === "USDC" ? tokenAmount.toFixed(2) : tokenAmount.toFixed(4),
              )}
            </p>
          )}
        </div>

        {error && (
          <p className="text-[12px] text-red-600 mb-3 text-center leading-relaxed">{error}</p>
        )}

        {mode === "wallet" && onrampEnabled && !showWalletPath ? (
          <>
            <button
              onClick={async () => {
                setError(null);
                setOpeningOnramp(true);
                try {
                  await onLaunchOnramp?.(amount);
                } catch (e) {
                  setError((e as Error).message ?? "onramp launch failed");
                } finally {
                  setOpeningOnramp(false);
                }
              }}
              disabled={openingOnramp}
              className="glass-button-primary w-full py-4 font-bold text-base disabled:opacity-50"
            >
              {openingOnramp
                ? t(dict, "openingOnramp", lang)
                : fmtN(t(dict, "applePayCta", lang), amount)}
            </button>
            <button
              onClick={() => setShowWalletPath(true)}
              className="block mx-auto mt-3 text-[12px] text-foreground/55 hover:text-foreground underline underline-offset-4"
            >
              {t(dict, "orPayCrypto", lang)}
            </button>
          </>
        ) : (
          <button
            onClick={start}
            disabled={
              confirming ||
              (mode !== "demo" && !wallet) ||
              (mode === "wallet" && !tokenAmount)
            }
            className="glass-button-primary w-full py-4 font-bold text-base disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {confirming
              ? mode === "wallet"
                ? t(dict, "signing", lang)
                : t(dict, "recordingDemo", lang)
              : mode === "demo"
                ? fmtN(t(dict, "simulate", lang), amount)
                : !wallet
                  ? t(dict, "provisioning", lang)
                  : mode === "wallet"
                    ? fmtN(t(dict, token === "USDC" ? "payUsdc" : "paySol", lang), amount)
                    : fmtN(t(dict, "continue", lang), amount)}
          </button>
        )}

        <p className="text-[11px] text-foreground/50 mt-4 leading-relaxed text-center">
          {mode === "demo"
            ? t(dict, "footerDemo", lang)
            : mode === "wallet"
              ? t(dict, "footerWallet", lang)
              : t(dict, "footerProd", lang)}
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
