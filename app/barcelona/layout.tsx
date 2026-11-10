import type { Metadata } from 'next';
import type { ReactNode } from 'react';

// A thin server layout so this route can carry real per-page metadata
// while app/barcelona/page.tsx itself stays a client component (it needs
// scroll listeners for the header and the journey map).
export const metadata: Metadata = {
  title: 'Barcelona — Metkish',
  description:
    'Spain · Catalonia · October 2026 — a city that surprised us in more ways than one.',
  alternates: {
    canonical: 'https://www.metkish.com/barcelona',
  },
  openGraph: {
    title: 'Barcelona — Metkish',
    description:
      'Spain · Catalonia · October 2026 — a city that surprised us in more ways than one.',
    url: 'https://www.metkish.com/barcelona',
    images: [
      {
        url: '/og/og-home.jpg',
        width: 1200,
        height: 630,
        alt: 'Barcelona — Metkish',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Barcelona — Metkish',
    description:
      'Spain · Catalonia · October 2026 — a city that surprised us in more ways than one.',
    images: ['/og/og-home.jpg'],
  },
};

export default function BarcelonaLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
