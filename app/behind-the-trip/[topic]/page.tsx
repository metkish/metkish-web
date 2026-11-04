import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ComingSoonDestination from '@/components/ui/coming-soon-destination';
import ElClasicoTicketsArticle from '@/components/guides/el-clasico-tickets-article';
import HowWeFindRestaurantsArticle from '@/components/guides/how-we-find-restaurants-article';
import HotelsArticle from '@/components/guides/hotels-article';
import { BEHIND_THE_TRIP_TOPICS, getBehindTheTripTopicBySlug } from '@/lib/behind-the-trip';

// One static page per Behind the Trip topic in lib/behind-the-trip.ts,
// e.g. /behind-the-trip/hotels, /behind-the-trip/flights,
// /behind-the-trip/el-clasico-tickets.
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

  // 'el-clasico-tickets' is a real article (see the default export below),
  // so it gets its own full SEO treatment per the brief, rather than the
  // generic "coming soon" metadata every other topic still uses.
  if (topic === 'el-clasico-tickets') {
    const title = 'How to Get El Clásico Tickets (2026) | Metkish Travels';
    const description =
      'Our real experience buying four El Clásico tickets as FC Barcelona members. Membership fees, presale problems, ticket prices and practical tips.';

    return {
      title,
      description,
      alternates: {
        canonical: 'https://www.metkish.com/behind-the-trip/el-clasico-tickets',
      },
      openGraph: {
        title,
        description,
        url: 'https://www.metkish.com/behind-the-trip/el-clasico-tickets',
        images: [
          {
            url: '/og/og-home.jpg',
            width: 1200,
            height: 630,
            alt: 'Metkish Travels',
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: ['/og/og-home.jpg'],
      },
    };
  }

  // 'hotels' is a real, finished article (see the default export below),
  // so -- like 'el-clasico-tickets' above -- it gets its own full SEO
  // treatment rather than the generic "coming soon" metadata every other
  // unbuilt topic still uses.
  if (topic === 'hotels') {
    const title = 'How I Choose Where We Stay | Metkish Travels';
    const description =
      "How I actually pick a hotel: Booking.com filters, guest-rating thresholds, how I read reviews, and the location trade-offs behind our family's real stays.";

    return {
      title,
      description,
      alternates: {
        canonical: 'https://www.metkish.com/behind-the-trip/hotels',
      },
      openGraph: {
        title,
        description,
        url: 'https://www.metkish.com/behind-the-trip/hotels',
        images: [
          {
            url: '/og/og-home.jpg',
            width: 1200,
            height: 630,
            alt: 'Metkish Travels',
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: ['/og/og-home.jpg'],
      },
    };
  }

  // 'how-we-find-restaurants' is a real, finished article (see the
  // default export below), so -- like 'el-clasico-tickets' above -- it
  // gets its own full SEO treatment rather than the generic "coming soon"
  // metadata every other unbuilt topic still uses. No more noindex/
  // nofollow: the draft is done and ready to be found.
  if (topic === 'how-we-find-restaurants') {
    const title = 'How We Find Restaurants When Travelling | Metkish Travels';
    const description =
      'How AI helped us discover great restaurants in Barcelona, from a brunch spot to a hidden tapas bar — and the one thing we always check before going.';

    return {
      title,
      description,
      alternates: {
        canonical: 'https://www.metkish.com/behind-the-trip/how-we-find-restaurants',
      },
      openGraph: {
        title,
        description,
        url: 'https://www.metkish.com/behind-the-trip/how-we-find-restaurants',
        images: [
          {
            url: '/og/og-home.jpg',
            width: 1200,
            height: 630,
            alt: 'Metkish Travels',
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: ['/og/og-home.jpg'],
      },
    };
  }

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

  // 'el-clasico-tickets' has real content (see
  // components/guides/el-clasico-tickets-article.tsx); every other topic
  // still gets the generic "coming soon" placeholder.
  if (topic === 'el-clasico-tickets') {
    return <ElClasicoTicketsArticle />;
  }

  // 'hotels' has real, finished content (see
  // components/guides/hotels-article.tsx); every other topic still gets
  // the generic "coming soon" placeholder.
  if (topic === 'hotels') {
    return <HotelsArticle />;
  }

  // 'how-we-find-restaurants' has real, finished content (see
  // components/guides/how-we-find-restaurants-article.tsx), so -- like
  // 'el-clasico-tickets' above -- it gets its real article page rather
  // than the generic "coming soon" placeholder below.
  if (topic === 'how-we-find-restaurants') {
    return <HowWeFindRestaurantsArticle />;
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
