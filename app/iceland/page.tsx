'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import JourneyMapScene from '@/components/journey/JourneyMapScene';
import { RouteLabel, TimeStamp } from '@/components/journey/annotation-kit';
import { ChapterHeading, Eyebrow, Paragraphs } from '@/components/ui/typography';
import { InstagramIcon, PinterestIcon } from '@/components/ui/social-icons';
import { INSTAGRAM_URL, PINTEREST_URL } from '@/lib/social-links';
import {
  ICELAND_HOME_TO_LJUBLJANA_JOURNEY,
  ICELAND_LJUBLJANA_TO_KEFLAVIK_JOURNEY,
} from '@/lib/journeys/iceland';

const LOGO_SRC = '/metkish-logo.png';

// This is the BEGINNING of the Iceland page (hero through the Perlan /
// Reykjavík / Blue Lagoon story) -- per the user's explicit scope for
// this pass. The Iceland story is organised around places and
// experiences, not a day-by-day itinerary -- no "Day 1", "Day 2", etc.
// labels anywhere on this page. The rest of the story (the Golden Circle
// and South Coast excursions, a proper Hotel Frón accommodation section,
// etc.) is added in a later pass; this page intentionally ends where it
// does, with the shared footer closing it out so the page isn't left
// visually unfinished in the meantime. When the next chapter is added,
// the footer just moves down -- nothing above it needs to change.

// Same map->content pause, used verbatim after a JourneyMapScene on every
// other destination page -- see app/tenerife/page.tsx's own comment.
const MAP_TRANSITION_PT = 'pt-8 md:pt-10';
// Chapter-to-chapter transition spacing, same token/value as every other
// destination page -- goes on the bottom of a section that's ending right
// before a map.
const CHAPTER_GAP_END = 'pb-12 md:pb-14';
// Chapter-to-chapter transition spacing, the top half of the same pair --
// goes on the top of a section that starts a brand new chapter right
// after a text/photo ending (not a map).
const CHAPTER_GAP_START = 'pt-12 md:pt-14';

// Same fade-up-on-scroll rhythm used throughout the site (Tenerife,
// Barcelona, Rome, Italy pages) -- once-only, generous viewport threshold,
// no bounce.
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

