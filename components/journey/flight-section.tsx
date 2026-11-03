'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import type { ReactNode } from 'react';
import JourneyMapScene from '@/components/journey/JourneyMapScene';
import { RouteLabel, TimeStamp } from '@/components/journey/annotation-kit';
import type { Journey } from '@/lib/journeys/types';

// Shared "The Flight" chapter -- the flight map (Vienna Airport -> the
// destination airport) plus the quiet airline/price/luggage fact card
// that follows it. First built for app/tenerife/page.tsx (that page's
// "4. MAP" / "5. FLIGHT CONTENT" sections -- specifically Group A, the
// practical-information panel; the Seychelles comparison, the three
// flight facts and "What I hadn't thought about" that also live in that
// section are destination-specific editorial content, not part of this
// shared piece). Extracted here, unchanged in appearance, so
// app/barcelona/page.tsx -- and any future destination whose flight
// section is just this one quiet fact card -- can reuse it instead of
// re-typing the map, layout, typography and card styling by hand.
//
// IMPORTANT: app/tenerife/page.tsx itself is intentionally NOT changed to
// use this component, for the same reason as why-vienna-section.tsx (see
// that file's own comment): its opening is the site's locked, approved
// editorial reference (see the tenerife-editorial-system skill), so it is
// left exactly as it already is -- zero risk to its approved appearance
// or behaviour.

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

// Same Level 2 editorial heading scale used throughout Tenerife's own
// opening journey (see that page's ChapterHeading comment).
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

// A small in-chapter marker -- one notch below RouteLabel: no pink tick,
// used for a beat *within* this chapter (e.g. Tenerife's own "A first with
// Ryanair") rather than a chapter opener. Same component as
// app/tenerife/page.tsx's own Eyebrow.
function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <span className='block text-sm md:text-[0.95rem] uppercase tracking-[0.18em] font-[family-name:var(--font-poppins)] font-semibold text-black/60 dark:text-white/60'>
      {children}
    </span>
  );
}

