import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Poppins, Fredoka } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-poppins",
});

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-fredoka",
});

export const metadata: Metadata = {
  title: "Metkish",
  description: "Metkish portfolio",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`h-full antialiased ${poppins.variable} ${fredoka.variable}`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
