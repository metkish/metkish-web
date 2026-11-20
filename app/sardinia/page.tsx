'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import JourneyMapScene from '@/components/journey/JourneyMapScene';
import { SARDINIA_ROUTE_CACHE } from '@/components/journey/generated/route-cache-sardinia';
import { RouteLabel, TimeStamp } from '@/components/journey/annotation-kit';
import { ChapterHeading, Paragraphs } from '@/components/ui/typography';
import BookedChecklist from '@/components/ui/booked-checklist';
import { InstagramIcon, PinterestIcon } from '@/components/ui/social-icons';
import { INSTAGRAM_URL, PINTEREST_URL } from '@/lib/social-links';
import {
  SARDINIA_CASAGLIANA_TO_CALA_GONONE_JOURNEY,
  SARDINIA_CASAGLIANA_TO_LA_CINTA_JOURNEY,
  SARDINIA_CASAGLIANA_TO_LISCIA_RUJA_JOURNEY,
  SARDINIA_CASAGLIANA_TO_MOYS_JOURNEY,
  SARDINIA_CASAGLIANA_TO_PALAU_JOURNEY,
  SARDINIA_CASAGLIANA_TO_PORTO_CERVO_JOURNEY,
  SARDINIA_CASAGLIANA_TO_PORTO_ISTANA_JOURNEY,
  SARDINIA_CASAGLIANA_TO_PRINCIPE_JOURNEY,
  SARDINIA_HOME_TO_VIENNA_JOURNEY,
  SARDINIA_VIENNA_TO_OLBIA_JOURNEY,
} from '@/lib/journeys/sardinia';

// SARDINIA — hero + the first real chapter of the personal travel story
// (why we went, getting there, renting the car, costs so far). No
// accommodation, beaches or other itinerary stops yet -- those are added
// later, directly onto this file, above the "Costs so far" section (or
// wherever the next real chapter belongs chronologically) -- per explicit
// scope for this pass.

const LOGO_SRC = '/metkish-logo.png';

// Same fade-up-on-scroll rhythm used throughout the site (Tenerife,
// Barcelona, Rome, Iceland): once-only, generous viewport threshold, no
// bounce. Copied here verbatim rather than imported, same as every other
// destination page's own local copy.
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

// Same "My tip" treatment used throughout the site (Rome/Barcelona's own
// InlineTip, Iceland's own copy) -- copied here verbatim rather than
// imported, same as every other page's local copy: a thin pink left
// rule, left-aligned italic text, no label, no background.
// Same small uppercase in-chapter sub-beat marker used on Tenerife's page
// (its own local Eyebrow component) -- copied here verbatim rather than
// imported, same as every other small shared pattern on this page
// (Reveal, InlineTip). Used for the La Maddalena excursion's individual
// stops (Cala Santa Maria, Spiaggia Rosa, etc.), which are sub-beats
// within one chapter rather than chapters of their own.
function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <span className='block text-sm md:text-[0.95rem] uppercase tracking-[0.18em] font-[family-name:var(--font-poppins)] font-semibold text-black/60 dark:text-white/60'>
      {children}
    </span>
  );
}

function InlineTip({ children }: { children: ReactNode }) {
  return (
    <p className='border-l-2 border-pink-300 dark:border-pink-400/60 pl-4 text-left text-base italic font-[family-name:var(--font-poppins)] font-light text-black/75 dark:text-white/75 leading-relaxed'>
      {children}
    </p>
  );
}

// LEVEL 4 -- the one fact treatment used throughout the site (Tenerife,
// Barcelona, Rome): a small uppercase label, a large serif value at the
// same scale as every chapter's moment timestamps, optional small
// supporting lines underneath. Copied here verbatim rather than imported,
// same as every other page's local copy.
function Fact({
  label,
  value,
  support,
}: {
  label: string;
  value: string;
  support?: string[];
}) {
  return (
    <div className='flex flex-col items-center gap-2 text-center'>
      <span className='text-xs uppercase tracking-[0.18em] font-[family-name:var(--font-poppins)] font-semibold text-black/45 dark:text-white/45'>
        {label}
      </span>
      <TimeStamp size='md'>{value}</TimeStamp>
      {support?.map((line, i) => (
        <span
          key={i}
          className='text-sm font-[family-name:var(--font-poppins)] text-black/60 dark:text-white/60'
        >
          {line}
        </span>
      ))}
    </div>
  );
}

// Same three spacing tokens used sitewide (see app/tenerife/page.tsx's
// own comments for the full rationale) -- copied here verbatim rather
// than imported, same as every other page's local copy.
// A. Journey map -> content: the map itself is the visual break.
const MAP_TRANSITION_PT = 'pt-8 md:pt-10';
// C. Chapter-to-chapter (text -> new chapter): full rhythm, top/bottom
// halves used on either side of the boundary.
const CHAPTER_GAP_END = 'pb-12 md:pb-14';
const CHAPTER_GAP_START = 'pt-12 md:pt-14';

