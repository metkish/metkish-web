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

  return {
    title: `${dest.name} — Metkish`,
    description: `The ${dest.name} travel story is on its way.`,
    openGraph: {
      title: `${dest.name} — Metkish`,
      description: `The ${dest.name} travel story is on its way.`,
      url: `https://metkish.com/${dest.slug}`,
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

  return <ComingSoonDestination name={dest.name} location={dest.location} />;
}
