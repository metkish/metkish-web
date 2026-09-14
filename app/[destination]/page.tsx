import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ComingSoonDestination from '@/components/ui/coming-soon-destination';
import { DESTINATIONS, getDestinationBySlug } from '@/lib/destinations';

// One static page per destination in lib/destinations.ts, e.g. /tenerife,
// /prague, /maldives, /vietnam.
export function generateStaticParams() {
  return DESTINATIONS.map((d) => ({ destination: d.slug }));
}

// Only known destinations get a page — anything else is a real 404 instead
// of silently rendering a "coming soon" state for an arbitrary URL.
export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ destination: string }>;
}): Promise<Metadata> {
  const { destination } = await params;
  const dest = getDestinationBySlug(destination);
  if (!dest) return {};

  const title = `${dest.name} — Metkish`;
  const description = `The ${dest.name} travel story is on its way.`;
  const url = `https://www.metkish.com/${dest.slug}`;
  // Every destination already has a curated cover photo in the homepage's
  // My Travels gallery (components/ui/travel-gallery.tsx) — reuse it here
  // as a real, destination-specific social-preview image instead of
  // falling back to the site-wide default (see public/og/ for how these
  // were generated from the existing photos, uncropped originals untouched).
  const ogImage = `/og/og-${dest.slug}.jpg`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function DestinationPage({
  params,
}: {
  params: Promise<{ destination: string }>;
}) {
  const { destination } = await params;
  const dest = getDestinationBySlug(destination);

  if (!dest) {
    notFound();
  }

  return (
    <ComingSoonDestination
      name={dest.name}
      location={dest.location}
      backHref={`/#${dest.slug}`}
    />
  );
}
