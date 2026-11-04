'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { InstagramIcon, PinterestIcon } from '@/components/ui/social-icons';
import { INSTAGRAM_URL, PINTEREST_URL } from '@/lib/social-links';
import { TimeStamp } from '@/components/journey/annotation-kit';

const LOGO_SRC = '/metkish-logo.png';
const BOOKING_CONFIRMATION_SRC =
  '/Behind%20the%20trip/FC%20Barcelona%20booking%20confirmation%20-%20redacted.jpeg';
const MEMBERSHIP_CONFIRMATION_SRC =
  '/Behind%20the%20trip/FC%20Barcelona%20membership%20confirmation%20-%20redacted-v2.jpeg';
const HERO_PHOTO_SRC =
  '/Behind%20the%20trip/El%20Clasico%20hero%20-%20Spotify%20Camp%20Nou.jpeg';
const SEAT_ASSIGNMENTS_SRC =
  '/Behind%20the%20trip/El%20Clasico%20seat%20assignments.jpeg';
const OUR_SEATS_PHOTO_SRC =
  '/Behind%20the%20trip/El%20Clasico%20our%20seats.jpeg';
const MENS_JERSEY_PRICE_SRC =
  '/Behind%20the%20trip/El%20Clasico%20mens%20jersey%20price.jpeg';
const BARCA_ANTHEM_VIDEO_SRC =
  '/Behind%20the%20trip/El%20Clasico%20Barca%20anthem.mp4';
const MEMBERSHIP_URL = 'https://www.fcbarcelona.com/en/club/members/become-member';
const EL_CLASICO_REVENUE_SOURCE_URL =
  'https://www.mundodeportivo.com/futbol/fc-barcelona/20261026/1004243315/record-historico-taquilla-spotify-camp-nou-19-1-millones-clasico.html';

// Same fade-up-on-scroll rhythm used throughout the site (About, Italy,
// Tenerife): once-only, generous viewport threshold, no bounce. Duplicated
// locally rather than imported, following this codebase's established
// per-page convention.
function Reveal({
  children,
  className,
  delay = 0,
  amount = 0.3,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  // Fraction of this element's own height that must be visible before it
  // reveals. The default (0.3) works for the article's typical short
  // blocks, but a very tall block -- taller than roughly 3.3x the
  // viewport -- can never satisfy a 30% visibility requirement on a short
  // mobile viewport, so whileInView never fires and the content stays
  // invisible forever. Call sites wrapping an unusually tall block should
  // pass a lower amount (e.g. 0, meaning "as soon as any part is
  // visible") so the reveal isn't tied to viewport height at all.
  amount?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount }}
      transition={{ duration: 0.6, delay }}
    >
      {children}
    </motion.div>
  );
}

// Major article section marker. Same Playfair scale as every chapter
// opener on Italy/Tenerife (text-3xl md:text-4xl font-medium) -- but a
// real <h2>, not a <p>, since this is a long-form article and needs
// genuine heading semantics.
function SectionHeading({ children }: { children: ReactNode }) {
  return (
    <h2 className='text-3xl md:text-4xl font-[family-name:var(--font-playfair)] font-medium text-black dark:text-white'>
      {children}
    </h2>
  );
}

// In-section sub-heading. Byte-identical visual style to the site's
// existing Eyebrow component, rendered as a real <h3> so the article keeps
// clear, semantic H2/H3 hierarchy for SEO and screen readers.
function SubHeading({ children }: { children: ReactNode }) {
  return (
    <h3 className='mt-10 md:mt-12 text-sm md:text-[0.95rem] uppercase tracking-[0.18em] font-[family-name:var(--font-poppins)] font-semibold text-black/60 dark:text-white/60'>
      {children}
    </h3>
  );
}

// Small uppercase kicker/label -- the same token used site-wide, kept as a
// plain span since it never stands in for a heading here.
function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <span className='block text-sm md:text-[0.95rem] uppercase tracking-[0.18em] font-[family-name:var(--font-poppins)] font-semibold text-black/60 dark:text-white/60'>
      {children}
    </span>
  );
}

// The larger standalone lines that punctuate the story -- same component
// as About's Statement, reused for the article's own punchiest sentences
// rather than inventing a new treatment.
function Statement({ children }: { children: ReactNode }) {
  return (
    <p className='text-2xl md:text-3xl font-[family-name:var(--font-playfair)] italic font-medium text-black dark:text-white leading-snug'>
      {children}
    </p>
  );
}

// Body copy -- byte-identical to every other page's Paragraphs component,
// left-aligned here rather than centered: a long first-person "how to"
// article reads more comfortably as a conventional editorial column than
// as the short centered reflective beats About uses.
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

// A small, personal aside -- distinct from both plain body text and the
// larger "My Tips" box below. Pink is used here exactly the way the site's
// colour system reserves it ("small accent only"): a thin left rule, never
// a fill or a badge.
function InlineTip({ children }: { children: ReactNode }) {
  return (
    <p className='border-l-2 border-pink-300 dark:border-pink-400/60 pl-4 text-base italic font-[family-name:var(--font-poppins)] font-light text-black/75 dark:text-white/75 leading-relaxed'>
      {children}
    </p>
  );
}

