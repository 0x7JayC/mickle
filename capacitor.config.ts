import type { CapacitorConfig } from "@capacitor/cli";

// Capacitor wraps the live web app (mickle-gamma.vercel.app) in a native
// iOS shell — full-screen app icon on the home screen, real status bar,
// real safe-area insets, real launch screen. The Next.js server stays on
// Vercel, so API routes (Privy auth, /api/position) keep working.
//
// Run `npm run ios:add` once to scaffold the Xcode project, then
// `npm run ios:open` to open it in Xcode and hit Run.
const config: CapacitorConfig = {
  appId: "app.mickle.client",
  appName: "Mickle",
  webDir: "out", // unused while we point at a remote server, but required
  server: {
    url: "https://mickle-gamma.vercel.app",
    cleartext: false,
  },
  ios: {
    contentInset: "automatic",
    backgroundColor: "#faf6ee",
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: false,
      backgroundColor: "#faf6ee",
      androidSplashResourceName: "splash",
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#faf6ee",
      overlaysWebView: true,
    },
  },
};

export default config;