function Paragraphs({ items, className = '' }: { items: string[]; className?: string }) {
  return (
    <div className={`space-y-5 ${className}`}>
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

// Same map->content pause, and same chapter-ending bottom gap, used
// sitewide (see app/tenerife/page.tsx's own MAP_TRANSITION_PT /
// CHAPTER_GAP_END comments) -- repeated here rather than imported since
// they're one-line tokens, not worth a shared constants module for.
const MAP_TRANSITION_PT = 'pt-8 md:pt-10';
const CHAPTER_GAP_END = 'pb-12 md:pb-14';

// An optional short in-chapter sub-beat directly below the fact card --
// e.g. Tenerife's own "A first with Ryanair / What I hadn't thought
// about" (eyebrow, heading, a paragraph or two, then a photo). Omitted by
// default so a flight section can still be just the map + fact card, the
// same minimal shape it had before this existed.
export interface FlightExperienceContent {
  /** e.g. "Flying with Austrian Airlines" -- an Eyebrow, not a full
   *  chapter-opening RouteLabel, same role as Tenerife's own "A first
   *  with Ryanair". */
  label: string;
  /** e.g. "Why we check our luggage". */
  heading: string;
  /** Each string renders as its own paragraph (same spacing as Tenerife's
   *  own Ryanair-seats paragraphs) -- kept as plain narrative text, no
   *  italic-lead-sentence treatment, since that's specific to Tenerife's
   *  own closing line, not part of this shared shape. */
  paragraphs: string[];
  /** The photo directly below the text -- same width/aspect/crop pattern
   *  as Tenerife's own Ryanair wing photograph. */
  image: {
    src: string;
    alt: string;
    /** Tailwind object-position classes, mobile first then md: -- tuned
     *  per photo, same as Tenerife's own 'object-[50%_28%]
     *  md:object-[50%_34%]'. */
    objectPositionClassName: string;
  };
}

export interface FlightSectionProps {
  /** The flight leg's own map data -- Vienna Airport -> the destination
   *  airport (see lib/journeys/barcelona.ts for the worked example),
   *  authored the same way Tenerife's own flight map is. */
  journey: Journey;
  /** e.g. "Vienna to Barcelona". */
  heading: string;
  /** e.g. "Austrian Airlines · direct". */
  airline: string;
  /** e.g. "24 Oct → 29 Oct 2026". */
  dates: string;
  /** e.g. "€1,707.28". */
  price: string;
  /** e.g. "4 × 23 kg". */
  luggage: string;
  /** See FlightExperienceContent above. Omit for a flight section that's
   *  just the map + fact card. */
  experience?: FlightExperienceContent;
}

export default function FlightSection({
  journey,
  heading,
  airline,
  dates,
  price,
  luggage,
  experience,
}: FlightSectionProps) {
  return (
    <>
      {/* MAP -- Vienna Airport -> destination airport, the flight itself.
          Same height/responsive behaviour and the same self-running
          animation style as Tenerife's own flight map. */}
      <JourneyMapScene journey={journey} heightClassName='h-[420px] sm:h-[480px] md:h-[580px]' />

      {/* FLIGHT CONTENT -- same quiet, single-fact-card composition as
          Tenerife's Group A. Deliberately nothing else: no flight
          numbers, times, duration, cabin luggage, aircraft details or
          extra description -- those are either destination-specific
          editorial content that stays hand-written on the page using this
          component, or (per this card's own design) simply not part of
          what this card shows. */}
      <section className={`px-6 md:px-12 ${MAP_TRANSITION_PT} ${CHAPTER_GAP_END} bg-[#faf9f6] dark:bg-black`}>
        <div className='max-w-2xl mx-auto text-center'>
          <Reveal>
            <RouteLabel>The Flight</RouteLabel>
            <ChapterHeading italic className='mt-5'>
              {heading}
            </ChapterHeading>
          </Reveal>

          {/* Same quiet "practical information" insert as Tenerife's: one
              panel, lifted off the page only by a muted warm background
              (no border, no shadow, no card chrome), the price at the
              same TimeStamp scale used for every other fact on the
              site. */}
          <Reveal className='mt-8 md:mt-10 mx-auto max-w-[520px] rounded-[3px] bg-[#f1ebdc] dark:bg-white/[0.04] px-8 py-9 md:px-10 md:py-10 flex flex-col items-center gap-1 text-center'>
            <span className='text-xs uppercase tracking-[0.18em] font-[family-name:var(--font-poppins)] font-semibold text-black/45 dark:text-white/45'>
              {airline}
            </span>
            <span className='text-sm font-[family-name:var(--font-poppins)] text-black/60 dark:text-white/60'>
              {dates}
            </span>
            <span className='mt-4 text-xs uppercase tracking-[0.18em] font-[family-name:var(--font-poppins)] font-semibold text-black/45 dark:text-white/45'>
              Flights for four
            </span>
            <TimeStamp size='md'>{price}</TimeStamp>
            <span className='mt-4 text-xs uppercase tracking-[0.18em] font-[family-name:var(--font-poppins)] font-semibold text-black/45 dark:text-white/45'>
              Checked luggage
            </span>
            <span className='text-sm font-[family-name:var(--font-poppins)] text-black/60 dark:text-white/60'>
              {luggage}
            </span>
          </Reveal>

          {/* Optional in-chapter sub-beat -- same role, spacing and
              typography as Tenerife's own "A first with Ryanair / What I
              hadn't thought about": a genuinely new editorial idea within
              this chapter, so the gap above it is the largest in this
              section, same as there. */}
          {experience && (
            <Reveal className='mt-16 md:mt-[76px] max-w-xl mx-auto'>
              <Eyebrow>{experience.label}</Eyebrow>
              <ChapterHeading italic className='mt-3'>
                {experience.heading}
              </ChapterHeading>
              <Paragraphs className='mt-5 text-center' items={experience.paragraphs} />
            </Reveal>
          )}
        </div>

        {/* The experience photo -- a section-level sibling of the
            max-w-2xl content column above (not nested inside it), same
            structural pattern as Tenerife's own Ryanair photo, so it can
            reach its own, wider max-width: narrower than the hotel-photo
            cap on desktop (md:max-w-3xl, not max-w-5xl) so it reads as a
            secondary editorial beat, full-width on mobile since the
            screen is already narrower than either value. */}
        {experience && (
          <Reveal className='mt-14 md:mt-16 max-w-5xl md:max-w-3xl mx-auto'>
            <div className='relative w-full overflow-hidden rounded-[2px] aspect-[4/3] md:aspect-[16/9]'>
              <Image
                src={experience.image.src}
                alt={experience.image.alt}
                fill
                sizes='(min-width: 1024px) 1024px, 100vw'
                className={`object-cover ${experience.image.objectPositionClassName}`}
              />
            </div>
          </Reveal>
        )}
      </section>
    </>
  );
}
