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
  index: string;
  location: string;
  title: string;
  description: string;
}

type Block =
  | { kind: 'solo'; item: GalleryItem; caption: Caption; width: string; marginLeft?: string }
  | {
      kind: 'pair';
      big: GalleryItem;
      bigCaption: Caption;
      bigWidth: string;
      bigSide: 'left' | 'right';
      small: GalleryItem;
      smallWidth: string;
    };

// Placeholder photos/captions — swap `src`, `href` and caption text once real content is ready.
const tenerife: GalleryItem = {
  id: 'tenerife',
  src: 'https://picsum.photos/seed/metkish-travel-1/1800/1000',
  alt: 'Tenerife',
  href: '#',
};
const barcelona: GalleryItem = {
  id: 'barcelona',
  src: 'https://picsum.photos/seed/metkish-travel-2/1200/900',
  alt: 'Barcelona',
  href: '#',
};
const barcelonaMemory: GalleryItem = {
  id: 'barcelona-memory',
  src: 'https://picsum.photos/seed/metkish-memory-a/700/1000',
  alt: 'Potovanje',
  href: '#',
};
const sardinia: GalleryItem = {
  id: 'sardinia',
  src: 'https://picsum.photos/seed/metkish-travel-15/1800/1000',
  alt: 'Sardinia',
  href: '#',
};
const santoriniMemory: GalleryItem = {
  id: 'santorini-memory',
  src: 'https://picsum.photos/seed/metkish-memory-b/700/1000',
  alt: 'Potovanje',
  href: '#',
};
const santorini: GalleryItem = {
  id: 'santorini',
  src: 'https://picsum.photos/seed/metkish-travel-8/1200/900',
  alt: 'Santorini',
  href: '#',
};
const reykjavik: GalleryItem = {
  id: 'reykjavik',
  src: 'https://picsum.photos/seed/metkish-travel-4/1800/1000',
  alt: 'Reykjavik',
  href: '#',
};
const amsterdam: GalleryItem = {
  id: 'amsterdam',
  src: 'https://picsum.photos/seed/metkish-travel-9/1200/900',
  alt: 'Amsterdam',
  href: '#',
};
const amsterdamMemory: GalleryItem = {
  id: 'amsterdam-memory',
  src: 'https://picsum.photos/seed/metkish-memory-c/700/1000',
  alt: 'Potovanje',
  href: '#',
};
const lisbon: GalleryItem = {
  id: 'lisbon',
  src: 'https://picsum.photos/seed/metkish-travel-11/1800/1000',
  alt: 'Lisbon',
  href: '#',
};
const provenceMemory: GalleryItem = {
  id: 'provence-memory',
  src: 'https://picsum.photos/seed/metkish-memory-d/700/1000',
  alt: 'Potovanje',
  href: '#',
};
const provence: GalleryItem = {
  id: 'provence',
  src: 'https://picsum.photos/seed/metkish-travel-12/1200/900',
  alt: 'Provence',
  href: '#',
};
const dubrovnik: GalleryItem = {
  id: 'dubrovnik',
  src: 'https://picsum.photos/seed/metkish-travel-16/1800/1000',
  alt: 'Dubrovnik',
  href: '#',
};
const marrakech: GalleryItem = {
  id: 'marrakech',
  src: 'https://picsum.photos/seed/metkish-travel-17/1200/900',
  alt: 'Marrakech',
  href: '#',
};
const marrakechMemory: GalleryItem = {
  id: 'marrakech-memory',
  src: 'https://picsum.photos/seed/metkish-memory-e/700/1000',
  alt: 'Potovanje',
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
      index: '01',
      location: 'Spain · Canary Islands',
      title: 'Tenerife',
      description:
        "Volcanic landscapes, warm evenings and a few things we'd do differently.",
    },
  },
  {
    kind: 'pair',
    big: barcelona,
    bigSide: 'left',
    bigWidth: 'w-full md:w-[60%]',
    small: barcelonaMemory,
    smallWidth: 'w-full md:w-[27%]',
    bigCaption: {
      index: '02',
      location: 'Spain',
      title: 'Barcelona',
      description:
        'City walks, late dinners and a place we always seem to come back to.',
    },
  },
  {
    kind: 'solo',
    item: sardinia,
    width: 'w-full md:w-[85%]',
    marginLeft: 'md:ml-[15%]',
    caption: {
      index: '03',
      location: 'Italy · Sardinia',
      title: 'Sardinia',
      description:
        'Clear water, mountain roads and the corners of the island we still talk about.',
    },
  },
  {
    kind: 'pair',
    big: santorini,
    bigSide: 'left',
    bigWidth: 'w-full md:w-[60%]',
    small: santoriniMemory,
    smallWidth: 'w-full md:w-[22%]',
    bigCaption: {
      index: '04',
      location: 'Greece',
      title: 'Santorini',
      description:
        "Sunsets that live up to the hype, and the hikes that don't.",
    },
  },
  {
    kind: 'solo',
    item: reykjavik,
    width: 'w-full',
    caption: {
      index: '05',
      location: 'Iceland',
      title: 'Reykjavik',
      description:
        'Black sand beaches, northern lights and cold mornings worth waking up for.',
    },
  },
  {
    kind: 'pair',
    big: amsterdam,
    bigSide: 'right',
    bigWidth: 'w-full md:w-[55%]',
    small: amsterdamMemory,
    smallWidth: 'w-full md:w-[25%]',
    bigCaption: {
      index: '06',
      location: 'Netherlands',
      title: 'Amsterdam',
      description:
        "Canals, bicycles and the best pancakes we didn't expect to love.",
    },
  },
  {
    kind: 'solo',
    item: lisbon,
    width: 'w-full md:w-[84%]',
    caption: {
      index: '07',
      location: 'Portugal',
      title: 'Lisbon',
      description:
        'Steep streets, good coffee and evenings that went on longer than planned.',
    },
  },
  {
    kind: 'pair',
    big: provence,
    bigSide: 'right',
    bigWidth: 'w-full md:w-[65%]',
    small: provenceMemory,
    smallWidth: 'w-full md:w-[24%]',
    bigCaption: {
      index: '08',
      location: 'France · Provence',
      title: 'Provence',
      description:
        "Lavender fields, quiet villages and the drive we'd happily repeat.",
    },
  },
  {
    kind: 'solo',
    item: dubrovnik,
    width: 'w-full',
    caption: {
      index: '09',
      location: 'Croatia',
      title: 'Dubrovnik',
      description: 'Old stone, blue water and more stairs than we expected.',
    },
  },
  {
    kind: 'pair',
    big: marrakech,
    bigSide: 'left',
    bigWidth: 'w-full md:w-[58%]',
    small: marrakechMemory,
    smallWidth: 'w-full md:w-[28%]',
    bigCaption: {
      index: '10',
      location: 'Morocco',
      title: 'Marrakech',
      description:
        "Spice markets, rooftop views and a little bit of chaos we'd repeat.",
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
      <span className='text-xs uppercase tracking-wide font-[family-name:var(--font-poppins)] text-black/50 dark:text-white/50'>
        {caption.index} — {caption.location}
      </span>
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
        className='mt-2 inline-block text-sm font-[family-name:var(--font-poppins)] font-medium text-black dark:text-white hover:underline underline-offset-4'
      >
        Explore {caption.title} →
      </a>
    </div>
  );
}

// Two spacing rhythms, alternated between blocks rather than one fixed value —
// a uniform gap everywhere reads mechanical; varying it (subtly) reads editorial.
const NORMAL_GAP = 'mt-16 md:mt-[110px]';
const BIG_GAP = 'mt-24 md:mt-[165px]';
const GAP_SEQUENCE = [
  NORMAL_GAP, // Tenerife → Barcelona
  BIG_GAP, // Barcelona → Sardinia
  NORMAL_GAP, // Sardinia → Santorini
  BIG_GAP, // Santorini → Reykjavik
  NORMAL_GAP, // Reykjavik → Amsterdam
  BIG_GAP, // Amsterdam → Lisbon
  NORMAL_GAP, // Lisbon → Provence
  BIG_GAP, // Provence → Dubrovnik
  NORMAL_GAP, // Dubrovnik → Marrakech
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
              <Photo item={block.item} className='w-full aspect-[16/9]' />
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
