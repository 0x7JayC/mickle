#!/usr/bin/env bash
# Renders the most recent pitch-deck-*.html to a print-quality PDF using
# headless Chrome. macOS-first; falls back to any 'google-chrome' or
# 'chromium' on PATH for Linux.

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DECK="$(ls -1t "$ROOT"/pitch-deck-*.html 2>/dev/null | head -1)"

if [[ -z "${DECK:-}" ]]; then
  echo "✗ No pitch-deck-*.html in repo root. Generate one first."
  exit 1
fi

OUT="$ROOT/$(basename "${DECK%.html}.pdf")"

CHROME=""
if [[ -x "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" ]]; then
  CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
elif command -v google-chrome >/dev/null 2>&1; then
  CHROME="google-chrome"
elif command -v chromium >/dev/null 2>&1; then
  CHROME="chromium"
else
  echo "✗ Chrome / Chromium not found. Install Google Chrome and re-run."
  exit 1
fi

echo "→ Rendering $(basename "$DECK") to PDF…"
"$CHROME" \
  --headless=new \
  --disable-gpu \
  --no-pdf-header-footer \
  --print-to-pdf-no-header \
  --print-to-pdf="$OUT" \
  --no-margins \
  "file://$DECK" 2>/dev/null

echo "✓ $OUT"
