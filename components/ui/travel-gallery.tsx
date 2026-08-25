'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';

interface GalleryItem {
  id: string;
  src: string;
  alt: string;
  href: string;
}

interface Caption {
  // Country/region eyebrow shown above the title. Omit it when the title
  // already IS the country or region (e.g. a single-word destination like
  // "Iceland" or "Vietnam") so the two lines don't just repeat each other.
  location?: string;
  title: string;
  description: string;
}

type Block =
  | { kind: 'solo'; item: GalleryItem; caption: Caption; width: string; marginLeft?: string; aspect?: string }
  | {
      kind: 'pair';
      big: GalleryItem;
      bigCaption: Caption;
      bigWidth: string;
      bigSide: 'left' | 'right';
      small: GalleryItem;
      smallWidth: string;
    };

// Real Tenerife photo.
const tenerife: GalleryItem = {
  id: 'tenerife',
  src: '/2026-07%20-%20Tenerife/Tenerife_landing%20page.jpeg',
  alt: 'Tenerife',
  href: '#',
};
// Real Iceland photo.
const reykjavikPhoto1: GalleryItem = {
  id: 'reykjavik-1',
  src: '/2025-10%20-%20Iceland_metkish%20page/Iceland_landing%20page.jpeg',
  alt: 'Reykjavik',
  href: '#',
};
// Real Prague photo.
const prague: GalleryItem = {
  id: 'prague',
  src: '/2025-06%20-%20Czechia%20roadtrip/Prague_landing%20page.jpeg',
  alt: 'Prague',
  href: '#',
};
// Real Italy road trip photo.
const italy: GalleryItem = {
  id: 'italy',
  src: '/2026-05%20-%20Italy%20roadtrip/Milan%20Cinque%20Terre%20Pisa/Italy_landing%20page.jpeg',
  alt: 'Italy',
  href: '#',
};
// Real Sardinia photo.
const sardinia: GalleryItem = {
  id: 'sardinia',
  src: '/2025-07%20-%20Sardinia/Sardinia_landing%20page.jpeg',
  alt: 'Sardinia',
  href: '#',
};
// Real Maldives photo.
const maldives: GalleryItem = {
  id: 'maldives',
  src: '/2023-01%20-%20Maldives%20Kuramathi/IMG_9738.jpeg',
  alt: 'Maldives',
  href: '#',
};
// Real Budapest photo.
const budapest: GalleryItem = {
  id: 'budapest',
  src: '/2023-05%20-%20Budapest/Budapest_landing%20page.jpeg',
  alt: 'Budapest',
  href: '#',
};
// Real Greece / Lefkada photo.
const lefkada: GalleryItem = {
  id: 'lefkada',
  src: '/2023-07-%20Greece%20Lefkada/IMG_2193.jpeg',
  alt: 'Lefkada',
  href: '#',
};
// Real Paris photo.
const paris: GalleryItem = {
  id: 'paris',
  src: '/2023-08%20-%20France%20Paris/Paris_landing%20page.JPG',
  alt: 'Paris',
  href: '#',
};
// Real Turkey / Belek photo.
const belek: GalleryItem = {
  id: 'belek',
  src: '/2023-10%20-Turkey%20Belek/IMG_4015.jpeg',
  alt: 'Belek',
  href: '#',
};
// Real Italy / Rome photo.
const rome: GalleryItem = {
  id: 'rome',
  src: '/2023-11%20-%20Italy_Rome/Rome_landing%20page.jpeg',
  alt: 'Rome',
  href: '#',
};
// Real Germany / Euro 2024 photo.
const euro2024: GalleryItem = {
  id: 'euro-2024',
  src: '/2024-06%20-%20Germany%20euro%202024/Euro%202024%20trip.jpeg',
  alt: 'Germany, Euro 2024',
  href: '#',
};
// Real Vietnam photo.
const vietnam: GalleryItem = {
  id: 'vietnam',
  src: '/2024-12%20-%20Vietnam/Vietnam_landing%20page.jpeg',
  alt: 'Vietnam',
  href: '#',
};

// Real USA / Florida & Bahamas photo.
const floridaBahamas: GalleryItem = {
  id: 'florida-bahamas',
  src: '/2019-11%20-%20USA%20Florida%20%26%20Bahamas/Landing%20page.jpeg',
  alt: 'Florida & Bahamas',
  href: '#',
};
// Real France / Marseille & Provence photo.
const marseilleProvence: GalleryItem = {
  id: 'provence-marseille',
  src: '/2018-09%20-%20France%20Marseille%20%26%20Provence/Landing%20page.jpeg',
  alt: 'Provence & Marseille',
  href: '#',
};
// Real Seychelles photo.
const seychelles: GalleryItem = {
  id: 'seychelles',
  src: '/2018-04%20-%20Seychelles/Seychelles_landing%20page.jpg',
  alt: 'Seychelles',
  href: '#',
};

