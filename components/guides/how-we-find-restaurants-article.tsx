'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { InstagramIcon, PinterestIcon } from '@/components/ui/social-icons';
import { INSTAGRAM_URL, PINTEREST_URL } from '@/lib/social-links';

const LOGO_SRC = '/metkish-logo.png';

// Plain-string source of truth for the sample ChatGPT prompt in "Try It on
// Your Next Trip" -- used both for the on-page ExamplePrompt text and the
// copy-to-clipboard button inside it, so the two can never drift out of
// sync. Real curly-quote/apostrophe characters rather than JSX entities,
// since entities only decode inside literal JSX text, not inside a JS
// string handed to navigator.clipboard.writeText (see the apostrophe bug
// already fixed elsewhere in this article's paragraph arrays).
const SAMPLE_PROMPT =
  '\u201cWe\u2019re a family of four near La Rambla in Barcelona. It\u2019s 10 AM and we\u2019re looking for a good brunch spot within a 10-minute walk. Suggest three highly rated restaurants that are open now, with a short description of each.\u201d';
const HONEST_GREENS_PHOTO_SRC =
  '/Behind%20the%20trip/Restaurants/Honest_green_brunch_web.jpeg';
const BAR_TAPAS_PHOTO_SRC =
  '/Behind%20the%20trip/Restaurants/Bar_tapas_web.jpeg';
const PAELLA_PHOTO_SRC = '/Behind%20the%20trip/Restaurants/Paella_web.jpeg';

// Same fade-up-on-scroll rhythm used throughout the site (About, Italy,
// Tenerife, the El Clásico article): once-only, generous viewport
// threshold, no bounce. Duplicated locally rather than imported, following
// this codebase's established per-page convention.
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
// components/guides/el-clasico-tickets-article.tsx (same Playfair scale as
// every chapter opener on Italy/Tenerife), duplicated locally per this
// codebase's established per-page convention rather than extracted into a
// shared import.
function SectionHeading({ children }: { children: ReactNode }) {
  return (
    <h2 className='text-3xl md:text-4xl font-[family-name:var(--font-playfair)] font-medium text-black dark:text-white'>
      {children}
    </h2>
  );
}

// Small uppercase kicker/label -- the same token used site-wide and in the
// El Clásico article, reused here for the "Behind the Trip · Guide"
// breadcrumb above the title.
function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <span className='block text-sm md:text-[0.95rem] uppercase tracking-[0.18em] font-[family-name:var(--font-poppins)] font-semibold text-black/60 dark:text-white/60'>
      {children}
    </span>
  );
}

// Body copy -- byte-identical to el-clasico-tickets-article.tsx's
// Paragraphs component (left-aligned editorial column), duplicated locally
// per this codebase's established per-page convention.
function Paragraphs({ items }: { items: string[] }) {
  return (
    <div className='space-y-4'>
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

// Minimal text-style copy-to-clipboard button -- same typography/hover
// treatment as the site's "Read" links elsewhere on the site (text-sm,
// Poppins medium, underline on hover), no button background, border or
// shadow, so it reads as part of the editorial layout rather than a UI
// control. Shows a brief "Copied!" confirmation in place of its own
// label instead of a toast/alert, per this step's explicit wording. The
// clipboard call is wrapped in a try/catch since the Clipboard API can
// be unavailable (e.g. an insecure context) -- it then simply does
// nothing rather than showing a broken state.
function CopyPromptButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable -- fail quietly.
    }
  };

  return (
    <button
      type='button'
      onClick={handleCopy}
      className='mt-3 inline-flex items-center min-h-11 text-sm font-[family-name:var(--font-poppins)] font-medium text-black dark:text-white hover:underline underline-offset-4'
    >
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
}

// A copyable example prompt -- deliberately its own visual identity,
// separate from the sitewide InlineTip "My tip" treatment used elsewhere
// on the site (e.g. Barcelona's Getting Around/Sagrada Familia tips).
// Per this step's explicit request, it has no pink left rule or left
// padding at all, so it reads as plain article content rather than an
// aside: the label, prompt text and Copy button all sit flush with the
// surrounding paragraphs, with no colored background, box, shadow or
// other decoration -- same restraint as every other control on this
// page. The small uppercase "Example Prompt" label is what distinguishes
// it from body text, never "My tip" wording.
function ExamplePrompt({ text }: { text: string }) {
  return (
    <div>
      <span className='block text-sm uppercase tracking-[0.18em] font-[family-name:var(--font-poppins)] font-semibold text-black/40 dark:text-white/40'>
        Example Prompt
      </span>
      <p className='mt-2 text-base italic font-[family-name:var(--font-poppins)] font-light text-black/75 dark:text-white/75 leading-relaxed'>
        {text}
      </p>
      <CopyPromptButton text={text} />
    </div>
  );
}

