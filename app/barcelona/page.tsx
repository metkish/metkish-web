'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { InstagramIcon, PinterestIcon } from '@/components/ui/social-icons';
import { INSTAGRAM_URL, PINTEREST_URL } from '@/lib/social-links';
import WhyViennaSection from '@/components/journey/why-vienna-section';
import FlightSection from '@/components/journey/flight-section';
import TransferToHotelSection from '@/components/journey/transfer-to-hotel-section';
import { RouteLabel, TimeStamp } from '@/components/journey/annotation-kit';
import {
  BARCELONA_VIENNA_TO_BARCELONA_JOURNEY,
  BARCELONA_AIRPORT_TO_HOTEL_JOURNEY,
} from '@/lib/journeys/barcelona';

const LOGO_SRC = '/metkish-logo.png';

// Same fade-up-on-scroll rhythm used throughout the site (Tenerife, Italy,
// My Travels gallery): once-only, generous viewport threshold, no bounce.
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

// Same Level 2 editorial heading scale used throughout the site (see
// app/tenerife/page.tsx's own ChapterHeading comment).
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

// Same "inline tip" treatment as components/guides/el-clasico-tickets-article.tsx's
// own InlineTip ("My tip: Apply well in advance" in the FC Barcelona guide):
// a thin pink left rule, left-aligned italic text, no label, no background --
// copied here verbatim (same classes) rather than imported, since it's a
// small one-off presentational helper local to each page, same as Reveal/
// ChapterHeading/Paragraphs above.
function InlineTip({ children }: { children: ReactNode }) {
  return (
    <p className='border-l-2 border-pink-300 dark:border-pink-400/60 pl-4 text-base italic font-[family-name:var(--font-poppins)] font-light text-black/75 dark:text-white/75 leading-relaxed'>
      {children}
    </p>
  );
}

// Same chapter-to-chapter transition tokens as app/tenerife/page.tsx's own
// CHAPTER_GAP_START/CHAPTER_GAP_END -- this is a photo -> new chapter
// transition (the taxi photo above closes the previous chapter), so
// CHAPTER_GAP_START here pairs with TransferToHotelSection's own unchanged
// CHAPTER_GAP_END, same combo as Tenerife's Ryanair photo -> Arrival.
const CHAPTER_GAP_START = 'pt-12 md:pt-14';

