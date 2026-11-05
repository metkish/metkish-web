'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { InstagramIcon, PinterestIcon } from '@/components/ui/social-icons';
import { INSTAGRAM_URL, PINTEREST_URL } from '@/lib/social-links';
import DepartureAirportsMap from '@/components/journey/DepartureAirportsMap';
import { DEPARTURE_AIRPORTS, DEPARTURE_AIRPORTS_HOME } from '@/lib/journeys/flights-departure-airports';

const LOGO_SRC = '/metkish-logo.png';

const FLIGHTS_BASE = '/Behind%20the%20trip/Flights';
const NIGHT_BOARDING_SRC = `${FLIGHTS_BASE}/Airplane%20at%20night.jpeg`;
const CABIN_SEATS_SRC = `${FLIGHTS_BASE}/Aiplane.jpeg`;
// Genuine screenshots the user captured herself from Skyscanner and
// Turkish Airlines' own site while researching this exact Ljubljana ->
// Bangkok search -- same Screenshot/Lightbox treatment as every
// screenshot in hotels-article.tsx. (On-disk filenames keep their
// original spelling -- "Scyscanner.png", "Turkish_airnines.png".)
const SKYSCANNER_SRC = `${FLIGHTS_BASE}/Scyscanner.png`;
const TURKISH_AIRLINES_SRC = `${FLIGHTS_BASE}/Turkish_airnines.png`;

// Same fade-up-on-scroll rhythm used throughout the site (About, Italy,
// Tenerife, the other Behind the Trip articles): once-only, generous
// viewport threshold, no bounce. Duplicated locally rather than imported,
// following this codebase's established per-page convention.
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

// Major article section marker -- byte-identical to the same component in
// hotels-article.tsx / el-clasico-tickets-article.tsx /
// how-we-find-restaurants-article.tsx (same Playfair scale as every
// chapter opener on Italy/Tenerife), duplicated locally per this
// codebase's established per-page convention.
function SectionHeading({ children }: { children: ReactNode }) {
  return (
    <h2 className='text-3xl md:text-4xl font-[family-name:var(--font-playfair)] font-medium text-black dark:text-white'>
      {children}
    </h2>
  );
}

// In-section sub-heading -- byte-identical to hotels-article.tsx's
// SubHeading (same Eyebrow-style visual treatment, rendered as a real
// <h3> for genuine heading semantics). Used for a short subdivision
// without its own real narrative (e.g. "Checked Luggage").
function SubHeading({ children }: { children: ReactNode }) {
  return (
    <h3 className='mt-10 md:mt-12 text-sm md:text-[0.95rem] uppercase tracking-[0.18em] font-[family-name:var(--font-poppins)] font-semibold text-black/60 dark:text-white/60'>
      {children}
    </h3>
  );
}

// Subsection heading for a substantial sub-story within a section -- a
// real serif heading (not a small uppercase label), sized between
// SectionHeading and the small uppercase SubHeading above. Byte-identical
// to hotels-article.tsx's SubsectionHeading. Used only where a
// sub-heading introduces real narrative weight (e.g. "Choosing Our
// Seats", with its own run of paragraphs and a specific incident).
function SubsectionHeading({ children }: { children: ReactNode }) {
  return (
    <h3 className='mt-12 md:mt-14 text-2xl md:text-3xl font-[family-name:var(--font-playfair)] font-medium text-black dark:text-white'>
      {children}
    </h3>
  );
}

// Small uppercase kicker/label -- the same token used site-wide, for the
// "Behind the Trip · Guide" breadcrumb above the title.
function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <span className='block text-sm md:text-[0.95rem] uppercase tracking-[0.18em] font-[family-name:var(--font-poppins)] font-semibold text-black/60 dark:text-white/60'>
      {children}
    </span>
  );
}

