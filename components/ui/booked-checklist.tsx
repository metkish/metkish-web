// A quiet, reusable "what we booked before the trip" checklist — meant to
// close every Metkish destination page the same way, not just Tenerife's.
// This is the site's one small "signature" closing element: no card, no
// border, no shadow, no background panel — just the existing pink line +
// uppercase label (RouteLabel, shared with the journey maps) over a single
// tight, centred column of items, each marked with a small soft-pink check.
// Kept to a controlled width of its own (rather than stretching to whatever
// container it's placed in) so it reads as one compact, deliberate mark at
// the end of the story rather than a plain list loose in a wide column. A
// destination page supplies only its own heading (optional) and list of
// booked items; the design itself never changes between destinations.
import { RouteLabel } from '@/components/journey/annotation-kit';

export interface BookedChecklistProps {
  /** What was actually booked ahead of the trip, in the order to display
   * them — plain short labels, no prices, no dates, no descriptions. */
  items: string[];
  /** Defaults to "Booked before we left" so most destinations never need
   * to pass this — override only if a future page genuinely needs
   * different wording. */
  heading?: string;
  className?: string;
}

function CheckMark() {
  return (
    <svg
      viewBox='0 0 20 20'
      fill='none'
      aria-hidden='true'
      className='mt-[3px] h-3.5 w-3.5 shrink-0 text-pink-400 dark:text-pink-300/80'
    >
      <path
        d='M4 10.5l3.5 3.5L16 5.5'
        stroke='currentColor'
        strokeWidth='1.85'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  );
}

export default function BookedChecklist({
  items,
  heading = 'Booked before we left',
  className = '',
}: BookedChecklistProps) {
  return (
    <div className={`mx-auto max-w-[15rem] sm:max-w-xs text-center ${className}`}>
      <RouteLabel>{heading}</RouteLabel>
      {/* A tight two-column gap between check and label (gap-2, half the
          previous gap-3) so each mark reads as attached to its own item
          rather than floating beside it; rows sit closer together too
          (gap-2.5/3 rather than gap-3/3.5) for one compact block instead of
          a list with room to spare. items-start (not items-center) keeps
          the check aligned to the first line's cap-height even when a
          longer item wraps to two lines at narrow widths (e.g. "Siam Park +
          Loro Parque tickets") — the mt-[3px] on CheckMark nudges it down
          to match a single-line item's optical centre instead of sitting
          flush with the very top of the text. */}
      <ul className='mt-7 md:mt-8 flex flex-col items-stretch gap-2.5 md:gap-3'>
        {items.map((item) => (
          <li key={item} className='flex items-start justify-center gap-2 text-left'>
            <CheckMark />
            <span className='text-[0.95rem] md:text-base font-[family-name:var(--font-poppins)] text-black/80 dark:text-white/80'>
              {item}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