export default function BarcelonaPage() {
  const [pastHero, setPastHero] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      // Same early mobile shrink threshold used sitewide (see
      // app/tenerife/page.tsx and app/italy/page.tsx).
      const isMobile = window.innerWidth < 768;
      setPastHero(window.scrollY > (isMobile ? 32 : window.innerHeight * 0.5));
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className='min-h-screen bg-[#faf9f6] dark:bg-black flex flex-col'>
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

      {/* 1. HERO — same full-screen treatment as the Tenerife hero (see
          app/tenerife/page.tsx "1. HERO"): h-[100svh]/[100dvh] photo
          section, a light dark overlay for text legibility, centered
          Reveal with title / location-date / italic subtitle, identical
          typography and spacing. Only the crop differs, since this source
          photo is portrait (Park Guell) rather than landscape.
          The original photo (Barcelona_hero.jpeg, untouched) is an MPO
          file with an EXIF rotation tag -- the same phone-camera format
          that broke on real mobile devices for several Tenerife photos
          (see that page's hero comment). Barcelona_hero_web.jpeg is the
          same fix applied here ahead of time: EXIF-rotation baked in,
          converted to a plain single-frame RGB JPEG, EXIF stripped. Same
          photo, identical crop/content/composition -- just a format every
          device can reliably decode.
          Remaining sections (map, chapters, etc.) are intentionally not
          built yet; this page is hero-only for now, with the same
          "coming soon" continuation every other unbuilt destination uses
          (see components/ui/coming-soon-destination.tsx) reused by hand
          below, since this page already has its own custom hero instead
          of that component's. */}
      <section className='relative h-[100svh] md:h-[100dvh] w-full overflow-hidden'>
        <Image
          src='/2026-10%20-%20Barcelona/Barcelona_hero_web.jpeg'
          alt='A stone viaduct and columns overgrown with ivy, framed by palm trees, at Park Guell, Barcelona.'
          fill
          priority
          sizes='100vw'
          // The source photo is portrait, so object-fit: cover crops it
          // very differently per breakpoint. On desktop the hero box is
          // far wider than tall, so the image's full width always shows
          // and only the vertical position matters: 35% keeps the ornate
          // stonework and palm canopy in frame while trimming both the
          // empty sky above and the plain path/bench below. On mobile the
          // box is taller and narrower than the source, so the full
          // height always shows (sky, stonework and path all visible) and
          // only the horizontal position matters: 55% centers on the
          // densest cluster of stonework rather than the fainter,
          // repeating arch at the photo's left edge.
          className='object-cover object-[55%_50%] md:object-[50%_35%]'
        />
        {/* Readability treatment: one flat, even dark wash across the
            whole photo (below) plus a soft, minimal text-shadow on each
            line -- no vignette, no gradient patch, no hard-edged outline.
            An earlier radial-vignette + four-direction outline-shadow
            version read as harsh, and on Tenerife's plain sky it also left
            a visible dark rectangle. A full-bleed wash has no edges to
            show on any background, so it holds up here against this
            photo's busier stonework too; the soft shadow alone is enough
            once the whole image is evenly darkened. Keep this in sync with
            app/tenerife/page.tsx's hero -- same wash strength, same
            shadow values. */}
        <div className='absolute inset-0 bg-black/28' />
        <div className='relative z-10 h-full flex flex-col items-center justify-center text-center px-6'>
          <Reveal>
            <h1
              className='text-5xl sm:text-6xl md:text-7xl font-[family-name:var(--font-playfair)] font-medium tracking-tight text-white'
              style={{
                textShadow: '0 2px 20px rgba(0,0,0,0.45), 0 1px 6px rgba(0,0,0,0.35)',
              }}
            >
              Barcelona
            </h1>
            <p
              className='mt-5 text-xs sm:text-sm uppercase tracking-[0.22em] font-[family-name:var(--font-poppins)] font-semibold text-white/80'
              style={{
                textShadow: '0 1px 10px rgba(0,0,0,0.5), 0 1px 3px rgba(0,0,0,0.4)',
              }}
            >
              Spain · Catalonia · October 2026
            </p>
            <p
              className='mt-9 max-w-md mx-auto text-lg md:text-xl italic font-[family-name:var(--font-playfair)] text-white/90'
              style={{
                textShadow: '0 1px 10px rgba(0,0,0,0.5), 0 1px 3px rgba(0,0,0,0.4)',
              }}
            >
              A city that surprised us in more ways than one.
            </p>
          </Reveal>
        </div>
      </section>

      {/* 2. WHY VIENNA -- shared with app/tenerife/page.tsx via
          components/journey/why-vienna-section.tsx: the same map (home ->
          Vienna Airport), the same layout/typography/parking-card styling
          and the same closing "why Car Park 3" paragraph, with only the
          intro line and the parking fact itself specific to this trip.
          See that component's own comment for why app/tenerife/page.tsx is
          deliberately left untouched rather than also switched to use it. */}
      <WhyViennaSection
        introText='Close enough to drive, large enough to give us plenty of choice. And this time, the deciding factor: a direct flight to Barcelona.'
        parkingLabel='Vienna Airport · Car Park 3'
        parkingValue='€154.08'
        parkingSupport={['24 Oct, 04:30 → 29 Oct, 14:10']}
      />

      {/* 3. THE FLIGHT -- shared with app/tenerife/page.tsx via
          components/journey/flight-section.tsx: the same flight map shape
          (Vienna Airport -> destination), the same layout/typography/card
          styling as Tenerife's own flight fact card. Deliberately only
          the quiet fact card, not Tenerife's fuller flight story (no
          Seychelles aside, flight-facts row or Ryanair-seats story) --
          see that component's own comment for why app/tenerife/page.tsx
          is deliberately left untouched rather than also switched to use
          it. */}
      <FlightSection
        journey={BARCELONA_VIENNA_TO_BARCELONA_JOURNEY}
        heading='Vienna to Barcelona'
        airline='Austrian Airlines · direct'
        dates='24 Oct → 29 Oct 2026'
        price='€1,707.28'
        luggage='4 × 23 kg'
        experience={{
          label: 'Flying with Austrian Airlines',
          heading: 'Why we check our luggage',
          paragraphs: [
            "These days, it feels like almost everyone travels with a carry-on suitcase. Boarding becomes a rush to find space in the overhead compartments. We prefer to avoid all of that by checking in our luggage. No dragging suitcases through the airport, no fighting for overhead space. For us, it's simply more comfortable.",
            'Before departure, Austrian Airlines emailed our daughter offering to check in her cabin bag for free, plus a €4 onboard voucher, because the flight was expected to be full.',
            'And it was. Both flights were fully booked, and the airline was even looking for volunteers willing to take a later flight in exchange for compensation.',
          ],
          image: {
            src: '/2026-10%20-%20Barcelona/Barcelona_Austrian_airlines_web.jpeg',
            alt: 'Passengers boarding an Austrian Airlines aircraft by stairs on the tarmac at night, the tail’s red and white livery lit up against the dark sky.',
            // Source photo is landscape (~4:3) with a large band of plain
            // night sky across the top -- object-position biased well
            // toward the top (low Y%) so the 16:9 desktop crop trims that
            // empty sky rather than the aircraft tail or the boarding
            // stairs below it. The 4:3 mobile box matches the source's
            // own aspect almost exactly, so mobile shows close to the
            // full, uncropped frame regardless.
            objectPositionClassName: 'object-[50%_30%] md:object-[50%_28%]',
          },
        }}
      />

      {/* 4. GETTING TO THE HOTEL -- animated transfer map, Barcelona
          Airport (Terminal 1) -> ICON BCN, via
          components/journey/transfer-to-hotel-section.tsx. Same shared-
          component pattern as Why Vienna and The Flight above: real,
          OSRM-verified driving route (see lib/journeys/barcelona.ts's own
          comments for the route verification and the T1-access-road
          coordinate fix), same beige map background / pink animated route
          / typography as every other Metkish map. The taxi story (heading,
          paragraphs, photo) is now in place; price is still a separate,
          explicit follow-up request, not guessed here. */}
      <TransferToHotelSection
        journey={BARCELONA_AIRPORT_TO_HOTEL_JOURNEY}
        label='Getting to the Hotel'
        heading='Getting to the hotel'
        paragraphs={[
          "Barcelona Airport is well connected to the city by bus and metro, although the airport metro requires a special ticket.",
          'We chose the easiest option: a taxi.',
          'We landed around 9 AM and simply followed the taxi signs. The taxi area was clearly organised, with several rows of Barcelona\'s distinctive black-and-yellow taxis and staff directing passengers to the next available car.',
          'The ride to our hotel in the city centre cost around €40, including the airport surcharge.',
        ]}
        photo={{
          src: '/2026-10%20-%20Barcelona/Barcelona_taxi_web.jpeg',
          alt: 'A row of Barcelona\'s black-and-yellow taxis waiting outside the airport terminal.',
          width: 2898,
          height: 3475,
        }}
      />

      {/* 5. THE HOTEL -- ICON BCN. Same visual reference as Tenerife's own
          "THE HOTEL" chapter (app/tenerife/page.tsx's "14. THE HOTEL"):
          RouteLabel -> italic ChapterHeading -> Paragraphs, the same quiet
          beige practical-information panel (no border/shadow, TimeStamp-
          scale price) for the booking, then a smaller editorial beat below
          it. Deliberately lighter than Tenerife's own version per this
          step's explicit scope: no hotel exterior photo (no stock/
          promotional imagery, and none was supplied for this chapter), no
          second practical panel -- just the intro + personal rating, the
          price card, the "little things" aside, and the elevator clip.
          This is a photo -> new chapter transition (the taxi photo above
          closes "Getting to the Hotel"), so CHAPTER_GAP_START here pairs
          with that section's own unchanged CHAPTER_GAP_END, same combo
          Tenerife uses for Ryanair photo -> Arrival. */}
      <section className={`px-6 md:px-12 ${CHAPTER_GAP_START} pb-16 md:pb-20 bg-[#faf9f6] dark:bg-black`}>
        <Reveal className='max-w-2xl mx-auto text-center'>
          <RouteLabel>The Hotel</RouteLabel>
          <ChapterHeading italic className='mt-8 md:mt-10'>
            Location over luxury
          </ChapterHeading>
          {/* The rating is the body text's own last line, not a separate
              score widget or badge -- a personal aside, not a Booking.com-
              style review score, per this step's explicit instruction. */}
          <Paragraphs
            className='mt-5 text-center'
            items={[
              'We stayed at ICON BCN, just a short walk from Plaça de Catalunya. The location was easily the best thing about this hotel.',
              'The rooms were spacious, breakfast was good and the staff were friendly. The hotel was pleasantly decorated, but nothing extraordinary, and both cleanliness and service could have been better.',
              "We spent most of our time exploring Barcelona, so we didn't need much more. The staff stored our luggage on arrival and arranged our airport transfer for departure.",
              'Our rating: 8/10 — mainly thanks to the location.',
            ]}
          />
        </Reveal>

        {/* Same quiet practical-information panel language as every other
            price card on the site (Vienna parking, the flight, Getting to
            the Hotel's own future price card) -- one dominant value, no
            border/shadow, the booking total only. The €92.40 city tax is
            explicitly NOT part of this price, per this step's instruction
            -- it surfaces only below, as part of the personal "little
            things" aside, not folded into the headline figure. */}
        <Reveal className='mt-9 md:mt-11 mx-auto max-w-[460px] rounded-[3px] bg-[#f1ebdc] dark:bg-white/[0.04] px-8 py-8 md:px-9 md:py-9 flex flex-col items-center gap-1 text-center'>
          <span className='text-xs uppercase tracking-[0.18em] font-[family-name:var(--font-poppins)] font-semibold text-black/45 dark:text-white/45'>
            ICON BCN · 5 Nights
          </span>
          <TimeStamp size='md'>€2,688.40</TimeStamp>
          <span className='mt-4 text-sm font-[family-name:var(--font-poppins)] text-black/60 dark:text-white/60'>
            24 Oct → 29 Oct 2026
          </span>
          <span className='mt-4 text-xs uppercase tracking-[0.18em] font-[family-name:var(--font-poppins)] font-semibold text-black/45 dark:text-white/45'>
            2 Adults + 2 Children · 1 Room
          </span>
        </Reveal>

        {/* "The little things we remember" -- a small, separate editorial
            beat below the price card, same ChapterHeading + Paragraphs
            pairing (no Eyebrow this time; none was given, and inventing
            one isn't part of this step's scope). Slightly more breathing
            room than the panel->photo gaps elsewhere, since this opens a
            genuinely new short story rather than continuing the intro. */}
        <Reveal delay={0.1} className='mt-14 md:mt-16 max-w-xl mx-auto text-center'>
          <ChapterHeading italic>The little things we remember</ChapterHeading>
          <Paragraphs
            className='mt-5 text-center'
            items={[
              "Next door was a school, with a sports court right beside the hotel's courtyard. Every morning, the children had their PE lessons outside, and the shouting made sleeping in practically impossible.",
              "The city tax was another thing worth mentioning: €92.40 for five nights. We knew the amount when booking, but it's still the highest city tax we've ever paid anywhere.",
              "But the most memorable feature was the lift. It felt like something from another era, with doors that had to be closed manually. If someone forgot to close them, the lift simply wouldn't move. Sometimes taking the stairs to our fourth-floor room was easier.",
            ]}
          />
        </Reveal>

        {/* The elevator clip -- unlike every other video on the site (the
            autoplay/muted/no-controls "moving photograph" treatment, e.g.
            Tenerife's Hotel_beach.mp4), this one is a normal, user-started
            video: native browser controls, no autoplay, no loop, sound
            available once played, exactly per this step's requirements.
            Shown at its own real aspect ratio (a vertical 640x1138 phone
            recording, same 9:16 shape as the site's other vertical clips)
            via width/height rather than an absolute-fill crop, since
            nothing here needs to be cropped to fill a box -- the original
            video, untouched, lives at Barcelona_hotel.MOV; this is a
            re-encoded 640px-wide derivative for the web, same conversion
            convention as Milano_green.mp4 (see app/italy/page.tsx's own
            comment on that file). The school-courtyard clip is
            deliberately not used here, per this step's explicit scope. */}
        <Reveal delay={0.15} className='mt-12 md:mt-14 max-w-[240px] sm:max-w-xs mx-auto'>
          <video
            src='/2026-10%20-%20Barcelona/Barcelona_hotel_web.mp4'
            controls
            playsInline
            preload='metadata'
            width={640}
            height={1138}
            className='w-full h-auto rounded-[2px]'
          >
            Your browser does not support the video tag.
          </video>
        </Reveal>
      </section>

      {/* 6. GETTING AROUND -- metro ticketing story. Same hand-authored
          shape as THE HOTEL above (RouteLabel -> italic ChapterHeading ->
          Paragraphs), then an InlineTip aside (thin pink left rule,
          left-aligned italic text, same component/styling as "My tip:
          Apply well in advance" in the FC Barcelona guide -- no centered
          label, no box/border/background), then the ticket-machine photo.
          This is a video -> new chapter
          transition (the elevator clip above closes "The Hotel"), so it
          reuses the same CHAPTER_GAP_START as that section's own photo ->
          new chapter opening, same precedent as Tenerife's photo -> new
          chapter rhythm. */}
      <section className={`px-6 md:px-12 ${CHAPTER_GAP_START} pb-16 md:pb-20 bg-[#faf9f6] dark:bg-black`}>
        <Reveal className='max-w-2xl mx-auto text-center'>
          <RouteLabel>Getting Around</RouteLabel>
          <ChapterHeading italic className='mt-8 md:mt-10'>
            Metro tickets in Barcelona
          </ChapterHeading>
          <Paragraphs
            className='mt-5 text-center'
            items={[
              "Since our hotel was right in the city centre, we explored much of Barcelona on foot. For longer distances, we used the metro. We didn't use buses at all.",
              'I like to plan things ahead, so before our trip I downloaded the T-mobilitat app and purchased a T-familiar ticket with 8 journeys for €11.50, plus €1 for the digital card.',
              'The T-familiar ticket can be shared between several people. All four of us used the same card, validating it once for each person. That meant 8 journeys covered two metro rides for our family of four.',
              "The problem started when I tried to reload the ticket. The app simply wouldn't let me add more journeys.",
              'In the end, I bought a physical card from a metro ticket machine, paying another €1 for the card itself. From then on, everything worked perfectly. We simply reloaded it at the machines whenever we needed more journeys.',
              "Personally, I'm not a big fan of this ticketing system. I much prefer the Tap&Go system we've used in Italy, where you can simply tap your bank card and go. No separate transport cards, no reloading and no unnecessary complications.",
            ]}
          />
        </Reveal>

        {/* The tip -- now the same InlineTip treatment used for "My tip:
            Apply well in advance" in the FC Barcelona guide (thin pink
            left rule, left-aligned italic text, no centered uppercase
            label), same max-w-2xl width as that guide's own tip, per this
            step's explicit request to reuse that exact component/styling
            rather than the previous centered label+text version. */}
        <Reveal delay={0.1} className='mt-10 md:mt-12 max-w-2xl mx-auto'>
          <InlineTip>
            My tip: Based on our experience, I&apos;d skip the app and buy a
            physical T-mobilitat card directly at a metro station.
          </InlineTip>
        </Reveal>

        {/* Barcelona_tiquets_web.jpeg -- the metro ticket machine, shown
            uncropped at its own natural (very tall) portrait aspect ratio,
            same width/height pattern as the taxi photo in
            transfer-to-hotel-section.tsx. Narrower container than the
            site's landscape photos (max-w-[280px] sm:max-w-sm, versus
            max-w-5xl md:max-w-3xl for the Austrian Airlines/taxi photos),
            per this step's explicit request -- same "deliberately
            narrower so it reads as secondary" principle as Tenerife's own
            Ryanair photo. Small uppercase caption underneath, same style
            as the La Spezia pizzeria photo's caption in app/italy/page.tsx. */}
        <Reveal delay={0.15} className='mt-12 md:mt-14 max-w-[280px] sm:max-w-sm mx-auto'>
          <div className='relative w-full overflow-hidden rounded-[2px]'>
            <Image
              src='/2026-10%20-%20Barcelona/Barcelona_tiquets_web.jpeg'
              alt='A TMB metro ticket machine at a Barcelona metro station, with the Tiquets signage overhead.'
              width={2921}
              height={5340}
              sizes='(min-width: 640px) 384px, 70vw'
              className='w-full h-auto'
            />
          </div>
          <p className='mt-3 text-center text-xs uppercase tracking-[0.18em] font-[family-name:var(--font-poppins)] font-semibold text-black/40 dark:text-white/40'>
            Metro ticket machine · Barcelona
          </p>
        </Reveal>
      </section>

      {/* 7. COMING SOON — placeholder continuation, not a real chapter;
          see the hero comment above. */}
      <main className='flex-1 flex flex-col items-center justify-center text-center px-6 py-24 md:py-32'>
        <Reveal className='max-w-xl mx-auto flex flex-col items-center'>
          <p className='text-2xl md:text-3xl italic font-[family-name:var(--font-playfair)] font-medium text-black dark:text-white leading-snug'>
            Coming soon.
          </p>
          <p className='mt-4 text-base md:text-lg font-[family-name:var(--font-poppins)] font-light text-black/70 dark:text-white/70'>
            The full travel story is on its way.
          </p>
          <Link
            href='/#barcelona'
            className='mt-16 md:mt-20 inline-flex items-center min-h-11 py-2 text-sm font-[family-name:var(--font-poppins)] font-medium text-black/70 dark:text-white/70 hover:text-black dark:hover:text-white hover:underline underline-offset-4'
          >
            ← Back to destinations
          </Link>
        </Reveal>
      </main>

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
            className='inline-flex items-center px-2 text-sm font-[family-name:var(--font-poppins)] uppercase tracking-wide text-white/80 hover:text-white'
          >
            Travels
          </Link>
          <Link
            href='/#guides'
            className='inline-flex items-center px-2 text-sm font-[family-name:var(--font-poppins)] uppercase tracking-wide text-white/80 hover:text-white'
          >
            Behind the Trip
          </Link>
          <Link
            href='/about'
            className='inline-flex items-center px-2 text-sm font-[family-name:var(--font-poppins)] uppercase tracking-wide text-white/80 hover:text-white'
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
          © {new Date().getFullYear()} Metkish
        </p>
      </footer>
    </div>
  );
}