// Body copy -- byte-identical to hotels-article.tsx's Paragraphs
// component (left-aligned editorial column), duplicated locally per this
// codebase's established per-page convention.
function Paragraphs({ items }: { items: ReactNode[] }) {
  return (
    <div className='space-y-4'>
      {items.map((content, i) => (
        <p
          key={i}
          className='text-base md:text-lg font-[family-name:var(--font-poppins)] font-light text-black/80 dark:text-white/80 leading-relaxed'
        >
          {content}
        </p>
      ))}
    </div>
  );
}

// What the shared lightbox at the bottom of this page needs to render
// whichever screenshot was last clicked. Byte-identical to
// hotels-article.tsx's LightboxImage type.
type LightboxImage = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

// A real screenshot (Skyscanner, an airline's own site): bordered/shadow
// treatment byte-identical to hotels-article.tsx's Screenshot component.
// Clicking it opens the same image full-size in the page's own lightbox
// (see Lightbox below) rather than a new browser tab, so small print --
// prices, durations, filters -- stays fully legible and can be closed
// again without leaving the article.
function Screenshot({
  src,
  alt,
  width,
  height,
  caption,
  onEnlarge,
  className = 'max-w-3xl',
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  caption: string;
  onEnlarge: (image: LightboxImage) => void;
  className?: string;
}) {
  return (
    <Reveal delay={0.05} className={`mt-8 md:mt-9 mx-auto ${className}`}>
      <button
        type='button'
        onClick={() => onEnlarge({ src, alt, width, height })}
        aria-label={`${alt} — view enlarged`}
        className='block w-full cursor-zoom-in text-left'
      >
        <div className='relative w-full overflow-hidden rounded-[2px] border border-black/10 dark:border-white/15 shadow-[0_2px_20px_rgba(0,0,0,0.08)] bg-white'>
          <Image
            src={src}
            alt={alt}
            width={width}
            height={height}
            sizes='(min-width: 768px) 768px, 100vw'
            className='w-full h-auto'
          />
        </div>
      </button>
      <p className='mt-3 text-center text-sm italic font-[family-name:var(--font-poppins)] text-black/55 dark:text-white/55'>
        {caption} <span className='not-italic'>·</span> click to enlarge
      </p>
    </Reveal>
  );
}

// Full-screen lightbox for an enlarged screenshot: dark backdrop, the
// image at its natural size (capped to the viewport), and an explicit
// close button -- plus clicking the backdrop or pressing Escape also
// closes it. Byte-identical to hotels-article.tsx's Lightbox.
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

