'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

const LOGO_SRC = '/metkish-logo.png';
const SUITCASES_SRC = '/About/Four%20suitcases.jpg';
const AIRPORT_SRC = '/About/At%20the%20airport.jpeg';
const STADIUM_SRC = '/About/Football%20stadium.jpeg';

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
// new heading style or a blog-style bold headline per section. Kept subtle
// on purpose (small, not bold, not black) but with slightly higher contrast
// than a first pass so it reads clearly against the page background.
function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <span className='block text-sm md:text-[0.95rem] uppercase tracking-[0.18em] font-[family-name:var(--font-poppins)] font-semibold text-black/60 dark:text-white/60'>
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

      {/* Hero — unchanged: this opening works, so it stays exactly as it was */}
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
      <section className='px-6 md:px-12 pt-16 pb-[51px] md:pt-20 md:pb-16'>
        <Reveal className='max-w-2xl mx-auto'>
          <Eyebrow>It started with a missed flight</Eyebrow>
          <div className='mt-6'>
            <Paragraphs
              items={[
                'In 2013, I surprised my husband with tickets to an FC Barcelona match. We were flying from Venice and, thinking we had plenty of time, decided to visit the city before our flight.',
                'Roadworks, a confused GPS and some very poor time management later, we missed it.',
                'Luckily, there was another flight that day. We bought new tickets and made it to Barcelona — running into the stadium just as the match was starting.',
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
      <section className='px-6 md:px-12 pt-[51px] pb-16 md:pt-16 md:pb-20'>
        <Reveal className='max-w-2xl mx-auto'>
          <Eyebrow>Somewhere along the way, I became the planner</Eyebrow>
          <div className='mt-6'>
            <Paragraphs
              items={[
                "Later that year, an organised trip we'd booked to Paris and London was cancelled because too few people had signed up. So I decided to organise everything myself.",
                'It worked — mostly. Our London accommodation turned out to be a basement apartment that felt more like a bunker, and I barely slept.',
                'A few years later, when our children were two and three and a half, I planned our first bigger family journey to the Seychelles entirely on my own.',
                'Somewhere along the way, I realised I genuinely enjoy the part many people would rather skip: researching destinations, comparing flights, finding the right accommodation and figuring out how everything fits together.',
              ]}
            />
          </div>
        </Reveal>
      </section>

      {/* Airport photograph — an old, spontaneous family snapshot, not a
          polished shot. Landscape frame, modest width so it doesn't compete
          with the hero photo; no caption, no text over the image. */}
      <section className='px-6 md:px-12 py-10 md:py-14'>
        <Reveal className='w-full max-w-xl mx-auto'>
          <div className='relative w-full aspect-[16/9] overflow-hidden rounded-[2px]'>
            <Image
              src={AIRPORT_SRC}
              alt='Two children sitting on suitcases at an airport, photographed from behind'
              fill
              sizes='(max-width: 768px) 90vw, 576px'
              className='object-cover'
            />
          </div>
        </Reveal>
      </section>

      {/* Comfort, not luxury — the most important idea on the page */}
      <section className='px-6 md:px-12 pt-20 pb-16 md:pt-28 md:pb-[90px]'>
        <Reveal className='max-w-2xl mx-auto'>
          <Eyebrow>Comfort, not luxury</Eyebrow>
          <div className='mt-6'>
            <Paragraphs
              items={[
                "We don't travel as cheaply as possible, and we don't travel luxuriously either.",
                "We look for comfortable, clean places in good locations. I'd rather postpone a trip than travel at any cost and spend it somewhere we don't feel comfortable.",
                'Over the years, small experiences changed the way I plan: waiting with two tired little children for a shuttle to a remote airport car park, spending more than an hour waiting for a taxi after a late-night arrival, or discovering that a transport option that sounded easy online wasn’t nearly as practical with children and luggage.',
                'Now I prefer to spend a little more where it genuinely makes travelling easier — not for luxury, but to avoid unnecessary stress.',
              ]}
            />
          </div>
        </Reveal>
        <Reveal delay={0.1} className='mt-16 md:mt-24'>
          <Statement className='text-2xl md:text-3xl max-w-2xl mx-auto'>
            For us, comfort isn&apos;t about luxury. It&apos;s about removing
            unnecessary stress.
          </Statement>
        </Reveal>
      </section>

      {/* We don't try to see everything anymore */}
      <section className='px-6 md:px-12 pt-[51px] pb-[51px] md:pt-16 md:pb-16'>
        <Reveal className='max-w-2xl mx-auto'>
          <Eyebrow>We don&apos;t try to see everything anymore</Eyebrow>
          <div className='mt-6'>
            <Paragraphs
              items={[
                'We used to plan almost every day of a trip because we wanted to make the most of our time.',
                'Eventually, we realised we were sometimes making ourselves tired and grumpy instead.',
                'So I still plan. A lot. But the plan is now a framework, not a schedule.',
                "We leave room for slow mornings, tired days, spontaneous changes and simply deciding that we'd rather stay by the pool.",
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
      <section className='px-6 md:px-12 pt-[51px] pb-[51px] md:pt-16 md:pb-16'>
        <Reveal className='max-w-2xl mx-auto'>
          <Eyebrow>
            What looks easy online isn&apos;t always easy in real life
          </Eyebrow>
          <div className='mt-6'>
            <Paragraphs
              items={[
                'When we landed in the Seychelles with two small children and our luggage, we planned to take the local bus from the airport to the port. Online, it sounded simple.',
                'In reality, the bus was so crowded that getting ourselves inside would have been difficult enough, never mind the children and our luggage.',
                "Technically, the information we'd found was correct. Practically, it wasn't right for us.",
                'Today, AI makes finding ideas and planning easier than ever, and I use it too — including while creating this website. But I still check current information, compare options and do my own research.',
                'Information can be correct and still not be practical for our family.',
              ]}
            />
          </div>
        </Reveal>
        <Reveal delay={0.1} className='mt-14 md:mt-16'>
          <Statement className='text-2xl md:text-3xl max-w-2xl mx-auto'>
            Knowing that something can be done isn&apos;t quite the same as
            knowing whether I&apos;d actually recommend doing it.
          </Statement>
        </Reveal>
      </section>

      {/* Football often comes with us — kept short on purpose, paired with
          the stadium photograph as a side-by-side editorial composition on
          desktop; stacks naturally on mobile. No card, no border, no
          football graphics — just the photo and the text. */}
      <section className='px-6 md:px-12 pt-[38px] pb-12 md:pt-[51px] md:pb-16'>
        <Reveal className='max-w-3xl mx-auto'>
          <div className='flex flex-col md:flex-row md:items-center gap-8 md:gap-12'>
            <div className='w-full md:w-[42%] md:shrink-0'>
              <div className='relative w-full aspect-[3/4] overflow-hidden rounded-[2px]'>
                <Image
                  src={STADIUM_SRC}
                  alt='Watching a football match from the stands, photographed from behind'
                  fill
                  sizes='(max-width: 768px) 90vw, 320px'
                  className='object-cover'
                />
              </div>
            </div>
            <div className='w-full md:flex-1'>
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
            </div>
          </div>
        </Reveal>
      </section>

      {/* These aren't travel photographs. They're travel memories. — now on
          the same main text axis as every other section; no photo added
          here, the photographs already seen make the point. */}
      <section className='px-6 md:px-12 pt-16 pb-[51px] md:pt-20 md:pb-16'>
        <Reveal className='max-w-2xl mx-auto'>
          <Eyebrow>
            These aren&apos;t travel photographs. They&apos;re travel
            memories.
          </Eyebrow>
          <div className='mt-6'>
            <Paragraphs
              items={[
                "I'm not a photographer, and I don't travel to document everything.",
                "Most of the photographs here were taken with my phone simply because it's always with me — little pieces of our journeys I wanted to remember.",
                "Some turn out beautifully. Some don't. And many of our best moments were never photographed at all.",
              ]}
            />
          </div>
        </Reveal>
        <Reveal delay={0.1} className='mt-14 md:mt-16'>
          <Statement className='text-2xl md:text-3xl max-w-xl mx-auto'>
            I&apos;d rather experience the trip than experience it through a
            camera.
          </Statement>
        </Reveal>
      </section>

      {/* Why this site exists — closing section */}
      <section className='px-6 md:px-12 pt-16 pb-20 md:pt-[90px] md:pb-28'>
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
          <Statement className='text-2xl md:text-3xl max-w-2xl mx-auto'>
            This is simply how we found our way of travelling.
          </Statement>
        </Reveal>
      </section>

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