export default function SardiniaPage() {
  const [pastHero, setPastHero] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      // On mobile the icon should shrink almost immediately on scroll
      // rather than waiting for half the viewport height, since a
      // phone's viewport height makes that threshold feel sluggish;
      // desktop keeps the original viewport-relative threshold. Same
      // logic as every other destination page.
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

      {/* 1. HERO -- Hero.jpeg, a landscape photo of Cala Mariolu taken
          from the water during the Gulf of Orosei boat trip: turquoise
          sea in the foreground, the pebble beach behind it, and the tall
          limestone cliffs filling the rest of the frame. This is the same
          source photo used as the lead image in the Gulf of Orosei
          section further down the page; Hero_web.jpeg was re-saved at a
          larger 3840px-wide master (up from the 2400px-wide version used
          in-article) so the full-bleed 100vw hero has enough resolution
          on wide desktop screens, following the same "re-save the hero
          master at the site's largest requested width" convention used
          for Rome's hero.
          Crop: the source is landscape (4:3), so on mobile (box far
          taller/narrower than the photo) the full width shows and only
          the vertical position barely matters -- left centered. On
          desktop (box far wider than the photo) the full width shows and
          the top/bottom get cropped, so the vertical position is biased
          down slightly from center to keep the beach and turquoise water
          in frame together with the cliffs above them, rather than
          showing cliff face alone. */}
      <section className='relative h-[100svh] md:h-[100dvh] w-full overflow-hidden'>
        <Image
          src='/2025-07%20-%20Sardinia/Hero_web.jpeg'
          alt='Turquoise water, a pebble beach and tall limestone cliffs at Cala Mariolu, in the Gulf of Orosei, Sardinia, seen from the sea.'
          fill
          priority
          sizes='100vw'
          quality={65}
          className='object-cover object-center md:object-[50%_62%]'
        />

        {/* Subtle uniform 10% black overlay, per explicit instruction --
            a light legibility aid without visibly darkening the photo's
            natural colour, brightness or crop. Replaces the earlier
            "no overlay at all" approach on this hero. */}
        <div className='absolute inset-0 bg-black/10' />
        {/* Soft, localised dark gradient behind the hero text only. It
            fades to fully transparent well before its own edges, so it
            never reads as a visible box or hard edge at any screen size,
            and it does not darken the rest of the photograph. Paired with
            the tighter text-shadow below for reliable readability over
            the brightest parts of the image (e.g. Sardinia's pale
            limestone cliffs). */}
        <div
          className='absolute inset-0 flex items-center justify-center pointer-events-none'
          aria-hidden='true'
        >
          <div
            className='w-[92%] max-w-xl h-[46%] sm:h-[42%] md:h-[38%]'
            style={{
              background:
                'radial-gradient(ellipse 58% 60% at 50% 50%, rgba(0,0,0,0.38) 0%, rgba(0,0,0,0.2) 40%, rgba(0,0,0,0) 72%)',
            }}
          />
        </div>
        <div className='relative z-10 h-full flex flex-col items-center justify-center text-center px-6'>
          <Reveal>
            <h1
              className='text-5xl sm:text-6xl md:text-7xl font-[family-name:var(--font-playfair)] font-medium tracking-tight text-white'
              style={{
                textShadow: '0 1px 3px rgba(0,0,0,0.75), 0 2px 10px rgba(0,0,0,0.5), 0 4px 24px rgba(0,0,0,0.35)',
              }}
            >
              Sardinia
            </h1>
            <p
              className='mt-5 text-xs sm:text-sm uppercase tracking-[0.22em] font-[family-name:var(--font-poppins)] font-semibold text-white/80'
              style={{
                textShadow: '0 1px 2px rgba(0,0,0,0.8), 0 1px 6px rgba(0,0,0,0.55), 0 2px 14px rgba(0,0,0,0.4)',
              }}
            >
              Italy · June–July 2025
            </p>
          </Reveal>
        </div>
      </section>

      {/* 2. WHY SARDINIA? -- the opening chapter, directly below the hero
          (no map above it, so this is the one chapter on this page that
          doesn't open with a route-segment RouteLabel -- "Sardinia" is
          used instead, same small pink-line + eyebrow treatment, just a
          destination tag rather than a route). Hero -> chapter isn't one
          of the three transition types this site already has a named
          token for (map->content, photo->chapter, text->chapter) -- the
          hero reads like the "photo" side of a photo->chapter transition
          (a full-bleed image ending), so this reuses that transition's
          CHAPTER_GAP_START alone on top (the hero itself has no bottom
          padding to pair a CHAPTER_GAP_END against). */}
      <section className={`px-6 md:px-12 ${CHAPTER_GAP_START} pb-16 md:pb-20 bg-[#faf9f6] dark:bg-black`}>
        <div className='max-w-2xl mx-auto text-center'>
          <Reveal>
            <RouteLabel>Sardinia</RouteLabel>
            <ChapterHeading as='h2' italic className='mt-8 md:mt-10'>
              Why Sardinia?
            </ChapterHeading>
            <Paragraphs
              className='mt-5 text-center'
              items={[
                'For quite some time, my husband had been showing me photos of Sardinia on Instagram. The beaches and crystal-clear water looked almost too good to be true, so we decided to see for ourselves.',
                'Were they really as beautiful as they looked?',
              ]}
            />
          </Reveal>

          {/* General pricing note -- added once, near the start of the
              article, per explicit instruction, so individual price
              boxes further down no longer need to repeat it. */}
          <Reveal className='mt-6 md:mt-7 max-w-xl mx-auto'>
            <p className='text-sm italic text-center font-[family-name:var(--font-poppins)] text-black/55 dark:text-white/55'>
              All prices mentioned are what we paid during our trip in
              June–July 2025 and may have changed since.
            </p>
          </Reveal>
        </div>
      </section>

      {/* 3. MAP -- Home -> Vienna Airport, the drive. Same self-running
          animation/system and the same sizing as every other destination's
          own Home->Vienna map (same geography, same camera framing). */}
      <JourneyMapScene
        routeCache={SARDINIA_ROUTE_CACHE}
        journey={SARDINIA_HOME_TO_VIENNA_JOURNEY}
        heightClassName='h-[380px] sm:h-[440px] md:h-[500px]'
      />

      {/* 4. GETTING TO SARDINIA -- the family trip dates, the drive to
          Vienna, and the Car Park 3 booking. Same layout/typography as
          every other "why we went this way" chapter (Tenerife's "Why
          Vienna?", Barcelona's own copy of it): a real Level 2 heading,
          the parking price given real Level 4 fact weight. Bottom padding
          is the plain pb-16/20 used between a content section and the
          NEXT map (not a new chapter opener) -- same as every other
          "Vienna content" section on the site. */}
      <section className={`px-6 md:px-12 ${MAP_TRANSITION_PT} pb-16 md:pb-20 bg-[#faf9f6] dark:bg-black`}>
        <div className='max-w-2xl mx-auto text-center'>
          <Reveal>
            <RouteLabel>Home → Vienna</RouteLabel>
            <ChapterHeading as='h2' italic className='mt-8 md:mt-10'>
              Getting to Sardinia
            </ChapterHeading>
            <Paragraphs
              className='mt-5 text-center'
              items={[
                'We travelled as a family of four from June 30 to July 9, 2025.',
                'We drove from home to Vienna Airport and took a direct Ryanair flight to Olbia, operated by Lauda Europe, part of the Ryanair Group.',
              ]}
            />
          </Reveal>

          {/* Same quiet practical-information panel language used
              sitewide for a single parking fact -- same max-w-[380px]/
              px-7/py-7 tier and single Fact component as Tenerife's own
              Car Park 3 box, matched to it exactly per explicit request.
              Support line now shows the parking duration (we don't have
              exact drop-off/pick-up clock times the way Tenerife's own
              box does, so a date range is the honest equivalent); the
              booking-platform detail moved to the short paragraph below,
              so it isn't repeated in both the box and the prose. */}
          <Reveal className='mt-9 md:mt-11 mx-auto max-w-[380px] rounded-[3px] bg-[#f1ebdc] dark:bg-white/[0.04] px-7 py-7 md:px-8 md:py-8'>
            <Fact
              label='Vienna Airport · Car Park 3'
              value='€183.60'
              support={['30 Jun → 9 Jul 2025']}
            />
          </Reveal>

          <Reveal className='mt-6 md:mt-7 max-w-xl mx-auto'>
            <Paragraphs
              className='text-center'
              items={[
                "We always choose Car Park 3 — it's right at the terminal with direct elevator access, no shuttle needed. We book in advance through ParkVia.",
              ]}
            />
          </Reveal>
        </div>
      </section>

      {/* 5. MAP -- Vienna Airport -> Olbia Airport, the flight. Same
          self-running plane animation as every other destination's own
          flight map. See lib/journeys/sardinia.ts for this leg's own
          note on its camera framing not yet being live-tuned on both
          breakpoints. */}
      <JourneyMapScene
        routeCache={SARDINIA_ROUTE_CACHE}
        journey={SARDINIA_VIENNA_TO_OLBIA_JOURNEY}
        heightClassName='h-[420px] sm:h-[480px] md:h-[580px]'
      />

      {/* 6. THE FLIGHT -- the Ryanair/Lauda Europe flight facts, same
          quiet single-card composition as every other destination's own
          flight section (Tenerife's Group A, Barcelona's own copy of it).
          Photo 1 (the boarding screen) sits directly below the fact card,
          same section-level photo pattern as Tenerife's own Ryanair wing
          photograph / the shared FlightSection component's own photo.
          Bottom padding is the full text->chapter CHAPTER_GAP_END, since
          "Renting a Car in Sardinia" opens a brand new chapter next. */}
      <section className={`px-6 md:px-12 ${MAP_TRANSITION_PT} ${CHAPTER_GAP_END} bg-[#faf9f6] dark:bg-black`}>
        <div className='max-w-2xl mx-auto text-center'>
          <Reveal>
            <RouteLabel>The Flight</RouteLabel>
            <ChapterHeading as='h2' italic className='mt-5'>
              Vienna to Olbia
            </ChapterHeading>
          </Reveal>

          <Reveal className='mt-8 md:mt-10 mx-auto max-w-[520px] rounded-[3px] bg-[#f1ebdc] dark:bg-white/[0.04] px-8 py-9 md:px-10 md:py-10 flex flex-col items-center gap-1 text-center'>
            <span className='text-xs uppercase tracking-[0.18em] font-[family-name:var(--font-poppins)] font-semibold text-black/45 dark:text-white/45'>
              Lauda Europe · Ryanair Group · direct
            </span>
            <span className='mt-3 text-sm font-[family-name:var(--font-poppins)] text-black/60 dark:text-white/60'>
              30 Jun → 9 Jul 2025
            </span>
            <span className='mt-4 text-xs uppercase tracking-[0.18em] font-[family-name:var(--font-poppins)] font-semibold text-black/45 dark:text-white/45'>
              Return flights for four
            </span>
            <TimeStamp size='md'>€1,138.60</TimeStamp>
            <span className='mt-4 text-xs uppercase tracking-[0.18em] font-[family-name:var(--font-poppins)] font-semibold text-black/45 dark:text-white/45'>
              Checked luggage
            </span>
            <span className='text-sm font-[family-name:var(--font-poppins)] text-black/60 dark:text-white/60'>
              Two 20 kg bags and two 10 kg bags
            </span>
          </Reveal>

          <Reveal className='mt-6 md:mt-7 max-w-xl mx-auto'>
            <Paragraphs
              className='text-center'
              items={[
                'We flew out at 16:20, landing in Olbia at 18:15, and returned nine days later departing at 15:10.',
              ]}
            />
          </Reveal>
        </div>

        {/* PHOTO 1 -- the Ryanair boarding screen, flight FR6538 to Olbia.
            Section-level sibling of the max-w-2xl column above (not
            nested inside it), same structural pattern as every other
            single supporting photo on the site. Displayed ~25-30%
            narrower than the standard section-level photo width, per
            explicit request -- max-w-3xl/md:max-w-xl instead of the
            usual max-w-5xl/md:max-w-3xl (a flat 25% reduction at both
            breakpoints), aspect ratio and mx-auto centering unchanged. */}
        <Reveal className='mt-14 md:mt-16 max-w-3xl md:max-w-xl mx-auto'>
          <div className='relative w-full overflow-hidden rounded-[2px] aspect-[4/3] md:aspect-[16/9]'>
            <Image
              src='/2025-07%20-%20Sardinia/Sardinia_boarding_web.jpeg'
              alt='A Ryanair departure screen at Vienna Airport showing flight FR6538 to Olbia, boarding.'
              fill
              sizes='(min-width: 1024px) 1024px, 100vw'
              className='object-cover'
            />
          </div>
          <p className='mt-3 text-center text-sm italic font-[family-name:var(--font-poppins)] text-black/55 dark:text-white/55'>
            Our boarding call for flight FR6538 to Olbia.
          </p>
        </Reveal>
      </section>

      {/* 7. RENTING A CAR IN SARDINIA -- a brand new chapter (text ->
          chapter transition, full CHAPTER_GAP_START on top). Photo 2 (the
          Fiat 600) sits just below the story, same photo pattern as
          Photo 1 above. */}
      <section className={`px-6 md:px-12 ${CHAPTER_GAP_START} ${CHAPTER_GAP_END} bg-[#faf9f6] dark:bg-black`}>
        <div className='max-w-2xl mx-auto text-center'>
          <Reveal>
            <RouteLabel>Olbia Airport</RouteLabel>
            <ChapterHeading as='h2' italic className='mt-8 md:mt-10'>
              Renting a Car in Sardinia
            </ChapterHeading>
            <Paragraphs
              className='mt-5 text-center'
              items={[
                <>
                  We booked our rental car through{' '}
                  <a
                    href='https://www.billiger-mietwagen.de/'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-pink-500 dark:text-pink-300 no-underline decoration-pink-500/50 dark:decoration-pink-300/50 underline-offset-4 hover:underline transition-colors'
                  >
                    billiger-mietwagen.de ↗
                  </a>
                  , with Sunny Cars handling the booking. We picked up the
                  car at Olbia Airport shortly after landing. We had
                  booked a VW Polo or similar, but received a Fiat 600
                  that was only three months old.
                </>,
                "Our luggage didn't fit in the boot, so we had to place one suitcase on the back seat between the children. It wasn't exactly the most comfortable start to our road trip!",
              ]}
            />
          </Reveal>
        </div>

        {/* PHOTO 2 -- the black Fiat 600 at Olbia Airport. Same
            section-level photo pattern as Photo 1 above. */}
        <Reveal className='mt-10 md:mt-12 max-w-5xl md:max-w-3xl mx-auto'>
          <div className='relative w-full overflow-hidden rounded-[2px] aspect-[4/3] md:aspect-[16/9]'>
            <Image
              src='/2025-07%20-%20Sardinia/Sardinija_fiat600_web.jpeg'
              alt='A black Fiat 600 rental car with its boot open in a parking area at Olbia Airport, in front of the Europcar desk.'
              fill
              sizes='(min-width: 1024px) 1024px, 100vw'
              className='object-cover object-[50%_60%]'
            />
          </div>
          <p className='mt-3 text-center text-sm italic font-[family-name:var(--font-poppins)] text-black/55 dark:text-white/55'>
            The Fiat 600 we received with our rental booking.
          </p>
        </Reveal>

        <div className='max-w-2xl mx-auto text-center'>
          <Reveal className='mt-10 md:mt-12 mx-auto max-w-[460px] rounded-[3px] bg-[#f1ebdc] dark:bg-white/[0.04] px-8 py-8 md:px-9 md:py-9 flex flex-col items-center gap-1 text-center'>
            <span className='text-xs uppercase tracking-[0.18em] font-[family-name:var(--font-poppins)] font-semibold text-black/45 dark:text-white/45'>
              Europcar · Fiat 600
            </span>
            <TimeStamp size='md'>€971.00</TimeStamp>
            <span className='mt-4 text-sm font-[family-name:var(--font-poppins)] text-black/60 dark:text-white/60'>
              30 Jun → 9 Jul 2025
            </span>
            <span className='mt-4 text-xs uppercase tracking-[0.18em] font-[family-name:var(--font-poppins)] font-semibold text-black/45 dark:text-white/45'>
              Insurance package · Unlimited mileage
            </span>
            <span className='text-sm font-[family-name:var(--font-poppins)] text-black/60 dark:text-white/60'>
              Picked up at Olbia Airport
            </span>
          </Reveal>

          <Reveal className='mt-8 md:mt-9 max-w-xl mx-auto'>
            <InlineTip>
              My tip: When renting a car for a family holiday, check the
              luggage capacity carefully. Four seats don&apos;t
              necessarily mean enough space for four people&apos;s
              suitcases.
            </InlineTip>
          </Reveal>
        </div>
      </section>

      {/* PARKING IN SARDINIA -- a short standalone practical-info
          section inserted immediately after Renting a Car, per explicit
          instruction. Full chapter-to-chapter rhythm (CHAPTER_GAP_START
          pairs with the Renting a Car section's own CHAPTER_GAP_END
          above; this section's own CHAPTER_GAP_END pairs with the Where
          We Stayed chapter's CHAPTER_GAP_START below). General parking
          guidance only -- per explicit instruction, individual per-
          location parking prices/cost boxes were removed from the beach
          and destination sections elsewhere on this page so this advice
          isn't repeated. */}
      <section className={`px-6 md:px-12 ${CHAPTER_GAP_START} ${CHAPTER_GAP_END} bg-[#faf9f6] dark:bg-black`}>
        <div className='max-w-2xl mx-auto text-center'>
          <Reveal>
            <RouteLabel>Sardinia</RouteLabel>
            <ChapterHeading as='h2' italic className='mt-8 md:mt-10'>
              Parking in Sardinia
            </ChapterHeading>
            <Paragraphs
              className='mt-5 text-center'
              items={[
                'Parking at the beaches we visited was paid, usually costing between €1.50 and €2 per hour.',
                "For parking in towns and near harbours, I recommend having the EasyPark app installed. It makes paying for parking much more convenient, especially when you're exploring different places by car.",
              ]}
            />
          </Reveal>
        </div>
      </section>

      {/* 8. WHERE WE STAYED IN SARDINIA -- a brand new chapter (text ->
          chapter transition, full CHAPTER_GAP_START on top, paired with
          the Renting a Car section's own CHAPTER_GAP_END above). Same
          layout as Tenerife's own "THE HOTEL" chapter: intro paragraphs,
          one cream practical-info panel combining the property, price,
          dates, room type/guests and breakfast (the panel's dominant
          TimeStamp value IS this page's "yellow cost box" for
          accommodation, same as every other price on the site), then the
          resort video. No extra invented beat (no second "impression"
          heading) beyond what was actually given, per explicit scope. */}
      <section className={`px-6 md:px-12 ${CHAPTER_GAP_START} ${CHAPTER_GAP_END} bg-[#faf9f6] dark:bg-black`}>
        <div className='max-w-2xl mx-auto text-center'>
          <Reveal>
            <RouteLabel>Accommodation</RouteLabel>
            <ChapterHeading as='h2' italic className='mt-8 md:mt-10'>
              Where We Stayed in Sardinia
            </ChapterHeading>
            <Paragraphs
              className='mt-5 text-center'
              items={[
                "Finding good accommodation in Sardinia wasn't easy. We chose Casagliana Suite Resort near Olbia as a base for exploring the island.",
                'The one-bedroom apartment was clean but too small for four people, with poor soundproofing. We loved the pool and friendly staff, although breakfast service could be slow. Overall, a good choice, but expensive for what we got.',
              ]}
            />
          </Reveal>

          {/* Accommodation details + price -- same quiet practical-info
              panel language as every other price on the site (Tenerife's
              Hotel panel is the direct template): one dominant TimeStamp
              value, everything else a supporting label/line. Covers
              every field from the brief -- property, location, dates,
              duration, room type, guests and breakfast. */}
          <Reveal className='mt-9 md:mt-11 mx-auto max-w-[460px] rounded-[3px] bg-[#f1ebdc] dark:bg-white/[0.04] px-8 py-8 md:px-9 md:py-9 flex flex-col items-center gap-1 text-center'>
            <span className='text-xs uppercase tracking-[0.18em] font-[family-name:var(--font-poppins)] font-semibold text-black/45 dark:text-white/45'>
              Casagliana Suite Resort · 9 Nights
            </span>
            <TimeStamp size='md'>€4,074.39</TimeStamp>
            <span className='mt-4 text-sm font-[family-name:var(--font-poppins)] text-black/60 dark:text-white/60'>
              30 Jun → 9 Jul 2025
            </span>
            <span className='mt-4 text-xs uppercase tracking-[0.18em] font-[family-name:var(--font-poppins)] font-semibold text-black/45 dark:text-white/45'>
              One-Bedroom Apartment · 2 Adults + 2 Children
            </span>
            <span className='text-sm font-[family-name:var(--font-poppins)] text-black/60 dark:text-white/60'>
              Breakfast included
            </span>
          </Reveal>
        </div>

        {/* THE RESORT VIDEO -- the pool and surrounding landscape at
            Casagliana Suite Resort. Native controls (not the silent
            autoplay-loop "moving photograph" treatment used elsewhere on
            the site), per explicit requirement: no autoplay, no sound
            until the viewer presses play. Same wrapper/aspect pattern as
            Iceland's own native-controls video (the Hallgrímskirkja
            tower-view clip) -- 16:9, max-w-3xl, rounded-[2px]. Re-encoded
            from the original .MOV (kept untouched) to H.264/AAC MP4 at
            1280x720, same crf 26 preset used for every other re-encoded
            video on the site, which brought it from 25.6MB down to
            5.7MB with no visible quality loss. Poster frame grabbed at
            00:03, the first clear, well-lit view of the pool. */}
        <Reveal delay={0.1} className='mt-14 md:mt-16 max-w-3xl mx-auto'>
          <div className='relative w-full overflow-hidden rounded-[2px] aspect-[16/9]'>
            <video
              src='/2025-07%20-%20Sardinia/Sardinia_Casagliana%20Suite%20Resort_web.mp4'
              controls
              playsInline
              preload='metadata'
              poster='/2025-07%20-%20Sardinia/Sardinia_Casagliana%20Suite%20Resort_poster.jpg'
              aria-label='The swimming pool and surrounding landscape at Casagliana Suite Resort, near Olbia, Sardinia.'
              className='absolute inset-0 h-full w-full object-cover'
            />
          </div>
          <p className='mt-3 text-center text-sm italic font-[family-name:var(--font-poppins)] text-black/55 dark:text-white/55'>
            The pool and surrounding landscape at Casagliana Suite Resort.
          </p>
        </Reveal>
      </section>

      {/* 9. OUR FIRST EVENING IN SARDINIA -- a new chapter (text ->
          chapter transition, CHAPTER_GAP_START on top, pairing with the
          accommodation section's own CHAPTER_GAP_END above). The beach
          chapter now follows this one, so this closes with the plain
          chapter-to-chapter CHAPTER_GAP_END rather than a page's final-
          section padding. The dinner photo is deliberately NOT the usual
          wide section-level photo (max-w-5xl/3xl) used elsewhere on this
          page -- per explicit scope it's small (300-380px), centred in
          the text column, at its own real aspect ratio (1800x2400, 3:4)
          via width/height + w-full h-auto, same pattern as Iceland's own
          small Hallgrímskirkja-at-night photo, rather than the aspect-
          ratio-box/object-cover treatment used for every full-width
          photo on the site. */}
      <section className={`px-6 md:px-12 ${CHAPTER_GAP_START} ${CHAPTER_GAP_END} bg-[#faf9f6] dark:bg-black`}>
        <div className='max-w-2xl mx-auto text-center'>
          <Reveal>
            <RouteLabel>Agrisole</RouteLabel>
            <ChapterHeading as='h2' italic className='mt-8 md:mt-10'>
              Our First Evening in Sardinia
            </ChapterHeading>
            <Paragraphs
              className='mt-5 text-center'
              items={[
                'After a long travel day, we were exhausted. Our resort arranged dinner at nearby Agrisole, a traditional Sardinian agriturismo.',
                "We didn't expect a multi-course meal with no menu to choose from! The food was good, but we were far too tired for such a long dinner. I think we were the last to arrive and the first to leave!",
              ]}
            />
          </Reveal>

          {/* The dinner photo -- small and centred, per explicit scope
              (not this page's usual wide section-level photo). Real
              width/height (1800x2400, the processed file's actual
              dimensions) preserve its true 3:4 aspect ratio exactly;
              w-full h-auto lets it scale down responsively inside the
              max-w wrapper without ever enlarging past it. */}
          <Reveal className='mt-10 md:mt-12 w-full max-w-[300px] sm:max-w-[340px] md:max-w-[380px] mx-auto'>
            <Image
              src='/2025-07%20-%20Sardinia/Traditional%20roast_web.jpeg'
              alt='A plate of traditional roast meat and potatoes, part of the fixed-menu dinner at Agrisole agriturismo.'
              width={1800}
              height={2400}
              sizes='(min-width: 768px) 380px, 300px'
              className='w-full h-auto rounded-[2px]'
            />
            <p className='mt-3 text-center text-sm italic font-[family-name:var(--font-poppins)] text-black/55 dark:text-white/55'>
              Traditional Sardinian dinner at Agrisole.
            </p>
          </Reveal>

        </div>
      </section>

      {/* 10. MAP -- Casagliana Suite Resort -> Spiaggia del Principe, the
          first beach visit (1 July 2025). Real OSRM-derived driving
          route -- see lib/journeys/sardinia.ts for the full route-
          geometry disclosure (real corridor, manoeuvres kept, endpoint
          = the real car-accessible parking area, not an estimated
          beach-centre point). Same local car-map sizing as the Home ->
          Vienna map above. */}
      <JourneyMapScene
        routeCache={SARDINIA_ROUTE_CACHE}
        journey={SARDINIA_CASAGLIANA_TO_PRINCIPE_JOURNEY}
        heightClassName='h-[380px] sm:h-[440px] md:h-[500px]'
      />

      {/* 11. SPIAGGIA DEL PRINCIPE -- the first beach. Map -> content
          transition (MAP_TRANSITION_PT on top). The La Maddalena boat-
          excursion chapter now follows this one (a new day, 2 July
          2025), so this closes with the plain pb-16/20 used between a
          content section and the NEXT map -- same token/reasoning as
          "Getting to Sardinia" above -- rather than a page's final-
          section padding.
          UPDATE: the individual parking-price Fact panel and its price-
          caveat note (previously shown right after the paragraphs
          below) were removed per explicit instruction, since parking
          cost now lives only in the general "Parking in Sardinia"
          section after Renting a Car. The paragraphs now flow straight
          into the photo pair below (mt-10/12), same gap already used
          sitewide between paragraphs and the next photo. */}
      <section className={`px-6 md:px-12 ${MAP_TRANSITION_PT} pb-16 md:pb-20 bg-[#faf9f6] dark:bg-black`}>
        <div className='max-w-2xl mx-auto text-center'>
          <Reveal>
            <RouteLabel>Beach</RouteLabel>
            <ChapterHeading as='h2' italic className='mt-8 md:mt-10'>
              Spiaggia del Principe
            </ChapterHeading>
            <Paragraphs
              className='mt-5 text-center'
              items={[
                'Our first beach stop was Spiaggia del Principe on Costa Smeralda, and what a start! The turquoise water was absolutely stunning. Photos simply don\'t do it justice.',
                "We visited in the morning and had no trouble parking, although reaching the beach requires a walk from the parking area. There's a small beach bar and vendors selling umbrellas. We bought one and used it throughout our Sardinia trip.",
              ]}
            />
          </Reveal>

          {/* Stacked (one above the other), not side by side -- per
              explicit request, to give these two photos more prominence
              at the page's full article image width (max-w-5xl md:max-
              w-3xl, matching e.g. the Cala Santa Maria/Spiaggia Rosa/La
              Maddalena town photos), rather than sharing a two-column
              row at half that width. Both are the same real 4:3 shot
              (2400x1800, the processed files' actual dimensions), so
              native width/height + h-auto (no forced aspect-ratio/
              object-cover box) keeps both uncropped at their true ratio.
              Only resized and recompressed for web (see the image
              pipeline); no colour/saturation adjustment, so they keep
              their real, slightly muted-by-midday-sun colour rather than
              an artificially boosted turquoise. Captions unchanged.
              Neither used as the hero/landing image, which stays
              untouched. */}
          <Reveal className='mt-10 md:mt-12 flex flex-col gap-10 md:gap-12 max-w-5xl md:max-w-3xl mx-auto'>
            <div>
              <Image
                src='/2025-07%20-%20Sardinia/Sardinia_Spiaggia%20del%20principe_web.jpeg'
                alt='Crystal-clear turquoise water at Spiaggia del Principe, seen from the beach.'
                width={2400}
                height={1800}
                sizes='(min-width: 1024px) 1024px, 100vw'
                className='w-full h-auto rounded-[2px]'
              />
              <p className='mt-3 text-center text-sm italic font-[family-name:var(--font-poppins)] text-black/55 dark:text-white/55'>
                The turquoise water at Spiaggia del Principe.
              </p>
            </div>
            <div>
              <Image
                src='/2025-07%20-%20Sardinia/Sardinia_Spiaggia%20del%20principe2_web.jpeg'
                alt='Spiaggia del Principe and its bay seen from above.'
                width={2400}
                height={1800}
                sizes='(min-width: 1024px) 1024px, 100vw'
                className='w-full h-auto rounded-[2px]'
              />
              <p className='mt-3 text-center text-sm italic font-[family-name:var(--font-poppins)] text-black/55 dark:text-white/55'>
                Spiaggia del Principe and its bay, seen from above.
              </p>
            </div>
          </Reveal>

        </div>
      </section>

      {/* 12. MAP -- Casagliana -> Palau (drive), then the short walk from
          the harbour parking to the boat's boarding point. One Journey,
          two legs -- see lib/journeys/sardinia.ts for the full disclosure
          on both: the drive is a real, OSRM-verified route; the parking-
          to-boarding hop is a plain illustrative line, not a verified
          walking route (there's no pedestrian-routing data to verify it
          against, and OSRM's own *driving* route for that stretch loops
          the wrong way for a walk). */}
      <JourneyMapScene
        routeCache={SARDINIA_ROUTE_CACHE}
        journey={SARDINIA_CASAGLIANA_TO_PALAU_JOURNEY}
        heightClassName='h-[420px] sm:h-[480px] md:h-[560px]'
      />

      {/* 13. GETTING TO PALAU AND PARKING -- map -> content transition.
          Paragraphs are the user's own verbatim account. No parking fee
          is shown here -- only that paying was slow and EasyPark helped,
          which is kept as this section's own location-specific anecdote
          (not a repeat of the general EasyPark advice in the "Parking in
          Sardinia" section). Closes with the full chapter-to-chapter
          rhythm, pairing with the boat-excursion chapter's own
          CHAPTER_GAP_START next. */}
      <section className={`px-6 md:px-12 ${MAP_TRANSITION_PT} ${CHAPTER_GAP_END} bg-[#faf9f6] dark:bg-black`}>
        <div className='max-w-2xl mx-auto text-center'>
          <Reveal>
            <RouteLabel>Palau</RouteLabel>
            <ChapterHeading as='h2' italic className='mt-8 md:mt-10'>
              Getting to Palau and Parking
            </ChapterHeading>
            <Paragraphs
              className='mt-5 text-center'
              items={[
                'We drove to Palau for our boat excursion. Although we arrived early, finding parking near the harbour was difficult.',
                'We eventually found a spot, but the queue at the payment machine was long. Luckily, we had EasyPark, which saved us a lot of time.',
              ]}
            />
          </Reveal>

        </div>
      </section>

      {/* 14. LA MADDALENA ARCHIPELAGO -- the boat excursion, a new chapter
          (full CHAPTER_GAP_START on top). Main narrative is the user's
          own verbatim account, kept in the same order/paragraph breaks
          given. Each stop below is a sub-beat within this same chapter
          (Eyebrow + ChapterHeading h3, same role/spacing as this page's
          own "A first with Ryanair"-style sub-beats), not a new chapter
          of its own, since they're all one continuous boat trip. */}
      <section className={`px-6 md:px-12 ${CHAPTER_GAP_START} ${CHAPTER_GAP_END} bg-[#faf9f6] dark:bg-black`}>
        <div className='max-w-2xl mx-auto text-center'>
          <Reveal>
            <RouteLabel>La Maddalena Archipelago</RouteLabel>
            <ChapterHeading as='h2' italic className='mt-8 md:mt-10'>
              La Maddalena Archipelago – Beautiful Islands, Not My
              Favourite Boat Trip
            </ChapterHeading>
            <Paragraphs
              className='mt-5 text-center'
              items={[
                "We explored the La Maddalena Archipelago on a large tourist boat. The islands were absolutely beautiful, with some of the clearest turquoise water I've ever seen.",
              ]}
            />
          </Reveal>

          {/* EXCURSION PRICE -- what we actually paid for this Viator
              booking, added per explicit instruction. Same warm-beige
              panel design and "total paid is the dominant TimeStamp
              value" convention as the Tavolara/Gulf of Orosei price
              panels, so all three excursion price boxes are now
              visually consistent and all use EUR. The booking's
              original USD list price is kept as a small supporting
              line (context only, not a second total). The separate
              per-person landing-fee note that used to sit below this
              panel has been removed per explicit instruction -- the
              EUR total above is the only figure shown now. */}
          <Reveal className='mt-9 md:mt-11 mx-auto max-w-[460px] rounded-[3px] bg-[#f1ebdc] dark:bg-white/[0.04] px-8 py-8 md:px-9 md:py-9 flex flex-col items-center gap-1 text-center'>
            <span className='text-xs uppercase tracking-[0.18em] font-[family-name:var(--font-poppins)] font-semibold text-black/45 dark:text-white/45'>
              Viator · La Maddalena Archipelago – 4 Stops Boat Tour
            </span>
            <span className='mt-3 text-sm font-[family-name:var(--font-poppins)] text-black/60 dark:text-white/60'>
              2 July 2025
            </span>
            <span className='mt-4 text-xs uppercase tracking-[0.18em] font-[family-name:var(--font-poppins)] font-semibold text-black/45 dark:text-white/45'>
              2 Adults + 2 Children
            </span>
            <TimeStamp size='md'>€281.67</TimeStamp>
            <span className='mt-4 text-sm font-[family-name:var(--font-poppins)] text-black/60 dark:text-white/60'>
              Originally listed as $302.72 USD
            </span>
          </Reveal>
        </div>

        {/* INTRO VIDEO -- Crystall water.MOV, a general clear-water clip
            (no single identifiable stop, unlike the Cala Santa Maria
            video below), used here to illustrate the opening paragraph's
            water rather than any specific location. Displayed at a
            moderate, noticeably smaller size than the page's full-width
            videos/photos (max-w-md vs. the usual max-w-3xl), per
            explicit scope -- still centred, still responsive, native
            16:9 aspect ratio preserved exactly (source is 1920x1080).
            Native controls only, no autoplay, no sound until the viewer
            presses play -- same pattern as every other video on this
            page. Re-encoded from the original .MOV (kept untouched) at
            the same settings used sitewide: H.264/AAC, 1280px wide,
            crf 26, faststart. */}
        <Reveal className='mt-10 md:mt-12 max-w-md mx-auto'>
          <div className='relative w-full overflow-hidden rounded-[2px] aspect-[16/9]'>
            <video
              src='/2025-07%20-%20Sardinia/Crystall%20water_web.mp4'
              controls
              playsInline
              preload='metadata'
              poster='/2025-07%20-%20Sardinia/Crystall%20water_poster.jpg'
              aria-label='Video of clear turquoise water in the La Maddalena Archipelago.'
              className='absolute inset-0 h-full w-full object-cover'
            />
          </div>
          <p className='mt-3 text-center text-sm italic font-[family-name:var(--font-poppins)] text-black/55 dark:text-white/55'>
            Clear water in the La Maddalena Archipelago.
          </p>
        </Reveal>

        <div className='max-w-2xl mx-auto text-center'>
          <Reveal className='mt-10 md:mt-12'>
            <Paragraphs
              className='text-center'
              items={[
                "Unfortunately, I didn't enjoy the boat excursion as much as I'd hoped. There were simply too many tourists. Several large boats visited the same beaches, often arriving around the same time, so even these beautiful places felt overcrowded.",
                'The atmosphere on board was frustrating too. When we first boarded, everyone had a seat, but after our first stop, some passengers took seats where others had been sitting before. It made the experience unnecessarily stressful, especially on such a crowded boat.',
                "Looking back, I wouldn't choose such a large tourist boat again. I'd much rather pay more for a smaller-group excursion and enjoy these incredible islands in a more relaxed way.",
              ]}
            />
          </Reveal>

          {/* STOP 1 -- Cala Corsara, Spargi: the excursion's REAL first
              stop, per the confirmed itinerary with Delfino Tours
              (2 July 2025) -- corrected from an earlier, unnamed
              placement of this stop later in the sequence. The two
              photos below were originally shown in that unnamed slot;
              they belong here. */}
          <Reveal className='mt-16 md:mt-[76px] max-w-xl mx-auto'>
            <Eyebrow>First Stop</Eyebrow>
            <ChapterHeading as='h3' italic className='mt-3'>
              Cala Corsara, Spargi
            </ChapterHeading>
            <Paragraphs
              className='mt-5 text-center'
              items={[
                'Cala Corsara was absolutely beautiful, with crystal-clear turquoise water. Despite the number of visitors, the beach felt surprisingly peaceful compared to our other stops.',
              ]}
            />
          </Reveal>
        </div>

        {/* Stacked (one above the other), not side by side -- per
            explicit correction, the earlier two-column layout looked
            unbalanced here because these two photos have different real
            aspect ratios (one portrait, one landscape), unlike the
            Spiaggia del Principe pair (which are both the same ratio
            and still work as a two-column grid). Both now display at
            the same width as this page's standard full-width article
            photos (max-w-5xl md:max-w-3xl, matching e.g. the Cala Santa
            Maria/Spiaggia Rosa/La Maddalena town photos below), with
            native width/height + h-auto rather than a fixed aspect-ratio
            box, so each keeps its own true aspect ratio with no crop.
            Alt text and both source images are unchanged; captions
            added below each photo. */}
        <Reveal className='mt-10 md:mt-12 flex flex-col gap-6 md:gap-8 max-w-5xl md:max-w-3xl mx-auto'>
          <div>
            <Image
              src='/2025-07%20-%20Sardinia/La%20Maddalena_web.jpeg'
              alt='Clear turquoise water with sailboats moored in the bay at Cala Corsara, Spargi.'
              width={1800}
              height={2400}
              sizes='(min-width: 1024px) 1024px, 100vw'
              className='w-full h-auto rounded-[2px]'
            />
            <p className='mt-3 text-center text-sm italic font-[family-name:var(--font-poppins)] text-black/55 dark:text-white/55'>
              The incredibly clear turquoise water at Cala Corsara.
            </p>
          </div>
          <div>
            <Image
              src='/2025-07%20-%20Sardinia/La%20Maddalena2_web.jpeg'
              alt='A narrow, crowded beach with sunbathers and many anchored boats offshore at Cala Corsara, Spargi.'
              width={2400}
              height={1800}
              sizes='(min-width: 1024px) 1024px, 100vw'
              className='w-full h-auto rounded-[2px]'
            />
            <p className='mt-3 text-center text-sm italic font-[family-name:var(--font-poppins)] text-black/55 dark:text-white/55'>
              Cala Corsara, Spargi, with sailboats and small boats anchored in the bay.
            </p>
          </div>
        </Reveal>

        {/* STOP 2 -- Spiaggia Rosa, Budelli: passed by boat only, never
            landed on. The excursion's real second stop. Photo is the
            user's own actual view from the boat, deliberately not
            swapped for a more dramatic stock shot of bright pink sand,
            per explicit instruction. Description shortened per explicit
            follow-up. */}
        <div className='max-w-2xl mx-auto text-center'>
          <Reveal className='mt-16 md:mt-[76px] max-w-xl mx-auto'>
            <ChapterHeading as='h3' italic>
              Passing Spiaggia Rosa
            </ChapterHeading>
            <Paragraphs
              className='mt-5 text-center'
              items={[
                'Next, we passed the famous Spiaggia Rosa on Budelli island. Landing on this protected beach is prohibited, so we could only admire it from the boat.',
                "To be honest, the sand didn't look particularly pink from where we were.",
              ]}
            />
          </Reveal>
        </div>

        <Reveal className='mt-10 md:mt-12 max-w-5xl md:max-w-3xl mx-auto'>
          <div className='relative w-full overflow-hidden rounded-[2px] aspect-[4/3] md:aspect-[16/9]'>
            <Image
              src='/2025-07%20-%20Sardinia/Spiaggia%20Rosa_web.jpeg'
              alt='Spiaggia Rosa on Budelli Island, seen from the boat — the sand did not look distinctly pink from this distance.'
              fill
              sizes='(min-width: 1024px) 1024px, 100vw'
              className='object-cover'
            />
          </div>
          <p className='mt-3 text-center text-sm italic font-[family-name:var(--font-poppins)] text-black/55 dark:text-white/55'>
            Spiaggia Rosa, Budelli — the actual view from our boat.
          </p>
        </Reveal>

        {/* STOP 3 -- Cala Santa Maria, the excursion's real second BEACH
            stop (third stop overall). Corrected per explicit follow-up:
            this cove is on Isola Santa Maria, NOT Caprera -- the real
            coordinate already used for this point (see
            lib/journeys/sardinia.ts) was correct all along, only the
            "Caprera" text label/caption below was wrong, and has been
            fixed here. Photo + its own short video, same media and same
            order as before, only the heading label (now "Second Stop",
            not "First Stop") and the caption/alt text have changed. */}
        <div className='max-w-2xl mx-auto text-center'>
          <Reveal className='mt-16 md:mt-[76px] max-w-xl mx-auto'>
            <Eyebrow>Second Stop</Eyebrow>
            <ChapterHeading as='h3' italic className='mt-3'>
              Cala Santa Maria
            </ChapterHeading>
            <Paragraphs
              className='mt-5 text-center'
              items={[
                'Our second beach stop was Cala Santa Maria, another beautiful spot with exceptionally clear turquoise water.',
                'However, the beach was relatively narrow, and more excursion boats kept arriving. As they brought in more tourists, the beach became increasingly crowded. It was here that I really noticed the downside of visiting these islands on a large organised boat tour.',
              ]}
            />
          </Reveal>
        </div>

        {/* The still photo of the turquoise cove was removed per
            explicit correction (along with its "Cala Santa Maria, Santa
            Maria Island." caption) -- per explicit instruction, nothing
            else about the video below was changed: same spacing
            (mt-8/md:mt-10), same aria-label, same aspect-[16/9]/max-w-3xl
            layout. Only its own visible caption was updated, to describe
            tourists arriving at the crowded beach rather than echo the
            removed photo's caption. Same native-controls video pattern
            used for the Casagliana resort video above (no autoplay, no
            sound until pressed). Re-encoded from the original .MOV (kept
            untouched) to H.264/AAC at 1280x720, crf 26, same as every
            other re-encoded video on the site. */}
        <Reveal className='mt-8 md:mt-10 max-w-3xl mx-auto'>
          <div className='relative w-full overflow-hidden rounded-[2px] aspect-[16/9]'>
            <video
              src='/2025-07%20-%20Sardinia/Cala%20Santa%20Maria_web.mp4'
              controls
              playsInline
              preload='metadata'
              poster='/2025-07%20-%20Sardinia/Cala%20Santa%20Maria_poster.jpg'
              aria-label='Video of the tour boat and swimmers in the clear water at Cala Santa Maria, Santa Maria Island.'
              className='absolute inset-0 h-full w-full object-cover'
            />
          </div>
          <p className='mt-3 text-center text-sm italic font-[family-name:var(--font-poppins)] text-black/55 dark:text-white/55'>
            Tourists arriving at Cala Santa Maria, looking for a spot on
            the crowded beach.
          </p>
        </Reveal>

        {/* STOP 4 -- Porto della Madonna, the natural swimming pools near
            Budelli. The excursion's real swimming stop (fourth overall).
            Renamed and relocated per explicit follow-up from an
            unnamed/unconfirmed "turquoise bay" -- per explicit scope, no
            additional photos or video are added here since only this one
            photo's location is confirmed. */}
        <div className='max-w-2xl mx-auto text-center'>
          <Reveal className='mt-16 md:mt-[76px] max-w-xl mx-auto'>
            <Eyebrow>Swimming Stop</Eyebrow>
            <ChapterHeading as='h3' italic className='mt-3'>
              Porto della Madonna – Natural Pools
            </ChapterHeading>
            <Paragraphs
              className='mt-5 text-center'
              items={[
                'After Cala Santa Maria, we stopped at the natural pools near Budelli, where we could swim directly from the boat.',
                'The water was an extraordinary shade of turquoise.',
              ]}
            />
          </Reveal>
        </div>

        <Reveal className='mt-10 md:mt-12 max-w-5xl md:max-w-3xl mx-auto'>
          <div className='relative w-full overflow-hidden rounded-[2px] aspect-[4/3] md:aspect-[16/9]'>
            <Image
              src='/2025-07%20-%20Sardinia/Swimming%20bay_web.jpeg'
              alt='A turquoise bay with a boat ladder visible, where passengers could swim directly from the boat at Porto della Madonna.'
              fill
              sizes='(min-width: 1024px) 1024px, 100vw'
              className='object-cover'
            />
          </div>
          <p className='mt-3 text-center text-sm italic font-[family-name:var(--font-poppins)] text-black/55 dark:text-white/55'>
            Swimming in the turquoise waters of Porto della Madonna.
          </p>
        </Reveal>

        {/* STOP 5 -- La Maddalena town, the real confirmed Piazza
            Giuseppe Garibaldi, and the excursion's real final stop.
            Kept short and natural, per explicit scope -- no invented
            restaurants, attractions or activities. Unchanged by this
            reordering pass (it was already the last stop). */}
        <div className='max-w-2xl mx-auto text-center'>
          <Reveal className='mt-16 md:mt-[76px] max-w-xl mx-auto'>
            <Eyebrow>Free Time</Eyebrow>
            <ChapterHeading as='h3' italic className='mt-3'>
              La Maddalena Town
            </ChapterHeading>
            <Paragraphs
              className='mt-5 text-center'
              items={[
                'Towards the end of the excursion, we visited the town of La Maddalena.',
                'We had some free time to walk around and enjoyed an ice cream.',
              ]}
            />
          </Reveal>
        </div>

        <Reveal className='mt-10 md:mt-12 max-w-5xl md:max-w-3xl mx-auto'>
          <div className='relative w-full overflow-hidden rounded-[2px] aspect-[4/3] md:aspect-[16/9]'>
            <Image
              src='/2025-07%20-%20Sardinia/La%20Madellena%20city_web.jpeg'
              alt='A pedestrian square in La Maddalena town, with colourful old buildings, a gelateria and flower planters.'
              fill
              sizes='(min-width: 1024px) 1024px, 100vw'
              className='object-cover'
            />
          </div>
          <p className='mt-3 text-center text-sm italic font-[family-name:var(--font-poppins)] text-black/55 dark:text-white/55'>
            A quiet moment in the town of La Maddalena.
          </p>
        </Reveal>

        {/* MY TIP -- closes this chapter. No longer the page's final
            section (Spiaggia Liscia Ruja now follows), so this uses the
            normal mid-page InlineTip pattern -- plain div, ordinary
            mt- spacing -- rather than the special final-section closing
            padding, which has moved to the new last section below. */}
        <div className='max-w-2xl mx-auto text-center'>
          <Reveal className='mt-10 md:mt-12 max-w-xl mx-auto'>
            <InlineTip>
              My tip: The islands are absolutely worth visiting, but next
              time I&apos;d choose a smaller boat tour. Fewer people
              would have made the experience much more enjoyable.
            </InlineTip>
          </Reveal>
        </div>
      </section>

      {/* 15. MAP -- Casagliana Suite Resort -> Spiaggia Liscia Ruja.
          Moved here, immediately before the Liscia Ruja section's own
          RouteLabel/heading, per explicit instruction -- same bare
          JourneyMapScene component, full width and sizing convention as
          every other route map on the page (Spiaggia del Principe's own
          map above is the direct template), not nested inside the
          section's text column. */}
      <JourneyMapScene
        routeCache={SARDINIA_ROUTE_CACHE}
        journey={SARDINIA_CASAGLIANA_TO_LISCIA_RUJA_JOURNEY}
        heightClassName='h-[380px] sm:h-[440px] md:h-[500px]'
      />

      {/* 15. LISCIA RUJA -- a standalone beach stop, added as a brand new
          chapter after the La Maddalena excursion. Now a map -> content
          transition (MAP_TRANSITION_PT on top) rather than text ->
          chapter, since the route map above now directly precedes this
          section's own heading, per explicit instruction. Text is the
          user's own verbatim account, kept in the given paragraph
          breaks. Heading shortened to "Liscia Ruja" per explicit
          instruction -- the negative "too commercialised" assessment
          stays in the body paragraphs only, not repeated in the
          heading. RouteLabel reuses "Beach" (singular), matching
          Spiaggia del Principe -- both are standalone single-beach
          chapters of the same kind, not part of a larger excursion.
          UPDATE: the individual parking-price Fact panel and its price-
          caveat note were removed per explicit instruction (parking
          cost now lives only in the general "Parking in Sardinia"
          section after Renting a Car). Paragraphs now flow straight
          into the MAIN PHOTO below.

          This is now the page's final section, so its last video block
          below carries the sitewide final-section closing padding
          (CHAPTER_GAP_END's own value plus 50px -- the same formula
          the La Maddalena chapter's own My Tip box used to carry)
          instead of the plain CHAPTER_GAP_END used between two mid-page
          chapters. */}
      <section className={`px-6 md:px-12 ${MAP_TRANSITION_PT} bg-[#faf9f6] dark:bg-black`}>
        <div className='max-w-2xl mx-auto text-center'>
          <Reveal>
            <RouteLabel>Beach</RouteLabel>
            <ChapterHeading as='h2' italic className='mt-8 md:mt-10'>
              Liscia Ruja
            </ChapterHeading>
            <Paragraphs
              className='mt-5 text-center'
              items={[
                "After Spiaggia del Principe, Liscia Ruja was a disappointment. The beach is huge, but we didn't find it nearly as beautiful as the others we'd visited.",
                "Everything felt overly commercialised. Sunbeds dominated much of the beach, while visitors who didn't want to rent one had to use a separate area. There were children's inflatables, toy cars and even a mobile bar on the sand.",
                "Unlike Spiaggia del Principe, where vendors didn't bother us, here we felt like everything revolved around spending money. We wouldn't return.",
              ]}
            />
          </Reveal>

        </div>

        {/* MAIN PHOTO -- same full article width as the page's other
            single section-level photos (max-w-5xl md:max-w-3xl,
            aspect-[4/3] md:aspect-[16/9], object-cover), matching the
            Tenerife page's own main-photo width per explicit request. */}
        <Reveal className='mt-10 md:mt-12 max-w-5xl md:max-w-3xl mx-auto'>
          <div className='relative w-full overflow-hidden rounded-[2px] aspect-[4/3] md:aspect-[16/9]'>
            <Image
              src='/2025-07%20-%20Sardinia/Spiaggia%20Liscia%20Ruja_web.jpeg'
              alt='Spiaggia Liscia Ruja, a large beach on the Costa Smeralda.'
              fill
              sizes='(min-width: 1024px) 1024px, 100vw'
              className='object-cover'
            />
          </div>
          <p className='mt-3 text-center text-sm italic font-[family-name:var(--font-poppins)] text-black/55 dark:text-white/55'>
            Spiaggia Liscia Ruja, Costa Smeralda.
          </p>
        </Reveal>

        {/* ROAD VIDEO -- source footage is native portrait (1080x1920),
            unlike every other video on this page, so it's shown at its
            real 9:16 ratio in a narrower, taller box rather than being
            cropped into the sitewide 16:9 treatment. Re-encoded to
            720x1280, H.264/AAC, crf 26 -- same settings used sitewide,
            just applied to the long (vertical) edge instead of width.
            Native controls, no autoplay, same as every other video on
            the site. */}
        <Reveal className='mt-10 md:mt-12 max-w-[260px] sm:max-w-[300px] mx-auto'>
          <div className='relative w-full overflow-hidden rounded-[2px] aspect-[9/16]'>
            <video
              src='/2025-07%20-%20Sardinia/Road%20to%20Liscia%20Ruja_web.mp4'
              controls
              playsInline
              preload='metadata'
              poster='/2025-07%20-%20Sardinia/Road%20to%20Liscia%20Ruja_poster.jpg'
              aria-label='Video of the road leading to Spiaggia Liscia Ruja.'
              className='absolute inset-0 h-full w-full object-cover'
            />
          </div>
          <p className='mt-3 text-center text-sm italic font-[family-name:var(--font-poppins)] text-black/55 dark:text-white/55'>
            The road to Spiaggia Liscia Ruja.
          </p>
        </Reveal>

        {/* BAR VIDEO -- the mobile beach bar. Same landscape 16:9/
            max-w-3xl pattern as every other landscape video on the site
            (e.g. Cala Santa Maria above). No longer the page's final
            piece of content (Tavolara now follows), so this uses the
            plain CHAPTER_GAP_END-equivalent spacing rather than the
            special final-section closing padding, which has moved to
            the new last section below. */}
        <Reveal className='mt-8 md:mt-10 pb-12 md:pb-14 max-w-3xl mx-auto'>
          <div className='relative w-full overflow-hidden rounded-[2px] aspect-[16/9]'>
            <video
              src='/2025-07%20-%20Sardinia/Liscia%20Ruja%20bar_web.mp4'
              controls
              playsInline
              preload='metadata'
              poster='/2025-07%20-%20Sardinia/Liscia%20Ruja%20bar_poster.jpg'
              aria-label='Video of a mobile bar set up on the sand at Spiaggia Liscia Ruja.'
              className='absolute inset-0 h-full w-full object-cover'
            />
          </div>
          <p className='mt-3 text-center text-sm italic font-[family-name:var(--font-poppins)] text-black/55 dark:text-white/55'>
            A mobile bar on Spiaggia Liscia Ruja.
          </p>
        </Reveal>
      </section>

      {/* 16. TAVOLARA -- a standalone boat-trip chapter, added right
          after Spiaggia Liscia Ruja (text -> chapter transition, full
          CHAPTER_GAP_START on top, pairing with that section's own
          closing padding above). Text is the user's own verbatim
          account, kept in the given paragraph breaks. RouteLabel uses
          the place name "Tavolara", same convention as other single-
          topic chapters (Agrisole, Palau, La Maddalena Archipelago) --
          this is a boat excursion chapter, not a beach-stop chapter, so
          it doesn't reuse "Beaches" the way Spiaggia del Principe/Liscia
          Ruja do. No map, no My Tip box and no price panel, per explicit
          scope -- no price was given, same reasoning as the Palau
          section above (no parking fee shown there either, because none
          was given).

          FIX (this review): the GetYourGuide screenshot moved from near
          the end of the section to between paragraphs 2 and 3, per
          explicit instruction -- same "photo interrupting the narrative
          mid-paragraph-run" pattern already used for the La Maddalena
          chapter's own intro video (which sits between that chapter's
          intro paragraphs and its narrative paragraphs). The paragraphs
          are now split into two Paragraphs blocks to make room for it;
          their combined text, order and wording are completely
          unchanged. The screenshot's own size, styling and caption are
          unchanged too, per explicit scope -- only its position moved.

          Media, now in this order: the GetYourGuide boat photo
          (prominent, full article width), the Spiaggia del Dottore
          landscape photo (same full article width), then the Isola
          Piana video (native 16:9, no cropping needed) -- the
          screenshot no longer sits in this run, having moved up into
          the text above. The two photos have real, slightly-off ratios
          (~1.19:1 and ~1.17:1, not exactly 4:3 or 16:9), and the
          screenshot is a tall portrait crop with text that must stay
          readable -- per explicit "no awkward cropping" scope, all
          three use native width/height + w-full h-auto (uncropped)
          rather than the aspect-ratio-box/object-cover treatment used
          for exact-ratio photos elsewhere on this page, same pattern
          already used for Spiaggia del Principe's own near-4:3 stacked
          pair and the Agrisole dinner photo.

          This is now the page's final section, so its last media item
          is now the Isola Piana video (the screenshot moved away from
          this position) and it carries the sitewide final-section
          closing padding (CHAPTER_GAP_END's own value plus 50px -- the
          same formula the screenshot used to carry here, and the
          Liscia Ruja bar video before that) instead of the plain
          closing spacing used between two mid-page chapters. */}
      {/* MAP -- Casagliana Suite Resort -> MOYS, Marina di Olbia
          (Tavolara boat trip). Moved here, immediately before the
          Tavolara section's own RouteLabel/heading, per explicit
          instruction -- same bare JourneyMapScene component, full width
          and sizing convention as every other route map on the page. */}
      <JourneyMapScene
        routeCache={SARDINIA_ROUTE_CACHE}
        journey={SARDINIA_CASAGLIANA_TO_MOYS_JOURNEY}
        heightClassName='h-[380px] sm:h-[440px] md:h-[500px]'
      />

      {/* TAVOLARA -- now a map -> content transition (MAP_TRANSITION_PT
          on top) rather than text -> chapter, since the route map above
          now directly precedes this section's own heading, per explicit
          instruction. */}
      <section className={`px-6 md:px-12 ${MAP_TRANSITION_PT} bg-[#faf9f6] dark:bg-black`}>
        <div className='max-w-2xl mx-auto text-center'>
          <Reveal>
            <RouteLabel>Tavolara</RouteLabel>
            <ChapterHeading as='h2' italic className='mt-8 md:mt-10'>
              Tavolara – A Boat Trip We Loved
            </ChapterHeading>
            <Paragraphs
              className='mt-5 text-center'
              items={[
                'After our experience in La Maddalena, this boat trip was a completely different story.',
                'We booked a four-hour small-group excursion through GetYourGuide, departing from Marina di Olbia. Parking was limited, so arriving early was important.',
              ]}
            />
          </Reveal>
        </div>

        {/* THE GETYOURGUIDE SCREENSHOT -- moved here per explicit
            instruction, immediately after the paragraph ending "Parking
            was limited, so arriving early was important." Size, styling
            and caption unchanged: tall portrait screenshot (1106x1517)
            shown uncropped at a deliberately narrower width than the
            photos below, so the excursion name and rating stay sharp
            and readable rather than being stretched to the full article
            width. No longer the page's final piece of content, so it no
            longer carries the special final-section closing padding --
            that has moved to the Isola Piana video below, now the
            actual last element. */}
        <Reveal className='mt-10 md:mt-12 max-w-[300px] sm:max-w-[360px] mx-auto'>
          <Image
            src='/2025-07%20-%20Sardinia/GYG_web.jpeg'
            alt='A screenshot of the Tavolara boat tour booking on GetYourGuide, showing the excursion name and rating.'
            width={1106}
            height={1517}
            sizes='360px'
            className='w-full h-auto rounded-[2px] shadow-sm'
          />
          <p className='mt-3 text-center text-sm italic font-[family-name:var(--font-poppins)] text-black/55 dark:text-white/55'>
            The Tavolara boat tour we booked through GetYourGuide.
          </p>
        </Reveal>

        {/* EXCURSION PRICE -- what we actually paid for this GetYourGuide
            booking, placed near the GYG card per explicit instruction.
            Total paid is the dominant TimeStamp value, same visual-
            focus convention as every other price panel on the page
            (the flight box's own fare is the same kind of focal value
            among several supporting lines). Per-person figure is a
            plain supporting line underneath, not a second TimeStamp. */}
        <div className='max-w-2xl mx-auto text-center'>
          <Reveal className='mt-9 md:mt-11 mx-auto max-w-[460px] rounded-[3px] bg-[#f1ebdc] dark:bg-white/[0.04] px-8 py-8 md:px-9 md:py-9 flex flex-col items-center gap-1 text-center'>
            <span className='text-xs uppercase tracking-[0.18em] font-[family-name:var(--font-poppins)] font-semibold text-black/45 dark:text-white/45'>
              GetYourGuide · Tavolara Boat Trip
            </span>
            <span className='mt-3 text-sm font-[family-name:var(--font-poppins)] text-black/60 dark:text-white/60'>
              4 July 2025 · ~4 hours
            </span>
            <span className='mt-4 text-xs uppercase tracking-[0.18em] font-[family-name:var(--font-poppins)] font-semibold text-black/45 dark:text-white/45'>
              2 Adults + 2 Children
            </span>
            <TimeStamp size='md'>€290.00</TimeStamp>
            <span className='mt-4 text-sm font-[family-name:var(--font-poppins)] text-black/60 dark:text-white/60'>
              €72.50 per person
            </span>
          </Reveal>
        </div>

        <div className='max-w-2xl mx-auto text-center'>
          <Reveal className='mt-10 md:mt-12'>
            <Paragraphs
              className='text-center'
              items={[
                'Our guide was wonderful, and we visited beautiful spots, including Spiaggia del Dottore and Isola Piana. We also passed impressive cliffs and stopped for a swim at Tavolara.',
                "It was a hot summer day, but we loved every minute. Four hours felt just right – exactly the kind of boat trip we'd happily do again.",
              ]}
            />
          </Reveal>
        </div>

        {/* MEDIA 1 -- GetYourGuide boat photo, the main/prominent photo.
            Real ratio ~1.19:1 (2400x2021), shown uncropped at the page's
            full article width (max-w-5xl md:max-w-3xl), same width used
            for every other "main photo" on this page. */}
        <Reveal className='mt-10 md:mt-12 max-w-5xl md:max-w-3xl mx-auto'>
          <Image
            src='/2025-07%20-%20Sardinia/GYG_Tavolara_web.jpeg'
            alt='Our guide on a small boat near Tavolara.'
            width={2400}
            height={2021}
            sizes='(min-width: 1024px) 1024px, 100vw'
            className='w-full h-auto rounded-[2px]'
          />
          <p className='mt-3 text-center text-sm italic font-[family-name:var(--font-poppins)] text-black/55 dark:text-white/55'>
            Exploring Tavolara by small boat.
          </p>
        </Reveal>

        {/* MEDIA 2 -- Spiaggia del Dottore, a large landscape photo.
            Real ratio ~1.17:1 (2400x2055), same uncropped full-width
            treatment as the photo above. */}
        <Reveal className='mt-10 md:mt-12 max-w-5xl md:max-w-3xl mx-auto'>
          <Image
            src='/2025-07%20-%20Sardinia/Spiaggia%20del%20Dottore_web.jpeg'
            alt='Spiaggia del Dottore, a beach stop on the Tavolara boat trip.'
            width={2400}
            height={2055}
            sizes='(min-width: 1024px) 1024px, 100vw'
            className='w-full h-auto rounded-[2px]'
          />
          <p className='mt-3 text-center text-sm italic font-[family-name:var(--font-poppins)] text-black/55 dark:text-white/55'>
            Spiaggia del Dottore, one of our beautiful stops.
          </p>
        </Reveal>

        {/* MEDIA 3 -- Isola Piana video. Native 1920x1080 source,
            re-encoded to 1280x720 H.264/AAC, crf 26, same settings used
            sitewide -- exact 16:9, so the standard aspect-[16/9]/
            max-w-3xl/object-cover treatment crops nothing. Native
            controls, no autoplay, same as every other video on the
            site. No longer the page's final piece of content (La Cinta
            now follows), so this uses the plain CHAPTER_GAP_END-
            equivalent spacing rather than the special final-section
            closing padding, which has moved to the new last section
            below. */}
        <Reveal className='mt-10 md:mt-12 pb-12 md:pb-14 max-w-3xl mx-auto'>
          <div className='relative w-full overflow-hidden rounded-[2px] aspect-[16/9]'>
            <video
              src='/2025-07%20-%20Sardinia/Isola%20Piana_web.mp4'
              controls
              playsInline
              preload='metadata'
              poster='/2025-07%20-%20Sardinia/Isola%20Piana_poster.jpg'
              aria-label='Video of the turquoise water around Isola Piana.'
              className='absolute inset-0 h-full w-full object-cover'
            />
          </div>
          <p className='mt-3 text-center text-sm italic font-[family-name:var(--font-poppins)] text-black/55 dark:text-white/55'>
            The turquoise waters around Isola Piana.
          </p>
        </Reveal>
      </section>

      {/* 17. LA CINTA -- a standalone beach chapter, added right after
          Tavolara (text -> chapter transition, full CHAPTER_GAP_START
          on top, pairing with that section's own closing padding
          above). Text is the user's own verbatim account, kept in the
          given paragraph breaks. RouteLabel reuses "Beach" (singular),
          same convention as Spiaggia del Principe/Liscia Ruja -- this is a
          beach-stop chapter, not an excursion chapter, so it doesn't
          use a place-name RouteLabel the way Tavolara/Agrisole/Palau
          do.

          Media placement follows explicit instruction rather than the
          page's usual "all text, then all media" order: the photo sits
          between paragraphs 2 and 3, the video between paragraphs 3 and
          4 -- same "photo/video interrupting the narrative" pattern
          already used for Tavolara's own GetYourGuide screenshot and
          the La Maddalena chapter's intro video. Both photo and video
          are exact-ratio sources (4:3 and 16:9 respectively), so they
          use the standard aspect-ratio-box/object-cover treatment (no
          native-ratio workaround needed, unlike Tavolara's two photos).

          UPDATE: the individual parking-price Fact panel and its price-
          caveat note were removed per explicit instruction (parking
          cost now lives only in the general "Parking in Sardinia"
          section after Renting a Car). The closing pb-12/14 that
          caveat note used to carry has moved onto the paragraphs Reveal
          above it, so the section still closes with the same gap. No
          map, no My Tip box, per explicit scope.

          This is now the page's final section, so its closing
          disclaimer line carries the sitewide final-section closing
          padding (CHAPTER_GAP_END's own value plus 50px -- the same
          formula the Isola Piana video used to carry) instead of the
          plain closing spacing used between two mid-page chapters. */}
      {/* MAP -- Casagliana Suite Resort -> La Cinta Beach, San Teodoro.
          Moved here, immediately before the La Cinta section's own
          RouteLabel/heading, per explicit instruction -- same bare
          JourneyMapScene component, full width and sizing convention as
          every other route map on the page. */}
      <JourneyMapScene
        routeCache={SARDINIA_ROUTE_CACHE}
        journey={SARDINIA_CASAGLIANA_TO_LA_CINTA_JOURNEY}
        heightClassName='h-[400px] sm:h-[460px] md:h-[520px]'
      />

      {/* LA CINTA -- now a map -> content transition (MAP_TRANSITION_PT
          on top) rather than text -> chapter, since the route map above
          now directly precedes this section's own heading, per explicit
          instruction. */}
      <section className={`px-6 md:px-12 ${MAP_TRANSITION_PT} bg-[#faf9f6] dark:bg-black`}>
        <div className='max-w-2xl mx-auto text-center'>
          <Reveal>
            <RouteLabel>Beach</RouteLabel>
            <ChapterHeading as='h2' italic className='mt-8 md:mt-10'>
              La Cinta – Beautiful Beach, Unbelievable Crowds
            </ChapterHeading>
            <Paragraphs
              className='mt-5 text-center'
              items={[
                'The beach was absolutely beautiful – powdery white sand and warm, shallow turquoise water. It honestly reminded me of the Bahamas.',
              ]}
            />
          </Reveal>
        </div>

        {/* PHOTO -- La Cinta Beach with Tavolara in the background.
            Native 5712x4284 (4:3), same full-width aspect-ratio-box/
            object-cover treatment as every other "main beach photo" on
            this page (max-w-5xl md:max-w-3xl, aspect-[4/3] md:aspect-
            [16/9]). Placed after the second paragraph, per explicit
            instruction. */}
        <Reveal className='mt-10 md:mt-12 max-w-5xl md:max-w-3xl mx-auto'>
          <div className='relative w-full overflow-hidden rounded-[2px] aspect-[4/3] md:aspect-[16/9]'>
            <Image
              src='/2025-07%20-%20Sardinia/La%20Cinca_Tavolara_web.jpeg'
              alt='La Cinta Beach, with turquoise water and Tavolara visible in the distance.'
              fill
              sizes='(min-width: 1024px) 1024px, 100vw'
              className='object-cover'
            />
          </div>
          <p className='mt-3 text-center text-sm italic font-[family-name:var(--font-poppins)] text-black/55 dark:text-white/55'>
            La Cinta Beach, with Tavolara in the distance.
          </p>
        </Reveal>

        <div className='max-w-2xl mx-auto text-center'>
          <Reveal className='mt-10 md:mt-12'>
            <Paragraphs
              className='text-center'
              items={[
                "The beach was incredibly crowded, and the intense July heat didn't help. There's no natural shade, so an umbrella is essential. You can rent sunbeds with umbrellas or buy your own umbrella and beach mat from vendors. Some also offer hair braiding.",
              ]}
            />
          </Reveal>
        </div>

        {/* VIDEO -- La Cinta Beach, crowds and water. Original source is
            HEVC (not browser-safe), re-encoded to H.264/AAC 1280x720,
            crf 26, same settings used sitewide -- native 16:9, so the
            standard aspect-[16/9]/max-w-3xl/object-cover treatment
            crops nothing. Original audio track kept (not muted), full
            original duration preserved. Native controls, no autoplay,
            same as every other video on the site. Placed after the
            crowds/heat paragraph, per explicit instruction. */}
        <Reveal className='mt-10 md:mt-12 max-w-3xl mx-auto'>
          <div className='relative w-full overflow-hidden rounded-[2px] aspect-[16/9]'>
            <video
              src='/2025-07%20-%20Sardinia/La%20Cinca_web.mp4'
              controls
              playsInline
              preload='metadata'
              poster='/2025-07%20-%20Sardinia/La%20Cinca_poster.jpg'
              aria-label='Video of La Cinta Beach, showing the turquoise water and the crowded sand.'
              className='absolute inset-0 h-full w-full object-cover'
            />
          </div>
          <p className='mt-3 text-center text-sm italic font-[family-name:var(--font-poppins)] text-black/55 dark:text-white/55'>
            La Cinta in July – beautiful water, but far too crowded for
            us.
          </p>
        </Reveal>

        <div className='max-w-2xl mx-auto text-center'>
          <Reveal className='mt-10 md:mt-12 pb-12 md:pb-14'>
            <Paragraphs
              className='text-center'
              items={[
                "La Cinta reminded us of the beautiful beaches we'd experienced in the Bahamas. The sand and turquoise water were stunning, but with so many people around, it wasn't quite as relaxing as we'd hoped.",
              ]}
            />
          </Reveal>
        </div>
      </section>

      {/* 18. GULF OF OROSEI -- a standalone boat-trip chapter, added
          right after La Cinta (text -> chapter transition, full
          CHAPTER_GAP_START on top). RouteLabel uses the place name
          "Gulf of Orosei", same convention as Tavolara/Agrisole/Palau
          (an excursion chapter, not a beach-stop chapter). No map, no
          My Tip box, per explicit scope.

          Layout now follows the actual order of the boat trip, per
          explicit instruction, rather than the original paragraph-by-
          paragraph media plan: paragraph 1 (the drive/parking), the
          GetYourGuide card placed "between the introductory text and
          the excursion experience" with its own price panel immediately
          after it; the Cala Luna paragraph with its own photo; the
          coastline/sea-caves/Cala-Mariolu-beach paragraph, followed by
          the Gulf of Orosei coastline photo (a rocky coastal opening
          seen from the water -- NOT one of the dark sea caves the
          skipper took the boat into, so it must never be captioned or
          described as one) and then the Cala Mariolu photo (moved here
          from its original position directly under the chapter heading,
          since chronologically Cala Mariolu came after the coastline/
          caves stretch, not before it); the Cala Goloritzè paragraph
          with the Cala Goloritzè video (its own audio track removed
          entirely per explicit instruction -- muted at the file level,
          not just in the player); and finally the closing paragraph
          about the last beach stop and the rain.

          The Cala Mariolu video that originally sat next to the Cala
          Goloritzè video was removed in an earlier edit and must not be
          reintroduced -- there is no video for Cala Mariolu any more,
          only the one photo.

          Media notes: Hero.jpeg (the Cala Mariolu photo) and Cala
          Luna.jpeg are real 4:3 sources, so they use the standard
          aspect-ratio-box/object-cover full-width treatment (max-w-5xl
          md:max-w-3xl) used for every other full-width beach photo on
          the page -- no cropping beyond the normal 4:3/16:9 box. Gulf of
          Orosei.JPG is a real portrait 9:16 source, enlarged ~25-30%
          from this page's usual 280/320px portrait container to
          360/400px per explicit instruction, still shown uncropped at
          its native ratio. The Cala Goloritze video is a real portrait
          9:16 source, originally HEVC, re-encoded to H.264/AAC for
          browser compatibility, same narrower native-ratio portrait
          treatment as Road to Liscia Ruja's own portrait video, so
          nothing is cropped. The GetYourGuide screenshot uses the same
          narrow native-ratio screenshot treatment as Tavolara's own
          GYG card, so its text stays readable.

          This is now the page's final section, so its closing
          paragraph carries the sitewide final-section closing padding
          (CHAPTER_GAP_END's own value plus 50px -- the same formula
          La Cinta's disclaimer used to carry) instead of the plain
          closing spacing used between two mid-page chapters. */}
      {/* MAP -- Casagliana Suite Resort -> Cala Gonone (Gulf of Orosei
          boat trip). Moved here, immediately before the Gulf of Orosei
          section's own RouteLabel/heading, per explicit instruction --
          same bare JourneyMapScene component, full width and sizing
          convention as every other route map on the page. */}
      <JourneyMapScene
        routeCache={SARDINIA_ROUTE_CACHE}
        journey={SARDINIA_CASAGLIANA_TO_CALA_GONONE_JOURNEY}
        heightClassName='h-[420px] sm:h-[480px] md:h-[560px]'
      />

      {/* GULF OF OROSEI -- now a map -> content transition
          (MAP_TRANSITION_PT on top) rather than text -> chapter, since
          the route map above now directly precedes this section's own
          heading, per explicit instruction. */}
      <section className={`px-6 md:px-12 ${MAP_TRANSITION_PT} bg-[#faf9f6] dark:bg-black`}>
        <div className='max-w-2xl mx-auto text-center'>
          <Reveal>
            <RouteLabel>Gulf of Orosei</RouteLabel>
            <ChapterHeading as='h2' italic className='mt-8 md:mt-10'>
              Gulf of Orosei – Another Beautiful Boat Trip
            </ChapterHeading>
          </Reveal>
        </div>

        <div className='max-w-2xl mx-auto text-center'>
          <Reveal className='mt-10 md:mt-12'>
            <Paragraphs
              className='text-center'
              items={[
                'We had an early start and a longer drive to Cala Gonone, so we skipped breakfast at our hotel. Arriving early paid off — we found parking near the marina and paid through EasyPark.',
              ]}
            />
          </Reveal>
        </div>

        {/* GETYOURGUIDE CARD -- placed between the introductory text
            and the excursion experience, per explicit instruction.
            Tall portrait screenshot, same narrow native-ratio treatment
            as Tavolara's own GYG card so the excursion name and rating
            stay readable. */}
        <Reveal className='mt-10 md:mt-12 max-w-[300px] sm:max-w-[360px] mx-auto'>
          <Image
            src='/2025-07%20-%20Sardinia/GYG%20Gulf%20of%20Orosei_web.jpeg'
            alt='A screenshot of the Gulf of Orosei boat tour booking on GetYourGuide, showing the excursion name and rating.'
            width={1133}
            height={1513}
            sizes='360px'
            className='w-full h-auto rounded-[2px] shadow-sm'
          />
          <p className='mt-3 text-center text-sm italic font-[family-name:var(--font-poppins)] text-black/55 dark:text-white/55'>
            The Gulf of Orosei boat trip we booked through GetYourGuide.
          </p>
        </Reveal>

        {/* EXCURSION PRICE -- what we actually paid for this
            GetYourGuide booking, placed near the GYG card per explicit
            instruction. Total paid is the dominant TimeStamp value,
            same visual-focus convention as every other price panel on
            the page. */}
        <div className='max-w-2xl mx-auto text-center'>
          <Reveal className='mt-9 md:mt-11 mx-auto max-w-[460px] rounded-[3px] bg-[#f1ebdc] dark:bg-white/[0.04] px-8 py-8 md:px-9 md:py-9 flex flex-col items-center gap-1 text-center'>
            <span className='text-xs uppercase tracking-[0.18em] font-[family-name:var(--font-poppins)] font-semibold text-black/45 dark:text-white/45'>
              GetYourGuide · Gulf of Orosei Boat Trip
            </span>
            <span className='mt-3 text-sm font-[family-name:var(--font-poppins)] text-black/60 dark:text-white/60'>
              6 July 2025 · Departing Cala Gonone
            </span>
            <span className='mt-4 text-xs uppercase tracking-[0.18em] font-[family-name:var(--font-poppins)] font-semibold text-black/45 dark:text-white/45'>
              2 Adults + 2 Children
            </span>
            <TimeStamp size='md'>€352.00</TimeStamp>
            <span className='mt-4 text-sm font-[family-name:var(--font-poppins)] text-black/60 dark:text-white/60'>
              €88.00 per person
            </span>
          </Reveal>

          <Reveal className='mt-10 md:mt-12'>
            <Paragraphs
              className='text-center'
              items={[
                "Our first stop was Cala Luna, known for its impressive caves along the beach. We arrived before the crowds and had the chance to explore them in peace. The beach itself wasn't our favourite, but the caves were definitely worth seeing.",
              ]}
            />
          </Reveal>
        </div>

        {/* CALA LUNA PHOTO -- the caves along the beach. Real 4:3
            source (5712x4284), same full-width treatment as the hero
            photo above. Placed with the Cala Luna paragraph, per
            explicit instruction. */}
        <Reveal className='mt-10 md:mt-12 max-w-5xl md:max-w-3xl mx-auto'>
          <div className='relative w-full overflow-hidden rounded-[2px] aspect-[4/3] md:aspect-[16/9]'>
            <Image
              src='/2025-07%20-%20Sardinia/Cala%20Luna_web.jpeg'
              alt='The large caves along the beach at Cala Luna.'
              fill
              sizes='(min-width: 1024px) 1024px, 100vw'
              className='object-cover'
            />
          </div>
          <p className='mt-3 text-center text-sm italic font-[family-name:var(--font-poppins)] text-black/55 dark:text-white/55'>
            The caves at Cala Luna.
          </p>
        </Reveal>

        <div className='max-w-2xl mx-auto text-center'>
          <Reveal className='mt-10 md:mt-12'>
            <Paragraphs
              className='text-center'
              items={[
                'We continued along the coastline, passing numerous sea caves. Our skipper even took us inside some of them with the boat. Along the way, we stopped for a swim in the beautiful turquoise water and also visited Cala Mariolu beach.',
              ]}
            />
          </Reveal>
        </div>

        {/* GULF OF OROSEI PHOTO -- a rocky coastal opening, shot from
            the water. This is NOT one of the dark sea caves the skipper
            took the boat into (mentioned in the paragraph above) -- it
            must never be captioned or described as one. Real portrait
            9:16 source (1980x3520), shown uncropped in a narrower box,
            same native-ratio treatment already used for Road to Liscia
            Ruja's own portrait video. Placed after the coastline/sea-
            caves/Cala-Mariolu-beach paragraph and before the Cala
            Mariolu photo, per explicit instruction reflecting the
            actual order of the boat trip. */}
        {/* Enlarged ~25-30% from the page's usual 280/320px portrait
            container (360/400px here) so this photo reads as a more
            deliberate, larger presence than the same-sized video right
            below it, per explicit instruction. Still the same native
            720x1280 source at its real aspect ratio (w-full h-auto, no
            crop), still centered via mx-auto, and `sizes` raised to
            match the new largest rendered width. */}
        <Reveal className='mt-10 md:mt-12 max-w-[360px] sm:max-w-[400px] mx-auto'>
          <Image
            src='/2025-07%20-%20Sardinia/Gulf%20of%20Orosei_web.jpeg'
            alt='The dramatic cliffs and coastline of the Gulf of Orosei, seen from the boat.'
            width={720}
            height={1280}
            sizes='400px'
            className='w-full h-auto rounded-[2px]'
          />
          <p className='mt-3 text-center text-sm italic font-[family-name:var(--font-poppins)] text-black/55 dark:text-white/55'>
            The dramatic coastline of the Gulf of Orosei.
          </p>
        </Reveal>

        {/* CALA MARIOLU PHOTO -- moved here from directly under the
            chapter heading, per explicit instruction: chronologically
            Cala Mariolu beach was reached after the coastline/sea-caves
            stretch above, not before it, so it now sits right after
            that photo and after the paragraph ending "...and also
            visited Cala Mariolu beach." Same real 4:3 source
            (5712x4284), same full-width aspect-ratio-box/object-cover
            treatment, same caption, same size -- unchanged other than
            its position. */}
        <Reveal className='mt-10 md:mt-12 max-w-5xl md:max-w-3xl mx-auto'>
          <div className='relative w-full overflow-hidden rounded-[2px] aspect-[4/3] md:aspect-[16/9]'>
            <Image
              src='/2025-07%20-%20Sardinia/Hero_web.jpeg'
              alt='Cala Mariolu, with its clear turquoise water, in the Gulf of Orosei.'
              fill
              sizes='(min-width: 1024px) 1024px, 100vw'
              className='object-cover'
            />
          </div>
          <p className='mt-3 text-center text-sm italic font-[family-name:var(--font-poppins)] text-black/55 dark:text-white/55'>
            Cala Mariolu, with its clear turquoise water.
          </p>
        </Reveal>

        <div className='max-w-2xl mx-auto text-center'>
          <Reveal className='mt-10 md:mt-12'>
            <Paragraphs
              className='text-center'
              items={[
                "We then passed the famous Cala Goloritzè, considered one of Sardinia's most beautiful beaches. Boats aren't allowed to approach the shore, but we stopped nearby for a swim. The water here had yet another incredible shade of turquoise.",
              ]}
            />
          </Reveal>
        </div>

        {/* CALA GOLORITZE VIDEO -- real portrait 9:16 source
            (1080x1920), originally HEVC, re-encoded to H.264/AAC
            720x1280 for browser compatibility and file size, original
            audio and duration kept. Kept in its original portrait
            format with a short caption, per explicit instruction; the
            Cala Mariolu video that previously sat above it was removed
            in the same edit. Placed with the paragraph about passing
            Cala Goloritzè and stopping nearby for a swim. */}
        <Reveal className='mt-10 md:mt-12 max-w-[280px] sm:max-w-[320px] mx-auto'>
          <div className='relative w-full overflow-hidden rounded-[2px] aspect-[9/16]'>
            <video
              src='/2025-07%20-%20Sardinia/Cala%20Goloritze_web.mp4'
              controls
              playsInline
              preload='metadata'
              poster='/2025-07%20-%20Sardinia/Cala%20Goloritze_poster.jpg'
              aria-label='Video of swimming near Cala Goloritze.'
              className='absolute inset-0 h-full w-full object-cover'
            />
          </div>
          <p className='mt-3 text-center text-sm italic font-[family-name:var(--font-poppins)] text-black/55 dark:text-white/55'>
            Near Cala Goloritzè
          </p>
        </Reveal>

        <div className='max-w-2xl mx-auto text-center'>
          {/* FINAL BEACH STOP PARAGRAPH -- no longer the page's final
              piece of content now that the closing note below has been
              added, so this carries the plain CHAPTER_GAP_END closing
              spacing instead of the special final-section padding
              (which moved to the new closing section). */}
          <Reveal className='mt-10 md:mt-12 pb-12 md:pb-14'>
            <Paragraphs
              className='text-center'
              items={[
                'On our way back, we enjoyed the beautiful coastline, with our skipper happy to stop wherever we wanted for a swim or a beach visit. We returned to Cala Luna, which was now much busier. Soon, it started raining, and boats began collecting people from the beaches. Back in the harbour, we found the streets flooded after the heavy downpour. Quite an unexpected end to our boat trip!',
              ]}
            />
          </Reveal>
        </div>
      </section>

      {/* COSTA SMERALDA -- Cala Brandinchi (a change of plans, never
          visited) and Porto Cervo (a day trip we did take), added per
          explicit instruction. New chapter (full CHAPTER_GAP_START on
          top, pairing with the Gulf of Orosei chapter's own closing
          padding above). "Costa Smeralda" is the real name of this
          stretch of coast covering both places, used as the umbrella
          RouteLabel rather than inventing a new one; Porto Cervo gets
          its own Eyebrow + ChapterHeading h3 sub-beat below, same
          pattern as the La Maddalena Archipelago chapter's own stops.
          No cost box for Porto Cervo, per explicit instruction -- the
          garage's posted rate stays as plain prose, same as given. */}
      <section className={`px-6 md:px-12 ${CHAPTER_GAP_START} ${CHAPTER_GAP_END} bg-[#faf9f6] dark:bg-black`}>
        <div className='max-w-2xl mx-auto text-center'>
          <Reveal>
            <RouteLabel>Costa Smeralda</RouteLabel>
            <ChapterHeading as='h2' italic className='mt-8 md:mt-10'>
              Cala Brandinchi – Our Change of Plans
            </ChapterHeading>
            <Paragraphs
              className='mt-5 text-center'
              items={[
                'We had planned to visit Cala Brandinchi, but the regular beach reservations were already fully booked. There was another option to reserve beach spots for €80 for our family of four, with access wristbands included.',
                "Since we usually spend only 2–3 hours at a beach rather than the entire day, we decided it wasn't worth the cost.",
              ]}
            />
          </Reveal>
        </div>

        {/* MAP -- Casagliana Suite Resort -> Porto Cervo. Moved here,
            immediately before Porto Cervo's own Eyebrow + h3 heading,
            per explicit instruction -- same bare JourneyMapScene
            component and sizing convention as every other route map on
            the page. Porto Cervo is a sub-beat within this shared Costa
            Smeralda section rather than its own top-level section (left
            unchanged, per explicit "no unrelated layout changes"
            instruction), so the wrapper below cancels the section's own
            px-6/md:px-12 side padding with matching negative margins
            (-mx-6/md:-mx-12) -- the map still reads edge-to-edge, same
            as the other five, rather than inset inside the text
            column. */}
        <div className='mt-10 md:mt-12 md:-mx-12 -mx-6'>
          <JourneyMapScene
            routeCache={SARDINIA_ROUTE_CACHE}
            journey={SARDINIA_CASAGLIANA_TO_PORTO_CERVO_JOURNEY}
            heightClassName='h-[380px] sm:h-[440px] md:h-[500px]'
          />
        </div>

        <div className='max-w-2xl mx-auto text-center'>
          <Reveal className='mt-10 md:mt-12 max-w-xl mx-auto'>
            <ChapterHeading as='h3' italic>
              Porto Cervo
            </ChapterHeading>
            <Paragraphs
              className='mt-5 text-center'
              items={[
                'The following day, we headed to Porto Cervo and explored Promenade du Port. What impressed me most was how beautifully maintained everything was, from the buildings and gardens to the surrounding streets. It was surprisingly quiet during the day, with hardly anyone around.',
                "We didn't do any shopping, but we stopped for ice cream. Both the ice cream and parking at the Promenade du Port garage were noticeably more expensive than elsewhere in Sardinia.",
              ]}
            />
          </Reveal>
        </div>

        {/* PHOTO 1 -- Porto Cervo.jpeg, the pink building with flowers.
            Real EXIF orientation is portrait (3:4 once rotated for
            display, confirmed via the file's own orientation tag), so
            it's shown in a 3:4 box -- an exact match for its true
            proportions, not a crop. */}
        <Reveal className='mt-10 md:mt-12 max-w-md mx-auto'>
          <div className='relative w-full overflow-hidden rounded-[2px] aspect-[3/4]'>
            <Image
              src='/2025-07%20-%20Sardinia/Porto%20Cervo.jpeg'
              alt='A pink building decorated with flowers in Porto Cervo.'
              fill
              sizes='(min-width: 1024px) 480px, 100vw'
              className='object-cover'
            />
          </div>
          <p className='mt-3 text-center text-sm italic font-[family-name:var(--font-poppins)] text-black/55 dark:text-white/55'>
            A pink building with flowers, Porto Cervo.
          </p>
        </Reveal>
      </section>

      {/* MAP -- Casagliana Suite Resort -> Porto Istana. Moved here,
          immediately before the Porto Istana section's own RouteLabel/
          heading, per explicit instruction -- same bare JourneyMapScene
          component, full width and sizing convention as every other
          route map on the page. */}
      <JourneyMapScene
        routeCache={SARDINIA_ROUTE_CACHE}
        journey={SARDINIA_CASAGLIANA_TO_PORTO_ISTANA_JOURNEY}
        heightClassName='h-[380px] sm:h-[440px] md:h-[500px]'
      />

      {/* PORTO ISTANA -- the final beach stop of the trip. Now a map ->
          content transition (MAP_TRANSITION_PT on top) rather than text
          -> chapter, since the route map above now directly precedes
          this section's own heading, per explicit instruction. Same
          "Beach" (singular) RouteLabel convention as the other
          beach-stop chapters (Spiaggia del Principe, Liscia Ruja, La
          Cinta). Only
          one photo, per explicit scope (no earlier Porto Istana photos
          or parking-screenshot images included).
          UPDATE: the individual parking-price Fact panel and its rate-
          caveat note were removed per explicit instruction (parking
          cost now lives only in the general "Parking in Sardinia"
          section after Renting a Car). Paragraphs now flow straight
          into the PHOTO below. */}
      <section className={`px-6 md:px-12 ${MAP_TRANSITION_PT} ${CHAPTER_GAP_END} bg-[#faf9f6] dark:bg-black`}>
        <div className='max-w-2xl mx-auto text-center'>
          <Reveal>
            <RouteLabel>Beach</RouteLabel>
            <ChapterHeading as='h2' italic className='mt-8 md:mt-10'>
              Porto Istana – Beautiful Beach, Mixed Experience
            </ChapterHeading>
            <Paragraphs
              className='mt-5 text-center'
              items={[
                'On our last day in Sardinia, we visited Porto Istana. The beach itself is beautiful, with soft sand, shallow water and crystal-clear sea.',
                "Unfortunately, our experience wasn't quite as lovely. Something kept nipping at us in the water – possibly small fish, although we're not sure. At one point, the wind blew our beach umbrella away, and a nearby beachgoer got quite angry with us.",
                "Despite how beautiful the beach was, we didn't feel particularly comfortable there and decided not to stay long.",
              ]}
            />
          </Reveal>

        </div>

        {/* PHOTO -- Porto Istana.jpg, the final selected photograph.
            Real pixel ratio is ~1.1:1 (4737x4281, no EXIF rotation
            needed) -- not a clean 4:3 or 16:9, so per the same
            "no-awkward-cropping" convention already used for the
            Tavolara chapter's own off-ratio photos, this uses native
            width/height + w-full h-auto (uncropped) instead of an
            aspect-ratio box. */}
        <Reveal className='mt-10 md:mt-12 max-w-2xl mx-auto'>
          <Image
            src='/2025-07%20-%20Sardinia/Porto%20Istana.jpg'
            alt='The sandy beach and shallow, crystal-clear water at Porto Istana.'
            width={4737}
            height={4281}
            sizes='(min-width: 1024px) 672px, 100vw'
            className='w-full h-auto rounded-[2px]'
          />
          <p className='mt-3 text-center text-sm italic font-[family-name:var(--font-poppins)] text-black/55 dark:text-white/55'>
            Porto Istana, near Olbia.
          </p>
        </Reveal>
      </section>

      {/* MY FINAL THOUGHTS ON SARDINIA -- a closing reflection, added per
          explicit instruction. Positioned after Porto Istana (the last
          beach stop chronologically) and before the final "BOOKED BEFORE
          WE LEFT" checklist section -- NOT the page's final content
          section (that checklist, added later per explicit instruction,
          replaced the old "More of Sardinia coming soon!" placeholder
          that used to close the page).
          Same RouteLabel + ChapterHeading + Paragraphs pattern as every
          other Sardinia chapter; "Sardinia" is reused as the eyebrow
          (rather than a route segment) since this isn't a route chapter,
          same as the opening "Why Sardinia?" chapter above. Photo -> new
          chapter spacing on top (CHAPTER_GAP_START, pairing with Porto
          Istana's own CHAPTER_GAP_END), text -> new chapter spacing on
          the bottom (CHAPTER_GAP_END, pairing with CLOSING NOTE's own
          CHAPTER_GAP_START) -- both tokens share the same value, so this
          reads correctly either way per the site's three-transition-type
          system. No new map, per explicit instruction.
          Four photos, each placed directly after the paragraph it
          illustrates, alternating text/photo the same way the Gulf of
          Orosei chapter above does -- kept to modest, non-full-width
          sizes (max-w-xl/max-w-sm, not the max-w-5xl "main photo"
          treatment used for a chapter's single definitive image) so four
          photos in one chapter don't make it feel oversized. Sardinia
          nature.jpeg (clean 4:3, no EXIF rotation) and Sardinia_pizza.jpg
          (off-ratio ~1.8:1, shown uncropped at native size per the
          established "no-awkward-cropping" convention) are landscape;
          Sardinia from air.jpeg (EXIF orientation 6 -- raw pixels are
          5712x4284 landscape, but the real photo, once rotated for
          display the way Next/Image's sharp optimiser and every browser
          already do automatically, is a genuine 4284x5712 portrait shot
          out of an aircraft window, confirmed by actually viewing the
          rendered/rotated image, not just trusting the EXIF tag blindly)
          and Sardinia_trash.jpg (near-square, ~1980x1975, shown uncropped
          at native size, same off-ratio convention) are both shown
          narrower accordingly.
          The food paragraph carries one inline link, same ReactNode-item
          + <Link> pattern already used for an in-paragraph link elsewhere
          on the site (app/rome/page.tsx's Barcelona mention) -- not the
          separate "Curious how we did it?" CTA block used on
          app/barcelona/page.tsx, since the instruction was to link the
          exact words "how I use AI to discover restaurants" inline
          within the paragraph itself. The target URL,
          /behind-the-trip/how-we-find-restaurants, was found in the
          project (app/behind-the-trip/[topic]/page.tsx,
          lib/behind-the-trip.ts, app/sitemap.ts, and this exact link
          already in use on app/barcelona/page.tsx) rather than invented. */}
      <section className={`px-6 md:px-12 ${CHAPTER_GAP_START} ${CHAPTER_GAP_END} bg-[#faf9f6] dark:bg-black`}>
        <div className='max-w-2xl mx-auto text-center'>
          <Reveal>
            <RouteLabel>Sardinia</RouteLabel>
            <ChapterHeading as='h2' italic className='mt-8 md:mt-10'>
              My Final Thoughts on Sardinia
            </ChapterHeading>
            <Paragraphs
              className='mt-5 text-center'
              items={[
                "Having visited the Seychelles, Maldives and Bahamas, I can confidently say that Sardinia has it all when it comes to beautiful beaches. They're every bit as stunning as the Instagram photos suggest.",
                'What surprised me from the moment we arrived was the landscape. The enormous granite rocks reminded me so much of the Seychelles, only surrounded by Mediterranean vegetation.',
              ]}
            />
          </Reveal>
        </div>

        {/* PHOTO -- Sardinia nature.jpeg, the granite rocks, alongside
            the paragraph comparing them to the Seychelles. Clean native
            4:3 (4032x3024, no EXIF rotation), so the standard
            aspect-[4/3]/object-cover box is an exact match, not a crop. */}
        <Reveal className='mt-10 md:mt-12 max-w-xl mx-auto'>
          <div className='relative w-full overflow-hidden rounded-[2px] aspect-[4/3]'>
            <Image
              src='/2025-07%20-%20Sardinia/Sardinia%20nature.jpeg'
              alt='Granite rock formations surrounded by Mediterranean vegetation in Sardinia.'
              fill
              sizes='(min-width: 768px) 576px, 100vw'
              className='object-cover'
            />
          </div>
          <p className='mt-3 text-center text-sm italic font-[family-name:var(--font-poppins)] text-black/55 dark:text-white/55'>
            Sardinia&apos;s rocky landscape and Mediterranean vegetation.
          </p>
        </Reveal>

        <div className='max-w-2xl mx-auto text-center'>
          <Reveal className='mt-10 md:mt-12'>
            <Paragraphs
              className='text-center'
              items={[
                "My biggest recommendation? Explore Sardinia by boat. Some of the most spectacular beaches aren't accessible directly by car, and those that are can get incredibly crowded. La Cinta is a perfect example – absolutely beautiful, but packed with people. After seeing the crowds, I can understand why some beaches have introduced reservation systems.",
              ]}
            />
          </Reveal>
        </div>

        {/* PHOTO -- Sardinia from air.jpeg, alongside the paragraph about
            beautiful but crowded beaches. Real display orientation is
            portrait (EXIF orientation 6 rotates the raw 5712x4284
            landscape pixels to a true 4284x5712 / 3:4 shot -- confirmed
            by viewing the actual rotated image, not just the tag), so
            it's shown narrower, in a 3:4 box. */}
        <Reveal className='mt-10 md:mt-12 max-w-xs sm:max-w-sm mx-auto'>
          <div className='relative w-full overflow-hidden rounded-[2px] aspect-[3/4]'>
            <Image
              src='/2025-07%20-%20Sardinia/Sardinia%20from%20air.jpeg'
              alt='An aerial view of La Cinta beach and its turquoise bay, seen from the plane window.'
              fill
              sizes='(min-width: 640px) 384px, 100vw'
              className='object-cover'
            />
          </div>
          <p className='mt-3 text-center text-sm italic font-[family-name:var(--font-poppins)] text-black/55 dark:text-white/55'>
            La Cinta from above.
          </p>
        </Reveal>

        <div className='max-w-2xl mx-auto text-center'>
          <Reveal className='mt-10 md:mt-12'>
            <Paragraphs
              className='text-center'
              items={[
                <>
                  When it came to food, we looked for small local places
                  where we could try traditional Italian and Sardinian
                  dishes. I&apos;ve also shared{' '}
                  <Link
                    href='/behind-the-trip/how-we-find-restaurants'
                    className='text-pink-500 dark:text-pink-300 no-underline decoration-pink-500/50 dark:decoration-pink-300/50 underline-offset-4 hover:underline transition-colors'
                  >
                    how I use AI to discover restaurants →
                  </Link>{' '}
                  while travelling.
                </>,
              ]}
            />
          </Reveal>
        </div>

        {/* PHOTO -- Sardinia_pizza.jpg, alongside the paragraph about
            finding local food. Off-ratio (4967x2765, ~1.8:1, no EXIF
            rotation) -- not a clean 4:3 or 16:9, so per the established
            "no-awkward-cropping" convention, shown uncropped at native
            size instead of forced into an aspect-ratio box. */}
        <Reveal className='mt-10 md:mt-12 max-w-xl mx-auto'>
          <Image
            src='/2025-07%20-%20Sardinia/Sardinia_pizza.jpg'
            alt='A pizza counter in Sardinia, with several freshly baked pizzas on display.'
            width={4967}
            height={2765}
            sizes='(min-width: 768px) 576px, 100vw'
            className='w-full h-auto rounded-[2px]'
          />
          <p className='mt-3 text-center text-sm italic font-[family-name:var(--font-poppins)] text-black/55 dark:text-white/55'>
            A selection of pizzas at a local takeaway in Sardinia.
          </p>
        </Reveal>

        <div className='max-w-2xl mx-auto text-center'>
          <Reveal className='mt-10 md:mt-12'>
            <Paragraphs
              className='text-center'
              items={[
                'But there was one thing that really disappointed me: the rubbish along the roads. We repeatedly saw piles of waste and entire bags of rubbish dumped by the roadside. It was upsetting to see in such a beautiful destination.',
              ]}
            />
          </Reveal>
        </div>

        {/* PHOTO -- Sardinia_trash.jpg, alongside the paragraph about
            roadside rubbish. Near-square (1980x1975, ~1:1, no EXIF
            rotation) -- not a clean standard ratio, so shown uncropped
            at native size, same convention as the pizza photo above,
            narrower to suit its square shape. */}
        <Reveal className='mt-10 md:mt-12 max-w-xs sm:max-w-sm mx-auto'>
          <Image
            src='/2025-07%20-%20Sardinia/Sardinia_trash.jpg'
            alt='Piles of rubbish dumped along a roadside in Sardinia.'
            width={1980}
            height={1975}
            sizes='(min-width: 640px) 384px, 100vw'
            className='w-full h-auto rounded-[2px]'
          />
          <p className='mt-3 text-center text-sm italic font-[family-name:var(--font-poppins)] text-black/55 dark:text-white/55'>
            Rubbish dumped along a roadside in Sardinia.
          </p>
        </Reveal>

        <div className='max-w-2xl mx-auto text-center'>
          <Reveal className='mt-10 md:mt-12'>
            <Paragraphs
              className='text-center'
              items={[
                "Despite that, Sardinia genuinely impressed me. You don't have to fly halfway around the world to find incredible beaches – sometimes they're much closer than you think.",
              ]}
            />
          </Reveal>
        </div>
      </section>

      {/* BOOKED BEFORE WE LEFT -- the same reusable pre-trip checklist
          component Tenerife and Barcelona use (components/ui/booked-
          checklist.tsx): centred RouteLabel (pink line + uppercase
          label), then the component's own small pink-checkmark list --
          no new styling introduced here, per explicit instruction to
          reuse the existing component and design. Replaces the old
          "More of Sardinia coming soon!" closing note entirely -- this
          is now the page's final content, sitting directly above the
          footer, the same layout shape as Tenerife's and Barcelona's
          own closing sections. Top padding is CHAPTER_GAP_START alone
          (text -> new chapter, following the previous chapter's final
          paragraph), bottom is the same one-off CHAPTER_GAP_END +50px
          override Tenerife and Barcelona both use, since this section
          sits directly against the dark footer rather than another
          cream section -- byte-identical spacing to both, so the gap
          above the footer matches across all three pages. */}
      <section className={`px-6 md:px-12 ${CHAPTER_GAP_START} pb-[calc(3rem+50px)] md:pb-[calc(3.5rem+50px)] bg-[#faf9f6] dark:bg-black`}>
        <Reveal className='mx-auto'>
          <BookedChecklist
            items={[
              'Flights',
              'Airport parking in Vienna',
              'Accommodation',
              'Car rental',
              'La Maddalena boat tour',
              'Tavolara boat trip',
              'Gulf of Orosei boat trip',
            ]}
          />
        </Reveal>
      </section>

      <footer className='flex flex-col items-center px-8 py-10 md:py-12 bg-[#2a2a2a] text-white text-center'>
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
          <Link
            href='/#travels'
            className='inline-flex items-center px-2 text-sm font-[family-name:var(--font-poppins)] uppercase tracking-wide text-white/80 hover:text-white whitespace-nowrap'
          >
            Travels
          </Link>
          <Link
            href='/#guides'
            className='inline-flex items-center px-2 text-sm font-[family-name:var(--font-poppins)] uppercase tracking-wide text-white/80 hover:text-white whitespace-nowrap'
          >
            Behind the Trip
          </Link>
          <Link
            href='/about'
            className='inline-flex items-center px-2 text-sm font-[family-name:var(--font-poppins)] uppercase tracking-wide text-white/80 hover:text-white whitespace-nowrap'
          >
            About
          </Link>
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
