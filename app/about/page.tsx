'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

const LOGO_SRC = '/metkish-logo.png';
const SUITCASES_SRC = '/About/Four%20suitcases.jpg';

// Same fade-up-on-scroll rhythm used throughout the site (see TravelGallery):
// once-only, generous viewport threshold, no bounce or flashiness.
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

// The small uppercase kicker already used above each destination's title in
// TravelGallery — reused here as the section marker instead of introducing a
// new heading style or a blog-style bold headline per section.
function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <span className='block text-sm md:text-[0.95rem] uppercase tracking-[0.18em] font-[family-name:var(--font-poppins)] font-semibold text-black/45 dark:text-white/45'>
      {children}
    </span>
  );
}

// The larger standalone lines that punctuate the story. Sized per-use so a
// short punchy line and a longer sentence both read comfortably.
function Statement({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      className={`font-[family-name:var(--font-playfair)] italic font-medium text-black dark:text-white text-center leading-snug ${className}`}
    >
      {children}
    </p>
  );
}

function Paragraphs({ items }: { items: string[] }) {
  return (
    <div className='space-y-5'>
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

export default function AboutPage() {
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

      {/* Hero */}
      <section className='px-6 md:px-12 pt-36 md:pt-44 pb-20 md:pb-28 flex flex-col items-center text-center'>
        <Reveal className='max-w-2xl mx-auto flex flex-col items-center'>
          <Eyebrow>About</Eyebrow>
          <h1 className='mt-5 text-4xl sm:text-5xl md:text-6xl font-[family-name:var(--font-playfair)] font-medium text-black dark:text-white'>
            Behind the journeys.
          </h1>
          <p className='mt-6 max-w-xl text-base md:text-lg font-[family-name:var(--font-poppins)] text-black/80 dark:text-white/80'>
            We are a family of four. I just happen to be the one planning
            where we go next.
          </p>
        </Reveal>

        <Reveal
          delay={0.1}
          className='mt-14 md:mt-16 w-full flex flex-col items-center'
        >
          <div className='relative w-full max-w-sm sm:max-w-md md:max-w-lg aspect-[3595/4794] overflow-hidden rounded-[2px]'>
            <Image
              src={SUITCASES_SRC}
              alt='Four colourful suitcases lined up at home before a trip'
              fill
              sizes='(max-width: 768px) 90vw, 480px'
              className='object-cover transition-transform duration-300 hover:scale-105'
              priority
            />
          </div>
          <span className='mt-4 italic text-sm font-[family-name:var(--font-poppins)] text-black/60 dark:text-white/60'>
            Four suitcases. Countless plans.
          </span>
        </Reveal>
      </section>

      {/* It started with a missed flight */}
      <section className='px-6 md:px-12 py-16 md:py-20'>
        <Reveal className='max-w-2xl mx-auto'>
          <Eyebrow>It started with a missed flight</Eyebrow>
          <div className='mt-6'>
            <Paragraphs
              items={[
                'In 2013, I surprised my husband with tickets to an FC Barcelona match. We were flying from Venice and, thinking we had plenty of time, decided to visit the city before our flight.',
                'Roadworks, a confused GPS and some very poor time management later, we missed it.',
                "Luckily, there was another flight that day. We bought new tickets and eventually made it to Barcelona — running into the stadium just as the match was starting.",
                "We've been at the airport at least two hours early ever since.",
              ]}
            />
          </div>
        </Reveal>
        <Reveal delay={0.1} className='mt-14 md:mt-16'>
          <Statement className='text-2xl md:text-3xl max-w-xl mx-auto'>
            Some travel lessons stay with you.
          </Statement>
        </Reveal>
      </section>

      {/* Somewhere along the way, I became the planner */}
      <section className='px-6 md:px-12 py-16 md:py-20'>
        <Reveal className='max-w-2xl mx-auto'>
          <Eyebrow>Somewhere along the way, I became the planner</Eyebrow>
          <div className='mt-6'>
            <Paragraphs
              items={[
                'Later that year, we booked an organised trip to Paris and London. When it was cancelled because too few people had signed up, I decided to organise everything myself.',
                'It worked — mostly.',
                'Our London accommodation turned out to be a basement apartment that felt more like a bunker, and I barely slept.',
                "Years later, I can probably call myself a Booking.com veteran. I spend far too much time checking locations, rooms, reviews and photos — and every now and then, a place still manages to surprise me. Usually not in the way I hoped.",
                'When our children were two and three and a half, I planned our trip to the Seychelles entirely on our own. That was the first bigger family journey I organised.',
                'And somewhere along the way I realised that I genuinely enjoy the part many people would rather skip: researching destinations, comparing flights, finding accommodation and figuring out how everything fits together.',
              ]}
            />
          </div>
        </Reveal>
      </section>

      {/* Comfort, not luxury */}
      <section className='px-6 md:px-12 py-20 md:py-28'>
        <Reveal className='max-w-2xl mx-auto'>
          <Eyebrow>Comfort, not luxury</Eyebrow>
          <div className='mt-6'>
            <Paragraphs
              items={[
                "We don't travel as cheaply as possible, and we don't travel luxuriously either.",
                "We look for comfortable, clean places in good locations. I'd rather postpone a trip than travel at any cost and spend it somewhere we don't feel comfortable.",
                'The same goes for getting there.',
                "We don't choose an exhausting flight with a long layover simply because it's cheaper. After once waiting for more than an hour with two tired little children for a shuttle to a remote airport car park, we started parking within easy reach of the terminal.",
                'After another late-night arrival left us waiting more than an hour for a taxi, I started arranging transfers in advance whenever we arrive late.',
              ]}
            />
          </div>
        </Reveal>
        <Reveal delay={0.1} className='mt-16 md:mt-24'>
          <Statement className='text-3xl md:text-4xl max-w-2xl mx-auto'>
            For us, comfort isn&apos;t about luxury. It&apos;s about removing
            unnecessary stress.
          </Statement>
        </Reveal>
      </section>

      {/* We don't try to see everything anymore */}
      <section className='px-6 md:px-12 py-16 md:py-20'>
        <Reveal className='max-w-2xl mx-auto'>
          <Eyebrow>We don&apos;t try to see everything anymore</Eyebrow>
          <div className='mt-6'>
            <Paragraphs
              items={[
                'We used to plan almost every day of a trip because we wanted to make the most of our time.',
                'Eventually, we realised we were sometimes making ourselves tired and grumpy instead.',
                'So I still plan. A lot.',
                'But the plan is now a framework, not a schedule.',
                "When we arrived at our hotel in Tenerife at four in the morning, our only plan for that first day was the hotel pool and perhaps a walk nearby. We didn't even pick up our rental car until the following day.",
                "I research before we leave so that once we're there, we can decide what we actually feel like doing.",
              ]}
            />
          </div>
        </Reveal>
        <Reveal delay={0.1} className='mt-14 md:mt-16'>
          <Statement className='text-2xl md:text-3xl max-w-xl mx-auto'>
            I plan a lot so we don&apos;t have to plan much when we&apos;re
            there.
          </Statement>
        </Reveal>
      </section>

      {/* What looks easy online isn't always easy in real life */}
      <section className='px-6 md:px-12 py-16 md:py-20'>
        <Reveal className='max-w-2xl mx-auto'>
          <Eyebrow>
            What looks easy online isn&apos;t always easy in real life
          </Eyebrow>
          <div className='mt-6'>
            <Paragraphs
              items={[
                'When we landed in the Seychelles with two small children and our luggage, our plan sounded simple: take the local bus to the port and continue by boat.',
                'We had read that it was an easy option.',
                'Then the bus arrived.',
                'It was so crowded that fitting ourselves inside would have been difficult enough, never mind two small children and all our luggage.',
                "Technically, the information we'd found online was correct. Practically, it wasn't right for us.",
                'Today there is more information available than ever, and AI has made planning even easier. I use it too — including while creating this website.',
                "But AI is a tool, not the entire process. I still check current information, compare options and do my own research. A restaurant recommendation isn't very useful if the restaurant has closed, and a transport option that technically exists isn't necessarily the one that makes sense for our family.",
              ]}
            />
          </div>
        </Reveal>
        <Reveal delay={0.1} className='mt-14 md:mt-16'>
          <Statement className='text-xl md:text-2xl max-w-2xl mx-auto'>
            Knowing that something can be done isn&apos;t quite the same as
            knowing whether I&apos;d actually recommend doing it.
          </Statement>
        </Reveal>
      </section>

      {/* Football often comes with us — kept short, on purpose */}
      <section className='px-6 md:px-12 py-12 md:py-16'>
        <Reveal className='max-w-xl mx-auto'>
          <Eyebrow>Football often comes with us</Eyebrow>
          <div className='mt-6'>
            <Paragraphs
              items={[
                'We are a football-loving family, so matches and stadiums have a habit of finding their way into our travels.',
                "Sometimes football is part of the trip. Sometimes it's the reason for the trip in the first place.",
                "Either way, our journeys aren't only about seeing famous places. They're about the things we enjoy experiencing together.",
              ]}
            />
          </div>
          {/* Future photo slot: a small stadium/match detail (a scarf, seats,
              a shot from behind the crowd) would sit naturally here once
              available — no restructuring needed, just add an image below
              the paragraphs. */}
        </Reveal>
      </section>

      {/* These aren't travel photographs. They're travel memories. */}
      <section className='px-6 md:px-12 py-16 md:py-20'>
        <Reveal className='max-w-xl md:ml-[8%] md:mr-auto'>
          <Eyebrow>
            These aren&apos;t travel photographs. They&apos;re travel
            memories.
          </Eyebrow>
          <div className='mt-6'>
            <Paragraphs
              items={[
                "I'm not a photographer, and I don't travel with the intention of documenting everything.",
                "Most of the photographs here were simply taken with my phone because it's always with me. I photograph little pieces of our journeys — a place, a view, a shadow, something I want to remember.",
                "Sometimes the photographs turn out beautifully. Sometimes they don't.",
                "And many of the best things that happen while we're travelling never make it into a photograph at all.",
                "That's fine with me.",
              ]}
            />
          </div>
          {/* Future photo slot: a handful of small, imperfect phone photos —
              a shadow, hands, feet, a detail from a trip — could sit beside
              or beneath this text as a loose, uncurated row rather than a
              polished gallery, reinforcing the point rather than
              contradicting it. */}
        </Reveal>
        <Reveal delay={0.1} className='mt-14 md:mt-16'>
          <Statement className='text-2xl md:text-3xl max-w-xl mx-auto'>
            I&apos;d rather experience the trip than experience it through a
            camera.
          </Statement>
        </Reveal>
      </section>

      {/* Why this site exists — closing section */}
      <section className='px-6 md:px-12 py-20 md:py-28'>
        <Reveal className='max-w-2xl mx-auto'>
          <Eyebrow>Why this site exists</Eyebrow>
          <div className='mt-6'>
            <Paragraphs
              items={[
                "This isn't a collection of perfect trips.",
                "Some places amazed us. Others didn't. We've stayed somewhere we loved and somewhere that looked much better online. We've made plans that worked perfectly and others that didn't work at all.",
                'Those are the experiences I want to share.',
                "Not to tell you how you should travel, but to show you how we did it — what worked for us, what didn't, what I would do differently and what I'd happily do all over again.",
                'Because every family travels differently.',
              ]}
            />
          </div>
        </Reveal>
        <Reveal delay={0.1} className='mt-16 md:mt-24'>
          <Statement className='text-3xl md:text-5xl max-w-2xl mx-auto'>
            This is simply how we found our way of travelling.
          </Statement>
        </Reveal>
      </section>

      <footer className='flex flex-col items-center gap-3 px-8 py-12 bg-[#2a2a2a] text-white text-center'>
        <span className='text-2xl font-[family-name:var(--font-playfair)] font-bold'>
          The World Through My Eyes
        </span>
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
            Guides
          </Link>
          <Link
            href='/about'
            aria-current='page'
            className='inline-flex items-center min-h-11 px-2 text-sm font-[family-name:var(--font-poppins)] uppercase tracking-wide text-white'
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
