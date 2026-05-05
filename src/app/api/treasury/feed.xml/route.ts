// RSS feed of cohort swap batches. One <item> per executed swap,
// with the Solscan link as the canonical URL and the swap totals in
// the description. Lets transparency-minded users subscribe to
// receipts in their reader of choice — turns the most concrete
// artifact into something that can be followed.

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const revalidate = 60;

const SITE = "https://mickle-gamma.vercel.app";

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const sb = supabaseAdmin();
  const { data: batches } = await sb
    .from("swap_batches")
    .select("id, executed_at, total_usdc, spyx_received, tx_sig")
    .order("executed_at", { ascending: false })
    .limit(60);

  const items = (batches ?? []).map((b) => {
    const link = b.tx_sig
      ? `https://solscan.io/tx/${b.tx_sig}`
      : `${SITE}/treasury#batch-${b.id}`;
    const total = Number(b.total_usdc).toFixed(2);
    const spyx = b.spyx_received ? Number(b.spyx_received).toFixed(6) : null;
    const title = spyx
      ? `${total} USDC → ${spyx} pbSPYx`
      : `${total} USDC · quoted (demo)`;
    const date = new Date(b.executed_at).toUTCString();
    return `
    <item>
      <title>${escapeXml(title)}</title>
      <link>${escapeXml(link)}</link>
      <guid isPermaLink="false">${escapeXml(b.id)}</guid>
      <pubDate>${date}</pubDate>
      <description>${escapeXml(`Cohort swap batch executed at ${b.executed_at}. ${title}.`)}</description>
    </item>`;
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Mickle · Treasury Receipts</title>
    <link>${SITE}/treasury</link>
    <description>Every cohort swap, signed on Solana. Proof, not pitches.</description>
    <language>en-gb</language>
    <atom:link xmlns:atom="http://www.w3.org/2005/Atom" href="${SITE}/api/treasury/feed.xml" rel="self" type="application/rss+xml" />
    ${items.join("")}
  </channel>
</rss>`;

  return new NextResponse(xml, {
    headers: {
      "content-type": "application/rss+xml; charset=utf-8",
      "cache-control": "public, max-age=60, s-maxage=60",
    },
  });
}
