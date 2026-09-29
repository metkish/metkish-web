'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import JourneyMapScene from '@/components/journey/JourneyMapScene';
import { RouteLabel, TimeStamp } from '@/components/journey/annotation-kit';
import BookedChecklist from '@/components/ui/booked-checklist';
import {
  ITALY_HOME_TO_MILANO_JOURNEY,
  ITALY_MILANO_TO_LASPEZIA_JOURNEY,
  ITALY_LASPEZIA_TO_PISA_JOURNEY,
  ITALY_PISA_TO_PESCHIERA_JOURNEY,
  ITALY_PESCHIERA_TO_HOME_JOURNEY,
} from '@/lib/journeys/italy';

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

// LEVEL 3 body copy — byte-identical to Tenerife's own Paragraphs
// component (same font, size, weight, line-height, and the mt-5 spacing
// convention used everywhere it appears), so Milano's first story reads
// at the same voice as every Tenerife story beat.
function Paragraphs({
  items,
  className = '',
}: {
  items: string[];
  className?: string;
}) {
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

// A small in-chapter marker — one notch below the chapter-opening
// RouteLabel: no pink tick, used for a beat *within* a chapter. Byte-
// identical to Tenerife's own Eyebrow component (see tenerife-editorial-
// system: reuse the existing typography rather than inventing a new
// scale), duplicated locally rather than imported for the same reason
// Reveal/ChapterHeading/Paragraphs above are local copies.
function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <span className='block text-sm md:text-[0.95rem] uppercase tracking-[0.18em] font-[family-name:var(--font-poppins)] font-semibold text-black/60 dark:text-white/60'>
      {children}
    </span>
  );
}

// LEVEL 4 -- the one practical-info-card treatment used for every price
// card on this page (accommodation, Duomo, football, train pass, ferry):
// a small uppercase label, a large serif value at the journey's own
// moment-timestamp scale (TimeStamp size='md'), and optional supporting
// lines underneath -- each one either a second uppercase label-style line
// (variant='label', e.g. "Family of Four") or a quieter descriptive line
// (the default, e.g. "Room · shared kitchen"). This is a byte-identical
// port of Tenerife's own local Fact component (app/tenerife/page.tsx),
// extended only with the label/plain support-line distinction Italy's
// cards actually need. Every line sits in a single flex column with one
// uniform gap-2 -- no per-line margin, no reserved/min-height slot on any
// child -- so the label+value+support group is genuinely one visual unit,
// centred inside the card by the card's own symmetric padding alone,
// exactly like Tenerife's Vienna Airport · Car Park 3 card.
function Fact({
  label,
  value,
  support,
}: {
  label: string;
  value: string;
  support?: { text: string; variant?: 'label' | 'plain' }[];
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
          className={
            line.variant === 'label'
              ? 'text-xs uppercase tracking-[0.18em] font-[family-name:var(--font-poppins)] font-semibold text-black/45 dark:text-white/45'
              : 'text-sm font-[family-name:var(--font-poppins)] text-black/60 dark:text-white/60'
          }
        >
          {line.text}
        </span>
      ))}
    </div>
  );
}

