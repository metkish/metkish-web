'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import JourneyMapScene from '@/components/journey/JourneyMapScene';
import { RouteLabel, TimeStamp } from '@/components/journey/annotation-kit';
import { TENERIFE_HOME_TO_VIENNA_JOURNEY } from '@/lib/journeys/tenerife';

// Shared "Why Vienna?" chapter -- the map (home -> Vienna Airport) plus the
// Vienna / Car Park 3 story that follows it. First built for
// app/tenerife/page.tsx (that page's "2. MAP" / "3. VIENNA CONTENT"
// sections); extracted here, unchanged in appearance or behaviour, so
// app/barcelona/page.tsx -- and any future destination that also starts
// this same way -- can reuse it instead of re-typing the map, layout,
// typography and parking-card styling by hand.
//
// IMPORTANT: app/tenerife/page.tsx itself is intentionally NOT changed to
// use this component. Its opening (hero through hotel arrival, which
// includes this exact section) is the site's locked, approved editorial
// reference -- see the tenerife-editorial-system skill. It is left exactly
// as it already is, so there is zero risk of this refactor altering its
// approved appearance or behaviour. This component is a fresh copy of that
// same JSX/logic for new pages to build on; if Tenerife's own version ever
// needs a *deliberate* change, that still happens by editing
// app/tenerife/page.tsx directly, per that skill.
//
// The map reuses TENERIFE_HOME_TO_VIENNA_JOURNEY as-is rather than
// authoring a new journey: it's a real, already-verified drive (home in
// Slovenia -> Vienna Airport) that doesn't change based on which city the
// flight out of Vienna goes to. Per the metkish-route-geometry rule,
// there's nothing new to fetch or verify here -- it's the same real trip,
// reused, not a route invented or guessed for a new destination.

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

// Same Level 4 fact treatment used throughout Tenerife's own page (see
// that page's Fact comment): small uppercase label, large serif value,
// optional small supporting lines underneath.
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

// Same map->content pause used sitewide (see app/tenerife/page.tsx's own
// MAP_TRANSITION_PT comment) -- repeated here rather than imported since
// it's a one-line token, not worth a shared constants module for.
const MAP_TRANSITION_PT = 'pt-8 md:pt-10';

export interface WhyViennaSectionProps {
  /** The single paragraph under the "Why Vienna?" heading -- the only
   *  destination-specific editorial copy in this section (e.g. which city
   *  the direct flight out of Vienna is to). */
  introText: string;
  /** Parking-card fact, same visual treatment as Tenerife's. */
  parkingLabel: string;
  parkingValue: string;
  parkingSupport: string[];
}

export default function WhyViennaSection({
  introText,
  parkingLabel,
  parkingValue,
  parkingSupport,
}: WhyViennaSectionProps) {
  return (
    <>
      {/* MAP -- Home -> Vienna Airport only. Same short, self-running
          animation as Tenerife's; sits directly against whatever comes
          before it with zero gap, deliberately -- any div here, even a
          thin one, paints its own background colour first and reads as a
          visible seam. */}
      <JourneyMapScene
        journey={TENERIFE_HOME_TO_VIENNA_JOURNEY}
        heightClassName='h-[380px] sm:h-[440px] md:h-[500px]'
      />

      {/* VIENNA CONTENT -- why we flew from Vienna, then the Car Park 3
          booking. Identical layout/spacing/typography to Tenerife's own
          section; only the intro paragraph and the parking fact are
          destination-specific props. The closing paragraph about choosing
          Car Park 3 is intentionally NOT a prop -- it's the same editorial
          reasoning regardless of destination, so it stays identical,
          verbatim, on every page that uses this component. */}
      <section className={`px-6 md:px-12 ${MAP_TRANSITION_PT} pb-16 md:pb-24 bg-[#faf9f6] dark:bg-black`}>
        <div className='max-w-2xl mx-auto text-center'>
          <Reveal>
            <RouteLabel>Slovenia → Vienna</RouteLabel>
          </Reveal>

          <Reveal className='mt-8 md:mt-10 max-w-xl mx-auto'>
            <ChapterHeading italic>Why Vienna?</ChapterHeading>
            <Paragraphs className='mt-5 text-center' items={[introText]} />
          </Reveal>

          {/* Same quiet practical-information panel language as
              Tenerife's -- no border/shadow, same corner radius, same
              uppercase label styling. */}
          <Reveal className='mt-9 md:mt-11 mx-auto max-w-[380px] rounded-[3px] bg-[#f1ebdc] dark:bg-white/[0.04] px-7 py-7 md:px-8 md:py-8'>
            <Fact label={parkingLabel} value={parkingValue} support={parkingSupport} />
          </Reveal>

          <Reveal className='mt-6 md:mt-7 max-w-xl mx-auto'>
            <Paragraphs
              className='text-center'
              items={[
                "Not the cheapest parking option, but it's right at the terminal, covered and incredibly convenient with luggage — especially in bad weather. We book online in advance because it's cheaper, with a few extra hours on either side for delays.",
              ]}
            />
          </Reveal>
        </div>
      </section>
    </>
  );
}
