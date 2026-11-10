import type { Metadata } from 'next';
import type { ReactNode } from 'react';

// A thin server layout so this route can carry real per-page metadata
// while app/rome/page.tsx itself stays a client component (it needs
// scroll listeners for the header and the journey map).
export const metadata: Metadata = {
  title: 'Rome — Metkish',
  description:
    'Italy · October 2026 — three days exploring Rome, from the Pantheon and Colosseum to the Vatican and an audience with the Pope.',
  alternates: {
    canonical: 'https://www.metkish.com/rome',
  },
  openGraph: {
    title: 'Rome — Metkish',
    description:
      'Italy · October 2026 — three days exploring Rome, from the Pantheon and Colosseum to the Vatican and an audience with the Pope.',
    url: 'https://www.metkish.com/rome',
    images: [
      {
        url: '/og/og-rome.jpg',
        width: 1200,
        height: 630,
        alt: 'Rome — Metkish',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Rome — Metkish',
    description:
      'Italy · October 2026 — three days exploring Rome, from the Pantheon and Colosseum to the Vatican and an audience with the Pope.',
    images: ['/og/og-rome.jpg'],
  },
};

// BlogPosting structured data -- only verified, already-published facts
// (title, description, canonical URL, OG image, the Metkish site/brand
// identity as the Organization author/publisher). No publication date is
// included: the exact date this page was first published isn't tracked
// anywhere, and the trip's own month/year (October 2026) is a different
// fact from that, so it's deliberately left out rather than guessed.
const ROME_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'BlogPosting',
  headline: 'Rome',
  description:
    'Italy · October 2026 — three days exploring Rome, from the Pantheon and Colosseum to the Vatican and an audience with the Pope.',
  image: ['https://www.metkish.com/og/og-rome.jpg'],
  mainEntityOfPage: {
    '@type': 'WebPage',
    '@id': 'https://www.metkish.com/rome',
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

export default function RomeLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ROME_JSON_LD) }}
      />
      {children}
    </>
  );
}
