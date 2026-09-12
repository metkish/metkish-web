// Minimal monoline brand glyphs for the footer's social row, drawn in the
// same stroke-based style as the site's other small icons (see CheckMark
// in booked-checklist.tsx: stroke='currentColor', strokeWidth 1.85,
// rounded caps/joins). Kept as plain inline SVG rather than pulling in an
// icon library for just two glyphs — currentColor lets each usage inherit
// whatever text color/opacity the footer link around it already has.
interface SocialIconProps {
  className?: string;
}

export function InstagramIcon({ className }: SocialIconProps) {
  return (
    <svg
      viewBox='0 0 24 24'
      fill='none'
      aria-hidden='true'
      className={className}
    >
      <rect x='3' y='3' width='18' height='18' rx='5' stroke='currentColor' strokeWidth='1.85' />
      <circle cx='12' cy='12' r='4' stroke='currentColor' strokeWidth='1.85' />
      <circle cx='17.2' cy='6.8' r='1.1' fill='currentColor' />
    </svg>
  );
}

export function PinterestIcon({ className }: SocialIconProps) {
  return (
    <svg
      viewBox='0 0 24 24'
      fill='none'
      aria-hidden='true'
      className={className}
    >
      <circle cx='12' cy='12' r='9' stroke='currentColor' strokeWidth='1.85' />
      {/* The Pinterest "P" itself is a filled stem + bulb, not stroked, so
          it reads as a solid mark inside the ring rather than another thin
          outline (the two shapes overlap slightly, which is invisible
          since both share the same fill). */}
      <rect x='9.7' y='8.5' width='1.7' height='9.3' rx='0.85' fill='currentColor' />
      <circle cx='11.7' cy='9.7' r='2.35' fill='currentColor' />
    </svg>
  );
}