// "How I Search for Flights" (Behind the Trip · Flights). Shares its
// shell (fixed logo/home link, hero header, article sections, footer)
// with hotels-article.tsx and the site's other full Behind the Trip
// articles, rather than inventing a new layout.
//
// The "Choosing Our Departure Airport" section embeds the standalone
// DepartureAirportsMap component (components/journey/DepartureAirportsMap.tsx,
// data in lib/journeys/flights-departure-airports.ts) immediately after
// the paragraph listing the four airports -- the original brief's own
// placement instruction -- rather than at the top or bottom of the
// section.
//
// Photos: two genuine personal photos (NIGHT_BOARDING_SRC,
// CABIN_SEATS_SRC) plus two genuine screenshots the user captured herself
// from Skyscanner and Turkish Airlines' own site (SKYSCANNER_SRC,
// TURKISH_AIRLINES_SRC) while researching the Ljubljana -> Bangkok search
// described in "How I Compare Flights — And Where I Book" -- same
// Screenshot/Lightbox treatment as every screenshot in
// hotels-article.tsx.
export default function FlightsArticle() {
  const [pastHero, setPastHero] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<LightboxImage | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      // Same mobile/desktop threshold as every other page on the site.
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
        className={`fixed top-4 left-4 z-50 cursor-pointer transition-all duration-300 rounded-full ${
          pastHero ? 'backdrop-blur-sm bg-white/40 dark:bg-black/40' : ''
        }`}
      >
        <Image
          src={LOGO_SRC}
          alt='Metkish logo'
          width={104}
          height={104}
          className={`rounded-full transition-all duration-300 ${
            pastHero
              ? 'w-11 h-11 sm:w-14 sm:h-14 opacity-70 hover:opacity-100'
              : 'w-[104px] h-[104px] opacity-100'
          }`}
          priority
        />
      </Link>

      <article className='px-6 md:px-12'>
        {/* HERO -- same header shape as the other Behind the Trip
            articles (Eyebrow, large Playfair H1, italic subtitle line). */}
        <header className='pt-28 sm:pt-36 md:pt-44 pb-12 md:pb-16 max-w-2xl mx-auto text-center'>
          <Reveal>
            <Eyebrow>Behind the Trip · Guide</Eyebrow>
            <h1 className='mt-5 text-4xl sm:text-5xl md:text-6xl font-[family-name:var(--font-playfair)] font-medium text-black dark:text-white'>
              How I Search for Flights
            </h1>
            <p className='mt-4 text-xl md:text-2xl italic font-[family-name:var(--font-playfair)] font-medium text-black/80 dark:text-white/80'>
              How I compare routes, times and prices — and why the cheapest
              flight isn&apos;t always my choice.
            </p>
          </Reveal>
        </header>

        {/* MAIN VISUAL -- same hero treatment (max-w-3xl, bordered/shadow)
            as hotels-article.tsx's own hero photo. */}
        <Reveal className='max-w-3xl mx-auto'>
          <div className='relative w-full overflow-hidden rounded-[2px] border border-black/10 dark:border-white/15 shadow-[0_2px_20px_rgba(0,0,0,0.08)]'>
            <Image
              src={NIGHT_BOARDING_SRC}
              alt='Boarding a flight after dark, walking out across the tarmac toward the aircraft.'
              width={5712}
              height={4284}
              sizes='(min-width: 768px) 768px, 100vw'
              className='w-full h-auto'
              priority
            />
          </div>
          <p className='mt-3 text-center text-sm italic font-[family-name:var(--font-poppins)] text-black/55 dark:text-white/55'>
            Departures are where every trip quietly begins.
          </p>
        </Reveal>

        {/* INTRO -- unheaded, sets the scene before the first real
            section, same rhythm as a chapter opener elsewhere on the
            site. */}
        <section className='max-w-2xl mx-auto pt-12 md:pt-14 pb-12 md:pb-14'>
          <Reveal>
            <Paragraphs
              items={[
                "I love planning trips. But before I start looking at hotels, planning activities or putting together an itinerary, there's usually one thing I need to figure out first: how we're going to get there.",
                "Over the years, I've developed my own way of searching for flights. It's not particularly complicated, and I don't have any secret tricks for finding unbelievably cheap tickets.",
                'What I do have is a fairly clear idea of what works for our family.',
                'I compare prices, of course. But I also look at departure airports, flight schedules, connections, luggage and all the little things that can make a journey either straightforward or unnecessarily exhausting.',
                "Here's how I actually do it.",
              ]}
            />
          </Reveal>
        </section>

        {/* I START WITH THE DESTINATION AIRPORT */}
        <section className='max-w-2xl mx-auto pt-12 md:pt-14 pb-12 md:pb-14'>
          <Reveal>
            <SectionHeading>I Start With the Destination Airport</SectionHeading>
            <div className='mt-6'>
              <Paragraphs
                items={[
                  "Once we've decided where we want to go, my first step isn't usually opening a flight comparison website.",
                  "I start by checking the destination's airport. Or airports, if there are several.",
                  'I look at which airlines fly there and where they operate flights from. It gives me a better understanding of the available routes before I start comparing prices.',
                  'Tenerife is a good example.',
                  'When I was planning our trip, I first checked which airport would be most convenient for where we wanted to stay. Tenerife has two airports, Tenerife North and Tenerife South, and the difference matters.',
                  "I know of people who booked flights to the north without even realising there was another airport in the south.",
                  "Once I'd decided on Tenerife South, I checked the airlines operating there. Many of the options were low-cost carriers, so I went directly to their websites to search for flights.",
                  "For European destinations like Tenerife, I strongly prefer direct flights. If there's a reasonable direct option, I don't see much point in adding a connection.",
                ]}
              />
            </div>
          </Reveal>
        </section>

        {/* CHOOSING OUR DEPARTURE AIRPORT -- the map sits immediately
            after the paragraph that lists the four airports, per the
            original brief's placement instruction. */}
        <section className='max-w-2xl mx-auto pt-12 md:pt-14 pb-12 md:pb-14'>
          <Reveal>
            <SectionHeading>Choosing Our Departure Airport</SectionHeading>
            <div className='mt-6'>
              <Paragraphs
                items={[
                  'Living in northeastern Slovenia, we have several airports to consider.',
                  "Vienna, Zagreb and Ljubljana are our usual options. Graz is another possibility, although we haven't flown from there yet.",
                ]}
              />
            </div>
          </Reveal>

          <Reveal delay={0.05} className='mt-9 md:mt-11 max-w-3xl mx-auto'>
            <DepartureAirportsMap home={DEPARTURE_AIRPORTS_HOME} airports={DEPARTURE_AIRPORTS} />
          </Reveal>

          <Reveal className='mt-9 md:mt-11'>
            <Paragraphs
              items={[
                "Vienna is often my first choice for European trips. We're lucky to have a large international airport within a manageable driving distance, with plenty of airlines and destinations to choose from.",
                "Trieste and Venice are also options geographically, but personally, I don't see much sense in driving that far just to save a little money on flights.",
                "If the difference were significant, I might reconsider. But a slightly cheaper ticket doesn't automatically make the journey better.",
                "I'd rather pay more for a flight and spend less time driving to the airport.",
                'For long-haul flights, though, things can be different.',
                "Something I've noticed repeatedly is that flights to the same long-haul destinations can be cheaper from Ljubljana or Zagreb than from Vienna, even with similar connections.",
                "I can't say exactly why. Airline pricing depends on many things, including demand, competition and availability.",
                "But it's something I've noticed often enough that I always compare departure airports before making a decision.",
              ]}
            />
          </Reveal>
        </section>

        {/* HOW I COMPARE FLIGHTS -- AND WHERE I BOOK -- two real
            screenshots (the user's own captures) sit inline: Skyscanner
            right after the paragraph explaining how she uses it to
            compare airlines/prices/times, and Turkish Airlines' own site
            right after the paragraph describing opening it directly --
            both per the original placement brief. */}
        <section className='max-w-2xl mx-auto pt-12 md:pt-14 pb-12 md:pb-14'>
          <Reveal>
            <SectionHeading>How I Compare Flights — And Where I Book</SectionHeading>
            <div className='mt-6'>
              <Paragraphs
                items={[
                  'I use Skyscanner to get an overview of the available flights.',
                  "It's useful for comparing airlines, prices, travel times and connections in one place.",
                ]}
              />
            </div>
          </Reveal>

          <Screenshot
            onEnlarge={setLightboxImage}
            src={SKYSCANNER_SRC}
            alt='A Skyscanner search results page for flights from Ljubljana to Bangkok, comparing airlines, prices and journey times.'
            width={1067}
            height={1146}
            caption='Step 1: I use Skyscanner to compare available airlines, prices and journey times.'
            className='max-w-xl'
          />

          <Reveal className='mt-9 md:mt-11'>
            <Paragraphs
              items={[
                'But I never book through third-party booking websites.',
                "Once I find an interesting option, I go directly to the airline's website and check the flights there.",
                'For example, when searching for flights from Ljubljana to Bangkok, Skyscanner showed several airlines with different prices and journey times.',
                "I then opened Turkish Airlines' website to compare the connections in more detail.",
              ]}
            />
          </Reveal>

          <Screenshot
            onEnlarge={setLightboxImage}
            src={TURKISH_AIRLINES_SRC}
            alt="Turkish Airlines' own booking flow for the same Ljubljana to Bangkok search, showing several connections with different durations and prices on the same departure date."
            width={1094}
            height={1163}
            caption="Step 2: I check the airline's website directly, comparing connection times, schedules and prices before booking."
            className='max-w-xl'
          />

          <Reveal className='mt-9 md:mt-11'>
            <Paragraphs
              items={[
                'And this is where you really need to pay attention.',
                "On the same departure date, I found connections taking around 13 hours, but also others taking more than 30 hours. Some of those much longer journeys weren't even cheaper.",
                "That's why I don't just look at the price. I check the actual departure and arrival times, the length of each connection and the total travel time.",
                "I usually do all of this on my computer. It's simply easier to compare everything on a larger screen.",
                "Once I've made my decision, I book directly with the airline.",
                "That way, if something changes, I'm dealing with the company operating the flight, not with an extra intermediary.",
              ]}
            />
          </Reveal>
        </section>

        {/* BEING FLEXIBLE WITH TRAVEL DATES */}
        <section className='max-w-2xl mx-auto pt-12 md:pt-14 pb-12 md:pb-14'>
          <Reveal>
            <SectionHeading>Being Flexible With Travel Dates</SectionHeading>
            <div className='mt-6'>
              <Paragraphs
                items={[
                  "One advantage we have is that we're fairly flexible with our travel dates.",
                  "Flights on Friday afternoons and Saturday mornings are often more expensive because they're popular times to start a holiday. Return flights on Sunday evenings can be similarly popular.",
                  "So I don't automatically choose the first and last days of the school holidays.",
                  'If the holidays run from Monday to Friday, for example, I might find better flights departing on Tuesday and returning the following Tuesday.',
                  'That means arranging a couple of additional days off school for the children, but it can make a real difference to our flight options and sometimes the price.',
                  'I always compare several dates before booking.',
                  "When you're buying four tickets, even a relatively small difference per person adds up.",
                ]}
              />
            </div>

            <SubHeading>My Ideal Flight Times</SubHeading>
            <div className='mt-6'>
              <Paragraphs
                items={[
                  'If I can choose, I love departing early in the morning.',
                  'Arriving at our destination before noon means we still have almost an entire day ahead of us.',
                  'Return flights are a different story.',
                  'My favourite time to fly home is around midday.',
                  "What I really dislike is checking out of a hotel at 10 AM when our flight isn't until late in the evening.",
                  "Your luggage is stored somewhere, you can't properly settle down anywhere, and the whole day feels like you're just waiting to leave.",
                  "But very early return flights aren't ideal either. They often mean getting up in the middle of the night, rushing to the airport and sometimes missing breakfast.",
                  'So, ideally, an early flight out and a midday flight home.',
                  "Of course, it doesn't always work out that way. But if the prices are similar, the flight schedule can easily be the deciding factor.",
                ]}
              />
            </div>
          </Reveal>
        </section>

        {/* THE CHEAPEST FLIGHT ISN'T ALWAYS THE BEST */}
        <section className='max-w-2xl mx-auto pt-12 md:pt-14 pb-12 md:pb-14'>
          <Reveal>
            <SectionHeading>The Cheapest Flight Isn&apos;t Always the Best</SectionHeading>
            <div className='mt-6'>
              <Paragraphs
                items={[
                  'This is especially true for long-haul flights.',
                  "When we're travelling somewhere far away, I usually look for Turkish Airlines connections from Ljubljana or Qatar Airways from Zagreb.",
                  'And I always pay close attention to the layover.',
                  'I have absolutely no interest in spending five or six hours sitting at an airport just to save some money.',
                  "Airports are often like small cities, full of shops, restaurants and things to do. But for me, they're still stressful places.",
                  "I've never really understood spending hours shopping at an airport. We'll occasionally buy a small gift or something we need, but I've certainly never gone shopping for clothes during a layover.",
                  "For us, it's pretty simple.",
                  'We get something to eat, have a drink, use the bathroom and move on to the next flight.',
                  "That's it.",
                  "I'd much rather pay a little more for a convenient connection than spend half a day waiting for another plane.",
                  "Obviously, the connection still needs to be long enough to comfortably catch the next flight. I don't want to be running through an airport either.",
                  "But when choosing between a reasonable short layover and a much longer one, I'll almost always choose the shorter journey.",
                ]}
              />
            </div>
          </Reveal>
        </section>

        {/* THE EXTRAS I'M HAPPY TO PAY FOR */}
        <section className='max-w-2xl mx-auto pt-12 md:pt-14 pb-12 md:pb-14'>
          <Reveal>
            <SectionHeading>The Extras I&apos;m Happy to Pay For</SectionHeading>
            <div className='mt-6'>
              <Paragraphs
                items={[
                  'A cheap ticket can look very different once you start adding everything you actually want.',
                  'Luggage and seat selection are two things I almost always take into account.',
                ]}
              />
            </div>

          </Reveal>

          {/* CABIN -- a real photo of airplane seating, the same
              visual-variety treatment as hotels-article.tsx's Petram
              photo: a wider break from the text column, placed right
              under this section's own opener rather than beside the
              specific Istanbul seating story below, since it's not a
              photo of that particular flight -- just the general feeling
              of settling into assigned seats. */}
          <Reveal delay={0.05} className='mt-9 md:mt-11 max-w-xs sm:max-w-sm mx-auto'>
            <div className='relative w-full overflow-hidden rounded-[2px] border border-black/10 dark:border-white/15 shadow-[0_2px_20px_rgba(0,0,0,0.08)]'>
              <Image
                src={CABIN_SEATS_SRC}
                alt='Rows of airplane seats inside the cabin before a flight.'
                width={3647}
                height={5706}
                sizes='(min-width: 640px) 384px, 320px'
                className='w-full h-auto'
              />
            </div>
            <p className='mt-3 text-center text-sm italic font-[family-name:var(--font-poppins)] text-black/55 dark:text-white/55'>
              Choosing our seats in advance is one of the extras I&apos;m always happy to pay for.
            </p>
          </Reveal>

          <Reveal className='mt-9 md:mt-11'>
            <SubHeading>Checked Luggage</SubHeading>
            <div className='mt-6'>
              <Paragraphs
                items={[
                  'On our recent trip to Barcelona, we actually booked more luggage than we needed.',
                  "And I don't regret it.",
                  'I prefer checking in our suitcases rather than dragging them around the airport, carrying them onto the plane and trying to squeeze everything into the overhead compartments.',
                  "It's simply more convenient.",
                  'We can walk around the airport with our personal belongings, board without worrying about finding space for our bags and settle into our seats.',
                  'I know travelling with cabin luggage only can save money. And for some trips, it makes perfect sense.',
                  "But sometimes I'm happy to pay for the convenience.",
                ]}
              />
            </div>

            <SubsectionHeading>Choosing Our Seats</SubsectionHeading>
            <div className='mt-6'>
              <Paragraphs
                items={[
                  'This is something I learned the hard way.',
                  'A few years ago, we were flying to Istanbul with Turkish Airlines.',
                  'My son was seven at the time, and I assumed that a child that young would automatically be seated next to a parent.',
                  'I was wrong.',
                  'When our seats were assigned, my son was placed on the other side of the aircraft. The other three of us were scattered around the plane as well.',
                  'I was shocked.',
                  'I ended up asking other passengers if they would be willing to switch seats so my son could sit next to me.',
                  'Since then, I always select our seats in advance.',
                  "It's one less thing to worry about, and I'm happy to pay a little extra for that peace of mind.",
                ]}
              />
            </div>
          </Reveal>
        </section>

        {/* WHEN I BOOK FLIGHTS */}
        <section className='max-w-2xl mx-auto pt-12 md:pt-14 pb-12 md:pb-14'>
          <Reveal>
            <SectionHeading>When I Book Flights</SectionHeading>
            <div className='mt-6'>
              <Paragraphs
                items={[
                  "I usually book flights once we've decided on a destination.",
                  'Sometimes that means buying tickets as much as nine months in advance.',
                  "I'm not someone who spends months waiting for the perfect price or trying to predict the cheapest day to book.",
                  "But that doesn't mean I'll pay absolutely anything.",
                  'Our upcoming trip to Thailand is a good example.',
                  'Some relatives suggested spending Christmas and New Year there together. I started looking at flights, but the prices were ridiculous compared to other times of the year.',
                  'So I said no.',
                  "Not because we didn't want to go to Thailand, but because I simply couldn't justify paying that much more just to travel during the holidays.",
                  'Then, in September, Turkish Airlines launched a promotion for flights departing from Ljubljana.',
                  "I often hear about these promotions through travel groups I'm part of.",
                  'Naturally, Christmas and New Year were excluded from the offer. But I found flights for the end of February, with exactly the kind of connections I wanted.',
                  'I booked them.',
                  "We're departing Ljubljana on a Monday evening, travelling overnight and arriving in Thailand around midday, local time.",
                  "For me, that's a great schedule.",
                  'We can arrange a transfer during the day, head straight to our hotel and settle in without dealing with a late-night arrival.',
                  "It wasn't about finding the absolute cheapest ticket. It was about finding a price that made sense and a journey that worked for us.",
                ]}
              />
            </div>
          </Reveal>
        </section>

        {/* THE FLIGHT WE MISSED -- AND WHAT IT TAUGHT ME */}
        <section className='max-w-2xl mx-auto pt-12 md:pt-14 pb-12 md:pb-14'>
          <Reveal>
            <SectionHeading>The Flight We Missed — And What It Taught Me</SectionHeading>
            <div className='mt-6'>
              <Paragraphs
                items={[
                  'Years ago, my husband and I were flying from Venice to Barcelona to watch an FC Barcelona match.',
                  "Back then, we didn't have much money, and every euro mattered.",
                  "We also hadn't visited Venice before. So when we realised we had what seemed like plenty of time before our flight, we decided to explore the city.",
                  'That turned out to be a mistake.',
                  'There were roadworks on the way back to the airport, and our navigation kept sending us in circles.',
                  "We simply couldn't figure out how to get to the terminal.",
                  'By the time we finally arrived, it was too late.',
                  "We'd missed our flight.",
                  'Luckily, Vueling had another flight to Barcelona about three hours later. We paid the difference and waited for the next departure.',
                  'But there was one big problem.',
                  'We had tickets for a Barça match that evening.',
                  "The match was the whole reason for our trip, and suddenly we weren't even sure we'd make it.",
                  "I still remember how disappointed we felt, sitting at the airport, wondering whether we'd just ruined the entire trip.",
                  'In the end, we made it to the match.',
                  'But I learned my lesson.',
                  'These days, we always arrive at the airport at least two hours before departure, sometimes even earlier.',
                  "I'd much rather have time for a coffee after checking in than spend the journey to the airport worrying about whether we'll make our flight.",
                  'Some travel lessons you only need to learn once.',
                ]}
              />
            </div>
          </Reveal>
        </section>

        {/* WHAT MATTERS MOST TO ME */}
        <section className='max-w-2xl mx-auto pt-12 md:pt-14 pb-[100px] md:pb-[160px]'>
          <Reveal>
            <SectionHeading>What Matters Most to Me</SectionHeading>
            <div className='mt-6'>
              <Paragraphs
                items={[
                  "I don't have a magic formula for finding cheap flights.",
                  'I research the routes, compare departure airports, check different dates and look carefully at the total journey.',
                  "I also know which things I'm willing to pay more for: convenient flight times, reasonable connections, checked luggage and seats together.",
                  "And if the prices simply don't make sense, I'm happy to reconsider the dates.",
                  "For me, the goal isn't to book the cheapest flight possible.",
                  "It's to make sure the journey works for us — before the holiday has even begun.",
                ]}
              />
            </div>
          </Reveal>
        </section>
      </article>

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

      {lightboxImage && (
        <Lightbox image={lightboxImage} onClose={() => setLightboxImage(null)} />
      )}
    </div>
  );
}
