'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import JourneyMapScene from '@/components/journey/JourneyMapScene';
import { RouteLabel, TimeStamp } from '@/components/journey/annotation-kit';
import { ITALY_HOME_TO_MILANO_JOURNEY } from '@/lib/journeys/italy';

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
          <Reveal delay={0.1} className='mt-9 md:mt-11 mx-auto max-w-[460px] rounded-[3px] bg-[#f1ebdc] dark:bg-white/[0.04] px-8 py-8 md:px-9 md:py-9 flex flex-col items-center gap-1 text-center'>
            <span className='text-xs uppercase tracking-[0.18em] font-[family-name:var(--font-poppins)] font-semibold text-black/45 dark:text-white/45'>
              Central Milano · 2 Nights
            </span>
            <TimeStamp size='md'>€949.32</TimeStamp>
            <span className='mt-4 text-sm font-[family-name:var(--font-poppins)] text-black/60 dark:text-white/60'>
              25 Apr → 27 Apr 2026
            </span>
            <span className='mt-4 text-xs uppercase tracking-[0.18em] font-[family-name:var(--font-poppins)] font-semibold text-black/45 dark:text-white/45'>
              Family of four
            </span>
            <span className='text-sm font-[family-name:var(--font-poppins)] text-black/60 dark:text-white/60'>
              Room · shared kitchen
            </span>
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
                'With nothing planned until the football match that evening, we headed to the Duomo. There was almost no queue, so we spontaneously bought tickets and went up.',
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
            uses (mt-10 md:mt-12, e.g. the Ryanair photo -> "A first with
            Ryanair"). */}
        <div className='max-w-2xl mx-auto text-center'>
          <Reveal delay={0.1} className='mt-10 md:mt-12 max-w-xl mx-auto'>
            <Paragraphs
              className='text-center'
              items={[
                "We're not usually the ones buying tickets for churches or museums. This one was absolutely worth it.",
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
      </section>
    </div>
  );
}
