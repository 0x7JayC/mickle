"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useLang, t, type Dict } from "@/lib/i18n";

const dict: Dict = {
  accountSettings: { en: "Account settings", zh: "账户设置" },
  account: { en: "Account", zh: "账户" },
  close: { en: "Close", zh: "关闭" },
  settings: { en: "Settings", zh: "设置" },
  signedInAs: { en: "Signed in as", zh: "登录为" },
  manage: { en: "Manage", zh: "管理" },
  addAnother: { en: "Add another", zh: "添加其他" },
  lifetime: { en: "Lifetime", zh: "累计" },
  streak: { en: "Streak", zh: "连胜" },
  days: { en: "days", zh: "天" },
  contributed: { en: "Contributed", zh: "已投入" },
  wallets: { en: "Wallets", zh: "钱包" },
  wallet: { en: "wallet", zh: "个钱包" },
  walletsUnit: { en: "wallets", zh: "个钱包" },
  memberSince: { en: "Member since", zh: "加入于" },
  danger: { en: "Danger zone", zh: "危险区" },
  signOut: { en: "Sign out", zh: "退出登录" },
};

export default function SettingsDrawer({
  open,
  onClose,
  email,
  contributed,
  streak,
  walletCount,
  onSignOut,
}: {
  open: boolean;
  onClose: () => void;
  email: string;
  contributed: number;
  streak: number;
  walletCount: number;
  onSignOut: () => void;
}) {
  const lang = useLang();
  const { linkEmail, user } = usePrivy();
  if (!open) return null;
  const fmtGbp = (v: number) =>
    v.toLocaleString("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 2 });
  const emails = (user?.linkedAccounts ?? []).filter((a) => a.type === "email") as {
    address?: string;
  }[];
  return (
    <div
      className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center px-4 py-6 bg-black/40 backdrop-blur-md fade-up"
      style={{ animationDuration: "0.25s" }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t(dict, "accountSettings", lang)}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-[18px] w-full max-w-md p-6 sm:p-8 shadow-[0_24px_60px_-12px_rgba(12,10,20,0.35)]"
      >
        <div className="flex items-start justify-between mb-1">
          <span className="text-[11px] uppercase tracking-[0.22em] font-mono text-foreground/55">
            {t(dict, "account", lang)}
          </span>
          <button
            onClick={onClose}
            aria-label={t(dict, "close", lang)}
            className="text-foreground/40 hover:text-foreground text-2xl leading-none -mt-1 -mr-1 px-2"
          >
            ×
          </button>
        </div>
        <h2 className="text-display text-2xl sm:text-3xl font-bold tracking-tight mb-5">
          {t(dict, "settings", lang)}
        </h2>

        <Section label={t(dict, "signedInAs", lang)}>
          <div className="flex items-center justify-between gap-3">
            <code className="font-mono text-[14px] text-foreground/85 break-all">{email}</code>
            <button
              onClick={() => linkEmail()}
              className="shrink-0 text-[12px] text-accent font-semibold hover:underline"
            >
              {emails.length > 1 ? t(dict, "manage", lang) : t(dict, "addAnother", lang)}
            </button>
          </div>
        </Section>

        <Section label={t(dict, "lifetime", lang)}>
          <div className="grid grid-cols-2 gap-3">
            <Stat k={t(dict, "streak", lang)} v={`${streak}`} suffix={t(dict, "days", lang)} />
            <Stat k={t(dict, "contributed", lang)} v={fmtGbp(contributed)} />
            <Stat
              k={t(dict, "wallets", lang)}
              v={`${walletCount}`}
              suffix={walletCount === 1 ? t(dict, "wallet", lang) : t(dict, "walletsUnit", lang)}
            />
            <Stat k={t(dict, "memberSince", lang)} v={joinedLabel(user?.createdAt, lang)} />
          </div>
        </Section>

        <Section label={t(dict, "danger", lang)}>
          <button
            onClick={onSignOut}
            className="w-full text-[14px] font-semibold text-foreground/70 hover:text-foreground border border-foreground/15 rounded-full px-5 py-2.5 transition"
          >
            {t(dict, "signOut", lang)}
          </button>
        </Section>
      </div>
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <div className="text-[11px] uppercase tracking-[0.22em] font-mono text-foreground/55 mb-2">
        {label}
      </div>
      {children}
    </div>
  );
}

function Stat({ k, v, suffix }: { k: string; v: string; suffix?: string }) {
  return (
    <div className="rounded-[18px] border border-foreground/10 px-3 py-2.5">
      <div className="text-[10px] uppercase tracking-[0.18em] font-mono text-foreground/55 mb-0.5">
        {k}
      </div>
      <div className="text-[15px] font-bold tracking-tight tabular-nums">
        {v}
        {suffix && <span className="text-[12px] font-normal text-foreground/55 ml-1">{suffix}</span>}
      </div>
    </div>
  );
}

function joinedLabel(d: Date | string | undefined, lang: "en" | "zh"): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString(lang === "zh" ? "zh-CN" : "en-GB", { month: "short", year: "numeric" });
}
