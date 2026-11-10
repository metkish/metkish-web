'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { InstagramIcon, PinterestIcon } from '@/components/ui/social-icons';
import { INSTAGRAM_URL, PINTEREST_URL } from '@/lib/social-links';

const LOGO_SRC = '/metkish-logo.png';

const HOTELS_BASE = '/Behind%20the%20trip/Hotels';
const TENERIFE_HERO_SRC = `${HOTELS_BASE}/Tenerife_hotel_view_web.jpeg`;
const PETRAM_SRC = `${HOTELS_BASE}/Petram_web.jpeg`;
const BOOKING_SEARCH_SRC = `${HOTELS_BASE}/Booking_web.png`;
const BOOKING_REVIEWS_SRC = `${HOTELS_BASE}/Booking_reviews_web.png`;
const BOOKING_ROME_MAP_SRC = `${HOTELS_BASE}/Booking_Rome_map_web.png`;
const BOOKING_AVAILABILITY_SRC = `${HOTELS_BASE}/Booking_availability_web.png`;

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
// el-clasico-tickets-article.tsx / how-we-find-restaurants-article.tsx
// (same Playfair scale as every chapter opener on Italy/Tenerife),
// duplicated locally per this codebase's established per-page convention.
function SectionHeading({ children }: { children: ReactNode }) {
  return (
    <h2 className='text-3xl md:text-4xl font-[family-name:var(--font-playfair)] font-medium text-black dark:text-white'>
      {children}
    </h2>
  );
}

// In-section sub-heading -- byte-identical to el-clasico-tickets-article.tsx's
// SubHeading (same Eyebrow-style visual treatment, rendered as a real
// <h3> for genuine heading semantics).
function SubHeading({ children }: { children: ReactNode }) {
  return (
    <h3 className='mt-10 md:mt-12 text-sm md:text-[0.95rem] uppercase tracking-[0.18em] font-[family-name:var(--font-poppins)] font-semibold text-black/60 dark:text-white/60'>
      {children}
    </h3>
  );
}

// Subsection heading for a substantial sub-story within a section -- a
// real serif heading (not a small uppercase label), sized between
// SectionHeading and the small uppercase SubHeading above. Used only
// where a sub-heading introduces real narrative weight (a specific stay,
// with its own run of paragraphs), not a short subdivision like "For
// City Breaks", which stays a SubHeading.
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

// Body copy -- byte-identical to el-clasico-tickets-article.tsx's
// Paragraphs component (left-aligned editorial column), duplicated locally
// per this codebase's established per-page convention. Items are ReactNode
// rather than plain strings so the rare paragraph with inline emphasis
// (e.g. "9.0 or higher") can pass a short JSX fragment instead of a bare
// string, without needing a second component.
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

// Restrained inline emphasis -- medium weight, full-opacity text colour,
// no background/underline/colour change, so it reads as a quietly
// stressed word rather than a highlighted UI element.
function Emphasis({ children }: { children: ReactNode }) {
  return (
    <strong className='font-medium text-black dark:text-white'>
      {children}
    </strong>
  );
}

// What the shared lightbox at the bottom of this page needs to render
// whichever screenshot was last clicked.
type LightboxImage = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

// A Booking.com screenshot: bordered/shadow treatment byte-identical to
// el-clasico-tickets-article.tsx's photo containers. Clicking it opens
// the same image full-size in the page's own lightbox (see Lightbox
// below) rather than a new browser tab, so the guest-rating filters,
// review categories, map pins and price comparisons stay fully legible
// -- and can be closed again -- without leaving the article.
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
// closes it. The only modal-type UI on the site, used solely so a
// screenshot's small print (ratings, prices, filters) can be read at
// full size and then dismissed again without leaving the article.
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

