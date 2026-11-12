import type { Metadata } from 'next';
import type { ReactNode } from 'react';

// A thin server layout so this route can carry real per-page metadata
// while app/iceland/page.tsx itself stays a client component (it needs
// scroll listeners for the header and the journey maps).
export const metadata: Metadata = {
  title: 'Iceland — Metkish',
  description:
    'Reykjavík · October 2025 — five days of waterfalls, glaciers and landscapes unlike anywhere we’d been before.',
  alternates: {
    canonical: 'https://www.metkish.com/iceland',
  },
  openGraph: {
    title: 'Iceland — Metkish',
    description:
      'Reykjavík · October 2025 — five days of waterfalls, glaciers and landscapes unlike anywhere we’d been before.',
    url: 'https://www.metkish.com/iceland',
    images: [
      {
        url: '/og/og-iceland.jpg',
        width: 1200,
        height: 630,
        alt: 'Iceland — Metkish',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Iceland — Metkish',
    description:
      'Reykjavík · October 2025 — five days of waterfalls, glaciers and landscapes unlike anywhere we’d been before.',
    images: ['/og/og-iceland.jpg'],
  },
};

// BlogPosting structured data -- only verified, already-published facts
// (title, description, canonical URL, OG image, the Metkish site/brand
// identity as the Organization author/publisher). No publication date is
// included: it isn't tracked anywhere, and the trip's own month/year is a
// different fact from that, so it's deliberately left out rather than
// guessed -- same convention as every other destination's own layout.
const ICELAND_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'BlogPosting',
  headline: 'Iceland',
  description:
    'Reykjavík · October 2025 — five days of waterfalls, glaciers and landscapes unlike anywhere we’d been before.',
  image: ['https://www.metkish.com/og/og-iceland.jpg'],
  mainEntityOfPage: {
    '@type': 'WebPage',
    '@id': 'https://www.metkish.com/iceland',
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

export default function IcelandLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ICELAND_JSON_LD) }}
      />
      {children}
    </>
  );
}
