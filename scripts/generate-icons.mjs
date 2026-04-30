// One-shot icon generator. Renders a coral→honey gem on a cream canvas
// at the sizes iOS / PWA need. Run: `node scripts/generate-icons.mjs`.
//
// Re-run any time the brand mark changes; the SVG below is the source.
import sharp from "sharp";
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const OUT = path.resolve("public");
await mkdir(OUT, { recursive: true });

// SVG as a string — full-bleed cream canvas, gem centered, gradient
// matches the Mickle logomark in src/app/page.tsx and ThemeShell.
const svg = ({ size = 1024, padding = 0.18, bg = "#faf6ee" } = {}) => {
  const cx = size / 2;
  const cy = size / 2;
  const radius = (size / 2) * (1 - padding);
  const gemSize = radius * 1.85;
  const gemX = cx - gemSize / 2;
  const gemY = cy - gemSize / 2;
  const cornerRadius = gemSize * 0.22; // squircle-ish
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="gem" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%"  stop-color="#ff8a6b"/>
      <stop offset="100%" stop-color="#f5b94a"/>
    </linearGradient>
    <linearGradient id="hl" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.55"/>
      <stop offset="55%" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>
    <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="${size * 0.012}"/>
    </filter>
  </defs>
  <rect width="100%" height="100%" fill="${bg}"/>
  <!-- soft drop -->
  <rect x="${gemX}" y="${gemY + size * 0.012}" width="${gemSize}" height="${gemSize}"
        rx="${cornerRadius}" ry="${cornerRadius}"
        fill="rgba(255,122,89,0.35)" filter="url(#soft)"/>
  <!-- gem -->
  <rect x="${gemX}" y="${gemY}" width="${gemSize}" height="${gemSize}"
        rx="${cornerRadius}" ry="${cornerRadius}"
        fill="url(#gem)"/>
  <!-- inner highlight -->
  <rect x="${gemX}" y="${gemY}" width="${gemSize}" height="${gemSize * 0.55}"
        rx="${cornerRadius}" ry="${cornerRadius}"
        fill="url(#hl)"/>
</svg>`;
};

// Maskable variant: gem fills the whole canvas (no padding) so iOS / Android
// mask layers don't trim the brand mark.
const maskable = ({ size = 1024 } = {}) => {
  const cornerRadius = size * 0.22;
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="gem" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%"  stop-color="#ff8a6b"/>
      <stop offset="100%" stop-color="#f5b94a"/>
    </linearGradient>
    <linearGradient id="hl" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.45"/>
      <stop offset="55%" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" rx="${cornerRadius}" ry="${cornerRadius}" fill="url(#gem)"/>
  <rect width="100%" height="55%" rx="${cornerRadius}" ry="${cornerRadius}" fill="url(#hl)"/>
</svg>`;
};

const targets = [
  { name: "icon-192.png", size: 192, kind: "padded" },
  { name: "icon-512.png", size: 512, kind: "padded" },
  { name: "apple-touch-icon.png", size: 180, kind: "padded" }, // iOS Add to Home Screen
  { name: "favicon-32.png", size: 32, kind: "padded" },
];

for (const t of targets) {
  const svgStr = (t.kind === "maskable" ? maskable : svg)({ size: t.size });
  const out = path.join(OUT, t.name);
  await sharp(Buffer.from(svgStr)).png({ quality: 95 }).toFile(out);
  console.log(`✓ ${t.name} (${t.size}×${t.size})`);
}

// Also write the SVG as a vector reference (for the manifest fallback)
await writeFile(path.join(OUT, "icon.svg"), svg({ size: 512 }));
console.log("✓ icon.svg");
