'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import ScrollExpandMedia from '@/components/ui/scroll-expansion-hero';
import TravelGallery from '@/components/ui/travel-gallery';
import { BEHIND_THE_TRIP_TOPICS } from '@/lib/behind-the-trip';
import { InstagramIcon, PinterestIcon } from '@/components/ui/social-icons';
import { INSTAGRAM_URL, PINTEREST_URL } from '@/lib/social-links';

const BG_IMAGE_SRC = '/metkish-provansa.jpg';
const LOGO_SRC = '/metkish-logo.png';

export default function Home() {
  const [pastHero, setPastHero] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      // On mobile the icon should shrink almost immediately on scroll
      // rather than waiting for most of the viewport height, since a
      // phone's viewport height makes that threshold feel sluggish;
      // desktop keeps the original viewport-relative threshold.
      const isMobile = window.innerWidth < 768;
      setPastHero(window.scrollY > (isMobile ? 32 : window.innerHeight * 0.85));
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
        aria-label='Back to homepage'
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
          <h2 className='text-4xl sm:text-5xl font-[family-name:var(--font-playfair)] font-medium text-black dark:text-white text-center'>
            My Travels
          </h2>
          <div className='flex items-center justify-center gap-3 mt-4'>
            <span className='h-px w-10 bg-pink-300 dark:bg-pink-400/60' />
            <span className='text-pink-400 text-2xl leading-none'>♥</span>
            <span className='h-px w-10 bg-pink-300 dark:bg-pink-400/60' />
          </div>
          <p className='mt-4 mb-10 md:mb-16 text-base lowercase font-[family-name:var(--font-poppins)] font-bold tracking-normal text-black/70 dark:text-white/70 text-center'>
            places I&apos;ve been · memories I&apos;ve kept
          </p>
          <TravelGallery />
        </div>
      </ScrollExpandMedia>

      <section
        id='guides'
        className='scroll-mt-24 flex flex-col items-center px-8 py-24 bg-[#eae9e6] dark:bg-black'
      >
        <h2 className='text-4xl sm:text-5xl font-[family-name:var(--font-playfair)] font-medium text-black dark:text-white text-center'>
          Behind the Trip
        </h2>
        <p className='mt-6 mb-6 text-base lowercase font-[family-name:var(--font-poppins)] font-bold tracking-normal text-black/70 dark:text-white/70 text-center'>
          planning · decisions · real experiences
        </p>
        <p className='max-w-xl text-center text-base font-[family-name:var(--font-poppins)] text-black/80 dark:text-white/80'>
          The practical side of our travels — from planning and booking to
          the little decisions we make along the way.
        </p>

        <div className='mt-16 pt-12 border-t border-black/10 dark:border-white/10 w-full max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2'>
          {BEHIND_THE_TRIP_TOPICS.map((topic, index) => {
            const number = String(index + 1).padStart(2, '0');
            // Mobile: all four entries stack in one column, so every entry
            // after the first needs a top border to separate it from the
            // one above. Desktop: a balanced 2-column, 2-row grid instead.
            // Row 1 (index 0 and 1) sits right under the section's top
            // rule, so its inherited mobile border-t is cancelled at md
            // (md:border-t-0). Row 2 (index 2 and 3) keeps that same
            // border-t -- it now reads as the horizontal divider between
            // the two rows, so no extra desktop class is needed there. A
            // vertical divider between the two columns (md:border-l) is
            // added to the right-hand card in each row (index 1 and 3),
            // with matching side padding (md:pr-8 on the left column,
            // md:pl-8 on the right) so neither divider crowds the text.
            const isRightColumn = index % 2 === 1;
            const rowBorder = index === 0 ? '' : 'border-t';
            const cancelTopRowBorder = index < 2 ? 'md:border-t-0' : '';
            const columnBorder = isRightColumn ? 'md:border-l md:pl-8' : 'md:pr-8';

            return (
              <article
                key={topic.slug}
                className={`flex flex-col items-center text-center py-10 border-black/10 dark:border-white/10 ${rowBorder} ${cancelTopRowBorder} ${columnBorder}`}
              >
                <span className='text-xs tracking-[0.18em] uppercase font-[family-name:var(--font-poppins)] font-semibold text-black/35 dark:text-white/35'>
                  {number}
                </span>
                <h3 className='mt-3 text-2xl md:text-3xl font-[family-name:var(--font-playfair)] font-medium text-black dark:text-white'>
                  {topic.heading}
                </h3>
                <p className='mt-2 text-sm italic font-[family-name:var(--font-poppins)] font-medium text-black/60 dark:text-white/60'>
                  {topic.kicker}
                </p>
                <p className='mt-4 max-w-xs text-base font-[family-name:var(--font-poppins)] text-black/80 dark:text-white/80'>
                  {topic.body}
                </p>
                <Link
                  href={`/behind-the-trip/${topic.slug}`}
                  className='mt-auto pt-6 inline-flex items-center min-h-11 py-2 text-sm font-[family-name:var(--font-poppins)] font-medium text-black dark:text-white hover:underline underline-offset-4'
                >
                  Read →
                </Link>
              </article>
            );
          })}
        </div>
      </section>

      <section
        id='about'
        className='scroll-mt-24 flex flex-col items-center px-8 py-24 bg-[#f3f2ef] dark:bg-black'
      >
        <h2 className='text-4xl sm:text-5xl font-[family-name:var(--font-playfair)] font-medium text-black dark:text-white text-center'>
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

      <footer className='flex flex-col items-center px-8 py-10 md:py-12 bg-[#2a2a2a] text-white text-center'>
        {/* Logo, tagline and nav read as one tight unit — no gap between
            them (each row carries its own margin, never the parent, and
            none of them gets padding/min-height that would look like
            extra space). A clearly larger, separate gap then sets off the
            email address, the social icons, and the copyright line. */}
        <Image
          src={LOGO_SRC}
          alt='Metkish logo'
          width={240}
          height={240}
          className='w-[92px] md:w-[120px] h-auto -mt-8 md:-mt-9'
        />
        <p className='text-sm italic lowercase font-[family-name:var(--font-poppins)] font-medium text-white/70'>
          travel · memories · places worth remembering
        </p>
        <nav className='flex items-center gap-2 sm:gap-6'>
          <a
            href='#travels'
            className='inline-flex items-center px-2 text-sm font-[family-name:var(--font-poppins)] uppercase tracking-wide text-white/80 hover:text-white'
          >
            Travels
          </a>
          <a
            href='#guides'
            className='inline-flex items-center px-2 text-sm font-[family-name:var(--font-poppins)] uppercase tracking-wide text-white/80 hover:text-white'
          >
            Behind the Trip
          </a>
          <a
            href='/about'
            className='inline-flex items-center px-2 text-sm font-[family-name:var(--font-poppins)] uppercase tracking-wide text-white/80 hover:text-white'
          >
            About
          </a>
        </nav>
        <a
          href='mailto:info@metkish.com'
          className='inline-flex items-center px-2 text-sm font-[family-name:var(--font-poppins)] text-white/90 hover:text-white underline underline-offset-4'
        >
          info@metkish.com ↗
        </a>
        <div className='mt-3 flex items-center gap-5'>
          <a
            href={INSTAGRAM_URL}
            target='_blank'
            rel='noopener noreferrer'
            aria-label='Instagram'
            className='text-white/70 hover:text-white transition-colors'
          >
            <InstagramIcon className='h-5 w-5' />
          </a>
          <a
            href={PINTEREST_URL}
            target='_blank'
            rel='noopener noreferrer'
            aria-label='Pinterest'
            className='text-white/70 hover:text-white transition-colors'
          >
            <PinterestIcon className='h-5 w-5' />
          </a>
        </div>
        <p className='mt-8 md:mt-9 text-xs font-[family-name:var(--font-poppins)] text-white/40'>
          © {new Date().getFullYear()} Metkish
        </p>
      </footer>
    </div>
  );
}
