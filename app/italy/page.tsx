'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import JourneyMapScene from '@/components/journey/JourneyMapScene';
import { RouteLabel, TimeStamp } from '@/components/journey/annotation-kit';
import { ITALY_HOME_TO_MILANO_JOURNEY, ITALY_MILANO_TO_LASPEZIA_JOURNEY } from '@/lib/journeys/italy';

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
                "We're not usually the ones buying tickets for churches or museums. This one was absolutely worth it \u2014 \u20ac66 for the four of us, cathedral interior and rooftop terraces included, access by stairs rather than elevator.",
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

        {/* GALLERIA — deliberately the lightest possible treatment on this
            page: no Eyebrow, no ChapterHeading, no photo, just one quiet
            paragraph continuing the same beat as the Duomo video above it
            (same "photo/video -> connected text" token, mt-10/12, as the
            Duomo punchline). This is a one-line transition, not a new
            attraction — per this step's explicit instruction not to give
            the Galleria its own section or any media. */}
        <div className='max-w-2xl mx-auto text-center'>
          <Reveal delay={0.1} className='mt-10 md:mt-12 max-w-xl mx-auto'>
            <Paragraphs
              className='text-center'
              items={[
                "Right next to the Duomo, we walked through the famous Galleria Vittorio Emanuele II. Beautiful, yes — but high fashion isn't really our thing, so we simply kept walking.",
              ]}
            />
          </Reveal>
        </div>

        {/* SLOW SUNDAY — a new beat (Eyebrow-only marker, same tier as
            "Sunday Morning" above), opening the "walking through Milano"
            atmosphere stretch of the day. Gap above reuses the file's
            "closing one beat -> opening a different one" token (mt-14/16),
            since this moves from the Duomo/Galleria sightseeing into open,
            unplanned wandering. */}
        <div className='max-w-2xl mx-auto text-center'>
          <Reveal className='mt-14 md:mt-16 max-w-xl mx-auto'>
            <Eyebrow>Slow Sunday</Eyebrow>
            <ChapterHeading italic className='mt-3'>
              Walking, gelato &amp; no rush
            </ChapterHeading>
            <Paragraphs
              className='mt-5 text-center'
              items={[
                'After the Duomo, we grabbed a gelato and simply wandered through Milano. Trams, beautiful streets and no real plan — the city felt easy to explore.',
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
                'We eventually found a place for lunch and joined the queue outside. Once inside, we quickly learned something about Italians — lunch is not something to rush.',
                'Coming from people who are always in a hurry, we could probably learn a thing or two.',
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
            <Eyebrow>Getting Around</Eyebrow>
            <ChapterHeading italic className='mt-3'>
              Getting around was surprisingly easy
            </ChapterHeading>
            <Paragraphs
              className='mt-5 text-center'
              items={[
                "Milano's metro was incredibly simple to use — no tickets to buy, we just tapped our cards at the gates. Our kids already had their own Revolut cards, which made travelling as a family effortless.",
                'One card per traveller, though — the gates need a tap from everyone.',
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
            <Eyebrow>A Different Milano</Eyebrow>
            <ChapterHeading italic className='mt-3'>
              Then Milano turned green
            </ChapterHeading>
            <Paragraphs
              className='mt-5 text-center'
              items={[
                'We headed to the modern part of the city, expecting skyscrapers and glass. Instead, my favourite thing was a wildflower meadow — with the incredible Bosco Verticale rising behind it.',
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

        {/* The reflection line — connected to the video above (same
            photo/video -> connected text token, mt-10/12), closing the
            "Modern Milano" beat the same way the Duomo punchline closes
            its own beat. */}
        <div className='max-w-2xl mx-auto text-center'>
          <Reveal delay={0.1} className='mt-10 md:mt-12 max-w-xl mx-auto'>
            <Paragraphs
              className='text-center'
              items={[
                'Skyscrapers, wildflowers and a building covered in trees. I loved this side of Milano.',
              ]}
            />
          </Reveal>
        </div>

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
              And then it was time for the one thing we had actually planned.
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
            already uses for every reflection line following a video (e.g.
            "Skyscrapers, wildflowers..." after Milano_green.mp4). */}
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
        <Reveal delay={0.1} className='mt-10 md:mt-12 mx-auto max-w-[460px] rounded-[3px] bg-[#f1ebdc] dark:bg-white/[0.04] px-8 py-8 md:px-9 md:py-9 flex flex-col items-center gap-1 text-center'>
          <span className='text-xs uppercase tracking-[0.18em] font-[family-name:var(--font-poppins)] font-semibold text-black/45 dark:text-white/45'>
            AC Milan vs Juventus
          </span>
          <TimeStamp size='md'>€476</TimeStamp>
          <span className='mt-4 text-sm font-[family-name:var(--font-poppins)] text-black/60 dark:text-white/60'>
            26 Apr 2026 · 20:45
          </span>
          <span className='mt-4 text-xs uppercase tracking-[0.18em] font-[family-name:var(--font-poppins)] font-semibold text-black/45 dark:text-white/45'>
            4 Tickets · €119 pp
          </span>
          <span className='text-sm font-[family-name:var(--font-poppins)] text-black/60 dark:text-white/60'>
            San Siro · Milano
          </span>
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
          stop? Milano!" above. Everything after this opening is a full
          restructure of the previous build: a 27 April arrival/evening
          beat now comes first, THEN the 28 April Cinque Terre day --
          correcting the previous chronology, which jumped straight from
          this heading into "28 April" with no arrival day at all. */}
      <section className='px-6 md:px-12 pt-8 md:pt-10 pb-16 md:pb-24 bg-[#faf9f6] dark:bg-black'>
        <div className='max-w-2xl mx-auto text-center'>
          <Reveal>
            <RouteLabel>Milano → La Spezia</RouteLabel>
          </Reveal>

          <Reveal className='mt-8 md:mt-10 max-w-xl mx-auto'>
            <ChapterHeading italic>Next stop: La Spezia</ChapterHeading>
          </Reveal>
        </div>

        {/* LA SPEZIA ARRIVAL -- 27 April 2026 (corrected from 28 April;
            this was the actual day of the Milano -> La Spezia drive, and
            the day before the Cinque Terre day itself -- without this
            beat the chronology jumped straight from Milano to Cinque
            Terre with no arrival day in between). Same grouping/gap as
            the old Cinque Terre opener this replaces (Eyebrow ->
            ChapterHeading -> Paragraphs in one Reveal, mt-10 md:mt-12
            below the chapter heading above). Only the facts actually
            provided: an apartment (deliberately no name or price -- not
            asked for), the host arranging private parking (no price --
            explicitly asked not to state one), meeting us and walking us
            there, then the evening at L'Altra Luna with the actual price
            paid. Nothing invented beyond this. */}
        <div className='max-w-2xl mx-auto text-center'>
          <Reveal delay={0.1} className='mt-10 md:mt-12 max-w-xl mx-auto'>
            <Eyebrow>La Spezia · 27 April 2026</Eyebrow>
            <ChapterHeading italic className='mt-3'>
              Our base for Cinque Terre.
            </ChapterHeading>
            <Paragraphs
              className='mt-5 text-center'
              items={[
                "We left Milano on 27 April and drove down to La Spezia, which we'd chosen as our base for exploring Cinque Terre. We stayed in an apartment there, and our host was incredibly kind — she arranged private parking for us, met us when we arrived, and walked us to the apartment herself.",
                "That evening we walked to L'Altra Luna, a small pizzeria nearby. It felt a little like stepping back in time — including the prices: we paid €10.60 for two pizzas.",
              ]}
            />
          </Reveal>
        </div>

        {/* LaSpezia_pizzeria_web.jpeg -- the evening beat's own image,
            sized as a supporting photo rather than a hero -- this is a
            short arrival-day chapter, not the emotional centre of the
            page. EXIF-rotated/baked into the _web file (source
            5712x4284 at orientation 6 -> displayed 3:4 portrait,
            aspect-[3/4]), same convention as every other _web photo on
            this page. */}
        <Reveal delay={0.1} className='mt-12 md:mt-16 w-[70%] md:w-[340px] mx-auto'>
          <div className='relative w-full overflow-hidden rounded-[2px] aspect-[3/4]'>
            <Image
              src='/2026-05%20-%20Italy%20roadtrip/Milan%20Cinque%20Terre%20Pisa/LaSpezia_pizzeria_web.jpeg'
              alt="L'Altra Luna, the pizzeria we visited on our first evening in La Spezia."
              fill
              sizes='(min-width: 768px) 340px, 70vw'
              className='object-cover'
            />
          </div>
          <p className='mt-3 text-center text-xs uppercase tracking-[0.18em] font-[family-name:var(--font-poppins)] font-semibold text-black/40 dark:text-white/40'>
            L&apos;Altra Luna, La Spezia.
          </p>
        </Reveal>

        {/* CINQUE TERRE DAY OPENING -- 28 April 2026. Same
            Eyebrow -> ChapterHeading -> Paragraphs grouping as the
            arrival beat above, mt-14 md:mt-16 below it (the "new topic"
            token -- this is a new day, not a continuation of the evening
            beat). Heading and opening paragraph now state the actual
            route chosen (three villages by train, then ferry + bus) up
            front, replacing the old "explore all five villages" framing,
            which was wrong -- we deliberately did not try to see every
            village. Second half of the paragraph is close to verbatim
            the copy given for this beat. */}
        <div className='max-w-2xl mx-auto text-center'>
          <Reveal delay={0.1} className='mt-14 md:mt-16 max-w-xl mx-auto'>
            <Eyebrow>Cinque Terre · 28 April 2026</Eyebrow>
            <ChapterHeading italic className='mt-3'>
              Three villages. Two ways to see them.
            </ChapterHeading>
            <Paragraphs
              className='mt-5 text-center'
              items={[
                "The next morning, we set out to explore Cinque Terre — not by trying to tick off every village, but by choosing our own route. We started by train from La Spezia, stopping in Manarola, Monterosso and Vernazza. From there, instead of taking the train back, we changed perspective completely — ferry to Porto Venere, then bus back to La Spezia.",
              ]}
            />
          </Reveal>
        </div>

        {/* ROUTE DIAGRAM -- the small, elegant, editorial route sequence
            itself: La Spezia -> train -> Manarola -> train -> Monterosso
            -> train -> Vernazza -> ferry -> Porto Venere -> bus -> La
            Spezia. Deliberately not a coloured tourist-map infographic --
            see the RouteSequence component definition above for why it
            reuses the journey map's own pink-dot/uppercase-label
            language instead of inventing a new visual style. This is one
            of the useful, concrete pieces of information the page wants
            a reader to take away, so it gets its own visual beat rather
            than staying buried in the paragraph above. */}
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

        {/* GETTING AROUND -- unchanged in spirit from the previous build
            (Eyebrow + Paragraphs only, no separate ChapterHeading, the
            same lighter "practical beat" weight as Milano's "Good to
            Know"), now grouped with only the train-pass cost mentioned
            in prose -- the ferry cost is saved for its own story later,
            and the combined total card moves to the end of the day's
            story rather than sitting here. No "watching the clock"
            phrasing or any other detail not actually provided. */}
        <div className='max-w-2xl mx-auto text-center'>
          <Reveal delay={0.1} className='mt-14 md:mt-16 max-w-xl mx-auto'>
            <Eyebrow>Getting Around</Eyebrow>
            <Paragraphs
              className='mt-5 text-center'
              items={[
                'We left the car in La Spezia and used public transport for the day. We bought train passes that let us hop on and off freely, which made it easy to move between villages without buying individual tickets each time. Train passes for the four of us came to €56.50.',
              ]}
            />
          </Reveal>
        </div>

        {/* MANAROLA + MONTEROSSO -- deliberately light, Eyebrow-only
            waypoint beats (no ChapterHeading, no photos -- no image in
            the folder is identifiable as either village, and the brief
            is explicit that an image needs a narrative reason to be
            there). Their purpose is only to show the progression of the
            day by train before reaching Vernazza, per the brief -- not
            to describe every village. Kept to one short sentence each,
            with a smaller gap between them (mt-8 md:mt-10) than the
            usual "new topic" token, since they're two halves of the same
            "first, then second stop" beat rather than fully separate
            topics. */}
        <div className='max-w-2xl mx-auto text-center'>
          <Reveal delay={0.1} className='mt-14 md:mt-16 max-w-xl mx-auto'>
            <Eyebrow>Manarola</Eyebrow>
            <Paragraphs
              className='mt-3 text-center'
              items={[
                'Manarola was our first stop — a quick stop before the train carried us on to Monterosso.',
              ]}
            />
          </Reveal>
          <Reveal delay={0.15} className='mt-8 md:mt-10 max-w-xl mx-auto'>
            <Eyebrow>Monterosso</Eyebrow>
            <Paragraphs
              className='mt-3 text-center'
              items={[
                'Monterosso came next, our second stop before continuing on to Vernazza.',
              ]}
            />
          </Reveal>
        </div>

        {/* VERNAZZA -- OUR FAVOURITE. Still the emotional centre of the
            section, still the one beat with a bare ChapterHeading and no
            Eyebrow above it. Text corrected from "Of all five villages"
            (wrong -- we only visited three) to reflect it was the last
            of our three train stops, and the one that stayed with us
            most. Otherwise unchanged from the previous build: lunch, the
            castle/viewpoint climb, the small entrance fee ("a few
            euros" -- not invented), the view itself. */}
        <div className='max-w-2xl mx-auto text-center'>
          <Reveal delay={0.1} className='mt-14 md:mt-16 max-w-xl mx-auto'>
            <ChapterHeading italic>Vernazza — our favourite</ChapterHeading>
            <Paragraphs
              className='mt-5 text-center'
              items={[
                'Vernazza was our last stop by train, and the one that stayed with us most. We stopped there for lunch, then walked up to the small castle and viewpoint above the village — a short climb, with a small entrance fee of just a few euros.',
                'The view from up there, straight down over the harbour and the rooftops, was absolutely worth the climb.',
              ]}
            />
          </Reveal>
        </div>

        {/* Cinque_Terre_view_web.jpeg -- unchanged from the previous
            build: the main Vernazza image, still the largest single
            photo on the page (w-[92%] md:w-[680px], aspect-[4/3]), still
            captioned "Vernazza, from above." */}
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

        {/* Short connecting line -- unchanged from the previous build.
            Now transitions into the ferry story rather than into a
            second Vernazza video (that video is dropped this build --
            see the note by the sea video below for why). */}
        <div className='max-w-2xl mx-auto text-center'>
          <Reveal delay={0.1} className='mt-10 md:mt-12 max-w-xl mx-auto'>
            <Paragraphs
              className='text-center'
              items={[
                'We stayed up there for a while, in no hurry to climb back down.',
              ]}
            />
          </Reveal>
        </div>

        {/* WHY WE PAID EXTRA FOR THE FERRY -- new this build, and one of
            the important pieces of the story that was missing entirely.
            Bare ChapterHeading (same weight as Vernazza's and "A detail
            I loved"'s), copy close to verbatim what was given: personal,
            not generic travel advice -- reading beforehand that the
            villages are best seen from the water, choosing to pay extra
            for the ferry despite already having train passes, and being
            glad afterward. The ferry cost (€64) is not restated here as
            a number -- it appears once, in the transport card at the end
            of the day's story, so it reads as a choice first and a line
            item second. */}
        <div className='max-w-2xl mx-auto text-center'>
          <Reveal delay={0.1} className='mt-14 md:mt-16 max-w-xl mx-auto'>
            <ChapterHeading italic>
              Why take the ferry when we already had train passes?
            </ChapterHeading>
            <Paragraphs
              className='mt-5 text-center'
              items={[
                "Because I'd read that some of the best views of Cinque Terre are from the sea. So even though our train passes already covered the day, we paid extra for the ferry. And I'm glad we did — watching the villages appear along the cliffs from the water was a completely different experience.",
              ]}
            />
          </Reveal>
        </div>

        {/* Cinque_Terre_sea_video_web.mp4 -- repurposed this build from a
            generic "opening atmosphere" clip into the specific visual
            answer to the heading just above: this is Cinque Terre from
            the sea. Sized deliberately larger/more prominent than any
            video used previously on this page (max-w-[300px]
            sm:max-w-[400px] md:max-w-[520px], vs. the old sea-video
            opener's 260/sm/md) so it reads as a genuine visual moment,
            not a decorative element -- the brief's own words. Aspect
            ratio (9/16) is the source footage's real, unaltered shape (a
            vertical phone clip, 640x1138 compressed from the original
            2160x3840) -- "wide" is read here as prominent/large on the
            page rather than literally landscape, since cropping or
            faking a widescreen frame from vertical footage would distort
            or lose real content, which nothing in the brief asked for.
            Same video attributes as every other clip on this page
            (autoPlay/muted/loop/playsInline/preload='auto'/aria-hidden).
            The second Vernazza video from the previous build
            (Cinque_Terre_view_video_web.mp4) is dropped entirely this
            build -- it has no narrative reason to be here now that the
            page tells a specific route story, and the brief's own
            image/video priority list for this section does not include
            it. */}
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
        </Reveal>

        {/* PORTO VENERE -- new this build. Bare ChapterHeading, matching
            Vernazza's and the ferry beat's weight. Careful, specifically
            requested wording: this states only that *I* had read Porto
            Venere described as a quieter alternative to Portofino, never
            that it factually is one -- that distinction is deliberate
            and must not be flattened in any future edit. This is also
            why the ferry route went to Porto Venere rather than straight
            back to La Spezia, tying the paragraph back to the ferry
            story just above it. */}
        <div className='max-w-2xl mx-auto text-center'>
          <Reveal delay={0.1} className='mt-14 md:mt-16 max-w-xl mx-auto'>
            <ChapterHeading italic>Porto Venere</ChapterHeading>
            <Paragraphs
              className='mt-5 text-center'
              items={[
                "Before the trip, I'd read comments describing Porto Venere as a quieter alternative to Portofino — some travellers even said they preferred it. That was part of what made me curious to see it for myself, and it's why our ferry route home went by way of Porto Venere instead of straight back to La Spezia.",
              ]}
            />
          </Reveal>
        </div>

        {/* Porto_Venere_web.jpeg -- new this build. Given real space
            (w-[88%] md:w-[620px], close to the Vernazza hero's own
            scale) per the explicit "give this image enough space"
            instruction, though kept a notch below Vernazza's 680px so
            the page's one clear emotional peak stays Vernazza. Source
            was already right-side-up (orientation tag 1, no rotation
            needed), 5712x4284 native -> aspect-[4/3], the photo taken
            from the water approaching Porto Venere by ferry. */}
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

        {/* BUS BACK TO LA SPEZIA + TRANSPORT RECAP -- closes the loop in
            one short line (new this build -- the previous version
            omitted the bus entirely), then the same elegant cost card as
            before, moved here from earlier in the section so it reads
            as a recap of the whole day's transport (train + ferry) once
            the full story has been told, rather than a price box dropped
            in before the reader knows why the ferry cost anything extra.
            Values corrected to match exactly what was given: Train
            Passes · Family of Four — €56.50, Ferry — €64, Total
            €120.50. Disclaimer line unchanged. */}
        <div className='max-w-2xl mx-auto text-center'>
          <Reveal delay={0.1} className='mt-10 md:mt-12 max-w-xl mx-auto'>
            <Paragraphs
              className='text-center'
              items={[
                'From Porto Venere, a bus brought us back to La Spezia — completing the loop: train, ferry and bus, all in a single day.',
              ]}
            />
          </Reveal>

          <Reveal delay={0.1} className='mt-9 md:mt-11 mx-auto max-w-[460px] rounded-[3px] bg-[#f1ebdc] dark:bg-white/[0.04] px-8 py-8 md:px-9 md:py-9 flex flex-col items-center gap-1 text-center'>
            <span className='text-xs uppercase tracking-[0.18em] font-[family-name:var(--font-poppins)] font-semibold text-black/45 dark:text-white/45'>
              Cinque Terre Transport
            </span>
            <span className='mt-4 text-sm font-[family-name:var(--font-poppins)] text-black/60 dark:text-white/60'>
              Train Passes · Family of Four — €56.50
            </span>
            <span className='text-sm font-[family-name:var(--font-poppins)] text-black/60 dark:text-white/60'>
              Ferry — €64
            </span>
            <div className='mt-4'>
              <TimeStamp size='md'>€120.50</TimeStamp>
            </div>
            <span className='text-xs uppercase tracking-[0.18em] font-[family-name:var(--font-poppins)] font-semibold text-black/45 dark:text-white/45'>
              Total · Family of Four
            </span>
          </Reveal>

          <Reveal delay={0.15} className='mt-5 md:mt-6 mx-auto max-w-[460px] text-center'>
            <p className='text-sm font-[family-name:var(--font-poppins)] font-light text-black/50 dark:text-white/50'>
              What we paid in April 2026 — not current official prices.
            </p>
          </Reveal>
        </div>

        {/* A DETAIL I LOVED -- unchanged from the previous build: bare
            ChapterHeading, the tracked-trolley paragraph, the trolley
            photo sized close beneath it (mt-6 md:mt-8, not the usual
            text->photo token) so text and image read as one connected
            moment, same caption ("Deliveries, Cinque Terre style.").
            This is now also the section's true closing beat -- the
            previous build's trailing Cinque_Terre_sea_web.jpeg after
            this image is removed entirely, since it has no narrative
            reason to be here and the brief is explicit that nothing
            should follow this image just because a file was available. */}
        <div className='max-w-2xl mx-auto text-center'>
          <Reveal delay={0.1} className='mt-14 md:mt-16 max-w-xl mx-auto'>
            <ChapterHeading italic>A detail I loved</ChapterHeading>
            <Paragraphs
              className='mt-5 text-center'
              items={[
                "One thing that really caught my attention was how goods actually move through Cinque Terre. The stairways are too steep and narrow for any van, so small tracked trolleys run straight up and down them instead, hauling crates and supplies between houses. It's a tiny detail, but it says a lot about what everyday life here actually looks like.",
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
      </section>
    </div>
  );
}
