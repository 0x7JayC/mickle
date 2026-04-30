# /public/scrolly — Mickle scrollytelling prototype

Self-contained landing experience driven by scroll progress.

## Files

| File | Role |
|---|---|
| `index.html` | The page. Three full-bleed video layers + 8 typography beats + per-beat cat clips. |
| `intro-loop.mp4` | (drop here) Loops while `progress < 0.005` — user hasn't scrolled. |
| `main.mp4` | (drop here) Scroll-driven. `currentTime = progress * duration`. |
| `outro-loop.mp4` | (drop here) Loops while `progress > 0.98` — user reached the end. |
| `cat-yawn.mp4`     | Full-bleed loop covering main during Beat 2 — boredom of the status quo. |
| `cat-flycatch.mp4` | Full-bleed loop covering main during Beat 6 — Mickle snapping up your £1. |
| `cat-float.mp4`    | Full-bleed loop covering main during Beat 7 — compounding lifting you up. |

All six videos render full-bleed via `object-fit: cover`. Cat layers stack on top of main and fade in via continuous opacity (no CSS transition — the fade comes from the scroll math itself).

**Note on main.mp4**: cats cover main during Beats 2/6/7. Main's `currentTime` keeps advancing through its full mapped range, so ~15s of main content (3 × ~5s zones) will be hidden behind cat layers. Either accept that as wasted footage, or design main.mp4 with that in mind (put nothing critical in those zones).

## Encoding requirements

For smooth reverse playback (scroll up = rewind), `main.mp4` needs:

- **Faststart**: `-movflags +faststart` (moov atom at the head — first-frame ready).
- **Dense keyframes**: GOP ≤ 1s. Reverse decoding without keyframes will stutter.
- **H.264 baseline / main profile**: maximum browser compatibility.

```bash
ffmpeg -i source.mp4 \
  -c:v libx264 -profile:v main -crf 20 \
  -g 24 -keyint_min 24 \
  -c:a aac -b:a 128k \
  -movflags +faststart \
  main.mp4
```

intro-loop and outro-loop just need faststart; their playback is forward-only.

## Preview

`npm run dev` → `http://localhost:3000/scrolly/`

## Adjusting the 8 beats

Beat content + scroll ranges live in the `BEATS` array near the top of `index.html`. To rebalance against the actual `main.mp4` runtime, edit only the array — the rest is generic.
