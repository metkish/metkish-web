'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';

interface GalleryItem {
  id: string;
  src: string;
  alt: string;
  href: string;
}

// Placeholder images/links — swap `src` and `href` per item once real photos are ready.
const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 'travel-1',
    src: 'https://picsum.photos/seed/metkish-travel-1/800/800',
    alt: 'Potovanje 1',
    href: '#',
  },
  {
    id: 'travel-2',
    src: 'https://picsum.photos/seed/metkish-travel-2/800/800',
    alt: 'Potovanje 2',
    href: '#',
  },
  {
    id: 'travel-3',
    src: 'https://picsum.photos/seed/metkish-travel-3/800/800',
    alt: 'Potovanje 3',
    href: '#',
  },
  {
    id: 'travel-4',
    src: 'https://picsum.photos/seed/metkish-travel-4/800/800',
    alt: 'Potovanje 4',
    href: '#',
  },
];

export default function TravelGallery() {
  return (
    <div className='flex flex-col items-center gap-10 py-4'>
      {GALLERY_ITEMS.map((item, index) => (
        <motion.a
          key={item.id}
          href={item.href}
          target='_blank'
          rel='noopener noreferrer'
          className='block w-80 md:w-[28rem] aspect-square overflow-hidden rounded-2xl shadow-lg'
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, delay: index * 0.05 }}
        >
          <Image
            src={item.src}
            alt={item.alt}
            width={800}
            height={800}
            className='w-full h-full object-cover transition-transform duration-300 hover:scale-105'
          />
        </motion.a>
      ))}
    </div>
  );
}
