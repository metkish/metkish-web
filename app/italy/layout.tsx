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
  description: 'Italy · Road Trip — the story is on its way.',
  alternates: {
    canonical: 'https://www.metkish.com/italy',
  },
  openGraph: {
    title: 'Italy — Metkish',
    description: 'Italy · Road Trip — the story is on its way.',
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
    description: 'Italy · Road Trip — the story is on its way.',
    images: ['/og/og-italy.jpg'],
  },
};

export default function ItalyLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
