// Inline-SVG renderer for milestone NFT images. Returned as image/svg+xml
// so wallets and marketplaces (Magic Eden, Tensor, Solscan) can show it
// without us hosting a separate image server.

import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const TIERS: Record<string, { label: string; emoji: string; from: string; to: string }> = {
  "7": { label: "Week One", emoji: "🌱", from: "#10b981", to: "#34d399" },
  "30": { label: "The Mickle", emoji: "🔥", from: "#ff7a59", to: "#f5b94a" },
  "100": { label: "The Muckle", emoji: "💎", from: "#6d5ef5", to: "#a855f7" },
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const day = searchParams.get("day") ?? "30";
  const tier = TIERS[day];
  if (!tier) return NextResponse.json({ error: "unknown tier" }, { status: 404 });

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${tier.from}"/>
      <stop offset="100%" stop-color="${tier.to}"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.5" cy="0.4" r="0.6">
      <stop offset="0%" stop-color="rgba(255,255,255,0.45)"/>
      <stop offset="60%" stop-color="rgba(255,255,255,0)"/>
    </radialGradient>
  </defs>
  <rect width="1024" height="1024" fill="url(#bg)"/>
  <rect width="1024" height="1024" fill="url(#glow)"/>
  <text x="512" y="430" font-family="-apple-system,BlinkMacSystemFont,system-ui,sans-serif" font-size="240" text-anchor="middle" fill="#fff">${tier.emoji}</text>
  <text x="512" y="640" font-family="-apple-system,BlinkMacSystemFont,system-ui,sans-serif" font-weight="800" font-size="96" letter-spacing="-4" text-anchor="middle" fill="#fff">Day ${day}</text>
  <text x="512" y="730" font-family="-apple-system,BlinkMacSystemFont,system-ui,sans-serif" font-weight="600" font-size="56" letter-spacing="-1" text-anchor="middle" fill="rgba(255,255,255,0.85)">${tier.label}</text>
  <text x="512" y="900" font-family="ui-monospace,SFMono-Regular,Menlo,monospace" font-size="28" letter-spacing="6" text-anchor="middle" fill="rgba(255,255,255,0.65)">MICKLE · EVERY LITTLE</text>
</svg>`;

  return new Response(svg, {
    headers: {
      "content-type": "image/svg+xml; charset=utf-8",
      "cache-control": "public, max-age=86400, immutable",
    },
  });
}
