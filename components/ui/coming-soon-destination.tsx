'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

const LOGO_SRC = '/metkish-logo.png';

// Same fade-up-on-scroll rhythm used across the site (About page, My
// Travels gallery): once-only, generous viewport threshold, no bounce.
function Reveal({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6 }}
    >
      {children}
    </motion.div>
  );
}

export interface ComingSoonDestinationProps {
  name: string;
  location?: string;
}

// Temporary "coming soon" state for a destination page. Every destination
// gets its own permanent URL (see app/[destination]/page.tsx and
// lib/destinations.ts) even before it has real content, so this component
// is intentionally minimal: no photos, no story sections yet.
//
// When a destination's real content is ready, it belongs here (or in a
// dedicated component this one is swapped out for) — the route itself
// never has to change. Eventually each page will grow: photographs, our
// personal experience, places we visited, accommodation, things worth
// doing, things we'd do differently, and practical information.
export default function ComingSoonDestination({ name, location }: ComingSoonDestinationProps) {
  const [pastHero, setPastHero] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setPastHero(window.scrollY > window.innerHeight * 0.5);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className='min-h-screen bg-[#faf9f6] dark:bg-black flex flex-col'>
      <div className='fixed top-0 left-0 w-full h-28 z-50 pointer-events-none backdrop-blur-md [mask-image:linear-gradient(to_bottom,black,transparent)]' />
      <Link
        href='/'
        aria-label='Back to homepage'
        className={`fixed top-4 left-4 z-50 cursor-pointer transition-all duration-300 rounded-full ${
          pastHero ? 'backdrop-blur-sm bg-white/40 dark:bg-black/40' : ''
        }`}
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
      </Link>

      <main className='flex-1 flex flex-col items-center justify-center text-center px-6 py-40 md:py-48'>
        <Reveal className='max-w-xl mx-auto flex flex-col items-center'>
          <h1 className='text-4xl sm:text-5xl md:text-6xl font-[family-name:var(--font-playfair)] font-medium text-black dark:text-white'>
            {name}
          </h1>
          {location && (
            <span className='mt-3 text-sm md:text-[0.95rem] uppercase tracking-[0.18em] font-[family-name:var(--font-poppins)] font-semibold text-black/50 dark:text-white/50'>
              {location}
            </span>
          )}

          <p className='mt-14 md:mt-16 text-2xl md:text-3xl italic font-[family-name:var(--font-playfair)] font-medium text-black dark:text-white leading-snug'>
            Coming soon.
          </p>
          <p className='mt-4 text-base md:text-lg font-[family-name:var(--font-poppins)] font-light text-black/70 dark:text-white/70'>
            The full travel story is on its way.
          </p>

          <Link
            href='/#travels'
            className='mt-16 md:mt-20 inline-flex items-center min-h-11 py-2 text-sm font-[family-name:var(--font-poppins)] font-medium text-black/70 dark:text-white/70 hover:text-black dark:hover:text-white hover:underline underline-offset-4'
          >
            ← Back to destinations
          </Link>
        </Reveal>
      </main>

      <footer className='flex flex-col items-center gap-3 px-8 py-12 bg-[#2a2a2a] text-white text-center'>
        <Image
          src={LOGO_SRC}
          alt='Metkish logo'
          width={240}
          height={240}
          className='w-[92px] md:w-[120px] h-auto -mt-8 mb-2 md:-mt-9 md:mb-1'
        />
        <p className='text-sm italic lowercase font-[family-name:var(--font-poppins)] font-medium text-white/70'>
          travel · memories · places worth remembering
        </p>
        <nav className='flex items-center gap-2 sm:gap-6 mt-1'>
          <Link
            href='/#travels'
            className='inline-flex items-center min-h-11 px-2 text-sm font-[family-name:var(--font-poppins)] uppercase tracking-wide text-white/80 hover:text-white'
          >
            Travels
          </Link>
          <Link
            href='/#guides'
            className='inline-flex items-center min-h-11 px-2 text-sm font-[family-name:var(--font-poppins)] uppercase tracking-wide text-white/80 hover:text-white'
          >
            Behind the Trip
          </Link>
          <Link
            href='/about'
            className='inline-flex items-center min-h-11 px-2 text-sm font-[family-name:var(--font-poppins)] uppercase tracking-wide text-white/80 hover:text-white'
          >
            About
          </Link>
        </nav>
        <a
          href='mailto:info@metkish.com'
          className='inline-flex items-center min-h-11 px-2 text-sm font-[family-name:var(--font-poppins)] text-white/90 hover:text-white underline underline-offset-4'
        >
          info@metkish.com ↗
        </a>
        <p className='mt-4 text-xs font-[family-name:var(--font-poppins)] text-white/40'>
          © {new Date().getFullYear()} Metkish. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