// Every destination gets its own, hand-set position — not a repeating left/right
// formula. A destination card always carries the caption; a "memory" photo
// next to it never does, so it reads as a loose snapshot, not a second card.
const BLOCKS: Block[] = [
  {
    kind: 'solo',
    item: tenerife,
    width: 'w-full',
    caption: {
      location: 'Spain · Canary Islands',
      title: 'Tenerife',
      description:
        'More than the beaches — it was the variety, the easy exploring and the feeling that there was always more to see.',
    },
  },
  {
    kind: 'solo',
    item: italy,
    width: 'w-full md:w-[85%]',
    marginLeft: 'md:ml-[15%]',
    caption: {
      location: 'Italy · Road Trip',
      title: 'Italy',
      description:
        "From Milan to Cinque Terre and Pisa — and back to Lake Garda, because we simply couldn't resist.",
    },
  },
  {
    kind: 'solo',
    item: reykjavikPhoto1,
    width: 'w-full md:w-[90%]',
    caption: {
      location: 'Reykjavik',
      title: 'Iceland',
      description:
        "Freezing winds, dark mornings and landscapes so unreal I could have stared at them forever. Iceland was unlike anywhere we'd been before.",
    },
  },
  {
    kind: 'solo',
    item: sardinia,
    width: 'w-full md:w-[76%]',
    marginLeft: 'md:ml-[6%]',
    caption: {
      location: 'Italy',
      title: 'Sardinia',
      description:
        'Crystal-clear water and crowded beaches — but the places we loved most were the quieter ones we discovered from the sea.',
    },
  },
  {
    kind: 'solo',
    item: prague,
    width: 'w-full md:w-[26%]',
    marginLeft: 'md:ml-[74%]',
    aspect: 'aspect-[3314/5708]',
    caption: {
      location: 'Czech Republic',
      title: 'Prague',
      description:
        "Cobblestone streets, an old stone gate and long afternoon shadows — Prague felt like walking straight into a postcard.",
    },
  },
  {
    kind: 'solo',
    item: vietnam,
    width: 'w-full md:w-[40%]',
    aspect: 'aspect-[3/4]',
    caption: {
      title: 'Vietnam',
      description:
        'Motorbikes, street food at every corner and a pace of life that completely rewired how I think about travel.',
    },
  },
  {
    kind: 'solo',
    item: euro2024,
    width: 'w-full md:w-[55%]',
    marginLeft: 'md:ml-[45%]',
    aspect: 'aspect-[4/3]',
    caption: {
      location: 'Germany · Euro 2024',
      title: 'Germany',
      description:
        'Stadiums, city squares full of strangers singing the same songs and a summer built entirely around football.',
    },
  },
  {
    kind: 'solo',
    item: rome,
    width: 'w-full md:w-[90%]',
    aspect: 'aspect-[4/3]',
    caption: {
      location: 'Italy',
      title: 'Rome',
      description:
        "Two thousand years of history stacked on every corner — I don't think I've ever walked that much and minded that little.",
    },
  },
  {
    kind: 'solo',
    item: belek,
    width: 'w-full md:w-[70%]',
    marginLeft: 'md:ml-[30%]',
    caption: {
      location: 'Turkey',
      title: 'Belek',
      description:
        'Warm October sun, long walks along the coast and the kind of slow week that resets everything.',
    },
  },
  {
    kind: 'solo',
    item: paris,
    width: 'w-full md:w-[28%]',
    aspect: 'aspect-[9/16]',
    caption: {
      location: 'France',
      title: 'Paris',
      description:
        'Golden evening light, quiet side streets and coffee that turned into hours — Paris in late summer, exactly as it should be.',
    },
  },
  {
    kind: 'solo',
    item: lefkada,
    width: 'w-full md:w-[58%]',
    aspect: 'aspect-[3/4]',
    caption: {
      location: 'Greece',
      title: 'Lefkada',
      description:
        'Cliffside beaches and water so blue it barely looked real — one of those islands you leave already planning to return to.',
    },
  },
  {
    kind: 'solo',
    item: budapest,
    width: 'w-full md:w-[42%]',
    marginLeft: 'md:ml-[58%]',
    aspect: 'aspect-[4/3]',
    caption: {
      location: 'Hungary',
      title: 'Budapest',
      description:
        'Thermal baths, grand architecture and a river that splits the city in two — Budapest was equal parts elegant and easygoing.',
    },
  },
  {
    kind: 'solo',
    item: maldives,
    width: 'w-full md:w-[88%]',
    aspect: 'aspect-[4/3]',
    caption: {
      location: 'Maldives',
      title: 'Kuramathi',
      description:
        'Overwater villas, endless turquoise and absolutely nothing on the agenda — the trip that taught me how to properly switch off.',
    },
  },
  {
    kind: 'solo',
    item: floridaBahamas,
    width: 'w-full md:w-[30%]',
    marginLeft: 'md:ml-[70%]',
    aspect: 'aspect-[3/4]',
    caption: {
      title: 'Florida & Bahamas',
      description:
        'Theme parks, palm trees and island-hopping into water so clear it barely looked real — a trip that felt like two very different holidays in one.',
    },
  },
  {
    kind: 'solo',
    item: marseilleProvence,
    width: 'w-full md:w-[68%]',
    aspect: 'aspect-[4/3]',
    caption: {
      location: 'France',
      title: 'Provence & Marseille',
      description:
        'Lavender fields, harbour towns and long lunches in the sun — the south of France at its most relaxed.',
    },
  },
  {
    kind: 'solo',
    item: seychelles,
    width: 'w-full md:w-[92%]',
    marginLeft: 'md:ml-[4%]',
    aspect: 'aspect-[4/3]',
    caption: {
      title: 'Seychelles',
      description:
        'Powder-white beaches, giant granite boulders and turquoise water — the kind of postcard scenery that barely felt real.',
    },
  },
];

