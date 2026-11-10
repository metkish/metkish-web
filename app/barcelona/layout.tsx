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

// BlogPosting structured data -- only verified, already-published facts
// (title, description, canonical URL, OG image, the Metkish site/brand
// identity as the Organization author/publisher). No publication date is
// included: it isn't tracked anywhere, and the trip's own month/year is a
// different fact from that, so it's deliberately left out rather than
// guessed.
const BARCELONA_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'BlogPosting',
  headline: 'Barcelona',
  description:
    'Spain · Catalonia · October 2026 — a city that surprised us in more ways than one.',
  image: ['https://www.metkish.com/og/og-home.jpg'],
  mainEntityOfPage: {
    '@type': 'WebPage',
    '@id': 'https://www.metkish.com/barcelona',
  },
  author: { '@type': 'Organization', name: 'Metkish' },
  publisher: {
    '@type': 'Organization',
    name: 'Metkish',
    logo: {
      '@type': 'ImageObject',
      url: 'https://www.metkish.com/metkish-logo.png',
    },
  },
};

export default function BarcelonaLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(BARCELONA_JSON_LD) }}
      />
      {children}
    </>
  );
}
