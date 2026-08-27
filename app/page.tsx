'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import ScrollExpandMedia from '@/components/ui/scroll-expansion-hero';
import TravelGallery from '@/components/ui/travel-gallery';

const BG_IMAGE_SRC = '/metkish-provansa.jpg';
const LOGO_SRC = '/metkish-logo.png';

export default function Home() {
  const [pastHero, setPastHero] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setPastHero(window.scrollY > window.innerHeight * 0.85);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className='min-h-screen'>
      <div className='fixed top-0 left-0 w-full h-28 z-50 pointer-events-none backdrop-blur-md [mask-image:linear-gradient(to_bottom,black,transparent)]' />
      <button
        type='button'
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className={`fixed top-4 left-4 z-50 cursor-pointer transition-all duration-300 rounded-full ${
          pastHero ? 'backdrop-blur-sm bg-white/40 dark:bg-black/40' : ''
        }`}
        aria-label='Nazaj na vrh strani'
      >
        <Image
          src={LOGO_SRC}
          alt='Metkish logo'
          width={104}
          height={104}
          className={`rounded-full transition-all duration-300 ${
            pastHero
              ? 'w-11 h-11 sm:w-14 sm:h-14 opacity-70 hover:opacity-100'
              : 'w-[104px] h-[104px] opacity-100'
          }`}
          priority
        />
      </button>
      <ScrollExpandMedia
        bgImageSrc={BG_IMAGE_SRC}
        date='The World Through My Eyes'
        textBlend
      >
        <div id='travels' className='w-full max-w-[100rem] mx-auto px-6 md:px-12 flex flex-col items-center scroll-mt-24'>
          <h2 className='text-5xl font-[family-name:var(--font-playfair)] font-medium text-black dark:text-white text-center'>
            My Travels
          </h2>
          <div className='flex items-center justify-center gap-3 mt-4'>
            <span className='h-px w-10 bg-pink-300 dark:bg-pink-400/60' />
            <span className='text-pink-400 text-2xl leading-none'>♥</span>
            <span className='h-px w-10 bg-pink-300 dark:bg-pink-400/60' />
          </div>
          <p className='mt-4 mb-10 text-base lowercase font-[family-name:var(--font-poppins)] font-bold tracking-normal text-black/70 dark:text-white/70 text-center'>
            places I&apos;ve been · memories I&apos;ve kept
          </p>
          <TravelGallery />
        </div>
      </ScrollExpandMedia>

      <section
        id='guides'
        className='scroll-mt-24 flex flex-col items-center px-8 py-24 bg-[#eae9e6] dark:bg-black'
      >
        <h2 className='text-5xl font-[family-name:var(--font-playfair)] font-medium text-black dark:text-white text-center'>
          Guides
        </h2>
        <p className='mt-6 mb-6 text-base lowercase font-[family-name:var(--font-poppins)] font-bold tracking-normal text-black/70 dark:text-white/70 text-center'>
          tips · itineraries · travel notes
        </p>
        <p className='max-w-xl text-center text-base font-[family-name:var(--font-poppins)] text-black/80 dark:text-white/80'>
          What was worth it, what wasn&apos;t, and everything I learned along
          the way.
        </p>
        <a
          href='#'
          className='mt-4 inline-flex items-center min-h-11 py-2 text-sm font-[family-name:var(--font-poppins)] font-medium text-black dark:text-white hover:underline underline-offset-4'
        >
          Explore the guides →
        </a>
      </section>

      <section
        id='about'
        className='scroll-mt-24 flex flex-col items-center px-8 py-24 bg-[#f3f2ef] dark:bg-black'
      >
        <h2 className='text-5xl font-[family-name:var(--font-playfair)] font-medium text-black dark:text-white text-center'>
          About
        </h2>
        <p className='mt-6 mb-6 text-base lowercase font-[family-name:var(--font-poppins)] font-bold tracking-normal text-black/70 dark:text-white/70 text-center'>
          the story behind the journeys
        </p>
        <p className='max-w-2xl text-center text-base font-[family-name:var(--font-poppins)] text-black/80 dark:text-white/80'>
          I&apos;m Metka, the planner behind our family travels. I love
          figuring out where to go, where to stay and how to make a trip
          work for us — then leaving enough room to simply enjoy it. Here I
          share what worked, what didn&apos;t, and what I&apos;d do
          differently next time.
        </p>
        <a
          href='/about'
          className='mt-4 inline-flex items-center min-h-11 py-2 text-sm font-[family-name:var(--font-poppins)] font-medium text-black dark:text-white hover:underline underline-offset-4'
        >
          More about me →
        </a>
      </section>

      <footer className='flex flex-col items-center gap-2 px-8 py-9 bg-[#2a2a2a] text-white text-center'>
        <Image
          src={LOGO_SRC}
          alt='Metkish logo'
          width={240}
          height={240}
          className='w-[92px] md:w-[120px] h-auto -my-3 md:-my-4'
        />
        <p className='text-sm italic lowercase font-[family-name:var(--font-poppins)] font-medium text-white/70'>
          travel · memories · places worth remembering
        </p>
        <nav className='flex items-center gap-2 sm:gap-6 mt-1'>
          <a
            href='#travels'
            className='inline-flex items-center min-h-11 px-2 text-sm font-[family-name:var(--font-poppins)] uppercase tracking-wide text-white/80 hover:text-white'
          >
            Travels
          </a>
          <a
            href='#guides'
            className='inline-flex items-center min-h-11 px-2 text-sm font-[family-name:var(--font-poppins)] uppercase tracking-wide text-white/80 hover:text-white'
          >
            Guides
          </a>
          <a
            href='/about'
            className='inline-flex items-center min-h-11 px-2 text-sm font-[family-name:var(--font-poppins)] uppercase tracking-wide text-white/80 hover:text-white'
          >
            About
          </a>
        </nav>
        <a
          href='mailto:info@metkish.com'
          className='inline-flex items-center min-h-11 px-2 text-sm font-[family-name:var(--font-poppins)] text-white/90 hover:text-white underline underline-offset-4'
        >
          info@metkish.com ↗
        </a>
        <p className='mt-3 text-xs font-[family-name:var(--font-poppins)] text-white/40'>
          © {new Date().getFullYear()} Metkish. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
