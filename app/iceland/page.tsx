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
  ICELAND_ARRIVAL_BLUE_LAGOON_JOURNEY,
  ICELAND_GOLDEN_CIRCLE_JOURNEY,
  ICELAND_SOUTH_COAST_JOURNEY,
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

// Same "My tip" treatment used throughout the site (Rome/Barcelona's own
// InlineTip, copied here verbatim rather than imported, same spirit as
// every other small one-off presentational helper on these pages): a
// thin pink left rule, left-aligned italic text, no label, no background.
function InlineTip({ children }: { children: ReactNode }) {
  // text-left is explicit, not inherited: this component is always used
  // inside a text-center column (every "My tip" box site-wide sat inside
  // one), which silently center-aligned every tip's text including the
  // label. Forcing it here, once, at the component itself fixes every
  // existing usage across Rome/Barcelona/Iceland and any future one,
  // regardless of what alignment its wrapping container happens to use.
  return (
    <p className='border-l-2 border-pink-300 dark:border-pink-400/60 pl-4 text-left text-base italic font-[family-name:var(--font-poppins)] font-light text-black/75 dark:text-white/75 leading-relaxed'>
      {children}
    </p>
  );
}

// What the Reynisfjara warning-signs photo's lightbox needs to render the
// full-resolution image once clicked.
type LightboxImage = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