// A small, minimal editorial route diagram -- not a coloured tourist
// infographic, and not a full geographic map (this is a same-day loop
// between villages by train/ferry/bus, not a driving route governed by
// the metkish-route-geometry rule, which only applies to real driving
// routes). Reuses the exact marker/label language the journey maps
// already use elsewhere on this site (see
// components/journey/JourneyMapScene.tsx: the pink dot with a cream
// ring, and the text-[0.65rem] uppercase tracking-[0.16em]
// font-semibold station-name treatment, plus its text-[0.6rem]
// sublabel size) so this reads as part of the same design system
// rather than a new visual language -- just rendered as a simple
// vertical sequence instead of a rendered map.
function RouteSequence({ stops }: { stops: { name: string; via?: string }[] }) {
  return (
    <div className='flex flex-col items-center font-[family-name:var(--font-poppins)]'>
      {stops.map((stop, i) => (
        <div key={`${stop.name}-${i}`} className='flex flex-col items-center'>
          {stop.via && (
            <div className='flex flex-col items-center'>
              <span className='h-6 w-px bg-[#e8639f]/35 dark:bg-pink-400/35' />
              <span className='my-1.5 text-[0.6rem] uppercase tracking-[0.16em] text-black/40 dark:text-white/40'>
                {stop.via}
              </span>
              <span className='h-6 w-px bg-[#e8639f]/35 dark:bg-pink-400/35' />
            </div>
          )}
          <div className='flex items-center gap-2.5 py-1.5'>
            <span className='w-2 h-2 rounded-full bg-[#e8639f] ring-2 ring-[#faf9f6] dark:ring-black' />
            <span className='text-[0.65rem] uppercase tracking-[0.16em] font-semibold text-black/70 dark:text-white/70'>
              {stop.name}
            </span>
          </div>
        </div>
      ))}
    </div>
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

        {/* MILANO ON THE ROAD — the visual transition from the animated
            map into the real Milano story: the last thing the map showed
            was the route itself, and this photo (through the windscreen,
            Italy/Villesse road signs visible) is that same drive, now as
            a photograph. The source file itself was re-cropped (still the
            same shot, not a different photo) to trim empty sky off the
            top and dashboard off the bottom while keeping the full road
            and both the ITALIA and MILANO·VENEZIA signs uncropped — at
            the previous smaller width the signs had become unreadable,
            and a tighter frame reads better at a small size than the
            original mostly-sky composition did. That changed the image's
            own ratio from 3:4 to 6:5, so the aspect box below follows the
            crop (aspect-[6/5], still object-cover/rounded-[2px], nothing
            trimmed beyond the source file's own crop — the crop itself,
            aspect-[6/5], and centering are all unchanged from the
            previous pass, and stay that way here too: this pass only
            touches the container WIDTH, nothing about the crop or
            positioning). 470px still left the ITALIA sign on the right
            edge less than clearly noticeable at a normal viewing size,
            so desktop width is now a fixed 538px from md up (~80% of
            this chapter's max-w-2xl text column). Still larger than
            Milano_streets' 350px: this photo is the first real
            photographic beat right after the animated map, so it's
            allowed to lead. Mobile width (w-[85%]) is unchanged — only
            the desktop size needed the increase. Gap token (mt-12
            md:mt-16) unchanged. No caption, per this step's scope. */}
        <Reveal delay={0.1} className='mt-12 md:mt-16 w-[85%] md:w-[538px] mx-auto'>
          <div className='relative w-full overflow-hidden rounded-[2px] aspect-[6/5]'>
            <Image
              src='/2026-05%20-%20Italy%20roadtrip/Milan%20Cinque%20Terre%20Pisa/Milano_on%20the%20road_web.jpeg'
              alt='View through the windscreen approaching Italy on the motorway, road signs for Milano, Venezia and Trieste visible.'
              fill
              sizes='(min-width: 768px) 538px, 85vw'
              className='object-cover'
            />
          </div>
        </Reveal>

        <div className='max-w-2xl mx-auto text-center'>
          {/* MILANO STORY 1 — "Lesson learned: check the holidays." A
              sub-beat within this same chapter rather than a new one (no
              new RouteLabel), reusing the exact heading + Paragraphs
              pairing Tenerife uses throughout (e.g. "So, which beach
              first?", "The transfer we probably didn't need."), gap
              (mt-10 md:mt-12, the same "next beat within a chapter" token
              Tenerife's own Playa del Duque section uses between its photo
              and its next heading). No further Liberation Day detail —
              exactly the text the brief gave, and no separate closing
              line: the heading already carries that message. */}
          <Reveal delay={0.1} className='mt-10 md:mt-12 max-w-xl mx-auto'>
            <ChapterHeading italic>Lesson learned: check the holidays.</ChapterHeading>
            <Paragraphs
              className='mt-5 text-center'
              items={[
                'We arrived in Milano on April 25th — Liberation Day. Around 100,000 people filled the city centre, streets were closed, and reaching our parking garage felt almost impossible.',
                'After endless detours and a little luck, we somehow made it.',
              ]}
            />
          </Reveal>
        </div>

        {/* The story's second photograph — same aspect-[3/4]/
            rounded-[2px]/object-cover/no-border treatment as before,
            since Milano_streets is itself a native portrait "_web" photo
            (EXIF-rotated pixels baked in, orientation cleared, so it
            isn't cropped to force a different ratio — the balcony,
            flowers and street all stay in frame). Only the container
            WIDTH was scaled down, same as the road photo above but a
            touch larger (w-[88%] mobile, fixed 350px from md up, ~52% of
            the max-w-2xl text column vs the road photo's ~42%), so it
            still reads as the slightly bigger of this chapter's two
            photos without either feeling like a hero image. Gap above it
            (mt-12 md:mt-16) still matches the "text -> photo" token used
            above. Caption below is untouched — same mt-3, text-xs
            uppercase tracking-[0.18em], Poppins semibold, black/40 credit
            line, just now the width of the smaller photo container. */}
        <Reveal delay={0.1} className='mt-12 md:mt-16 w-[88%] md:w-[350px] mx-auto'>
          <div className='relative w-full overflow-hidden rounded-[2px] aspect-[3/4]'>
            <Image
              src='/2026-05%20-%20Italy%20roadtrip/Milan%20Cinque%20Terre%20Pisa/Milano_streets_web.jpeg'
              alt='A quiet Milano street with a flower-covered balcony.'
              fill
              sizes='(min-width: 768px) 350px, 88vw'
              className='object-cover'
            />
          </div>
          <p className='mt-3 text-center text-xs uppercase tracking-[0.18em] font-[family-name:var(--font-poppins)] font-semibold text-black/40 dark:text-white/40'>
            The calm after the chaos.
          </p>
        </Reveal>

        <div className='max-w-2xl mx-auto text-center'>
          {/* WHERE WE STAYED — simplified per revision request: one short
              editorial line instead of two paragraphs, no inline price/
              nights mention (that detail now lives once, in the card
              below). Eyebrow -> ChapterHeading -> Paragraphs, same as
              before. Gap above still matches the photo-caption -> new-topic
              transition (mt-14/16). No property name, no photo. */}
          <Reveal className='mt-14 md:mt-16 max-w-xl mx-auto'>
            <Eyebrow>Where We Stayed</Eyebrow>
            <ChapterHeading italic className='mt-3'>
              Right in the heart of Milano
            </ChapterHeading>
            <Paragraphs
              className='mt-5 text-center'
              items={[
                'Exceptional location and an incredibly helpful host. A little cramped for four, though.',
              ]}
            />
          </Reveal>

          {/* Booking-information card — the exact same quiet practical-info
              panel language as the Tenerife hotel card (Roca Nivaria · 9
              Nights / price via TimeStamp / date range / room type / extra
              line): identical background, corner radius, padding, gap,
              label styling and TimeStamp scale, just this stay's own
              values. €949.32 appears only here, once, replacing the earlier
              inline "€949" mention that used to sit in the paragraph
              above. */}
          <Reveal delay={0.1} className='mt-9 md:mt-11 mx-auto max-w-[460px] rounded-[3px] bg-[#f1ebdc] dark:bg-white/[0.04] px-8 py-8 md:px-9 md:py-9'>
            <Fact
              label='Central Milano · 2 Nights'
              value='€949.32'
              support={[
                { text: '25 Apr → 27 Apr 2026' },
                { text: 'Room · Family of Four', variant: 'label' },
                { text: 'Shared kitchen' },
              ]}
            />
          </Reveal>

          {/* GOOD TO KNOW — simplified to one sentence. Same Eyebrow-only,
              straight-into-paragraph treatment as before (and as Tenerife's
              "Parking" note): no card, no box, so it stays visually
              secondary to the booking card above it. */}
          <Reveal delay={0.1} className='mt-12 md:mt-14 max-w-xl mx-auto'>
            <Eyebrow>Good to Know</Eyebrow>
            <Paragraphs
              className='mt-5 text-center'
              items={[
                'Driving to Milano? Check Area B and Area C before you go — access rules depend on your vehicle. We travelled by electric car, so Area C was free for us.',
              ]}
            />
          </Reveal>
        </div>

        {/* SUNDAY MORNING — a new beat within the same Milano chapter
            (Eyebrow-only marker, same as "Where We Stayed" and "Good to
            Know" above, not a new RouteLabel/section — this page only has
            one geographic leg so far). Gap above reuses this file's own
            "closing one beat -> opening a different one" token (mt-14/16,
            same value "Where We Stayed" used after the street-photo
            caption), since this moves the story from practical trip info
            to a new day. */}
        <div className='max-w-2xl mx-auto text-center'>
          <Reveal className='mt-14 md:mt-16 max-w-xl mx-auto'>
            <Eyebrow>Sunday Morning</Eyebrow>
            <ChapterHeading italic className='mt-3'>
              One ticket we didn&apos;t plan to buy
            </ChapterHeading>
            <Paragraphs
              className='mt-5 text-center'
              items={[
                "The Duomo wasn't in our plans. With almost no queue, we decided to go up — and we're glad we did.",
              ]}
            />
          </Reveal>
        </div>

        {/* Duoma.jpeg — the cathedral facade from the piazza. Native
            portrait ratio preserved via aspect-[3/4] (source pixels are
            already 3:4 once EXIF-rotated, same as Milano_streets), so
            nothing is cropped. Width sits between this chapter's two
            existing photos (Milano_on the road's 538px and Milano_streets'
            350px) — a touch more presence than the street photo since it's
            this beat's main image, still well short of a full-width hero.
            Gap above matches the text -> photo token already used for
            Milano_streets (mt-12 md:mt-16). No caption, matching the
            "keep this short" instruction for this section. */}
        <Reveal delay={0.1} className='mt-12 md:mt-16 w-[85%] md:w-[400px] mx-auto'>
          <div className='relative w-full overflow-hidden rounded-[2px] aspect-[3/4]'>
            <Image
              src='/2026-05%20-%20Italy%20roadtrip/Milan%20Cinque%20Terre%20Pisa/Duoma.jpeg'
              alt="Milano's Duomo cathedral, seen from Piazza del Duomo on a Sunday morning."
              fill
              sizes='(min-width: 768px) 400px, 85vw'
              className='object-cover'
            />
          </div>
        </Reveal>

        {/* The punchline — connected to the photo above rather than a new
            chapter, same "photo -> short connected text" token Tenerife
            uses (mt-10 md:mt-12). Shortened this pass to the personal
            observation only -- price, family size, cathedral/rooftop
            inclusion and stairs-access now live once, in the card below,
            instead of being repeated in prose. */}
        <div className='max-w-2xl mx-auto text-center'>
          <Reveal delay={0.1} className='mt-10 md:mt-12 max-w-xl mx-auto'>
            <Paragraphs
              className='text-center'
              items={[
                "We're not usually the ones buying tickets for churches or museums. This one was absolutely worth it.",
              ]}
            />
          </Reveal>

          {/* Duomo price card -- new this pass: the exact same cream
              practical-info panel language as every other price card on
              this page (identical background, radius, padding, gap, label
              styling and TimeStamp scale). Holds the facts the paragraph
              above used to spell out. */}
          <Reveal delay={0.15} className='mt-9 md:mt-11 mx-auto max-w-[460px] rounded-[3px] bg-[#f1ebdc] dark:bg-white/[0.04] px-8 py-8 md:px-9 md:py-9'>
            <Fact
              label='Duomo di Milano'
              value='€66'
              support={[
                { text: 'Family of Four', variant: 'label' },
                { text: 'Cathedral & rooftop · access by stairs' },
              ]}
            />
          </Reveal>
        </div>

        {/* Duoma_video.mp4 — the rooftop, as an editorial "moving
            photograph": no controls, no sound, no frame, byte-identical
            treatment to Tenerife's own hotel-beach clip (autoPlay/muted/
            loop/playsInline, aspect-[9/16] wrapper since the source is a
            1080x1920 vertical phone recording, contained by width rather
            than stretched). This is the only other media item in this
            section, per this step's scope. */}
        <Reveal delay={0.1} className='mt-12 md:mt-14 max-w-[240px] sm:max-w-xs md:max-w-md mx-auto'>
          <div className='relative w-full overflow-hidden rounded-[2px] aspect-[9/16]'>
            <video
              src='/2026-05%20-%20Italy%20roadtrip/Milan%20Cinque%20Terre%20Pisa/Duoma_video.mp4'
              autoPlay
              muted
              loop
              playsInline
              preload='auto'
              aria-hidden='true'
              className='absolute inset-0 h-full w-full object-cover'
            />
          </div>
        </Reveal>

        {/* SLOW SUNDAY — a new beat (Eyebrow-only marker, same tier as
            "Sunday Morning" above), opening the "walking through Milano"
            atmosphere stretch of the day. Now follows the Duomo video
            directly (the Galleria one-line aside was removed as it had no
            accompanying photo, so it read as disconnected). Gap above
            still reuses the file's "closing one beat -> opening a
            different one" token (mt-14/16) -- this page's own convention
            already applies that same weight after a photo/video beat, not
            only after text, so no change was needed there. */}
        <div className='max-w-2xl mx-auto text-center'>
          <Reveal className='mt-14 md:mt-16 max-w-xl mx-auto'>
            <Eyebrow>Slow Sunday</Eyebrow>
            <ChapterHeading italic className='mt-3'>
              Walking, gelato &amp; no rush
            </ChapterHeading>
            <Paragraphs
              className='mt-5 text-center'
              items={[
                'Gelato, a walk through Milano and no real plan. Exactly the kind of Sunday we needed.',
              ]}
            />
          </Reveal>
        </div>

        {/* Milano_street_web.jpeg — a tram junction in central Milano,
            "atmosphere" tier per this chapter's hierarchy: more presence
            than the Galleria mention, less than the Duomo, since it's this
            beat's only image rather than its main highlight. Native
            landscape ratio (already 4:3 at full resolution, no EXIF
            rotation needed unlike the two portrait photos above), so
            aspect-[4/3] crops nothing. 560px sits a little wider than this
            chapter's portrait photos since a landscape street scene reads
            better with more horizontal room, while staying well short of a
            full-width hero. Web-sized copy (1800px long edge, same
            treatment as Milano_on the road_web.jpeg / Milano_streets_web
            .jpeg) rather than the 4.9MB source file. */}
        <Reveal delay={0.1} className='mt-12 md:mt-16 w-[85%] md:w-[560px] mx-auto'>
          <div className='relative w-full overflow-hidden rounded-[2px] aspect-[4/3]'>
            <Image
              src='/2026-05%20-%20Italy%20roadtrip/Milan%20Cinque%20Terre%20Pisa/Milano_street_web.jpeg'
              alt='A tram junction and historic buildings in central Milano on a sunny Sunday afternoon.'
              fill
              sizes='(min-width: 768px) 560px, 85vw'
              className='object-cover'
            />
          </div>
        </Reveal>

        {/* The lunch beat — connected to the walking photo above rather
            than a new chapter (same photo -> connected text token, mt-10/
            12). Kept to the experience itself, not a review — no
            restaurant name, no recommendation, per this step's explicit
            instruction. */}
        <div className='max-w-2xl mx-auto text-center'>
          <Reveal delay={0.1} className='mt-10 md:mt-12 max-w-xl mx-auto'>
            <Paragraphs
              className='text-center'
              items={[
                "We stopped for lunch and quickly learned one thing — Italians don't rush it. Coming from a family that's always in a hurry, maybe we could learn something from that.",
              ]}
            />
          </Reveal>
        </div>

        {/* GETTING AROUND — a small practical tip, same Eyebrow +
            ChapterHeading + Paragraphs, no-photo tier as Tenerife's "One
            thing I didn't know" / "Parking" notes (this page's established
            "useful aside, not a major section" pattern). Gap above matches
            that same tier's own token (mt-12/14). */}
        <div className='max-w-2xl mx-auto text-center'>
          <Reveal delay={0.1} className='mt-12 md:mt-14 max-w-xl mx-auto'>
            <ChapterHeading italic>Getting around was surprisingly easy</ChapterHeading>
            <Paragraphs
              className='mt-5 text-center'
              items={[
                "Milan's metro couldn't be easier — just tap your payment card at the gate. One card per traveller, so having a prepaid card for each child comes in handy.",
              ]}
            />
          </Reveal>
        </div>

        {/* A DIFFERENT MILANO — this chapter's second strong visual
            moment (per the requested hierarchy), so it gets the same
            weight as Sunday Morning/Slow Sunday: Eyebrow, ChapterHeading,
            Paragraphs, then its own media. Gap above is this file's
            biggest "new topic" token (mt-14/16) again, since this is a
            deliberate shift away from the historic centre. */}
        <div className='max-w-2xl mx-auto text-center'>
          <Reveal className='mt-14 md:mt-16 max-w-xl mx-auto'>
            <ChapterHeading italic>Then Milano turned green</ChapterHeading>
            <Paragraphs
              className='mt-5 text-center'
              items={[
                'We headed to the newer side of Milano, expecting skyscrapers and glass. Instead, my favourite part was the wildflower meadow beneath Bosco Verticale.',
              ]}
            />
          </Reveal>
        </div>

        {/* Milano_green.mp4 — the wildflower meadow with Bosco Verticale,
            as an editorial "moving photograph", byte-identical treatment
            to the Duoma_video / Tenerife Hotel_beach.mp4 insert (autoPlay/
            muted/loop/playsInline, aspect-[9/16], contained by width). The
            only media for this beat, per this step's scope. Re-encoded
            from the original Milano_green.MOV (already H.264, but a raw
            1080x1920/28MB phone export in a .MOV container) down to
            640x1138/~6.5MB — same resolution and codec convention as
            every other video already on the site. */}
        <Reveal delay={0.1} className='mt-12 md:mt-16 max-w-[240px] sm:max-w-xs md:max-w-md mx-auto'>
          <div className='relative w-full overflow-hidden rounded-[2px] aspect-[9/16]'>
            <video
              src='/2026-05%20-%20Italy%20roadtrip/Milan%20Cinque%20Terre%20Pisa/Milano_green.mp4'
              autoPlay
              muted
              loop
              playsInline
              preload='auto'
              aria-hidden='true'
              className='absolute inset-0 h-full w-full object-cover'
            />
          </div>
        </Reveal>

        {/* The football transition — closes this whole daytime arc with
            one short, bare ChapterHeading line (no Eyebrow, no
            Paragraphs), the same "single reflective line" weight Tenerife
            uses to close a story before moving on. Gap above is this
            file's biggest token (mt-14/16) again, marking the end of the
            day rather than another beat within it. The football match
            itself is deliberately not built yet — content and media for
            it are coming separately. */}
        <div className='max-w-2xl mx-auto text-center'>
          <Reveal className='mt-14 md:mt-16 max-w-xl mx-auto'>
            <ChapterHeading italic>
              The one thing we had actually planned.
            </ChapterHeading>
          </Reveal>
        </div>

        {/* SUNDAY NIGHT / SAN SIRO — the closing beat of the whole Sunday
            arc, same weight as Sunday Morning: Eyebrow -> ChapterHeading ->
            Paragraphs. Gap above reuses the file's "closing one beat ->
            opening a different one" token (mt-14/16), same as every other
            new-day/new-topic opening in this file, since the transition
            line above already closed the daytime story. */}
        <div className='max-w-2xl mx-auto text-center'>
          <Reveal className='mt-14 md:mt-16 max-w-xl mx-auto'>
            <Eyebrow>Sunday Night</Eyebrow>
            <ChapterHeading italic className='mt-3'>
              Football night at San Siro
            </ChapterHeading>
            <Paragraphs
              className='mt-5 text-center'
              items={[
                "We're not Milan or Juventus fans — we just enjoy a good football match. This one ended 0–0, but experiencing San Siro on a match night was still worth it.",
              ]}
            />
          </Reveal>
        </div>

        {/* SanSiro.mp4 — the finished, already-delivered match-night clip.
            Not re-encoded, cropped or otherwise touched per this step's
            explicit instruction; it happens to already be a 1080x1920
            vertical recording, so it drops into the same aspect-[9/16]
            "moving photograph" wrapper used for Duoma_video.mp4 and
            Milano_green.mp4 with zero changes to the treatment (contained
            by width, not stretched, not enlarged beyond this chapter's
            other video moments). Gap above matches this file's text ->
            photo/video token (mt-12/16). */}
        <Reveal delay={0.1} className='mt-12 md:mt-16 max-w-[240px] sm:max-w-xs md:max-w-md mx-auto'>
          <div className='relative w-full overflow-hidden rounded-[2px] aspect-[9/16]'>
            <video
              src='/2026-05%20-%20Italy%20roadtrip/Milan%20Cinque%20Terre%20Pisa/SanSiro.mp4'
              autoPlay
              muted
              loop
              playsInline
              preload='auto'
              aria-hidden='true'
              className='absolute inset-0 h-full w-full object-cover'
            />
          </div>
        </Reveal>

        {/* The personal observation — connected to the video above rather
            than a new beat, same "photo/video -> connected text" token
            (mt-10/12) and bare-Paragraphs, no-Eyebrow weight this file
            uses for a reflection line following a video. (The Milano_green
            video's own reflection line was removed as repetitive with the
            intro text above it -- that video now flows straight into the
            football transition using this file's own "new topic" token,
            mt-14/16, unchanged.) */}
        <div className='max-w-2xl mx-auto text-center'>
          <Reveal delay={0.1} className='mt-10 md:mt-12 max-w-xl mx-auto'>
            <Paragraphs
              className='text-center'
              items={[
                "We've been to quite a few stadiums, and San Siro definitely shows its age. But walking up those huge spiral towers to reach the upper stands? That was something different.",
              ]}
            />
          </Reveal>
        </div>

        {/* Match-ticket information card — the exact same practical-info
            panel language as the accommodation card above (identical
            background, radius, padding, gap, label styling and TimeStamp
            scale): label / price via TimeStamp / date+time / label / line.
            €476 is the total for the family of four and appears only
            here, once. No seat/sector/row detail, per this step's explicit
            instruction. Gap above matches the photo/video -> connected-
            content token (mt-10/12), same as this file uses for text
            directly following a photo or video. */}
        <Reveal delay={0.1} className='mt-10 md:mt-12 mx-auto max-w-[460px] rounded-[3px] bg-[#f1ebdc] dark:bg-white/[0.04] px-8 py-8 md:px-9 md:py-9'>
          <Fact
            label='AC Milan vs Juventus'
            value='€476'
            support={[
              { text: '26 Apr 2026 · 20:45' },
              { text: '4 Tickets · €119 pp', variant: 'label' },
              { text: 'San Siro · Milano' },
            ]}
          />
        </Reveal>

        {/* A very small, quiet practical note directly under the ticket
            card — deliberately lighter than the Eyebrow+Paragraphs "Good
            to Know" tier used earlier on this page (that would duplicate
            the same label the note's own text already carries), and
            lighter than the card itself: small, muted, single line, no
            uppercase treatment since it's a plain sentence rather than a
            label. Small gap above (mt-5/6) keeps it read as an addendum
            to the card rather than a new beat. */}
        <Reveal delay={0.15} className='mt-5 md:mt-6 mx-auto max-w-[460px] text-center'>
          <p className='text-sm font-[family-name:var(--font-poppins)] font-light text-black/50 dark:text-white/50'>
            Good to know: expect very crowded metro stations after the match.
          </p>
        </Reveal>
      </section>

      {/* MAP -- Milano -> La Spezia, the second road-trip leg. Same
          JourneyMapScene engine, same height, same edge-to-edge/no-
          padding placement as the Home -> Milano map above (see
          lib/journeys/italy.ts for the route data, the real-coordinate
          sourcing, and the fine Liguria coastline patch this leg
          needed). Sits directly after the Milano chapter's own closing
          section, so this reads as the same journey continuing rather
          than a new page starting. Unchanged from the previous build. */}
      <JourneyMapScene
        journey={ITALY_MILANO_TO_LASPEZIA_JOURNEY}
        heightClassName='h-[380px] sm:h-[440px] md:h-[500px]'
      />

      {/* LA SPEZIA CHAPTER OPENING -- unchanged: bare RouteLabel with
          the leg's From -> To, then a single ChapterHeading, mt-8
          md:mt-10 below it, matching "Slovenia -> Milano" / "First
          stop? Milano!" above. Everything below this is corrected per
          this revision pass: no more small date-label Eyebrows anywhere
          in this section (Tenerife doesn't use them, and the Italy page
          should feel consistent with it) -- the day-by-day order is now
          carried by the storytelling alone. */}
      <section className='px-6 md:px-12 pt-8 md:pt-10 pb-16 md:pb-24 bg-[#faf9f6] dark:bg-black'>
        <div className='max-w-2xl mx-auto text-center'>
          <Reveal>
            <RouteLabel>Milano → La Spezia</RouteLabel>
          </Reveal>

          <Reveal className='mt-8 md:mt-10 max-w-xl mx-auto'>
            <ChapterHeading italic>Next stop: La Spezia</ChapterHeading>
          </Reveal>
        </div>

        {/* LA SPEZIA / OUR BASE -- revised per this pass: the
            accommodation text now names Casa Esmeralda and describes the
            actual stay (host, parking, walk to the apartment, and an
            honest note on the location -- close to the station and a
            grocery store, but near the railway line and a little outside
            the centre). Still bare ChapterHeading, no date-label Eyebrow,
            matching the rest of this section. */}
        <div className='max-w-2xl mx-auto text-center'>
          <Reveal delay={0.1} className='mt-10 md:mt-12 max-w-xl mx-auto'>
            <ChapterHeading italic>Our base for Cinque Terre.</ChapterHeading>
            <Paragraphs
              className='mt-5 text-center'
              items={[
                "We stayed at Casa Esmeralda. Our host was incredibly helpful \u2014 she arranged private parking, met us at the garage and walked us to the apartment. The train station was within easy walking distance, which was practical for Cinque Terre, even though the apartment itself sits a little outside the centre.",
              ]}
            />
          </Reveal>

          {/* Casa Esmeralda price card -- same quiet cream practical-info
              panel language as every other price card on this page
              (identical background, radius, padding, gap, label styling
              and TimeStamp scale). Placed directly after the
              accommodation text, before the pizzeria moment, per this
              revision's explicit instruction that this card must not be
              omitted. */}
          <Reveal delay={0.15} className='mt-9 md:mt-11 mx-auto max-w-[460px] rounded-[3px] bg-[#f1ebdc] dark:bg-white/[0.04] px-8 py-8 md:px-9 md:py-9'>
            <Fact
              label='Casa Esmeralda · 2 Nights'
              value='€382.16'
              support={[
                { text: '27 Apr → 29 Apr 2026' },
                { text: 'Suite with Terrace · Family of Four', variant: 'label' },
              ]}
            />
          </Reveal>

          {/* Pizzeria moment -- kept as a small, secondary aside (see
              note below); text revised per this pass to drop the venue
              name entirely and describe it as a takeaway pizza stop
              rather than a sit-down dinner. Same tight lead-in gap
              (mt-9/11, the same paragraph -> card rhythm used above)
              rather than the larger new-topic gap, so it still reads as
              a quick aside rather than a new chapter. */}
          <Reveal delay={0.1} className='mt-9 md:mt-11 max-w-xl mx-auto'>
            <Paragraphs
              className='text-center'
              items={[
                "Near our apartment, we spotted a little pizzeria and grabbed two pizzas to take back with us. It felt like stepping back in time — and €10.60 for two pizzas felt like it too.",
              ]}
            />
          </Reveal>
        </div>

        {/* LaSpezia_pizzeria_web.jpeg -- kept, same size and gaps as
            before (mt-6/8, the same tight paragraph -> image gap used
            for the trolley photo) so the whole pizzeria beat still reads
            as one small secondary moment. Alt text and caption revised
            per this pass to drop the venue name. */}
        <Reveal delay={0.1} className='mt-6 md:mt-8 w-[50%] md:w-[220px] mx-auto'>
          <div className='relative w-full overflow-hidden rounded-[2px] aspect-[3/4]'>
            <Image
              src='/2026-05%20-%20Italy%20roadtrip/Milan%20Cinque%20Terre%20Pisa/LaSpezia_pizzeria_web.jpeg'
              alt='The little pizzeria in La Spezia where we stopped for takeaway pizza.'
              fill
              sizes='(min-width: 768px) 220px, 50vw'
              className='object-cover'
            />
          </div>
          <p className='mt-3 text-center text-xs uppercase tracking-[0.18em] font-[family-name:var(--font-poppins)] font-semibold text-black/40 dark:text-white/40'>
            A Little Step Back In Time.
          </p>
        </Reveal>

        {/* THREE VILLAGES. TWO WAYS TO SEE THEM. -- date-label Eyebrow
            removed (see note at the top of this section); otherwise
            unchanged from the previous build. Bare ChapterHeading, same
            opening paragraph explaining the route actually chosen. */}
        <div className='max-w-2xl mx-auto text-center'>
          <Reveal delay={0.1} className='mt-14 md:mt-16 max-w-xl mx-auto'>
            <ChapterHeading italic>Three villages. Two ways to see them.</ChapterHeading>
            <Paragraphs
              className='mt-5 text-center'
              items={[
                "We chose three Cinque Terre villages — Manarola, Monterosso and Vernazza. We travelled between them by train, then switched to the ferry for Porto Venere and returned to La Spezia by bus.",
              ]}
            />
          </Reveal>
        </div>

        {/* ROUTE DIAGRAM -- unchanged from the previous build: the
            small, elegant, editorial route sequence (RouteSequence
            component, defined near the top of this file), reusing the
            journey map's own pink-dot/uppercase-label language. */}
        <Reveal delay={0.1} className='mt-12 md:mt-16 mx-auto'>
          <RouteSequence
            stops={[
              { name: 'La Spezia' },
              { name: 'Manarola', via: 'Train' },
              { name: 'Monterosso', via: 'Train' },
              { name: 'Vernazza', via: 'Train' },
              { name: 'Porto Venere', via: 'Ferry' },
              { name: 'La Spezia', via: 'Bus' },
            ]}
          />
        </Reveal>

        {/* TRAIN PASS -- compact this revision: the old "Getting
            Around" Eyebrow + full paragraph is replaced with a single
            plain sentence (no label above it), immediately followed by
            its own dedicated price card. The old combined €120.50
            transport card is gone entirely (see the note by the ferry
            card below) -- this card carries only the train-pass cost,
            in the context where that cost is actually relevant, rather
            than as a line item in a bill presented at the end of the
            day. The separate Manarola/Monterosso mini-sections from the
            previous build are also removed here -- both villages are
            already named in the paragraph above and shown in the route
            diagram, so a dedicated paragraph for each added nothing. */}
        <div className='max-w-2xl mx-auto text-center'>
          <Reveal delay={0.1} className='mt-14 md:mt-16 max-w-xl mx-auto'>
            <Paragraphs
              className='text-center'
              items={[
                "The train made exploring Cinque Terre incredibly easy. With a day pass, we could simply hop on and off between the villages whenever we wanted. Just be prepared \u2014 the trains can get very crowded.",
              ]}
            />
          </Reveal>

          <Reveal delay={0.1} className='mt-9 md:mt-11 mx-auto max-w-[460px] rounded-[3px] bg-[#f1ebdc] dark:bg-white/[0.04] px-8 py-8 md:px-9 md:py-9'>
            <Fact
              label='Cinque Terre Train Pass'
              value='€56.50'
              support={[{ text: 'Family of Four', variant: 'label' }]}
            />
          </Reveal>
        </div>

        {/* A DETAIL I LOVED -- moved much higher this revision (was
            previously the section's closing beat, after Porto Venere
            and the bus). It's a small thing we noticed while out
            exploring the villages, not a large standalone chapter, so
            it sits here, right after the practical train-pass info and
            before Vernazza -- and the text is shortened to a single
            sentence to match that lighter weight. Bare ChapterHeading
            (same treatment as Vernazza/the ferry beat), trolley image
            placed close beneath it (mt-6 md:mt-8, not the usual
            text->photo token) so text and image still read as one
            connected moment, same caption as before. */}
        <div className='max-w-2xl mx-auto text-center'>
          <Reveal delay={0.1} className='mt-14 md:mt-16 max-w-xl mx-auto'>
            <ChapterHeading italic>A detail I loved</ChapterHeading>
            <Paragraphs
              className='mt-5 text-center'
              items={[
                "One detail I loved: with streets this steep and narrow, even deliveries work differently \u2014 small tracked trolleys carry supplies up the steps.",
              ]}
            />
          </Reveal>
        </div>

        <Reveal delay={0.1} className='mt-6 md:mt-8 w-[60%] md:w-[280px] mx-auto'>
          <div className='relative w-full overflow-hidden rounded-[2px] aspect-[3/4]'>
            <Image
              src='/2026-05%20-%20Italy%20roadtrip/Milan%20Cinque%20Terre%20Pisa/Cinque_Terre_trolley_web.jpeg'
              alt='A small tracked transport trolley used to move goods up and down the steep stairways of a Cinque Terre village.'
              fill
              sizes='(min-width: 768px) 280px, 60vw'
              className='object-cover'
            />
          </div>
          <p className='mt-3 text-center text-xs uppercase tracking-[0.18em] font-[family-name:var(--font-poppins)] font-semibold text-black/40 dark:text-white/40'>
            Deliveries, Cinque Terre style.
          </p>
        </Reveal>

        {/* VERNAZZA -- OUR FAVOURITE. Text and image unchanged from the
            previous build (last stop by train, the one that stayed with
            us most, lunch, the castle/viewpoint climb, the small
            entrance fee, the view). The short "We stayed up there for a
            while..." line that used to sit under the image is removed
            this revision -- the large photo now finishes the beat on
            its own. */}
        <div className='max-w-2xl mx-auto text-center'>
          <Reveal delay={0.1} className='mt-14 md:mt-16 max-w-xl mx-auto'>
            <ChapterHeading italic>Vernazza — our favourite</ChapterHeading>
            <Paragraphs
              className='mt-5 text-center'
              items={[
                'Vernazza was our favourite of the three. We stopped for lunch, then climbed to the small castle and viewpoint above the village. The entrance cost just a few euros — and the view was absolutely worth it.',
              ]}
            />
          </Reveal>
        </div>

        <Reveal delay={0.1} className='mt-12 md:mt-16 w-[92%] md:w-[680px] mx-auto'>
          <div className='relative w-full overflow-hidden rounded-[2px] aspect-[4/3]'>
            <Image
              src='/2026-05%20-%20Italy%20roadtrip/Milan%20Cinque%20Terre%20Pisa/Cinque_Terre_view_web.jpeg'
              alt='Vernazza seen from the castle viewpoint above the village, looking down over the harbour and rooftops.'
              fill
              sizes='(min-width: 768px) 680px, 92vw'
              className='object-cover'
            />
          </div>
          <p className='mt-3 text-center text-xs uppercase tracking-[0.18em] font-[family-name:var(--font-poppins)] font-semibold text-black/40 dark:text-white/40'>
            Vernazza, from above.
          </p>
        </Reveal>

        {/* WHY WE PAID EXTRA FOR THE FERRY -- heading and paragraph
            unchanged from the previous build (explicitly approved as
            is). New this revision: its own dedicated price card
            (Ferry · Vernazza -> Porto Venere, €64, Family of Four),
            replacing the old combined €120.50 "Cinque Terre Transport"
            card, which is removed entirely -- the €56.50 train-pass
            figure now lives with the train-pass beat above, and this
            €64 figure lives here, so each cost appears once, in the
            story that explains it, rather than as a final bill. */}
        <div className='max-w-2xl mx-auto text-center'>
          <Reveal delay={0.1} className='mt-14 md:mt-16 max-w-xl mx-auto'>
            <ChapterHeading italic>
              Why take the ferry when we already had train passes?
            </ChapterHeading>
            <Paragraphs
              className='mt-5 text-center'
              items={[
                "The weather was beautiful, the trains were crowded, and some of the best views of Cinque Terre are from the sea. So we paid extra for the ferry \u2014 and it turned out to be the perfect choice.",
              ]}
            />
          </Reveal>

          <Reveal delay={0.1} className='mt-9 md:mt-11 mx-auto max-w-[460px] rounded-[3px] bg-[#f1ebdc] dark:bg-white/[0.04] px-8 py-8 md:px-9 md:py-9'>
            <Fact
              label='Ferry · Vernazza → Porto Venere'
              value='€64'
              support={[{ text: 'Family of Four', variant: 'label' }]}
            />
          </Reveal>

        </div>

        {/* Cinque_Terre_sea_video_web.mp4 -- unchanged placement logic
            from the previous build: this is Cinque Terre from the sea,
            the visual answer to the heading above, sized prominently
            (max-w-[300px] sm:max-w-[400px] md:max-w-[520px]) rather than
            as a small decorative clip. Confirmed this revision (by
            checking the actual footage, not just the filename) that
            this clip shows Cinque Terre villages seen from the water
            during the ferry crossing -- it stays here rather than in
            the Porto Venere section below. The other Cinque Terre video
            file (Cinque_Terre_view_video.mp4) was checked at the same
            time and is confirmed to be Vernazza castle-viewpoint
            footage, not Porto Venere -- it has no narrative home in
            this rebuilt section and stays unused, as in the previous
            build. */}
        <Reveal delay={0.1} className='mt-12 md:mt-16 max-w-[300px] sm:max-w-[400px] md:max-w-[520px] mx-auto'>
          <div className='relative w-full overflow-hidden rounded-[2px] aspect-[9/16]'>
            <video
              src='/2026-05%20-%20Italy%20roadtrip/Milan%20Cinque%20Terre%20Pisa/Cinque_Terre_sea_video_web.mp4'
              autoPlay
              muted
              loop
              playsInline
              preload='auto'
              aria-hidden='true'
              className='absolute inset-0 h-full w-full object-cover'
            />
          </div>
          <p className='mt-3 text-center text-xs uppercase tracking-[0.18em] font-[family-name:var(--font-poppins)] font-semibold text-black/40 dark:text-white/40'>
            Cinque Terre, from the sea.
          </p>
        </Reveal>

        {/* PORTO VENERE -- bare ChapterHeading, matching Vernazza's and
            the ferry beat's weight. Paragraph rewritten this revision:
            still careful, attributed wording (what *I* had read before
            the trip, not a claim that Porto Venere factually beats
            Portofino), now framed around wanting to see it specifically
            rather than it being a transport stop. No video here --
            checked both available Cinque Terre video files against the
            actual footage this revision and neither shows Porto Venere
            (see the note by the sea video above), so only the photo is
            used rather than mislabelling footage of somewhere else. */}
        <div className='max-w-2xl mx-auto text-center'>
          <Reveal delay={0.1} className='mt-14 md:mt-16 max-w-xl mx-auto'>
            <ChapterHeading italic>Porto Venere</ChapterHeading>
            <Paragraphs
              className='mt-5 text-center'
              items={[
                "While deciding which Cinque Terre villages to visit, Porto Venere kept coming up — even though it isn't actually one of the five. So we added it to our route. A lovely little village and definitely worth the stop.",
              ]}
            />
          </Reveal>
        </div>

        <Reveal delay={0.1} className='mt-12 md:mt-16 w-[88%] md:w-[620px] mx-auto'>
          <div className='relative w-full overflow-hidden rounded-[2px] aspect-[4/3]'>
            <Image
              src='/2026-05%20-%20Italy%20roadtrip/Milan%20Cinque%20Terre%20Pisa/Porto_Venere_web.jpeg'
              alt='Porto Venere seen from the water, approaching by ferry.'
              fill
              sizes='(min-width: 768px) 620px, 88vw'
              className='object-cover'
            />
          </div>
          <p className='mt-3 text-center text-xs uppercase tracking-[0.18em] font-[family-name:var(--font-poppins)] font-semibold text-black/40 dark:text-white/40'>
            Porto Venere, from the water.
          </p>
        </Reveal>

        {/* BUS BACK TO LA SPEZIA -- one short closing line, no heading,
            no separate section -- exactly as asked. */}
        <div className='max-w-2xl mx-auto text-center'>
          <Reveal delay={0.1} className='mt-10 md:mt-12 max-w-xl mx-auto'>
            <Paragraphs
              className='text-center'
              items={[
                'From Porto Venere, we took the bus back to La Spezia.',
              ]}
            />
          </Reveal>
        </div>
      </section>

      {/* MAP -- La Spezia -> Pisa, the third road-trip leg. Same
          JourneyMapScene engine, same height, same edge-to-edge/no-
          padding placement as the two maps above (see
          lib/journeys/italy.ts for the route data, the real-coordinate
          sourcing, and the fine Tuscan-coast land patch this leg needed).
          Placed directly after the finished La Spezia / Cinque Terre
          chapter and its "More to come" note, per explicit instruction,
          so this reads as the next leg of the same continuing journey
          rather than a new page starting. */}
      <JourneyMapScene
        journey={ITALY_LASPEZIA_TO_PISA_JOURNEY}
        heightClassName='h-[380px] sm:h-[440px] md:h-[500px]'
      />

      {/* PISA CHAPTER OPENING -- deliberately minimal, per explicit
          instruction: only the route transition and this chapter's own
          bare opening (RouteLabel + ChapterHeading), matching the exact
          same pattern as "Milano -> La Spezia" / "Next stop: La Spezia"
          above. No Pisa story, activities, prices, accommodation, dates
          or other content yet -- that comes in a separate pass once the
          actual content and photos are supplied. */}
      <section className='px-6 md:px-12 pt-8 md:pt-10 pb-16 md:pb-24 bg-[#faf9f6] dark:bg-black'>
        <div className='max-w-2xl mx-auto text-center'>
          <Reveal>
            <RouteLabel>La Spezia → Pisa</RouteLabel>
          </Reveal>
        </div>

        {/* A QUICK STOP IN PISA -- deliberately short, personal and
            image-led per explicit instruction: this is not a Pisa travel
            guide. No history, cathedral or ticket information -- just the
            Leaning Tower stop on the way south. The "Next stop: Pisa"
            chapter marker was removed as redundant with the RouteLabel
            above (which already says La Spezia -> Pisa) -- this heading
            now sits directly under the RouteLabel at the same mt-8/10 gap
            every other RouteLabel -> ChapterHeading opener on this page
            uses (see "Slovenia -> Milano" / "First stop? Milano!" above),
            rather than the larger mt-10/12 gap it had when a chapter
            marker sat between them. */}
        <div className='max-w-2xl mx-auto text-center'>
          <Reveal delay={0.1} className='mt-8 md:mt-10 max-w-xl mx-auto'>
            <ChapterHeading italic>A quick stop in Pisa</ChapterHeading>
            <Paragraphs
              className='mt-5 text-center'
              items={[
                "Pisa was just a short stop on our way south. We wanted to see the Leaning Tower \u2014 and in person, it somehow wasn't quite what I'd imagined.",
              ]}
            />
          </Reveal>
        </div>

        {/* Pisa_tower.mp4 -- this beat's main visual, per explicit
            instruction. Native 1080x1920 vertical recording, so it drops
            into the same aspect-[9/16] "moving photograph" wrapper used
            throughout this page (autoPlay/muted/loop/playsInline,
            contained by width, not trimmed or re-cropped) -- the opening
            seconds, which give the clearest sense of the tower's actual
            scale and lean, stay intact. Sized prominently, matching the
            Cinque Terre sea video's treatment above, since this is the
            beat's main image rather than a small aside. */}
        <Reveal delay={0.1} className='mt-12 md:mt-16 max-w-[300px] sm:max-w-[400px] md:max-w-[520px] mx-auto'>
          <div className='relative w-full overflow-hidden rounded-[2px] aspect-[9/16]'>
            <video
              src='/2026-05%20-%20Italy%20roadtrip/Milan%20Cinque%20Terre%20Pisa/Pisa_tower.mp4'
              autoPlay
              muted
              loop
              playsInline
              preload='auto'
              aria-hidden='true'
              className='absolute inset-0 h-full w-full object-cover'
            />
          </div>
        </Reveal>

        {/* Pisa_tower.jpeg -- native portrait 3:4 (2666x3555, EXIF-
            rotated), same aspect-[3/4] treatment as the rest of the
            page's portrait photos, so nothing is cropped. */}
        <Reveal delay={0.1} className='mt-8 md:mt-10 w-[75%] md:w-[350px] mx-auto'>
          <div className='relative w-full overflow-hidden rounded-[2px] aspect-[3/4]'>
            <Image
              src='/2026-05%20-%20Italy%20roadtrip/Milan%20Cinque%20Terre%20Pisa/Pisa_tower.jpeg'
              alt='The Leaning Tower of Pisa.'
              fill
              sizes='(min-width: 768px) 350px, 75vw'
              className='object-cover'
            />
          </div>
        </Reveal>

        <div className='max-w-2xl mx-auto text-center'>
          <Reveal delay={0.1} className='mt-8 md:mt-10 max-w-xl mx-auto'>
            <Paragraphs
              className='text-center'
              items={[
                'Crowded? Very. Everyone was trying to get that photo with the tower. And yes, so were we.',
                "There’s a large tourist car park a short walk from Piazza dei Miracoli. The square itself is free to visit, with the Leaning Tower, cathedral and baptistery all together. Outside, expect plenty of souvenir stalls — very touristy, very Pisa.",
              ]}
            />
          </Reveal>
        </div>

        {/* A LITTLE TUSCANY DETOUR -- PECCIOLI -- a very small, spontaneous
            beat, per explicit instruction: no new route map here (the
            Lake Garda leg comes later), bare ChapterHeading matching
            Porto Venere's weight above, kept deliberately brief. */}
        <div className='max-w-2xl mx-auto text-center'>
          <Reveal delay={0.1} className='mt-14 md:mt-16 max-w-xl mx-auto'>
            <ChapterHeading italic>A little Tuscany detour</ChapterHeading>
            <Paragraphs
              className='mt-5 text-center'
              items={[
                'Before heading north, we made a small detour to Peccioli for a glimpse of the Tuscan countryside \u2014 and hopefully a nice lunch along the way.',
              ]}
            />
          </Reveal>
        </div>

        {/* Peccioli.jpeg -- native landscape 4:3 (5712x4284), same
            aspect-[4/3] treatment as this page's other landscape photos
            (e.g. Porto_Venere_web.jpeg above). Only Peccioli photo used,
            per explicit instruction. */}
        <Reveal delay={0.1} className='mt-12 md:mt-16 w-[88%] md:w-[620px] mx-auto'>
          <div className='relative w-full overflow-hidden rounded-[2px] aspect-[4/3]'>
            <Image
              src='/2026-05%20-%20Italy%20roadtrip/Milan%20Cinque%20Terre%20Pisa/Peccioli.jpeg'
              alt='Peccioli, Tuscany.'
              fill
              sizes='(min-width: 768px) 620px, 88vw'
              className='object-cover'
            />
          </div>
          <p className='mt-3 text-center text-xs uppercase tracking-[0.18em] font-[family-name:var(--font-poppins)] font-semibold text-black/40 dark:text-white/40'>
            The footbridge in Peccioli.
          </p>
        </Reveal>

        <div className='max-w-2xl mx-auto text-center'>
          <Reveal delay={0.1} className='mt-8 md:mt-10 max-w-xl mx-auto'>
            <Paragraphs
              className='text-center'
              items={[
                "The views were easy to find. Lunch wasn't.",
                'Every restaurant we tried was closed. We eventually found a place serving simple lunch menus \u2014 not quite the Tuscan lunch we\'d imagined, but at that point, food was food.',
              ]}
            />
          </Reveal>
        </div>
      </section>

      {/* MAP -- Pisa -> Peschiera del Garda, the fourth road-trip leg.
          Same JourneyMapScene engine, same height, same edge-to-edge/no-
          padding placement as every map above (see lib/journeys/italy.ts
          for the route data and real-coordinate sourcing). Placed
          directly after the Pisa/Peccioli chapter, per explicit
          instruction -- the Peccioli detour stays exactly as it was,
          this just continues the same page from where that chapter
          already ended. */}
      <JourneyMapScene
        journey={ITALY_PISA_TO_PESCHIERA_JOURNEY}
        heightClassName='h-[380px] sm:h-[440px] md:h-[500px]'
      />

      {/* LAKE GARDA / PESCHIERA -- deliberately concise, per explicit
          instruction: accommodation, one evening photo, done. Gardaland
          is the real reason for this stop, so this chapter stays short
          rather than over-documenting Lake Garda itself. */}
      <section className='px-6 md:px-12 pt-8 md:pt-10 pb-16 md:pb-24 bg-[#faf9f6] dark:bg-black'>
        <div className='max-w-2xl mx-auto text-center'>
          <Reveal>
            <RouteLabel>Pisa → Peschiera del Garda</RouteLabel>
          </Reveal>
        </div>

        {/* SEI GARDA APARTMENTS -- accommodation text written in the same
            personal, concise voice as Casa Esmeralda above (own
            experience, not a listing description), plus the same
            practical-info Fact card treatment used for every other stay
            on this page. The "Next stop: Peschiera del Garda" chapter
            marker was removed as redundant with the RouteLabel above --
            this heading now sits directly under the RouteLabel at the
            same mt-8/10 gap every other RouteLabel -> ChapterHeading
            opener on this page uses, rather than the larger mt-10/12 gap
            it had when a chapter marker sat between them. */}
        <div className='max-w-2xl mx-auto text-center'>
          <Reveal delay={0.1} className='mt-8 md:mt-10 max-w-xl mx-auto'>
            <ChapterHeading italic>Our base by Lake Garda.</ChapterHeading>
            <Paragraphs
              className='mt-5 text-center'
              items={[
                'We stayed at SEI Garda Apartments, right on the road to Gardaland and a short walk from the centre of Peschiera. For us, the location was perfect.',
              ]}
            />
          </Reveal>

          <Reveal delay={0.15} className='mt-9 md:mt-11 mx-auto max-w-[460px] rounded-[3px] bg-[#f1ebdc] dark:bg-white/[0.04] px-8 py-8 md:px-9 md:py-9'>
            <Fact
              label='SEI Garda Apartments · 2 Nights'
              value='€369.90'
              support={[
                { text: '29 Apr → 1 May 2026' },
                { text: 'Apartment · Family of Four', variant: 'label' },
              ]}
            />
          </Reveal>

          <Reveal delay={0.1} className='mt-9 md:mt-11 max-w-xl mx-auto'>
            <Paragraphs
              className='text-center'
              items={[
                'The downside? When Gardaland closes, that same road gets completely gridlocked. At that time of day, walking is actually faster.',
              ]}
            />
          </Reveal>
        </div>

        {/* Peschiera del Garda.jpeg -- the only Lake Garda/Peschiera photo
            used, per explicit instruction: the landscape shot looking
            over the water/bridge toward Peschiera's colourful buildings.
            Native landscape 4:3 (5712x4284), same aspect-[4/3] treatment
            as this page's other landscape photos. A simple visual ending
            to this part of the journey -- no gallery. */}
        <Reveal delay={0.1} className='mt-12 md:mt-16 w-[88%] md:w-[620px] mx-auto'>
          <div className='relative w-full overflow-hidden rounded-[2px] aspect-[4/3]'>
            <Image
              src='/2026-05%20-%20Italy%20roadtrip/Milan%20Cinque%20Terre%20Pisa/Peschiera%20del%20Garda.jpeg'
              alt='Looking over the water toward the colourful buildings of Peschiera del Garda.'
              fill
              sizes='(min-width: 768px) 620px, 88vw'
              className='object-cover'
            />
          </div>
        </Reveal>

        <div className='max-w-2xl mx-auto text-center'>
          <Reveal delay={0.1} className='mt-8 md:mt-10 max-w-xl mx-auto'>
            <Paragraphs
              className='text-center'
              items={[
                'We ended the day with a walk through Peschiera del Garda and along the lake \u2014 a lovely place to spend the evening before Gardaland the next morning.',
              ]}
            />
          </Reveal>
        </div>

        {/* GARDALAND -- bare ChapterHeading, same "activity within a
            base destination" treatment as "Three villages. Two ways to
            see them." above (La Spezia -> Cinque Terre): Gardaland is a
            day trip from this Peschiera del Garda base, not a new
            road-trip stop, so no RouteLabel, no map, no "Next stop"
            wording -- just continues within this same chapter/section.
            This is now the next completed part of the story, so the
            earlier "more coming soon" placeholder is gone. Kept
            deliberately short per explicit instruction -- one intro
            line, the ticket price card, a short practical note about
            how the tickets were bought, and a closing line -- with the
            page's existing spacing tokens (mt-9/11 between a tight
            text/card/note beat, mt-14/16 between wider beats) doing
            the work of leaving room for photos or video to be added
            around the text in a later pass. */}
        <div className='max-w-2xl mx-auto text-center'>
          <Reveal delay={0.1} className='mt-14 md:mt-16 max-w-xl mx-auto'>
            <ChapterHeading italic>Gardaland</ChapterHeading>
            <Paragraphs
              className='mt-5 text-center'
              items={[
                "The kids had been looking forward to Gardaland the entire trip. We'd been before when they were younger, but this time they were ready for almost all the big rides — starting with Raptor.",
              ]}
            />
          </Reveal>

          {/* Gardaland ticket keepsake -- a small, elegant crop taken from
              the actual entry ticket: just the Gardaland Resort logo and
              the colourful park-illustration skyline that frames it,
              with the QR code, ticket code, transaction number and the
              terms-and-conditions text all cropped away entirely -- none
              of that ticket-identifying content is included. The
              artwork itself is untouched, only cropped. Sized as a small
              supporting image (same "text -> photo" mt-12/16 gap and
              narrow percentage-based width used for the smaller
              secondary photos above, e.g. Milano_streets_web), and
              object-contain rather than object-cover since this is a
              flat graphic that must never be cropped further. */}
          <Reveal delay={0.1} className='mt-12 md:mt-16 w-[80%] md:w-[380px] mx-auto'>
            <div className='relative w-full overflow-hidden rounded-[2px] bg-white aspect-[1100/465]'>
              <Image
                src='/2026-05%20-%20Italy%20roadtrip/Milan%20Cinque%20Terre%20Pisa/Gardaland_ticket_keepsake.png'
                alt='The Gardaland Resort logo with the colourful park illustrations from our entry ticket.'
                fill
                sizes='(min-width: 768px) 380px, 80vw'
                className='object-contain'
              />
            </div>
          </Reveal>

          {/* Gardaland ticket price card -- same quiet cream practical-info
              panel language as every other price card on this page. Total
              amount paid is the large prominent value (matching the San
              Siro ticket card's hierarchy), with the ticket count/per-
              person price as the uppercase detail line and the flat-price
              note as a quieter secondary line -- no other ticket details. */}
          <Reveal delay={0.15} className='mt-9 md:mt-11 mx-auto max-w-[460px] rounded-[3px] bg-[#f1ebdc] dark:bg-white/[0.04] px-8 py-8 md:px-9 md:py-9'>
            <Fact
              label='Gardaland · Full Day'
              value='€176'
              support={[
                { text: '4 Tickets · €44 pp', variant: 'label' },
                { text: 'Adults & children same price' },
              ]}
            />
          </Reveal>

          {/* Ticket-buying note -- normal page text under the card, not
              part of it, same treatment as the "One thing to know" note
              beneath the SEI Garda Apartments card above. */}
          <Reveal delay={0.1} className='mt-9 md:mt-11 max-w-xl mx-auto'>
            <Paragraphs
              className='text-center'
              items={[
                "I couldn't buy the tickets directly from the official website, so I used a third-party seller instead. Everything worked perfectly.",
              ]}
            />
          </Reveal>

          {/* End of the day -- a short closing line for this beat, with
              extra space above it (matching the page's wider inter-beat
              gap) reserving room for photos/video of the day itself to
              be added in a later pass. */}
          <Reveal delay={0.1} className='mt-14 md:mt-16 max-w-xl mx-auto'>
            <Paragraphs
              className='text-center'
              items={[
                'We spent the whole day in the park — and by the evening, we had no energy left for anything else.',
              ]}
            />
          </Reveal>
        </div>
      </section>

      {/* MAP -- Peschiera del Garda -> Home, the trip's real final leg.
          Same JourneyMapScene engine, same height, same edge-to-edge/no-
          padding placement as every map above (see lib/journeys/italy.ts
          for the route data and real-coordinate sourcing -- it reuses the
          Home->Milano route's own Verona/Venice-area/Trieste/Slovenia
          corridor in reverse). Placed directly after the Gardaland
          section and before the "Venice? Not this time." chapter, per
          explicit instruction, matching where every other road-trip map
          on this page sits between stages. Venice/Mestre is passed
          through as a plain waypoint only -- never marked as a stop. */}
      <JourneyMapScene
        journey={ITALY_PESCHIERA_TO_HOME_JOURNEY}
        heightClassName='h-[380px] sm:h-[440px] md:h-[500px]'
      />

      {/* PESCHIERA DEL GARDA -> HOME -- the trip's actual final leg, and
          the page's closing chapter. Same section wrapper classes as
          every other chapter above for consistency, even though no map
          precedes it -- this documents a plan that changed, not a route
          we actually drove, so there is no journey map here. RouteLabel
          reflects the real direction travelled (home), never "-> Venice",
          and deliberately not phrased as "Next stop" since we did not
          end up visiting. Kept short: heading, the four short lines of
          text as given, and the small refunded-ticket keepsake -- no
          price card, since the tickets were cancelled and refunded. */}
      <section className='px-6 md:px-12 pt-8 md:pt-10 pb-16 md:pb-24 bg-[#faf9f6] dark:bg-black'>
        <div className='max-w-2xl mx-auto text-center'>
          <Reveal>
            <RouteLabel>Peschiera del Garda → Home</RouteLabel>
          </Reveal>
        </div>

        <div className='max-w-2xl mx-auto text-center'>
          <Reveal delay={0.1} className='mt-8 md:mt-10 max-w-xl mx-auto'>
            <ChapterHeading italic>Venice? Not this time.</ChapterHeading>
            <Paragraphs
              className='mt-5 text-center'
              items={[
                'We had already bought the Venice access fee. But plans can change.',
                'After Gardaland and several days on the road, we were tired. With 1 May being a public holiday, we expected Venice to be extremely busy.',
                'So we changed our minds and chose a slow drive home instead.',
                'Venice can wait for another trip.',
              ]}
            />
          </Reveal>

          {/* Venice access fee keepsake -- a small crop of the actual
              (now refunded) access-fee voucher: just the Città di
              Venezia crest/heading, the date and the €5 price. The QR
              code and the personal booking code/initials are both
              cropped out entirely, same privacy approach as the
              Gardaland ticket crop above -- the artwork itself is
              untouched, only cropped. No price card alongside it: the
              tickets were cancelled and refunded, so there's nothing to
              price. Sized smaller than the Gardaland keepsake (this is a
              minor scrapbook detail, not a section anchor), with plenty
              of surrounding whitespace, and object-contain so the
              voucher graphic is never cropped further. */}
          <Reveal delay={0.1} className='mt-12 md:mt-16 w-[56%] sm:w-[42%] md:w-[280px] mx-auto'>
            <div className='relative w-full overflow-hidden rounded-[2px] bg-white aspect-[402/419]'>
              <Image
                src='/2026-05%20-%20Italy%20roadtrip/Milan%20Cinque%20Terre%20Pisa/Venice_access_fee_keepsake.png'
                alt='The Città di Venezia access fee voucher, showing only the date and price.'
                fill
                sizes='(min-width: 768px) 280px, 42vw'
                className='object-contain'
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* 1,984 KM LATER -- the true closing beat of the Italy story.
          Bare ChapterHeading (no RouteLabel: this is a reflection, not
          a new geographic leg), Tesla.jpeg as the trip's final photo at
          the same large-landscape width/aspect-[4/3] treatment used for
          this page's other main photos (e.g. Peschiera del Garda.jpeg)
          so the whole car is shown with no awkward cropping, and a short
          two-line note exactly as given (no EV stats beyond that). The
          small "1,984 km · Italy road trip · done." closing line was
          removed as repetitive with the "1,984 km later." heading above
          it -- per explicit instruction. */}
      <section className='px-6 md:px-12 pt-8 md:pt-10 pb-16 md:pb-24 bg-[#faf9f6] dark:bg-black'>
        <div className='max-w-2xl mx-auto text-center'>
          <Reveal>
            <ChapterHeading italic>1,984 km later.</ChapterHeading>
          </Reveal>
        </div>

        <Reveal delay={0.1} className='mt-12 md:mt-16 w-[88%] md:w-[620px] mx-auto'>
          <div className='relative w-full overflow-hidden rounded-[2px] aspect-[4/3]'>
            <Image
              src='/2026-05%20-%20Italy%20roadtrip/Milan%20Cinque%20Terre%20Pisa/Tesla.jpeg'
              alt='A very dirty black Tesla with its doors open after the long drive home.'
              fill
              sizes='(min-width: 768px) 620px, 88vw'
              className='object-cover'
            />
          </div>
        </Reveal>

        <div className='max-w-2xl mx-auto text-center'>
          <Reveal delay={0.1} className='mt-8 md:mt-10 max-w-xl mx-auto'>
            <Paragraphs
              className='text-center'
              items={[
                "A very dirty Tesla and one thing we didn't have to worry about: charging.",
                'Italy turned out to be incredibly EV-friendly. Tesla Superchargers were easy to find along our route, and charging was never a problem.',
              ]}
            />
          </Reveal>
        </div>
      </section>

      {/* BOOKED BEFORE WE LEFT -- the same reusable pre-trip checklist
          component used to close the Tenerife page
          (components/ui/booked-checklist.tsx), reused here completely
          unchanged so both destination pages end the same way: no card,
          no border, no background panel, just the shared pink-checkmark
          list, same typography/spacing/width as the Tenerife version.
          This page only supplies its own list of what was actually
          booked ahead of the Italy trip -- Duomo tickets are deliberately
          left off, since those were bought spontaneously in Milano, not
          booked in advance. Same section wrapper spacing every other
          Italy-page section already uses, for a consistent close. This is
          now the final section of the Italy page -- no more-content-coming
          placeholder follows. */}
      <section className='px-6 md:px-12 pt-8 md:pt-10 pb-16 md:pb-24 bg-[#faf9f6] dark:bg-black'>
        <Reveal className='mx-auto'>
          <BookedChecklist
            items={[
              'Accommodation in Milano',
              'Accommodation in La Spezia',
              'Accommodation in Peschiera del Garda',
              'Gardaland tickets',
              'Venice Access Fee',
            ]}
          />
        </Reveal>
      </section>
    </div>
  );
}