function Photo({ item, className }: { item: GalleryItem; className: string }) {
  return (
    <div className={`relative overflow-hidden rounded-[2px] ${className}`}>
      <Image
        src={item.src}
        alt={item.alt}
        fill
        sizes='(max-width: 768px) 100vw, 75vw'
        className='object-cover transition-transform duration-300 hover:scale-105'
      />
    </div>
  );
}

function DestinationCaption({ item, caption }: { item: GalleryItem; caption: Caption }) {
  return (
    <div className='mt-6'>
      {caption.location && (
        <span className='text-xs uppercase tracking-wide font-[family-name:var(--font-poppins)] text-black/50 dark:text-white/50'>
          {caption.location}
        </span>
      )}
      <h3 className='mt-1 text-2xl font-[family-name:var(--font-playfair)] font-medium text-black dark:text-white'>
        {caption.title}
      </h3>
      <p className='mt-1 italic text-sm font-[family-name:var(--font-poppins)] text-black/70 dark:text-white/70'>
        {caption.description}
      </p>
      <a
        href={item.href}
        target='_blank'
        rel='noopener noreferrer'
        className='mt-2 inline-flex items-center min-h-11 py-2 text-sm font-[family-name:var(--font-poppins)] font-medium text-black dark:text-white hover:underline underline-offset-4'
      >
        Explore {caption.title} →
      </a>
    </div>
  );
}

// Three spacing rhythms rather than one fixed value: tight transitions keep
// consecutive large/XL moments feeling connected, normal is the baseline, and
// airy gaps give the small editorial images (Prague, Paris, Florida & Bahamas)
// room to breathe on both sides — so the rhythm follows the composition
// instead of repeating a single margin everywhere.
const TIGHT_GAP = 'mt-10 md:mt-[70px]';
const NORMAL_GAP = 'mt-16 md:mt-[110px]';
const AIRY_GAP = 'mt-28 md:mt-[190px]';
const GAP_SEQUENCE = [
  TIGHT_GAP, // Tenerife → Italy: two big opening landscapes, kept close
  NORMAL_GAP, // Italy → Iceland
  TIGHT_GAP, // Iceland → Sardinia: still riding the strong opening quartet
  AIRY_GAP, // Sardinia → Prague: settling into the first small, quiet moment
  AIRY_GAP, // Prague → Vietnam: room around the small Prague photo on both sides
  NORMAL_GAP, // Vietnam → Germany (Euro 2024)
  NORMAL_GAP, // Germany → Rome
  TIGHT_GAP, // Rome → Belek: two large architectural moments, kept close
  AIRY_GAP, // Belek → Paris: settling into the small Paris moment
  AIRY_GAP, // Paris → Lefkada: room around the small Paris photo on both sides
  NORMAL_GAP, // Lefkada → Budapest
  NORMAL_GAP, // Budapest → Maldives
  AIRY_GAP, // Maldives → Florida & Bahamas: from the grand postcard to a small snapshot
  AIRY_GAP, // Florida & Bahamas → Marseille & Provence: room around that snapshot
  TIGHT_GAP, // Marseille & Provence → Seychelles: build straight into the finale
];

export default function TravelGallery() {
  return (
    <div className='flex flex-col w-full'>
      {BLOCKS.map((block, i) => {
        const delay = (i % 5) * 0.05;
        const spacing = i === 0 ? '' : GAP_SEQUENCE[i - 1];

        if (block.kind === 'solo') {
          return (
            <motion.div
              key={block.item.id}
              className={`${spacing} ${block.width} ${block.marginLeft ?? ''}`}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay }}
            >
              <Photo item={block.item} className={`w-full ${block.aspect ?? 'aspect-[16/9]'}`} />
              <DestinationCaption item={block.item} caption={block.caption} />
            </motion.div>
          );
        }

        const bigCard = (
          <div className={block.bigWidth}>
            <Photo item={block.big} className='w-full aspect-[4/3]' />
            <DestinationCaption item={block.big} caption={block.bigCaption} />
          </div>
        );
        const smallCard = (
          <div className={`${block.smallWidth} mt-6 md:mt-0`}>
            <Photo item={block.small} className='w-full aspect-[3/4]' />
          </div>
        );

        return (
          <motion.div
            key={block.big.id}
            className={`${spacing} flex flex-col md:flex-row md:justify-between md:items-start`}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay }}
          >
            {block.bigSide === 'left' ? (
              <>
                {bigCard}
                {smallCard}
              </>
            ) : (
              <>
                {smallCard}
                {bigCard}
              </>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