// A short, numbered list of practical takeaways -- quiet editorial
// treatment rather than a promotional box: no background, no border, just
// a thin pink-ringed number (the site's "small accent only" rule) beside
// body copy in the same type as every other paragraph on the page.
function TakeawayList({ items }: { items: string[] }) {
  return (
    <ol className='space-y-4'>
      {items.map((text, i) => (
        <li key={i} className='flex gap-4'>
          <span className='mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border border-pink-300 dark:border-pink-400/60 text-xs font-[family-name:var(--font-poppins)] font-semibold text-pink-500 dark:text-pink-300'>
            {i + 1}
          </span>
          <span className='text-base md:text-lg font-[family-name:var(--font-poppins)] font-light text-black/80 dark:text-white/80 leading-relaxed'>
            {text}
          </span>
        </li>
      ))}
    </ol>
  );
}

// Elegant placeholder for a photograph that doesn't exist yet. Deliberately
// reads as "a space held open for a real photo" -- cream background,
// dashed border, quiet italic label -- never a stock or AI-generated
// image, never an empty/broken box. role="img" + aria-label carries the
// same descriptive alt text a real <Image> on this page would get once
// the photo is added.
function ImagePlaceholder({
  caption,
  aspect = 'aspect-[4/3]',
  large = false,
}: {
  caption: string;
  aspect?: string;
  large?: boolean;
}) {
  return (
    <div
      role='img'
      aria-label={caption}
      className={`relative w-full ${aspect} overflow-hidden rounded-[2px] border border-dashed border-black/15 dark:border-white/20 bg-[#f1ebdc]/60 dark:bg-white/[0.03] flex flex-col items-center justify-center text-center px-8`}
    >
      <span
        className={`font-[family-name:var(--font-playfair)] italic text-black/30 dark:text-white/30 ${
          large ? 'text-3xl md:text-4xl' : 'text-xl md:text-2xl'
        }`}
      >
        Photo coming soon
      </span>
      <span className='mt-3 max-w-xs text-xs uppercase tracking-[0.18em] font-[family-name:var(--font-poppins)] font-semibold text-black/40 dark:text-white/40'>
        {caption}
      </span>
    </div>
  );
}

