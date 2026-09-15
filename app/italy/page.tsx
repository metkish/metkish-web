'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import TracedRouteMap from '@/components/journey/TracedRouteMap';
import {
  HOME_TO_MILANO_ROUTE_IMAGE,
  HOME_TO_MILANO_ROUTE_IMAGE_WIDTH,
  HOME_TO_MILANO_ROUTE_IMAGE_HEIGHT,
  HOME_TO_MILANO_TRACED_PATH,
} from '@/lib/journeys/italy';

const LOGO_SRC = '/metkish-logo.png';

// Same fade-up-on-scroll rhythm used throughout the site (Tenerife, About,
// My Travels gallery, Behind the Trip): once-only, generous viewport
// threshold, no bounce. Duplicated here (rather than imported from the
// Tenerife page, which isn't a shared module) per this build's explicit
// instruction not to touch Tenerife or its components.
function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, delay }}
    >
      {children}
    </motion.div>
  );
}

// LEVEL 2 editorial heading — same Playfair scale as every chapter opener
// on the Tenerife page (text-3xl md:text-4xl font-medium), so "First stop?
// Milano!" reads at the identical weight/size a reader already knows from
// there, even though this component is its own local copy rather than a
// shared import (see Reveal above for why).
function ChapterHeading({
  children,
  italic = false,
  className = '',
}: {
  children: ReactNode;
  italic?: boolean;
  className?: string;
}) {
  return (
    <p
      className={`text-3xl md:text-4xl font-[family-name:var(--font-playfair)] font-medium text-black dark:text-white ${
        italic ? 'italic' : ''
      } ${className}`}
    >
      {children}
    </p>
  );
}

export default function ItalyPage() {
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
    <div className='min-h-screen bg-[#faf9f6] dark:bg-black'>
      <div className='fixed top-0 left-0 w-full h-28 z-50 pointer-events-none backdrop-blur-md [mask-image:linear-gradient(to_bottom,black,transparent)]' />
      <Link
        href='/'
        aria-label='Back to homepage'
        className='fixed top-4 left-4 z-50 cursor-pointer transition-all duration-300'
      >
        <Image
          src={LOGO_SRC}
          alt='Metkish logo'
          width={104}
          height={104}
          className={`transition-all duration-300 ${
            pastHero
              ? 'w-11 h-11 sm:w-14 sm:h-14 opacity-70 hover:opacity-100'
              : 'w-[104px] h-[104px] opacity-100'
          }`}
          priority
        />
      </Link>

      {/* 1. OPENING — no photo, no subtitle, no destination name: just the
          title, as the whole visual statement. Full viewport height like
          every other destination page's opening beat, but centred on the
          site's plain off-white rather than a photograph, since a photo
          hero always implies "here's what this place looks like" and this
          page opens before that — with the drive itself, not the
          destination. Sized above Tenerife's own hero h1 (which shares
          its frame with a photograph and needs room for a location line
          and a caption underneath); here the words are the entire scene,
          so they're allowed to fill more of it. */}
      <section className='relative h-[100svh] md:h-[100dvh] w-full flex items-center justify-center overflow-hidden'>
        <Reveal>
          <h1 className='text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-[family-name:var(--font-playfair)] font-medium uppercase tracking-wide sm:tracking-[0.04em] text-black dark:text-white text-center px-6'>
            Road Trip
          </h1>
        </Reveal>
      </section>

      {/* 2. FIRST CHAPTER — deliberately generous top gap (more than the
          site's usual chapter-to-chapter rhythm) since this follows a
          full-height, otherwise-empty opening rather than another
          chapter's ending content; it needs to read as a clear new
          beginning on its own, not a continuation. Nothing else here yet
          — no eyebrow/RouteLabel, no body copy — only the one line the
          brief asked for. */}
      <section className='px-6 md:px-12 pt-20 sm:pt-28 md:pt-36 pb-10 md:pb-14 bg-[#faf9f6] dark:bg-black'>
        <Reveal className='max-w-2xl mx-auto text-center'>
          <ChapterHeading italic>First stop? Milano!</ChapterHeading>
        </Reveal>
      </section>

      {/* 3. MAP — Home -> Milano, traced directly from the reference map
          supplied for this step (see components/journey/TracedRouteMap
          and lib/journeys/italy.ts for how and why). Sits in its own
          cream band, edge to edge, matching every other Journey Map
          section on the site, and is the last thing on the page for now
          per this step's scope. */}
      <section className='pb-20 md:pb-28'>
        <Reveal className='px-4 sm:px-6 md:px-12'>
          <TracedRouteMap
            imageSrc={HOME_TO_MILANO_ROUTE_IMAGE}
            imageAlt='Reference driving route from Home to Milano'
            naturalWidth={HOME_TO_MILANO_ROUTE_IMAGE_WIDTH}
            naturalHeight={HOME_TO_MILANO_ROUTE_IMAGE_HEIGHT}
            path={HOME_TO_MILANO_TRACED_PATH}
            startLabel='Home'
            endLabel='Milano'
            className='max-w-5xl mx-auto rounded-sm'
          />
        </Reveal>
      </section>
    </div>
  );
}
