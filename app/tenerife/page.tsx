'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import JourneyMapScene from '@/components/journey/JourneyMapScene';
import { RouteLabel, TimeStamp } from '@/components/journey/annotation-kit';
import BookedChecklist from '@/components/ui/booked-checklist';
import {
  TENERIFE_HOME_TO_VIENNA_JOURNEY,
  TENERIFE_VIENNA_TO_TENERIFE_JOURNEY,
  TENERIFE_TRANSFER_JOURNEY,
  TENERIFE_ROCA_TO_DUQUE_JOURNEY,
  TENERIFE_ROCA_TO_SIAM_JOURNEY,
  TENERIFE_ROCA_TO_TERESITAS_JOURNEY,
  TENERIFE_ROCA_TO_LOS_GIGANTES_JOURNEY,
  TENERIFE_ROCA_TO_TEIDE_JOURNEY,
  TENERIFE_ROCA_TO_LORO_PARQUE_JOURNEY,
  TENERIFE_ROCA_TO_TENERIFE_SOUTH_JOURNEY,
} from '@/lib/journeys/tenerife';

const LOGO_SRC = '/metkish-logo.png';

// Same fade-up-on-scroll rhythm used throughout the site (About page, My
// Travels gallery, Behind the Trip): once-only, generous viewport
// threshold, no bounce.
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

// A small in-chapter marker — one notch below RouteLabel: no pink tick,
// used for a beat *within* a chapter (e.g. "A first with Ryanair", "Would
// I pre-book it again?") rather than for the chapter opener itself. Chapter
// openers (Slovenia → Vienna, The Flight, Arrival, Getting to the Hotel,
// Tenerife South, Tenerife South → Roca Nivaria) all use RouteLabel
// instead, so every chapter in this opening journey announces itself with
// the exact same visual language.
function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <span className='block text-sm md:text-[0.95rem] uppercase tracking-[0.18em] font-[family-name:var(--font-poppins)] font-semibold text-black/60 dark:text-white/60'>
      {children}
    </span>
  );
}

// LEVEL 2 — the one main-editorial-heading scale used throughout this
// opening journey (Why Vienna? / What I hadn't thought about / The airport
// wasn't asleep. / The transfer we probably didn't need.), so none of them
// reads as more or less important than another. "Just before 04:00" and
// "Just before 03:00" sit at this same visual scale too, via TimeStamp
// size='md' below — same font, same size, same weight, just its own
// component since a moment's timestamp and a narrative heading are
// different kinds of content.
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

// LEVEL 4 — the one fact treatment used throughout: a small uppercase
// label, a large serif value at the same scale as the journey's moment
// timestamps (TimeStamp size='md'), and optional small supporting lines
// underneath. Used for parking, the flight fare, and the three flight
// facts alike — none of them "the headline", all of them read as facts at
// a glance.
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

// Chapter-to-chapter transition spacing — ONE token, used verbatim on
// every section boundary between a story ending and the next chapter's
// pink rule + label, so every chapter transition (Flight → Arrival,
// Arrival → Getting to the Hotel) is pixel-identical rather than eyeballed
// separately. CHAPTER_GAP_END goes on the bottom of the section that's
// ending; CHAPTER_GAP_START goes on the top of the section that opens
// with the next RouteLabel.
const CHAPTER_GAP_END = 'pb-12 md:pb-14';
const CHAPTER_GAP_START = 'pt-12 md:pt-14';

// The pause after a cream Journey Map before the white content section's
// pink rule + label — a second, separate transition token from the
// chapter-to-chapter one above (a map ending reads differently than a
// story ending). Used verbatim on every map→content boundary (Home→Vienna
// map → Slovenia → Vienna, Vienna→Tenerife map → The Flight, and the
// transfer map → Tenerife South → Roca Nivaria) so all three feel like
// the same visual pause rather than three separately-eyeballed gaps. The
// value itself is the transfer map's own established pt-8/md:pt-10 — the
// one transition that already felt balanced — carried over to the other
// two rather than picked fresh.
const MAP_TRANSITION_PT = 'pt-8 md:pt-10';

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

