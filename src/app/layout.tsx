import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ThemeShell from "@/components/ThemeShell";
import PrivyProviders from "@/components/PrivyProviders";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = "https://mickle-gamma.vercel.app";
const TITLE = "Mickle — Every little makes a mickle";
const DESCRIPTION =
  "£1 a day into the S&P 500. Run by a cat. Global. On Solana.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Mickle",
    statusBarStyle: "black-translucent",
    startupImage: ["/apple-touch-icon.png"],
  },
  icons: {
    icon: [
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: SITE_URL,
    siteName: "Mickle",
    locale: "en_GB",
    type: "website",
    images: [
      {
        url: "/cover.png",
        width: 1920,
        height: 1080,
        alt: "Mickle — Every little makes a mickle. £1 a day. The S&P 500. On Solana.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/cover.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#fdf6ef",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col theme-a1">
        <PrivyProviders>
          <ThemeShell>{children}</ThemeShell>
        </PrivyProviders>
      </body>
    </html>
  );
}
