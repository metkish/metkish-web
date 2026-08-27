// One entry per destination currently shown in the My Travels gallery
// (components/ui/travel-gallery.tsx). This is the single source of truth
// for destination pages: it drives generateStaticParams for /[destination]
// and the "Explore" links inside the gallery. Whenever a destination is
// added to the gallery, add its slug here too so it gets its own page and
// its Explore button has somewhere to go.
//
// `name` mirrors the title already shown on that destination's gallery
// card; `location` mirrors the small eyebrow line above it there, when the
// card has one. Slugs are short, single-word-where-possible and kept
// stable on purpose: this is the permanent URL for each destination, even
// before it has real content.
export interface Destination {
  slug: string;
  name: string;
  location?: string;
}

export const DESTINATIONS: Destination[] = [
  { slug: 'tenerife', name: 'Tenerife', location: 'Spain · Canary Islands' },
  { slug: 'italy', name: 'Italy', location: 'Italy · Road Trip' },
  { slug: 'iceland', name: 'Iceland', location: 'Reykjavik' },
  { slug: 'sardinia', name: 'Sardinia', location: 'Italy' },
  { slug: 'prague', name: 'Prague', location: 'Czech Republic' },
  { slug: 'vietnam', name: 'Vietnam' },
  { slug: 'germany', name: 'Germany', location: 'Germany · Euro 2024' },
  { slug: 'rome', name: 'Rome', location: 'Italy' },
  { slug: 'belek', name: 'Belek', location: 'Turkey' },
  { slug: 'paris', name: 'Paris', location: 'France' },
  { slug: 'lefkada', name: 'Lefkada', location: 'Greece' },
  { slug: 'budapest', name: 'Budapest', location: 'Hungary' },
  { slug: 'maldives', name: 'Kuramathi', location: 'Maldives' },
  { slug: 'florida-bahamas', name: 'Florida & Bahamas' },
  { slug: 'provence-marseille', name: 'Provence & Marseille', location: 'France' },
  { slug: 'seychelles', name: 'Seychelles' },
];

export function getDestinationBySlug(slug: string): Destination | undefined {
  return DESTINATIONS.find((d) => d.slug === slug);
}
