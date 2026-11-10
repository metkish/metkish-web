'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import JourneyMapScene from '@/components/journey/JourneyMapScene';
import { RouteLabel, TimeStamp } from '@/components/journey/annotation-kit';
import { InstagramIcon, PinterestIcon } from '@/components/ui/social-icons';
import { INSTAGRAM_URL, PINTEREST_URL } from '@/lib/social-links';
import {
  ROME_HOME_TO_TRIESTE_JOURNEY,
  ROME_TRIESTE_TO_ROME_TRAIN_JOURNEY,
} from '@/lib/journeys/rome';

const LOGO_SRC = '/metkish-logo.png';

// Map->content pause, used verbatim after both maps on this page (same
// token every other destination page uses between a JourneyMapScene and
// the text that follows it -- see app/tenerife/page.tsx's own comment).
const MAP_TRANSITION_PT = 'pt-8 md:pt-10';
// Chapter-to-chapter transition spacing, same token/value as every other
// destination page -- goes on the bottom of a section that's ending right
// before a map.
const CHAPTER_GAP_END = 'pb-12 md:pb-14';
// CHAPTER_GAP_START pairs with CHAPTER_GAP_END for a text -> new-chapter
// transition (no map between them) -- same value as every other
// destination page's own CHAPTER_GAP_START. Goes on the top of the
// section that opens the new chapter.
const CHAPTER_GAP_START = 'pt-12 md:pt-14';

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

// A small in-chapter marker -- one notch below RouteLabel: no pink tick,
// used for a beat *within* the "Getting to Rome" chapter (e.g. "By
// Train", "Homeward") rather than for the chapter opener itself, exactly
// the same role/classes as Eyebrow in app/tenerife/page.tsx.
function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <span className='block text-sm md:text-[0.95rem] uppercase tracking-[0.18em] font-[family-name:var(--font-poppins)] font-semibold text-black/60 dark:text-white/60'>
      {children}
    </span>
  );
}

// The one main-editorial-heading scale used throughout the site -- same
// classes as ChapterHeading in app/tenerife/page.tsx and app/barcelona/page.tsx.
function ChapterHeading({
  children,
  italic = false,
  className = '',
  as: Tag = 'p',
}: {
  children: ReactNode;
  italic?: boolean;
  className?: string;
  // Semantic heading level, independent of the (always identical) visual
  // size -- defaults to 'p' so every existing call that doesn't pass `as`
  // renders exactly as before.
  as?: 'p' | 'h1' | 'h2' | 'h3' | 'h4';
}) {
  return (
    <Tag
      className={`text-3xl md:text-4xl font-[family-name:var(--font-playfair)] font-medium text-black dark:text-white ${
        italic ? 'italic' : ''
      } ${className}`}
    >
      {children}
    </Tag>
  );
}

// items accepts ReactNode (not just string) so a paragraph can carry one
// inline <strong> emphasis (e.g. "our departure station.") without a
// separate oversized/italic standalone-line treatment -- per the
// editorial-cleanup brief's "no oversized bold or italic statements,
// no decorative standalone sentences" rule, emphasis now lives inline,
// at the same size and weight as the surrounding copy.
function Paragraphs({
  items,
  className = '',
}: {
  items: ReactNode[];
  className?: string;
}) {
  return (
    <div className={`space-y-4 ${className}`}>
      {items.map((text, i) => (
        <p
          key={i}
          className='text-base md:text-lg font-[family-name:var(--font-poppins)] font-light text-black/80 dark:text-white/80 leading-relaxed'
        >
          {text}
        </p>
      ))}
    </div>
  );
}

// Same "My tip" treatment used throughout the site (Barcelona's own
// InlineTip, copied here verbatim rather than imported, same spirit as
// every other small one-off presentational helper on these pages): a
// thin pink left rule, left-aligned italic text, no label, no background.
function InlineTip({ children }: { children: ReactNode }) {
  return (
    <p className='border-l-2 border-pink-300 dark:border-pink-400/60 pl-4 text-base italic font-[family-name:var(--font-poppins)] font-light text-black/75 dark:text-white/75 leading-relaxed'>
      {children}
    </p>
  );
}

// A compact timeline row for the train journey overview -- its own small
// component since nothing like it exists yet on the site (every other
// page's practical info is a single price/fact, not a multi-leg
// schedule). Deliberately not another bg-[#f1ebdc] card: a vertical list
// of pink dots/connecting line reuses the map's own "small dots, labels"
// visual language instead, so the timeline reads as an extension of the
// route map just above it rather than a second, competing box style.
// Time values use the same Playfair-italic emphasis as TimeStamp, just
// smaller, since a schedule needs many of these side by side rather than
// one dominant figure.
function TimelineLeg({
  fromTime,
  fromStation,
  toTime,
  toStation,
  detail,
  note,
}: {
  fromTime: string;
  fromStation: string;
  toTime: string;
  toStation: string;
  detail: string;
  note?: string;
}) {
  return (
    <div className='flex items-start gap-3'>
      <span className='mt-2 h-2 w-2 rounded-full bg-pink-300 dark:bg-pink-400/70 shrink-0' />
      <div>
        <div className='flex flex-wrap items-baseline gap-x-2'>
          <span className='text-lg md:text-xl font-[family-name:var(--font-playfair)] italic font-medium text-black dark:text-white'>
            {fromTime}
          </span>
          <span className='text-black/35 dark:text-white/35'>&rarr;</span>
          <span className='text-lg md:text-xl font-[family-name:var(--font-playfair)] italic font-medium text-black dark:text-white'>
            {toTime}
          </span>
        </div>
        <p className='mt-1 text-sm font-[family-name:var(--font-poppins)] text-black/70 dark:text-white/70'>
          {fromStation} &rarr; {toStation}
        </p>
        <p className='mt-1 text-xs uppercase tracking-[0.14em] font-[family-name:var(--font-poppins)] font-semibold text-black/45 dark:text-white/45'>
          {detail}
        </p>
        {note && (
          <p className='mt-1 text-xs italic font-[family-name:var(--font-poppins)] text-black/50 dark:text-white/50'>
            {note}
          </p>
        )}
      </div>
    </div>
  );
}

