import type { ReactNode } from 'react';

// Shared typography primitives for the site's centred, destination-style
// pages (About, Barcelona and its journey-map sections, Tenerife, Italy).
// These were previously copy-pasted locally, byte-identical, into each of
// those files; hoisted here so future pages reuse one definition instead
// of a new copy. Behind the Trip's guides (El Clásico Tickets, How We Find
// Restaurants) intentionally keep their own local heading/paragraph
// components -- they use real semantic <h2>/<h3> tags and a tighter
// left-aligned article rhythm on purpose, so they're a deliberately
// different (but internally consistent) family, not an oversight.

// LEVEL 2 -- the one main-editorial-heading scale used throughout the
// site's centred pages, so no chapter/section heading reads as more or
// less important than another.
export function ChapterHeading({
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

// LEVEL 3 -- small uppercase in-chapter marker, one notch below
// RouteLabel's chapter-opening marker (components/journey/annotation-kit.tsx).
export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <span className='block text-sm md:text-[0.95rem] uppercase tracking-[0.18em] font-[family-name:var(--font-poppins)] font-semibold text-black/60 dark:text-white/60'>
      {children}
    </span>
  );
}

// LEVEL 4 -- body copy. Identical sizing/weight/color everywhere it's
// used; only the surrounding vertical gap varies per call site via
// className.
export function Paragraphs({
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

// LEVEL 5 -- the larger standalone lines that punctuate a story. Sized
// per-use (every current usage passes text-2xl md:text-3xl) so a short
// punchy line and a longer sentence both read comfortably.
export function Statement({
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
