'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import JourneyMapScene from '@/components/journey/JourneyMapScene';
import { ROME_HOME_TO_TRIESTE_JOURNEY } from '@/lib/journeys/rome';

const LOGO_SRC = '/metkish-logo.png';

// Same fade-up-on-scroll rhythm used throughout the site (Tenerife,
// Barcelona, Italy pages) -- once-only, generous viewport threshold, no
// bounce. Not yet needed for a second element on this page (only the hero
// text block uses it so far), but kept as its own component rather than
// inlined so later sections can reuse it exactly, per the Tenerife
// editorial system's "reuse the exact existing values" rule.
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

export default function RomePage() {
  const [pastHero, setPastHero] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      // Same mobile/desktop threshold split as Tenerife/Barcelona, so the
      // logo shrinks at the same point in the scroll on every destination
      // page.
      const isMobile = window.innerWidth < 768;
      setPastHero(window.scrollY > (isMobile ? 32 : window.innerHeight * 0.5));
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

      {/* 1. HERO -- Hero.jpg, a portrait close-up of the Colosseum's
          tiered arched facade. Re-saved as Hero_web.jpeg via the same MPO
          fix applied sitewide (PIL.ImageOps.exif_transpose + convert to a
          plain single-frame RGB JPEG, EXIF stripped) before this page
          ever shipped, since the source file was an MPO container despite
          its .jpg extension -- same root cause as the Tenerife/Barcelona
          mobile-broken-image bug, fixed here proactively rather than
          after a report.
          Crop: the source is already portrait, so on mobile (full height
          visible, like Tenerife/Barcelona) it's left close to centered;
          on desktop (full width visible, height cropped) it's biased
          slightly above center so the Colosseum's arch tiers stay the
          focal point while more of the plain sky strip and the darker
          ground-level arcade are trimmed. Same wash + text treatment as
          Tenerife/Barcelona -- keep these three hero sections in sync. */}
      <section className='relative h-[100svh] md:h-[100dvh] w-full overflow-hidden'>
        <Image
          src='/2026-10%20-%20Italy_Rome/Hero_web.jpeg'
          alt='The Colosseum in Rome, its tiered arched facade filling the frame.'
          fill
          priority
          sizes='100vw'
          className='object-cover object-[50%_45%] md:object-[50%_40%]'
        />
        <div className='absolute inset-0 bg-black/28' />
        <div className='relative z-10 h-full flex flex-col items-center justify-center text-center px-6'>
          <Reveal>
            <h1
              className='text-5xl sm:text-6xl md:text-7xl font-[family-name:var(--font-playfair)] font-medium tracking-tight text-white'
              style={{
                textShadow: '0 2px 20px rgba(0,0,0,0.45), 0 1px 6px rgba(0,0,0,0.35)',
              }}
            >
              Rome
            </h1>
            <p
              className='mt-5 text-xs sm:text-sm uppercase tracking-[0.22em] font-[family-name:var(--font-poppins)] font-semibold text-white/80'
              style={{
                textShadow: '0 1px 10px rgba(0,0,0,0.5), 0 1px 3px rgba(0,0,0,0.4)',
              }}
            >
              Italy · October 2026
            </p>
          </Reveal>
        </div>
      </section>

      {/* 2. MAP -- Home -> Trieste Airport only, same self-running
          once-in-view animation as every other Journey map on the site.
          Sits directly against the hero's bottom edge with zero gap, same
          as Tenerife's Home->Vienna map, so there's no visible seam. */}
      <JourneyMapScene
        journey={ROME_HOME_TO_TRIESTE_JOURNEY}
        heightClassName='h-[380px] sm:h-[440px] md:h-[500px]'
      />
    </div>
  );
}
