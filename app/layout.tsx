import type { Metadata } from "next";
import type { ReactNode } from "react";
import localFont from "next/font/local";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

// Self-hosted, local copies of the same four Google Fonts (Poppins,
// Fredoka, Playfair Display, Caveat) previously loaded via
// next/font/google -- same families, same weights, same latin subset,
// same --font-poppins / --font-fredoka / --font-playfair / --font-caveat
// CSS variable names, so every existing usage of them across the site
// (e.g. Tailwind arbitrary-value classes referencing those variables)
// needs no change.
// Switched from next/font/google to next/font/local because Turbopack's
// Google Fonts loader fetches font metadata/files over the network at
// dev-server start and build time; when that network path to
// fonts.googleapis.com is unreliable it either hard-crashes ("Module not
// found: Can't resolve '@vercel/turbopack-next/internal/font/google/font'")
// or silently falls back to a substitute system font, which is what made
// the site's typography appear to change after that crash was first
// "fixed" by only clearing the build cache. Vendoring the actual font
// files (sourced from the @fontsource npm packages, which redistribute
// the official Google Fonts files unmodified under the same SIL Open
// Font License -- see app/fonts/OFL-LICENSE.txt) removes that network
// dependency entirely, so the real typography now loads identically
// every time, online or offline.
const poppins = localFont({
  src: [
    { path: "./fonts/poppins/poppins-300.woff2", weight: "300", style: "normal" },
    { path: "./fonts/poppins/poppins-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/poppins/poppins-500.woff2", weight: "500", style: "normal" },
    { path: "./fonts/poppins/poppins-600.woff2", weight: "600", style: "normal" },
  ],
  variable: "--font-poppins",
  display: "swap",
});

const fredoka = localFont({
  src: [
    { path: "./fonts/fredoka/fredoka-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/fredoka/fredoka-600.woff2", weight: "600", style: "normal" },
    { path: "./fonts/fredoka/fredoka-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-fredoka",
  display: "swap",
});

const playfair = localFont({
  src: [
    { path: "./fonts/playfair-display/playfair-display-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/playfair-display/playfair-display-500.woff2", weight: "500", style: "normal" },
    { path: "./fonts/playfair-display/playfair-display-600.woff2", weight: "600", style: "normal" },
  ],
  variable: "--font-playfair",
  display: "swap",
});

const caveat = localFont({
  src: [
    { path: "./fonts/caveat/caveat-600.woff2", weight: "600", style: "normal" },
    { path: "./fonts/caveat/caveat-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-caveat",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.metkish.com"),
  title: "Metkish — Honest Family Travel Stories & Real Trip Costs",
  description: "Honest, practical travel stories from a family of four — real costs, real itineraries, and places worth remembering.",
  alternates: {
    canonical: "https://www.metkish.com/",
  },
  openGraph: {
    title: "Metkish — Honest Family Travel Stories & Real Trip Costs",
    description: "Honest, practical travel stories from a family of four — real costs, real itineraries, and places worth remembering.",
    url: "https://www.metkish.com/",
    siteName: "Metkish",
    images: [
      {
        // A real hero photo (the homepage's own scroll-hero background),
        // cropped to the standard OG size (1200x630) — not the small
        // Metkish logo, which used to fill almost the whole
        // WhatsApp/Facebook preview instead of giving a real sense of the
        // site. This is the site-wide default; individual pages (e.g. each
        // destination) override it with their own image below.
        url: "/og/og-home.jpg",
        width: 1200,
        height: 630,
        alt: "Metkish — travel, memories, places worth remembering",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Metkish — Honest Family Travel Stories & Real Trip Costs",
    description: "Honest, practical travel stories from a family of four — real costs, real itineraries, and places worth remembering.",
    images: ["/og/og-home.jpg"],
  },
  icons: {
    icon: "/metkish-logo.png",
  },
  other: {
    "p:domain_verify": "ff6b4d9f872ed1181a6a09e692cda13f",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`h-full antialiased scroll-smooth ${poppins.variable} ${fredoka.variable} ${playfair.variable} ${caveat.variable}`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
