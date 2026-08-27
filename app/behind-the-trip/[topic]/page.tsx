import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ComingSoonDestination from '@/components/ui/coming-soon-destination';
import { BEHIND_THE_TRIP_TOPICS, getBehindTheTripTopicBySlug } from '@/lib/behind-the-trip';

// One static page per Behind the Trip topic in lib/behind-the-trip.ts,
// e.g. /behind-the-trip/hotels, /behind-the-trip/flights.
export function generateStaticParams() {
  return BEHIND_THE_TRIP_TOPICS.map((t) => ({ topic: t.slug }));
}

// Only known topics get a page — anything else is a real 404 instead of
// silently rendering a "coming soon" state for an arbitrary URL.
export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ topic: string }>;
}): Promise<Metadata> {
  const { topic } = await params;
  const t = getBehindTheTripTopicBySlug(topic);
  if (!t) return {};

  const description = 'The full story is on its way.';

  return {
    title: `${t.kicker} — Metkish`,
    description,
    openGraph: {
      title: `${t.kicker} — Metkish`,
      description,
      url: `https://metkish.com/behind-the-trip/${t.slug}`,
    },
  };
}

export default async function BehindTheTripTopicPage({
  params,
}: {
  params: Promise<{ topic: string }>;
}) {
  const { topic } = await params;
  const t = getBehindTheTripTopicBySlug(topic);

  if (!t) {
    notFound();
  }

  return (
    <ComingSoonDestination
      name={t.kicker}
      description='The full story is on its way.'
      backHref='/#guides'
      backLabel='← Back to Behind the Trip'
    />
  );
}