// Full-screen lightbox for an enlarged photo: dark backdrop, the image at
// its natural size (capped to the viewport), and an explicit close button
// -- plus clicking the backdrop or pressing Escape also closes it. Byte-
// identical to hotels-article.tsx/flights-article.tsx's own Lightbox, the
// one modal-type UI already used elsewhere on the site, reused here so the
// Reynisfjara warning signs' small print can be read at full size.
function Lightbox({
  image,
  onClose,
}: {
  image: LightboxImage;
  onClose: () => void;
}) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  return (
    <div
      role='dialog'
      aria-modal='true'
      aria-label={image.alt}
      onClick={onClose}
      className='fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 md:p-10'
    >
      <button
        type='button'
        onClick={onClose}
        aria-label='Close enlarged image'
        className='absolute top-4 right-4 md:top-6 md:right-6 flex h-11 w-11 items-center justify-center rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors'
      >
        <svg
          width='22'
          height='22'
          viewBox='0 0 22 22'
          fill='none'
          stroke='currentColor'
          strokeWidth='1.75'
          strokeLinecap='round'
        >
          <line x1='3' y1='3' x2='19' y2='19' />
          <line x1='19' y1='3' x2='3' y2='19' />
        </svg>
      </button>
      <Image
        src={image.src}
        alt={image.alt}
        width={image.width}
        height={image.height}
        onClick={(e) => e.stopPropagation()}
        className='max-h-full max-w-full w-auto h-auto object-contain rounded-[2px]'
      />
    </div>
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
  // Lightbox state for the Reynisfjara warning-signs photo -- the site's
  // existing full-screen enlargement pattern (byte-identical Lightbox
  // component below, copied from hotels-article.tsx/flights-article.tsx's
  // own Screenshot/Lightbox pair), reused here rather than inventing a
  // new one, per explicit direction.
  const [lightboxImage, setLightboxImage] = useState<LightboxImage | null>(null);

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

      {/* MAP ONE -- ARRIVAL & BLUE LAGOON (added per explicit request,
          local-only pending review -- see this file's own top-of-file
          scope note). Keflavik Airport -> Reykjavik -> Blue Lagoon ->
          Reykjavik, our actual first-day loop. Sits right before the
          first-impressions section below, since that section is exactly
          the arrival/Reykjavik/Blue Lagoon story this map traces -- same
          "map directly before the content it illustrates" placement
          already used for the Home->Ljubljana and flight maps above.
          Perlan is deliberately NOT on this route -- its exact order and
          transport arrangements within the day haven't been confirmed
          yet, so it stays off the map until they are (see
          lib/journeys/iceland.ts's own note on
          ICELAND_ARRIVAL_BLUE_LAGOON_JOURNEY). Same self-running
          once-in-view animation, same beige/pink editorial-atlas
          styling, and the same heightClassName scale as the two maps
          above (a close three-stop regional loop, sized nearer the
          Home->Ljubljana map's own height than the wider flight map's).
          The small bus icon riding the route is this map engine's
          existing 'transfer' vehicle mode, rendered with a clean, solid
          top-down bus silhouette (see
          components/journey/JourneyMapScene.tsx's own BUS_BODY_PATH),
          redesigned per explicit feedback to read clearly at this size
          and face the real direction of travel -- used nowhere else on
          the site, so the change is scoped to this mode's own icon with
          no effect on any other destination's maps. The map itself draws
          no text per vehicle mode, so the caption directly below spells
          out what the icon means, in the exact same small italic caption
          style already used for every photo/video caption on this page --
          not a new style, just this page's existing caption treatment
          applied under a map for the first time. */}
      <JourneyMapScene
        journey={ICELAND_ARRIVAL_BLUE_LAGOON_JOURNEY}
        austriaEmphasis={false}
        heightClassName='h-[420px] sm:h-[480px] md:h-[560px]'
      />
      <p className='px-6 mt-3 text-center text-sm italic font-[family-name:var(--font-poppins)] text-black/55 dark:text-white/55'>
        From Keflavík Airport to Reykjavík, with a stop at the Blue
        Lagoon.
      </p>

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
      <section className={`px-6 md:px-12 ${MAP_TRANSITION_PT} ${CHAPTER_GAP_END} bg-[#faf9f6] dark:bg-black`}>
        <div className='max-w-2xl mx-auto text-center'>
          <Reveal>
            <RouteLabel>Perlan</RouteLabel>
            <Paragraphs
              className='mt-5 text-center'
              items={[
                'Our first stop after arriving in Iceland was Perlan Museum, and it turned out to be a fascinating experience, especially with the children.',
                "One of the highlights was the indoor ice cave, where we could experience something of Iceland's frozen world. We also watched the northern lights show in the planetarium.",
                'Of course, seeing the northern lights in the Icelandic sky would be an unforgettable experience, and I would still love to see them one day.',
                "We had originally booked a northern lights excursion but decided to cancel it before our trip. After a long journey, with tired children and another busy day ahead, spending hours outside in the cold, without knowing whether the lights would appear, simply didn't feel like the right choice for us.",
                "Sometimes, especially when travelling with children, you have to make these decisions. It doesn't mean the experience is any less special — just that the timing wasn't right for us.",
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
        </div>
      </section>

      {/* MAP TWO -- GOLDEN CIRCLE (added per explicit request,
          local-only pending review -- see this file's own top-of-file
          scope note). Reykjavik -> Þingvellir -> Geysir & Strokkur ->
          Gullfoss -> Reykjavik, all four stops connected by the existing
          pink route line. Placed at the very beginning of this chapter
          -- right after the chapter heading/intro paragraph above,
          before any of the three individual attraction descriptions
          below -- per explicit placement direction. The section above
          was split into two <section> elements purely so this map can
          render full-width between them, matching every other Metkish
          map's own width/alignment (a map has never been nested inside
          this page's max-w-2xl text column) -- no existing text,
          heading, photograph, video or caption was altered, removed or
          reordered; the Þingvellir/Geysir/Gullfoss content below is
          exactly as it was, just continued in a second section with the
          same background and gap tokens as the first. Same self-running
          once-in-view animation and beige/pink editorial-atlas styling
          as every other map on this page. Same 'transfer' bus icon
          as Map One above (see that map's own comment for the full
          reasoning) -- this is an organised excursion, not a self-driven
          rental car, so the caption below spells that out in the exact
          same caption style already used throughout this page, per
          explicit direction to label the bus icon "Organised
          excursion". */}
      <JourneyMapScene
        journey={ICELAND_GOLDEN_CIRCLE_JOURNEY}
        austriaEmphasis={false}
        heightClassName='h-[420px] sm:h-[480px] md:h-[560px]'
      />
      <p className='px-6 mt-3 text-center text-sm italic font-[family-name:var(--font-poppins)] text-black/55 dark:text-white/55'>
        Our Golden Circle route through Þingvellir National Park, Geysir
        and Gullfoss.
      </p>

      <section className={`px-6 md:px-12 ${MAP_TRANSITION_PT} ${CHAPTER_GAP_END} bg-[#faf9f6] dark:bg-black`}>
        <div className='max-w-2xl mx-auto text-center'>
          <Reveal>
            <RouteLabel>Þingvellir National Park</RouteLabel>
            <Paragraphs
              className='mt-5 text-center'
              items={[
                'Our first stop was Þingvellir National Park, where the North American and Eurasian tectonic plates are slowly moving apart.',
              ]}
            />
          </Reveal>
        </div>

        <Reveal delay={0.12} className='mt-10 md:mt-12 max-w-md sm:max-w-xl md:max-w-[800px] mx-auto'>
          <Image
            src='/2025-10%20-%20Iceland/%C3%9Eingvellir%20National%20Park_web.jpeg'
            alt='The Þingvellir rift valley in autumn, with a stream and distant mountains, where the North American and Eurasian tectonic plates meet.'
            width={2000}
            height={1500}
            sizes='(min-width: 768px) 800px, (min-width: 640px) 576px, 90vw'
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

      {/* 8. EXPLORING ICELAND'S SOUTH COAST -- final real content chapter,
          placed directly after the Golden Circle section above, per
          explicit placement direction. Same text/photo-ending ->
          new-chapter spacing as every other chapter transition on this
          page (CHAPTER_GAP_START/END, no map between them). Three places
          (Seljalandsfoss, Skogafoss, Reynisfjara), each its own
          "RouteLabel place name + ChapterHeading subtitle" sub-chapter --
          same "Place / Subtitle" convention as Perlan/Blue Lagoon above,
          since (like those two, and unlike the Golden Circle's three
          attractions) each place here was given its own distinct
          editorial subtitle rather than just a bare location name. No
          "Day N" label, matching the rest of the page. Body text is the
          exact wording supplied, unedited, split only into the existing
          Paragraphs component's array-of-strings shape. All photos are
          real files from the Iceland media folder (the MPO-despite-
          .jpeg/.jpg bug hit five of them -- Seljalandsfoss Waterfall.jpeg
          and all three Reynisfjara photos plus Sneaky_wave.jpg -- fixed
          with the same PIL.ImageOps.exif_transpose + plain RGB JPEG +
          EXIF-stripped + 2000px-wide recipe used everywhere else on this
          site, saved as the usual `_web` sibling); no stock imagery
          anywhere. All three videos needed re-encoding before they could
          safely ship: the Seljalandsfoss clip arrived as a .MOV
          container, and the Skogafoss and sneaker-wave clips were HEVC
          (H.265), a codec that doesn't play in every browser (notably
          older Android Chrome/Firefox) -- all three were re-encoded to
          H.264 + AAC in an .mp4 container with faststart for quick
          start-of-playback, each capped at a sensible resolution for its
          role (720p for the landscape Skogafoss clip, ~720-810px wide
          for the two portrait clips) to keep the page fast without
          re-trimming a single frame of content -- the sneaker-wave
          clip's duration was verified unchanged end to end, since its
          whole point is the unedited reaction, camera-tilt included.
          Unlike the autoplay/muted/loop background clips earlier on this
          page, all three of these use controls + a poster frame (a real
          extracted video frame, not a separate photo) and no autoplay,
          per explicit direction -- these clips carry real, meaningful
          audio (voices, the children behind the waterfall, the sneaker-
          wave scream) that autoplaying muted would have thrown away, so
          playback is left to the visitor, sound and all. */}
      <section className={`px-6 md:px-12 ${CHAPTER_GAP_START} ${CHAPTER_GAP_END} bg-[#faf9f6] dark:bg-black`}>
        <div className='max-w-2xl mx-auto text-center'>
          <Reveal>
            <ChapterHeading as='h2' italic>
              Exploring Iceland&apos;s South Coast
            </ChapterHeading>
          </Reveal>
        </div>
      </section>

      {/* MAP THREE -- SOUTH COAST (added per explicit request, local-only
          pending review -- see this file's own top-of-file scope note
          and the Golden Circle map's own comment above for the general
          pattern). Reykjavik -> Seljalandsfoss -> Skogafoss ->
          Reynisfjara -> Vik -> Reykjavik, all five legs carrying a real,
          OSRM-verified route (see lib/journeys/iceland.ts's own
          ICELAND_SOUTH_COAST_JOURNEY comment for the full methodology,
          including the corrected Reynisfjara coordinate and the shared
          Selfoss-area interchange re-verified for both the outbound and
          return legs). Placed at the very beginning of this chapter --
          right after the chapter heading above, before any of the four
          individual attraction descriptions below -- per explicit
          placement direction, same "split the section so the map renders
          full-width between them" approach as the Golden Circle map; no
          existing text, heading, photograph, video or caption was
          altered, removed or reordered. Same self-running once-in-view
          animation, beige/pink editorial-atlas styling, and 'transfer'
          bus icon as every other map on this page -- this was again an
          organised excursion, not a self-driven rental car, so the
          caption below uses the suggested wording directly. */}
      <JourneyMapScene
        journey={ICELAND_SOUTH_COAST_JOURNEY}
        austriaEmphasis={false}
        heightClassName='h-[420px] sm:h-[480px] md:h-[560px]'
      />
      <p className='px-6 mt-3 text-center text-sm italic font-[family-name:var(--font-poppins)] text-black/55 dark:text-white/55'>
        Our South Coast route from Reykjavík to Vík, passing waterfalls
        and the black sand beach at Reynisfjara.
      </p>

      <section className={`px-6 md:px-12 ${MAP_TRANSITION_PT} ${CHAPTER_GAP_END} bg-[#faf9f6] dark:bg-black`}>
        <div className='max-w-2xl mx-auto text-center'>
          <Reveal delay={0.08} className=''>
            <RouteLabel>Seljalandsfoss</RouteLabel>
            <ChapterHeading as='h3' italic className='mt-3'>
              Walking Behind a Waterfall
            </ChapterHeading>
            <Paragraphs
              className='mt-5 text-center'
              items={[
                'Seljalandsfoss is one of those waterfalls that offers something a little different — you can actually walk behind it.',
                'Both of our children decided to take the path behind the falling water, wearing raincoats, of course. Watching people disappear behind the waterfall was fascinating, and it made this stop much more than just another beautiful view.',
              ]}
            />
          </Reveal>
        </div>

        <Reveal delay={0.12} className='mt-10 md:mt-12 max-w-sm sm:max-w-md mx-auto'>
          <Image
            src='/2025-10%20-%20Iceland/south-coast/seljalandsfoss/Seljalandsfoss%20Waterfall_web.jpeg'
            alt='Seljalandsfoss waterfall seen from the side, with the path and visitors walking behind the falling water.'
            width={2000}
            height={2667}
            sizes='(min-width: 640px) 448px, 90vw'
            className='w-full h-auto rounded-[2px]'
          />
          <p className='mt-3 text-center text-sm italic font-[family-name:var(--font-poppins)] text-black/55 dark:text-white/55'>
            The path behind Seljalandsfoss, with visitors making their way through the spray.
          </p>
        </Reveal>

        <Reveal delay={0.16} className='mt-8 md:mt-10 max-w-[240px] sm:max-w-xs mx-auto'>
          <div className='relative w-full overflow-hidden rounded-[2px] aspect-[9/16]'>
            <video
              src='/2025-10%20-%20Iceland/south-coast/seljalandsfoss/Seljalandsfoss%20Waterfall_video_web.mp4'
              controls
              playsInline
              preload='metadata'
              poster='/2025-10%20-%20Iceland/south-coast/seljalandsfoss/Seljalandsfoss%20Waterfall_video_poster.jpg'
              aria-label='Walking along the path behind Seljalandsfoss waterfall, raincoats on against the spray.'
              className='absolute inset-0 h-full w-full object-cover'
            />
          </div>
          <p className='mt-3 text-center text-sm italic font-[family-name:var(--font-poppins)] text-black/55 dark:text-white/55'>
            Walking behind the falling water at Seljalandsfoss.
          </p>
        </Reveal>

        <div className='max-w-2xl mx-auto text-center'>
          <Reveal delay={0.2} className='mt-10 md:mt-12'>
            <RouteLabel>Skógafoss</RouteLabel>
            <ChapterHeading as='h3' italic className='mt-3'>
              A Waterfall Worth Climbing For
            </ChapterHeading>
            <Paragraphs
              className='mt-5 text-center'
              items={[
                'Skógafoss was our next stop. A walking path and staircase lead up alongside the waterfall, and all four of us made the climb.',
                'But my favourite view was actually from below. Watching the tiny figures of people making their way up beside such an enormous waterfall really puts its size into perspective.',
              ]}
            />
          </Reveal>
        </div>

        <Reveal delay={0.25} className='mt-10 md:mt-12 max-w-3xl mx-auto'>
          <div className='relative w-full overflow-hidden rounded-[2px] aspect-[16/9]'>
            <video
              src='/2025-10%20-%20Iceland/south-coast/skogafoss/Sk%C3%B3gafoss%20Waterfall_web.mp4'
              controls
              playsInline
              preload='metadata'
              poster='/2025-10%20-%20Iceland/south-coast/skogafoss/Sk%C3%B3gafoss%20Waterfall_poster.jpg'
              aria-label='The staircase and path beside Skógafoss waterfall, seen from below, with people climbing it looking tiny next to the falls.'
              className='absolute inset-0 h-full w-full object-cover'
            />
          </div>
          <p className='mt-3 text-center text-sm italic font-[family-name:var(--font-poppins)] text-black/55 dark:text-white/55'>
            The climb beside Skógafoss, seen from below.
          </p>
        </Reveal>

        <div className='max-w-2xl mx-auto text-center'>
          <Reveal delay={0.3} className='mt-10 md:mt-12'>
            <RouteLabel>Reynisfjara</RouteLabel>
            <ChapterHeading as='h3' italic className='mt-3'>
              Beautiful, Powerful and Unpredictable
            </ChapterHeading>
            <Paragraphs
              className='mt-5 text-center'
              items={[
                'Reynisfjara was one of the places that impressed me most in Iceland.',
                'The black volcanic sand, enormous cliffs, unusual rock formations and powerful Atlantic waves create a landscape unlike anything I had seen before.',
              ]}
            />
          </Reveal>
        </div>

        <Reveal delay={0.34} className='mt-10 md:mt-12 max-w-sm sm:max-w-md mx-auto'>
          <Image
            src='/2025-10%20-%20Iceland/south-coast/reynisfjara/Reynisfjara_web.jpeg'
            alt="Reynisfjara's black volcanic sand beach, with basalt sea cliffs, a cave and visitors walking along the shore."
            width={2000}
            height={1500}
            sizes='(min-width: 640px) 448px, 90vw'
            className='w-full h-auto rounded-[2px]'
          />
          <p className='mt-3 text-center text-sm italic font-[family-name:var(--font-poppins)] text-black/55 dark:text-white/55'>
            Reynisfjara&apos;s black volcanic sand and dramatic coastline.
          </p>
        </Reveal>

        <Reveal delay={0.37} className='mt-8 md:mt-10 max-w-sm sm:max-w-md mx-auto'>
          <Image
            src='/2025-10%20-%20Iceland/south-coast/reynisfjara/Reynisfjara2_web.jpeg'
            alt='A dramatic basalt cliff face above the black sand beach at Reynisfjara, with the coastline curving away toward distant sea stacks.'
            width={2000}
            height={2667}
            sizes='(min-width: 640px) 448px, 90vw'
            className='w-full h-auto rounded-[2px]'
          />
          <p className='mt-3 text-center text-sm italic font-[family-name:var(--font-poppins)] text-black/55 dark:text-white/55'>
            The striking rock formations along Reynisfjara.
          </p>
        </Reveal>

        <Reveal delay={0.4} className='mt-8 md:mt-10 max-w-sm sm:max-w-md mx-auto'>
          <Image
            src='/2025-10%20-%20Iceland/south-coast/reynisfjara/Reynisfjara3_web.jpeg'
            alt='A lone basalt sea stack rising from the black sand beach at Reynisfjara, with the Reynisdrangar rock pillars visible far out at sea.'
            width={2000}
            height={1500}
            sizes='(min-width: 640px) 448px, 90vw'
            className='w-full h-auto rounded-[2px]'
          />
          <p className='mt-3 text-center text-sm italic font-[family-name:var(--font-poppins)] text-black/55 dark:text-white/55'>
            Looking back along the coastline toward Reynisfjara&apos;s sea stacks.
          </p>
        </Reveal>

        <div className='max-w-2xl mx-auto text-center'>
          <Reveal delay={0.44} className='mt-10 md:mt-12'>
            <Paragraphs
              className='text-center'
              items={[
                "We didn't have sunshine or particularly clear views that day, but somehow that made the experience even more memorable. The dark sky and rough sea gave the entire place an incredible atmosphere.",
                'I felt both admiration and a deep respect for the power of nature.',
              ]}
            />
          </Reveal>
        </div>

        <Reveal delay={0.48} className='mt-10 md:mt-12 max-w-sm sm:max-w-md mx-auto'>
          <button
            type='button'
            onClick={() =>
              setLightboxImage({
                src: '/2025-10%20-%20Iceland/south-coast/reynisfjara/Sneaky_wave_full_web.jpeg',
                alt: "Bilingual warning signs at Reynisfjara describing the beach's hazard levels and the danger of sudden sneaker waves.",
                width: 3200,
                height: 2565,
              })
            }
            aria-label="Bilingual warning signs at Reynisfjara describing the beach's hazard levels and the danger of sudden sneaker waves — view enlarged"
            className='block w-full cursor-zoom-in text-left'
          >
            <Image
              src='/2025-10%20-%20Iceland/south-coast/reynisfjara/Sneaky_wave_web.jpeg'
              alt="Bilingual warning signs at Reynisfjara describing the beach's hazard levels and the danger of sudden sneaker waves."
              width={2000}
              height={1603}
              sizes='(min-width: 640px) 448px, 90vw'
              className='w-full h-auto rounded-[2px]'
            />
          </button>
          <p className='mt-3 text-center text-sm italic font-[family-name:var(--font-poppins)] text-black/55 dark:text-white/55'>
            Warning signs at Reynisfjara — these should never be ignored.
          </p>
        </Reveal>

        {/* RETROSPECTIVE UPDATE -- added per explicit direction, November
            2026: Reynisfjara's coastline (and the very warning signs
            photographed above) changed after our October 2025 visit, per
            an official Icelandic Tourist Board update published February
            2026. A short, clearly-dated editorial aside -- not a new
            attraction section, no new photo, no repeated safety advice --
            placed directly after the warning-signs photo since that's
            what it's about, before the near-miss sneaker-wave story
            continues. Heading uses the smaller SubsectionHeading scale
            already established elsewhere on the site (hotels-article.tsx/
            flights-article.tsx: text-2xl md:text-3xl font-playfair
            font-medium, no italic) rather than this page's ChapterHeading
            (always text-3xl/4xl regardless of h2/h3), so it reads as a
            minor aside, not a new major heading. The external link is a
            plain ReactNode Paragraphs item (components/ui/typography.tsx
            already types items as ReactNode[] for exactly this), styled
            like the inline link in e.g. app/barcelona/page.tsx's FC
            Barcelona membership paragraph. Text alignment/width match the
            surrounding Reynisfjara content (max-w-2xl mx-auto, centred). */}
        <div className='max-w-2xl mx-auto text-center'>
          <Reveal delay={0.5} className='mt-10 md:mt-12'>
            <h3 className='text-2xl md:text-3xl font-[family-name:var(--font-playfair)] font-medium text-black dark:text-white'>
              Reynisfjara Has Changed Since Our Visit
            </h3>
            <Paragraphs
              className='mt-5 text-center'
              items={[
                'We visited Reynisfjara in October 2025, but just a few months later, in February 2026, powerful waves and coastal erosion dramatically reshaped the coastline. Huge amounts of black sand were washed away, and erosion even damaged the warning signs we had photographed during our visit.',
                "Some of the sand has since returned, but it's fascinating to see how quickly nature can transform a place like this.",
                <>
                  The Icelandic Tourist Board published an{' '}
                  <a
                    href='https://www.ferdamalastofa.is/en/news/reynisfjara-recent-changes-due-to-coastal-erosion'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='underline underline-offset-4 text-black dark:text-white hover:text-black/70 dark:hover:text-white/70'
                  >
                    official update about these changes
                  </a>{' '}
                  in February 2026.
                </>,
              ]}
            />
          </Reveal>
        </div>

        <div className='max-w-2xl mx-auto text-center'>
          <Reveal delay={0.52} className='mt-10 md:mt-12'>
            <Paragraphs
              className='text-center'
              items={[
                'And that respect is important here. Reynisfjara is known for its dangerous sneaker waves, which can suddenly rush much farther up the beach than expected.',
              ]}
            />
          </Reveal>

          <Reveal delay={0.56} className='mt-6 md:mt-8'>
            <Paragraphs
              className='text-center'
              items={[
                'We experienced a moment of that ourselves. While I was filming, a wave unexpectedly came towards us.',
              ]}
            />
          </Reveal>
        </div>

        <Reveal delay={0.6} className='mt-8 md:mt-10 max-w-[300px] sm:max-w-[400px] md:max-w-[460px] mx-auto'>
          <div className='relative w-full overflow-hidden rounded-[2px] aspect-[9/16]'>
            <video
              src='/2025-10%20-%20Iceland/south-coast/reynisfjara/sneaky_wave_video_web.mp4'
              controls
              playsInline
              preload='metadata'
              poster='/2025-10%20-%20Iceland/south-coast/reynisfjara/sneaky_wave_video_poster.jpg'
              aria-label='An unexpected sneaker wave at Reynisfjara rushing toward the camera, with a scream heard as the camera moves quickly away and tilts up toward the sky.'
              className='absolute inset-0 h-full w-full object-cover'
            />
          </div>
          <p className='mt-3 text-center text-sm italic font-[family-name:var(--font-poppins)] text-black/55 dark:text-white/55'>
            The moment an unexpected wave sent us moving away from the water.
          </p>
        </Reveal>

        <div className='max-w-2xl mx-auto text-center'>
          <Reveal delay={0.64} className='mt-10 md:mt-12'>
            <Paragraphs
              className='text-center'
              items={[
                "Fortunately, we didn't get wet, although another passenger from our tour bus wasn't so lucky.",
                'It was a powerful reminder that the warning signs on this beach are there for a reason — and they should always be taken seriously.',
              ]}
            />
          </Reveal>

          <Reveal delay={0.68} className='mt-8 md:mt-10'>
            <InlineTip>
              My tip: Reynisfjara is absolutely worth visiting, but take the
              safety warnings seriously. Check the warning lights, keep a
              safe distance from the water and never turn your back on the
              ocean. The waves can reach much farther up the beach than you
              expect.
            </InlineTip>
          </Reveal>

          {/* VÍK -- a short, deliberately minor closing stop, added after
              the fact per explicit direction. RouteLabel carries the place
              name ("Vík"), same split as every other South Coast/first-
              impressions sub-chapter on this page; the heading itself is
              trimmed to "A Short Stop" rather than repeating "...in Vík"
              a second time right under a label that already says Vík --
              same "Place / Subtitle, no repeated place name" convention
              already used for Perlan/Blue Lagoon above (e.g. RouteLabel
              "Blue Lagoon" + heading "Commercialized, but Absolutely
              Worth It", never "Blue Lagoon -- Commercialized..." twice).
              Body text is the exact wording supplied, unedited. */}
          <Reveal delay={0.72} className='mt-10 md:mt-12'>
            <RouteLabel>Vík</RouteLabel>
            <ChapterHeading as='h3' italic className='mt-3'>
              A Short Stop
            </ChapterHeading>
            <Paragraphs
              className='mt-5 text-center'
              items={[
                "Our last stop was Vík, a small village on Iceland's South Coast. We had some free time to explore, walk towards the sea or visit the nearby shops.",
                "What caught my attention most, though, was the landscape surrounding the village. Even a simple stop like this offered another striking glimpse of Iceland's landscape.",
              ]}
            />
          </Reveal>
        </div>

        {/* The supplied filename (IMG_0134.jpeg) wasn't the one actually
            sitting in the Iceland media folder -- the only Vík photo
            there was "Vik.jpeg" (part of the same original photo batch
            as Reynisfjara.jpeg/Sun Voyager.jpg etc.), showing exactly
            the scene described (Vík's sunlit mountains behind the
            village, its hillside church, and the car park/shopping-
            centre area near where this stop happened) -- used that real
            file rather than guessing or placing a stand-in, see the
            reply to the user for this discrepancy. Same MPO-despite-
            .jpeg fix and _web treatment as every other photo on this
            page. */}
        <Reveal delay={0.76} className='mt-10 md:mt-12 max-w-md sm:max-w-xl md:max-w-[800px] mx-auto'>
          <Image
            src='/2025-10%20-%20Iceland/south-coast/vik/Vik_web.jpeg'
            alt="Vík seen from near the village's shopping centre, with sunlit mountains rising behind the hillside church."
            width={2000}
            height={1500}
            sizes='(min-width: 768px) 800px, (min-width: 640px) 576px, 90vw'
            className='w-full h-auto rounded-[2px]'
          />
          <p className='mt-3 text-center text-sm italic font-[family-name:var(--font-poppins)] text-black/55 dark:text-white/55'>
            Vík, surrounded by Iceland&apos;s dramatic mountain landscape.
          </p>
        </Reveal>

        {/* RETURN TO REYKJAVÍK -- a natural closing beat for the South
            Coast chapter, not a separate heading/sub-chapter, per
            explicit direction ("do not add a separate large heading").
            Simply the next Paragraphs block in the flow, same as the
            mood-setting paragraphs earlier in the Reynisfjara
            sub-chapter. Body text is the exact wording supplied,
            unedited. */}
        <div className='max-w-2xl mx-auto text-center'>
          <Reveal delay={0.8} className='mt-10 md:mt-12'>
            <Paragraphs
              className='text-center'
              items={[
                "Even the drive back to Reykjavík was fascinating. Along the way, we could see steam rising from the ground in different places — another reminder of just how much of Iceland's landscape we hadn't seen.",
                'As someone who loves nature, I found these little details just as interesting as some of the famous attractions. In Iceland, even the journey between stops can be an experience of its own.',
              ]}
            />
          </Reveal>
        </div>
      </section>

      {/* A SLOWER DAY IN REYKJAVÍK -- new chapter added per explicit
          request, continuing the trip after the South Coast excursion.
          Text -> new chapter spacing (CHAPTER_GAP_START/END), same as
          every other chapter transition on this page. Body text here is
          centred, matching every other section on the page (an earlier
          pass made this and the two sections that follow it left-aligned
          as a one-off exception; a later explicit request reverted that
          for consistency with the rest of the site). No "Day N" label,
          matching the rest of the page. The cancelled-hike subsection
          deliberately carries no booking screenshot, reservation details
          or excursion price, per explicit direction. The hot dog photo is
          deliberately kept small (~320px desktop) since it's a minor
          detail, not a landscape, per explicit direction. */}
      <section className={`px-6 md:px-12 ${CHAPTER_GAP_START} ${CHAPTER_GAP_END} bg-[#faf9f6] dark:bg-black`}>
        <div className='max-w-2xl mx-auto text-center'>
          <Reveal>
            <ChapterHeading as='h2' italic>
              A Slower Day in Reykjavík
            </ChapterHeading>
            <Paragraphs
              className='mt-5 text-center'
              items={[
                'After three busy days exploring Iceland, we decided to take a day off from organised excursions.',
                'The weather was grey and drizzly, so we spent the day wandering around Reykjavík, browsing shops, exploring the streets and trying different food.',
                "Of course, we had to try Reykjavík's famous hot dog. Maybe our expectations were too high, but honestly, we weren't particularly impressed.",
              ]}
            />
          </Reveal>
        </div>

        <Reveal delay={0.1} className='mt-10 md:mt-12 max-w-[220px] sm:max-w-[280px] md:max-w-[320px] mx-auto'>
          <Image
            src='/2025-10%20-%20Iceland/Hotdog_web.jpeg'
            alt='A traditional Icelandic hot dog in a bun, served at a Reykjavík hot dog stand.'
            width={2000}
            height={2667}
            sizes='(min-width: 768px) 320px, (min-width: 640px) 280px, 60vw'
            className='w-full h-auto rounded-[2px]'
          />
          <p className='mt-3 text-center text-sm italic font-[family-name:var(--font-poppins)] text-black/55 dark:text-white/55'>
            Trying Reykjavík&apos;s famous hot dog.
          </p>
        </Reveal>

        <div className='max-w-2xl mx-auto text-center'>
          <Reveal delay={0.15} className='mt-10 md:mt-12'>
            <ChapterHeading as='h3' italic>
              Our Cancelled Volcano Hike
            </ChapterHeading>
            <Paragraphs
              className='mt-5 text-center'
              items={[
                'We had also booked a six-hour guided hike to the Fagradalsfjall volcanic area through GetYourGuide, something we were really looking forward to.',
                'Unfortunately, the operator cancelled the excursion two days in advance because of the weather. We received a full refund, but it was still disappointing to miss out.',
                "It's a good reminder that when travelling in Iceland, the weather doesn't always cooperate with your plans.",
              ]}
            />
          </Reveal>
        </div>
      </section>

      {/* HALLGRÍMSKIRKJA -- THE VIEW IS WORTH IT -- new chapter, visited
          on the final day in Iceland. Text -> new chapter spacing
          (CHAPTER_GAP_START/END) since the previous section ended in
          text, not a photo or map. Body text is centred, matching every
          other section (see the "A Slower Day" comment above). Both
          photos use the exact filenames supplied (found in the Iceland
          media folder as MPO-despite-.jpeg JPEGs, same
          PIL.ImageOps.exif_transpose + plain RGB + EXIF-stripped +
          2000px-wide treatment as every other photo on this page); the
          video was already H.264+AAC but re-encoded to 1280x720 -- same
          aspect ratio, just web-sized -- to cut it from ~13MB to ~3MB,
          with controls + a real extracted poster frame and no autoplay,
          same convention as every other video on this page. The tower-
          view still photo was removed per explicit direction (the video
          already shows practically the same view), so the video now
          follows the night photo directly, using the standard mt-10/12
          "next media block" gap rather than the tighter gap it had when
          it was the third media item in the section. Practical
          admission-fee info now lives in the standard InlineTip "My
          tip" treatment (pink left rule, same as every other My Tip on
          the site) rather than the earlier one-off "Good to Know" note,
          per explicit direction -- and uses EUR pricing (2026 prices),
          not presented as this trip's own 2025 ticket cost. */}
      <section className={`px-6 md:px-12 ${CHAPTER_GAP_START} ${CHAPTER_GAP_END} bg-[#faf9f6] dark:bg-black`}>
        <div className='max-w-2xl mx-auto text-center'>
          <Reveal>
            <ChapterHeading as='h2' italic>
              Hallgrímskirkja – The View Is Worth It
            </ChapterHeading>
            <Paragraphs
              className='mt-5 text-center'
              items={[
                "On our final day, we visited Hallgrímskirkja, Reykjavík's iconic church.",
                "We decided to go up the tower, and I'm so glad we did.",
                "From above, we could see Reykjavík's colourful rooftops, the harbour, the ocean and the mountains in the distance.",
                'For me, it was one of the highlights of Reykjavík.',
              ]}
            />
          </Reveal>
        </div>

        <Reveal delay={0.1} className='mt-10 md:mt-12 max-w-sm sm:max-w-md mx-auto'>
          <Image
            src='/2025-10%20-%20Iceland/Hallgr%C3%ADmskirkja_web.jpeg'
            alt='Hallgrímskirkja illuminated in pink light against the night sky in Reykjavík.'
            width={2000}
            height={2667}
            sizes='(min-width: 640px) 448px, 90vw'
            className='w-full h-auto rounded-[2px]'
          />
          <p className='mt-3 text-center text-sm italic font-[family-name:var(--font-poppins)] text-black/55 dark:text-white/55'>
            Hallgrímskirkja illuminated at night.
          </p>
        </Reveal>

        <Reveal delay={0.15} className='mt-10 md:mt-12 max-w-3xl mx-auto'>
          <div className='relative w-full overflow-hidden rounded-[2px] aspect-[16/9]'>
            <video
              src='/2025-10%20-%20Iceland/Hallgr%C3%ADmskirkjo_view_video_web.mp4'
              controls
              playsInline
              preload='metadata'
              poster='/2025-10%20-%20Iceland/Hallgr%C3%ADmskirkjo_view_video_poster.jpg'
              aria-label="The view over Reykjavík's rooftops, harbour and mountains from Hallgrímskirkja's tower."
              className='absolute inset-0 h-full w-full object-cover'
            />
          </div>
          <p className='mt-3 text-center text-sm italic font-[family-name:var(--font-poppins)] text-black/55 dark:text-white/55'>
            A closer look at the view from the top.
          </p>
        </Reveal>

        <div className='max-w-2xl mx-auto text-center'>
          <Reveal delay={0.2} className='mt-10 md:mt-12'>
            <InlineTip>
              My tip: Don&apos;t miss the chance to go up the tower of
              Hallgrímskirkja. The views over Reykjavík, the ocean and
              the surrounding mountains are absolutely worth the
              admission fee. Entry to the church is free, while the
              tower costs approximately €11 for adults and €1.50 for
              children aged 7–16 (2026 prices).
            </InlineTip>
          </Reveal>
        </div>
      </section>

      {/* WOULD I RETURN TO ICELAND? -- final editorial section of this
          page, closing the trip with a personal reflection. No photos,
          per explicit direction. Standard CHAPTER_GAP_START/END pair --
          the same spacing as every other chapter transition on this page
          -- gives it breathing room without introducing a new, bigger
          one-off spacing token. Body text is centred, matching every
          other section (see the "A Slower Day" comment above for why),
          same ChapterHeading/Paragraphs scale as every other section (no
          oversized text, no extra bold). Heading and copy rewritten per
          explicit direction to emphasise how little of the island a
          five-day trip actually covers; this replaces the previous
          "Would I Return to Iceland?" conclusion in place rather than
          adding a second closing section. */}
      {/* This is the LAST section before the footer, so it closes with
          the larger pb-[calc(3rem+50px)]/md:pb-[calc(3.5rem+50px)] gap
          used sitewide for a page's final section (Rome's own closing
          reflection, Barcelona/Tenerife's closing BookedChecklist) rather
          than the standard CHAPTER_GAP_END used between ordinary chapters
          -- fixes the too-tight gap before the footer flagged in audit. */}
      <section className={`px-6 md:px-12 ${CHAPTER_GAP_START} pb-[calc(3rem+50px)] md:pb-[calc(3.5rem+50px)] bg-[#faf9f6] dark:bg-black`}>
        <div className='max-w-2xl mx-auto text-center'>
          <Reveal>
            <ChapterHeading as='h2' italic>
              There&apos;s Still So Much of Iceland to Discover
            </ChapterHeading>
            <Paragraphs
              className='mt-5 text-center'
              items={[
                "Five days in Iceland gave us waterfalls, volcanic landscapes, black sand beaches and some of the most extraordinary scenery we've ever seen. And yet, looking at the map, we realised just how small a part of the island we had actually explored.",
                "If I were organising this trip myself, there are a few things I would do differently, especially on our first day. After travelling, we were tired and hungry, and I've learned that it's difficult to truly enjoy sightseeing when you feel that way.",
                'I understand why travel agencies try to fit as much as possible into a short itinerary. They want everyone to experience as much as they can. But this is exactly why we usually prefer travelling independently. We can set our own pace, take a break when we need one and spend more time in the places we genuinely enjoy.',
                "With its vast glaciers and wild, open landscapes, Iceland still has so much more to offer. I'd love to return one day, explore a glacier and experience one of the country's natural geothermal pools.",
                'For someone who loves nature as much as I do, Iceland is a place that leaves you wanting more.',
              ]}
            />
          </Reveal>
        </div>
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

      {lightboxImage && (
        <Lightbox image={lightboxImage} onClose={() => setLightboxImage(null)} />
      )}
    </div>
  );
}
