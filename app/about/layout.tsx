import type { Metadata } from 'next';
import type { ReactNode } from 'react';

// A thin server layout so this route can carry real per-page metadata
// while app/about/page.tsx itself stays a client component.
export const metadata: Metadata = {
  title: 'About — Metkish',
  description:
    'The story behind Metkish — how a missed flight to a Barcelona match turned into a family travel journal. Travel · memories · places worth remembering.',
  alternates: {
    canonical: 'https://www.metkish.com/about',
  },
  openGraph: {
    title: 'About — Metkish',
    description:
      'The story behind Metkish — how a missed flight to a Barcelona match turned into a family travel journal. Travel · memories · places worth remembering.',
    url: 'https://www.metkish.com/about',
    images: [
      {
        url: '/og/og-home.jpg',
        width: 1200,
        height: 630,
        alt: 'About — Metkish',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About — Metkish',
    description:
      'The story behind Metkish — how a missed flight to a Barcelona match turned into a family travel journal. Travel · memories · places worth remembering.',
    images: ['/og/og-home.jpg'],
  },
};

export default function AboutLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
