'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import type { ReactNode } from 'react';
import JourneyMapScene from '@/components/journey/JourneyMapScene';
import { RouteLabel } from '@/components/journey/annotation-kit';
import type { Journey } from '@/lib/journeys/types';
import { ChapterHeading, Paragraphs } from '@/components/ui/typography';

// Shared "Getting to the Hotel" chapter -- the animated transfer map plus
// the chapter's RouteLabel underneath it, with an optional heading /
// paragraphs / photo beat beneath that (added once the destination page
// has that content -- see TransferToHotelSectionProps below). Extracted as
// its own small component, same spirit as why-vienna-section.tsx and
// flight-section.tsx: a piece every destination page can reuse once it has
// its own real, OSRM-verified airport-to-hotel route (see the
// metkish-route-geometry skill), without re-typing the map + label pairing
// by hand or touching app/tenerife/page.tsx, whose own "Getting to the
// Hotel" chapter (map further up the page, text-only chapter here) is left
// exactly as it is.
//
// Map height reuses Tenerife's own final local-transfer map size
// (TENERIFE_TRANSFER_JOURNEY's h-[340px] sm:h-[380px] md:h-[440px] in
// app/tenerife/page.tsx) -- same short, self-running animation treatment for
// the same kind of trip: a single local airport-to-hotel hop, not a
// continental flight.

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

// Same Level 2 editorial heading scale used throughout the site. Not
// italic by default -- Tenerife's own "Getting to the Hotel" heading ("The
// transfer we probably didn't need.") is the one chapter heading on that
// page that isn't italic, and this is that same chapter, so it matches.
// Same map->content pause, and same photo-ending chapter gap, used
// sitewide (see app/tenerife/page.tsx's own MAP_TRANSITION_PT /
// CHAPTER_GAP_END comments) -- repeated here rather than imported since
// they're one-line tokens, not worth a shared constants module for.
const MAP_TRANSITION_PT = 'pt-8 md:pt-10';
const CHAPTER_GAP_END = 'pb-12 md:pb-14';

export interface TransferToHotelPhoto {
  src: string;
  alt: string;
  /** The photo's own real width/height (not a crop box) -- this chapter's
   *  photo is shown uncropped at its natural aspect ratio, so Next needs
   *  the real intrinsic size rather than a fixed aspect class. */
  width: number;
  height: number;
}

export interface TransferToHotelSectionProps {
  journey: Journey;
  /** The chapter's RouteLabel text, e.g. "Getting to the Hotel". Rendered
   *  uppercase by RouteLabel itself -- pass normal title case. */
  label: string;
  /** e.g. "Getting to the hotel". Omit for a map + label-only section. */
  heading?: string;
  /** Each string renders as its own paragraph. Omit along with heading for
   *  a map + label-only section. */
  paragraphs?: string[];
  /** The photo directly below the text. Shown uncropped at its own
   *  natural aspect ratio (unlike the Austrian Airlines experience photo,
   *  which is cropped to a fixed 4:3/16:9 box) -- same outer container
   *  width, so it lines up with that photo above it, but nothing is
   *  trimmed from this one. */
  photo?: TransferToHotelPhoto;
}

export default function TransferToHotelSection({
  journey,
  label,
  heading,
  paragraphs,
  photo,
}: TransferToHotelSectionProps) {
  return (
    <>
      {/* MAP -- airport -> hotel, real OSRM-verified driving route. Sits
          directly against whatever comes before it with zero gap, same
          convention as every other map on the site. */}
      <JourneyMapScene
        journey={journey}
        heightClassName='h-[340px] sm:h-[380px] md:h-[440px]'
      />

      <section className={`px-6 md:px-12 ${MAP_TRANSITION_PT} ${CHAPTER_GAP_END} bg-[#faf9f6] dark:bg-black`}>
        <div className='max-w-2xl mx-auto flex flex-col items-center'>
          <Reveal className='flex flex-col items-center'>
            <RouteLabel>{label}</RouteLabel>
            {heading && (
              <ChapterHeading as='h2' className='mt-5 text-center'>{heading}</ChapterHeading>
            )}
          </Reveal>

          {paragraphs && (
            <Reveal delay={0.1} className='mt-8 text-center'>
              <Paragraphs items={paragraphs} />
            </Reveal>
          )}
        </div>

        {/* The photo -- a section-level sibling of the max-w-2xl content
            column above (not nested inside it), same structural pattern as
            the Austrian Airlines experience photo, so it can reach its own
            wider max-width. Same outer container width as that photo
            (max-w-5xl md:max-w-3xl mx-auto) per the destination page's own
            request, but shown at its natural aspect ratio rather than
            cropped into a fixed box -- this photo is portrait, so a
            landscape crop box would cut most of it away. */}
        {photo && (
          <Reveal delay={0.15} className='mt-14 md:mt-16 max-w-5xl md:max-w-3xl mx-auto'>
            <div className='relative w-full overflow-hidden rounded-[2px]'>
              <Image
                src={photo.src}
                alt={photo.alt}
                width={photo.width}
                height={photo.height}
                sizes='(min-width: 768px) 768px, 100vw'
                className='w-full h-auto'
              />
            </div>
          </Reveal>
        )}
      </section>
    </>
  );
}
