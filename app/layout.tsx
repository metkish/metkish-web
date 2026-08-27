import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Poppins, Fredoka, Playfair_Display, Caveat } from "next/font/google";
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
  metadataBase: new URL("https://metkish.com"),
  title: "Metkish",
  description: "Family travel, honestly told.",
  openGraph: {
    title: "Metkish",
    description: "Family travel, honestly told.",
    url: "https://metkish.com",
    siteName: "Metkish",
    images: [
      {
        // Composed specifically for social sharing: the logo centred on
        // a clean canvas at the standard OG size (1200x630), not the raw
        // logo file — that file is a large near-square image, which is
        // why it previously filled almost the whole WhatsApp/Facebook
        // preview instead of sitting small and centred.
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Metkish",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Metkish",
    description: "Family travel, honestly told.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/metkish-logo.png",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`h-full antialiased scroll-smooth ${poppins.variable} ${fredoka.variable} ${playfair.variable} ${caveat.variable}`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
