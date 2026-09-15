'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import JourneyMapScene from '@/components/journey/JourneyMapScene';
import { RouteLabel } from '@/components/journey/annotation-kit';
import { ITALY_HOME_TO_MILANO_JOURNEY } from '@/lib/journeys/italy';

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

      {/* 1. OPENING — title and map now read as one opening composition:
          ROAD TRIP up top, the Home -> Milano map directly beneath it, so
          the page opens with the drive itself (the word, then the actual
          journey) rather than a large empty title screen followed by a
          separate map section further down. Shorter than the old
          full-viewport hero — still a generous, editorial top gap (this
          is the page's very first beat, under the fixed logo), but the
          emptiness now stops at the title's own edges instead of
          stretching for a full screen. */}
      <section className='pt-28 sm:pt-36 md:pt-44 lg:pt-52 pb-16 sm:pb-20 md:pb-24 px-6 text-center'>
        <Reveal>
          <h1 className='text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-[family-name:var(--font-playfair)] font-medium uppercase tracking-wide sm:tracking-[0.04em] text-black dark:text-white'>
            Road Trip
          </h1>
        </Reveal>
      </section>

      {/* 2. MAP — Home -> Milano, the same JourneyMapScene engine every
          other map on the site uses (real lng/lat route, self-running
          reveal-on-scroll, pink route line, "Home"/"Milano" dot labels) —
          not a bespoke map for Italy. See lib/journeys/italy.ts for the
          route data and why it's built the way it is. Edge to edge, no
          side padding or rounded corners, exactly like every Journey Map
          section on the Tenerife page. Now sits directly under the ROAD
          TRIP title as part of the same opening beat, with the car
          animating from Home toward Milano as it scrolls into view. */}
      <JourneyMapScene
        journey={ITALY_HOME_TO_MILANO_JOURNEY}
        heightClassName='h-[380px] sm:h-[440px] md:h-[500px]'
      />

      {/* 3. FIRST CHAPTER — "First stop? Milano!" now lands right after
          the journey itself, closing the ROAD TRIP -> map -> chapter
          opening arc. This is a direct reuse of Tenerife's own map->chapter
          pattern (see app/tenerife/page.tsx, "3. VIENNA CONTENT": the
          "Slovenia → Vienna" / "Why Vienna?" section) — same section
          classes (px-6 md:px-12, MAP_TRANSITION_PT's pt-8 md:pt-10,
          pb-16 md:pb-24), same max-w-2xl mx-auto text-center wrapper, a
          bare RouteLabel (the shared component from
          components/journey/annotation-kit, not a local copy — same pink
          tick, letter-spacing, font, size and weight Tenerife's chapter
          openers use) in its own Reveal, then ChapterHeading in a second
          Reveal at mt-8 md:mt-10, exactly like "Why Vienna?". No paragraph
          underneath yet, per this step's scope. */}
      <section className='px-6 md:px-12 pt-8 md:pt-10 pb-16 md:pb-24 bg-[#faf9f6] dark:bg-black'>
        <div className='max-w-2xl mx-auto text-center'>
          <Reveal>
            <RouteLabel>Slovenia → Milano</RouteLabel>
          </Reveal>

          <Reveal className='mt-8 md:mt-10 max-w-xl mx-auto'>
            <ChapterHeading italic>First stop? Milano!</ChapterHeading>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
