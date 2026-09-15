'use client';

// A self-running route animation drawn on top of a supplied reference map
// image, rather than the site's own SVG-rendered coastline system (see
// JourneyMapScene). Built for the Italy road-trip page's opening leg: the
// user supplied a real map screenshot (already showing the driving route
// they chose, with its own labels, alternate-route lines, distance/time
// pills, etc.) and asked for the *visible* highlighted line to be traced
// and animated, not a new route calculated or redrawn from scratch — this
// component's whole job is "reveal this exact line," nothing more.
//
// Every geometry prop here (the pixel path, the image's natural size) was
// obtained by tracing the actual attached screenshot pixel-by-pixel, not
// invented or estimated — see the Italy journey data file for the
// worked-out source. Swapping in a different reference image and path
// later (a supplied final asset, or eventually a real verified
// JourneyMapScene route) only means passing different props; nothing about
// this component is Tenerife/Milan-specific.
import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import gsap from 'gsap';

export interface TracedRoutePoint {
  x: number;
  y: number;
}

export interface TracedRouteMapProps {
  /** Reference map image, already showing the route to trace. */
  imageSrc: string;
  imageAlt: string;
  /** Natural pixel size of imageSrc — sets the SVG overlay's viewBox and
   * the responsive aspect-ratio box, so the traced line stays pixel-locked
   * to the image at every screen width. */
  naturalWidth: number;
  naturalHeight: number;
  /** Pixel-space waypoints (image's own coordinate system), start to end,
   * as traced from the reference image. */
  path: TracedRoutePoint[];
  startLabel: string;
  endLabel: string;
  /** Seconds the line takes to draw once autoplay starts. */
  durationS?: number;
  className?: string;
}

// Catmull-Rom -> cubic-Bezier conversion, so the traced waypoints (which
// still carry small pixel-level jitter from source-image tracing) render
// as one smooth, continuous stroke instead of a faceted polyline — a
// pencil-line quality in keeping with "elegant and subtle" rather than a
// literal dot-to-dot reproduction.
function smoothPathD(points: TracedRoutePoint[]): string {
  if (points.length < 2) return '';
  if (points.length === 2) {
    return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;
  }
  const p = points;
  let d = `M ${p[0].x} ${p[0].y}`;
  for (let i = 0; i < p.length - 1; i++) {
    const p0 = p[i === 0 ? 0 : i - 1];
    const p1 = p[i];
    const p2 = p[i + 1];
    const p3 = p[i + 2 < p.length ? i + 2 : i + 1];
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

export default function TracedRouteMap({
  imageSrc,
  imageAlt,
  naturalWidth,
  naturalHeight,
  path,
  startLabel,
  endLabel,
  durationS = 4,
  className = '',
}: TracedRouteMapProps) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const pathRef = useRef<SVGPathElement | null>(null);
  const startLabelRef = useRef<HTMLSpanElement | null>(null);
  const endLabelRef = useRef<HTMLSpanElement | null>(null);
  const hasPlayedRef = useRef(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  const pathD = useMemo(() => smoothPathD(path), [path]);
  const start = path[0];
  const end = path[path.length - 1];

  // Same reduced-motion detection as JourneyMapScene: read once on mount
  // (no window at render time on the server) rather than in useState's
  // initializer.
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setReducedMotion(mq.matches);
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const pathEl = pathRef.current;
    const startEl = startLabelRef.current;
    const endEl = endLabelRef.current;
    if (!wrapper || !pathEl || !startEl || !endEl) return;

    const length = pathEl.getTotalLength();
    pathEl.style.strokeDasharray = `${length}`;

    if (reducedMotion) {
      pathEl.style.strokeDashoffset = '0';
      gsap.set(startEl, { opacity: 1 });
      gsap.set(endEl, { opacity: 1 });
      return;
    }

    pathEl.style.strokeDashoffset = `${length}`;
    gsap.set(startEl, { opacity: 0 });
    gsap.set(endEl, { opacity: 0 });

    let tween: gsap.core.Tween | null = null;
    const startAutoplay = () => {
      if (hasPlayedRef.current) return;
      hasPlayedRef.current = true;
      const proxy = { p: 0 };
      tween = gsap.to(proxy, {
        p: 1,
        duration: durationS,
        ease: 'none',
        onUpdate: () => {
          pathEl.style.strokeDashoffset = `${length * (1 - proxy.p)}`;
          const startOpacity = Math.min(1, proxy.p / 0.08);
          const endOpacity = Math.max(0, (proxy.p - 0.85) / 0.15);
          startEl.style.opacity = `${startOpacity}`;
          endEl.style.opacity = `${endOpacity}`;
        },
      });
    };

    // Same "meaningfully in view" threshold as JourneyMapScene, so every
    // self-running map on the site starts at the same scroll commitment.
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) startAutoplay();
        });
      },
      { threshold: 0.4 }
    );
    observer.observe(wrapper);

    return () => {
      observer.disconnect();
      tween?.kill();
    };
  }, [reducedMotion, durationS, pathD]);

  const toPct = (v: number, total: number) => `${(v / total) * 100}%`;

  return (
    <div
      ref={wrapperRef}
      className={`relative w-full overflow-hidden bg-[#f6f1e6] dark:bg-[#161310] ${className}`}
    >
      {/* Aspect-ratio box matched exactly to the reference image's own
          pixel dimensions — the image is never cropped (object-contain)
          and, because the box shares its ratio, never letterboxed either:
          both the photo and the SVG overlay scale together at any width,
          phone included, with the traced line staying pixel-locked to the
          route drawn in the source screenshot. */}
      <div
        className='relative w-full mx-auto'
        style={{ aspectRatio: `${naturalWidth} / ${naturalHeight}` }}
      >
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          sizes='(min-width: 768px) 90vw, 100vw'
          className='object-contain'
        />
        <svg
          viewBox={`0 0 ${naturalWidth} ${naturalHeight}`}
          preserveAspectRatio='xMidYMid meet'
          className='absolute inset-0 w-full h-full'
          aria-hidden='true'
        >
          <path
            ref={pathRef}
            d={pathD}
            fill='none'
            stroke='#e8639f'
            strokeWidth={5}
            strokeLinecap='round'
            strokeLinejoin='round'
          />
        </svg>
        <span
          ref={startLabelRef}
          className='absolute -translate-x-1/2 translate-y-2 text-[0.65rem] sm:text-xs uppercase tracking-[0.18em] font-[family-name:var(--font-poppins)] font-semibold text-black/80 bg-[#faf9f6]/90 dark:bg-black/70 dark:text-white/90 rounded px-2 py-0.5 shadow-sm whitespace-nowrap'
          style={{ left: toPct(start.x, naturalWidth), top: toPct(start.y, naturalHeight) }}
        >
          {startLabel}
        </span>
        <span
          ref={endLabelRef}
          className='absolute -translate-x-1/2 translate-y-2 text-[0.65rem] sm:text-xs uppercase tracking-[0.18em] font-[family-name:var(--font-poppins)] font-semibold text-black/80 bg-[#faf9f6]/90 dark:bg-black/70 dark:text-white/90 rounded px-2 py-0.5 shadow-sm whitespace-nowrap'
          style={{ left: toPct(end.x, naturalWidth), top: toPct(end.y, naturalHeight) }}
        >
          {endLabel}
        </span>
      </div>
    </div>
  );
}
