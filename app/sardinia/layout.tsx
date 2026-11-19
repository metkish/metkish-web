import type { Metadata } from 'next';
import type { ReactNode } from 'react';

// A thin server layout so this route can carry real per-page metadata
// while app/sardinia/page.tsx itself stays a client component (it needs
// scroll listeners for the header and the journey map) -- same reason
// every other destination page has one of these.
//
// The article is now complete (full written story, all chapters, photos,
// videos and maps), so this page is indexable like every other finished
// destination page -- the earlier noindex scaffold state (and its
// placeholder "travel story is on its way" copy) no longer applies.
const TITLE = 'Sardinia — Metkish';
// Same "Country · Month Year" convention used by every other finished
// destination page's description (see app/tenerife/layout.tsx,
// app/barcelona/layout.tsx, app/rome/layout.tsx, app/italy/layout.tsx) --
// reusing the real dates/location already shown in the page's own hero
// tag line rather than inventing new descriptive copy.
const DESCRIPTION = 'Italy · June–July 2025.';
const URL = 'https://www.metkish.com/sardinia';
// Already generated from the real Sardinia cover photo used in the
// homepage's My Travels gallery (see public/og/ for how these are
// produced) -- reused here rather than regenerated.
const OG_IMAGE = '/og/og-sardinia.jpg';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: {
    canonical: URL,
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: URL,
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: TITLE,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: [OG_IMAGE],
  },
};

// BlogPosting structured data -- same pattern as
// app/tenerife/layout.tsx's TENERIFE_JSON_LD: only verified,
// already-published facts (title, description, canonical URL, OG image,
// the Metkish site/brand identity as the Organization author/publisher).
// No publication date is included: it isn't tracked anywhere, and the
// trip's own month/year is a different fact from that, so it's
// deliberately left out rather than guessed.
const SARDINIA_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'BlogPosting',
  headline: 'Sardinia',
  description: DESCRIPTION,
  image: ['https://www.metkish.com/og/og-sardinia.jpg'],
  mainEntityOfPage: {
    '@type': 'WebPage',
    '@id': URL,
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

export default function SardiniaLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(SARDINIA_JSON_LD) }}
      />
      {children}
    </>
  );
}
