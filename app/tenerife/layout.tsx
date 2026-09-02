import type { Metadata } from 'next';
import type { ReactNode } from 'react';

// A thin server layout so this route can carry real per-page metadata
// while app/tenerife/page.tsx itself stays a client component (it needs
// scroll listeners for the header and the journey map).
export const metadata: Metadata = {
  title: 'Tenerife — Metkish',
  description:
    'Spain · Canary Islands · July 2026 — an island we could easily come back to.',
  openGraph: {
    title: 'Tenerife — Metkish',
    description:
      'Spain · Canary Islands · July 2026 — an island we could easily come back to.',
    url: 'https://metkish.com/tenerife',
  },
};

export default function TenerifeLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