// "How I Choose Where We Stay" (Behind the Trip · Hotels). Shares its
// shell (fixed logo/home link, hero header, article sections, footer) with
// el-clasico-tickets-article.tsx and how-we-find-restaurants-article.tsx,
// the site's other full Behind the Trip articles, rather than inventing a
// new layout.
export default function HotelsArticle() {
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
        {/* HERO -- same header shape as the other two Behind the Trip
            articles (Eyebrow, large Playfair H1, italic subtitle line). */}
        <header className='pt-28 sm:pt-36 md:pt-44 pb-12 md:pb-16 max-w-2xl mx-auto text-center'>
          <Reveal>
            <Eyebrow>Behind the Trip · Guide</Eyebrow>
            <h1 className='mt-5 text-4xl sm:text-5xl md:text-6xl font-[family-name:var(--font-playfair)] font-medium text-black dark:text-white'>
              How I Choose Where We Stay
            </h1>
            <p className='mt-4 text-xl md:text-2xl italic font-[family-name:var(--font-playfair)] font-medium text-black/80 dark:text-white/80'>
              What I look for, what I compare, and what actually matters to
              me when choosing a hotel.
            </p>
          </Reveal>
        </header>

        {/* MAIN VISUAL -- the Tenerife pool photo, same hero treatment
            (max-w-3xl, bordered/shadow) as el-clasico-tickets-article.tsx's
            own hero photo. */}
        <Reveal className='max-w-3xl mx-auto'>
          <div className='relative w-full overflow-hidden rounded-[2px] border border-black/10 dark:border-white/15 shadow-[0_2px_20px_rgba(0,0,0,0.08)]'>
            <Image
              src={TENERIFE_HERO_SRC}
              alt='The pool and surrounding hotel grounds at Roca Nivaria in Tenerife.'
              width={5712}
              height={4284}
              sizes='(min-width: 768px) 768px, 100vw'
              className='w-full h-auto'
              priority
            />
          </div>
          <p className='mt-3 text-center text-sm italic font-[family-name:var(--font-poppins)] text-black/55 dark:text-white/55'>
            At Roca Nivaria in{' '}
            <Link href='/tenerife' className='underline underline-offset-2'>
              Tenerife
            </Link>
            , the pool, surroundings and hotel
            facilities were part of the holiday experience.
          </p>
        </Reveal>

        {/* INTRO -- unheaded, sets the scene before the first real
            section, same rhythm as a chapter opener elsewhere on the
            site. */}
        <section className='max-w-2xl mx-auto pt-12 md:pt-14 pb-12 md:pb-14'>
          <Reveal>
            <Paragraphs
              items={[
                "Fourteen years ago, choosing accommodation was pretty simple for me. I wanted a good location and a low price. The closer to the city centre, the better, and I didn't pay nearly as much attention to guest ratings as I do today.",
                "I remember looking back at one of those early bookings and discovering that the property had a rating of just 6.9. I wouldn't even consider booking something with that score today.",
                "Over the years, my priorities have changed. I've stayed in everything from basic apartments to beautiful resorts, made some great choices and had a few disappointing experiences along the way.",
                'These days, I have a fairly clear system for choosing where we stay.',
                "It's not about finding the cheapest hotel, and it's definitely not about booking the most luxurious one. It's about finding a place that makes our trip more comfortable and is actually worth what we're paying.",
              ]}
            />
          </Reveal>
        </section>

        {/* BOOKING.COM IS ALWAYS MY STARTING POINT */}
        <section className='max-w-2xl mx-auto pt-12 md:pt-14 pb-12 md:pb-14'>
          <Reveal>
            <SectionHeading>Booking.com Is Always My Starting Point</SectionHeading>
            <div className='mt-6'>
              <Paragraphs
                items={[
                  "I've been using Booking.com for years, and it's still my go-to platform for accommodation.",
                  "If a property isn't listed there, chances are it won't even make it onto my radar.",
                  "I've heard plenty of negative stories about Booking.com, but personally, I've never had a bad experience with the platform. I find it incredibly easy to use, and almost everything I need to know about a property is right there.",
                  'I can compare prices, locations, room types, meal options, cancellation policies and guest reviews without jumping between different websites.',
                  'I also have Genius status, which gives me access to additional discounts on selected properties.',
                  'Could I sometimes get a better price by booking directly with a hotel? Absolutely. But I rarely do.',
                  'I value having my reservations in one place and being able to manage them easily. For me, that convenience is often worth more than saving a little extra money.',
                ]}
              />
            </div>
            <Screenshot
              onEnlarge={setLightboxImage}
              src={BOOKING_SEARCH_SRC}
              alt='A Booking.com search results page, showing the guest rating filter and a list of available properties with prices.'
              width={1403}
              height={1121}
              caption='My starting point: setting the guest rating filter and comparing available properties on Booking.com.'
            />
          </Reveal>
        </section>

        {/* MY FIRST FILTER: GUEST RATINGS */}
        <section className='max-w-2xl mx-auto pt-12 md:pt-14 pb-12 md:pb-14'>
          <Reveal>
            <SectionHeading>My First Filter: Guest Ratings</SectionHeading>
            <div className='mt-6'>
              <Paragraphs
                items={[
                  'The first thing I do when searching for accommodation is set the guest rating filter.',
                  <>
                    Ideally, I&apos;m looking for properties rated{' '}
                    <Emphasis>9.0 or higher</Emphasis>.
                  </>,
                  "I'm sometimes willing to go as low as 8.6, especially if we only need somewhere to sleep for a night and won't be using any additional facilities.",
                  'But the overall rating is only part of the story.',
                  'The number of reviews matters just as much.',
                  'A property rated 9.5 with only 10 reviews doesn’t mean nearly as much to me as one rated 9.0 with hundreds of reviews.',
                  'As a general rule, I want to see at least 50 reviews. The more, the better.',
                  "And even then, I don't trust the numbers blindly.",
                ]}
              />
            </div>

            <SubsectionHeading>A 9.5 That Didn&apos;t Feel Like a 9.5</SubsectionHeading>
            <div className='mt-6'>
              <Paragraphs
                items={[
                  'We once booked an apartment in Croatia with an excellent rating of 9.5.',
                  'I expected something really special.',
                  'When we arrived, I was honestly shocked. The apartment was pretty average. Yes, it was right by the sea, which was a huge advantage, but the accommodation itself was nowhere near what I had imagined based on that rating.',
                  'Personally, I would have given it an 8.5 at most.',
                  'To me, a 9.5 should feel close to flawless — not just a friendly welcome or a great location.',
                  "But I've learned that people rate accommodation very differently.",
                  'Someone might give an apartment a perfect score because the owner was friendly, the location was fantastic or they felt they got good value for money.',
                  "And that's perfectly valid. It just doesn't necessarily mean the property will meet my expectations.",
                ]}
              />
            </div>
            <Screenshot
              onEnlarge={setLightboxImage}
              src={BOOKING_REVIEWS_SRC}
              alt='A Booking.com guest review breakdown, showing category scores for cleanliness, comfort, location, facilities, staff and value for money.'
              width={889}
              height={1039}
              caption='I look beyond the overall score, checking individual categories and recent guest reviews.'
              className='max-w-[430px]'
            />
          </Reveal>
        </section>

        {/* HOW I ACTUALLY READ REVIEWS */}
        <section className='max-w-2xl mx-auto pt-12 md:pt-14 pb-12 md:pb-14'>
          <Reveal>
            <SectionHeading>How I Actually Read Reviews</SectionHeading>
            <div className='mt-6'>
              <Paragraphs
                items={[
                  'I never read every single review. But I do spend time looking for the things that could genuinely affect our stay.',
                  "If someone complains that the pillow was uncomfortable, I don't pay much attention. That's subjective — what bothers one guest might suit someone else just fine.",
                  'But complaints about basic facilities are a different story.',
                  "No hot water? Air conditioning that doesn't work? Windows that won't open or close properly?",
                  'Those are things I take seriously.',
                  'I also check when the reviews were written. For me, reviews from the past year are the most relevant. A problem from three years ago may have been resolved long ago.',
                  "And if several recent guests mention the same issue, that's definitely something I want to know before booking.",
                ]}
              />
            </div>

            <SubsectionHeading>Even Established Hotels Get the Basics Wrong</SubsectionHeading>
            <div className='mt-6'>
              <Paragraphs
                items={[
                  'We once stayed at an Austria Trend hotel in Vienna, where I expected a certain standard.',
                  "When we checked in, the extra bed for one of our children hadn't been prepared.",
                  'We went to a concert that evening and returned to our room at around 1 a.m., completely exhausted.',
                  "The bed still wasn't there.",
                  'Instead of going straight to sleep, we had to find someone at the hotel who could finally arrange it.',
                  'The hotel had a rating of 8.7.',
                  "It's a small detail until you're standing in a hotel room in the middle of the night with a tired child who has nowhere to sleep.",
                  'Experiences like that remind me why I pay attention to the details, not just the overall score.',
                ]}
              />
            </div>
          </Reveal>
        </section>

        {/* LOCATION IS SOMETHING I'M HAPPY TO PAY MORE FOR */}
        <section className='max-w-2xl mx-auto pt-12 md:pt-14 pb-12 md:pb-14'>
          <Reveal>
            <SectionHeading>Location Is Something I&apos;m Happy to Pay More For</SectionHeading>
            <div className='mt-6'>
              <Paragraphs
                items={[
                  "Once I've narrowed down the properties by rating, the next thing I look at is location.",
                  'For city breaks, I want to be as central as possible. If staying right in the centre isn’t practical, being close to public transport is essential, preferably a metro station.',
                  <>
                    One of my favourite features on Booking.com is{' '}
                    <Emphasis>Show on map</Emphasis>.
                  </>,
                  'Instead of scrolling through endless listings, I open the map and see exactly where the available properties are.',
                  'I can compare their prices while checking the distance to the main attractions and metro stations.',
                  "It's such a simple feature, but it makes choosing the right area much easier.",
                ]}
              />
            </div>
            <Screenshot
              onEnlarge={setLightboxImage}
              src={BOOKING_ROME_MAP_SRC}
              alt='A Booking.com map view of Rome, comparing the locations and prices of several available properties relative to the city centre.'
              width={1423}
              height={1038}
              caption="An example of how I compare accommodation locations in Rome using Booking.com's map view."
            />

            <SubsectionHeading>Why Our Barcelona Hotel Was Worth the Extra Money</SubsectionHeading>
            <div className='mt-6'>
              <Paragraphs
                items={[
                  <>
                    On our recent trip to{' '}
                    <Link
                      href='/barcelona'
                      className='underline underline-offset-2'
                    >
                      Barcelona
                    </Link>
                    , we stayed at ICON BCN by Petit Palace.
                  </>,
                  'Could I have found a much cheaper hotel? Definitely.',
                  'But the location was fantastic.',
                  'We could walk out of the hotel and already be in the part of the city we wanted to explore.',
                  "I honestly can't imagine having to take public transport into the centre every single morning.",
                  'And when you’re travelling with children, being able to return to the hotel easily, take a break or drop off shopping bags makes a real difference.',
                  "For me, that's exactly the kind of convenience worth paying extra for.",
                  "Of course, public transport is useful, and we use it whenever we need to. I just don't want every day to begin and end with an unnecessary commute if we can avoid it.",
                ]}
              />
            </div>
          </Reveal>
        </section>

        {/* I DON'T START WITH A FIXED BUDGET */}
        <section className='max-w-2xl mx-auto pt-12 md:pt-14 pb-12 md:pb-14'>
          <Reveal>
            <SectionHeading>I Don&apos;t Start With a Fixed Budget</SectionHeading>
            <div className='mt-6'>
              <Paragraphs
                items={[
                  "This might sound unusual, but I don't normally have a strict accommodation budget when I start searching.",
                  "I prefer to see what's available first.",
                  "I compare different properties, their locations, facilities and prices. I even look at high-end hotels in the same area, not necessarily because I'm planning to book one, but because it helps me understand the price range.",
                  'Sometimes the difference between an average hotel and a much nicer one is surprisingly small.',
                  "Other times, the price difference is enormous, and I know the additional cost simply isn't worth it for our plans.",
                  "I'm not looking for the cheapest option. I'm looking for the one that makes the most sense.",
                  'And sometimes that means spending more.',
                ]}
              />
            </div>
          </Reveal>
        </section>

        {/* WHAT WE NEED DEPENDS ON THE TRIP */}
        <section className='max-w-2xl mx-auto pt-12 md:pt-14 pb-12 md:pb-14'>
          <Reveal>
            <SectionHeading>What We Need Depends on the Trip</SectionHeading>
            <div className='mt-6'>
              <Paragraphs
                items={[
                  'I don’t look for the same things when booking a city break as I do when planning a beach holiday.',
                ]}
              />
            </div>

            <SubHeading>For City Breaks</SubHeading>
            <div className='mt-6'>
              <Paragraphs
                items={[
                  "We're usually out exploring most of the day, so the hotel is mainly somewhere to sleep.",
                  'Location, cleanliness, comfortable beds and a modern, well-maintained room matter much more to me than additional facilities.',
                  "I don't need a swimming pool, spa or an impressive list of amenities if we're barely going to use them.",
                ]}
              />
            </div>

            <SubHeading>For Longer Holidays</SubHeading>
            <div className='mt-6'>
              <Paragraphs
                items={[
                  "When we're spending more time at the property, my expectations change.",
                  'I want a spacious, comfortable room, preferably with a balcony or terrace. A nice pool is a big plus, and the overall atmosphere of the property becomes much more important.',
                  "I also prefer modern interiors. I'm simply not a fan of outdated rooms and worn furnishings.",
                  'Travelling as a family of four can make this more challenging. Suitable family rooms aren’t always available, and that can significantly limit our choices.',
                  'Sometimes the hard part isn’t finding a hotel we like — it’s finding a room that comfortably fits all four of us.',
                ]}
              />
            </div>
          </Reveal>
        </section>

        {/* SOMETIMES THE HOTEL IS THE DESTINATION */}
        <section className='max-w-2xl mx-auto pt-12 md:pt-14 pb-12 md:pb-14'>
          <Reveal>
            <SectionHeading>Sometimes the Hotel Is the Destination</SectionHeading>
            <div className='mt-6'>
              <Paragraphs
                items={[
                  'Most of the time, I prefer discovering new places rather than returning to the same hotel.',
                  'But there are exceptions.',
                  "One of them is Petram, a resort just across the Slovenian border in Croatia. We've already stayed there twice, and I'm pretty sure we'll be going back again.",
                  'Sometimes we don’t need a packed itinerary or a long list of things to see. We just want a relaxing weekend in a beautiful, comfortable place.',
                  "And on those occasions, I'm happy to spend more on accommodation because the hotel itself is part of the experience.",
                  'Petram is one of those rare places that makes me want to return, even though I usually prefer trying somewhere new.',
                ]}
              />
            </div>
          </Reveal>

          {/* PETRAM -- its own wider photo, same visual-variety treatment
              as the Tenerife hero above. */}
          <Reveal delay={0.05} className='mt-9 md:mt-11 max-w-3xl mx-auto'>
            <div className='relative w-full overflow-hidden rounded-[2px] border border-black/10 dark:border-white/15 shadow-[0_2px_20px_rgba(0,0,0,0.08)]'>
              <Image
                src={PETRAM_SRC}
                alt='Petram, a resort in Croatia near the Slovenian border, that we have returned to more than once.'
                width={5712}
                height={4284}
                sizes='(min-width: 768px) 768px, 100vw'
                className='w-full h-auto'
              />
            </div>
            <p className='mt-3 text-center text-sm italic font-[family-name:var(--font-poppins)] text-black/55 dark:text-white/55'>
              Petram in Croatia — one of the few places we&apos;ve visited
              more than once and would happily return to again.
            </p>
          </Reveal>
        </section>

        {/* BREAKFAST IS USUALLY ENOUGH */}
        <section className='max-w-2xl mx-auto pt-12 md:pt-14 pb-12 md:pb-14'>
          <Reveal>
            <SectionHeading>Breakfast Is Usually Enough</SectionHeading>
            <div className='mt-6'>
              <Paragraphs
                items={[
                  'One thing we never book is all-inclusive.',
                  'The idea of spending our holidays eating at hotel buffets throughout the day just doesn’t appeal to us.',
                  'We don’t usually choose half-board either.',
                  'We like having our own schedule, and we often don’t feel like eating a big dinner. I don’t want to plan our day around getting back to the hotel for a meal.',
                  'What I do appreciate is breakfast.',
                  "It's convenient to start the day without having to search for somewhere to eat first.",
                  'After that, we prefer to decide as we go.',
                  "Maybe we'll have a proper lunch somewhere, grab something quick later or discover a restaurant we'd like to try.",
                  'That flexibility is part of what we enjoy about travelling.',
                ]}
              />
            </div>
          </Reveal>
        </section>

        {/* WHY I ALWAYS BOOK WITH FREE CANCELLATION */}
        <section className='max-w-2xl mx-auto pt-12 md:pt-14 pb-12 md:pb-14'>
          <Reveal>
            <SectionHeading>Why I Always Book With Free Cancellation</SectionHeading>
            <div className='mt-6'>
              <Paragraphs
                items={[
                  "I start searching for accommodation as soon as I've booked our flights.",
                  'Even if the trip is months away, I like knowing we already have somewhere to stay.',
                  <>
                    But there&apos;s one condition:{' '}
                    <Emphasis>
                      I always choose a reservation with free cancellation.
                    </Emphasis>
                  </>,
                  "And just because I've booked something doesn’t mean I've stopped looking.",
                  'I often continue checking Booking.com, comparing properties and seeing whether anything better becomes available.',
                  'Sometimes I find a nicer hotel. Sometimes a better location. Sometimes simply a better price.',
                  'When that happens, I can cancel the original reservation and make a new one, as long as I’m still within the free cancellation period.',
                  'I love having that flexibility.',
                  'It means I can secure a good option early without feeling that my decision is final.',
                ]}
              />
            </div>
            <Screenshot
              onEnlarge={setLightboxImage}
              src={BOOKING_AVAILABILITY_SRC}
              alt='A Booking.com room availability page, showing the same room offered at different prices depending on breakfast, meal and cancellation options.'
              width={1151}
              height={989}
              caption="The same room can come with very different prices and conditions. I always compare what's included before booking."
            />
            <div className='mt-8 md:mt-9'>
              <Paragraphs
                items={[
                  'This is another reason I like Booking.com. The same room can come with several different options, depending on whether you want breakfast, additional meals or free cancellation.',
                  "I always compare these options before booking. The cheapest rate isn't necessarily the one I'd choose, especially when the trip is still months away and I want the freedom to change my plans.",
                ]}
              />
            </div>
          </Reveal>
        </section>

        {/* THE BOOKING THAT BREAKS MY OWN RULES */}
        <section className='max-w-2xl mx-auto pt-12 md:pt-14 pb-12 md:pb-14'>
          <Reveal>
            <SectionHeading>The Booking That Breaks My Own Rules</SectionHeading>
            <div className='mt-6'>
              <Paragraphs
                items={[
                  "And then there's our upcoming trip to Thailand.",
                  "I've booked a property with a perfect 10.0 rating.",
                  'Sounds great, right?',
                  'Except it has only 14 reviews.',
                  'Normally, that would be a red flag for me. It goes against my usual rule of wanting at least 50 reviews, preferably many more.',
                  'But this property seems to have everything we’re looking for. The location, the accommodation itself, the facilities and the price all look fantastic.',
                  'Almost too fantastic.',
                  "I've spent time researching whether the property is legitimate, checking what information I can find and even communicating with the owner.",
                  "So far, everything suggests it's real.",
                  'But I still have that little worry in the back of my mind: what if we arrive in Thailand and discover that something isn’t right?',
                  "Maybe it'll turn out to be one of our best accommodation finds.",
                  "Or maybe it'll remind me why I created those rules in the first place.",
                  "We'll find out in February.",
                ]}
              />
            </div>
          </Reveal>
        </section>

        {/* WHAT REALLY MATTERS TO ME */}
        <section className='max-w-2xl mx-auto pt-12 md:pt-14 pb-[100px] md:pb-[160px]'>
          <Reveal>
            <SectionHeading>What Really Matters to Me</SectionHeading>
            <div className='mt-6'>
              <Paragraphs
                items={[
                  "After years of booking hotels and apartments, I've realised that choosing accommodation isn't about finding the perfect property.",
                  "It's about finding the right one for the trip.",
                  "Sometimes that means paying more for a central location. Sometimes it means choosing a simple hotel because we'll only be sleeping there. And sometimes it means spending extra on a beautiful, spacious room because we know we'll actually enjoy being there.",
                  "I don't need luxury everywhere we go.",
                  'But I do want a comfortable, well-maintained place that makes our trip easier, not more complicated.',
                  'And if I can find that at a reasonable price, even better.',
                  "That's how I choose where we stay.",
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