// A compact single-leg flight row -- the same visual language as Rome's
// own TimelineLeg (pink dot, time -> time at the TimeStamp scale, station
// names, a small uppercase detail line, an optional note), simplified to a
// single leg since this is one direct flight each way, not a multi-leg
// train journey with a transfer.
function FlightLeg({
  fromTime,
  fromAirport,
  toTime,
  toAirport,
  detail,
  note,
}: {
  fromTime: string;
  fromAirport: string;
  toTime: string;
  toAirport: string;
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
          {fromAirport} &rarr; {toAirport}
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

export default function IcelandPage() {
  const [pastHero, setPastHero] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      // Same mobile/desktop threshold split as every other destination
      // page, so the logo shrinks at the same point in the scroll
      // everywhere.
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

      {/* 1. HERO -- Hero.jpeg, a real photo taken from the plane window on
          approach to Iceland: a colourful sunrise over the volcanic,
          glacier-dotted landscape, with the wing in frame. Same MPO fix
          applied sitewide (PIL.ImageOps.exif_transpose + convert to a
          plain single-frame RGB JPEG, EXIF stripped) before this page ever
          shipped -- the source file was an MPO container (EXIF
          Orientation 6) despite its .jpeg extension, same root cause as
          the Tenerife/Barcelona/Rome mobile-broken-image bug, fixed here
          proactively. The master was also re-saved at a max width of
          3840px (matching the largest responsive size this site ever
          requests) instead of its original 4284px, which was larger than
          any requested size and only added dead weight -- same recipe
          already used for every other hero on the site.
          Crop: the source is portrait (3:4). On mobile, object-cover
          crops the sides and shows the image's full height -- object-
          [80%_50%] biases that crop toward the right third so the wing
          (which sits in the upper-right of the frame) stays almost fully
          visible rather than being cut off by a centered crop. On desktop,
          object-cover shows the image's full width and crops top/bottom --
          md:object-[50%_38%] centers that crop just below the colourful
          band of sky so the gradient, the wing and the snow-capped
          mountain below are all in frame together. Both values were
          checked by rendering the actual object-fit:cover crop rectangle
          for mobile and desktop container aspect ratios and inspecting the
          result directly, the same "never guess the crop" discipline used
          for every other hero's object-position. No distortion: object-
          cover scales uniformly and only crops, it never stretches. */}
      <section className='relative h-[100svh] md:h-[100dvh] w-full overflow-hidden'>
        <Image
          src='/2025-10%20-%20Iceland/Hero_web.jpeg'
          alt='A colourful sunrise over Iceland’s volcanic, glacier-dotted landscape, seen from the plane with the wing in frame.'
          fill
          priority
          sizes='100vw'
          // Mobile performance fix, same recipe already validated on
          // Barcelona/Rome/Tenerife's own heroes: quality 65 (down from
          // the default 75) measurably trims this photo's bytes at the
          // sizes a phone actually requests, with no perceptible quality
          // loss -- safe here for the same reason as those pages, since
          // the flat bg-black/28 wash below already sits over the whole
          // photo for text legibility.
          quality={65}
          className='object-cover object-[80%_50%] md:object-[50%_38%]'
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
              Iceland
            </h1>
            <p
              className='mt-5 text-xs sm:text-sm uppercase tracking-[0.22em] font-[family-name:var(--font-poppins)] font-semibold text-white/80'
              style={{
                textShadow: '0 1px 10px rgba(0,0,0,0.5), 0 1px 3px rgba(0,0,0,0.4)',
              }}
            >
              Reykjavík · October 2025
            </p>
          </Reveal>
        </div>
      </section>

      {/* 2. MAP -- Home -> Ljubljana Airport only, same self-running
          once-in-view animation as every other Journey map on the site.
          Sits directly against the hero's bottom edge with zero gap, same
          as every other destination's own first map. */}
      <JourneyMapScene
        journey={ICELAND_HOME_TO_LJUBLJANA_JOURNEY}
        austriaEmphasis={false}
        heightClassName='h-[380px] sm:h-[440px] md:h-[500px]'
      />

      {/* 3. GETTING THERE -- parking + the outbound/return flight. The
          introductory Statement line that used to open this section
          ("Five days of waterfalls...") has been removed per explicit
          direction, so RouteLabel/"Getting There" is now the first
          element in the section (no delay/margin, matching the sitewide
          first-Reveal-in-a-section convention). Same map->content pause
          and CHAPTER_GAP_END close as every other destination's first
          chapter, since the flight map follows directly after this
          section. */}
      <section className={`px-6 md:px-12 ${MAP_TRANSITION_PT} ${CHAPTER_GAP_END} bg-[#faf9f6] dark:bg-black`}>
        <div className='max-w-2xl mx-auto text-center'>
          <Reveal>
            <RouteLabel>Getting There</RouteLabel>
            <ChapterHeading as='h2' italic className='mt-8 md:mt-10'>
              A direct flight from Ljubljana
            </ChapterHeading>
            <Paragraphs
              className='mt-5 text-center'
              items={[
                'We normally plan our trips independently, but this time we booked through a travel agency — mainly for the direct charter flight from Ljubljana straight to Keflavík, and a schedule that suited us perfectly.',
                'The agency also arranged our airport transfers and accommodation, which made this a slightly different kind of trip for us from the start.',
              ]}
            />
          </Reveal>

          {/* Parking fact card -- same quiet practical-information panel
              language used sitewide (no border, no shadow, same corner
              radius, same uppercase label styling, price at the TimeStamp
              scale). */}
          <Reveal delay={0.15} className='mt-9 md:mt-11 mx-auto max-w-[400px] rounded-[3px] bg-[#f1ebdc] dark:bg-white/[0.04] px-7 py-7 md:px-8 md:py-8 flex flex-col items-center gap-2 text-center'>
            <span className='text-xs uppercase tracking-[0.18em] font-[family-name:var(--font-poppins)] font-semibold text-black/45 dark:text-white/45'>
              Ljubljana Airport · Covered Garage
            </span>
            <TimeStamp size='md'>€70</TimeStamp>
            <span className='text-sm font-[family-name:var(--font-poppins)] text-black/60 dark:text-white/60'>
              17 Oct, 00:00 → 22 Oct, 06:00
            </span>
          </Reveal>

          {/* FLIGHT SCHEDULE -- outbound and return, each a single direct
              leg (no transfer row needed, unlike Rome's multi-leg train
              timeline). Flight-time figures are derived from the given
              local departure/arrival clock times: Slovenia was still on
              CEST (UTC+2) on both 17 and 21 October 2025 (DST doesn't end
              until the last Sunday of October), and Iceland keeps UTC+0
              year-round with no DST, which is where "4h 25m" / "4h 15m"
              below come from. */}
          <Reveal delay={0.25} className='mt-12 md:mt-14 flex flex-col items-center'>
            <Eyebrow>The Flight</Eyebrow>
            <ChapterHeading as='h3' italic className='mt-3'>
              Ljubljana to Keflavík
            </ChapterHeading>
          </Reveal>

          <Reveal delay={0.3} className='mt-8 md:mt-10 max-w-sm mx-auto text-left'>
            <span className='block text-xs uppercase tracking-[0.18em] font-[family-name:var(--font-poppins)] font-semibold text-black/45 dark:text-white/45'>
              Outbound · 17 October 2025
            </span>
            <div className='mt-4'>
              <FlightLeg
                fromTime='05:00'
                fromAirport='Ljubljana'
                toTime='07:25'
                toAirport='Keflavík'
                detail='Direct charter flight · 4h 25m'
              />
            </div>
          </Reveal>

          <Reveal delay={0.35} className='mt-8 md:mt-10 max-w-sm mx-auto text-left'>
            <span className='block text-xs uppercase tracking-[0.18em] font-[family-name:var(--font-poppins)] font-semibold text-black/45 dark:text-white/45'>
              Return · 21 October 2025
            </span>
            <div className='mt-4'>
              <FlightLeg
                fromTime='18:25'
                fromAirport='Keflavík'
                toTime='00:40'
                toAirport='Ljubljana'
                detail='Direct charter flight · 4h 15m'
                note='Arrives after midnight, 21 → 22 October'
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* 4. FLIGHT MAP -- Ljubljana Airport -> Keflavík International
          Airport, the flight itself (not Reykjavík -- see
          lib/journeys/iceland.ts for why the real landing point is
          correctly Keflavík, ~50km from the city). Same self-running
          once-in-view animation and the same beige/pink editorial-atlas
          styling as the Home->Ljubljana map above, and the same two-leg
          "fly in, hold on arrival" shape as every other flight map on the
          site. Sits directly against the previous section with zero gap. */}
      <JourneyMapScene
        journey={ICELAND_LJUBLJANA_TO_KEFLAVIK_JOURNEY}
        austriaEmphasis={false}
        heightClassName='h-[420px] sm:h-[480px] md:h-[580px]'
      />

      {/* 5. WHERE WE STAYED -- Hotel Frón, inserted between the flight
          map above and the first-impressions story below, per explicit
          placement direction. Same map->content transition spacing as
          every other section that follows a JourneyMapScene directly
          (MAP_TRANSITION_PT, not the heavier CHAPTER_GAP_START -- see
          the "Getting There" section earlier on this page for the same
          pattern). Deliberately text-only, no photos -- per explicit
          direction, this stays a short personal account rather than a
          full accommodation review with imagery. The heading's dash was
          normalised from an en dash to an em dash to match the em-dash
          convention used for every other "Place — subtitle" heading on
          this page and sitewide (e.g. "Blue Lagoon — Commercialized, but
          Absolutely Worth It" just below). */}
      <section className={`px-6 md:px-12 ${MAP_TRANSITION_PT} ${CHAPTER_GAP_END} bg-[#faf9f6] dark:bg-black`}>
        <div className='max-w-2xl mx-auto text-center'>
          <Reveal>
            <RouteLabel>Where We Stayed</RouteLabel>
            <ChapterHeading as='h2' italic className='mt-8 md:mt-10'>
              Hotel Frón — A Great Location, but Not My Favourite Stay
            </ChapterHeading>
            <Paragraphs
              className='mt-5 text-center'
              items={[
                'Our accommodation was arranged by the travel agency, and we stayed at Hotel Frón in central Reykjavík.',
                'The location was excellent. We were right in the city centre, which made exploring Reykjavík on foot very convenient.',
                "However, I wasn't particularly happy with our apartment. There wasn't one specific thing I could point to — I simply didn't feel comfortable there.",
                'Looking back, I think I would have preferred choosing our accommodation myself. Still, I have to give Hotel Frón credit for its location, which was definitely its biggest advantage.',
              ]}
            />
          </Reveal>
        </div>
      </section>

      {/* 6. OUR FIRST IMPRESSIONS OF ICELAND -- organised around places
          and experiences (Perlan, Reykjavík/Sun Voyager, Blue Lagoon),
          not a day-by-day itinerary -- this chapter has no heading of
          its own (removed per explicit direction, so the accommodation
          section above flows straight into Perlan below) and no
          "Day 1"/"Day 2"/"Day 3" labels appear anywhere on this page.
          Each of the three place-subsections gets the same small pink
          accent line as every other Metkish
          sub-chapter (RouteLabel, see components/journey/annotation-kit)
          -- reused as-is, not a new design. No Perlan photograph exists,
          so that sub-beat is text-only -- no placeholder or stock image.
          Three real photos used, identified by visual content rather
          than by filename (Iceland.jpeg, despite its generic name, is
          the moss-covered lava field, not a general Iceland shot): Sun
          Voyager.jpg, Blue Lagoon.jpeg and Iceland.jpeg, each re-saved as
          a `_web` sibling (Sun Voyager_web.jpeg, Blue Lagoon_web.jpeg,
          Iceland_web.jpeg) via the same recipe used sitewide --
          PIL.ImageOps.exif_transpose + convert to a plain single-frame
          RGB JPEG, EXIF stripped, width capped at 2000px -- since all
          three source files were MPO containers despite their
          .jpeg/.jpg extensions (same bug as Rome/Barcelona/Tenerife's
          hero photos). The Blue Lagoon water/volcanic-rock/steam photo
          sits right under the Blue Lagoon heading, before its own text,
          so the two Blue Lagoon photos (this one and the moss-covered
          lava field after the text) read as two separate visual beats
          rather than a back-to-back pair. The former "Finally, Our
          Hotel" transition has been removed entirely -- Hotel Frón gets
          its own proper accommodation section in a later pass, along
          with the rest of the Iceland story (see top-of-file comment).
          No flight information is repeated here and no prices appear
          anywhere in this section, per explicit direction. */}
      <section className={`px-6 md:px-12 ${CHAPTER_GAP_START} ${CHAPTER_GAP_END} bg-[#faf9f6] dark:bg-black`}>
        <div className='max-w-2xl mx-auto text-center'>
          <Reveal>
            <RouteLabel>Perlan</RouteLabel>
            <ChapterHeading as='h3' italic className='mt-3'>
              An Unexpected Highlight
            </ChapterHeading>
            <Paragraphs
              className='mt-5 text-center'
              items={[
                'Our first stop after arriving in Iceland was Perlan Museum, and it turned out to be a fascinating experience, especially with the children.',
                "One of the highlights was the indoor ice cave, where we could experience something of Iceland's frozen world. We also watched the northern lights show in the planetarium.",
                "Of course, watching the northern lights in a planetarium isn't the same as seeing them in the sky. We had originally booked a northern lights excursion but cancelled it before departure.",
                'Travelling with children, we preferred this experience to spending a cold night outside after a long day, hoping the northern lights might appear. For us, it was the right decision.',
              ]}
            />
          </Reveal>

          <Reveal delay={0.15} className='mt-10 md:mt-12'>
            <RouteLabel>Exploring Reykjavík</RouteLabel>
            <Paragraphs
              className='mt-5 text-center'
              items={[
                "After Perlan, we spent some time exploring Reykjavík. One of our stops was Sun Voyager, the beautiful steel sculpture by the waterfront -- with the sea and mountains in the background, it was a lovely introduction to Iceland's scenery.",
              ]}
            />
          </Reveal>
        </div>

        <Reveal delay={0.2} className='mt-10 md:mt-12 max-w-sm sm:max-w-md mx-auto'>
          <Image
            src='/2025-10%20-%20Iceland/Sun%20Voyager_web.jpeg'
            alt='The stainless-steel Sun Voyager sculpture on the Reykjavík waterfront, with the sea and snow-capped mountains behind it.'
            width={2000}
            height={1696}
            sizes='(min-width: 640px) 448px, 90vw'
            className='w-full h-auto rounded-[2px]'
          />
          <p className='mt-3 text-center text-sm italic font-[family-name:var(--font-poppins)] text-black/55 dark:text-white/55'>
            Sun Voyager in Reykjavík, with the sea and mountains in the
            background.
          </p>
        </Reveal>

        <div className='max-w-2xl mx-auto text-center'>
          <Reveal delay={0.25} className='mt-10 md:mt-12'>
            <RouteLabel>Blue Lagoon</RouteLabel>
            <ChapterHeading as='h3' italic className='mt-3'>
              Commercialized, but Absolutely Worth It
            </ChapterHeading>
          </Reveal>
        </div>

        <Reveal delay={0.28} className='mt-8 md:mt-10 max-w-sm sm:max-w-md mx-auto'>
          <Image
            src='/2025-10%20-%20Iceland/Blue%20Lagoon_web.jpeg'
            alt='The milky pale-blue waters of the Blue Lagoon, dark volcanic rock in the foreground and steam rising from the geothermal plant beyond.'
            width={2000}
            height={1500}
            sizes='(min-width: 640px) 448px, 90vw'
            className='w-full h-auto rounded-[2px]'
          />
          <p className='mt-3 text-center text-sm italic font-[family-name:var(--font-poppins)] text-black/55 dark:text-white/55'>
            Blue Lagoon — milky-blue water surrounded by a dramatic
            volcanic landscape.
          </p>
        </Reveal>

        <div className='max-w-2xl mx-auto text-center'>
          <Reveal delay={0.32} className='mt-8 md:mt-10'>
            <Paragraphs
              className='text-center'
              items={[
                "Later that day, we headed to Blue Lagoon, one of Iceland's most famous attractions. Despite its popularity, I was genuinely impressed by what we experienced.",
                "What fascinated us most wasn't just the milky-blue geothermal water, but the extraordinary volcanic landscape surrounding the lagoon.",
                'There had been a volcanic eruption in the area before our visit, and the lava had come remarkably close to the bathing complex. Seeing the contrast between the dark volcanic rock, rising steam and pale-blue water was unforgettable.',
              ]}
            />
          </Reveal>
        </div>

        <Reveal delay={0.35} className='mt-10 md:mt-12 max-w-sm sm:max-w-md mx-auto'>
          <Image
            src='/2025-10%20-%20Iceland/Iceland_web.jpeg'
            alt='Vivid green moss draped over dark, jagged volcanic lava rock near the Blue Lagoon.'
            width={2000}
            height={2667}
            sizes='(min-width: 640px) 448px, 90vw'
            className='w-full h-auto rounded-[2px]'
          />
          <p className='mt-3 text-center text-sm italic font-[family-name:var(--font-poppins)] text-black/55 dark:text-white/55'>
            Moss-covered lava rocks — another unforgettable part of
            Iceland&apos;s landscape.
          </p>
        </Reveal>
      </section>

      {/* 7. EXPLORING THE GOLDEN CIRCLE -- another place-and-experience
          chapter (Þingvellir, Geysir & Strokkur, Gullfoss), immediately
          following the first-impressions section above. No "Day 2"
          label, matching the rest of this page. Each location heading
          gets the same small pink accent line as the previous section
          (RouteLabel, reused as-is -- no new design); since the given
          copy gives no separate editorial subtitle for any of the three
          places (unlike Perlan/Blue Lagoon above), the location name
          itself is the heading, exactly as given. The Þingvellir photo
          and video are deliberately not adjacent -- the second Þingvellir
          paragraph sits between them, per explicit direction, so the
          layout doesn't read as a heavy back-to-back media pair. Geysir
          and Gullfoss each have only one piece of media (video), sized
          more prominently than Þingvellir's supporting pair, matching
          the "one dominant clip" treatment used elsewhere on the site
          (Tenerife's wide sailing clip, Italy's Cinque Terre clip). All
          four media files already existed in the repo's Iceland photo
          folder under the exact filenames given; the three source videos
          were raw phone/4K .MOV files, re-encoded to web-weight .mp4
          (h264, no audio track -- every video on this site renders
          muted, so audio was always dead weight; faststart for
          streaming) at the same resolution caps used sitewide (720p for
          the one landscape clip, Gullfoss; ~640px-wide for the two
          portrait clips) -- same treatment as Rome's Papa_web.mp4 and
          Tenerife/Italy's own web clips. The Þingvellir photo was MPO
          despite its .jpeg extension (same sitewide bug fixed
          proactively elsewhere) and got the same PIL.ImageOps.
          exif_transpose + plain RGB JPEG + EXIF-stripped + 2000px-wide
          treatment as every other content photo. */}
      <section className={`px-6 md:px-12 ${CHAPTER_GAP_START} ${CHAPTER_GAP_END} bg-[#faf9f6] dark:bg-black`}>
        <div className='max-w-2xl mx-auto text-center'>
          <Reveal>
            <ChapterHeading as='h2' italic>
              Exploring the Golden Circle
            </ChapterHeading>
            <Paragraphs
              className='mt-5 text-center'
              items={[
                "We were lucky with the weather. The sky cleared, the sun came out, and we had a beautiful day for exploring Iceland's Golden Circle.",
                'We joined an organised excursion and visited three very different places — from the landscape of Þingvellir to the erupting geysers and the powerful Gullfoss waterfall.',
              ]}
            />
          </Reveal>

          <Reveal delay={0.08} className='mt-10 md:mt-12'>
            <RouteLabel>Þingvellir National Park</RouteLabel>
            <Paragraphs
              className='mt-5 text-center'
              items={[
                'Our first stop was Þingvellir National Park, where the North American and Eurasian tectonic plates are slowly moving apart.',
              ]}
            />
          </Reveal>
        </div>

        <Reveal delay={0.12} className='mt-10 md:mt-12 max-w-sm sm:max-w-md mx-auto'>
          <Image
            src='/2025-10%20-%20Iceland/%C3%9Eingvellir%20National%20Park_web.jpeg'
            alt='The Þingvellir rift valley in autumn, with a stream and distant mountains, where the North American and Eurasian tectonic plates meet.'
            width={2000}
            height={1500}
            sizes='(min-width: 640px) 448px, 90vw'
            className='w-full h-auto rounded-[2px]'
          />
          <p className='mt-3 text-center text-sm italic font-[family-name:var(--font-poppins)] text-black/55 dark:text-white/55'>
            Autumn scenery at Þingvellir National Park.
          </p>
        </Reveal>

        <div className='max-w-2xl mx-auto text-center'>
          <Reveal delay={0.16} className='mt-8 md:mt-10'>
            <Paragraphs
              className='text-center'
              items={[
                'Seeing this landscape in person was fascinating. With the autumn colours, water and mountains in the distance, it was a beautiful place to explore — and even more interesting knowing that we were standing in an area shaped by the movement of two tectonic plates.',
              ]}
            />
          </Reveal>
        </div>

        <Reveal delay={0.2} className='mt-8 md:mt-10 max-w-[240px] sm:max-w-xs mx-auto'>
          <div className='relative w-full overflow-hidden rounded-[2px] aspect-[9/16]'>
            <video
              src='/2025-10%20-%20Iceland/%C3%9Eingvellir%20National%20Park_web.mp4'
              autoPlay
              muted
              loop
              playsInline
              preload='auto'
              aria-label='Walking along the rift at Þingvellir National Park, between the North American and Eurasian tectonic plates.'
              className='absolute inset-0 h-full w-full object-cover'
            />
          </div>
          <p className='mt-3 text-center text-sm italic font-[family-name:var(--font-poppins)] text-black/55 dark:text-white/55'>
            Exploring the landscape between two tectonic plates.
          </p>
        </Reveal>

        <div className='max-w-2xl mx-auto text-center'>
          <Reveal delay={0.25} className='mt-10 md:mt-12'>
            <RouteLabel>Geysir &amp; Strokkur</RouteLabel>
            <Paragraphs
              className='mt-5 text-center'
              items={[
                'Our next stop was the geothermal area of Geysir, which was particularly exciting for the children. They had never seen anything like it before.',
                "It's difficult to believe that the water bubbling and flowing through parts of this landscape can reach temperatures of around 100°C.",
                "The most interesting part was waiting for Strokkur to erupt. You don't know exactly when it's going to happen, so everyone stands watching, phones in hand, hoping to capture the moment.",
                'And then, suddenly, water shoots high into the air. Some people manage to record it, while others miss the moment completely and have to wait for the next eruption.',
              ]}
            />
          </Reveal>
        </div>

        <Reveal delay={0.3} className='mt-10 md:mt-12 max-w-[300px] sm:max-w-[400px] md:max-w-[520px] mx-auto'>
          <div className='relative w-full overflow-hidden rounded-[2px] aspect-[9/16]'>
            <video
              src='/2025-10%20-%20Iceland/Geysir_web.mp4'
              autoPlay
              muted
              loop
              playsInline
              preload='auto'
              aria-label='The Strokkur geyser erupting, water and steam shooting high into the air at the Geysir geothermal area.'
              className='absolute inset-0 h-full w-full object-cover'
            />
          </div>
          <p className='mt-3 text-center text-sm italic font-[family-name:var(--font-poppins)] text-black/55 dark:text-white/55'>
            Waiting for Strokkur to erupt.
          </p>
        </Reveal>

        <div className='max-w-2xl mx-auto text-center'>
          <Reveal delay={0.35} className='mt-10 md:mt-12'>
            <RouteLabel>Gullfoss Waterfall</RouteLabel>
            <Paragraphs
              className='mt-5 text-center'
              items={[
                "Our final stop was Gullfoss, one of Iceland's most impressive waterfalls.",
                'What I remember most is the spray from the waterfall. The closer we walked towards it, the more we could feel the water — and we all got a little wet.',
                'Thanks to the sunshine and the mist rising from the waterfall, rainbows appeared everywhere. With the cold Icelandic air around us, the whole scene felt almost magical.',
              ]}
            />
          </Reveal>
        </div>

        <Reveal delay={0.4} className='mt-10 md:mt-12 max-w-3xl mx-auto'>
          <div className='relative w-full overflow-hidden rounded-[2px] aspect-[16/9]'>
            <video
              src='/2025-10%20-%20Iceland/Gullfoss_web.mp4'
              autoPlay
              muted
              loop
              playsInline
              preload='auto'
              aria-label='Gullfoss waterfall seen from close by, a wide curtain of water falling into the canyon with a rainbow in the spray.'
              className='absolute inset-0 h-full w-full object-cover'
            />
          </div>
          <p className='mt-3 text-center text-sm italic font-[family-name:var(--font-poppins)] text-black/55 dark:text-white/55'>
            Gullfoss waterfall, seen up close.
          </p>
        </Reveal>
      </section>

      {/* FOOTER -- the same shared footer as every other destination page
          (Rome, Tenerife, Barcelona): logo, tagline, site nav, email,
          social icons and copyright. This page is intentionally
          unfinished (see the top-of-file comment) -- the footer just
          moves down as more sections are added later. */}
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
