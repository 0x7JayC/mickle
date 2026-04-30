# Mickle on iOS

Run Mickle as a real iPhone app with Xcode. The Capacitor shell wraps
the live web app (`mickle-gamma.vercel.app`) in a native WebView, so the
Next.js server, Privy auth, Supabase, and the Jupiter price feed all
keep working — you just get an app icon, a launch screen, real safe-area
insets, and full-screen rendering on a physical iPhone or the simulator.

## Prerequisites

- **Xcode 15+** — install from the Mac App Store. The Command Line Tools
  alone are not enough; Capacitor needs the full IDE.
- **Switch xcode-select to the full Xcode**:
  ```bash
  sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
  xcodebuild -version   # should print Xcode 15.x or later
  ```
- **CocoaPods** — Capacitor's iOS platform depends on it:
  ```bash
  sudo gem install cocoapods
  pod --version
  ```

## One-time setup

```bash
# 1. Scaffold the Xcode project (creates ./ios — gitignored)
npm run ios:add

# 2. Sync the Capacitor config + plugin native code into the iOS project
npm run ios:sync

# 3. Open the workspace in Xcode
npm run ios:open
```

In Xcode:

1. Top-left target dropdown → pick **iPhone 15 Pro** (simulator) or your
   plugged-in device.
2. Click ▶ Run.

The app loads `https://mickle-gamma.vercel.app` inside the WebView. You
should see the landing page, be able to sign in with Privy, and reach
the dashboard.

## Updating

Whenever you change `capacitor.config.ts` or add a Capacitor plugin:

```bash
npm run ios:sync
```

Whenever you change web code: nothing. The app pulls live from
`mickle-gamma.vercel.app` on every launch. Push to `main`, Vercel
redeploys, the next iPhone launch shows it.

## Pointing at localhost during development

Edit `capacitor.config.ts`:

```ts
server: {
  url: "http://192.168.1.147:3000",   // your Mac's LAN IP
  cleartext: true,                     // allow http
}
```

Run `npm run dev` on your Mac, run `npm run ios:sync`, then Xcode → Run.
The simulator and your iPhone (on the same Wi-Fi) will connect to your
local dev server with hot reload.

## App icons + launch screen

Capacitor generates placeholders. To replace:

1. Drop a 1024×1024 PNG at `ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png`
   (Capacitor's icon set follows iOS conventions).
2. Update launch screen in `ios/App/App/Assets.xcassets/Splash.imageset/`.
3. Or use the [Capacitor Assets tool](https://github.com/ionic-team/capacitor-assets):
   ```bash
   npx @capacitor/assets generate --ios --iconBackgroundColor "#faf6ee"
   ```

## Troubleshooting

- **`xcode-select: error: tool 'xcodebuild' requires Xcode`** → see
  Prerequisites; you only have Command Line Tools, not full Xcode.
- **`Pod install failed`** → `sudo gem install cocoapods --pre` and
  retry. M-series Macs sometimes need
  `arch -x86_64 gem install ffi` first.
- **WebView shows a blank screen** → check `capacitor.config.ts` server
  URL, then `npm run ios:sync`. Vercel SSO must be off (it is — see
  earlier session).
- **Privy popup login fails inside WebView** → Privy's email magic-link
  works, but Google OAuth pop-ups need `WKWebView` JS bridge config.
  For the demo, stick with email login.

## Why this approach over PWA

- **Add to Home Screen (PWA)** works on iOS Safari — `manifest.webmanifest`
  + `apple-mobile-web-app-capable` are already wired. Cheaper, no Xcode
  required. Looks 90% the same.
- **Capacitor + Xcode** gets you a real `.ipa`, App Store-able later,
  proper splash screen, native plugins (StatusBar / SplashScreen / push
  notifications when ready). Better for the hackathon demo if you want
  to *show an iPhone running Mickle*.

For the Colosseum video pitch: **Capacitor**. For shipping to users
this week: **PWA + Add to Home Screen** is plenty.