// "How We Find Restaurants When Travelling" (Behind the Trip). Shares its
// shell (fixed logo/home link, hero header, article sections, footer) with
// el-clasico-tickets-article.tsx, the site's other full Behind the Trip
// article, rather than inventing a new layout.
export default function HowWeFindRestaurantsArticle() {
  const [pastHero, setPastHero] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      // On mobile the icon should shrink almost immediately on scroll
      // rather than waiting for half the viewport height, since a phone's
      // viewport height makes that threshold feel sluggish; desktop keeps
      // the original viewport-relative threshold. Same behaviour as every
      // other page on the site.
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
        {/* HERO -- same header shape as the El Clásico article's hero
            (Eyebrow, large Playfair H1), intro paragraphs in place of the
            earlier placeholder. */}
        <header className='pt-28 sm:pt-36 md:pt-44 pb-12 md:pb-16 max-w-2xl mx-auto text-center'>
          <Reveal>
            <Eyebrow>Behind the Trip · Guide</Eyebrow>
            <h1 className='mt-5 text-4xl sm:text-5xl md:text-6xl font-[family-name:var(--font-playfair)] font-medium text-black dark:text-white'>
              How We Find Restaurants When Travelling
            </h1>
          </Reveal>
          <Reveal delay={0.05} className='mt-8 md:mt-9 space-y-4'>
            <p className='text-base md:text-lg font-[family-name:var(--font-poppins)] text-black/80 dark:text-white/80'>
              Finding a good restaurant while travelling isn&apos;t always
              easy. Especially with two hungry kids, when nobody wants to
              spend another half an hour walking around looking at menus.
            </p>
            <p className='text-base md:text-lg font-[family-name:var(--font-poppins)] text-black/80 dark:text-white/80'>
              During our recent trip to Barcelona, we tried something
              different. Instead of researching restaurants in advance, we
              used ChatGPT to find somewhere to eat whenever we got hungry.
            </p>
            <p className='text-base md:text-lg font-[family-name:var(--font-poppins)] text-black/80 dark:text-white/80'>
              And it worked better than we expected.
            </p>
          </Reveal>
        </header>

        {/* JUST TELL AI WHAT YOU'RE LOOKING FOR */}
        <section className='max-w-2xl mx-auto pt-12 md:pt-14 pb-12 md:pb-14'>
          <Reveal>
            <SectionHeading>Just Tell AI What You&apos;re Looking For</SectionHeading>
            <div className='mt-6'>
              <Paragraphs
                items={[
                  'Our approach was simple. Wherever we happened to be, I opened ChatGPT and shared our location.',
                  "I explained what kind of food we wanted, how far we were willing to walk and what time it was. That last detail was especially important in the morning, when many restaurant kitchens weren't open yet.",
                  'ChatGPT usually suggested around three places. I checked their ratings, compared the options and picked one.',
                  'We never chose a restaurant with poor reviews. AI helped us discover places, but the final decision was always ours.',
                ]}
              />
            </div>
          </Reveal>
        </section>

        {/* OUR FIRST FIND: HONEST GREENS */}
        <section className='max-w-2xl mx-auto pt-12 md:pt-14 pb-12 md:pb-14'>
          <Reveal>
            <SectionHeading>Our First Find: Honest Greens</SectionHeading>
            <div className='mt-6'>
              <Paragraphs
                items={[
                  'One of the suggestions was Honest Greens.',
                  "And what a find! The food was absolutely incredible. All four of us loved it, and I'm pretty sure we would never have discovered this place on our own.",
                ]}
              />
            </div>
            <Reveal delay={0.05} className='mt-8 md:mt-9'>
              <div className='relative w-full overflow-hidden rounded-[2px]'>
                <Image
                  src={HONEST_GREENS_PHOTO_SRC}
                  alt='Our first AI restaurant find in Barcelona — brunch at Honest Greens.'
                  width={3021}
                  height={3441}
                  sizes='(min-width: 768px) 672px, 100vw'
                  className='w-full h-auto'
                />
              </div>
              <p className='mt-3 text-center text-sm italic font-[family-name:var(--font-poppins)] text-black/55 dark:text-white/55'>
                Our first AI restaurant find in Barcelona — brunch at Honest
                Greens.
              </p>
            </Reveal>
          </Reveal>
        </section>

        {/* A TAPAS BAR WE WOULD HAVE WALKED PAST */}
        <section className='max-w-2xl mx-auto pt-12 md:pt-14 pb-12 md:pb-14'>
          <Reveal>
            <SectionHeading>A Tapas Bar We Would Have Walked Past</SectionHeading>
            <div className='mt-6'>
              <Paragraphs
                items={[
                  'The following day, after visiting the waterfront, we were walking back through the Gothic Quarter when we decided to stop for lunch.',
                  'This time, we wanted traditional Spanish tapas.',
                  'ChatGPT suggested a restaurant, and we followed the directions. Unfortunately, when we arrived, it was closed.',
                  'So we asked again.',
                  'The next recommendation was Bodega Biarritz, a small tapas bar with an entrance we probably would have walked straight past.',
                  'We decided to give it a try, ordered a tapas tasting menu for four and ended up having another fantastic meal.',
                  'It was exactly the kind of place we hoped to discover in Barcelona.',
                ]}
              />
            </div>
            <Reveal delay={0.05} className='mt-8 md:mt-9 max-w-[430px] mx-auto'>
              <Image
                src={BAR_TAPAS_PHOTO_SRC}
                alt='The entrance to Bodega Biarritz, a small tapas bar tucked into the Gothic Quarter in Barcelona.'
                width={4284}
                height={5712}
                sizes='430px'
                className='w-full h-auto rounded-[2px]'
              />
              <p className='mt-3 text-center text-sm italic font-[family-name:var(--font-poppins)] text-black/55 dark:text-white/55'>
                Bodega Biarritz, a tapas bar we visited in Barcelona.
              </p>
            </Reveal>
          </Reveal>
        </section>

        {/* NOT JUST ABOUT FINDING RESTAURANTS */}
        <section className='max-w-2xl mx-auto pt-12 md:pt-14 pb-12 md:pb-14'>
          <Reveal>
            <SectionHeading>Not Just About Finding Restaurants</SectionHeading>
            <div className='mt-6'>
              <Paragraphs
                items={[
                  'What made ChatGPT even more useful was that it helped us once we were sitting at the table.',
                  'We could photograph a menu and ask what a particular dish contained, what something meant or which dishes might suit our family.',
                  "And it wasn't always about Spanish food.",
                  'One day, the kids wanted pizza. We used the same approach and found a restaurant near Plaça de Catalunya serving delicious, long rectangular pizzas.',
                  'Whatever we felt like eating, we could search for something that suited us without spending ages looking.',
                ]}
              />
            </div>
            <Reveal delay={0.05} className='mt-8 md:mt-9 max-w-[480px] mx-auto'>
              <Image
                src={PAELLA_PHOTO_SRC}
                alt='A seafood paella with prawns, mussels and clams, found in Barcelona with the help of AI.'
                width={4281}
                height={4426}
                sizes='480px'
                className='w-full h-auto rounded-[2px]'
              />
              <p className='mt-3 text-center text-sm italic font-[family-name:var(--font-poppins)] text-black/55 dark:text-white/55'>
                Traditional Spanish paella with seafood.
              </p>
            </Reveal>
          </Reveal>
        </section>

        {/* WHAT WE LEARNED */}
        <section className='max-w-2xl mx-auto pt-12 md:pt-14 pb-12 md:pb-14'>
          <Reveal>
            <SectionHeading>What We Learned</SectionHeading>
            <div className='mt-6'>
              <Paragraphs
                items={[
                  "Of course, AI doesn't always get everything right. The closed restaurant in the Gothic Quarter was a good reminder to double-check opening hours.",
                  'And we always checked restaurant ratings before deciding where to go.',
                  "But here's what surprised us most: we didn't have a single disappointing meal during our entire stay in Barcelona.",
                  'Without AI, we probably would have ended up choosing familiar fast-food options much more often.',
                  'Instead, we discovered some incredible restaurants, enjoyed fantastic food and spent far less time deciding where to eat.',
                ]}
              />
            </div>
          </Reveal>
        </section>

        {/* TRY IT ON YOUR NEXT TRIP */}
        <section className='max-w-2xl mx-auto pt-12 md:pt-14 pb-[100px] md:pb-[160px]'>
          <Reveal>
            <SectionHeading>Try It on Your Next Trip</SectionHeading>
            <div className='mt-6'>
              <Paragraphs
                items={["Here's an example of what you can ask ChatGPT:"]}
              />
            </div>
            <div className='mt-6'>
              <ExamplePrompt text={SAMPLE_PROMPT} />
            </div>
            <div className='mt-6'>
              <Paragraphs
                items={[
                  'Change the location, time, type of food and walking distance to suit your plans.',
                  'And before heading out, check the latest reviews and opening hours.',
                  'AI helped us find the options. Good reviews helped us choose.',
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
    </div>
  );
}
