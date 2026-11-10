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

export default function RomeLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
