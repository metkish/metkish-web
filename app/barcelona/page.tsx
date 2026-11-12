'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { InstagramIcon, PinterestIcon } from '@/components/ui/social-icons';
import { INSTAGRAM_URL, PINTEREST_URL } from '@/lib/social-links';
import { ChapterHeading, Paragraphs } from '@/components/ui/typography';
import WhyViennaSection from '@/components/journey/why-vienna-section';
import FlightSection from '@/components/journey/flight-section';
import TransferToHotelSection from '@/components/journey/transfer-to-hotel-section';
import { RouteLabel, TimeStamp } from '@/components/journey/annotation-kit';
import BookedChecklist from '@/components/ui/booked-checklist';
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
// Same "inline tip" treatment as components/guides/el-clasico-tickets-article.tsx's
// own InlineTip ("My tip: Apply well in advance" in the FC Barcelona guide):
// a thin pink left rule, left-aligned italic text, no label, no background --
// copied here verbatim (same classes) rather than imported, since it's a
// small one-off presentational helper local to each page, same as Reveal/
// ChapterHeading/Paragraphs above.
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

// Same "moving photograph" treatment as Tenerife's Hotel_beach.mp4 (muted,
// looped, no controls, no sound, no decorative overlay) -- with one
// addition this site hasn't needed before: pausing once the clip scrolls
// out of view, so a background loop doesn't keep decoding on a long page
// after the visitor has moved on. An IntersectionObserver drives real
// video.play()/video.pause() calls instead of the plain `autoPlay`
// attribute (which only ever fires once, on load, and never pauses) --
// the same "observer triggers playback" shape JourneyMapScene already
// uses elsewhere on this site for its own map animations, just applied
// here to a <video> instead of a GSAP timeline. play() is wrapped in a
// no-op catch because some browsers can reject an autoplay call that
// races their own loading/user-gesture checks; muted+loop+playsInline
// keeps it eligible for autoplay everywhere, including iOS Safari.
function ViewportVideo({
  src,
  className,
}: {
  src: string;
  className?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          void video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { threshold: 0.25 }
    );
    observer.observe(video);

    return () => observer.disconnect();
  }, []);

  return (
    <video
      ref={videoRef}
      src={src}
      muted
      loop
      playsInline
      preload='metadata'
      aria-hidden='true'
      className={className}
    />
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
          // Mobile performance fix: this photo's dense stonework/foliage
          // texture is high-entropy and barely shrinks under format
          // changes alone (tested directly: WebP q75 ~525KB vs q65
          // ~480KB for this image), and at the ~1200px-wide srcset entry
          // a phone actually requests, that single file is the dominant
          // cost behind this page's mobile LCP. 65 (down from the
          // default 75) trims that without a perceptible quality loss --
          // safe specifically here because the flat bg-black/28 wash
          // below already sits over the whole photo for text legibility,
          // masking the extra compression. This was the first hero on
          // this site to have its quality lowered; Rome and Tenerife's
          // heroes later got the same treatment once real production
          // data showed the identical pattern there.
          quality={65}
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
        introText={[
          'Close enough to drive, with plenty of flight options.',
          'This time, it was all about the schedule: a direct flight to Barcelona at 7 AM on a Saturday. An early start, but almost a full day in the city ahead of us. What more could we ask for?',
        ]}
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
          <ChapterHeading as='h2' italic className='mt-8 md:mt-10'>
            Location over luxury
          </ChapterHeading>
          {/* The rating is the body text's own last line, not a separate
              score widget or badge -- a personal aside, not a Booking.com-
              style review score, per this step's explicit instruction. */}
          <Paragraphs
            className='mt-5 text-center'
            items={[
              <>
                We stayed at ICON BCN, just a short walk from Plaça de
                Catalunya. The{' '}
                <Link
                  href='/behind-the-trip/hotels'
                  className='underline underline-offset-2'
                >
                  location
                </Link>{' '}
                was easily the best thing about this hotel.
              </>,
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
          <ChapterHeading as='h3' italic>The little things we remember</ChapterHeading>
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
          <ChapterHeading as='h2' italic className='mt-8 md:mt-10'>
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

      {/* 7. EXPLORING BARCELONA -- same hand-authored shape as THE HOTEL
          and GETTING AROUND above (RouteLabel -> italic ChapterHeading),
          but here the landscape photo sits directly below the heading,
          before the body text, rather than after it -- label, heading,
          photo, then all the text. This is a photo -> new chapter
          transition (the ticket-machine photo above closes "Getting
          Around"), so it reuses the same CHAPTER_GAP_START as every other
          photo -> new chapter opening on this page.
          Barcelona_La_Rambla_web.jpeg is the same EXIF-rotation /
          single-frame-RGB fix applied to every other phone-camera photo on
          the site (see the hero comment above); the original,
          Barcelona_La Rambla.jpeg, is untouched. The photo uses the same
          landscape-photo container as the rest of the site (see
          components/journey/flight-section.tsx's own experience-photo
          comment: max-w-5xl md:max-w-3xl mx-auto, aspect-[4/3] on mobile
          and 16:9 on desktop, object-cover, no custom object-position --
          the source is natively 4:3, so mobile shows the full, uncropped
          frame and only the desktop 16:9 crop trims a little off the top
          and bottom, evenly, which here is just sky/tree canopy above and
          construction debris below, not the fencing, signage or people
          that carry the "construction site" story). The label/heading and
          the body text are split into their own Reveal blocks (rather than
          one block containing everything, as other sections on this page
          do) purely so the wider photo Reveal can sit between them at its
          own width; the text itself is unchanged. No other photos or
          sections are added, and nothing else on the page changes. */}
      <section className={`px-6 md:px-12 ${CHAPTER_GAP_START} pb-16 md:pb-20 bg-[#faf9f6] dark:bg-black`}>
        <Reveal className='max-w-2xl mx-auto text-center'>
          <RouteLabel>Exploring Barcelona</RouteLabel>
          <ChapterHeading as='h2' italic className='mt-8 md:mt-10'>
            Not quite how I remembered it
          </ChapterHeading>
        </Reveal>

        <Reveal delay={0.1} className='mt-10 md:mt-12 max-w-5xl md:max-w-3xl mx-auto'>
          <div className='relative w-full overflow-hidden rounded-[2px] aspect-[4/3] md:aspect-[16/9]'>
            <Image
              src='/2026-10%20-%20Barcelona/Barcelona_La_Rambla_web.jpeg'
              alt="Construction fencing and a 'La Rambla renovation' sign along a cordoned-off section of La Rambla, Barcelona, with pedestrian signage, trees and building facades beyond."
              fill
              sizes='(min-width: 768px) 768px, 100vw'
              className='object-cover'
            />
          </div>
        </Reveal>

        <Reveal delay={0.15} className='mt-14 md:mt-16 max-w-2xl mx-auto'>
          <Paragraphs
            className='text-center'
            items={[
              'After checking into our hotel, we headed towards Plaça de Catalunya and continued down La Rambla.',
              "It didn't take long to realise this wasn't quite the Barcelona I remembered.",
              'There was a protest camp in Plaça de Catalunya, La Rambla was one big construction site, and the crowds were overwhelming.',
              'Not exactly the first impression I had expected.',
              "After exploring the city centre, we took the metro to the FC Barcelona stadium to buy a few things for the next day's El Clásico. The crowds there were unbelievable too.",
              "Back at the hotel, my daughter and I decided to do some shopping. We were staying right in the middle of Barcelona's shopping district, after all. But I'd never seen stores so packed with people.",
              'We had already noticed police officers everywhere throughout the day. By evening, things started getting tense.',
              'At one point, we were stuck inside a store because of disturbances outside. When we were finally able to leave, we found ourselves surrounded by groups of young men running through the streets and threatening to attack shops.',
              'We made it back to the hotel safely, but the night was anything but peaceful. A helicopter kept circling overhead, and the following day we read reports of damage to shops and streets.',
              'Quite a first day in Barcelona.',
            ]}
          />
        </Reveal>
      </section>

      {/* 8. THE SECOND DAY -- same shape as EXPLORING BARCELONA above
          (bare pink divider line -> italic ChapterHeading -> landscape
          photo -> Paragraphs, photo directly below the heading, before
          the body text). This chapter has no uppercase eyebrow/label text
          above the heading -- by request, only the small pink decorative
          line is kept (the same line RouteLabel renders internally,
          reproduced here directly without its <p> label) sitting right
          above the heading, exactly as it would under a label. This is a
          text -> new chapter transition (the first-day story above ends
          in running body text, not a photo or video), so, per the
          Tenerife editorial system's own transition rules, it uses the
          FULL chapter-to-chapter gap rather than CHAPTER_GAP_START alone:
          extra pt on top of CHAPTER_GAP_START, matching the weight of a
          genuine new-chapter beat rather than a continuation.
          Barcelona_Sea_web.jpeg is the same EXIF-rotation / single-frame-
          RGB fix as every other phone-camera photo on the site; the
          original, Barcelona_Sea.jpeg, is untouched. Same landscape-photo
          container/crop as the La Rambla photo above and
          components/journey/flight-section.tsx's own experience photo:
          max-w-5xl md:max-w-3xl mx-auto, aspect-[4/3] mobile / 16:9
          desktop, object-cover, no custom object-position -- the source is
          natively 4:3, so mobile shows the full frame and the desktop crop
          only trims a little empty sky above and pavement below, evenly,
          keeping the full run of palm trees and the marina in frame. No
          other photos or sections are added, and nothing above this point
          changes. */}
      <section className={`px-6 md:px-12 pt-20 md:pt-24 ${CHAPTER_GAP_START} pb-16 md:pb-20 bg-[#faf9f6] dark:bg-black`}>
        <Reveal className='max-w-2xl mx-auto text-center'>
          <span className='mx-auto block h-0.5 w-8 bg-pink-300 dark:bg-pink-400/60' />
          <ChapterHeading as='h3' italic className='mt-8 md:mt-10'>
            Why I fell in love with Barcelona in the first place
          </ChapterHeading>
        </Reveal>

        <Reveal delay={0.1} className='mt-10 md:mt-12 max-w-5xl md:max-w-3xl mx-auto'>
          <div className='relative w-full overflow-hidden rounded-[2px] aspect-[4/3] md:aspect-[16/9]'>
            <Image
              src='/2026-10%20-%20Barcelona/Barcelona_Sea_web.jpeg'
              alt="A palm-tree-lined promenade along Barcelona's harbour, boats moored in the marina, under a clear blue sky."
              fill
              sizes='(min-width: 768px) 768px, 100vw'
              className='object-cover'
            />
          </div>
        </Reveal>

        <Reveal delay={0.15} className='mt-14 md:mt-16 max-w-2xl mx-auto'>
          <Paragraphs
            className='text-center'
            items={[
              'After everything that happened on our first day, the next morning reminded me why I fell in love with Barcelona in the first place.',
              'We headed towards the sea, and suddenly everything felt different. The palm trees, the sunshine, the atmosphere — it was like paradise.',
              'Later, we enjoyed tapas in the Gothic Quarter, and in the evening, the biggest match of them all was waiting for us. El Clásico.',
              'A perfect day. Or so we thought.',
            ]}
          />
        </Reveal>

        {/* El Clásico -- a short subsection within THE SECOND DAY chapter,
            not a new chapter of its own: no pink line/eyebrow of its own
            (same "sub-beat" logic as the Tenerife rental-car chapter's
            second Eyebrow/ChapterHeading beat -- only a chapter's own
            opening heading gets the pink line), just a heading directly
            below the paragraphs above. mt-14/16 matches the weight of the
            other "extra beat within a chapter" gaps already used on this
            page (see GETTING AROUND's own paragraphs -> InlineTip -> photo
            progression). Heading -> Paragraphs (mt-5, the same spacing
            used after every other ChapterHeading on this page) -> photo
            -> link, in that exact order per this step's request.
            Barcelona_el_clasico_web.jpeg is the same EXIF-rotation /
            single-frame-RGB fix as every other phone-camera photo on the
            site; the original, "Barcelona_el clasico.jpeg", is untouched.
            Same responsive landscape-photo container as the Sea/La Rambla
            photos above (max-w-5xl md:max-w-3xl mx-auto, aspect-[4/3]
            mobile / 16:9 desktop, object-cover, no custom object-position)
            -- the source is natively 4:3, so mobile shows the whole
            stadium bowl uncropped, and the desktop 16:9 crop only trims a
            sliver of the dark lighting rig above and the nearest
            spectators' heads below, keeping the full pitch and stands (the
            actual "full stadium view") intact. The link below it reuses
            the exact "Read →" link styling and Link component from the
            homepage's Behind the Trip cards (app/page.tsx), pointed at
            this guide's real published route (lib/behind-the-trip.ts's
            'el-clasico-tickets' slug -> /behind-the-trip/el-clasico-
            tickets, rendered by components/guides/el-clasico-tickets-
            article.tsx) rather than repeating that article's own detailed
            ticket-buying story here. */}
        <Reveal delay={0.2} className='mt-14 md:mt-16 max-w-2xl mx-auto text-center'>
          <ChapterHeading as='h3' italic>
            The match we&apos;d been waiting for
          </ChapterHeading>
          <Paragraphs
            className='mt-5 text-center'
            items={[
              'El Clásico was the main reason we came to Barcelona. After months of planning and some seriously expensive tickets, we were finally there.',
              'The atmosphere was incredible. The result? Not so much.',
              "But that's football.",
            ]}
          />
        </Reveal>

        <Reveal delay={0.25} className='mt-10 md:mt-12 max-w-5xl md:max-w-3xl mx-auto'>
          <div className='relative w-full overflow-hidden rounded-[2px] aspect-[4/3] md:aspect-[16/9]'>
            <Image
              src='/2026-10%20-%20Barcelona/Barcelona_el_clasico_web.jpeg'
              alt='A packed Spotify Camp Nou under the floodlights during El Clásico, FC Barcelona against Real Madrid.'
              fill
              sizes='(min-width: 768px) 768px, 100vw'
              className='object-cover'
            />
          </div>
        </Reveal>

        <Reveal delay={0.3} className='mt-6 md:mt-8 text-center'>
          <Link
            href='/behind-the-trip/el-clasico-tickets'
            className='inline-flex items-center min-h-11 py-2 text-sm font-[family-name:var(--font-poppins)] font-medium text-black dark:text-white hover:underline underline-offset-4'
          >
            Read our El Clásico experience →
          </Link>
        </Reveal>
      </section>

      {/* 9. SAGRADA FAMÍLIA -- a genuine new chapter (full RouteLabel, like
          THE HOTEL / GETTING AROUND / EXPLORING BARCELONA above), unlike
          THE SECOND DAY and its El Clásico subsection, which deliberately
          have no label of their own. The section immediately above closes
          on the "Read our El Clásico experience" link -- a short line of
          text, not a photo -- so, per the same text -> new chapter logic
          already used for THE SECOND DAY's own opening, this uses the
          FULL chapter-to-chapter gap (extra pt on top of CHAPTER_GAP_START)
          rather than CHAPTER_GAP_START alone.
          RouteLabel -> italic ChapterHeading -> Paragraphs all share one
          Reveal, same shape as THE HOTEL/GETTING AROUND. Then, in the
          exact order requested: the interior ceiling photo, the ticket
          price card, the InlineTip aside, and the Nativity Tower view.
          Both photos are portrait, so -- like the taxi photo in
          transfer-to-hotel-section.tsx -- they use the same outer
          max-w-5xl md:max-w-3xl mx-auto width as this page's landscape
          photos, but shown at their own natural aspect ratio (explicit
          width/height, w-full h-auto, no aspect-ratio box, no
          object-cover) rather than cropped into a fixed box, so nothing
          -- including the ceiling in the first photo -- is cropped away.
          Barcelona_Sagrada_Familia1_web.jpeg and ..._Familia2_web.jpeg are
          the same EXIF-rotation / single-frame-RGB fix as every other
          phone-camera photo on the site (the second photo also needed an
          actual 90° rotation, unlike the others so far, since its raw
          EXIF orientation was 6); the originals, "Barcelona_Sagrada
          Familia1.jpeg" and "Barcelona_Sagrada Familia2.jpeg", are
          untouched.
          The price card reuses the exact same beige practical-information
          panel as the hotel/flight cards elsewhere on this page (bg-
          [#f1ebdc], max-w-[460px], TimeStamp for the headline figure, the
          same uppercase-label/plain-value span alternation) -- no new
          card design, just more line items than the simpler hotel card,
          grouped the same way the flight card groups "Checked luggage"
          under its own label. Per this step's explicit instruction, no
          extra labels or decoration were invented beyond what was given.
          The InlineTip below it is the exact same local component used
          for "My tip: Apply well in advance" in GETTING AROUND above
          (thin pink left rule, left-aligned italic text, no background,
          no uppercase label) -- reused verbatim, not redesigned, per this
          step's explicit instruction. */}
      <section className={`px-6 md:px-12 pt-20 md:pt-24 ${CHAPTER_GAP_START} pb-16 md:pb-20 bg-[#faf9f6] dark:bg-black`}>
        <Reveal className='max-w-2xl mx-auto text-center'>
          <RouteLabel>Sagrada Família</RouteLabel>
          <ChapterHeading as='h2' italic className='mt-8 md:mt-10'>
            Even more impressive on the inside
          </ChapterHeading>
          <Paragraphs
            className='mt-5 text-center'
            items={[
              "On our first visit to Barcelona, we only admired the Sagrada Família from the outside. This time, we wanted to see the interior — and I'm so glad we did.",
              'We booked our tickets on 8 September, well ahead of our visit on 26 October. We also included access to the Nativity Tower, which turned out to be an excellent decision.',
              'The interior was incredible. Even the children were impressed, and it quickly became one of the highlights of our trip.',
            ]}
          />
        </Reveal>

        <Reveal delay={0.1} className='mt-14 md:mt-16 max-w-5xl md:max-w-3xl mx-auto'>
          <div className='relative w-full overflow-hidden rounded-[2px]'>
            <Image
              src='/2026-10%20-%20Barcelona/Barcelona_Sagrada_Familia1_web.jpeg'
              alt="Looking straight up at the Sagrada Família's interior ceiling, with its tree-like branching columns and star-shaped skylights."
              width={2662}
              height={3552}
              sizes='(min-width: 768px) 768px, 100vw'
              className='w-full h-auto'
            />
          </div>
        </Reveal>

        <Reveal delay={0.15} className='mt-10 md:mt-12 mx-auto max-w-[460px] rounded-[3px] bg-[#f1ebdc] dark:bg-white/[0.04] px-8 py-8 md:px-9 md:py-9 flex flex-col items-center gap-1 text-center'>
          <span className='text-xs uppercase tracking-[0.18em] font-[family-name:var(--font-poppins)] font-semibold text-black/45 dark:text-white/45'>
            Sagrada Família · 26 October 2026
          </span>
          <TimeStamp size='md'>€106.00</TimeStamp>
          <span className='mt-4 text-sm font-[family-name:var(--font-poppins)] text-black/60 dark:text-white/60'>
            Basilica entrance + Nativity Tower
          </span>
          <div className='mt-4 flex flex-col items-center gap-1'>
            <span className='text-sm font-[family-name:var(--font-poppins)] text-black/60 dark:text-white/60'>
              2 adults · €36 each
            </span>
            <span className='text-sm font-[family-name:var(--font-poppins)] text-black/60 dark:text-white/60'>
              1 under 30 · €34
            </span>
            <span className='text-sm font-[family-name:var(--font-poppins)] text-black/60 dark:text-white/60'>
              1 child under 11 · Free
            </span>
          </div>
          <span className='mt-4 text-sm font-[family-name:var(--font-poppins)] text-black/60 dark:text-white/60'>
            Booked: 8 September 2026
          </span>
          <div className='mt-4 flex flex-col items-center gap-1'>
            <span className='text-sm font-[family-name:var(--font-poppins)] text-black/60 dark:text-white/60'>
              Basilica entry: 15:00
            </span>
            <span className='text-sm font-[family-name:var(--font-poppins)] text-black/60 dark:text-white/60'>
              Nativity Tower: 15:45
            </span>
          </div>
        </Reveal>

        <Reveal delay={0.2} className='mt-12 md:mt-14 max-w-2xl mx-auto'>
          <InlineTip>
            My tip: Book your tickets well in advance, especially if you
            want to visit one of the towers. We booked ours almost seven
            weeks before our visit, and I would definitely recommend
            including the tower experience.
          </InlineTip>
        </Reveal>

        <Reveal delay={0.25} className='mt-12 md:mt-14 max-w-5xl md:max-w-3xl mx-auto'>
          <div className='relative w-full overflow-hidden rounded-[2px]'>
            <Image
              src='/2026-10%20-%20Barcelona/Barcelona_Sagrada_Familia2_web.jpeg'
              alt='The view from the Sagrada Família Nativity Tower, looking down through an iron grille over Parc de la Ciutadella and the Barcelona skyline.'
              width={4284}
              height={5712}
              sizes='(min-width: 768px) 768px, 100vw'
              className='w-full h-auto'
            />
          </div>
        </Reveal>
      </section>

      {/* 10. MONTJUÏC -- another genuine new chapter (full RouteLabel), same
          shape as SAGRADA FAMÍLIA above. The section immediately before
          this one closes on the Nativity Tower photo, so (per this page's
          own photo -> new chapter rule) this uses CHAPTER_GAP_START alone,
          not the heavier full gap SAGRADA FAMÍLIA needed.
          RouteLabel -> italic ChapterHeading -> Paragraphs share one
          Reveal (same shape as THE HOTEL/SAGRADA FAMÍLIA), then, in the
          order requested: the cable car price card, the clip, the two
          closing paragraphs, and the InlineTip.
          Barcelona_Montjuic_web.mp4 is a re-encoded, web-optimised
          derivative of the original Barcelona_Montjuic.MOV (scaled from
          1080x1920 to 720x1280 -- still an exact 9:16, so nothing is
          cropped -- H.264/yuv420p, faststart, audio track dropped since
          the clip is muted-by-design and will never be heard); the
          original file is completely untouched. It uses the exact same
          "moving photograph" container as Tenerife's own Hotel_beach.mp4
          (max-w-[240px] sm:max-w-xs md:max-w-md mx-auto, aspect-[9/16]),
          the only other autoplay/muted/looping video on the site, rather
          than stretching it to the page's full text width -- consistent
          with how this site already treats a vertical autoplay clip,
          same "contained by width, not stretched" principle as the metro
          ticket photo above. See the ViewportVideo helper above for the
          one addition beyond that existing pattern: it pauses once
          scrolled out of view.
          The price card reuses the exact same beige panel as every other
          price card on this page -- nothing beyond the four lines
          requested (no booking reference, no extra copy). The InlineTip
          below the closing paragraphs is the same local component used
          for "My tip: Apply well in advance" and the Sagrada Família tip
          above, reused verbatim. Per the explicit correction in this
          step's request: the queue was people waiting to go UP when we
          came back down around noon -- we did not wait in it ourselves. */}
      <section className={`px-6 md:px-12 ${CHAPTER_GAP_START} pb-16 md:pb-20 bg-[#faf9f6] dark:bg-black`}>
        <Reveal className='max-w-2xl mx-auto text-center'>
          <RouteLabel>Montjuïc</RouteLabel>
          <ChapterHeading as='h2' italic className='mt-8 md:mt-10'>
            Worth the Trip Up
          </ChapterHeading>
          <Paragraphs
            className='mt-5 text-center'
            items={[
              'We decided to spend the morning exploring Montjuïc, although getting there was a little more complicated than expected. We had some trouble finding the funicular at the metro station, which takes you up to the cable car station.',
              "Since we arrived before the cable car opened at 10 AM, we walked to the Olympic Stadium first. We couldn't go inside, but the surroundings were beautiful and well worth exploring.",
              "We had bought our return cable car tickets through Hola Barcelona with a 10% discount. There's no need to book in advance, though — tickets can also be purchased at the station, and they're not tied to a specific departure time.",
              'We boarded shortly after opening and barely had to wait — and with clear skies, the views over Barcelona were stunning.',
            ]}
          />
        </Reveal>

        <Reveal delay={0.1} className='mt-10 md:mt-12 mx-auto max-w-[460px] rounded-[3px] bg-[#f1ebdc] dark:bg-white/[0.04] px-8 py-8 md:px-9 md:py-9 flex flex-col items-center gap-1 text-center'>
          <span className='text-xs uppercase tracking-[0.18em] font-[family-name:var(--font-poppins)] font-semibold text-black/45 dark:text-white/45'>
            Montjuïc Cable Car · Return
          </span>
          <TimeStamp size='md'>€57.60</TimeStamp>
          <span className='mt-4 text-sm font-[family-name:var(--font-poppins)] text-black/60 dark:text-white/60'>
            2 adults + 2 children
          </span>
          <span className='text-sm font-[family-name:var(--font-poppins)] text-black/60 dark:text-white/60'>
            10% online discount included
          </span>
          <span className='mt-4 text-sm font-[family-name:var(--font-poppins)] text-black/60 dark:text-white/60'>
            26 October 2026
          </span>
        </Reveal>

        <Reveal delay={0.15} className='mt-12 md:mt-14 max-w-[240px] sm:max-w-xs md:max-w-md mx-auto'>
          <div className='relative w-full overflow-hidden rounded-[2px] aspect-[9/16]'>
            <ViewportVideo
              src='/2026-10%20-%20Barcelona/Barcelona_Montjuic_web.mp4'
              className='absolute inset-0 h-full w-full object-cover'
            />
          </div>
        </Reveal>

        <Reveal delay={0.2} className='mt-12 md:mt-14 max-w-2xl mx-auto'>
          <Paragraphs
            className='text-center'
            items={[
              "At the top, we skipped the castle and simply walked around its walls. It was a lovely walk, and we didn't feel we had missed anything by not going inside.",
              'When we came back down around noon, we saw an enormous queue at the bottom station — all those people were waiting to go UP. Luckily, we had already enjoyed our ride without the crowds.',
            ]}
          />
        </Reveal>

        <Reveal delay={0.25} className='mt-10 md:mt-12 max-w-2xl mx-auto'>
          <InlineTip>
            My tip: Visit Montjuïc early, ideally when the cable car opens.
            You can buy tickets on arrival, but booking through Hola
            Barcelona saved us 10%. And don&apos;t feel you need to enter
            the castle — the walk around its walls is beautiful on its
            own.
          </InlineTip>
        </Reveal>
      </section>

      {/* 11. PARK GÜELL -- another genuine new chapter (full RouteLabel),
          same shape as SAGRADA FAMÍLIA/MONTJUÏC above. The section
          immediately before this one closes on the Montjuïc InlineTip --
          text, not a photo -- so, per this page's own text -> new chapter
          rule, it uses the full chapter-to-chapter gap (extra pt on top
          of CHAPTER_GAP_START), same as SAGRADA FAMÍLIA's own opening.
          Unlike every other chapter on this page, the photo here sits
          directly below the heading with NO text before it (RouteLabel +
          ChapterHeading share one small Reveal on their own), per this
          step's explicit "photo before the text" order -- all five
          paragraphs come after the photo instead.
          Barcelona_Park_Guell_web.jpeg is the same EXIF-fix as every
          other phone photo on the site (orientation was already 1, so no
          rotation was needed, just the usual single-frame-RGB
          conversion); the original, "Barcelona_Park Guell.jpeg" (found on
          the Desktop, same as the La Rambla photo earlier, and copied
          into this folder), is untouched. This photo uses the natural-
          proportion, uncropped container (max-w-5xl md:max-w-3xl mx-auto,
          explicit width/height, w-full h-auto, no aspect-ratio box, no
          object-cover) rather than this page's usual cropped 4:3/16:9 box
          -- the same choice already made for both Sagrada Família photos
          -- specifically because a center 16:9 crop here would cut into
          the crowd filling the bottom of the frame, which this step
          explicitly asks not to happen; this way neither the staircase
          nor the crowd is ever cropped, at any breakpoint.
          The price card below the text reuses the exact same beige panel
          as every other price card on this page, with only the six lines
          given (no booking reference, nothing extra). The InlineTip after
          it is the same local component reused verbatim throughout this
          page (thin pink left rule, left-aligned italic text, no
          background, no label).
          Per this step's explicit tone instruction, the paragraphs stay
          personal and candidly a little disappointed -- not rewritten
          into a generic positive review -- and make no claim about what
          happens after a 30-minute late arrival, since that was never
          actually tested. No historical or general tourist information
          was added beyond what was given, and no ticket screenshots are
          referenced or included anywhere here. */}
      <section className={`px-6 md:px-12 pt-20 md:pt-24 ${CHAPTER_GAP_START} pb-16 md:pb-20 bg-[#faf9f6] dark:bg-black`}>
        <Reveal className='max-w-2xl mx-auto text-center'>
          <RouteLabel>Park Güell</RouteLabel>
          <ChapterHeading as='h2' italic className='mt-8 md:mt-10'>
            Not Quite as Magical This Time
          </ChapterHeading>
        </Reveal>

        <Reveal delay={0.1} className='mt-10 md:mt-12 max-w-5xl md:max-w-3xl mx-auto'>
          <div className='relative w-full overflow-hidden rounded-[2px]'>
            <Image
              src='/2026-10%20-%20Barcelona/Barcelona_Park_Guell_web.jpeg'
              alt='A crowd climbing the mosaic-tiled staircase toward the Hypostyle Room at Park Güell, under a clear blue sky.'
              width={5712}
              height={4284}
              sizes='(min-width: 768px) 768px, 100vw'
              className='w-full h-auto'
            />
          </div>
        </Reveal>

        <Reveal delay={0.15} className='mt-14 md:mt-16 max-w-2xl mx-auto'>
          <Paragraphs
            className='text-center'
            items={[
              "After a morning on Montjuïc, we headed to Park Güell. But with all the walking we'd already done and the afternoon heat, we were starting to feel tired.",
              'The walk from the metro station to the park was longer than expected. And once we arrived, we were met with yet another enormous crowd.',
              'We had tickets for 2:30 PM but were allowed in an hour early without any problems.',
              "I remember being absolutely amazed by Park Güell on my first visit to Barcelona. This time, I just didn't feel the same. Maybe it was the heat, the tired legs or simply the number of people everywhere.",
              "We didn't stay very long.",
            ]}
          />
        </Reveal>

        <Reveal delay={0.2} className='mt-10 md:mt-12 mx-auto max-w-[460px] rounded-[3px] bg-[#f1ebdc] dark:bg-white/[0.04] px-8 py-8 md:px-9 md:py-9 flex flex-col items-center gap-1 text-center'>
          <span className='text-xs uppercase tracking-[0.18em] font-[family-name:var(--font-poppins)] font-semibold text-black/45 dark:text-white/45'>
            Park Güell · 27 October 2026
          </span>
          <TimeStamp size='md'>€63.00</TimeStamp>
          <span className='mt-4 text-sm font-[family-name:var(--font-poppins)] text-black/60 dark:text-white/60'>
            2 adults × €18.00
          </span>
          <span className='text-sm font-[family-name:var(--font-poppins)] text-black/60 dark:text-white/60'>
            2 children × €13.50
          </span>
          <span className='mt-4 text-sm font-[family-name:var(--font-poppins)] text-black/60 dark:text-white/60'>
            Entry time: 14:30
          </span>
          <span className='text-sm font-[family-name:var(--font-poppins)] text-black/60 dark:text-white/60'>
            Booked: 17 October 2026
          </span>
        </Reveal>

        <Reveal delay={0.25} className='mt-10 md:mt-12 max-w-2xl mx-auto'>
          <InlineTip>
            My tip: Park Güell requires a ticket, something I hadn&apos;t
            realised until shortly before our trip. We booked ours just
            ten days in advance, but I&apos;d recommend booking earlier.
            And if possible, visit in the morning rather than after an
            already exhausting day of sightseeing.
          </InlineTip>
        </Reveal>
      </section>

      {/* 12. MONTSERRAT -- another genuine new chapter (full RouteLabel),
          same shape as the chapters above. The section before this one
          closes on the Park Güell InlineTip -- text, not a photo -- so,
          per this page's own text -> new chapter rule, it uses the full
          chapter-to-chapter gap, same as SAGRADA FAMÍLIA/PARK GÜELL's own
          openings.
          Order follows this step's own section headings literally:
          RouteLabel + ChapterHeading, then all seven paragraphs, then
          both photos (the mountain first, "displayed prominently", then
          the railway train as a secondary/supporting photo), then the
          cost card, then the InlineTip.
          Barcelona_Montserrat_web.jpeg and ..._railway_web.jpeg are the
          same EXIF-rotation / single-frame-RGB fix as every other phone
          photo on the site (both needed the actual 90° rotation -- their
          raw EXIF orientation was 6, same as the Sagrada Família tower
          photo); the originals are untouched. Despite "main landscape
          photo" in this step's own wording, both source photos are
          portrait (4284x5712, exactly 3:4), so -- consistent with how
          every other portrait photo on this page is already handled --
          the mountain photo uses the natural-proportion, uncropped
          container (max-w-5xl md:max-w-3xl mx-auto, explicit width/
          height, w-full h-auto, no object-cover) at the same prominent
          width as the Sagrada Família/Park Güell photos, while the
          railway photo uses the narrower "secondary" width already
          established for the metro ticket machine photo above
          (max-w-[280px] sm:max-w-sm mx-auto) rather than the mountain
          photo's full width, so it visibly reads as the supporting image
          it's described as. Per this step's explicit instruction, the
          ticket screenshot (Barcelona_Montserrat_ticket.jpeg) is not used
          anywhere on this page.
          The cost card reuses the exact same beige panel as every other
          price card on this page, reformatted into this page's own
          label/TimeStamp/caption shape (uppercase label, big price,
          plain caption line below) rather than literally pasting this
          step's one-line wording, since that's how every other card here
          already works -- still just the two facts given, nothing extra.
          The InlineTip below it is the same local component reused
          verbatim throughout this page. */}
      <section className={`px-6 md:px-12 pt-20 md:pt-24 ${CHAPTER_GAP_START} pb-16 md:pb-20 bg-[#faf9f6] dark:bg-black`}>
        <Reveal className='max-w-2xl mx-auto text-center'>
          <RouteLabel>Montserrat</RouteLabel>
          <ChapterHeading as='h2' italic className='mt-8 md:mt-10'>
            A Day Away from the City
          </ChapterHeading>
          <Paragraphs
            className='mt-5 text-center'
            items={[
              'After several busy days in Barcelona, we had one goal for our final full day: as little walking as possible.',
              'With a little help from AI, we planned a day trip to Montserrat. We took the metro to the train station and bought combined train and rack railway (cremallera) tickets for all four of us.',
              'And honestly, the journey itself was part of the experience. After days of walking, it felt wonderful to simply sit back and enjoy the scenery.',
              "Montserrat's unusual rock formations fascinated me. The rest of my family? Not quite as impressed.",
              'Once at the top, we enjoyed the views, stopped for something to eat and eventually headed back. We considered taking the funicular further up, but none of us really felt like it.',
              'We also skipped visiting the basilica, which I slightly regret now.',
            ]}
          />
        </Reveal>

        <Reveal delay={0.1} className='mt-14 md:mt-16 max-w-5xl md:max-w-3xl mx-auto'>
          <div className='relative w-full overflow-hidden rounded-[2px]'>
            <Image
              src='/2026-10%20-%20Barcelona/Barcelona_Montserrat_web.jpeg'
              alt="Montserrat's jagged rock formations rising above the monastery buildings clinging to the cliffside."
              width={4284}
              height={5712}
              sizes='(min-width: 768px) 768px, 100vw'
              className='w-full h-auto'
            />
          </div>
        </Reveal>

        <Reveal delay={0.15} className='mt-12 md:mt-14 max-w-[280px] sm:max-w-sm mx-auto'>
          <div className='relative w-full overflow-hidden rounded-[2px]'>
            <Image
              src='/2026-10%20-%20Barcelona/Barcelona_Montserrat_railway_web.jpeg'
              alt='A green Cremallera de Montserrat rack railway train signed for Montserrat, waiting at the platform.'
              width={4284}
              height={5712}
              sizes='(min-width: 640px) 384px, 70vw'
              className='w-full h-auto'
            />
          </div>
        </Reveal>

        <Reveal delay={0.2} className='mt-12 md:mt-14 mx-auto max-w-[460px] rounded-[3px] bg-[#f1ebdc] dark:bg-white/[0.04] px-8 py-8 md:px-9 md:py-9 flex flex-col items-center gap-1 text-center'>
          <span className='text-xs uppercase tracking-[0.18em] font-[family-name:var(--font-poppins)] font-semibold text-black/45 dark:text-white/45'>
            Train + Cremallera
          </span>
          <TimeStamp size='md'>€100.20</TimeStamp>
          <span className='mt-4 text-sm font-[family-name:var(--font-poppins)] text-black/60 dark:text-white/60'>
            Return tickets for four
          </span>
        </Reveal>

        <Reveal delay={0.25} className='mt-10 md:mt-12 max-w-2xl mx-auto'>
          <InlineTip>
            My tip: When buying your tickets at the station, you can
            choose between the rack railway (cremallera) and the cable car
            (Aeri de Montserrat). If you choose the cable car, get off at
            Montserrat-Aeri, one stop before Monistrol de Montserrat,
            where you change to the rack railway. Also, arrive early — our
            train was packed, and some passengers had to stand for almost
            an hour.
          </InlineTip>
        </Reveal>
      </section>

      {/* 13. ONE LAST THING ABOUT BARCELONA -- this page's genuine final
          chapter. The earlier "Coming soon" placeholder (see the hero
          comment above) is now gone: the full travel story is complete,
          and this step's own closing sentence is explicitly the final
          sentence of the entire page, so a "more is coming" placeholder
          below it would contradict that. The "Back to destinations" link
          is kept as ordinary site navigation, inside the same <main>
          flex-1 spacer landmark as before so the footer still sits at the
          bottom of the viewport on short pages.
          Previous section closes on the Montserrat InlineTip -- text, not
          a photo -- so, per this page's own text -> new chapter rule, it
          uses the full chapter-to-chapter gap, same as every other
          text-closed chapter opening on this page.
          Order follows this step's own section headings literally:
          RouteLabel + ChapterHeading, then the photo directly below the
          heading and before the text (per explicit instruction), then all
          eight paragraphs, then the non-clickable "Behind the Trip"
          article teaser, then the final closing sentence.
          Barcelona_La_Boqueria_web.jpeg is the same EXIF-transpose +
          single-frame-RGB fix as every other phone photo on this page
          (raw EXIF orientation was already 1, so only the RGB/
          single-frame conversion actually applied); the original is
          untouched. Natural dimensions are 3524x5712 (portrait), kept
          uncropped (explicit width/height, w-full h-auto, no fill, no
          object-cover) -- capped at max-w-[500px] (width: 100% of that
          500px parent, height: auto, so the aspect ratio is preserved
          exactly) rather than the page's usual full-width photo
          treatment, since this closing photo is meant to read as a
          modest editorial accent -- narrower than the max-w-2xl (672px)
          text column around it -- rather than another full-size hero
          image.
          The article teaser reads as an inline sentence -- "Curious how
          we did it? Read [How We Find Restaurants When Travelling -->]"
          -- with only the article title + arrow as the actual <Link>,
          rather than the page's usual standalone bold link treatment, so
          it sits quietly under the paragraphs instead of reading as its
          own call-to-action. The article now has real content (see
          components/guides/how-we-find-restaurants-article.tsx) but
          stays out of search via noindex metadata until it's ready to
          publish.
          The final closing sentence is this page's true closing line, so
          it borrows the hero's own short italic-Playfair sentiment
          treatment ("An island we could easily come back to." on
          Tenerife) rather than the smaller InlineTip/aside treatment,
          with extra margin-top for the "breathing room" explicitly asked
          for -- sized up (text-[22px] md:text-[25px], ~20-25% larger
          than the original text-lg/text-xl) so it reads as the page's
          final editorial statement rather than just another aside. */}
      <section className={`px-6 md:px-12 pt-20 md:pt-24 ${CHAPTER_GAP_START} pb-16 md:pb-20 bg-[#faf9f6] dark:bg-black`}>
        <Reveal className='max-w-2xl mx-auto text-center'>
          <RouteLabel>One Last Thing About Barcelona</RouteLabel>
          <ChapterHeading as='h2' italic className='mt-8 md:mt-10'>
            The Little Things We Loved
          </ChapterHeading>
        </Reveal>

        <Reveal delay={0.1} className='mt-10 md:mt-12 max-w-[500px] mx-auto'>
          <div className='relative w-full overflow-hidden rounded-[2px]'>
            <Image
              src='/2026-10%20-%20Barcelona/Barcelona_La_Boqueria_web.jpeg'
              alt='Colourful fruit stalls piled with dragon fruit, figs and fresh fruit cups inside La Boqueria Market.'
              width={3524}
              height={5712}
              sizes='(min-width: 768px) 500px, 100vw'
              className='w-full h-auto'
            />
          </div>
        </Reveal>

        <Reveal delay={0.15} className='mt-14 md:mt-16 max-w-2xl mx-auto'>
          <Paragraphs
            className='text-center'
            items={[
              'One place we kept returning to was La Boqueria Market.',
              "On our first visit to Barcelona, my husband and I weren't particularly impressed by it. This time, we ended up going almost every day.",
              "Our son fell in love with the chocolate-covered strawberries and wanted them every single day. We tried churros, which honestly weren't our favourite. Our daughter had an absolutely delicious jamón sandwich, and we even bought some Spanish cured meats to take home.",
              'Same market, completely different experience.',
              'And the food in Barcelona? We absolutely loved it.',
              'Every restaurant we visited in Barcelona turned out to be a great find. And surprisingly, we discovered them all with the help of AI.',
            ]}
          />
        </Reveal>

        <Reveal delay={0.2} className='mt-6 md:mt-7 max-w-2xl mx-auto text-center'>
          <p className='text-base font-[family-name:var(--font-poppins)] text-black/70 dark:text-white/70'>
            Curious how we did it? Read{' '}
            <Link
              href='/behind-the-trip/how-we-find-restaurants'
              className='text-black dark:text-white hover:underline underline-offset-4'
            >
              How We Find Restaurants When Travelling →
            </Link>
          </p>
        </Reveal>

        <Reveal delay={0.22} className='mt-10 md:mt-12 max-w-2xl mx-auto'>
          <Paragraphs
            className='text-center'
            items={[
              'A few times during the trip, we found ourselves properly lost — unsure which metro exit to take, or, at one point, trying to work out where the funicular up to Montjuïc actually was. On two separate occasions, someone simply noticed, came over without us asking, and pointed us the right way.',
              "Before the trip, we'd read a fair bit about Barcelona's anti-tourism protests and a city said to be growing tired of visitors. We understand the frustration behind that — overtourism is a real issue, and not one we'd dismiss. But it wasn't what we experienced. The people who stopped to help us clearly weren't thinking about any of that. They just saw we were lost and wanted to help.",
            ]}
          />
        </Reveal>

        <Reveal delay={0.25} className='mt-16 md:mt-20 max-w-2xl mx-auto text-center'>
          <p className='text-[22px] md:text-[25px] italic font-[family-name:var(--font-playfair)] text-black/80 dark:text-white/80 leading-snug'>
            Barcelona wasn&apos;t always easy this time around, but it gave us plenty of reasons to want to come back.
          </p>
        </Reveal>
      </section>

      {/* 14. BOOKED BEFORE WE LEFT -- the same reusable pre-trip checklist
          component Tenerife uses (components/ui/booked-checklist.tsx):
          centred RouteLabel (pink line + uppercase label), then the
          component's own small pink-checkmark list -- no new styling
          introduced here, exactly per instruction to reuse the existing
          component and design. This replaces the previous "Back to
          destinations" link entirely: this section is now the page's
          final content, sitting directly above the footer, the same
          layout shape as Tenerife's own closing section (no <main>
          spacer -- that was only ever needed to vertically centre the
          old "Coming soon" placeholder text, which is long gone).
          Top padding is CHAPTER_GAP_START alone, byte-identical to
          Tenerife's own BOOKED BEFORE WE LEFT section -- it previously
          also carried an extra pt-20/24 copied from a nearby section,
          which won the cascade over CHAPTER_GAP_START and, combined with
          the previous section's pb-20/24, produced a visibly larger gap
          than Tenerife's equivalent. The previous section's closing
          padding was reduced to pb-16/20 to match -- the same standard
          chapter-close value used throughout this page -- so the total
          gap above this section now equals Tenerife's exactly. The
          bottom follows Tenerife's own one-off override of
          CHAPTER_GAP_END (+50px) rather than the page's standard
          chapter-close padding, since -- like Tenerife's -- this section
          sits directly against the dark footer rather than another
          cream section.
          List is exactly what this step specified: flights, Vienna
          airport parking, hotel, El Clásico tickets, Sagrada Família +
          Nativity Tower tickets, Park Güell tickets. Montserrat, the
          Montjuïc cable car and metro tickets are deliberately excluded
          per explicit instruction, since those were bought during the
          trip rather than booked beforehand. */}
      <section className={`px-6 md:px-12 ${CHAPTER_GAP_START} pb-[calc(3rem+50px)] md:pb-[calc(3.5rem+50px)] bg-[#faf9f6] dark:bg-black`}>
        <Reveal className='mx-auto'>
          <BookedChecklist
            items={[
              'Flights',
              'Airport parking in Vienna',
              'Hotel',
              'El Clásico tickets',
              'Sagrada Família + Nativity Tower tickets',
              'Park Güell tickets',
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
