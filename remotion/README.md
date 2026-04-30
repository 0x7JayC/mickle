# Mickle — video sources

Two compositions, one shared component library. Apple-discipline brand
language: cream surfaces, single coral accent, Geist Sans/Mono, one
animation primitive (`FadeUp`). Anything else is on purpose.

## Compositions

| Id | Length | Use |
|---|---|---|
| `Hackathon90` | 90 s | Colosseum Arena demo slot. Full 7-scene narrative. |
| `Twitter30` | 30 s | Social cut. Hook → bar test → demo flash → CTA. |

## Scenes

```
remotion/scenes/
├── Hook.tsx          dark stage · scottish proverb opener
├── BarTest.tsx       cream stage · "£1 a day. The S&P 500. On Solana."
├── Problem.tsx       lived moment · 3 strikethroughs (Robinhood / eToro / ISA)
├── Demo.tsx          numbered ritual + cycling phone placeholder
├── WhyOnChain.tsx    Lagos · 24/7 · Soulbound — three coral-tinted cards
├── Stack.tsx         6 white tiles — Privy / Supabase / Jupiter / Backed / Core / Vercel
└── CTA.tsx           closing proverb + URL
```

## Swap placeholder phone screens for real footage

`Demo.tsx` cycles through five placeholder phones, each labelled. To
replace with a real screen recording:

1. Capture an MP4 / PNG of the live app at iPhone 15 Pro aspect (19.5:9).
   The simplest path: open `mickle-gamma.vercel.app/app` in Chrome
   responsive mode at 390×844, screen-record the relevant beat.
2. Drop the file in `public/` as `demo-signin.png` (etc.).
3. Set the `asset` field in `STEPS` inside `remotion/scenes/Demo.tsx`:

   ```ts
   { label: "Sign in", body: "...", asset: "demo-signin.png" },
   ```

4. Re-render: `npm run video:render`.

## Render

```bash
npm run video:dev               # interactive preview at localhost:3000
npm run video:render            # both → out/hackathon-90.mp4 + out/twitter-30.mp4
npm run video:render:hackathon  # 90s only
npm run video:render:twitter    # 30s only
```

## Brand discipline applied

- One animation: `FadeUp` (spring damping 200, 24 px slide). Nothing else.
- One accent colour: `#ff7a59`. Honey gradient is reserved for the
  logomark gem only.
- One typeface family: Geist (Sans for headlines, Mono for kickers).
- No light leaks, no noise, no decorative motion. Restraint is the brand.
