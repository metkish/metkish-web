import type { Metadata } from 'next';
import type { ReactNode } from 'react';

// A thin server layout so this route can carry real per-page metadata
// while app/sardinia/page.tsx itself stays a client component (it needs
// scroll listeners for the header and the journey map) -- same reason
// every other destination page has one of these.
//
// This page is still a first-pass scaffold (hero + Home->Vienna map only,
// no written story yet), so -- same as the dynamic "coming soon" stub's
// own metadata (app/[destination]/page.tsx) -- it's kept out of Google's
// index for now (`index: false`) while staying crawlable (`follow: true`)
// so internal link equity still flows. Flip `index` to true once the page
// has real content worth surfacing in search. No BlogPosting JSON-LD yet
// either, for the same reason -- add it alongside the first real content
// chapter, following Tenerife's own layout.tsx as the pattern.
const TITLE = 'Sardinia — Metkish';
// Same neutral, truthful phrasing the dynamic stub already uses
// site-wide for a destination with no published story yet -- reused
// here verbatim rather than inventing new marketing copy for a page
// that, right now, genuinely has no story to describe.
const DESCRIPTION = 'The Sardinia travel story is on its way.';
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
  robots: {
    index: false,
    follow: true,
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

export default function SardiniaLayout({ children }: { children: ReactNode }) {
  return children;
}
