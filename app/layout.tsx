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
  description: "Metkish website",
  openGraph: {
    title: "Metkish",
    description: "Metkish website",
    url: "https://metkish.com",
    siteName: "Metkish",
    images: [
      {
        url: "/metkish-logo.png",
        width: 2201,
        height: 2201,
        alt: "Metkish logo",
      },
    ],
    locale: "en_US",
    type: "website",
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
