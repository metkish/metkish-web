// Small, destination-agnostic presentational pieces used inside
// <JourneyAnnotation> overlays — a route label, a soft info card, a side
// note and a large timestamp statement. Kept separate from Tenerife's own
// copy (which lives in app/tenerife/page.tsx) so any future journey page
// can reuse the same visual language without duplicating it.
import type { ReactNode } from 'react';

export function RouteLabel({
  children,
  small = false,
}: {
  children: ReactNode;
  small?: boolean;
}) {
  return (
    <div className='flex flex-col items-center gap-2'>
      <span className='h-px w-8 bg-pink-300 dark:bg-pink-400/60' />
      <p
        className={`${
          small ? 'text-xs sm:text-sm' : 'text-sm sm:text-base'
        } uppercase tracking-[0.22em] font-[family-name:var(--font-poppins)] font-semibold text-black/70 dark:text-white/85`}
      >
        {children}
      </p>
    </div>
  );
}

export function InfoCard({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`max-w-xs sm:max-w-sm rounded-[2px] border border-black/10 dark:border-white/15 bg-[#faf9f6]/92 dark:bg-black/75 backdrop-blur-sm px-5 py-5 sm:px-6 sm:py-6 text-left shadow-[0_2px_20px_rgba(0,0,0,0.06)] ${className}`}
    >
      {children}
    </div>
  );
}

export function CardKicker({ children }: { children: ReactNode }) {
  return (
    <p className='text-[0.7rem] uppercase tracking-[0.18em] font-[family-name:var(--font-poppins)] font-semibold text-black/50 dark:text-white/50'>
      {children}
    </p>
  );
}

export function CardLine({ children }: { children: ReactNode }) {
  return (
    <p className='mt-1 text-sm font-[family-name:var(--font-poppins)] text-black/70 dark:text-white/70'>
      {children}
    </p>
  );
}

export function CardPrice({ children }: { children: ReactNode }) {
  return (
    <p className='mt-1 text-lg font-[family-name:var(--font-playfair)] font-medium text-black dark:text-white'>
      {children}
    </p>
  );
}

export function SideNote({
  heading,
  children,
}: {
  heading: string;
  children: ReactNode;
}) {
  return (
    <div className='max-w-[13rem] sm:max-w-xs text-center md:text-right'>
      <p className='text-xs uppercase tracking-[0.18em] font-[family-name:var(--font-poppins)] font-semibold text-black/45 dark:text-white/45'>
        {heading}
      </p>
      <p className='mt-2 text-sm italic font-[family-name:var(--font-playfair)] text-black/75 dark:text-white/75 leading-snug'>
        {children}
      </p>
    </div>
  );
}

export function TimeStamp({
  children,
  size = 'md',
}: {
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}) {
  const sizes = {
    sm: 'text-2xl md:text-3xl',
    md: 'text-3xl md:text-4xl',
    lg: 'text-4xl md:text-5xl',
  };
  return (
    <p
      className={`${sizes[size]} font-[family-name:var(--font-playfair)] italic font-medium text-black dark:text-white`}
    >
      {children}
    </p>
  );
}
