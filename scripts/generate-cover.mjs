// Generates the social/cover images used in submission packages and OG tags.
// Re-run any time the brand mark or hero copy changes:
//   node scripts/generate-cover.mjs
import sharp from "sharp";
import path from "node:path";
import { mkdir } from "node:fs/promises";

const OUT = path.resolve("public");
await mkdir(OUT, { recursive: true });

// 1200×630 — Open Graph + LinkedIn + Slack unfurls. Twitter accepts it too.
const COVER_W = 1200;
const COVER_H = 630;

// 2400×1260 — same aspect, retina-sharp for hackathon Arena cover slot.
const HI_W = 2400;
const HI_H = 1260;

const svg = ({ w, h }) =>
  `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#fff8f0"/>
      <stop offset="55%" stop-color="#fdf2ff"/>
      <stop offset="100%" stop-color="#ecf3ff"/>
    </linearGradient>
    <radialGradient id="ambientCoral" cx="0.18" cy="0.22" r="0.6">
      <stop offset="0%" stop-color="rgba(255,122,89,0.55)"/>
      <stop offset="100%" stop-color="rgba(255,122,89,0)"/>
    </radialGradient>
    <radialGradient id="ambientHoney" cx="0.85" cy="0.30" r="0.55">
      <stop offset="0%" stop-color="rgba(245,185,74,0.55)"/>
      <stop offset="100%" stop-color="rgba(245,185,74,0)"/>
    </radialGradient>
    <radialGradient id="ambientIndigo" cx="0.80" cy="1.00" r="0.7">
      <stop offset="0%" stop-color="rgba(109,94,245,0.45)"/>
      <stop offset="100%" stop-color="rgba(109,94,245,0)"/>
    </radialGradient>
    <linearGradient id="gem" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#ff8a6b"/>
      <stop offset="100%" stop-color="#f5b94a"/>
    </linearGradient>
    <linearGradient id="gemHi" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.55"/>
      <stop offset="55%" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>
  </defs>

  <rect width="${w}" height="${h}" fill="url(#bg)"/>
  <rect width="${w}" height="${h}" fill="url(#ambientCoral)"/>
  <rect width="${w}" height="${h}" fill="url(#ambientHoney)"/>
  <rect width="${w}" height="${h}" fill="url(#ambientIndigo)"/>

  <!-- gem -->
  <g transform="translate(${w * 0.083} ${h * 0.18})">
    <rect x="0" y="${h * 0.012}" width="${h * 0.13}" height="${h * 0.13}" rx="${h * 0.028}" ry="${h * 0.028}"
      fill="rgba(255,122,89,0.4)"/>
    <rect width="${h * 0.13}" height="${h * 0.13}" rx="${h * 0.028}" ry="${h * 0.028}" fill="url(#gem)"/>
    <rect width="${h * 0.13}" height="${h * 0.07}" rx="${h * 0.028}" ry="${h * 0.028}" fill="url(#gemHi)"/>
  </g>

  <text x="${w * 0.083}" y="${h * 0.27}"
    font-family="-apple-system,BlinkMacSystemFont,system-ui,sans-serif"
    font-size="${h * 0.038}" font-weight="600" letter-spacing="6" fill="#0c0a14">MICKLE</text>

  <text x="${w * 0.083}" y="${h * 0.5}"
    font-family="-apple-system,BlinkMacSystemFont,system-ui,sans-serif"
    font-weight="800" font-size="${h * 0.13}" letter-spacing="${-h * 0.005}" fill="#0c0a14">Every little</text>
  <text x="${w * 0.083}" y="${h * 0.66}"
    font-family="-apple-system,BlinkMacSystemFont,system-ui,sans-serif"
    font-weight="800" font-size="${h * 0.13}" letter-spacing="${-h * 0.005}" fill="#0c0a14">makes a mickle.</text>

  <text x="${w * 0.083}" y="${h * 0.79}"
    font-family="-apple-system,BlinkMacSystemFont,system-ui,sans-serif"
    font-size="${h * 0.045}" font-weight="500" fill="rgba(12,10,20,0.65)">$1 a day. S&amp;P 500. On Solana. Global.</text>

  <text x="${w * 0.083}" y="${h * 0.91}"
    font-family="ui-monospace,SFMono-Regular,Menlo,monospace"
    font-size="${h * 0.028}" letter-spacing="4" fill="rgba(12,10,20,0.45)">SOLANA  ·  SPYX  ·  JUPITER</text>
</svg>`;

const targets = [
  { name: "cover.png", w: COVER_W, h: COVER_H },
  { name: "cover@2x.png", w: HI_W, h: HI_H },
];

for (const t of targets) {
  const out = path.join(OUT, t.name);
  await sharp(Buffer.from(svg({ w: t.w, h: t.h })))
    .png({ quality: 95 })
    .toFile(out);
  console.log(`✓ ${t.name} (${t.w}×${t.h})`);
}