export default function TenerifePage() {
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
      {/* No pale circular badge behind this logo — just the mark itself,
          unobtrusive once scrolled past the hero. The hero's own visual
          state (pastHero === false: full size, opacity-100, no background)
          is unchanged; only the post-hero (pastHero === true) treatment
          drops the circular container it used to sit inside. */}
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

      {/* 1. HERO — the real photograph, chosen deliberately for how much
          open sky it holds; that negative space is part of the
          composition, so the crop below only ever trims width (never the
          sky) and re-anchors per breakpoint rather than defaulting to a
          blind centered crop.
          Mobile QA fix, sitewide: this photo and nine others on this page
          (Ryanair, Hotel, Rent_a car, Playa del Duque, Siam park_trash, Las
          teresitas, Sailboat, Los Gigantes, El Teide_calima — every "_web"
          src added in this pass) were reported broken on a real mobile
          device (a broken-image icon in place of the photo) even though
          they rendered fine in dev/desktop testing. All ten turned out to
          be MPO (Multi Picture Object) files despite their .jpg/.jpeg
          extension — the multi-frame container some phone cameras write —
          which Next's image optimizer handled inconsistently, working
          almost everywhere except, apparently, some real mobile
          pipelines/devices. Same root cause as the EXIF-orientation
          slowness already fixed this way for El Taide_peak, El
          Teide_landscape, the Loro Parque gorilla and Palm_tree; those four
          just happened to also carry a rotation tag that made the problem
          visible earlier. Re-saved via the same pipeline every time:
          PIL.ImageOps.exif_transpose() to bake in the correct upright
          rotation, converted to a plain single-frame RGB JPEG (no MPO
          container), EXIF stripped. Same photo, identical crop/content/
          composition — no retouch, no re-crop — just a format every device
          can reliably decode. */}
      <section className='relative h-[100svh] md:h-[100dvh] w-full overflow-hidden'>
        <Image
          src='/2026-07%20-%20Tenerife/Tenerife_hero_web.jpeg'
          alt='The volcanic highlands of Teide National Park, Tenerife, under a wide open sky.'
          fill
          priority
          sizes='100vw'
          className='object-cover object-[30%_40%] md:object-[48%_30%]'
        />
        <div className='absolute inset-0 bg-black/10' />
        <div className='relative z-10 h-full flex flex-col items-center justify-center text-center px-6'>
          <Reveal>
            <h1 className='text-5xl sm:text-6xl md:text-7xl font-[family-name:var(--font-playfair)] font-medium tracking-tight text-white'>
              Tenerife
            </h1>
            <p className='mt-5 text-xs sm:text-sm uppercase tracking-[0.22em] font-[family-name:var(--font-poppins)] font-semibold text-white/80'>
              Spain · Canary Islands · July 2026
            </p>
            <p className='mt-9 max-w-md mx-auto text-lg md:text-xl italic font-[family-name:var(--font-playfair)] text-white/90'>
              An island we could easily come back to.
            </p>
          </Reveal>
        </div>
      </section>

      {/* 2. MAP — Home -> Vienna Airport only. A short, self-running
          animation (see JourneyMapScene) rather than a scroll-controlled
          one: starts automatically once meaningfully in view and plays
          once, no scroll distance tied to it. Sits directly against the
          hero's bottom edge with zero gap — no transition wrapper of any
          kind between them, deliberately: any div here, even a thin one,
          paints its own background colour first and reads as a visible
          seam. This map now represents only the drive to Vienna Airport;
          the flight is a separate map further down. */}
      <JourneyMapScene
        journey={TENERIFE_HOME_TO_VIENNA_JOURNEY}
        heightClassName='h-[380px] sm:h-[440px] md:h-[500px]'
      />

      {/* 3. VIENNA CONTENT — why we flew from Vienna, then the Car Park 3
          booking. One calm, centred editorial composition, brought up to
          the same typographic confidence as the final hotel-arrival
          section: a real Level 2 heading for "Why Vienna?" (not a small
          label), and the parking price given real Level 4 fact weight
          instead of a small aside. No cards, no left/right columns. The
          Ryanair fare, luggage and the Seychelles price comparison live in
          the flight section below instead — they're about the flight, not
          about Vienna itself. Same warm off-white as every other story
          surface on this page; only the maps switch to cream.
          Spacing is deliberately three-tier: a large gap between the two
          chapter beats (why Vienna / parking), a medium gap between each
          beat's heading and its own text, and a small gap holding each
          fact's label/value/support together. */}
      <section className={`px-6 md:px-12 ${MAP_TRANSITION_PT} pb-16 md:pb-24 bg-[#faf9f6] dark:bg-black`}>
        <div className='max-w-2xl mx-auto text-center'>
          <Reveal>
            <RouteLabel>Slovenia → Vienna</RouteLabel>
          </Reveal>

          <Reveal className='mt-8 md:mt-10 max-w-xl mx-auto'>
            <ChapterHeading italic>Why Vienna?</ChapterHeading>
            <Paragraphs
              className='mt-5 text-center'
              items={[
                'Close enough to drive, large enough to give us plenty of choice. And this time, the deciding factor: a direct flight to Tenerife.',
              ]}
            />
          </Reveal>

          {/* Same quiet practical-information panel language as the
              flight section's fare panel below (same background tone,
              corner radius, no border/shadow, same uppercase label
              styling) — just smaller and more compact, since this one
              holds a single fact instead of three. The booking
              explanation stays outside the panel as personal/editorial
              text, exactly like the Seychelles aside sits outside the
              flight panel. */}
          <Reveal className='mt-9 md:mt-11 mx-auto max-w-[380px] rounded-[3px] bg-[#f1ebdc] dark:bg-white/[0.04] px-7 py-7 md:px-8 md:py-8'>
            <Fact
              label='Vienna Airport · Car Park 3'
              value='€187.68'
              support={['1 Jul, 18:00 → 10 Jul, 22:00']}
            />
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

      {/* 4. MAP — Vienna Airport -> Tenerife South Airport (the flight),
          continuing straight into the same map's zoom onto the island
          after landing. Same map system/animation/verified route as
          before; only its own separate map instance and its place in the
          page have changed. Sized taller than the Home->Vienna map above
          since it carries the wide Europe/Atlantic leg. */}
      <JourneyMapScene
        journey={TENERIFE_VIENNA_TO_TENERIFE_JOURNEY}
        heightClassName='h-[420px] sm:h-[480px] md:h-[580px]'
      />

      {/* 5. FLIGHT CONTENT — the Ryanair fare, the price perspective, the
          flight facts, and the non-reclining-seat story, all together
          since they're all about the flight itself. Same centred,
          card-free editorial composition, and the same three-tier spacing
          logic as the Vienna section above: large gaps between beats,
          small gaps holding each beat's own label/value/support together.
          "A little perspective" is deliberately NOT its own top-level
          beat — it sits inside the fare group, close beneath €1,927.84,
          as a quiet annotation to that price rather than a floating
          section of its own. */}
      <section className={`px-6 md:px-12 ${MAP_TRANSITION_PT} ${CHAPTER_GAP_END} bg-[#faf9f6] dark:bg-black`}>
        <div className='max-w-2xl mx-auto text-center'>
          {/* Chapter opener — bare RouteLabel plus a proper editorial
              heading right underneath, exactly the same Level 2 scale as
              "Just before 03:00", "What I hadn't thought about" and every
              other major moment on the page. This is the fix for the old
              "booking summary" feel: the flight now opens like a travel
              journal entry, not a confirmation screen. */}
          <Reveal>
            <RouteLabel>The Flight</RouteLabel>
            <ChapterHeading italic className='mt-5'>
              Vienna to Tenerife
            </ChapterHeading>
          </Reveal>

          {/* Group A — a quiet "practical information" insert, not a
              booking widget: a single panel, lifted off the page only by a
              muted warm background (no border, no shadow, no card
              chrome), holding just the booking facts. €1,927.84 stays the
              strongest thing in it — same TimeStamp scale used for every
              other fact on the page. */}
          <Reveal className='mt-8 md:mt-10 mx-auto max-w-[520px] rounded-[3px] bg-[#f1ebdc] dark:bg-white/[0.04] px-8 py-9 md:px-10 md:py-10 flex flex-col items-center gap-1 text-center'>
            <span className='text-xs uppercase tracking-[0.18em] font-[family-name:var(--font-poppins)] font-semibold text-black/45 dark:text-white/45'>
              Ryanair · direct
            </span>
            <span className='text-sm font-[family-name:var(--font-poppins)] text-black/60 dark:text-white/60'>
              1 Jul → 10 Jul 2026
            </span>
            <span className='mt-4 text-xs uppercase tracking-[0.18em] font-[family-name:var(--font-poppins)] font-semibold text-black/45 dark:text-white/45'>
              Flights for four
            </span>
            <TimeStamp size='md'>€1,927.84</TimeStamp>
            <span className='mt-4 text-xs uppercase tracking-[0.18em] font-[family-name:var(--font-poppins)] font-semibold text-black/45 dark:text-white/45'>
              Checked luggage
            </span>
            <span className='text-sm font-[family-name:var(--font-poppins)] text-black/60 dark:text-white/60'>
              2 × 10 kg · 2 × 20 kg
            </span>
          </Reveal>

          {/* The Seychelles comparison sits outside the panel, quietly
              underneath it — personal perspective, not booking
              information, so it's deliberately not inside the panel's own
              background and carries no heading of its own. */}
          <Reveal className='mt-6 md:mt-7 max-w-xs mx-auto'>
            <p className='text-sm italic font-[family-name:var(--font-playfair)] text-black/60 dark:text-white/60 leading-snug'>
              Almost ten years earlier, a similar amount took us all the
              way to the Seychelles with Qatar Airways.
            </p>
          </Reveal>

          {/* Group B — the flight facts elaborate the flight information
              above rather than starting a new idea, so this gap stays
              moderate: connected to Group A, not a full chapter-level
              break. Three equal facts, same size, same label treatment —
              none of them is "the headline". */}
          <Reveal className='mt-10 md:mt-12 flex flex-wrap items-start justify-center gap-x-12 gap-y-8'>
            <Fact label='Scheduled departure' value='20:55' />
            <Fact label='Delay' value='1 h 25 min' />
            <Fact label='In the air' value='5 h 20 min' />
          </Reveal>

          {/* Group C — a first with Ryanair: this is where a genuinely new
              editorial idea begins, so the gap is deliberately the
              largest in this section. Deliberately not a card, set in the
              same centred composition as the rest of this section and the
              same Level 2 heading scale as "Why Vienna?" and "The airport
              wasn't asleep." above and below it. */}
          <Reveal className='mt-16 md:mt-[76px] max-w-xl mx-auto'>
            <Eyebrow>A first with Ryanair</Eyebrow>
            <ChapterHeading italic className='mt-3'>
              What I hadn&apos;t thought about
            </ChapterHeading>
            <Paragraphs
              className='mt-5 text-center'
              items={[
                "This was our first time flying Ryanair, and there was one thing I hadn't thought about: the seats don't recline.",
                "On a daytime flight, I wouldn't care. On a 5 h 20 min overnight flight when all you want to do is sleep, it matters.",
              ]}
            />
            {/* Only the reflective opening line is italic, as a small
                editorial beat — the reasoning that follows it reads as
                normal body copy, not as one long italic aside. */}
            <p className='mt-6 text-base md:text-lg font-[family-name:var(--font-poppins)] font-light text-black/80 dark:text-white/80 leading-relaxed text-center'>
              <span className='italic'>
                Would I choose Ryanair again? Yes.
              </span>{' '}
              But for another long overnight flight, I&apos;d definitely
              think about those seats.
            </p>
          </Reveal>
        </div>

        {/* An editorial transition between the personal Ryanair story
            above and arriving in Tenerife below — the wing, the Ryanair
            winglet and the island coming into view, wide and quiet, the
            same visual width as the hotel photograph further down the
            page. Portrait source, deliberately cropped to a wide
            landscape frame via object-position rather than any
            destructive edit to the original file. A section-level
            sibling of the max-w-2xl content column above (not nested
            inside it), the same structural pattern the hotel photo below
            uses, so it can actually reach its own, wider max-width. On
            desktop it's deliberately narrower than that shared max-width
            (max-w-3xl instead of max-w-5xl, ~75% of the hotel photo's
            width) so it reads as a secondary editorial beat rather than
            competing with the destination/hotel photography; on mobile it
            stays at the wider cap, since the screen is already narrower
            than either value. Placed last in this section — after the
            Ryanair story, before Arrival — so it works as a visual
            transition (Tenerife is already visible through the window)
            between the flight and arriving; the section's own existing
            bottom padding (CHAPTER_GAP_END) plus Arrival's own top
            padding (CHAPTER_GAP_START) give the gap after it the same
            chapter-to-chapter rhythm used everywhere else on the page,
            unchanged. */}
        <Reveal className='mt-14 md:mt-16 max-w-5xl md:max-w-3xl mx-auto'>
          <div className='relative w-full overflow-hidden rounded-[2px] aspect-[4/3] md:aspect-[16/9]'>
            <Image
              src='/2026-07%20-%20Tenerife/Ryanair_web.jpeg'
              alt='Looking out over the Ryanair wing, winglet branding visible, with Mount Teide and the Tenerife coastline in the distance.'
              fill
              sizes='(min-width: 1024px) 1024px, 100vw'
              className='object-cover object-[50%_28%] md:object-[50%_34%]'
            />
          </div>
        </Reveal>
      </section>

      {/* ARRIVAL — a clear new chapter, not just another heading tacked
          onto the flight section: a full chapter-level reset (RouteLabel,
          CHAPTER_GAP_START above it) before the chapter's own content. One
          coherent chapter now, not two stacked introductions for the same
          moment: RouteLabel ("Arrival") → the large landing moment ("Just
          before 03:00", the same TimeStamp scale as "Just before 04:00"
          at the hotel, so the two deliberately echo each other) → small
          contextual metadata (place + timezone, folding in what used to
          be a separate "One hour back" beat) → after only a moderate
          internal gap, the story heading ("The airport wasn't asleep.",
          same Level 2 scale as "Why Vienna?" and "The transfer we
          probably didn't need.") and its paragraphs. Both top and bottom
          use the same CHAPTER_GAP_* token as every other chapter boundary
          on the page, so the transition into this chapter and the
          transition out of it (into Getting to the Hotel) are identical.
          Same warm off-white as the section above and the transfer story
          below — no new background colour, just a clean structural
          break. */}
      <section
        className={`px-6 md:px-12 ${CHAPTER_GAP_START} ${CHAPTER_GAP_END} bg-[#faf9f6] dark:bg-black`}
      >
        <Reveal className='max-w-2xl mx-auto text-center'>
          <RouteLabel>Arrival</RouteLabel>
          <div className='mt-5'>
            <TimeStamp size='md'>Just before 03:00</TimeStamp>
          </div>
          <p className='mt-2 text-xs uppercase tracking-[0.18em] font-[family-name:var(--font-poppins)] font-semibold text-black/45 dark:text-white/45'>
            Tenerife South · local time · one hour behind Slovenia
          </p>
          <ChapterHeading italic className='mt-10 md:mt-12'>
            The airport wasn&apos;t asleep.
          </ChapterHeading>
          <Paragraphs
            className='mt-8 text-center'
            items={[
              'The airport was still surprisingly active — rental-car desks were open and taxis were waiting outside.',
              "We could have picked up our car then. We chose not to. After an overnight flight, navigating unfamiliar roads and finding the hotel was one stress we simply didn't need.",
              'The car could wait. Hotel first.',
            ]}
          />
        </Reveal>
      </section>

      {/* 9–11. Getting to the hotel — no background change from Arrival
          above: this is a continuation of the same moment, not a new
          background, but it is its own clear chapter, opened with the same
          RouteLabel + ChapterHeading pairing as every other chapter in
          this journey. The procedural explanation of how the pickup
          actually worked has been shortened to three short paragraphs so
          it doesn't outweigh the screenshot next to it; the price
          comparison now uses the same fact scale (TimeStamp's md size) as
          every other fact on the page. "Not there." keeps its existing,
          already-approved oversized treatment — it's the one deliberate
          exception to the Level 2 heading scale, the emotional peak of
          this chapter. */}
      <section
        className={`px-6 md:px-12 ${CHAPTER_GAP_START} pb-16 md:pb-20 bg-[#faf9f6] dark:bg-black`}
      >
        <Reveal className='max-w-2xl mx-auto text-center'>
          <RouteLabel>Getting to the Hotel</RouteLabel>
          <ChapterHeading className='mt-5'>
            The transfer we probably didn&apos;t need.
          </ChapterHeading>
          <Paragraphs
            className='mt-8 text-center'
            items={[
              'A bad experience on a previous trip made me want certainty this time. So I pre-booked our transfer through Booking.com.',
            ]}
          />
        </Reveal>

        <Reveal delay={0.1} className='mt-12 md:mt-14 max-w-md mx-auto'>
          <div className='relative w-full overflow-hidden rounded-[2px] border border-black/10 dark:border-white/15 shadow-[0_2px_20px_rgba(0,0,0,0.08)]'>
            <Image
              src='/2026-07%20-%20Tenerife/Transfer_booking_screenshot.jpeg'
              alt='Booking.com confirmation for the pre-booked transfer from Tenerife South Airport to Roca Nivaria Gran Hotel.'
              width={770}
              height={591}
              className='w-full h-auto'
            />
          </div>
        </Reveal>

        <Reveal delay={0.15} className='mt-10 md:mt-12 max-w-2xl mx-auto'>
          <Paragraphs
            className='text-center'
            items={[
              'The meeting-point instructions came too late to be useful. By then, we were already on our way. So we went straight to the taxis and only then discovered that we had to go back inside first.',
              'It worked. At almost 3 AM, it just felt unnecessarily complicated.',
            ]}
          />
        </Reveal>

        <Reveal
          delay={0.1}
          className='mt-14 md:mt-16 flex flex-col sm:flex-row items-center justify-center gap-10 sm:gap-16 text-center'
        >
          <div className='flex flex-col items-center gap-2'>
            <span className='text-xs uppercase tracking-[0.18em] font-[family-name:var(--font-poppins)] font-semibold text-black/45 dark:text-white/45'>
              Pre-booked transfer
            </span>
            <p className='text-3xl md:text-4xl font-[family-name:var(--font-playfair)] italic font-medium text-black dark:text-white'>
              €65.30
            </p>
          </div>
          <span className='hidden sm:block h-10 w-px bg-black/10 dark:bg-white/15' />
          <div className='flex flex-col items-center gap-2'>
            <span className='text-xs uppercase tracking-[0.18em] font-[family-name:var(--font-poppins)] font-semibold text-black/45 dark:text-white/45'>
              Taxi at the airport
            </span>
            <p className='text-3xl md:text-4xl font-[family-name:var(--font-playfair)] italic font-medium text-black/70 dark:text-white/70'>
              around €40
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.1} className='mt-16 md:mt-20 max-w-xl mx-auto text-center'>
          <Eyebrow>Would I pre-book it again?</Eyebrow>
          <p className='mt-4 text-5xl md:text-6xl font-[family-name:var(--font-playfair)] italic font-medium text-black dark:text-white'>
            Not there.
          </p>
          <Paragraphs
            className='mt-8 text-center'
            items={[
              'There were plenty of taxis waiting outside, and they were cheaper. Somewhere else, especially after a late arrival? Possibly. Sometimes peace of mind is worth paying for.',
            ]}
          />
        </Reveal>
      </section>

      {/* 12. Final journey animation — Tenerife South -> Roca Nivaria. A
          short local hop, so it gets the most compact frame of the three
          map states — just enough height to read the route clearly, no
          more. Same short autoplay treatment as the map above; the route
          label and arrival timestamp that used to be timed overlay cards
          on top of it now sit as simple in-flow content just underneath. */}
      <JourneyMapScene
        journey={TENERIFE_TRANSFER_JOURNEY}
        heightClassName='h-[340px] sm:h-[380px] md:h-[440px]'
      />

      <section className={`px-6 md:px-12 ${MAP_TRANSITION_PT} pb-14 md:pb-16 bg-[#faf9f6] dark:bg-black`}>
        <Reveal className='max-w-2xl mx-auto flex flex-col items-center gap-6'>
          <RouteLabel>Tenerife South → Roca Nivaria · Playa Paraíso</RouteLabel>
          <div className='flex flex-col items-center gap-3 text-center'>
            <TimeStamp size='md'>Just before 04:00</TimeStamp>
            <p className='text-base sm:text-lg font-[family-name:var(--font-poppins)] font-light text-black/70 dark:text-white/70'>
              Finally, our hotel.
            </p>
          </div>
        </Reveal>

        {/* 13. The night hotel photo — the cinematic, quiet close of the
            whole home-to-hotel journey. Generous and wide, minimal text
            over it, on purpose: the story has already been told, this is
            just where it lands. The daytime Roca Nivaria photo belongs to
            a later section, not here.
            Mobile QA fix: the original file was broken on real phones (a
            broken-image icon in place of the photo, reported directly from
            a mobile device) even though it rendered fine here in dev/desktop
            testing. The original wasn't a plain JPEG despite its .jpeg
            extension — it was an MPO (Multi Picture Object) container, the
            multi-frame format some phone cameras write for portrait/depth
            shots, plus the same EXIF orientation-6 tag that made Next's
            on-demand image transcode pathologically slow/fragile for other
            photos on this page (El Taide_peak, El Teide_landscape, the Loro
            Parque gorilla, Palm_tree) — all already fixed the same way. This
            one hadn't been given that treatment yet because it happened to
            still render in every environment tested at the time; the real
            mobile device is what finally surfaced it. Re-saved via the same
            established pipeline: PIL.ImageOps.exif_transpose() to bake the
            correct upright rotation into the actual pixels, converted to a
            plain single-frame RGB JPEG (no more MPO container), EXIF
            stripped. Same photo, identical crop/content/composition — no
            retouch — just a format Next's image optimizer (and mobile
            browsers) can reliably handle. */}
        <Reveal delay={0.1} className='mt-12 md:mt-16 max-w-5xl mx-auto'>
          <div className='relative w-full overflow-hidden rounded-[2px] aspect-[3/2] md:aspect-[16/9]'>
            <Image
              src='/2026-07%20-%20Tenerife/Hotel%20at%20night_web.jpeg'
              alt='Roca Nivaria at night — the illuminated pool, palm trees and hotel grounds in Playa Paraiso.'
              fill
              sizes='(min-width: 768px) 1024px, 100vw'
              className='object-cover'
            />
          </div>
          <p className='mt-3 text-center text-xs uppercase tracking-[0.18em] font-[family-name:var(--font-poppins)] font-semibold text-black/40 dark:text-white/40'>
            Roca Nivaria · Playa Paraíso
          </p>
        </Reveal>
      </section>

      {/* 14. THE HOTEL — the first chapter after the approved home-to-hotel
          opening. This is a photo → new chapter transition (the night
          photo above closes the previous chapter), so it reuses that
          established rhythm without touching the locked section above:
          CHAPTER_GAP_START here, combined with the previous section's own
          unchanged pb-14/md:pb-16, lands within a few pixels of the same
          ~121px desktop chapter-gap reference used for Ryanair photo →
          Arrival. Internally the beats are deliberately paced but not
          stretched: intro + rating (connected, tight) → practical panel
          (new visual beat) → daytime photo (largest gap, the chapter's
          main image) → short impression (connected to the photo) → beach
          video (a new "moving photograph" beat) → the final, deliberately
          unresolved location thought. No verdict on the location closes
          this chapter — that comes later, on the Last Day. */}
      <section className={`px-6 md:px-12 ${CHAPTER_GAP_START} pb-16 md:pb-20 bg-[#faf9f6] dark:bg-black`}>
        <Reveal className='max-w-2xl mx-auto text-center'>
          <RouteLabel>The Hotel</RouteLabel>
          <ChapterHeading italic className='mt-8 md:mt-10'>
            Why this one?
          </ChapterHeading>
          <Paragraphs
            className='mt-5 text-center'
            items={[
              'Great reviews, a family suite and a price that made sense compared with the alternatives.',
            ]}
          />
          {/* A restrained editorial mention of the review score — deliberately
              not a Booking.com-style widget: no logo, no star icons, no
              badge background, just a single quiet line at the same weight
              as the page's other small supporting text. */}
          <p className='mt-5 text-sm md:text-base tracking-[0.06em] font-[family-name:var(--font-poppins)] text-black/55 dark:text-white/55'>
            9.1 · 1,656 reviews · 5 stars
          </p>
        </Reveal>

        {/* Same quiet practical-information panel language as the flight
            and Vienna panels above (same background tone, corner radius,
            no border/shadow, same uppercase label styling) — the price
            stays the dominant value, same TimeStamp scale as every other
            fact on the page. */}
        <Reveal className='mt-9 md:mt-11 mx-auto max-w-[460px] rounded-[3px] bg-[#f1ebdc] dark:bg-white/[0.04] px-8 py-8 md:px-9 md:py-9 flex flex-col items-center gap-1 text-center'>
          <span className='text-xs uppercase tracking-[0.18em] font-[family-name:var(--font-poppins)] font-semibold text-black/45 dark:text-white/45'>
            Roca Nivaria · 9 Nights
          </span>
          <TimeStamp size='md'>€3,461.67</TimeStamp>
          <span className='mt-4 text-sm font-[family-name:var(--font-poppins)] text-black/60 dark:text-white/60'>
            1 Jul → 10 Jul 2026
          </span>
          <span className='mt-4 text-xs uppercase tracking-[0.18em] font-[family-name:var(--font-poppins)] font-semibold text-black/45 dark:text-white/45'>
            Family Suite · 2 adults + 2 children
          </span>
          <span className='text-sm font-[family-name:var(--font-poppins)] text-black/60 dark:text-white/60'>
            Breakfast included
          </span>
        </Reveal>

        {/* The daytime hotel photo — same width/treatment logic as the
            night photo above (section-level sibling, generous max-width,
            subtle crop on desktop only), so the two read as a matched
            pair rather than two differently-sized images. */}
        <Reveal delay={0.1} className='mt-12 md:mt-16 max-w-5xl mx-auto'>
          <div className='relative w-full overflow-hidden rounded-[2px] aspect-[4/3] md:aspect-[16/9]'>
            <Image
              src='/2026-07%20-%20Tenerife/Hotel_web.jpeg'
              alt='Roca Nivaria in daylight — the hotel exterior and grounds at Playa Paraiso.'
              fill
              sizes='(min-width: 768px) 1024px, 100vw'
              className='object-cover'
            />
          </div>
          <p className='mt-3 text-center text-xs uppercase tracking-[0.18em] font-[family-name:var(--font-poppins)] font-semibold text-black/40 dark:text-white/40'>
            Roca Nivaria · Playa Paraíso
          </p>
        </Reveal>

        {/* A short impression, connected to the photo above rather than a
            new chapter — same Eyebrow + ChapterHeading pairing as "A first
            with Ryanair", deliberately kept to a single short sentence. */}
        <Reveal delay={0.1} className='mt-10 md:mt-12 max-w-xl mx-auto text-center'>
          <Eyebrow>The Hotel Itself</Eyebrow>
          <ChapterHeading italic className='mt-3'>
            Overall, a very good hotel.
          </ChapterHeading>
          <Paragraphs
            className='mt-5 text-center'
            items={[
              'Beautifully maintained, with great pools, plenty for the kids and everything we needed for a comfortable stay.',
            ]}
          />
        </Reveal>

        {/* The hotel-beach clip as an editorial "moving photograph": no
            controls, no sound, no frame — just a quiet, looping insert the
            same way a photograph would sit here. The source clip is a
            vertical phone recording (9:16), unlike every other photo on
            this page, so it's contained by width rather than stretched to
            the page's usual wide photo treatment; the aspect-ratio wrapper
            reserves its exact space up front so nothing shifts once it
            loads. */}
        <Reveal delay={0.1} className='mt-12 md:mt-14 max-w-[240px] sm:max-w-xs md:max-w-md mx-auto'>
          <div className='relative w-full overflow-hidden rounded-[2px] aspect-[9/16]'>
            <video
              src='/2026-07%20-%20Tenerife/Hotel_beach.mp4'
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

        {/* The location thought — deliberately left unresolved. No verdict
            here on purpose; that comes later, told chronologically on the
            Last Day. Slightly more breathing room above this heading than
            the section's other internal gaps, so the video clearly closes
            before this final thought opens. */}
        <Reveal delay={0.1} className='mt-[78px] md:mt-[86px] max-w-xl mx-auto text-center'>
          <ChapterHeading italic>
            The location? I&apos;m not so sure.
          </ChapterHeading>
          <Paragraphs
            className='mt-5 text-center'
            items={[
              'Peaceful, with a lovely coastal path — but limited choice nearby and a beach we never really fell for.',
            ]}
          />
        </Reveal>
      </section>

      {/* 15. THE RENTAL CAR — a text → new chapter transition following the
          Hotel chapter's own unchanged closing padding, so it reuses the
          same established rhythm (CHAPTER_GAP_START here, paired with the
          previous section's existing pb-16/md:pb-20) without touching any
          locked content above. Deliberately shorter and lighter than THE
          HOTEL: one intro beat, one practical panel, one small supporting
          photo, one short question → answer beat. No card-heavy UI, no
          verdict yet — CICAR's reliability and the Sardinia comparison
          belong later, once the car is actually part of the journey. */}
      <section className={`px-6 md:px-12 ${CHAPTER_GAP_START} pb-16 md:pb-20 bg-[#faf9f6] dark:bg-black`}>
        <Reveal className='max-w-2xl mx-auto text-center'>
          <RouteLabel>The Rental Car</RouteLabel>
          <ChapterHeading italic className='mt-8 md:mt-10'>
            No prepayment?
          </ChapterHeading>
          <Paragraphs
            className='mt-5 text-center'
            items={[
              'We booked directly with CICAR. No prepayment, no deposit — just a confirmation and a car delivered to our hotel.',
            ]}
          />
        </Reveal>

        {/* Same quiet practical-information panel language as the flight
            and hotel panels above — one dominant price, everything else a
            supporting label/line underneath it. */}
        <Reveal className='mt-9 md:mt-11 mx-auto max-w-[460px] rounded-[3px] bg-[#f1ebdc] dark:bg-white/[0.04] px-8 py-8 md:px-9 md:py-9 flex flex-col items-center gap-1 text-center'>
          <span className='text-xs uppercase tracking-[0.18em] font-[family-name:var(--font-poppins)] font-semibold text-black/45 dark:text-white/45'>
            CICAR · Fiat 600
          </span>
          <TimeStamp size='md'>€194.35</TimeStamp>
          <span className='mt-4 text-sm font-[family-name:var(--font-poppins)] text-black/60 dark:text-white/60'>
            3 Jul → 10 Jul
          </span>
          <span className='mt-4 text-xs uppercase tracking-[0.18em] font-[family-name:var(--font-poppins)] font-semibold text-black/45 dark:text-white/45'>
            Insurance included · Hotel delivery
          </span>
          <span className='text-sm font-[family-name:var(--font-poppins)] text-black/60 dark:text-white/60'>
            No prepayment
          </span>
        </Reveal>

        {/* The Sardinia comparison sits outside the panel, quietly
            underneath it — personal perspective, not booking information,
            exactly like the Seychelles aside beneath the flight panel. */}
        <Reveal className='mt-6 md:mt-7 max-w-xs mx-auto text-center'>
          <p className='text-sm italic font-[family-name:var(--font-playfair)] text-black/60 dark:text-white/60 leading-snug'>
            The year before, the same Fiat 600 cost us €971 in Sardinia —
            for a rental that was almost two days longer.
          </p>
        </Reveal>

        {/* The car itself — deliberately small, documentary supporting
            imagery rather than a destination photo: no wide desktop crop,
            no caption (the CICAR branding is already visible on the car,
            and the panel above already names it), just the full frame at
            its natural 4:3 ratio, noticeably narrower than the hotel
            photograph above. */}
        <Reveal delay={0.1} className='mt-12 md:mt-16 max-w-[520px] mx-auto'>
          <div className='relative w-full overflow-hidden rounded-[2px] aspect-[4/3]'>
            <Image
              src='/2026-07%20-%20Tenerife/Rent_a%20car_web.jpeg'
              alt='Our CICAR rental car, a Fiat 600, delivered to the hotel.'
              fill
              sizes='(min-width: 768px) 520px, 100vw'
              className='object-cover'
            />
          </div>
        </Reveal>

        {/* A short eyebrow → heading → explanation beat, same component
            pairing as "A first with Ryanair" — the small moment of
            uncertainty followed by a smooth handover, kept compact on
            purpose. Two heading/paragraph pairs in sequence here (rather
            than the usual single pair) since the story has two short
            beats — the wait, then the handover — but both stay at the
            same established scales and gaps used everywhere else. */}
        <Reveal delay={0.1} className='mt-10 md:mt-12 max-w-xl mx-auto text-center'>
          <Eyebrow>No prepayment. No deposit.</Eyebrow>
          <ChapterHeading italic className='mt-3'>
            So far, just a confirmation.
          </ChapterHeading>
          <Paragraphs
            className='mt-5 text-center'
            items={[
              'At 10:40, there was still no sign of anyone. Then, just before 11, a CICAR representative arrived at the hotel with the paperwork.',
            ]}
          />
          <ChapterHeading italic className='mt-6 md:mt-7'>
            And that was it.
          </ChapterHeading>
          <Paragraphs
            className='mt-5 text-center'
            items={[
              'One signature, a few instructions, and the Fiat was ours for the week.',
            ]}
          />
        </Reveal>
      </section>

      {/* 16. MAP — Roca Nivaria -> Playa del Duque, the first real Tenerife
          outing (as opposed to travel logistics). Same compact local-hop
          treatment as the airport-transfer map above: short height, tight
          verified route, no more visual weight than the short drive it
          shows actually needs. */}
      <JourneyMapScene
        journey={TENERIFE_ROCA_TO_DUQUE_JOURNEY}
        heightClassName='h-[340px] sm:h-[380px] md:h-[440px]'
      />

      {/* 17. PLAYA DEL DUQUE — the page's first destination chapter rather
          than a travel-logistics one, so it deliberately reads lighter and
          more photographic: no practical-info panel here, just a short
          opening beat, one large destination photograph, a short personal
          aside about how this family travels, a vertical "moving
          photograph" of the sea, and one small spontaneous memory. Map ->
          content transition uses MAP_TRANSITION_PT, the same established
          token as every other map->chapter boundary on this page; the
          section closes with the same pb-16/md:pb-20 the two chapters
          before it also used to end right before the footer. */}
      <section className={`px-6 md:px-12 ${MAP_TRANSITION_PT} pb-16 md:pb-20 bg-[#faf9f6] dark:bg-black`}>
        <Reveal className='max-w-2xl mx-auto text-center'>
          <RouteLabel>Our First Stop</RouteLabel>
          <ChapterHeading italic className='mt-8 md:mt-10'>
            So, which beach first?
          </ChapterHeading>
          <Paragraphs
            className='mt-5 text-center'
            items={[
              "We looked for recommendations and Playa del Duque kept coming up. So that's where we went.",
            ]}
          />
        </Reveal>

        {/* The first proper destination photograph, deliberately much
            larger than the Fiat photo above — same primary-photo width as
            the hotel photographs, same natural 4:3 ratio kept on both
            mobile and desktop (no wide desktop crop) so nothing of the
            coastline, sea, sky or beach is trimmed away. */}
        <Reveal delay={0.1} className='mt-12 md:mt-16 max-w-5xl mx-auto'>
          <div className='relative w-full overflow-hidden rounded-[2px] aspect-[4/3]'>
            <Image
              src='/2026-07%20-%20Tenerife/Playa%20del%20Duque_web.jpeg'
              alt='Playa del Duque, Costa Adeje — the beach, sea and coastline.'
              fill
              sizes='(min-width: 768px) 1024px, 100vw'
              className='object-cover'
            />
          </div>
          <p className='mt-3 text-center text-xs uppercase tracking-[0.18em] font-[family-name:var(--font-poppins)] font-semibold text-black/40 dark:text-white/40'>
            Playa del Duque · Costa Adeje
          </p>
        </Reveal>

        {/* A short personal aside, connected to the photo rather than a
            new chapter — no eyebrow, same bare heading + paragraphs
            pattern "The airport wasn't asleep." uses. Purely about how
            this family travels, not a comment on the beach itself. */}
        <Reveal delay={0.1} className='mt-10 md:mt-12 max-w-xl mx-auto text-center'>
          <ChapterHeading italic>
            We&apos;re not all-day beach people.
          </ChapterHeading>
          <Paragraphs
            className='mt-5 text-center'
            items={[
              "We never really are. A few hours, a swim, something to eat and we're usually ready to move on.",
              'It was incredibly hot, and shade meant renting an umbrella. The sea, though — clear, cool and full of waves.',
            ]}
          />
        </Reveal>

        {/* The beach video as an editorial "moving photograph" — same
            treatment, attributes and width tokens as the hotel-beach clip:
            no controls, no sound, no frame, contained by width rather than
            stretched, since this source clip is also a vertical 9:16
            phone recording. This carries the sea/waves visually, so no
            second wave photograph sits alongside it. */}
        <Reveal delay={0.1} className='mt-12 md:mt-14 max-w-[240px] sm:max-w-xs md:max-w-sm mx-auto'>
          <div className='relative w-full overflow-hidden rounded-[2px] aspect-[9/16]'>
            <video
              src='/2026-07%20-%20Tenerife/Playa%20del%20Duque_video.mp4'
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

        {/* One small spontaneous memory to close the chapter — kept to a
            single short paragraph on purpose, no practical-info framing,
            no name/business/service invented. */}
        <Reveal delay={0.1} className='mt-12 md:mt-14 max-w-xl mx-auto text-center'>
          <ChapterHeading italic>
            €20. Ten minutes. Why not?
          </ChapterHeading>
          <Paragraphs
            className='mt-5 text-center'
            items={[
              'A completely unplanned beach massage — and surprisingly, a really good one.',
            ]}
          />
        </Reveal>

        {/* Quiet closing sentence for the chapter — plain body copy, not
            another heading, so it reads as the final line of this story
            rather than a new subsection. No pink line, no eyebrow, no
            background change, no panel, no extra photo/video. */}
        <Reveal delay={0.1} className='mt-12 md:mt-14 max-w-md mx-auto'>
          <Paragraphs
            className='text-center'
            items={[
              'We visited more beaches after this one, but Playa del Duque remained our favourite.',
            ]}
          />
        </Reveal>
      </section>

      {/* 18. MAP — Roca Nivaria -> Siam Park. Same compact local-hop
          treatment as the two car-journey maps above: short height, a
          real verified route (see lib/journeys/tenerife.ts), no more
          visual weight than the drive itself needs. */}
      <JourneyMapScene
        journey={TENERIFE_ROCA_TO_SIAM_JOURNEY}
        heightClassName='h-[340px] sm:h-[380px] md:h-[440px]'
      />

      {/* 19. SIAM PARK — a proper new chapter (RouteLabel), map -> content
          transition uses MAP_TRANSITION_PT like every other map->chapter
          boundary on this page. Rhythm: opening beat (the hot/cold
          contrast) -> practical ticket panel -> a small "the catch" aside
          on the fixed dates -> a small "on the way in" aside into the walk
          from parking -> one restrained documentary photograph
          (deliberately not hero-sized, same subtle rounded-[2px]/no
          border/no shadow language as every other photo on the page, just
          narrower) -> a quiet observation under it -> a small "fast pass"
          reflection (no practical-info box — this is a reflection, not a
          fact) -> the chapter's positive closing beat. Section closes with
          the same pb-16/md:pb-20 every chapter-before-the-footer on this
          page also uses. This chapter is personal, not a park guide: no
          ride list, no map of the park, no generic tips. */}
      <section className={`px-6 md:px-12 ${MAP_TRANSITION_PT} pb-16 md:pb-20 bg-[#faf9f6] dark:bg-black`}>
        <Reveal className='max-w-2xl mx-auto text-center'>
          <RouteLabel>Siam Park</RouteLabel>
          <ChapterHeading italic className='mt-8 md:mt-10'>
            Hot day. Cold water. We were freezing.
          </ChapterHeading>
          <Paragraphs
            className='mt-5 text-center'
            items={[
              'It was incredibly hot outside. Somehow, we spent the morning shivering.',
              'Cold water, wet swimsuits, long queues and plenty of natural shade turned out to be a surprisingly chilly combination.',
            ]}
          />
        </Reveal>

        {/* Same quiet practical-information panel language as every other
            price panel on this page. Real booking details from June/July
            2026 (verified against our own ticket confirmations, which
            aren't shown on the site — only used to check these numbers):
            2 adults x €78 + 2 children x €57 = €270. */}
        <Reveal className='mt-9 md:mt-11 mx-auto max-w-[460px] rounded-[3px] bg-[#f1ebdc] dark:bg-white/[0.04] px-8 py-8 md:px-9 md:py-9 flex flex-col items-center gap-1 text-center'>
          <span className='text-xs uppercase tracking-[0.18em] font-[family-name:var(--font-poppins)] font-semibold text-black/45 dark:text-white/45'>
            Siam Park + Loro Parque
          </span>
          <TimeStamp size='md'>€270</TimeStamp>
          <span className='mt-4 text-sm font-[family-name:var(--font-poppins)] text-black/60 dark:text-white/60'>
            Family of four · 2 adults, 2 children
          </span>
          <span className='mt-4 text-xs uppercase tracking-[0.18em] font-[family-name:var(--font-poppins)] font-semibold text-black/45 dark:text-white/45'>
            €78 adult · €57 child
          </span>
          <span className='mt-4 text-sm font-[family-name:var(--font-poppins)] text-black/60 dark:text-white/60'>
            Siam Park · 4 Jul · Loro Parque · 9 Jul
          </span>
          <span className='mt-4 text-xs uppercase tracking-[0.18em] font-[family-name:var(--font-poppins)] font-semibold text-black/45 dark:text-white/45'>
            Booked online in advance
          </span>
        </Reveal>

        {/* A small in-chapter beat, one notch below the chapter opener (no
            pink tick, same Eyebrow used for "The Hotel Itself" etc.) — the
            one real downside of booking a fixed-entry park this far
            ahead. The statement itself is deliberately NOT a ChapterHeading
            here: it was reading as visually equal to the main chapter
            headline, so it's set one size step down (text-xl/2xl instead
            of ChapterHeading's text-3xl/4xl) while keeping the exact same
            serif/italic/weight/color language — still editorial, just
            clearly secondary. */}
        <Reveal delay={0.1} className='mt-10 md:mt-12 max-w-xl mx-auto text-center'>
          <Eyebrow>The catch?</Eyebrow>
          <p className='mt-3 text-xl md:text-2xl font-[family-name:var(--font-playfair)] font-medium italic text-black dark:text-white'>
            We had to choose both visit dates when booking.
          </p>
          <Paragraphs
            className='mt-5 text-center'
            items={[
              'That meant those two days of the trip were fixed in advance rather than decided spontaneously.',
            ]}
          />
        </Reveal>

        {/* A short transition into the walk from the car park — connected
            to the documentary photo below rather than its own chapter, so
            no ChapterHeading here, just the small Eyebrow marker. */}
        <Reveal delay={0.1} className='mt-12 md:mt-14 max-w-xl mx-auto text-center'>
          <Eyebrow>On the way in</Eyebrow>
          <Paragraphs
            className='mt-5 text-center'
            items={[
              'The car park was packed, so we parked at the nearby shopping centre instead.',
              'Walking from there to the entrance, this caught my eye.',
            ]}
          />
        </Reveal>

        {/* The one photograph in this chapter — a documentary moment, not
            a destination shot: deliberately narrow (nowhere near the
            hero-photo width used for Playa del Duque), natural portrait
            framing preserved exactly (the aspect-ratio wrapper matches the
            source photo's own ratio, so object-cover crops nothing), same
            subtle rounded-[2px]/no border/no shadow treatment as every
            other photo on the page — just smaller. No caption or location
            tag, since this isn't being presented as a place to visit. */}
        <Reveal delay={0.1} className='mt-12 md:mt-14 max-w-[220px] sm:max-w-xs md:max-w-sm mx-auto'>
          <div className='relative w-full overflow-hidden rounded-[2px] aspect-[3/4]'>
            <Image
              src='/2026-07%20-%20Tenerife/Siam%20park_trash_web.jpeg'
              alt='A stone roadside planter filled with discarded bottles and cans, on the walk from the car park to Siam Park.'
              fill
              sizes='(min-width: 768px) 384px, 60vw'
              className='object-cover'
            />
          </div>
        </Reveal>

        {/* The observation — deliberately plain body copy rather than
            another heading, same quiet-aside treatment as the Playa del
            Duque chapter's own closing sentence. Careful, neutral framing
            on purpose: one isolated scene, not a verdict on Siam Park,
            Tenerife or who left it there. Tenerife is deliberately not
            called "remarkably clean" — our overall impression was that the
            island felt organised and well maintained, not exceptionally
            spotless, so this line only says this scene didn't match that
            general impression. */}
        <Reveal delay={0.1} className='mt-8 md:mt-10 max-w-md mx-auto'>
          <Paragraphs
            className='text-center'
            items={[
              "This wasn't how Tenerife had felt to us.",
              "Maybe that's why it caught my attention.",
            ]}
          />
        </Reveal>

        {/* The chapter's positive closing beat — extra breathing room
            above it, same idea as the other chapters' own final thought,
            so it clearly reads as where the Siam Park story lands. No
            photograph here on purpose: we don't have a genuine photo from
            inside the park, and this page uses real travel material only,
            never a stand-in image. */}
        <Reveal delay={0.1} className='mt-14 md:mt-16 max-w-xl mx-auto text-center'>
          <ChapterHeading italic>
            And then, back to the fun.
          </ChapterHeading>
          <Paragraphs
            className='mt-5 text-center'
            items={[
              'Many of the rides use rafts for four, so we could ride together.',
              'The kids absolutely loved it.',
            ]}
          />
        </Reveal>

        {/* Another small in-chapter beat, same weight as "The catch?"
            above — a reflection, not a recommendation: we never bought or
            used Fast Pass, so no price or verdict is presented here. Kept
            deliberately quiet and compact (a single short line, no
            standalone "Yes." heading, tighter spacing above/below than the
            other beats) so it doesn't visually compete with the main
            chapter. */}
        <Reveal delay={0.1} className='mt-10 md:mt-12 max-w-xl mx-auto text-center'>
          <Eyebrow>Would I consider Fast Pass next time?</Eyebrow>
          <Paragraphs
            className='mt-3 text-center'
            items={[
              "Yes — some queues were long enough that I'd at least look into it before going again.",
            ]}
          />
        </Reveal>
      </section>

      {/* 20. MAP — Roca Nivaria -> Playa de Las Teresitas. A real car
          journey across a much larger part of the island than the two
          local hops above (see lib/journeys/tenerife.ts for the full
          verified TF-1 -> Santa Cruz -> TF-11/San Andres corridor), so it
          gets a taller frame than the compact Duque/Siam maps — matching
          the scale of the Home -> Vienna Airport map earlier on this page
          rather than a local-hop height — while keeping every other visual
          treatment (warm cream map, pink route, car icon, typography,
          animation) identical. */}
      <JourneyMapScene
        journey={TENERIFE_ROCA_TO_TERESITAS_JOURNEY}
        heightClassName='h-[380px] sm:h-[440px] md:h-[520px]'
      />

      {/* 21. PLAYA DE LAS TERESITAS — deliberately the shortest chapter on
          the page: a proper chapter marker, a short opening beat, a small
          personal impression of the beach, one understated emotional beat
          (the company, not the beach, is why the day was memorable), and
          a single closing viewpoint photograph — the only photograph in
          this chapter. No practical-info panel, no ride/ticket details, no
          second photo or video, no separate closing beat after the
          viewpoint. Map -> content transition uses MAP_TRANSITION_PT, the
          same token as every other map->chapter boundary on this page;
          section closes with the same pb-16/md:pb-20 every chapter before
          the footer already uses. */}
      <section className={`px-6 md:px-12 ${MAP_TRANSITION_PT} pb-16 md:pb-20 bg-[#faf9f6] dark:bg-black`}>
        <Reveal className='max-w-2xl mx-auto text-center'>
          <RouteLabel>Playa de Las Teresitas</RouteLabel>
          <ChapterHeading italic className='mt-8 md:mt-10'>
            The beach? Nice. The day? So much better.
          </ChapterHeading>
          <Paragraphs
            className='mt-5 text-center'
            items={[
              'We arrived around 11:00 to complete parking chaos.',
              'We eventually found a space — free, but definitely limited.',
            ]}
          />
        </Reveal>

        {/* A small in-chapter beat, same weight/treatment as "On the way
            in" in the Siam Park chapter — Eyebrow only, no secondary
            heading, straight into the paragraphs. Our own impression of
            the beach itself, not a description of Las Teresitas in
            general. */}
        <Reveal delay={0.1} className='mt-10 md:mt-12 max-w-xl mx-auto text-center'>
          <Eyebrow>The beach?</Eyebrow>
          <Paragraphs
            className='mt-5 text-center'
            items={[
              'Calm, easy to swim in and perfectly nice.',
              "The sand was incredibly hot, but for us, it simply wasn't a wow beach.",
            ]}
          />
        </Reveal>

        {/* The emotional point of this chapter — a bare ChapterHeading
            beat, same pattern as Playa del Duque's "We're not all-day
            beach people.": no eyebrow, no photo needed to make the point,
            kept understated on purpose. */}
        <Reveal delay={0.1} className='mt-12 md:mt-14 max-w-xl mx-auto text-center'>
          <ChapterHeading italic>Somehow, we stayed all afternoon.</ChapterHeading>
          <Paragraphs
            className='mt-5 text-center'
            items={[
              'We had arranged to meet friends there and ended up having such a good time that we stayed far longer than we normally would at a beach.',
            ]}
          />
        </Reveal>

        {/* One last stop — Eyebrow + one-size-down secondary heading, same
            pattern as "The catch?" in the Siam Park chapter, leading into
            this chapter's only photograph. */}
        <Reveal delay={0.1} className='mt-16 md:mt-20 max-w-xl mx-auto text-center'>
          <Eyebrow>One last stop</Eyebrow>
          <p className='mt-3 text-xl md:text-2xl font-[family-name:var(--font-playfair)] font-medium italic text-black dark:text-white'>
            The viewpoint was worth it.
          </p>
        </Reveal>

        {/* The only photograph in this chapter, given real visual weight
            on purpose: same max-w-5xl scale as this page's other large
            hero photographs (Playa del Duque, the hotel, the Fiat pickup),
            and the source photo's own native 4:3 ratio kept exactly via
            aspect-[4/3] with object-cover — since the wrapper's aspect
            already matches the source image's aspect, nothing is cropped
            away, so the full curve of the beach, the sea, the parking area
            and the hazy mountains/horizon all stay in frame. The calima
            haze visible in the photo is real and left untouched. */}
        <Reveal delay={0.1} className='mt-12 md:mt-16 max-w-5xl mx-auto'>
          <div className='relative w-full overflow-hidden rounded-[2px] aspect-[4/3]'>
            <Image
              src='/2026-07%20-%20Tenerife/Las%20teresitas_web.jpeg'
              alt='View from the Mirador de Las Teresitas over the full curve of the beach, the bay, the public parking and the hazy Santa Cruz coastline beyond.'
              fill
              sizes='(min-width: 768px) 1024px, 100vw'
              className='object-cover'
            />
          </div>
        </Reveal>

        {/* Quiet closing line under the photo — plain body copy, not
            another heading, so the chapter ends here rather than opening
            a new subsection. No caption/location tag treatment (that's
            reserved for a plain place credit like "Playa del Duque · Costa
            Adeje"); this is an actual observation about the photo itself. */}
        <Reveal delay={0.1} className='mt-8 md:mt-10 max-w-md mx-auto'>
          <Paragraphs
            className='text-center'
            items={[
              'Calima followed us throughout our stay, blurring the distant views. Still, the view was absolutely worth it.',
            ]}
          />
        </Reveal>
      </section>

      {/* 22. MAP — Roca Nivaria -> Los Gigantes Marina. The next day's real
          car journey, in the OPPOSITE direction on TF-1 from the Teresitas
          leg above (west along the south-west coast rather than east
          toward Santa Cruz): the same shared hotel-access + TF-1 prefix,
          then west via the Autopista del Sur's newer "Fonsalia spur"
          extension, Alcala and Puerto de Santiago, to the real drivable
          street the Los Gigantes marina sits on. Same warm cream map, pink
          route, car icon, typography and animation as every other car
          journey on this page — only the geometry and camera differ. */}
      <JourneyMapScene
        journey={TENERIFE_ROCA_TO_LOS_GIGANTES_JOURNEY}
        heightClassName='h-[340px] sm:h-[380px] md:h-[440px]'
      />

      {/* 23. LOS GIGANTES · SAILING — the next day's chapter: booking the
          Third Element trip, the sailboat itself and the practical facts,
          a quiet personal parking note, the whale-watching moment, sailing
          beneath the cliffs, the chapter's one large hero photograph, and
          a small, deliberately understated closing detail. Four pieces of
          real media only (the sailboat photo, the pilot-whale clip, the
          horizontal sailing/cliffs clip and the vertical cliff photo) — no
          gallery, no second cliff photo, no additional videos. Map ->
          content transition uses MAP_TRANSITION_PT like every other
          map->chapter boundary on this page; RouteLabel -> ChapterHeading
          gap uses the page's now-standardised mt-8/mt-10 (matching "Why
          Vienna?"); the two biggest tonal shifts in this chapter (leaving
          the marina for the whale-watching moment, and coming back down to
          the sandwich after the cliffs) get the larger mt-16/mt-20
          breathing room the page now uses for a genuinely new beat,
          matching Las Teresitas' "One last stop" transition. */}
      <section className={`px-6 md:px-12 ${MAP_TRANSITION_PT} pb-16 md:pb-20 bg-[#faf9f6] dark:bg-black`}>
        <Reveal className='max-w-2xl mx-auto text-center'>
          <RouteLabel>Los Gigantes · Sailing</RouteLabel>
          <ChapterHeading italic className='mt-8 md:mt-10'>
            Three hours very well spent.
          </ChapterHeading>
          <Paragraphs
            className='mt-5 text-center'
            items={[
              'I booked the trip through GetYourGuide, originally for 13:00.',
              'Later, I moved it to 09:45 after reading that the sea tends to be calmer in the morning.',
            ]}
          />
        </Reveal>

        {/* The sailboat itself — a real, specific photo (our actual boat,
            Third Element, at its berth), kept secondary in scale to the
            cliff photograph later in this chapter. Native portrait ratio
            preserved via aspect-[3/4] with object-cover, same treatment as
            every other photo on the page. */}
        <Reveal delay={0.1} className='mt-12 md:mt-14 max-w-[220px] sm:max-w-xs md:max-w-sm mx-auto'>
          <div className='relative w-full overflow-hidden rounded-[2px] aspect-[3/4]'>
            <Image
              src='/2026-07%20-%20Tenerife/Sailboat_web.jpeg'
              alt='Our sailboat, Third Element, moored at Los Gigantes marina.'
              fill
              sizes='(min-width: 768px) 384px, 60vw'
              className='object-cover'
            />
          </div>
        </Reveal>

        {/* Same quiet practical-information panel language as every other
            price panel on this page — duration given the same visual
            weight the price usually gets, since duration is the number
            that mattered most for this booking. */}
        <Reveal className='mt-9 md:mt-11 mx-auto max-w-[460px] rounded-[3px] bg-[#f1ebdc] dark:bg-white/[0.04] px-8 py-8 md:px-9 md:py-9 flex flex-col items-center gap-1 text-center'>
          <span className='text-xs uppercase tracking-[0.18em] font-[family-name:var(--font-poppins)] font-semibold text-black/45 dark:text-white/45'>
            The Sailing Trip
          </span>
          <TimeStamp size='md'>3 hours</TimeStamp>
          <span className='mt-4 text-sm font-[family-name:var(--font-poppins)] text-black/60 dark:text-white/60'>
            €270 for four
          </span>
          <span className='mt-4 text-xs uppercase tracking-[0.18em] font-[family-name:var(--font-poppins)] font-semibold text-black/45 dark:text-white/45'>
            Third Element
          </span>
          <span className='mt-4 text-sm font-[family-name:var(--font-poppins)] text-black/60 dark:text-white/60'>
            Booked through GetYourGuide
          </span>
          <span className='mt-4 text-xs uppercase tracking-[0.18em] font-[family-name:var(--font-poppins)] font-semibold text-black/45 dark:text-white/45'>
            09:45 departure
          </span>
        </Reveal>

        {/* A small personal parking note — deliberately editorial copy,
            not another practical-info box: same Eyebrow-only, straight-
            into-paragraph treatment as "On the way in" in the Siam Park
            chapter. Describes our own morning only, not a general parking
            recommendation. */}
        <Reveal delay={0.1} className='mt-10 md:mt-12 max-w-xl mx-auto text-center'>
          <Eyebrow>Parking at the marina</Eyebrow>
          <Paragraphs
            className='mt-5 text-center'
            items={[
              'We parked at the marina before our sailing trip.',
              'There was still plenty of space when we arrived in the morning, but it filled up surprisingly quickly.',
            ]}
          />
        </Reveal>

        {/* The whale-watching moment — a genuinely new beat (we've left the
            marina and are out at sea), so it gets the larger mt-16/mt-20
            gap the page now uses for that, matching Las Teresitas' "One
            last stop" transition. Eyebrow + one-size-down secondary
            heading, same pattern as "The catch?" and "One last stop"
            elsewhere on this page. */}
        <Reveal delay={0.1} className='mt-16 md:mt-20 max-w-xl mx-auto text-center'>
          <Eyebrow>First stop</Eyebrow>
          <p className='mt-3 text-xl md:text-2xl font-[family-name:var(--font-playfair)] font-medium italic text-black dark:text-white'>
            We found them.
          </p>
          <Paragraphs
            className='mt-5 text-center'
            items={[
              'Short-finned pilot whales appeared alongside us — exactly what we had hoped to see.',
            ]}
          />
        </Reveal>

        {/* The pilot-whale clip — the only whale media in this chapter,
            given room to breathe above and below it. Same silent, no-
            controls "moving photograph" treatment as every other video on
            this page: a vertical 9:16 phone recording, contained by width
            rather than stretched, trimmed to its first ~5 seconds. */}
        <Reveal delay={0.1} className='mt-12 md:mt-14 max-w-[240px] sm:max-w-xs md:max-w-sm mx-auto'>
          <div className='relative w-full overflow-hidden rounded-[2px] aspect-[9/16]'>
            <video
              src='/2026-07%20-%20Tenerife/Whales.mp4'
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

        {/* Sailing beneath the cliffs — the chapter's second major beat,
            leading into the horizontal sailing clip and then the large
            cliff photograph. Eyebrow + full ChapterHeading, same weight as
            "The Hotel Itself" and "A first with Ryanair" elsewhere on this
            page. */}
        <Reveal delay={0.1} className='mt-14 md:mt-16 max-w-xl mx-auto text-center'>
          <Eyebrow>Then, the cliffs</Eyebrow>
          <ChapterHeading italic className='mt-3'>
            Now I understood the name.
          </ChapterHeading>
          <Paragraphs
            className='mt-5 text-center'
            items={[
              'We sailed beneath Los Gigantes and stopped for a swim.',
            ]}
          />
        </Reveal>

        {/* The horizontal sailing/cliffs clip — the one wide video in this
            chapter, kept at its real 16:9 proportions and given a wider
            container than the vertical clips above, but still well short
            of the cliff photo's own max-w-5xl scale. Same silent,
            no-controls, no-frame treatment as every other video on this
            page. */}
        <Reveal delay={0.1} className='mt-12 md:mt-14 max-w-3xl mx-auto'>
          <div className='relative w-full overflow-hidden rounded-[2px] aspect-[16/9]'>
            <video
              src='/2026-07%20-%20Tenerife/Los%20gigantes_video.mp4'
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

        {/* A quiet editorial pause between the two cliff visuals — no
            eyebrow, no paragraph, just the line itself, given generous
            room on both sides (mt-14/16, the same token "Then, the cliffs"
            above uses) so it reads as a breath between the wide sailing
            clip and the close-up cliff photo rather than a caption on
            either one. */}
        <Reveal delay={0.1} className='mt-14 md:mt-16 max-w-xl mx-auto text-center'>
          <ChapterHeading italic>The Giants.</ChapterHeading>
        </Reveal>

        {/* The strongest still image in this chapter, on purpose: the
            close-up vertical photograph of the cliffs themselves, given
            real room via aspect-[3/4] with object-cover — the wrapper's
            aspect matches the source photo's own aspect, so nothing is
            cropped away and the full scale of the cliff face stays the
            visual focus. No second cliff/marina photo sits alongside it. */}
        <Reveal delay={0.1} className='mt-14 md:mt-16 max-w-2xl md:max-w-3xl mx-auto'>
          <div className='relative w-full overflow-hidden rounded-[2px] aspect-[3/4]'>
            <Image
              src='/2026-07%20-%20Tenerife/Los%20Gigantes_web.jpeg'
              alt='Looking straight up at the sheer cliff face of Los Gigantes rising from the sea.'
              fill
              sizes='(min-width: 768px) 768px, 100vw'
              className='object-cover'
            />
          </div>
        </Reveal>

        {/* Closing beat — a plain summary of the afternoon, same Eyebrow +
            Paragraphs treatment as "In the marina" above (no ChapterHeading), so
            the sandwich stays a small aside inside the body copy rather
            than becoming the section's focal heading. Extra breathing room
            above it (mt-16/mt-20, same token as "First stop" above) so it
            clearly reads as its own closing thought, not a caption on the
            photo. No further conclusion, recommendation or practical box
            after this — the chapter simply ends here. */}
        <Reveal delay={0.1} className='mt-16 md:mt-20 max-w-xl mx-auto text-center'>
          <Eyebrow>Worth it</Eyebrow>
          <Paragraphs
            className='mt-5 text-center'
            items={[
              'Whales, a swim beneath the cliffs and, unexpectedly, a really good sandwich.',
            ]}
          />
        </Reveal>
      </section>

      {/* 24. MAP — Roca Nivaria -> Mount Teide Cable Car. Map-only, same
          bare-map pattern already used above for the Los Gigantes map (no
          RouteLabel/ChapterHeading of its own — see "22. MAP" above). The
          Mount Teide chapter content below is a separate request, added
          afterward and explicitly scoped to leave this map and its route
          data completely untouched. Same warm cream map, pink route, car
          icon, typography and animation as every other car journey on
          this page — only the geometry and camera differ. */}
      <JourneyMapScene
        journey={TENERIFE_ROCA_TO_TEIDE_JOURNEY}
        heightClassName='h-[340px] sm:h-[380px] md:h-[440px]'
      />

      {/* 25. MOUNT TEIDE — the volcanic-highlands chapter, deliberately
          different in feel from Los Gigantes: less about the activity
          itself (the cable car ride) and much more about the landscape
          around it. The chapter deliberately front-loads the practical
          information (booking, the permit note, parking) right after the
          Cable Car card, then moves steadily away from practical detail
          into pure landscape and feeling — the ascent -> the summit photo
          -> "My verdict" as the editorial break before the video -> the
          volcanic terrain on film -> calima -> the wider national park ->
          a personal closing reflection — so the reader's last impression
          is the landscape itself, not a logistics note. Five real media
          assets only, one per beat — the cable-car photo as the
          transition into the ascent, the summit photo right after "Going
          up", the vertical clip carrying the volcanic-landscape feeling
          on its own (no text beat sits between the summit photo and the
          video beyond "My verdict" — a deliberate choice, so the video
          does the emotional work rather than a heading), the calima photo
          with the short visibility note, and the landscape photo as the
          final large visual beat — no gallery, no repeated or additional
          assets. Map -> content transition uses MAP_TRANSITION_PT like
          every other map->chapter boundary on this page. The Cable Car
          practical panel keeps the same restrained cream-box language as
          "The Sailing Trip"; the permit note and Parking note both use
          the same quiet Eyebrow(+Heading)-into-paragraph treatment as "In
          the marina" rather than more cream boxes, per the editorial
          system's "selective, not a dashboard" rule. The vertical video
          is sized one step larger than this page's other vertical clips
          (max-w-sm/md rather than max-w-xs/sm) to give the landscape the
          breathing room asked for. The chapter closes on "The landscape"
          / "I wasn't ready to leave." — a personal reflection on the
          wider national park, not the permit fact and not a "Worth
          it"/generic-recommendation section. This chapter does not
          create, modify or touch TENERIFE_ROCA_TO_TEIDE_JOURNEY or any
          other journey/route data — the map above is completely
          untouched. */}
      <section className={`px-6 md:px-12 ${MAP_TRANSITION_PT} pb-16 md:pb-20 bg-[#faf9f6] dark:bg-black`}>
        <Reveal className='max-w-2xl mx-auto text-center'>
          <RouteLabel>Mount Teide</RouteLabel>
          <ChapterHeading italic className='mt-8 md:mt-10'>
            This landscape got me.
          </ChapterHeading>
          <Paragraphs
            className='mt-5 text-center'
            items={[
              'I booked our cable car tickets more than three months in advance so I could choose the day and time we wanted.',
              'We knew the cable car could close in strong winds, so there was always a little luck involved.',
            ]}
          />
        </Reveal>

        {/* Cable Car practical panel — same restrained cream-box language
            as "The Sailing Trip" above: one label, one prominent value,
            supporting lines underneath at the same quiet weight. */}
        <Reveal delay={0.1} className='mt-9 md:mt-11 mx-auto max-w-[460px] rounded-[3px] bg-[#f1ebdc] dark:bg-white/[0.04] px-8 py-8 md:px-9 md:py-9 flex flex-col items-center gap-1 text-center'>
          <span className='text-xs uppercase tracking-[0.18em] font-[family-name:var(--font-poppins)] font-semibold text-black/45 dark:text-white/45'>
            Cable Car
          </span>
          <TimeStamp size='md'>09:50</TimeStamp>
          <span className='mt-4 text-sm font-[family-name:var(--font-poppins)] text-black/60 dark:text-white/60'>
            €132 for four
          </span>
          <span className='mt-4 text-sm font-[family-name:var(--font-poppins)] text-black/60 dark:text-white/60'>
            2 adults · 2 children
          </span>
          <span className='mt-4 text-sm font-[family-name:var(--font-poppins)] text-black/60 dark:text-white/60'>
            Booked in advance
          </span>
        </Reveal>

        {/* The permit note — moved up to sit with the rest of the
            practical/booking information (right after the Cable Car card)
            rather than at the end of the chapter, since it's a useful
            thing to know before visiting rather than part of the
            emotional close. Same Eyebrow + ChapterHeading + Paragraphs
            weight as "Going up" below. */}
        <Reveal delay={0.1} className='mt-10 md:mt-12 max-w-xl mx-auto text-center'>
          <Eyebrow>One thing I didn&apos;t know</Eyebrow>
          <ChapterHeading italic className='mt-3'>
            The cable car isn&apos;t the summit.
          </ChapterHeading>
          <Paragraphs
            className='mt-5 text-center'
            items={[
              'To reach the actual peak of Teide, you need a separate permit — something that has to be arranged well in advance.',
              "We didn't have one.",
            ]}
          />
        </Reveal>

        {/* A small personal parking note — same Eyebrow-only, straight-
            into-paragraph treatment as "In the marina" above, rather than
            a second cream box. Slightly more top margin than usual
            (mt-12/14 rather than mt-10/12) since it follows a heavier
            ChapterHeading-level beat rather than another plain paragraph. */}
        <Reveal delay={0.1} className='mt-12 md:mt-14 max-w-xl mx-auto text-center'>
          <Eyebrow>Parking</Eyebrow>
          <Paragraphs
            className='mt-5 text-center'
            items={[
              'There was still plenty of space when we arrived in the morning.',
              'It became much busier later, although spaces kept opening up as people left.',
            ]}
          />
        </Reveal>

        {/* The cable-car photo — the visual transition into the ascent,
            shot looking down at the base station from inside the cabin.
            Native portrait ratio preserved via aspect-[9/16]. */}
        <Reveal delay={0.1} className='mt-14 md:mt-16 max-w-xs sm:max-w-sm md:max-w-md mx-auto'>
          <div className='relative w-full overflow-hidden rounded-[2px] aspect-[9/16]'>
            <Image
              src='/2026-07%20-%20Tenerife/El%20Taide_Cablecar.JPG'
              alt='Looking down at the cable car base station and parking area from inside the ascending cabin.'
              fill
              sizes='(min-width: 768px) 400px, 70vw'
              className='object-cover'
            />
          </div>
        </Reveal>

        {/* Going up — the layers-we-didn't-need beat, same Eyebrow +
            ChapterHeading + Paragraphs weight as "Then, the cliffs". */}
        <Reveal delay={0.1} className='mt-14 md:mt-16 max-w-xl mx-auto text-center'>
          <Eyebrow>Going up</Eyebrow>
          <ChapterHeading italic className='mt-3'>
            We got lucky.
          </ChapterHeading>
          <Paragraphs
            className='mt-5 text-center'
            items={[
              "I'd read so much about how cold it could be up there that we came prepared with extra layers.",
              "We didn't need them. Short sleeves were perfectly fine.",
            ]}
          />
        </Reveal>

        {/* The summit photo — the chapter's largest still-image scale so
            far, now placed right after "Going up" so the ascent leads
            straight into the view at the top. Native portrait ratio
            preserved via aspect-[3/4]. Uses the "_web" copy (pixels
            pre-rotated, EXIF orientation normalized to 1) rather than the
            original camera file: the original's orientation-6 tag made
            Next's on-demand AVIF/WebP transcode pathologically slow for
            this large a photo, so the pixel data was rotated once up
            front instead — same photo, identical crop and content, just
            without the EXIF flag that was tripping up the image
            optimizer. */}
        <Reveal delay={0.1} className='mt-14 md:mt-16 max-w-2xl md:max-w-3xl mx-auto'>
          <div className='relative w-full overflow-hidden rounded-[2px] aspect-[3/4]'>
            <Image
              src='/2026-07%20-%20Tenerife/El%20Taide_peak_web.jpeg'
              alt="Teide's summit cone rising above the volcanic rock, seen from below against a clear sky."
              fill
              sizes='(min-width: 768px) 768px, 100vw'
              className='object-cover'
            />
          </div>
        </Reveal>

        {/* My verdict — the playful editorial exchange, now placed right
            after the summit photo as the editorial break between that
            still photograph and the video below. Deliberately kept one
            scale below the page's biggest punchy-answer treatment (see
            "Would I pre-book it again?" -> "Not there." earlier on this
            page) so it stays understated rather than becoming a comedy
            beat: two stacked lines at ChapterHeading's own italic scale,
            the second slightly dimmed to read as the quieter of the two
            answers, followed by one short punchline. Margin (mt-14/16)
            matches "Going up" above it, since both follow a photo
            directly. */}
        <Reveal delay={0.1} className='mt-14 md:mt-16 max-w-xl mx-auto text-center'>
          <Eyebrow>My verdict</Eyebrow>
          <p className='mt-4 text-2xl md:text-3xl font-[family-name:var(--font-playfair)] italic font-medium text-black dark:text-white'>
            Was I impressed? Absolutely.
          </p>
          <p className='mt-2 text-2xl md:text-3xl font-[family-name:var(--font-playfair)] italic font-medium text-black/55 dark:text-white/55'>
            Were the kids? Not really.
          </p>
          <Paragraphs
            className='mt-6 text-center'
            items={['I think actual flowing lava might have helped.']}
          />
        </Reveal>

        {/* The vertical landscape clip — same silent, no-controls, no-
            frame "moving photograph" treatment as every other video on
            this page, but sized one step larger (max-w-sm/md rather than
            this page's usual max-w-xs/sm for a vertical clip) to give the
            volcanic terrain the breathing room this beat asked for. */}
        <Reveal delay={0.1} className='mt-16 md:mt-20 max-w-sm md:max-w-md mx-auto'>
          <div className='relative w-full overflow-hidden rounded-[2px] aspect-[9/16]'>
            <video
              src='/2026-07%20-%20Tenerife/El%20Taide_view.MOV'
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

        {/* The calima photo, then the short visibility note. Calima
            itself has already been introduced earlier on this page, so
            this beat stays brief and doesn't re-explain it. Native
            landscape ratio preserved via aspect-[4/3]. */}
        <Reveal delay={0.1} className='mt-16 md:mt-20 max-w-2xl mx-auto'>
          <div className='relative w-full overflow-hidden rounded-[2px] aspect-[4/3]'>
            <Image
              src='/2026-07%20-%20Tenerife/El%20Teide_calima_web.jpeg'
              alt='A hazy caldera view from Teide, the distant mountains obscured by calima.'
              fill
              sizes='(min-width: 768px) 672px, 100vw'
              className='object-cover'
            />
          </div>
        </Reveal>

        <Reveal delay={0.1} className='mt-10 md:mt-12 max-w-xl mx-auto text-center'>
          <Eyebrow>The view</Eyebrow>
          <Paragraphs
            className='mt-5 text-center'
            items={[
              "The weather was on our side. The visibility wasn't.",
              'Calima had followed us throughout our stay, and even up here it blurred the distant views.',
            ]}
          />
        </Reveal>

        {/* The landscape photo — the closing large visual beat, showing
            the volcanic rock pinnacles and high-altitude vegetation.
            Native portrait ratio preserved via aspect-[3/4]. Uses the
            "_web" copy for the same reason as the summit photo above
            (pre-rotated pixels, normalized EXIF orientation, identical
            content) — see that comment for the full explanation. */}
        <Reveal delay={0.1} className='mt-14 md:mt-16 max-w-2xl md:max-w-3xl mx-auto'>
          <div className='relative w-full overflow-hidden rounded-[2px] aspect-[3/4]'>
            <Image
              src='/2026-07%20-%20Tenerife/El%20Teide_landscape_web.jpeg'
              alt='Volcanic rock pinnacles and high-altitude scrub vegetation on the slopes of Teide.'
              fill
              sizes='(min-width: 768px) 768px, 100vw'
              className='object-cover'
            />
          </div>
        </Reveal>

        {/* Closing beat — the chapter's real ending: not the permit fact,
            but the wider national park itself. Same Eyebrow + ChapterHeading
            + Paragraphs weight as "Going up" above, with one addition: a
            final sentence one visual step up from body copy (the same
            italic-playfair tier "We found them." uses on this page,
            text-xl/2xl rather than ChapterHeading's text-3xl/4xl) so it
            reads with a little more weight without becoming a promotional
            statement. No "Worth it" section, no generic recommendation and
            no summary conclusion after this — the chapter simply ends
            here, on how fascinating the landscape was. */}
        <Reveal delay={0.1} className='mt-16 md:mt-20 max-w-xl mx-auto text-center'>
          <Eyebrow>The landscape</Eyebrow>
          <ChapterHeading italic className='mt-3'>
            I wasn&apos;t ready to leave.
          </ChapterHeading>
          <Paragraphs
            className='mt-5 text-center'
            items={[
              'The cable car was an experience, but it was the landscape that stayed with me.',
              'I could have driven through Teide National Park, stopped, looked around and done it all over again.',
            ]}
          />
          <p className='mt-6 text-xl md:text-2xl font-[family-name:var(--font-playfair)] italic font-medium text-black dark:text-white'>
            For me, this was the most fascinating place in Tenerife.
          </p>
        </Reveal>
      </section>

      {/* 26. MAP — Roca Nivaria -> Loro Parque. Map-only, same bare-map
          pattern already used above for the Los Gigantes and Mount Teide
          maps (no RouteLabel/ChapterHeading of its own — see "22. MAP" and
          "24. MAP" above). Placed immediately after the Mount Teide
          chapter per this request; any Loro Parque chapter content is a
          separate future request and is explicitly out of scope here. Same
          warm cream map, pink route, car icon, typography and animation as
          every other car journey on this page — only the geometry and
          camera differ.
          Mobile QA fix: this leg covers ~58.6km, the longest car journey on
          the page (longer than Teresitas' own cross-island drive), but was
          first shipped at the compact Duque/Siam local-hop height. At that
          shorter frame, the route's final approach curve into Loro Parque
          projected close enough to the "Puerto de la Cruz" sublabel to
          visibly cross through it on every mobile width tested (320-414px);
          clean on desktop's wider frame, only cramped on mobile's shorter
          one. Fix follows the page's own established convention (see the
          Teresitas map above, sized up for the same reason: "a much larger
          part of the island... gets a taller frame than the compact
          Duque/Siam maps") rather than inventing a new rule — matched here
          to Teresitas' own height since the two routes are comparable in
          scale. No route, coordinate, marker, label-placement or animation
          logic touched — only this map's own frame height. */}
      <JourneyMapScene
        journey={TENERIFE_ROCA_TO_LORO_PARQUE_JOURNEY}
        heightClassName='h-[380px] sm:h-[440px] md:h-[520px]'
      />

      {/* 27. LORO PARQUE — the trip's last chapter, deliberately lower-key
          than Mount Teide before it: a personal, slightly mixed account of
          the day rather than a park guide. Opens with the drive itself
          (a different side of the island, described plainly, with no
          judgment of the places passed through), then the park (easy to
          navigate), the user's own short video for the shows beat, a
          genuinely torn personal reflection on trained-animal performances
          (balanced, not a criticism of the park, no welfare claims beyond
          what was given, no mention of the historical orca/trainer
          incident), the gorilla photo standing entirely on its own with no
          caption, and an understated final verdict that deliberately does
          not rank Loro Parque alongside Teide's must-see status. A later
          copy-only pass (no layout/spacing/component changes) tightened
          every beat's wording to be noticeably shorter and more editorial —
          one opening paragraph instead of two, one line for The Park, no
          restated/repetitive sentences in The Shows, Mixed Feelings, or the
          final verdict. Two real media assets only (the user's own Loro
          Parque.mp4 clip, used exactly as supplied — no speed or length
          changes, no stock footage, no text overlay — and the gorilla
          photo) — no gallery, no additional or stock imagery, no icons or
          decorative cards. Map -> content transition uses MAP_TRANSITION_PT
          like every other map->chapter boundary on this page; RouteLabel ->
          ChapterHeading gap uses the page's standardised mt-8/mt-10. This
          chapter does not touch TENERIFE_ROCA_TO_LORO_PARQUE_JOURNEY, the
          map above, or any previous chapter. */}
      <section className={`px-6 md:px-12 ${MAP_TRANSITION_PT} pb-16 md:pb-20 bg-[#faf9f6] dark:bg-black`}>
        <Reveal className='max-w-2xl mx-auto text-center'>
          <RouteLabel>Loro Parque</RouteLabel>
          <ChapterHeading italic className='mt-8 md:mt-10'>
            A very different day in Tenerife.
          </ChapterHeading>
          <Paragraphs
            className='mt-5 text-center'
            items={[
              'Even the drive there showed us another side of the island — small villages that felt worlds away from the polished resort areas along the coast.',
            ]}
          />
        </Reveal>

        {/* The Park — a quiet, practical first impression, same Eyebrow +
            serif-thought + Paragraphs weight as "One last stop" / "The
            viewpoint was worth it." earlier on this page: no ChapterHeading
            needed to make a small, settled point. */}
        <Reveal delay={0.1} className='mt-12 md:mt-14 max-w-xl mx-auto text-center'>
          <Eyebrow>The Park</Eyebrow>
          <p className='mt-3 text-xl md:text-2xl font-[family-name:var(--font-playfair)] font-medium italic text-black dark:text-white'>
            Polished. Organised. Easy to explore.
          </p>
          <Paragraphs
            className='mt-5 text-center'
            items={[
              "It didn't take long to find our way around.",
            ]}
          />
        </Reveal>

        {/* The Shows — full Eyebrow + ChapterHeading + Paragraphs weight,
            same as "Going up" / "We got lucky." The personal note about the
            orcas is folded in as a second paragraph rather than its own
            beat, kept deliberately as one experience among several rather
            than a tip — "much quieter than we expected" is what happened
            to us that day, not a claim about how the shows generally work. */}
        <Reveal delay={0.1} className='mt-14 md:mt-16 max-w-xl mx-auto text-center'>
          <Eyebrow>The Shows</Eyebrow>
          <ChapterHeading italic className='mt-3'>
            Check the times before you start.
          </ChapterHeading>
          <Paragraphs
            className='mt-5 text-center'
            items={[
              'Orcas, dolphins, sea lions and more — if you want to see several shows, it helps to plan the order around their schedules.',
              'We left the orcas until later in the day and found it much quieter than we expected.',
            ]}
          />
        </Reveal>

        {/* The user's own Loro Parque clip — used exactly as supplied: no
            slowdown, no extension, no stock footage, no text overlay. The
            very short, fast edit is intentional, so it's given real width
            (max-w-sm/md, the same enlarged vertical-clip scale Mount
            Teide's landscape video uses) rather than being shrunk to this
            page's default vertical-clip size. Same silent, no-controls,
            no-frame "moving photograph" treatment as every other video on
            this page. */}
        <Reveal delay={0.1} className='mt-14 md:mt-16 max-w-sm md:max-w-md mx-auto'>
          <div className='relative w-full overflow-hidden rounded-[2px] aspect-[9/16]'>
            <video
              src='/2026-07%20-%20Tenerife/Loro%20Parque.mp4'
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

        {/* Mixed Feelings — the chapter's personal turn, same full Eyebrow +
            ChapterHeading + Paragraphs weight as the beats around it.
            Deliberately balanced: acknowledges the park's own rescue and
            conservation work and the animals' apparent care, states a
            personal discomfort with trained-animal performances, and stops
            there — no welfare claims beyond what's written, no mention of
            the historical orca/trainer incident, not framed as criticism of
            the park. */}
        <Reveal delay={0.1} className='mt-16 md:mt-20 max-w-xl mx-auto text-center'>
          <Eyebrow>Mixed Feelings</Eyebrow>
          <ChapterHeading italic className='mt-3'>
            This is where I&apos;m still a little torn.
          </ChapterHeading>
          <Paragraphs
            className='mt-5 text-center'
            items={[
              'I know the park is involved in rescue and conservation work, and the animals appear incredibly well cared for.',
              'Still, I have mixed feelings about trained-animal shows.',
            ]}
          />
        </Reveal>

        {/* My Favourite? — the mood shift the user asked for: Eyebrow +
            ChapterHeading only, then straight into the gorilla photo with
            no caption or explanatory text underneath, so the photograph
            alone carries the moment. Given the page's largest portrait-
            photo scale (max-w-2xl/3xl, matching Mount Teide's summit and
            landscape photos) since this is the chapter's emotional high
            point. Uses the "_web" copy (pixels pre-rotated, EXIF
            orientation normalized) for the same reason as the Teide
            photos — the original's orientation-6 tag made Next's image
            optimizer pathologically slow for a photo this large. */}
        <Reveal delay={0.1} className='mt-16 md:mt-20 max-w-xl mx-auto text-center'>
          <Eyebrow>My Favourite?</Eyebrow>
          <ChapterHeading italic className='mt-3'>
            The gorilla. Easily.
          </ChapterHeading>
        </Reveal>
        <Reveal delay={0.1} className='mt-10 md:mt-12 max-w-2xl md:max-w-3xl mx-auto'>
          <div className='relative w-full overflow-hidden rounded-[2px] aspect-[3/4]'>
            <Image
              src='/2026-07%20-%20Tenerife/Loro_gorilla_web.jpeg'
              alt='A silverback gorilla resting in a naturalistic, rock-and-greenery enclosure at Loro Parque, Tenerife.'
              fill
              sizes='(min-width: 768px) 768px, 100vw'
              className='object-cover'
            />
          </div>
        </Reveal>

        {/* Final Verdict — moves directly from the gorilla photo to the
            chapter's closing beat now that "A Small Surprise" has been
            removed (the kids enjoying the smaller animals wasn't a
            distinctive enough observation to need its own section). Same
            Eyebrow + ChapterHeading + Paragraphs weight as "The landscape" /
            "I wasn't ready to leave." at the end of Mount Teide. Kept
            deliberately personal rather than a recommendation: no
            "must-see"/"essential"/"worth seeing" language, no comparison
            with Teide, no telling the reader whether to visit — just what
            this day was for the writer. */}
        <Reveal delay={0.1} className='mt-16 md:mt-20 max-w-xl mx-auto text-center'>
          <Eyebrow>Final Verdict</Eyebrow>
          <ChapterHeading italic className='mt-3'>
            I&apos;m glad we went.
          </ChapterHeading>
          <Paragraphs
            className='mt-5 text-center'
            items={[
              'It was a lovely day and the park is beautifully kept.',
              "It just wasn't one of my personal highlights of Tenerife.",
            ]}
          />
        </Reveal>
      </section>

      {/* 28. MAP — Roca Nivaria -> Playa de las Américas -> Tenerife South,
          the final day. One continuous journey, two legs, matching every
          other car journey's bare-map pattern on this page (no RouteLabel/
          ChapterHeading of its own — see "22. MAP" and "24. MAP" above).
          Playa de las Américas renders as the intermediate marker (the
          animated car passes through and continues on to Tenerife South),
          not the destination — the destination the whole page has been
          building toward is the airport, closing the road-trip sequence
          that opened with the very first transfer map. See
          TENERIFE_ROCA_TO_TENERIFE_SOUTH_JOURNEY in lib/journeys/tenerife.ts
          for the full route disclosure: built from the user's own real
          navigation-app screenshots (this environment's network policy
          blocked every routing/geocoding host, so a fresh OSRM fetch
          wasn't possible this time) wherever they cover ground this file's
          already-OSRM-verified routes don't already reach — in practice
          nearly the whole journey reuses previously-verified geometry.
          Same warm cream map, pink route, car icon, typography and
          animation as every other car journey on this page — only the
          geometry and camera differ. Does not touch any other map/route. */}
      <JourneyMapScene
        journey={TENERIFE_ROCA_TO_TENERIFE_SOUTH_JOURNEY}
        heightClassName='h-[380px] sm:h-[440px] md:h-[520px]'
      />

      {/* 29. THE FINAL DAY — two small closing beats (a brief last stop in
          Playa de las Américas on the way to the airport, then the rental-
          car return and Tenerife South itself combined into one section,
          since they were the same idea told twice) that wind the trip down
          rather than open a new destination: no RouteLabel chapter marker,
          no photos. Playa de las Américas is deliberately kept to Eyebrow +
          ChapterHeading + Paragraphs, the same sub-beat weight as "Going
          up" or "The beach?" elsewhere on this page, rather than a full
          chapter — it was a short stop, not an explored destination. Map ->
          content transition now that the final-day map sits directly above
          (MAP_TRANSITION_PT, the same token every other map->chapter
          boundary on this page uses — see "22. MAP" et al.), replacing the
          text->chapter CHAPTER_GAP_START this section used before the map
          was added. */}
      <section className={`px-6 md:px-12 ${MAP_TRANSITION_PT} pb-16 md:pb-20 bg-[#faf9f6] dark:bg-black`}>
        <Reveal className='max-w-xl mx-auto text-center'>
          <Eyebrow>One Last Stop</Eyebrow>
          <ChapterHeading italic className='mt-3'>
            Playa de las Américas.
          </ChapterHeading>
          <Paragraphs
            className='mt-5 text-center'
            items={[
              'We stopped here on our way to the airport and quickly understood the appeal.',
              'Everything felt easy and close at hand — restaurants, shops, beaches.',
            ]}
          />
        </Reveal>

        {/* Tenerife South — combines the former "Returning The Car" and
            "Tenerife South" beats into one section, since they repeated the
            same point twice. What actually stood out was the rental-car
            return itself (clear signage, an obvious route, a simple
            process) rather than anything generic about the airport, so the
            heading and copy stay on that — no "airport made for tourists"
            line, no comparison with any other destination named in the
            published copy. */}
        <Reveal delay={0.1} className='mt-14 md:mt-16 max-w-xl mx-auto text-center'>
          <Eyebrow>Tenerife South</Eyebrow>
          <ChapterHeading italic className='mt-3'>
            Much easier than we&apos;d expected.
          </ChapterHeading>
          <Paragraphs
            className='mt-5 text-center'
            items={[
              "We weren't quite sure where to return the car, but we needn't have worried. Everything was clearly signposted from the road and the return itself was simple.",
              'The airport was bigger than I expected, but just as easy to navigate.',
            ]}
          />
        </Reveal>

        {/* Closing photograph — the trip's last visual beat, one final look
            at the island before the practical checklist. No heading, no
            caption, no text of any kind, unlike every other large photo on
            this page: this one is meant to stand completely on its own. The
            source photo is a genuine portrait (a tall, narrow frame of palm
            crowns, open sky, a strip of sea and the foreground below), so —
            unlike the wide hero photos elsewhere on this page — it keeps its
            own native aspect-[3/4] exactly (the source's real 4284x5712
            pixel ratio) with plain object-cover: since the wrapper's aspect
            matches the source exactly, nothing is cropped from the top,
            bottom, or sides, and the full composition (treetops, sky, sea,
            foreground) stays intact. Same max-w-2xl/3xl scale as this
            page's other full-composition portrait photos (Los Gigantes'
            cliff face, Playa del Duque's Fiat pickup detail) — the
            established "large vertical editorial photo" width, not the
            max-w-5xl wide-hero scale. mt-16 md:mt-20 matches the weight this
            page already gives its most significant closing Reveals (Mixed
            Feelings -> gorilla, Final Verdict). Uses a "_web" copy for the
            same reason as the Loro Parque gorilla and Teide summit photos:
            the original's EXIF orientation-6 tag made Next's image
            optimizer pathologically slow at this resolution, so the pixels
            are pre-rotated upright and the tag stripped — no other edit,
            retouch, or crop. The section's own existing pb-16/20 closing
            padding (unchanged) is the only space between this photo and
            Booked Before We Left below. */}
        <Reveal delay={0.1} className='mt-16 md:mt-20 max-w-2xl md:max-w-3xl mx-auto'>
          <div className='relative w-full overflow-hidden rounded-[2px] aspect-[3/4]'>
            <Image
              src='/2026-07%20-%20Tenerife/Palm_tree_web.jpeg'
              alt='Tall palm trees against open blue sky with the sea and foreground below, Tenerife.'
              fill
              sizes='(min-width: 768px) 768px, 100vw'
              className='object-cover'
            />
          </div>
        </Reveal>
      </section>

      {/* 29. BOOKED BEFORE WE LEFT — the new reusable pre-trip checklist
          (components/ui/booked-checklist.tsx), meant to close every future
          Metkish destination page the same way: this page only supplies its
          own list of what was actually booked, the component's design never
          changes. Text -> new "chapter" transition on top (CHAPTER_GAP_START,
          same as the section above), unchanged. The bottom is a one-off
          override of CHAPTER_GAP_END (not the shared constant itself, which
          line "6. MAP" above also uses) — this section is the very last
          thing before the dark footer rather than another cream section, so
          it earns ~50px more breathing room than the standard chapter-close
          value before that hard colour change, without touching the
          checklist's own top spacing or its item-to-item rhythm (both live
          entirely inside BookedChecklist and are untouched here). No card,
          no border, no shadow, no prices/dates — see the component's own
          comment for the full design rationale. */}
      <section className={`px-6 md:px-12 ${CHAPTER_GAP_START} pb-[calc(3rem+50px)] md:pb-[calc(3.5rem+50px)] bg-[#faf9f6] dark:bg-black`}>
        <Reveal className='mx-auto'>
          <BookedChecklist
            items={[
              'Flights',
              'Hotel',
              'Car rental',
              'Mount Teide cable car',
              'Siam Park + Loro Parque tickets',
              'Whale-watching trip',
              'Airport parking in Vienna',
              'Airport transfer in Tenerife',
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
        {/* One compact information block: three rows meant to read as a
            single unit, so nothing inside it may carry its own vertical
            margin/padding/min-height — the wrapper's gap is the only
            spacing between them. (min-h-11 touch-target sizing on the nav
            and email links previously padded each row well past its
            visible text, which is what made this block look loose even
            with a small flex gap.) Then a distinctly larger, still
            restrained gap before the copyright line. */}
        <div className='mt-3 md:mt-4 flex flex-col items-center gap-2.5'>
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
        </div>
        <p className='mt-8 md:mt-9 text-xs font-[family-name:var(--font-poppins)] text-white/40'>
          © 2026 Metkish
        </p>
      </footer>
    </div>
  );
}
