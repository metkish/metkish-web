import type { Metadata } from 'next';
import type { ReactNode } from 'react';

// Same pattern as app/tenerife/layout.tsx: a thin server layout so this
// route keeps real per-page metadata while app/italy/page.tsx itself stays
// a client component (scroll listener for the header, IntersectionObserver
// for the map animation). Without this, app/italy/page.tsx would silently
// fall out of the generic app/[destination]/page.tsx metadata it used to
// get (that route no longer renders for /italy once this static route
// exists) and lose its og-italy.jpg social preview and canonical URL.
export const metadata: Metadata = {
  title: 'Italy — Metkish',
  description: 'Italy · April 2026 — a road trip from Milan to Cinque Terre and Pisa.',
  alternates: {
    canonical: 'https://www.metkish.com/italy',
  },
  openGraph: {
    title: 'Italy — Metkish',
    description: 'Italy · April 2026 — a road trip from Milan to Cinque Terre and Pisa.',
    url: 'https://www.metkish.com/italy',
    images: [
      {
        url: '/og/og-italy.jpg',
        width: 1200,
        height: 630,
        alt: 'Italy — Metkish',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Italy — Metkish',
    description: 'Italy · April 2026 — a road trip from Milan to Cinque Terre and Pisa.',
    images: ['/og/og-italy.jpg'],
  },
};

// BlogPosting structured data -- only verified, already-published facts
// (title, description, canonical URL, OG image, the Metkish site/brand
// identity as the Organization author/publisher). No publication date is
// included: it isn't tracked anywhere, and the trip's own month/year is a
// different fact from that, so it's deliberately left out rather than
// guessed.
const ITALY_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'BlogPosting',
  headline: 'Italy',
  description:
    'Italy · April 2026 — a road trip from Milan to Cinque Terre and Pisa.',
  image: ['https://www.metkish.com/og/og-italy.jpg'],
  mainEntityOfPage: {
    '@type': 'WebPage',
    '@id': 'https://www.metkish.com/italy',
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

export default function ItalyLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ITALY_JSON_LD) }}
      />
      {children}
    </>
  );
}