// The elegant price-breakdown treatment the brief asks for, "consistent
// with the existing Metkish travel pages": the same warm cream card
// (#f1ebdc / white/[0.04], rounded-[3px]) as every price card on
// app/italy/page.tsx, but holding a genuine <table> of line items (this
// content needs real rows, not a single value) with the grand total still
// pulled out underneath at the same large serif TimeStamp scale Italy
// uses for its one-line prices.
function PriceTable({
  caption,
  rows,
  totalLabel,
  totalValue,
  note,
}: {
  caption: string;
  rows: { label: string; value: string; emphasis?: boolean }[];
  totalLabel?: string;
  totalValue?: string;
  note?: string;
}) {
  return (
    <div className='mx-auto max-w-[460px] rounded-[3px] bg-[#f1ebdc] dark:bg-white/[0.04] px-6 py-7 md:px-8 md:py-8'>
      <span className='block text-center text-xs uppercase tracking-[0.18em] font-[family-name:var(--font-poppins)] font-semibold text-black/45 dark:text-white/45'>
        {caption}
      </span>
      <table className='mt-5 w-full text-sm font-[family-name:var(--font-poppins)]'>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={i}
              className={`border-t border-black/10 dark:border-white/10 first:border-t-0 ${
                row.emphasis ? 'font-semibold text-black dark:text-white' : 'text-black/75 dark:text-white/75'
              }`}
            >
              <td className='py-2.5 pr-3'>{row.label}</td>
              <td className='py-2.5 text-right whitespace-nowrap'>{row.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {totalValue && (
        <div className='mt-6 pt-5 border-t border-black/15 dark:border-white/15 flex flex-col items-center gap-2 text-center'>
          <span className='text-xs uppercase tracking-[0.18em] font-[family-name:var(--font-poppins)] font-semibold text-black/45 dark:text-white/45'>
            {totalLabel}
          </span>
          <TimeStamp size='md'>{totalValue}</TimeStamp>
        </div>
      )}
      {note && (
        <p className='mt-4 text-center text-sm font-[family-name:var(--font-poppins)] text-black/55 dark:text-white/55'>
          {note}
        </p>
      )}
    </div>
  );
}

// A second, distinct price treatment for comparing prices across time
// (ours vs. three later public prices) rather than summing line items --
// same cream card language as PriceTable, but a simple label/value list:
// the member price we paid stands apart (a divider beneath it), the three
// public prices read almost like a small timeline. Deliberately quiet --
// no colour, no "deal" styling -- and the caveat note underneath exists
// specifically so the comparison is never read as claiming those public
// prices were on offer at the same moment we bought.
function PriceComparison({
  caption,
  rows,
  note,
}: {
  caption: string;
  rows: { label: string; value: string; highlight?: boolean }[];
  note?: string;
}) {
  return (
    <div className='mx-auto max-w-[460px] rounded-[3px] bg-[#f1ebdc] dark:bg-white/[0.04] px-6 py-7 md:px-8 md:py-8'>
      <span className='block text-center text-xs uppercase tracking-[0.18em] font-[family-name:var(--font-poppins)] font-semibold text-black/45 dark:text-white/45'>
        {caption}
      </span>
      <div className='mt-6 space-y-4'>
        {rows.map((row, i) => (
          <div
            key={i}
            className={`flex items-baseline justify-between gap-4 ${
              row.highlight ? 'pb-4 border-b border-black/15 dark:border-white/15' : ''
            }`}
          >
            <span className='text-sm font-[family-name:var(--font-poppins)] text-black/60 dark:text-white/60'>
              {row.label}
            </span>
            <span
              className={`font-[family-name:var(--font-playfair)] italic whitespace-nowrap ${
                row.highlight
                  ? 'text-2xl md:text-3xl font-medium text-black dark:text-white'
                  : 'text-lg text-black/80 dark:text-white/80'
              }`}
            >
              {row.value}
            </span>
          </div>
        ))}
      </div>
      {note && (
        <p className='mt-6 pt-5 border-t border-black/10 dark:border-white/10 text-center text-xs font-[family-name:var(--font-poppins)] text-black/50 dark:text-white/50 leading-relaxed'>
          {note}
        </p>
      )}
    </div>
  );
}

export default function ElClasicoTicketsArticle() {
  const [pastHero, setPastHero] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      // On mobile the icon should shrink almost immediately on scroll
      // rather than waiting for half the viewport height, since a phone's
      // viewport height makes that threshold feel sluggish; desktop keeps
      // the original viewport-relative threshold.
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
        {/* HERO */}
        <header className='pt-28 sm:pt-36 md:pt-44 pb-12 md:pb-16 max-w-2xl mx-auto text-center'>
          <Reveal>
            <Eyebrow>Behind the Trip · Guide</Eyebrow>
            <h1 className='mt-5 text-4xl sm:text-5xl md:text-6xl font-[family-name:var(--font-playfair)] font-medium text-black dark:text-white'>
              How to Get El Clásico Tickets
            </h1>
            <p className='mt-4 text-xl md:text-2xl italic font-[family-name:var(--font-playfair)] font-medium text-black/80 dark:text-white/80'>
              Our Real Experience as FC Barcelona Members
            </p>
            <p className='mt-6 text-base md:text-lg font-[family-name:var(--font-poppins)] text-black/80 dark:text-white/80'>
              From becoming FC Barcelona members to spending €3,472
              on four tickets. Here&apos;s what we learned about the
              process, the prices and whether membership is actually worth
              it.
            </p>
          </Reveal>
        </header>

        <Reveal className='max-w-3xl mx-auto'>
          <div className='relative w-full overflow-hidden rounded-[2px] border border-black/10 dark:border-white/15 shadow-[0_2px_20px_rgba(0,0,0,0.08)]'>
            <Image
              src={HERO_PHOTO_SRC}
              alt='Our view of Spotify Camp Nou from our €899 seats at El Clásico in October 2026.'
              width={5712}
              height={4284}
              className='w-full h-auto'
              priority
            />
          </div>
          <p className='mt-3 text-center text-sm italic font-[family-name:var(--font-poppins)] text-black/55 dark:text-white/55'>
            Our view from the €899 seats at El Clásico.
          </p>
        </Reveal>

        {/* A FAMILY OF BARÇA FANS */}
        <section className='max-w-2xl mx-auto pt-14 md:pt-16 pb-12 md:pb-14'>
          <Reveal>
            <SectionHeading>A Family of Barça Fans</SectionHeading>
            <div className='mt-6'>
              <Paragraphs
                items={[
                  'In our family, supporting FC Barcelona goes back generations.',
                  'My father and brother have always been Barça fans. Then I met my husband, who turned out to be just as passionate about the club. And now our children have joined the tradition, especially our son.',
                  'My husband and I visited Barcelona about 13 years ago, when we also attended a match at Camp Nou. But this time, we wanted to experience something even more special — El Clásico, together with our children.',
                  'Our children had been asking to visit Barcelona for years, but my husband always insisted that we should wait until the renovated Camp Nou was finished.',
                  "Well, the stadium still isn't finished, but we eventually decided not to wait any longer and planned our trip during the children's autumn school holidays in October 2026.",
                  "And here's the funny part: we booked the trip before we even knew El Clásico would take place during our stay.",
                  "When the match schedule was announced, we couldn't believe our luck.",
                  'There was just one problem.',
                  'How on earth were we going to get four tickets?',
                ]}
              />
            </div>
          </Reveal>
        </section>

        {/* WHY WE DECIDED TO BECOME MEMBERS */}
        <section className='max-w-2xl mx-auto pt-12 md:pt-14 pb-12 md:pb-14'>
          <Reveal>
            <SectionHeading>Why We Decided to Become FC Barcelona Members</SectionHeading>
            <div className='mt-6'>
              <Paragraphs
                items={[
                  'We knew El Clásico was one of the most sought-after football matches in the world. We had also seen how expensive tickets could become on resale websites.',
                  'And we needed four seats, ideally together.',
                  'After researching our options, we decided to become official FC Barcelona members, hoping it would give us a better chance of securing four tickets for El Clásico directly from the club.',
                ]}
              />
            </div>

            <SubHeading>How to Become an FC Barcelona Member</SubHeading>
            <div className='mt-6'>
              <Paragraphs
                items={[
                  'The application itself was fairly straightforward.',
                  'We completed the online membership forms on the official FC Barcelona website and uploaded the required documents. For our children, this also included birth certificates.',
                  'Then we waited for approval.',
                  'We submitted our applications on 27 July 2026 and received confirmation on 12 August 2026.',
                ]}
              />
            </div>

            <Reveal delay={0.08} className='mt-8 md:mt-9 max-w-[430px] mx-auto'>
              <div className='relative w-full overflow-hidden rounded-[2px] border border-black/10 dark:border-white/15 shadow-[0_2px_20px_rgba(0,0,0,0.08)]'>
                <Image
                  src={MEMBERSHIP_CONFIRMATION_SRC}
                  alt='Our FC Barcelona membership confirmation email, with our name and membership number redacted.'
                  width={651}
                  height={481}
                  className='w-full h-auto'
                />
              </div>
              <p className='mt-3 text-center text-sm italic font-[family-name:var(--font-poppins)] text-black/55 dark:text-white/55'>
                Our FC Barcelona membership confirmation, received on August 12, 2026.
              </p>
            </Reveal>

            <div className='mt-7 md:mt-8'>
              <Paragraphs
                items={[
                  "That's 16 days from application to approval. Once our memberships were approved, we paid the membership fees.",
                ]}
              />
            </div>

            <SubHeading>How Much Does FC Barcelona Membership Cost?</SubHeading>
            <div className='mt-6'>
              <Paragraphs items={['These were the membership prices for July–December 2026:']} />
            </div>

            <Reveal delay={0.05} className='mt-8 md:mt-9'>
              <PriceTable
                caption='FC Barcelona Membership · Jul–Dec 2026'
                rows={[
                  { label: 'Adult (15+)', value: '€113' },
                  { label: 'Child (6–14)', value: '€56' },
                ]}
                totalLabel='2 Adults + 2 Children'
                totalValue='€338'
                note='Our memberships were valid until 31 December 2026.'
              />
            </Reveal>

            <div className='mt-8 md:mt-9'>
              <Paragraphs
                items={[
                  'Membership also comes with other benefits, including discounts on selected tickets, Barça Store purchases and stadium experiences.',
                ]}
              />
              <p className='mt-5 text-base md:text-lg font-[family-name:var(--font-poppins)] font-light text-black/80 dark:text-white/80 leading-relaxed'>
                You can check the latest prices and apply through the{' '}
                <a
                  href={MEMBERSHIP_URL}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='underline underline-offset-4 text-black dark:text-white hover:text-black/70 dark:hover:text-white/70'
                >
                  official FC Barcelona membership website
                </a>
                .
              </p>
            </div>

            <Reveal delay={0.05} className='mt-7 md:mt-8'>
              <InlineTip>
                My tip: Apply well in advance. Our approval took more than
                two weeks, and you don&apos;t want to be waiting for
                membership confirmation when ticket sales begin.
              </InlineTip>
            </Reveal>
          </Reveal>
        </section>

        {/* WAITING FOR THE PRESALE */}
        <section className='max-w-2xl mx-auto pt-12 md:pt-14 pb-12 md:pb-14'>
          <Reveal>
            <SectionHeading>Waiting for the El Clásico Presale</SectionHeading>
            <div className='mt-6'>
              <Paragraphs
                items={[
                  'This was probably the most frustrating part of the entire process.',
                  'Once we became members, we had access to membership benefits and tickets already on sale.',
                  'But when it came to El Clásico?',
                  'Nothing.',
                  'No confirmed presale date. No exact time. No countdown.',
                  'We simply had to wait.',
                  'I had expected that being a member would mean receiving some kind of advance notice, especially for such an important match.',
                  'Instead, we were left checking for updates and wondering whether we might miss the sale.',
                  'On 29 September 2026, at around 9 PM, a push notification appeared in the FC Barcelona Members app.',
                  'It told us to have our membership cards ready.',
                  'The presale had started.',
                ]}
              />
            </div>
            <Reveal delay={0.05} className='mt-7 md:mt-8'>
              <Statement>Not tomorrow. Not next week. Right then.</Statement>
            </Reveal>
            <div className='mt-7 md:mt-8'>
              <Paragraphs items={['I immediately opened my laptop.']} />
            </div>
          </Reveal>
        </section>

        {/* THE TICKET PRICES WERE A SHOCK */}
        <section className='max-w-2xl mx-auto pt-12 md:pt-14 pb-12 md:pb-14'>
          <Reveal>
            <SectionHeading>The Ticket Prices Were a Shock</SectionHeading>
            <div className='mt-6'>
              <Paragraphs
                items={[
                  'Before the sale, I had expected to pay somewhere between €300 and €400 per person. Even that seemed like a significant amount for a football match, especially when buying four tickets.',
                  'But when I entered the presale, the only options I could see were €899 and €999 per ticket.',
                  "I honestly couldn't believe it.",
                  'For a moment, I wondered whether we should just forget the whole idea. But after months of planning, paying for memberships, and finally having the opportunity to see El Clásico as a family, I was afraid that waiting would mean missing out completely.',
                ]}
              />
            </div>
            <div className='mt-7 md:mt-8'>
              <Paragraphs
                items={[
                  'So I decided to buy them. Even though the price felt absurd.',
                ]}
              />
            </div>
          </Reveal>
        </section>

        {/* BUYING FOUR TICKETS */}
        {/* This section's content (heading through the price table) is
            unusually long -- by far the tallest single Reveal-wrapped
            block in the article. At the default amount=0.3, the required
            30%-visible threshold exceeds a typical mobile viewport height,
            so whileInView never fires and the whole section stays
            invisible on mobile. amount={0} makes it reveal as soon as any
            part scrolls into view, independent of its height. */}
        <section className='max-w-2xl mx-auto pt-12 md:pt-14 pb-12 md:pb-14'>
          <Reveal amount={0}>
            <SectionHeading>Buying Four Tickets Wasn&apos;t as Easy as Expected</SectionHeading>
            <div className='mt-6'>
              <Paragraphs
                items={[
                  'You would think that having four active memberships would make buying four tickets fairly simple.',
                  'Not quite.',
                  "I initially tried to complete the purchase on my laptop, but the system wouldn't let me buy all four tickets.",
                  'I kept running into problems, and eventually I was blocked from accessing the ticketing page.',
                  'With the tickets already so expensive and no idea how quickly they might sell out, this was incredibly stressful.',
                  'I quickly switched to my phone, entered our membership numbers again and finally managed to add four tickets to the basket.',
                  'But there was another problem.',
                  'The system recognised only three tickets as member tickets. The fourth was processed as a "+1" ticket, without the membership discount.',
                  "At that point, I wasn't going to risk losing all four tickets over a discount.",
                  'I completed the purchase.',
                  'After completing the purchase, I contacted FC Barcelona to ask whether the missing €45 membership discount could be refunded.',
                  "Their response was clear: if membership credentials weren't successfully validated during the purchase, the discount could not be applied afterwards.",
                  'So we lost the additional €45 discount, even though all four of us had active memberships.',
                ]}
              />
            </div>

            <Reveal delay={0.05} className='mt-7 md:mt-8'>
              <InlineTip>
                My advice: Make sure every membership is correctly
                recognised before completing your purchase. According to
                the club&apos;s response, missing membership discounts
                cannot be applied retroactively.
              </InlineTip>
            </Reveal>

            <Reveal delay={0.08} className='mt-8 md:mt-9 max-w-[430px] mx-auto'>
              <div className='relative w-full overflow-hidden rounded-[2px] border border-black/10 dark:border-white/15 shadow-[0_2px_20px_rgba(0,0,0,0.08)]'>
                <Image
                  src={BOOKING_CONFIRMATION_SRC}
                  alt='Our FC Barcelona ticket booking confirmation for four tickets to FC Barcelona vs Real Madrid, with membership numbers redacted.'
                  width={1179}
                  height={1934}
                  className='w-full h-auto'
                />
              </div>
              <p className='mt-3 text-center text-sm italic font-[family-name:var(--font-poppins)] text-black/55 dark:text-white/55'>
                Our actual booking confirmation: four tickets, but only three membership discounts applied.
              </p>
            </Reveal>

            <div className='mt-7 md:mt-8'>
              <Paragraphs
                items={[
                  "Only after purchasing our tickets did I discover that some El Clásico tickets had been advertised from around €500. Until then, I hadn't even known that cheaper categories existed. The only prices I had seen during the presale were €899 and €999.",
                ]}
              />
            </div>

            <SubHeading>What We Actually Paid for El Clásico</SubHeading>
            <div className='mt-6'>
              <Paragraphs items={['Here is the exact breakdown from our booking confirmation:']} />
            </div>

            <Reveal delay={0.05} className='mt-8 md:mt-9'>
              <PriceTable
                caption='What We Paid · 4 Tickets + Membership'
                rows={[
                  { label: '4 Tickets · 2nd Grandstand Upper', value: '€3,596' },
                  { label: 'Membership promotion (3 tickets)', value: '−€135' },
                  { label: 'Administration fee', value: '€11' },
                  { label: 'Total tickets', value: '€3,472', emphasis: true },
                  { label: 'Family membership fees', value: '€338' },
                ]}
                totalLabel='Total Including Membership'
                totalValue='€3,810'
              />
            </Reveal>

            <div className='mt-8 md:mt-9'>
              <Paragraphs
                items={[
                  'Yes, €3,810 for four football tickets and the memberships we purchased beforehand.',
                ]}
              />
            </div>
          </Reveal>

        </section>

        {/* WAS MEMBERSHIP WORTH IT */}
        <section className='max-w-2xl mx-auto pt-12 md:pt-14 pb-14 md:pb-16'>
          <Reveal>
            <SectionHeading>Was FC Barcelona Membership Worth It?</SectionHeading>
            <div className='mt-6'>
              <Paragraphs
                items={[
                  'When we decided to become FC Barcelona members, our main goal was simple: to increase our chances of getting four tickets for El Clásico.',
                  'At the time, we had no idea how much of a difference membership would actually make.',
                  'At first, I wondered whether joining had really been necessary. Despite the high demand we had expected, tickets were still available after our purchase.',
                  'But then I started checking the prices for non-members.',
                  "And that's when things got interesting.",
                ]}
              />
            </div>

            <Reveal delay={0.05} className='mt-8 md:mt-9'>
              <PriceComparison
                caption='Ticket Price Comparison · 2nd Grandstand Upper'
                rows={[
                  { label: 'Our Member Price (before 5% discount) · 29 September 2026', value: '€899', highlight: true },
                  { label: 'Public Price · 30 September 2026', value: '€1,699' },
                  { label: 'Public Price · 2 October 2026', value: '€1,849' },
                  { label: 'Public Price · 8 October 2026', value: '€1,900' },
                ]}
                note='These are real prices we personally observed, each at a different point during the on-sale period -- not necessarily available at the same time as our own purchase or as each other.'
              />
            </Reveal>

            <div className='mt-8 md:mt-9'>
              <Paragraphs
                items={[
                  'Watching the price of the very same ticket category climb from €899 to €1,900 in just over a week — more than double what we had paid — was astonishing. These were prices I personally observed on different dates, not simultaneous offers.',
                ]}
              />
            </div>

            <div className='mt-7 md:mt-8'>
              <Paragraphs
                items={[
                  "For a family of four, that difference would have been enormous. What surprised me just as much was that tickets were still available so close to the match — El Clásico, at these prices, still hadn't sold out.",
                  'So, was membership worth it?',
                ]}
              />
            </div>
            <div className='mt-7 md:mt-8'>
              <Paragraphs
                items={[
                  'For us, absolutely.',
                ]}
              />
            </div>

            <div className='mt-7 md:mt-8'>
              <Paragraphs
                items={[
                  "But there's an important distinction: membership didn't guarantee us tickets, and it didn't make the purchase process stress-free. It did, however, give us access to a significantly lower price than the non-member prices we saw afterwards.",
                  "Looking at those prices now, I'm very glad we decided to join.",
                ]}
              />
            </div>
          </Reveal>
        </section>

        {/* THE BARCA STORE */}
        <section className='max-w-2xl mx-auto pt-12 md:pt-14 pb-14 md:pb-16'>
          <Reveal>
            <SectionHeading>The Barça Store: Where Our Memberships Really Paid Off</SectionHeading>
            <div className='mt-6'>
              <Paragraphs
                items={[
                  'The day before El Clásico and on match day, the area around Camp Nou was unbelievably crowded.',
                  "The Barça Store was absolutely packed. And it wasn't just the stadium shop — we also visited two FC Barcelona stores in the city, where people were buying merchandise nonstop.",
                  'We certainly contributed to that.',
                  "An official FC Barcelona men's jersey costs €194.99. We knew authentic football shirts were expensive, but we were still shocked by just how much they cost.",
                ]}
              />
            </div>
            <Reveal delay={0.05} className='mt-8 md:mt-9 max-w-[430px] mx-auto'>
              <Image
                src={MENS_JERSEY_PRICE_SRC}
                alt="Price tag showing €194.99 for an official FC Barcelona men's football jersey at the Barça Store."
                width={2610}
                height={2480}
                className='w-full h-auto'
              />
              <p className='mt-3 text-center text-sm italic font-[family-name:var(--font-poppins)] text-black/55 dark:text-white/55'>
                €194.99 for an official FC Barcelona men&apos;s jersey.
              </p>
            </Reveal>
            <div className='mt-7 md:mt-8'>
              <Paragraphs
                items={[
                  'We spent quite a lot of money on FC Barcelona merchandise, but our memberships also helped us save a surprising amount.',
                ]}
              />
            </div>
            <div className='mt-7 md:mt-8'>
              <Paragraphs
                items={[
                  "Members receive a 10% discount on eligible purchases. But because our daughter had recently celebrated her birthday, she received a special voucher by email for 20% off a single purchase as a membership benefit. We used the voucher on a larger purchase and saved €170.80 in one go.",
                  "We weren't finished shopping, either — we returned for smaller purchases another two or three times, using our membership benefits again, and altogether saved more than €200 on Barça Store purchases.",
                ]}
              />
            </div>
            <div className='mt-7 md:mt-8'>
              <Paragraphs
                items={[
                  'Considering that our four memberships had cost €338 in total, those shopping discounts — combined with the €135 ticket discount — practically covered the entire membership cost.',
                ]}
              />
            </div>
            <div className='mt-7 md:mt-8'>
              <Paragraphs
                items={[
                  'Of course, we also spent far more in the stores than we had originally planned!',
                ]}
              />
            </div>
          </Reveal>
        </section>

        {/* SEAT ASSIGNMENTS */}
        <section className='max-w-2xl mx-auto pt-12 md:pt-14 pb-12 md:pb-14'>
          <Reveal>
            <SectionHeading>Our Seat Assignments: Not Quite What I Had Hoped For</SectionHeading>
            <Reveal delay={0.05} className='mt-8 md:mt-9'>
              <Image
                src={SEAT_ASSIGNMENTS_SRC}
                alt='FC Barcelona El Clásico ticket showing our assigned seating section at Spotify Camp Nou.'
                width={1071}
                height={845}
                className='w-full h-auto'
              />
              <p className='mt-3 text-center text-sm italic font-[family-name:var(--font-poppins)] text-black/55 dark:text-white/55'>
                Our assigned seats for El Clásico.
              </p>
            </Reveal>
            <div className='mt-7 md:mt-8'>
              <Paragraphs
                items={[
                  'As the match approached, I started wondering where exactly our seats would be.',
                  'When buying our tickets, we could only choose a seating category, not specific seats. Later, I noticed that tickets offered to non-members in the same category were being advertised as having some of the best available seating positions.',
                  'That made me wonder whether those of us who had purchased earlier as members might end up with the less desirable seats.',
                  'I noticed our assigned seat numbers two days before the match. And unfortunately, my concerns seemed justified.',
                ]}
              />
            </div>
            <div className='mt-7 md:mt-8'>
              <Paragraphs
                items={[
                  "Our seats weren't bad. But even among the cheaper categories, €899 per person is a premium price \u2014 and for that kind of money, I think it's reasonable to expect a more central view of the pitch.",
                ]}
              />
            </div>
            <Reveal delay={0.05} className='mt-8 md:mt-9 max-w-[430px] mx-auto'>
              <Image
                src={OUR_SEATS_PHOTO_SRC}
                alt='Our empty seats in the corner section at El Clásico, before kick-off.'
                width={4284}
                height={5712}
                className='w-full h-auto'
              />
            </Reveal>
            <div className='mt-7 md:mt-8'>
              <Paragraphs
                items={[
                  'And despite the enormous demand we had expected, tickets were still available just one day before El Clásico. The price for our category was €1,649 per ticket.',
                ]}
              />
            </div>
          </Reveal>
        </section>

        {/* MATCH DAY */}
        <section className='max-w-2xl mx-auto pt-12 md:pt-14 pb-12 md:pb-14'>
          <Reveal>
            <SectionHeading>Match Day: The Experience We Had Been Waiting For</SectionHeading>
            <Reveal delay={0.05} className='mt-7 md:mt-8 max-w-[430px] mx-auto'>
              <video
                controls
                playsInline
                preload='metadata'
                className='w-full h-auto'
                style={{ aspectRatio: '1080 / 1920' }}
              >
                <source src={BARCA_ANTHEM_VIDEO_SRC} type='video/mp4' />
              </video>
              <p className='mt-3 text-center text-sm italic font-[family-name:var(--font-poppins)] text-black/55 dark:text-white/55'>
                The moment Camp Nou sang the Barça anthem.
              </p>
            </Reveal>
            <div className='mt-7 md:mt-8'>
              <Paragraphs
                items={[
                  "None of that mattered once the entire stadium started singing the Barça anthem. Hearing thousands of supporters singing together was absolutely incredible — one of those moments I'll never forget.",
                ]}
              />
            </div>
            <div className='mt-7 md:mt-8'>
              <Paragraphs
                items={[
                  "Unfortunately, the match didn't end the way we had hoped.",
                  'The moment the final whistle blew, we left the stadium, completely disappointed.',
                  'We have travelled home from football matches by metro many times before, but I had never experienced anything quite like this.',
                  'The silence was extraordinary.',
                  'Barcelona supporters were genuinely disappointed by the result. Hardly anyone was talking.',
                ]}
              />
            </div>
            <div className='mt-7 md:mt-8'>
              <Paragraphs
                items={[
                  'After all the excitement, anticipation and money we had spent, that silent journey back felt like the final chapter of our El Clásico experience.',
                ]}
              />
            </div>
          </Reveal>
        </section>

        {/* THE PART THAT DISAPPOINTED ME MOST */}
        <section className='max-w-2xl mx-auto pt-12 md:pt-14 pb-12 md:pb-14'>
          <Reveal>
            <SectionHeading>The Part That Disappointed Me Most</SectionHeading>
            <div className='mt-6'>
              <p className='text-base md:text-lg font-[family-name:var(--font-poppins)] font-light text-black/80 dark:text-white/80 leading-relaxed'>
                A few days after El Clásico, I came across a report in{' '}
                <a
                  href={EL_CLASICO_REVENUE_SOURCE_URL}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='underline underline-offset-4 text-black dark:text-white hover:text-black/70 dark:hover:text-white/70'
                >
                  Mundo Deportivo
                </a>{' '}
                about the record revenue FC Barcelona had generated from the match.
              </p>
              <div className='mt-5'>
                <Paragraphs
                  items={[
                    'According to the report, the club had earned approximately €19.1 million from ticket sales alone — a new record, even though attendance was slightly lower than at the previous El Clásico. The average ticket price was reportedly €984, excluding VAT, while the Barça Store at the stadium reportedly brought in more than €800,000 over the two days around the match.',
                    'And I have to admit, reading those numbers left a bitter taste.',
                    'We had travelled to Barcelona as a family because we love this club. Just like thousands of other supporters who travel from all over the world to watch their favourite team.',
                  ]}
                />
              </div>
            </div>
            <div className='mt-7 md:mt-8'>
              <Paragraphs
                items={[
                  'But after everything we had spent, reading about those record earnings made me feel less like a supporter and more like a source of revenue.',
                ]}
              />
            </div>
            <div className='mt-7 md:mt-8'>
              <Paragraphs
                items={[
                  'I understand supply and demand — El Clásico is one of the biggest matches in football, and clubs can keep charging these prices as long as people are willing to pay them.',
                  'But I still find it sad that attending a match like this has become something an average supporter may struggle to afford.',
                ]}
              />
            </div>
          </Reveal>
        </section>

        {/* WHAT I'D RECOMMEND */}
        <section className='max-w-2xl mx-auto pt-12 md:pt-14 pb-12 md:pb-14'>
          <Reveal>
            <SectionHeading>What I&apos;d Recommend If You&apos;re Buying El Clásico Tickets as an FC Barcelona Member</SectionHeading>
            <div className='mt-6'>
              <Paragraphs
                items={[
                  "If you're planning to buy El Clásico tickets through FC Barcelona membership, here are five things I'd recommend based on our experience:",
                ]}
              />
            </div>
            <div className='mt-7 md:mt-8'>
              <TakeawayList
                items={[
                  "Apply for FC Barcelona membership as early as possible. Our own approval took more than two weeks, and you don't want to still be waiting when ticket sales begin.",
                  'Keep notifications on for the official FC Barcelona Members app. Our presale announcement arrived without warning, as a push notification on a random evening.',
                  "Remember that a seat category doesn't guarantee a specific seat position. You can end up anywhere within that section, including near a corner.",
                  "Double-check that every membership is correctly recognised before completing your purchase. Once payment goes through, a missed discount can't be added back afterwards.",
                  'Be financially prepared for prices well above what you might expect. Ours ended up several times higher than we had originally budgeted.',
                ]}
              />
            </div>
          </Reveal>
        </section>

        {/* WOULD WE DO IT AGAIN */}
        <section className='max-w-2xl mx-auto pt-12 md:pt-14 pb-[100px] md:pb-[160px]'>
          <Reveal>
            <SectionHeading>Would We Do It Again?</SectionHeading>
            <div className='mt-6'>
              <Paragraphs
                items={[
                  "That's a difficult question.",
                  "Experiencing El Clásico together as a family was something truly special. Even though the result wasn't what we had hoped for, it's a memory we'll always have.",
                  "And despite the disappointing result and the extraordinary ticket prices, our love for Barça hasn't changed. We're still just as passionate about the club as we were before.",
                  "As for our FC Barcelona memberships, they made financial sense for this particular trip. Between the ticket discounts and our purchases at the Barça Store, we saved enough to cover practically the entire membership cost.",
                  "But I think membership makes the most sense if you're planning to attend several matches. We went to just one, and we don't know when we'll have the opportunity to go again.",
                  "Would I keep paying for membership simply to support the club? I'm not so sure. After seeing the ticket prices and reading about the record revenue from El Clásico, it's difficult to shake the feeling that football has become more about money than the supporters who love it.",
                  "Would we go to El Clásico again? Absolutely. It's the kind of match every Barça supporter dreams of experiencing. But with ticket prices already this high, I can't help wondering: how much more expensive can they possibly get? And at what point does a match like this become something only a privileged few can afford?",
                ]}
              />
            </div>
            <Reveal delay={0.05} className='mt-7 md:mt-8'>
              <Statement>The experience was priceless. The tickets certainly weren&apos;t.</Statement>
            </Reveal>
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
