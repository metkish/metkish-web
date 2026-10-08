// One entry per Behind the Trip topic shown on the homepage (see the
// "guides" section in app/page.tsx). This is the single source of truth
// for both the homepage preview grid and each topic's own permanent page
// (see app/behind-the-trip/[topic]/page.tsx): add a topic here and it
// automatically appears in the grid (three balanced columns on desktop,
// a single stacked column on mobile -- see app/page.tsx). Most topics
// get a generic "coming soon" page; a topic can instead render a full
// article by branching on its slug in app/behind-the-trip/[topic]/page.tsx
// (see 'el-clasico-tickets', which renders
// components/guides/el-clasico-tickets-article.tsx).
//
// `heading` is the short label shown above the topic on the homepage
// (e.g. "Hotels"). `kicker` is the fuller description of what the topic
// actually covers — it doubles as the title of the topic's own page, the
// way a destination's name is the title of its page.
export interface BehindTheTripTopic {
  slug: string;
  heading: string;
  kicker: string;
  body: string;
}

export const BEHIND_THE_TRIP_TOPICS: BehindTheTripTopic[] = [
  {
    slug: 'hotels',
    heading: 'Hotels',
    kicker: 'How I choose where we stay',
    body: 'What I look for, what I compare and what actually matters to me when choosing a hotel.',
  },
  {
    slug: 'flights',
    heading: 'Flights',
    kicker: 'How I search for flights',
    body: "How I compare routes, times and prices — and why the cheapest flight isn't always my choice.",
  },
  {
    slug: 'el-clasico-tickets',
    heading: 'El Clásico Tickets',
    kicker: 'How we got our tickets',
    body: 'Membership, presale chaos and the real cost of securing four seats for El Clásico.',
  },
];

export function getBehindTheTripTopicBySlug(slug: string): BehindTheTripTopic | undefined {
  return BEHIND_THE_TRIP_TOPICS.find((t) => t.slug === slug);
}
