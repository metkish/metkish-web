'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import ScrollExpandMedia from '@/components/ui/scroll-expansion-hero';
import TravelGallery from '@/components/ui/travel-gallery';

const BG_IMAGE_SRC =
  'https://pub-639db9eee0bc4d35bfa9f777a62a6f91.r2.dev/Landing%20page/metkish_provansa.jpg';
const LOGO_SRC =
  'https://pub-639db9eee0bc4d35bfa9f777a62a6f91.r2.dev/Landing%20page/Logo%20metkish/metkish-logo-transparent-circle.png';

export default function Home() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className='min-h-screen'>
      <div className='fixed top-0 left-0 w-full h-28 z-50 pointer-events-none backdrop-blur-md [mask-image:linear-gradient(to_bottom,black,transparent)]' />
      <a
        href='mailto:info@metkish.com'
        className='fixed top-4 left-4 z-50'
        aria-label='Pošlji e-pošto na info@metkish.com'
      >
        <Image
          src={LOGO_SRC}
          alt='Metkish logo'
          width={104}
          height={104}
          className='rounded-full'
          priority
        />
      </a>
      <ScrollExpandMedia
        bgImageSrc={BG_IMAGE_SRC}
        date='The world through my eyes'
        textBlend
      >
        <div className='max-w-4xl mx-auto flex flex-col items-center'>
          <h2 className='text-3xl font-[family-name:var(--font-fredoka)] font-bold uppercase text-black dark:text-white mb-10'>
            My travels
          </h2>
          <TravelGallery />
        </div>
      </ScrollExpandMedia>
    </div>
  );
}