function TimelineTransfer({ children }: { children: ReactNode }) {
  return (
    <div className='pl-5 py-2'>
      <span className='text-xs uppercase tracking-[0.14em] font-[family-name:var(--font-poppins)] font-semibold text-black/40 dark:text-white/40'>
        {children}
      </span>
    </div>
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
          // Mobile performance fix, same recipe validated on Barcelona's
          // hero: quality 65 (down from the default 75) measurably trims
          // this photo's bytes at the sizes a phone actually requests,
          // with no perceptible quality loss -- safe here because the
          // flat bg-black/28 wash below already sits over the whole
          // photo for text legibility, same as Barcelona/Tenerife. The
          // master file (Hero_web.jpeg) was also re-saved at a max width
          // of 3840px (matching the largest responsive size this site
          // ever requests) instead of its original ~4280px, which was
          // larger than any requested size and only added dead weight.
          quality={65}
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

      {/* 3. GETTING TO ROME -- the booking-mistake story, trimmed during
          the editorial-cleanup pass: fewer, longer paragraphs, the
          "Our departure station." standalone pivot line folded into an
          inline <strong> instead (no oversized/italic standalone
          statements), and the parking paragraph beneath the walkway
          photo removed since the story already covers that ground --
          only the pink booking link stays. Same map->content pause as
          every other destination page, and a CHAPTER_GAP_END close
          since the train route map follows directly after this
          section. */}
      <section className={`px-6 md:px-12 ${MAP_TRANSITION_PT} ${CHAPTER_GAP_END} bg-[#faf9f6] dark:bg-black`}>
        <div className='max-w-2xl mx-auto text-center'>
          <Reveal>
            <RouteLabel>Getting to Rome</RouteLabel>
            <ChapterHeading as='h2' italic className='mt-8 md:mt-10'>
              My first train booking mistake
            </ChapterHeading>
            <Paragraphs
              className='mt-5 text-center'
              items={[
                "This trip was a little different from our usual travels. We were travelling in a group of nine, and for once, I wasn't the main organiser.",
                "I helped book our train tickets through Trenitalia. Since we couldn't book all nine passengers together, we used two computers to coordinate the bookings and make sure we had seats close to each other.",
                <>
                  I was so focused on the seating arrangements that I
                  overlooked one rather important detail:{' '}
                  <strong className='font-semibold text-black dark:text-white'>
                    our departure station.
                  </strong>
                </>,
                'I had assumed we were leaving from Trieste city centre and even started looking for parking there. Luckily, I left the actual parking arrangements to someone else in our group.',
                'Otherwise, I might have booked parking in completely the wrong place — or we might have arrived without a parking reservation at all.',
              ]}
            />
          </Reveal>
        </div>

        {/* The Trenitalia screenshot -- small and compact, per the brief,
            showing exactly the three station options (Trieste Airport,
            Trieste Centrale, Trieste Molo Bersaglieri) and nothing else:
            no passenger names, PNR, or QR code in this image. A thin
            border gives a small UI screenshot a visible edge against the
            page's own off-white background. */}
        <Reveal delay={0.15} className='mt-10 md:mt-12 max-w-[300px] sm:max-w-[340px] mx-auto'>
          <Image
            src='/2026-10%20-%20Italy_Rome/Trieste%20departures.png'
            alt='Trenitalia departure-station picker listing Trieste Airport, Trieste Centrale and Trieste Molo Bersaglieri.'
            width={557}
            height={240}
            sizes='340px'
            className='w-full h-auto rounded-[2px] border border-black/10 dark:border-white/10'
          />
          <p className='mt-3 text-center text-sm italic font-[family-name:var(--font-poppins)] text-black/55 dark:text-white/55'>
            Always check which Trieste station you&apos;re departing from.
          </p>
        </Reveal>

        <div className='max-w-2xl mx-auto text-center'>
          <Reveal delay={0.2} className='mt-8 md:mt-10 text-center'>
            <Paragraphs
              items={[
                "It wasn't until we arrived at Trieste Airport that I realised my mistake!",
                'Fortunately, it turned out to be a convenient departure point, with parking and a covered walkway directly connecting the airport to the railway station.',
              ]}
            />
          </Reveal>
        </div>

        {/* The covered walkway -- a medium editorial image, shown
            uncropped at its own real (portrait) proportions rather than
            forced into a landscape box, but width-constrained so it
            stays compact on desktop rather than towering down the page. */}
        <Reveal delay={0.25} className='mt-10 md:mt-12 max-w-xs sm:max-w-sm mx-auto'>
          <Image
            src='/2026-10%20-%20Italy_Rome/Stationi%20di%20treni_web.jpeg'
            alt='The covered pedestrian walkway connecting Trieste Airport to its railway station, signed "Stazione dei treni / Railway station".'
            width={4284}
            height={5712}
            sizes='(min-width: 640px) 384px, 80vw'
            className='w-full h-auto rounded-[2px]'
          />
          <p className='mt-3 text-center text-sm italic font-[family-name:var(--font-poppins)] text-black/55 dark:text-white/55'>
            The covered walkway connecting Trieste Airport to the railway
            station.
          </p>
        </Reveal>

        {/* The parking paragraph that used to sit here is gone -- the
            story above already covers it -- but the booking link itself
            stays, right under the photo it refers to. */}
        <Reveal delay={0.28} className='mt-5 text-center'>
          <a
            href='https://park.triesteairport.it/#/booking'
            target='_blank'
            rel='noopener noreferrer'
            className='inline-block text-base md:text-lg font-[family-name:var(--font-poppins)] font-light text-pink-500 dark:text-pink-300 no-underline decoration-pink-500/50 dark:decoration-pink-300/50 underline-offset-4 hover:underline transition-colors'
          >
            Book parking at Trieste Airport ↗
          </a>
        </Reveal>

        <div className='max-w-2xl mx-auto text-center'>
          {/* The redundant closing line that used to sit here ("What I
              initially thought was a booking mistake actually worked out
              in our favour.") has been removed per the user's request --
              it was inaccurate (the mistake was the station assumption,
              not the booking itself) and repeated what the story above
              already explains. The InlineTip now follows the parking
              link directly, keeping its original spacing. */}
          <Reveal delay={0.3} className='mt-8 md:mt-10 max-w-2xl mx-auto'>
            <InlineTip>
              My tip: Always double-check your exact departure station
              when booking train tickets. Trieste has more than one train
              station, so make sure you check the departure station
              carefully when booking your tickets.
            </InlineTip>
          </Reveal>
        </div>
      </section>

      {/* 4. TRAIN MAP -- Trieste Airport -> Venezia Mestre -> Roma Termini,
          by train (not a driving route — see lib/journeys/rome.ts for the
          real rail-corridor research). Same self-running once-in-view
          animation and the same beige/pink editorial-atlas styling as the
          Home->Trieste map above, distinguished only by its train icon
          (JourneyMapScene's mode:'train' rendering) instead of the van.
          Taller than the Home->Trieste map since this route runs much
          further north-south (Trieste down to Rome) than it does
          east-west, so it needs more vertical room to stay readable at
          both ends without cropping either station. Sits directly against
          the previous section with zero gap, same convention as every
          other map on the site. */}
      <JourneyMapScene
        journey={ROME_TRIESTE_TO_ROME_TRAIN_JOURNEY}
        heightClassName='h-[460px] sm:h-[560px] md:h-[640px]'
      />

      {/* 5. TRAVELLING TO ROME -- the outbound train journey itself,
          an in-chapter beat (Eyebrow, not a new RouteLabel) continuing
          the same "Getting to Rome" chapter the map above belongs to.
          Trimmed to five short paragraphs; the full timetable isn't
          repeated here since it's already in the Train Journey Overview
          below. Per the user's reordering request, this section now also
          carries the outbound timeline and the round-trip train cost
          card directly underneath the story -- all outbound train
          information lives in one place, in natural reading order
          (story -> timeline -> cost card), before "Arriving in Rome"
          starts the next chapter. The standalone "At a Glance" Eyebrow
          that used to sit above the timeline has been removed per that
          same request; the timeline now follows the story directly.
          Closes its own section (CHAPTER_GAP_END) since "Arriving in
          Rome" follows directly after. */}
      <section className={`px-6 md:px-12 ${MAP_TRANSITION_PT} ${CHAPTER_GAP_END} bg-[#faf9f6] dark:bg-black`}>
        <div className='max-w-2xl mx-auto text-center'>
          <Reveal className='flex flex-col items-center'>
            <Eyebrow>By Train</Eyebrow>
            <ChapterHeading as='h3' italic className='mt-3'>
              Travelling to Rome
            </ChapterHeading>
            <Paragraphs
              className='mt-5 text-center'
              items={[
                'Our first train from Trieste Airport to Venezia Mestre was a regional train. It took 1 hour and 24 minutes, and there were no assigned seats.',
                'We had 29 minutes to change trains in Venezia Mestre, which was more than enough.',
                'The second part of our journey was much more comfortable. We travelled to Rome on a Frecciarossa high-speed train in Business Class.',
                'The seats were spacious, and complimentary drinks and snacks were served shortly after departure.',
              ]}
            />
          </Reveal>
        </div>

        {/* The Frecciarossa Business Class photo -- the main photograph
            of this sub-story, given more visual emphasis than the two
            smaller supporting images above (a wider max-width, shown
            uncropped at its own real proportions). Cropped to its top
            ~70% before this page shipped, removing the lower part of the
            original frame where a Frecciarossa promotional QR code sat on
            the table — the trolley, the steward and the Frecciarossa
            branding are all still fully visible and uncropped. Same MPO
            fix (exif_transpose + single-frame RGB, EXIF stripped) applied
            as every other phone photo on this page. */}
        <Reveal delay={0.1} className='mt-10 md:mt-12 max-w-2xl mx-auto'>
          <Image
            src='/2026-10%20-%20Italy_Rome/Frecciarossa_web.jpeg'
            alt='An onboard steward serving complimentary drinks and snacks from a trolley in Frecciarossa Business Class.'
            width={4284}
            height={3998}
            sizes='(min-width: 768px) 672px, 100vw'
            className='w-full h-auto rounded-[2px]'
          />
          <p className='mt-3 text-center text-sm italic font-[family-name:var(--font-poppins)] text-black/55 dark:text-white/55'>
            Complimentary drinks and snacks in Frecciarossa Business
            Class.
          </p>
        </Reveal>

        <div className='max-w-2xl mx-auto text-center'>
          <Reveal delay={0.15} className='mt-8 md:mt-10 text-center'>
            <Paragraphs
              items={[
                'After 3 hours and 52 minutes, we arrived at Roma Termini at 11:30 PM, exactly on schedule.',
              ]}
            />
          </Reveal>

          {/* OUTBOUND TRAIN TIMELINE -- moved here from its own standalone
              section (which sat after "Arriving in Rome") so all outbound
              train information reads together, right after the story it
              belongs to. No heading above it (the removed "At a Glance"
              Eyebrow) -- it reads as practical reference information
              continuing directly from the story above, the same way the
              Private Transfer cost card continues directly from its own
              story in the next section. */}
          <Reveal delay={0.2} className='mt-10 md:mt-12 max-w-sm mx-auto text-left'>
            <span className='block text-xs uppercase tracking-[0.18em] font-[family-name:var(--font-poppins)] font-semibold text-black/45 dark:text-white/45'>
              Outbound · 18 October 2026
            </span>
            <div className='mt-4 space-y-0'>
              <TimelineLeg
                fromTime='17:45'
                fromStation='Trieste Airport'
                toTime='19:09'
                toStation='Venezia Mestre'
                detail='Regionale Veloce 3564 · Second Class · 1h 24m'
              />
              <TimelineTransfer>Transfer · 29 min</TimelineTransfer>
              <TimelineLeg
                fromTime='19:38'
                fromStation='Venezia Mestre'
                toTime='23:30'
                toStation='Roma Termini'
                detail='Frecciarossa 9437 · Business Class · 3h 52m'
              />
            </div>
            <div className='mt-5 pt-4 border-t border-black/10 dark:border-white/10 text-center'>
              <span className='text-xs uppercase tracking-[0.18em] font-[family-name:var(--font-poppins)] font-semibold text-black/45 dark:text-white/45'>
                Total
              </span>
              <TimeStamp size='sm'>5h 45m</TimeStamp>
            </div>
          </Reveal>

          {/* TRAIN COSTS -- directly below the outbound timeline, per the
              user's request. Covers both legs of the round trip, so it
              sits with the outbound timeline rather than being
              duplicated; the note underneath says so explicitly. */}
          <Reveal delay={0.25} className='mt-12 md:mt-14 mx-auto max-w-[460px] rounded-[3px] bg-[#f1ebdc] dark:bg-white/[0.04] px-8 py-8 md:px-9 md:py-9 flex flex-col items-center gap-1 text-center'>
            <span className='text-xs uppercase tracking-[0.18em] font-[family-name:var(--font-poppins)] font-semibold text-black/45 dark:text-white/45'>
              Train Tickets · Round Trip
            </span>
            <TimeStamp size='md'>€92.80</TimeStamp>
            <span className='mt-4 text-sm font-[family-name:var(--font-poppins)] text-black/60 dark:text-white/60'>
              Trieste Airport → Venezia Mestre → Roma Termini → Venezia
              Mestre → Trieste Airport
            </span>
            <span className='mt-4 text-xs uppercase tracking-[0.18em] font-[family-name:var(--font-poppins)] font-semibold text-black/45 dark:text-white/45'>
              Average Per Person
            </span>
          </Reveal>
          <Reveal delay={0.3} className='mt-4 max-w-sm mx-auto text-center'>
            <p className='text-xs italic font-[family-name:var(--font-poppins)] text-black/50 dark:text-white/50 leading-relaxed'>
              Average per-person cost based on our own booking, covering
              both the outbound and return journeys, including Business
              Class on the longer legs and a family fare — not a fixed or
              universal Trenitalia price.
            </p>
          </Reveal>
        </div>
      </section>

      {/* 6. ARRIVING IN ROME -- a top-level chapter (its own RouteLabel):
          the transfer from Roma Termini to where we actually stayed.
          Trimmed to five short paragraphs; the "price was €275" pivot
          line is gone entirely -- the figure lives only in the cost box
          now, not repeated in the body text. No transfer-company name,
          no accommodation name, no photo. */}
      <section className={`px-6 md:px-12 ${CHAPTER_GAP_START} ${CHAPTER_GAP_END} bg-[#faf9f6] dark:bg-black`}>
        <div className='max-w-2xl mx-auto text-center'>
          <Reveal>
            <RouteLabel>Arriving in Rome</RouteLabel>
            <ChapterHeading as='h2' italic className='mt-8 md:mt-10'>
              Our late-night transfer
            </ChapterHeading>
            <Paragraphs
              className='mt-5 text-center'
              items={[
                <>
                  Our train arrived at Roma Termini at 11:30 PM, and our{' '}
                  <Link
                    href='/behind-the-trip/hotels'
                    className='underline underline-offset-2'
                  >
                    accommodation
                  </Link>{' '}
                  was about a 20-minute drive from the city centre.
                </>,
                "With nine people, children and suitcases, public transport wasn't a practical option at that hour.",
                'We could have taken several taxis, but I preferred to keep everyone together, so I arranged a private minibus in advance.',
                'The driver was waiting for us as agreed, and everything went smoothly.',
                "It wasn't cheap, but after a long day of travelling, having everything organised was worth it.",
              ]}
            />
          </Reveal>

          {/* Transfer cost box -- price and its "Per Person" label are now
              grouped directly together (no gap-breaking info between
              them), with the total/vehicle details as a separate
              supporting line underneath, and tighter padding overall so
              the card reads as compact rather than roomy. */}
          <Reveal delay={0.1} className='mt-10 md:mt-12 mx-auto max-w-[420px] rounded-[3px] bg-[#f1ebdc] dark:bg-white/[0.04] px-7 py-6 md:px-8 md:py-7 flex flex-col items-center gap-1 text-center'>
            <span className='text-xs uppercase tracking-[0.18em] font-[family-name:var(--font-poppins)] font-semibold text-black/45 dark:text-white/45'>
              Private Transfer – Roma Termini
            </span>
            <TimeStamp size='md'>€30.56</TimeStamp>
            <span className='text-xs uppercase tracking-[0.18em] font-[family-name:var(--font-poppins)] font-semibold text-black/45 dark:text-white/45'>
              Per Person
            </span>
            <span className='mt-3 text-sm font-[family-name:var(--font-poppins)] text-black/60 dark:text-white/60'>
              €275 total for 9 passengers
            </span>
            <span className='mt-1 text-sm font-[family-name:var(--font-poppins)] text-black/60 dark:text-white/60'>
              Private minibus · Approximately 20 minutes
            </span>
          </Reveal>
        </div>
      </section>

      {/* 7. GETTING AROUND ROME -- the three former sub-sections (intro,
          "Buying Tickets", "Was the Roma 72H Ticket Worth It?") merged
          into one flowing section with a single heading, per the
          editorial-cleanup brief. The "scanners were surprisingly
          unreliable" standalone pivot line is gone, folded into the
          scanner paragraph below instead. */}
      <section className={`px-6 md:px-12 ${CHAPTER_GAP_START} ${CHAPTER_GAP_END} bg-[#faf9f6] dark:bg-black`}>
        <div className='max-w-2xl mx-auto text-center'>
          <Reveal>
            <RouteLabel>Getting Around Rome</RouteLabel>
            <ChapterHeading as='h2' italic className='mt-8 md:mt-10'>
              Public transport
            </ChapterHeading>
            <Paragraphs
              className='mt-5 text-center'
              items={[
                'There was a bus stop close to our accommodation, with several bus lines connecting to the nearest metro station. We rarely had to wait long for a bus, which made getting around Rome quite convenient.',
                <>
                  For our three-day stay, we chose the{' '}
                  <strong className='font-semibold text-black dark:text-white'>
                    Roma 72H ticket
                  </strong>
                  , which was a great solution.
                </>,
                "I bought mine in advance through the ATAC app, but couldn't purchase one for my underage daughter through the same process. We had to buy hers from a ticket machine instead.",
                'What frustrated me most were the ticket scanners. Both digital and physical tickets were frequently rejected by one reader, only to work perfectly at another.',
                <>
                  We experienced similar problems in Paris, while{' '}
                  <Link
                    href='/barcelona'
                    className='underline underline-offset-2'
                  >
                    Barcelona
                  </Link>
                  &apos;s ticketing system worked much more smoothly during our
                  visit.
                </>,
                'Rome also offers Tap & Go for contactless payment, but for us, the 72-hour ticket was the better option.',
                'Despite the frustrating scanners, I would choose the same ticket again.',
              ]}
            />
          </Reveal>

          {/* Roma 72H cost box -- unchanged: same card language as every
              price card sitewide, with a subtle pink text link
              underneath instead of a button, same treatment as the
              Trieste Airport parking link above. */}
          <Reveal delay={0.15} className='mt-10 md:mt-12 mx-auto max-w-[460px] rounded-[3px] bg-[#f1ebdc] dark:bg-white/[0.04] px-8 py-8 md:px-9 md:py-9 flex flex-col items-center gap-1 text-center'>
            <span className='text-xs uppercase tracking-[0.18em] font-[family-name:var(--font-poppins)] font-semibold text-black/45 dark:text-white/45'>
              Roma 72H Ticket
            </span>
            <TimeStamp size='md'>€22</TimeStamp>
            <span className='mt-4 text-sm font-[family-name:var(--font-poppins)] text-black/60 dark:text-white/60'>
              72 hours from first validation
            </span>
            <span className='mt-1 text-sm font-[family-name:var(--font-poppins)] text-black/60 dark:text-white/60'>
              Unlimited journeys on included public transport within Rome
            </span>
          </Reveal>
          <Reveal delay={0.18} className='mt-5 text-center'>
            <a
              href='https://www.atac.roma.it/en/tickets-and-passes/roma72h'
              target='_blank'
              rel='noopener noreferrer'
              className='inline-block text-sm font-[family-name:var(--font-poppins)] text-pink-500 dark:text-pink-300 no-underline decoration-pink-500/50 dark:decoration-pink-300/50 underline-offset-4 hover:underline transition-colors'
            >
              Official ATAC ticket information ↗
            </a>
          </Reveal>

          <Reveal delay={0.2} className='mt-8 md:mt-10 max-w-2xl mx-auto'>
            <InlineTip>
              My tip: For a three-day stay, the Roma 72H ticket is worth
              considering, especially if you&apos;re staying outside the
              centre. Just allow some extra time at the ticket readers.
            </InlineTip>
          </Reveal>
        </div>
      </section>

      {/* 9. THREE DAYS EXPLORING ROME -- short introduction to the
          sightseeing itinerary that follows, a new top-level chapter
          (its own RouteLabel) picking up directly after the Train
          Journey Overview. Trimmed from the brief's four short
          paragraphs to three natural ones (the two one-sentence closing
          lines folded together), per the "avoid one-sentence paragraphs"
          rule. */}
      {/* 10. DAY 1 -- ROME'S FAMOUS LANDMARKS (19 October). A top-level
          chapter; the three photos are spread naturally through the
          story rather than grouped at the end, per the brief. The
          sightseeing overview map that used to sit here (a single-city
          marker-only map with no real street/river background available,
          see the removed RomeItineraryMap.tsx) was removed at the
          user's request -- it read as unfinished, mostly empty beige
          space with pink dots and labels and no real geographic
          background, and the page doesn't need it. The "Exploring
          Historic Rome" sub-heading that used to split this paragraph
          from the itinerary intro above was removed at the user's
          request -- both paragraphs now flow one after another under
          the single "Three days exploring Rome" heading instead. */}
      <section className={`px-6 md:px-12 ${CHAPTER_GAP_START} ${CHAPTER_GAP_END} bg-[#faf9f6] dark:bg-black`}>
        <div className='max-w-2xl mx-auto text-center'>
          <Reveal>
            <RouteLabel>The Itinerary</RouteLabel>
            <ChapterHeading as='h2' italic className='mt-8 md:mt-10'>
              Three days exploring Rome
            </ChapterHeading>
            <Paragraphs
              className='mt-5 text-center'
              items={[
                "This trip was a little different from what I would normally plan. We were travelling with a parish group, so alongside Rome's famous landmarks, our itinerary included all four major papal basilicas.",
                "We started our first full day at the Basilica of St. John Lateran, the first of the four major papal basilicas on our itinerary. From there, we explored some of Rome's best-known landmarks: the Colosseum, Vittoriano, Trevi Fountain, the Spanish Steps and the Pantheon.",
              ]}
            />
          </Reveal>
        </div>

        <Reveal delay={0.1} className='mt-10 md:mt-12 max-w-sm sm:max-w-md mx-auto'>
          <Image
            src='/2026-10%20-%20Italy_Rome/Bazilika%20sv.Janeza_web.jpeg'
            alt="The extraordinary gilded, frescoed interior of St. John Lateran Basilica, Rome's cathedral."
            width={2000}
            height={2666}
            sizes='(min-width: 640px) 448px, 90vw'
            className='w-full h-auto rounded-[2px]'
          />
          <p className='mt-3 text-center text-sm italic font-[family-name:var(--font-poppins)] text-black/55 dark:text-white/55'>
            The extraordinary interior of St. John Lateran Basilica.
          </p>
        </Reveal>

        <div className='max-w-2xl mx-auto text-center'>
          <Reveal delay={0.15} className='mt-8 md:mt-10 text-center'>
            <Paragraphs
              items={[
                'I had already visited the inside of the Colosseum on my first trip to Rome, so this time we admired it from the outside. We also saw the Trevi Fountain without paying for the closer-access area.',
              ]}
            />
          </Reveal>

          <Reveal delay={0.17} className='mt-6 text-center'>
            <InlineTip>
              My tip: Book popular attractions well in advance. For our
              November 2023 visit, I booked the Vatican Museums 45 days
              ahead; Colosseum tickets weren&apos;t available any earlier,
              so I bought ours as soon as sales opened, 30 days before our
              visit. If you&apos;re planning to visit either attraction,
              check the official ticket release dates and book early — I
              wouldn&apos;t rely on last-minute availability.
            </InlineTip>
            <div className='mt-3 flex flex-col items-center gap-1.5'>
              <a
                href='https://ticketing.colosseo.it/en'
                target='_blank'
                rel='noopener noreferrer'
                className='inline-block text-sm font-[family-name:var(--font-poppins)] text-pink-500 dark:text-pink-300 no-underline decoration-pink-500/50 dark:decoration-pink-300/50 underline-offset-4 hover:underline transition-colors'
              >
                Colosseum &ndash; Official Tickets ↗
              </a>
              <a
                href='https://tickets.museivaticani.va/'
                target='_blank'
                rel='noopener noreferrer'
                className='inline-block text-sm font-[family-name:var(--font-poppins)] text-pink-500 dark:text-pink-300 no-underline decoration-pink-500/50 dark:decoration-pink-300/50 underline-offset-4 hover:underline transition-colors'
              >
                Vatican Museums &ndash; Official Tickets ↗
              </a>
            </div>
          </Reveal>

          <Reveal delay={0.19} className='mt-6 text-center'>
            <Paragraphs
              items={[
                "The Pantheon, however, was something I hadn't explored properly before, and I'm glad we went inside this time.",
                "We bought our tickets directly at the entrance for €7 per adult. The queues for both tickets and entry were incredibly long, so I'd definitely recommend planning ahead.",
                "Once inside, looking up at that enormous dome and its open oculus was one of those moments that reminded me just how extraordinary Rome's history really is.",
              ]}
            />
          </Reveal>
        </div>

        <Reveal delay={0.2} className='mt-10 md:mt-12 max-w-sm sm:max-w-md mx-auto'>
          <Image
            src='/2026-10%20-%20Italy_Rome/Pantheon_web.jpeg'
            alt="Looking straight up at the Pantheon's coffered dome and its open oculus, a shaft of light falling through."
            width={2000}
            height={2666}
            sizes='(min-width: 640px) 448px, 90vw'
            className='w-full h-auto rounded-[2px]'
          />
          <p className='mt-3 text-center text-sm italic font-[family-name:var(--font-poppins)] text-black/55 dark:text-white/55'>
            Looking up at the oculus inside the Pantheon.
          </p>
        </Reveal>

        <div className='max-w-2xl mx-auto text-center'>
          <Reveal delay={0.25} className='mt-8 md:mt-10 text-center'>
            <Paragraphs
              items={[
                "Unfortunately, the crowds were almost unbearable. Around most of the major attractions we could barely move, and with nine people travelling together, constantly making sure nobody got separated made the experience even more stressful.",
              ]}
            />
          </Reveal>
        </div>

        <Reveal delay={0.3} className='mt-10 md:mt-12 max-w-xs sm:max-w-sm mx-auto'>
          <Image
            src='/2026-10%20-%20Italy_Rome/Spanish%20steps_web.jpeg'
            alt='The crowded Spanish Steps in October, with Trinità dei Monti and its obelisk above.'
            width={2000}
            height={2666}
            sizes='(min-width: 640px) 384px, 80vw'
            className='w-full h-auto rounded-[2px]'
          />
          <p className='mt-3 text-center text-sm italic font-[family-name:var(--font-poppins)] text-black/55 dark:text-white/55'>
            The Spanish Steps in October — and the crowds that came with
            them.
          </p>
        </Reveal>

        <div className='max-w-2xl mx-auto text-center'>
          <Reveal delay={0.35} className='mt-8 md:mt-10 text-center'>
            <Paragraphs
              items={[
                "After dinner, we visited St. Peter's Square at night. What a difference — after a day surrounded by crowds, seeing the square almost empty was a welcome change.",
              ]}
            />
          </Reveal>
        </div>

        {/* St. Peter's Square at night -- reuses the same photo already
            used for the Rome destination card on the main Destinations
            page (see components/ui/travel-gallery.tsx's `rome` item), no
            new file. Landscape like the Frecciarossa photo above, so it
            gets the same max-w-2xl full-width treatment rather than the
            narrower portrait crops used elsewhere in this section. */}
        <Reveal delay={0.4} className='mt-10 md:mt-12 max-w-2xl mx-auto'>
          <Image
            src='/2026-10%20-%20Italy_Rome/Rome_landing_page_web.jpeg'
            alt="St. Peter's Basilica at night, Vatican City, Rome."
            width={5712}
            height={4284}
            sizes='(min-width: 768px) 672px, 100vw'
            className='w-full h-auto rounded-[2px]'
          />
          <p className='mt-3 text-center text-sm italic font-[family-name:var(--font-poppins)] text-black/55 dark:text-white/55'>
            St. Peter&apos;s Square at night — a completely different
            atmosphere.
          </p>
        </Reveal>
      </section>

      {/* 12. DAY 2 -- INSIDE THE VATICAN AND ROME'S BASILICAS (20
          October). The "An Unexpected Transport Problem" sub-beat (the
          metro breakdown, the crowded replacement bus, the passenger
          covering her ears) has been removed entirely per the user's
          request -- not moved or reused elsewhere. A brief personal
          observation comparing Rome and Barcelona now closes the
          sightseeing narrative instead, at the end of the "An Audience
          with the Pope" section (Day 3), before the return journey. */}
      <section className={`px-6 md:px-12 ${CHAPTER_GAP_START} ${CHAPTER_GAP_END} bg-[#faf9f6] dark:bg-black`}>
        <div className='max-w-2xl mx-auto text-center'>
          <Reveal>
            <ChapterHeading as='h3' italic>
              Inside the Vatican &amp; Rome&apos;s Basilicas
            </ChapterHeading>
            <Paragraphs
              className='mt-5 text-center'
              items={[
                "Our second day began with a visit to the Vatican and St. Peter's Basilica.",
                "We then continued to Santa Maria Maggiore and St. Paul Outside the Walls, completing our visit to Rome's four major papal basilicas.",
                "I had visited the Vatican Museums and the Sistine Chapel on my first trip to Rome in 2023. They weren't included in our itinerary this time.",
              ]}
            />
          </Reveal>
        </div>

        <Reveal delay={0.1} className='mt-10 md:mt-12 max-w-sm sm:max-w-md mx-auto'>
          <Image
            src='/2026-10%20-%20Italy_Rome/Sv.Peter_web.jpeg'
            alt="Bernini's bronze baldachin beneath the dome of St. Peter's Basilica."
            width={2000}
            height={2666}
            sizes='(min-width: 640px) 448px, 90vw'
            className='w-full h-auto rounded-[2px]'
          />
          <p className='mt-3 text-center text-sm italic font-[family-name:var(--font-poppins)] text-black/55 dark:text-white/55'>
            Bernini&apos;s magnificent baldachin inside St. Peter&apos;s
            Basilica.
          </p>
        </Reveal>

        <Reveal delay={0.15} className='mt-10 md:mt-12 max-w-sm sm:max-w-md mx-auto'>
          <Image
            src='/2026-10%20-%20Italy_Rome/Sv.%20Pavel_web.jpeg'
            alt='The coffered, gilded ceiling of St. Paul Outside the Walls, seen from beneath its colonnade.'
            width={2000}
            height={2287}
            sizes='(min-width: 640px) 448px, 90vw'
            className='w-full h-auto rounded-[2px]'
          />
          <p className='mt-3 text-center text-sm italic font-[family-name:var(--font-poppins)] text-black/55 dark:text-white/55'>
            The extraordinary gilded ceiling of St. Paul Outside the
            Walls.
          </p>
        </Reveal>

        <div className='max-w-2xl mx-auto text-center'>
          <Reveal delay={0.18} className='mt-10 md:mt-12'>
            <Eyebrow>Rome&apos;s Four Major Basilicas</Eyebrow>
            <Paragraphs
              className='mt-5 text-center'
              items={[
                "Churches aren't usually high on my list when I'm exploring a city.",
                "The architecture was undeniably impressive, but what struck me most was the extraordinary wealth on display — golden ceilings, marble, enormous sculptures and elaborate decorations everywhere. I'd felt something similar visiting the Vatican Museums on my previous trip; the sheer value of everything collected over centuries is staggering.",
                "I couldn't help thinking about the contrast — the Church teaches simplicity and modesty, yet here we were, surrounded by unimaginable wealth, and it made me wonder how all of it had been accumulated over the centuries.",
                <>
                  Would I recommend visiting all four basilicas? Not
                  necessarily. If you&apos;re short on time,{' '}
                  <strong className='font-semibold text-black dark:text-white'>
                    St. Peter&apos;s Basilica alone
                  </strong>{' '}
                  gives you a very good impression of their scale and
                  grandeur.
                </>,
                "Entrance to all four major papal basilicas is free, but you do have to go through security checks. This can mean long queues, especially at St. Peter's Basilica in the Vatican, where the line of people waiting to get inside often stretches across the square.",
              ]}
            />
          </Reveal>

          <Reveal delay={0.2} className='mt-8 md:mt-10 text-center'>
            <Paragraphs
              items={[
                "During our time at the Vatican, we also collected our tickets for the following morning's papal audience. Our priest had arranged them for the group.",
              ]}
            />
          </Reveal>
        </div>
      </section>

      {/* 13. DAY 3 -- THE PAPAL AUDIENCE (21 October). Deliberately the
          shortest of the three days: three tight paragraphs instead of
          each day's five-plus, no second photograph, and the return
          train journey is NOT repeated here -- it already has its own
          chapter earlier on this page. */}
      <section className={`px-6 md:px-12 ${CHAPTER_GAP_START} ${CHAPTER_GAP_END} bg-[#faf9f6] dark:bg-black`}>
        <div className='max-w-2xl mx-auto text-center'>
          <Reveal>
            <ChapterHeading as='h3' italic>
              An Audience with the Pope
            </ChapterHeading>
            <Paragraphs
              className='mt-5 text-center'
              items={[
                "Our final morning in Rome started early. We arrived at the Vatican before 8 AM, but the crowds were already enormous. Even with our tickets, we still had to join the long queue to enter St. Peter's Square.",
                "With rain in the forecast, we had bought rain ponchos at a market the day before. They were also being sold to people waiting in the queue, but we were glad we'd come prepared. Several short showers passed through while we waited, although luckily, the rain stopped before the Pope arrived.",
                'The audience itself lasted around half an hour and was a memorable way to end our visit to Rome. Afterwards, we had lunch, collected our luggage and headed to Roma Termini for our journey home.',
              ]}
            />
          </Reveal>
        </div>

        {/* The papal-audience ticket -- our actual paper ticket, the
            printed serial number in the upper-right corner redacted
            before this image was ever saved to the repo (no unredacted
            version of this photo exists on disk). Moderate width, not
            full-screen, per the brief. */}
        <Reveal delay={0.1} className='mt-10 md:mt-12 max-w-sm sm:max-w-md mx-auto'>
          <Image
            src='/2026-10%20-%20Italy_Rome/Papa%20audience_web.jpeg'
            alt='Our paper ticket for the Wednesday general papal audience with Pope Leo XIV, 21 October 2026 at 10:00, issued by the Prefettura della Casa Pontificia. Free admission; the printed serial number is redacted.'
            width={2000}
            height={1400}
            sizes='(min-width: 640px) 448px, 90vw'
            className='w-full h-auto rounded-[2px] border border-black/10 dark:border-white/10'
          />
          <p className='mt-3 text-center text-sm italic font-[family-name:var(--font-poppins)] text-black/55 dark:text-white/55'>
            Our ticket for the Wednesday papal audience with Pope Leo XIV.
            Admission is free.
          </p>
        </Reveal>

        <div className='max-w-2xl mx-auto text-center'>
          <Reveal delay={0.15} className='mt-8 md:mt-10 max-w-2xl mx-auto'>
            <InlineTip>
              My tip: Tickets for the Wednesday papal audience are free
              and can be requested through the Vatican&apos;s official
              reservation website. Our priest arranged ours, and we
              collected them the day before. Even with tickets, arrive
              early and expect queues and security checks.
            </InlineTip>
          </Reveal>
          <Reveal delay={0.18} className='mt-5 text-center'>
            <a
              href='https://eventi.pontificalisdomus.va/?lang=en-us'
              target='_blank'
              rel='noopener noreferrer'
              className='inline-block text-sm font-[family-name:var(--font-poppins)] text-pink-500 dark:text-pink-300 no-underline decoration-pink-500/50 dark:decoration-pink-300/50 underline-offset-4 hover:underline transition-colors'
            >
              Request free papal audience tickets ↗
            </a>
          </Reveal>
        </div>

        {/* Our own recording from the audience -- same silent, no-
            controls "moving photograph" treatment used for every other
            video on the site (muted, looped, no visible controls), just
            with an accessible label rather than aria-hidden since this
            clip -- unlike an ambient b-roll loop -- carries real
            documentary content. */}
        <Reveal delay={0.1} className='mt-10 md:mt-12 max-w-[240px] sm:max-w-xs mx-auto'>
          <div className='relative w-full overflow-hidden rounded-[2px] aspect-[9/16]'>
            <video
              src='/2026-10%20-%20Italy_Rome/Papa_web.mp4'
              autoPlay
              muted
              loop
              playsInline
              preload='auto'
              aria-label="Pope Leo XIV waving from the popemobile at the Wednesday general audience in St. Peter's Square."
              className='absolute inset-0 h-full w-full object-cover'
            />
          </div>
          <p className='mt-3 text-center text-sm italic font-[family-name:var(--font-poppins)] text-black/55 dark:text-white/55'>
            Pope Leo XIV at the Wednesday general audience in St. Peter&apos;s
            Square.
          </p>
        </Reveal>

        {/* A brief personal observation closing out the sightseeing
            narrative -- added per the user's request to replace the
            removed "An Unexpected Transport Problem" beat (Day 2). Plain
            body text, no heading, a one-off personal impression rather
            than a generalisation about Italians. */}
        <div className='max-w-2xl mx-auto text-center'>
          <Reveal delay={0.2} className='mt-10 md:mt-12 text-center'>
            <Paragraphs
              items={[
                "One thing I noticed on this trip was the contrast with our recent visit to Barcelona. There, strangers went out of their way to help us, even when we hadn't asked. In Rome, we experienced quite the opposite on several occasions. People seemed less patient, especially with a group of nine travelling together. Of course, these were just our personal experiences, but the difference was noticeable.",
              ]}
            />
          </Reveal>
        </div>
      </section>

      {/* 13B. THE JOURNEY HOME -- re-titled "A Little Panic at Roma
          Termini" per the user's correction (the original "stressful
          return journey" framing overstated it -- the train was never
          actually in danger of being missed, and the carriage numbers
          only became visible once the train arrived, so there was no
          failure to check them in advance; the delay-driven uncertainty
          is what caused the panic). Relocated here (immediately after
          the Rome sightseeing and before the closing reflection) per
          the layout-and-structure brief's "move the return journey
          after the Rome visit" change. The Outbound timeline + €92.80
          cost card that used to live in this same chapter now live
          inside "Travelling to Rome" (right after that story, before
          "Arriving in Rome"), so only the Return leg's own timeline
          stays here -- no duplicated train info, and its own factual
          details (times, stations, delay notes) are unchanged by this
          rewrite. The misleading "check your carriage number in
          advance" My Tip has been removed entirely per the user's
          request -- it implied a planning failure that didn't happen. */}
      <section className={`px-6 md:px-12 ${CHAPTER_GAP_START} ${CHAPTER_GAP_END} bg-[#faf9f6] dark:bg-black`}>
        <div className='max-w-2xl mx-auto text-center'>
          <Reveal className='flex flex-col items-center'>
            <Eyebrow>Homeward</Eyebrow>
            <ChapterHeading as='h3' italic className='mt-3'>
              A Little Panic at Roma Termini
            </ChapterHeading>
            <Paragraphs
              className='mt-5 text-center'
              items={[
                'Our return journey started with a little confusion at Roma Termini. Our train was delayed, and we were waiting for the platform number to appear on the departure board.',
                'Once the platform was announced, we made our way through the crowded ticket checks. By the time we reached the platform, the train was just arriving.',
                'We were standing near carriage 11, while our reserved seats were in carriage 2, at the other end of the train. So there we were, nine people hurrying along the platform with our luggage.',
                'At one point, we heard a whistle and started moving even faster, thinking the train might be about to leave. In reality, the whistle had nothing to do with our departure, and we still had about five minutes before the train left!',
                "Looking back, there was no real reason to run. We simply weren't sure how much time we had because of the delay, and a little panic took over.",
                'Fortunately, the train made up some of its delay, and changing trains at Venezia Mestre was surprisingly easy. Our connecting train was waiting on the opposite track of the same platform.',
              ]}
            />
          </Reveal>

          {/* RETURN TRAIN TIMELINE -- the Outbound block and its cost
              card were moved out of this chapter into their own "At a
              Glance" section right after "Arriving in Rome"; only the
              Return leg stays here. The scheduled 15:35 departure time
              is shown with its own note calling out the actual ~15:50
              departure and partial recovery, so scheduled and actual
              stay clearly distinguished. Top margin brought back down to
              the standard paragraphs->timeline gap (mt-10/12, matching
              the Outbound timeline's own gap in "Travelling to Rome")
              now that the My Tip that used to sit between them is gone. */}
          <Reveal delay={0.1} className='mt-10 md:mt-12 flex flex-col items-center'>
            <Eyebrow>At a Glance</Eyebrow>
          </Reveal>

          <Reveal delay={0.15} className='mt-8 md:mt-10 max-w-sm mx-auto text-left'>
            <span className='block text-xs uppercase tracking-[0.18em] font-[family-name:var(--font-poppins)] font-semibold text-black/45 dark:text-white/45'>
              Return · 21 October 2026
            </span>
            <div className='mt-4 space-y-0'>
              <TimelineLeg
                fromTime='15:35'
                fromStation='Roma Termini'
                toTime='19:23'
                toStation='Venezia Mestre'
                detail='Frecciarossa 9426 · Business Class · scheduled 3h 48m'
                note='Actual departure ~15:50; time partly recovered en route'
              />
              <TimelineTransfer>Scheduled transfer 17 min · actual ~10 min</TimelineTransfer>
              <TimelineLeg
                fromTime='19:40'
                fromStation='Venezia Mestre'
                toTime='20:57'
                toStation='Trieste Airport'
                detail='Frecciarossa 9749 · Standard Class · 1h 17m'
              />
            </div>
            <div className='mt-5 pt-4 border-t border-black/10 dark:border-white/10 text-center'>
              <span className='text-xs uppercase tracking-[0.18em] font-[family-name:var(--font-poppins)] font-semibold text-black/45 dark:text-white/45'>
                Total (scheduled)
              </span>
              <TimeStamp size='sm'>5h 22m</TimeStamp>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 14. FINAL THOUGHTS -- "Would I visit Rome again?" A short,
          personal closing reflection, not a conclusion/verdict on the
          whole site's usual scale: no new photo (the Pantheon photo
          earlier already carries that beat), no cost box, no My Tip, no
          map. Rewritten per the user's request to soften the original
          "no desire to return" framing into a more honest, undecided
          note (open to a future visit with her son, not a Barcelona
          comparison), while keeping the "Absolutely" recommendation for
          first-time visitors as the closing line, now bolded in full per
          the brief. Closes the page (pb-[calc(3rem+50px)] md:pb-[calc(3.5rem+50px)],
          matching the Tenerife/Barcelona footer spacing), same
          text->new-chapter rhythm (CHAPTER_GAP_START) as every other
          chapter transition. */}
      <section className={`px-6 md:px-12 ${CHAPTER_GAP_START} pb-[calc(3rem+50px)] md:pb-[calc(3.5rem+50px)] bg-[#faf9f6] dark:bg-black`}>
        <div className='max-w-2xl mx-auto text-center'>
          <Reveal>
            <RouteLabel>Final Thoughts</RouteLabel>
            <ChapterHeading as='h2' italic className='mt-8 md:mt-10'>
              Would I visit Rome again?
            </ChapterHeading>
            <Paragraphs
              className='mt-5 text-center'
              items={[
                "After visiting Rome twice, I can't say I'm already dreaming of going back.",
                "And that's not because Rome isn't worth visiting. Quite the opposite.",
                "There's so much history here that even if you're not particularly interested in art, architecture or culture, it's difficult not to be impressed. Standing in front of the Pantheon, knowing it's been there for almost 2,000 years, is something extraordinary. And stepping inside to look up at that enormous dome makes it even more impressive.",
                'Another thing that affected my experience was the attitude of some of the people we encountered. Unfortunately, not everyone was particularly friendly or welcoming, and those small interactions can leave an impression on how you remember a place.',
                "Of course, every visit is different, and perhaps I'd experience the city differently another time. My son hasn't been to Rome yet, so I wouldn't rule out returning one day.",
                "But for now, Rome simply isn't a place I feel drawn to revisit.",
                <strong key='recommend' className='font-semibold text-black dark:text-white'>
                  Would I recommend it to someone who has never been?
                  Absolutely.
                </strong>,
                "It's a city worth experiencing at least once, even if history and culture aren't usually your thing.",
              ]}
            />
          </Reveal>
        </div>
      </section>

      {/* FOOTER -- the same shared footer as every other fully-built
          destination page (Tenerife, Barcelona): logo, tagline, site nav,
          email, social icons and copyright. Rome previously ended without
          one, a dead end for anyone finishing the article; copied verbatim
          (markup, classes and copy) rather than re-derived, so it stays in
          sync with the other pages' footers. */}
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
          © 2026 Metkish
        </p>
      </footer>
    </div>
  );
}
