'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import JourneyMapScene from '@/components/journey/JourneyMapScene';
import { RouteLabel, TimeStamp } from '@/components/journey/annotation-kit';
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

      {/* 3. GETTING TO ROME -- the booking-mistake story. Real trip
          content: travelling as a group of nine, the Trenitalia booking
          itself, and the departure-station mix-up, exactly as told --
          nothing invented or generalised. Same map->content pause as
          every other destination page, and a CHAPTER_GAP_END close since
          the train route map follows directly after this section, not
          more text. */}
      <section className={`px-6 md:px-12 ${MAP_TRANSITION_PT} ${CHAPTER_GAP_END} bg-[#faf9f6] dark:bg-black`}>
        <div className='max-w-2xl mx-auto text-center'>
          <Reveal>
            <RouteLabel>Getting to Rome</RouteLabel>
            <ChapterHeading italic className='mt-8 md:mt-10'>
              My first train booking mistake
            </ChapterHeading>
            <Paragraphs
              className='mt-5 text-center'
              items={[
                "This trip was a little different from our usual travels. We were travelling in a group of nine, and for once, I wasn't the main organiser. Someone else was responsible for the itinerary, while I helped with some of the arrangements.",
                "And perhaps that's why I made what I consider a complete beginner's mistake.",
                'I had never booked train tickets in Italy before. We booked through Trenitalia, travelling from Trieste Airport to Venice Mestre and then continuing to Rome, with the same route on our return journey.',
                "The booking process was already a little complicated. We couldn't book all nine passengers together, so we used two computers at the same time — one booking five tickets and the other booking four.",
                'For most of the trains, we also had to select our seats. We had booked Business Class between Venice and Rome, and we wanted to make sure all nine of us could sit together. So we carefully coordinated our bookings, choosing seats next to each other.',
                'We paid so much attention to the seating arrangements that I completely overlooked one rather important detail.',
              ]}
            />
          </Reveal>

          {/* The dramatic pivot -- same Playfair-italic editorial
              emphasis used for the hero's own short sentiment line, just
              a smaller size, standing alone as its own beat before the
              story continues. */}
          <Reveal delay={0.05} className='mt-6'>
            <p className='text-lg md:text-xl italic font-[family-name:var(--font-playfair)] font-medium text-black dark:text-white text-center'>
              Our departure station.
            </p>
          </Reveal>

          <Reveal delay={0.1} className='mt-6 text-center'>
            <Paragraphs
              items={[
                'I had simply assumed we were leaving from Trieste city centre.',
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
          <Reveal delay={0.2} className='mt-10 md:mt-12 text-center'>
            <Paragraphs
              items={[
                'I even spent time looking for parking for our van near the city station, without much success. Eventually, I left that task to the person organising the trip.',
                'He found parking at the airport almost immediately.',
                "It wasn't until we actually arrived and parked at Trieste Airport that I realised my mistake. I had been searching for parking in a completely different part of Trieste!",
                'And the funny thing is, Trieste Airport turned out to be a much better departure point than the city centre.',
                'There was a large parking area, and a huge pedestrian bridge connecting the airport area to the railway station. Everything was well organised and convenient for travellers.',
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

        {/* Parking note -- short and practical, right beside the walkway
            photo it's about, as a simple inline link rather than another
            bg-[#f1ebdc] panel (this page already has one of those coming
            up for the ticket cost, and a second so soon after would start
            reading as a dashboard). No price given, since we don't have
            the exact amount. The booking link sits on its own centred
            line below, styled in the site's pink accent rather than a
            default underlined black hyperlink, so it reads as a quiet
            editorial detail rather than a form control. */}
        <Reveal delay={0.28} className='mt-6 max-w-sm mx-auto text-center'>
          <p className='text-sm font-[family-name:var(--font-poppins)] text-black/65 dark:text-white/65 leading-relaxed'>
            We parked our van at Trieste Airport, where parking was easy
            and the railway station was just a short walk away via the
            covered walkway.
          </p>
          <a
            href='https://park.triesteairport.it/#/booking'
            target='_blank'
            rel='noopener noreferrer'
            className='mt-3 inline-block whitespace-nowrap text-sm font-[family-name:var(--font-poppins)] text-pink-500 dark:text-pink-300 no-underline decoration-pink-500/50 dark:decoration-pink-300/50 underline-offset-4 hover:underline transition-colors'
          >
            Book parking at Trieste Airport ↗
          </a>
        </Reveal>

        <div className='max-w-2xl mx-auto text-center'>
          <Reveal delay={0.3} className='mt-8 md:mt-10 text-center'>
            <Paragraphs
              items={[
                'What I initially thought was a booking mistake actually worked out in our favour.',
              ]}
            />
          </Reveal>

          <Reveal delay={0.35} className='mt-10 md:mt-12 max-w-2xl mx-auto'>
            <InlineTip>
              My tip: Always check the exact departure station when
              booking train tickets. Trieste has several stations, and
              they are not interchangeable. If you&apos;re arriving by
              car, Trieste Airport is worth considering — we found the
              parking and railway access very convenient.
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
          the same "Getting to Rome" chapter the map above belongs to. */}
      <section className={`px-6 md:px-12 ${MAP_TRANSITION_PT} pb-16 md:pb-20 bg-[#faf9f6] dark:bg-black`}>
        <div className='max-w-2xl mx-auto text-center'>
          <Reveal className='flex flex-col items-center'>
            <Eyebrow>By Train</Eyebrow>
            <ChapterHeading italic className='mt-3'>
              Travelling to Rome
            </ChapterHeading>
            <Paragraphs
              className='mt-5 text-center'
              items={[
                'Our first train from Trieste Airport to Venezia Mestre was a regional train. It was fairly slow, and there were no assigned seats, so we simply sat wherever we found space.',
                'The journey took 1 hour and 24 minutes.',
                'In Venice Mestre, we had 29 minutes to change trains, which was more than enough. Everything ran on schedule, with no delays.',
                'The second part of our journey was a completely different experience.',
                'We travelled to Rome on a Frecciarossa high-speed train in Business Class, and I really enjoyed it.',
                'The seats were comfortable, the train was fast, and shortly after departure, a member of staff came through with a trolley offering drinks and snacks. We could choose something to drink, along with a sandwich, biscuits, or even both.',
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
          <Reveal delay={0.15} className='mt-10 md:mt-12 text-center'>
            <Paragraphs
              items={[
                'The journey from Venice to Rome took just 3 hours and 52 minutes.',
                'We arrived at Roma Termini at 11:30 PM, exactly as scheduled.',
              ]}
            />
          </Reveal>

          {/* 6. THE RETURN JOURNEY -- another in-chapter beat, same
              Eyebrow + ChapterHeading pairing as "Travelling to Rome"
              above. Genuinely a new short story within the chapter, so it
              gets the larger "new editorial idea" gap used for Tenerife's
              own "A first with Ryanair" beat. */}
          <Reveal delay={0.1} className='mt-16 md:mt-[76px] flex flex-col items-center'>
            <Eyebrow>Homeward</Eyebrow>
            <ChapterHeading italic className='mt-3'>
              The return journey
            </ChapterHeading>
            <Paragraphs
              className='mt-5 text-center'
              items={[
                'Our return journey from Rome was probably the most stressful part of travelling by train.',
                'We were waiting in front of the departure board at Roma Termini for our platform number to appear. Our train was scheduled to depart at 3:35 PM, and the board initially showed a five-minute delay, which eventually became fifteen minutes.',
                "As soon as the platform number appeared, we headed straight there. But first, we had to get through the ticket checks — with nine people, suitcases, and a crowd of passengers trying to get through, it wasn't exactly quick.",
                "By the time we reached the platform, our train was already pulling in. And that's when we realised we had another problem.",
              ]}
            />
          </Reveal>

          {/* Dramatic pivot line -- same treatment as "Our departure
              station." in the booking-mistake section: a short, punchy
              Playfair-italic beat that creates the turn before the next
              paragraph explains it. */}
          <Reveal delay={0.05} className='mt-6'>
            <p className='text-lg md:text-xl italic font-[family-name:var(--font-playfair)] font-medium text-black dark:text-white text-center'>
              Carriage 11. Our seats were in carriage 2.
            </p>
          </Reveal>

          <Reveal delay={0.1} className='mt-6 max-w-2xl mx-auto'>
            <Paragraphs
              className='text-center'
              items={[
                'Almost the entire length of the train was between us and our seats.',
                'So we started running, dragging our suitcases along the platform. Then we heard a whistle — thinking the train was about to leave, we ran even faster. Everyone was trying to keep up, manage their luggage, and make sure nobody got left behind.',
                'Eventually, we reached our carriage, boarded, and settled into our seats. And then we waited — for another five minutes. After all that rushing, we actually had time to spare.',
                'Looking back, I think the most frustrating part was the lack of clear information. We had been waiting for the platform announcement, but once it appeared, everything suddenly felt rushed. With a large group, crowded ticket checks, and eleven carriages to navigate, it was genuinely stressful.',
                'Fortunately, the rest of the journey went much more smoothly. The train recovered some of its delay on the way to Venice Mestre, and although we had worried about our short connection, our next train was waiting on the opposite track of the same platform.',
                "We didn't even have to use an underpass. After waiting a little over ten minutes, we boarded our final train to Trieste Airport.",
                'In the end, everything worked out perfectly.',
              ]}
            />
          </Reveal>

          <Reveal delay={0.15} className='mt-10 md:mt-12 max-w-2xl mx-auto'>
            <InlineTip>
              My tip: At large stations like Roma Termini, check your
              carriage number in advance and pay attention to the train
              composition displayed at the station. If you&apos;re
              travelling with luggage or in a group, reaching your
              carriage can take longer than you expect.
            </InlineTip>
          </Reveal>

          {/* 7. TRAIN JOURNEY OVERVIEW -- a compact timeline, reusing the
              map's own small-pink-dot visual language (see TimelineLeg's
              own comment above) instead of another price-card style box.
              24-hour times throughout, per the brief. */}
          <Reveal delay={0.1} className='mt-16 md:mt-[76px] flex flex-col items-center'>
            <Eyebrow>At a Glance</Eyebrow>
            <ChapterHeading italic className='mt-3'>
              Train journey overview
            </ChapterHeading>
          </Reveal>

          <Reveal delay={0.15} className='mt-10 md:mt-12 max-w-sm mx-auto text-left'>
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

          <Reveal delay={0.2} className='mt-12 md:mt-14 max-w-sm mx-auto text-left'>
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

          {/* 8. TRAIN COSTS -- the same quiet bg-[#f1ebdc] practical-info
              panel language as every price card sitewide. The caveat
              about this being an average, not a fixed fare, lives as a
              small supporting line below the card rather than inside it,
              same placement as every other card's own support line. */}
          <Reveal delay={0.1} className='mt-16 md:mt-[76px] mx-auto max-w-[460px] rounded-[3px] bg-[#f1ebdc] dark:bg-white/[0.04] px-8 py-8 md:px-9 md:py-9 flex flex-col items-center gap-1 text-center'>
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
          <Reveal delay={0.15} className='mt-4 max-w-sm mx-auto text-center'>
            <p className='text-xs italic font-[family-name:var(--font-poppins)] text-black/50 dark:text-white/50 leading-relaxed'>
              Average per-person cost based on our own booking, including
              Business Class on the longer legs and a family fare — not a
              fixed or universal Trenitalia price.
            </p>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
