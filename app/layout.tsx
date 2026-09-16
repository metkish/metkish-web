import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Poppins, Fredoka, Playfair_Display, Caveat } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-poppins",
});

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-fredoka",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-playfair",
});

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-caveat",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.metkish.com"),
  title: "Metkish",
  description: "Travel · memories · places worth remembering",
  alternates: {
    canonical: "https://www.metkish.com/",
  },
  openGraph: {
    title: "Metkish",
    description: "Travel · memories · places worth remembering",
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
    title: "Metkish",
    description: "Travel · memories · places worth remembering",
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
