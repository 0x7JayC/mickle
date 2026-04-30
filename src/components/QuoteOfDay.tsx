"use client";

import { getQuoteOfDay } from "@/lib/quotes";
import { useLang, t, type Dict } from "@/lib/i18n";

const dict: Dict = {
  aria: { en: "Quote of the day", zh: "每日箴言" },
  label: { en: "Quote of the day", zh: "每日箴言" },
};

// Daily Christian / literary quote that opens the dashboard. Bible
// verses + Christian thinkers + Goodreads-tier secular classics. No
// other religious traditions.
export default function QuoteOfDay() {
  const lang = useLang();
  const q = getQuoteOfDay();
  const today = new Date().toLocaleDateString(lang === "zh" ? "zh-CN" : "en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
  return (
    <section
      className="rounded-[18px] border border-foreground/10 bg-white px-5 sm:px-7 py-5 mb-6"
      aria-label={t(dict, "aria", lang)}
    >
      <div className="flex items-baseline justify-between gap-3 mb-3">
        <span className="text-[11px] uppercase tracking-[0.22em] font-mono text-accent font-bold">
          {t(dict, "label", lang)}
        </span>
        <span className="text-[11px] font-mono text-foreground/45 tabular-nums">{today}</span>
      </div>
      <blockquote className="text-[17px] sm:text-lg text-foreground leading-relaxed italic">
        “{q.text}”
      </blockquote>
      <div className="text-[12px] text-foreground/55 mt-2 font-mono">— {q.source}</div>
    </section>
  );
}
