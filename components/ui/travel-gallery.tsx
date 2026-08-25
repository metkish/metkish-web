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
  location: string;
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
  src: '/Tenerife/Tenerife_landing%20page.jpeg',
  alt: 'Tenerife',
  href: '#',
};
// Real Iceland photos.
const reykjavikPhoto1: GalleryItem = {
  id: 'reykjavik-1',
  src: '/Iceland/Iceland_metkish%20page/Iceland_landing%20page.jpeg',
  alt: 'Reykjavik',
  href: '#',
};
const reykjavikPhoto2: GalleryItem = {
  id: 'reykjavik-2',
  src: '/Iceland/Iceland_metkish%20page/Iceland_landing%20page2.jpeg',
  alt: 'Reykjavik',
  href: '#',
};
// Real Prague photo.
const prague: GalleryItem = {
  id: 'prague',
  src: '/Czechia/Prague_landing%20page.jpeg',
  alt: 'Prague',
  href: '#',
};
// Placeholder photos/captions — swap `src`, `href` and caption text once real content is ready.
const italy: GalleryItem = {
  id: 'italy',
  src: '/Italy/Milan%20Cinque%20Terre%20Pisa/Italy_landing%20page.jpeg',
  alt: 'Italy',
  href: '#',
};
const sardiniaMemory: GalleryItem = {
  id: 'sardinia-memory',
  src: '/Sardinia/Sardinia_landing%20page2.jpeg',
  alt: 'Sardinia',
  href: '#',
};
const sardinia: GalleryItem = {
  id: 'sardinia',
  src: '/Sardinia/Sardinia_landing%20page.jpeg',
  alt: 'Sardinia',
  href: '#',
};
const reykjavik: GalleryItem = {
  id: 'reykjavik',
  src: '/placeholder_picture.jpg',
  alt: 'Unknown',
  href: '#',
};
const amsterdam: GalleryItem = {
  id: 'amsterdam',
  src: '/placeholder_picture.jpg',
  alt: 'Unknown',
  href: '#',
};
const amsterdamMemory: GalleryItem = {
  id: 'amsterdam-memory',
  src: '/placeholder_picture.jpg',
  alt: 'Unknown',
  href: '#',
};
const lisbon: GalleryItem = {
  id: 'lisbon',
  src: '/placeholder_picture.jpg',
  alt: 'Unknown',
  href: '#',
};
const provenceMemory: GalleryItem = {
  id: 'provence-memory',
  src: '/placeholder_picture.jpg',
  alt: 'Unknown',
  href: '#',
};
const provence: GalleryItem = {
  id: 'provence',
  src: '/placeholder_picture.jpg',
  alt: 'Unknown',
  href: '#',
};
const dubrovnik: GalleryItem = {
  id: 'dubrovnik',
  src: '/placeholder_picture.jpg',
  alt: 'Unknown',
  href: '#',
};
const marrakech: GalleryItem = {
  id: 'marrakech',
  src: '/placeholder_picture.jpg',
  alt: 'Unknown',
  href: '#',
};
const marrakechMemory: GalleryItem = {
  id: 'marrakech-memory',
  src: '/placeholder_picture.jpg',
  alt: 'Unknown',
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
    kind: 'pair',
    big: reykjavikPhoto1,
    bigSide: 'left',
    bigWidth: 'w-full md:w-[60%]',
    small: reykjavikPhoto2,
    smallWidth: 'w-full md:w-[27%]',
    bigCaption: {
      location: 'Iceland',
      title: 'Iceland',
      description:
        "Freezing winds, dark mornings and landscapes so unreal I could have stared at them forever. Iceland was unlike anywhere we'd been before.",
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
    kind: 'pair',
    big: sardinia,
    bigSide: 'left',
    bigWidth: 'w-full md:w-[60%]',
    small: sardiniaMemory,
    smallWidth: 'w-full md:w-[22%]',
    bigCaption: {
      location: 'Italy · Sardinia',
      title: 'Sardinia',
      description:
        'Crystal-clear water and crowded beaches — but the places we loved most were the quieter ones we discovered from the sea.',
    },
  },
  {
    kind: 'solo',
    item: prague,
    width: 'w-full md:w-[46%]',
    marginLeft: 'md:ml-[27%]',
    aspect: 'aspect-[3/4]',
    caption: {
      location: 'Czech Republic · Prague',
      title: 'Prague',
      description:
        "Cobblestone streets, an old stone gate and long afternoon shadows — Prague felt like walking straight into a postcard.",
    },
  },
  {
    kind: 'solo',
    item: reykjavik,
    width: 'w-full',
    caption: {
      location: 'Unknown',
      title: 'Unknown',
      description: 'Coming soon.',
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
      location: 'Unknown',
      title: 'Unknown',
      description: 'Coming soon.',
    },
  },
  {
    kind: 'solo',
    item: lisbon,
    width: 'w-full md:w-[84%]',
    caption: {
      location: 'Unknown',
      title: 'Unknown',
      description: 'Coming soon.',
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
      location: 'Unknown',
      title: 'Unknown',
      description: 'Coming soon.',
    },
  },
  {
    kind: 'solo',
    item: dubrovnik,
    width: 'w-full',
    caption: {
      location: 'Unknown',
      title: 'Unknown',
      description: 'Coming soon.',
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
      location: 'Unknown',
      title: 'Unknown',
      description: 'Coming soon.',
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
        {caption.location}
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
  NORMAL_GAP, // Tenerife → Iceland
  BIG_GAP, // Iceland → Italy
  NORMAL_GAP, // Italy → Sardinia
  BIG_GAP, // Sardinia → Prague
  NORMAL_GAP, // Prague → Reykjavik
  BIG_GAP, // Reykjavik → Amsterdam
  NORMAL_GAP, // Amsterdam → Lisbon
  BIG_GAP, // Lisbon → Provence
  NORMAL_GAP, // Provence → Dubrovnik
  BIG_GAP, // Dubrovnik → Marrakech
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
