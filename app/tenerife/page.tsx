'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import ImagePlaceholder from '@/components/ui/image-placeholder';
import JourneyMapScene from '@/components/journey/JourneyMapScene';
import JourneyAnnotation from '@/components/journey/JourneyAnnotation';
import {
  RouteLabel,
  InfoCard,
  CardKicker,
  CardLine,
  CardPrice,
  SideNote,
  TimeStamp,
} from '@/components/journey/annotation-kit';
import {
  TENERIFE_ARRIVAL_JOURNEY,
  TENERIFE_TRANSFER_JOURNEY,
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

function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <span className='block text-sm md:text-[0.95rem] uppercase tracking-[0.18em] font-[family-name:var(--font-poppins)] font-semibold text-black/60 dark:text-white/60'>
      {children}
    </span>
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

      {/* 1. HERO */}
      <section className='relative h-[100svh] md:h-[100dvh] w-full overflow-hidden'>
        <ImagePlaceholder
          label='HERO IMAGE · TENERIFE'
          sublabel='I will provide my own photograph later.'
          variant='hero'
          aspectClassName='h-full'
          className='absolute inset-0 rounded-none border-0'
        />
        <div className='absolute inset-0 bg-black/5' />
        <div className='relative z-10 h-full flex flex-col items-center justify-center text-center px-6'>
          <Reveal>
            <h1 className='text-5xl sm:text-6xl md:text-7xl font-[family-name:var(--font-playfair)] font-medium tracking-tight text-black dark:text-white'>
              Tenerife
            </h1>
            <p className='mt-5 text-xs sm:text-sm uppercase tracking-[0.22em] font-[family-name:var(--font-poppins)] font-semibold text-black/55 dark:text-white/55'>
              Spain · Canary Islands · July 2026
            </p>
            <p className='mt-9 max-w-md mx-auto text-lg md:text-xl italic font-[family-name:var(--font-playfair)] text-black/80 dark:text-white/80'>
              An island we could easily come back to.
            </p>
          </Reveal>
        </div>
      </section>

      {/* 2. THE JOURNEY */}
      <section className='px-6 md:px-12 pt-24 pb-12 md:pt-32 md:pb-16 text-center bg-[#faf9f6] dark:bg-black'>
        <Reveal>
          <Eyebrow>how we got there</Eyebrow>
          <h2 className='mt-4 text-4xl md:text-5xl font-[family-name:var(--font-playfair)] font-medium text-black dark:text-white'>
            The Journey
          </h2>
        </Reveal>
      </section>

      {/* 3–8. Home -> Vienna -> flight -> arrival */}
      <JourneyMapScene journey={TENERIFE_ARRIVAL_JOURNEY} heightVh={620}>
        <JourneyAnnotation range={[0.03, 0.15]} dock='upper-center'>
          <RouteLabel>Slovenia → Vienna</RouteLabel>
        </JourneyAnnotation>

        <JourneyAnnotation range={[0.17, 0.34]} dock='lower-left'>
          <InfoCard>
            <CardKicker>Why Vienna?</CardKicker>
            <p className='mt-3 text-sm sm:text-[0.95rem] font-[family-name:var(--font-poppins)] font-light text-black/80 dark:text-white/80 leading-relaxed'>
              Vienna is relatively close to us and one of the airports we fly
              from most often. This time there was another important reason:
              a direct flight to Tenerife.
            </p>
            <div className='mt-5 pt-4 border-t border-black/10 dark:border-white/10'>
              <CardKicker>Ryanair · Direct flight</CardKicker>
              <CardLine>1 Jul → 10 Jul 2026</CardLine>
              <CardPrice>
                €1,927.84{' '}
                <span className='text-xs font-[family-name:var(--font-poppins)] font-light text-black/50 dark:text-white/50'>
                  · flights for four
                </span>
              </CardPrice>
              <p className='mt-1 text-xs font-[family-name:var(--font-poppins)] text-black/45 dark:text-white/45'>
                Checked luggage: 2 × 10 kg, 2 × 20 kg
              </p>
            </div>
          </InfoCard>
        </JourneyAnnotation>

        <JourneyAnnotation range={[0.27, 0.37]} dock='upper-right'>
          <SideNote heading='A little perspective'>
            Almost ten years earlier, a similar amount took us all the way to
            the Seychelles with Qatar Airways.
          </SideNote>
        </JourneyAnnotation>

        <JourneyAnnotation range={[0.33, 0.42]} dock='lower-right'>
          <InfoCard>
            <CardKicker>One thing I always book in advance</CardKicker>
            <CardLine>Vienna Airport · Car Park 3</CardLine>
            <CardLine>1 Jul, 18:00 → 10 Jul, 22:00</CardLine>
            <CardPrice>€187.68</CardPrice>
            <p className='mt-4 text-sm font-[family-name:var(--font-poppins)] font-light text-black/75 dark:text-white/75 leading-relaxed'>
              I always book airport parking from around three hours before
              the scheduled departure until about two hours after our
              scheduled return. Delays happen — and this gives us enough
              buffer without having to think about the car.
            </p>
          </InfoCard>
        </JourneyAnnotation>

        <JourneyAnnotation range={[0.44, 0.54]} dock='upper-center'>
          <RouteLabel>Vienna → Tenerife South</RouteLabel>
        </JourneyAnnotation>

        <JourneyAnnotation range={[0.56, 0.63]} dock='center'>
          <TimeStamp size='lg'>20:55</TimeStamp>
        </JourneyAnnotation>

        <JourneyAnnotation range={[0.63, 0.7]} dock='center'>
          <TimeStamp size='sm'>+ 1 hour delay</TimeStamp>
        </JourneyAnnotation>

        <JourneyAnnotation range={[0.7, 0.8]} dock='center'>
          <TimeStamp size='md'>5 hours in the air.</TimeStamp>
        </JourneyAnnotation>

        <JourneyAnnotation range={[0.91, 1]} dock='lower-center'>
          <RouteLabel small>Tenerife South · after 3 AM</RouteLabel>
        </JourneyAnnotation>
      </JourneyMapScene>

      {/* The airport wasn't asleep */}
      <section className='px-6 md:px-12 py-20 md:py-28 bg-[#faf9f6] dark:bg-black'>
        <Reveal className='max-w-2xl mx-auto text-center'>
          <Eyebrow>Arrival</Eyebrow>
          <p className='mt-4 text-2xl md:text-3xl font-[family-name:var(--font-playfair)] italic font-medium text-black dark:text-white'>
            The airport wasn&apos;t asleep.
          </p>
          <Paragraphs
            className='mt-8 text-left md:text-center'
            items={[
              'Despite arriving after 3 AM, Tenerife South Airport was still surprisingly active. Rental-car desks were operating for arriving passengers, and there were plenty of taxis outside.',
              'This surprised me — before the trip, I had worried about arriving at such a late hour.',
            ]}
          />
        </Reveal>
      </section>

      {/* 9–11. The transfer I wouldn't book again */}
      <section className='px-6 md:px-12 pt-16 pb-16 md:pt-20 md:pb-20 bg-[#eae9e6] dark:bg-black'>
        <Reveal className='max-w-2xl mx-auto text-center'>
          <Eyebrow>A first for us</Eyebrow>
          <h2 className='mt-4 text-3xl md:text-4xl font-[family-name:var(--font-playfair)] font-medium text-black dark:text-white'>
            The transfer I wouldn&apos;t book again
          </h2>
          <Paragraphs
            className='mt-8 text-left md:text-center'
            items={[
              "Because of a bad experience on a previous trip, I didn't want to risk arriving in the middle of the night without transportation.",
              'For the first time, I pre-booked our airport transfer through Booking.com.',
            ]}
          />
        </Reveal>

        <Reveal delay={0.1} className='mt-14 md:mt-16 max-w-2xl mx-auto'>
          <ImagePlaceholder
            variant='screenshot'
            label='TRANSFER BOOKING SCREENSHOT'
            sublabel='Real screenshot of the Booking.com reservation to come.'
          />
        </Reveal>

        <Reveal delay={0.15} className='mt-14 md:mt-16 max-w-2xl mx-auto'>
          <Paragraphs
            className='text-left md:text-center'
            items={[
              'The booking itself was easy. I entered our flight details, destination and arrival information, paid in advance, and that was it.',
              'The confusing part came after landing.',
              'We first went outside to the taxis and explained that we already had a prepaid transfer. I then had to walk back into the airport.',
              'Inside, I eventually found a board where a sheet of paper with my name and our destination was displayed. I had to take that paper back outside and give it to the driver before we could finally leave.',
            ]}
          />
        </Reveal>

        <Reveal
          delay={0.1}
          className='mt-16 md:mt-20 flex flex-col sm:flex-row items-center justify-center gap-10 sm:gap-16 text-center'
        >
          <div>
            <p className='text-xs uppercase tracking-[0.18em] font-[family-name:var(--font-poppins)] font-semibold text-black/45 dark:text-white/45'>
              Pre-booked transfer
            </p>
            <p className='mt-2 text-3xl font-[family-name:var(--font-playfair)] font-medium text-black dark:text-white'>
              €60
            </p>
          </div>
          <span className='hidden sm:block h-10 w-px bg-black/10 dark:bg-white/15' />
          <div>
            <p className='text-xs uppercase tracking-[0.18em] font-[family-name:var(--font-poppins)] font-semibold text-black/45 dark:text-white/45'>
              Taxi at the airport
            </p>
            <p className='mt-2 text-3xl font-[family-name:var(--font-playfair)] font-medium text-black/70 dark:text-white/70'>
              around €40
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.1} className='mt-20 md:mt-24 max-w-xl mx-auto text-center'>
          <Eyebrow>Would I pre-book it again?</Eyebrow>
          <p className='mt-4 text-6xl md:text-7xl font-[family-name:var(--font-playfair)] italic font-medium text-black dark:text-white'>
            No.
          </p>
          <Paragraphs
            className='mt-8 text-left md:text-center'
            items={[
              "At Tenerife South, I wouldn't. Even after 3 AM there were plenty of taxis waiting outside.",
              'We paid more for the pre-booked transfer and actually made the whole process more complicated.',
            ]}
          />
        </Reveal>
      </section>

      {/* 12. Final journey animation — Tenerife South -> Roca Nivaria */}
      <JourneyMapScene journey={TENERIFE_TRANSFER_JOURNEY} heightVh={240}>
        <JourneyAnnotation range={[0.05, 0.18]} dock='upper-center'>
          <RouteLabel>Tenerife South → Roca Nivaria · Playa Paraíso</RouteLabel>
        </JourneyAnnotation>

        <JourneyAnnotation range={[0.8, 1]} dock='lower-center'>
          <div className='flex flex-col items-center gap-3 text-center'>
            <TimeStamp size='lg'>04:00</TimeStamp>
            <p className='text-base sm:text-lg font-[family-name:var(--font-poppins)] font-light text-black/70 dark:text-white/70'>
              Finally, our hotel.
            </p>
          </div>
        </JourneyAnnotation>
      </JourneyMapScene>

      <footer className='flex flex-col items-center gap-3 px-8 py-12 bg-[#2a2a2a] text-white text-center'>
        <Image
          src={LOGO_SRC}
          alt='Metkish logo'
          width={240}
          height={240}
          className='w-[92px] md:w-[120px] h-auto -mt-8 mb-2 md:-mt-9 md:mb-1'
        />
        <p className='text-sm italic lowercase font-[family-name:var(--font-poppins)] font-medium text-white/70'>
          travel · memories · places worth remembering
        </p>
        <nav className='flex items-center gap-2 sm:gap-6 mt-1'>
          <Link
            href='/#travels'
            className='inline-flex items-center min-h-11 px-2 text-sm font-[family-name:var(--font-poppins)] uppercase tracking-wide text-white/80 hover:text-white'
          >
            Travels
          </Link>
          <Link
            href='/#guides'
            className='inline-flex items-center min-h-11 px-2 text-sm font-[family-name:var(--font-poppins)] uppercase tracking-wide text-white/80 hover:text-white'
          >
            Behind the Trip
          </Link>
          <Link
            href='/about'
            className='inline-flex items-center min-h-11 px-2 text-sm font-[family-name:var(--font-poppins)] uppercase tracking-wide text-white/80 hover:text-white'
          >
            About
          </Link>
        </nav>
        <a
          href='mailto:info@metkish.com'
          className='inline-flex items-center min-h-11 px-2 text-sm font-[family-name:var(--font-poppins)] text-white/90 hover:text-white underline underline-offset-4'
        >
          info@metkish.com ↗
        </a>
        <p className='mt-4 text-xs font-[family-name:var(--font-poppins)] text-white/40'>
          © {new Date().getFullYear()} Metkish. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
