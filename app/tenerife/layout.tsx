import type { Metadata } from 'next';
import type { ReactNode } from 'react';

// A thin server layout so this route can carry real per-page metadata
// while app/tenerife/page.tsx itself stays a client component (it needs
// scroll listeners for the header and the journey map).
export const metadata: Metadata = {
  title: 'Tenerife — Metkish',
  description:
    'Spain · Canary Islands · July 2026 — an island we could easily come back to.',
  alternates: {
    canonical: 'https://www.metkish.com/tenerife',
  },
  openGraph: {
    title: 'Tenerife — Metkish',
    description:
      'Spain · Canary Islands · July 2026 — an island we could easily come back to.',
    url: 'https://www.metkish.com/tenerife',
    images: [
      {
        url: '/og/og-tenerife.jpg',
        width: 1200,
        height: 630,
        alt: 'Tenerife — Metkish',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tenerife — Metkish',
    description:
      'Spain · Canary Islands · July 2026 — an island we could easily come back to.',
    images: ['/og/og-tenerife.jpg'],
  },
};

// BlogPosting structured data -- only verified, already-published facts
// (title, description, canonical URL, OG image, the Metkish site/brand
// identity as the Organization author/publisher). No publication date is
// included: it isn't tracked anywhere, and the trip's own month/year is a
// different fact from that, so it's deliberately left out rather than
// guessed.
const TENERIFE_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'BlogPosting',
  headline: 'Tenerife',
  description:
    'Spain · Canary Islands · July 2026 — an island we could easily come back to.',
  image: ['https://www.metkish.com/og/og-tenerife.jpg'],
  mainEntityOfPage: {
    '@type': 'WebPage',
    '@id': 'https://www.metkish.com/tenerife',
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

export default function TenerifeLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(TENERIFE_JSON_LD) }}
      />
      {children}
    </>
  );
}
