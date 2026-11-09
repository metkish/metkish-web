'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { ItineraryDay } from '@/lib/journeys/rome';
import { project } from './geo';

// A third static sibling of JourneyMapScene/DepartureAirportsMap (see
// DepartureAirportsMap.tsx's own header comment for the family this
// belongs to), for a shape neither of those two covers: a single
// destination's multi-day sightseeing itinerary, grouped by day behind a
// day selector, with real point markers only -- deliberately no route or
// path drawn between them. The brief this was built for was explicit that
// no walking route, transport path or distance between these stops has
// been verified, so unlike every other Metkish map (which draws a real,
// independently-verified route), this one only ever plots real point
// locations and never a line connecting them. The pink/typography/marker
// language is still the same established system -- just markers and
// labels, no path.
//
// Unlike JourneyMapScene and DepartureAirportsMap, this map is zoomed to
// a single city at a scale far too close for the shared coastline dataset
// (components/journey/generated/geography.ts) to be useful -- central
// Rome's stops span only a few kilometres, nowhere near the simplified
// country-level coastline's resolution, and the nearest real coast
// (Ostia) is ~25km away and irrelevant at this zoom. So this map's
// background is a plain MUTED_BACKGROUND fill with no land/coastline
// layer at all, rather than forcing in geography data that would add
// nothing visible.

const MUTED_BACKGROUND = '#f6f1e6';

const LABEL_FLIP_MARGIN_PX = 160;

// Camera framing is recomputed per day from that day's own real points
// (not hardcoded per-day constants, since a day's point list is the
// single source of truth for its own framing) -- same aspect-aware
// reframing approach as DepartureAirportsMap's computeFrame, just driven
// by a live bounding box instead of one fixed reference box.
const PADDING_FACTOR = 1.7;
const MIN_SPAN_DEG = 0.012;
const MAX_HEIGHT_MULTIPLIER = 1.5;

interface MarkerRefs {
  wrapper: HTMLDivElement | null;
  text: HTMLSpanElement | null;
  labelPlacement?: 'right' | 'above';
}

export interface RomeItineraryMapProps {
  days: ItineraryDay[];
  className?: string;
  heightClassName?: string;
}

const DEFAULT_HEIGHT_CLASSNAME = 'h-[360px] sm:h-[420px] md:h-[480px]';

export default function RomeItineraryMap({
  days,
  className = '',
  heightClassName = DEFAULT_HEIGHT_CLASSNAME,
}: RomeItineraryMapProps) {
  const [selectedDay, setSelectedDay] = useState(0);
  const mapBoxRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const markerRefs = useRef<MarkerRefs[]>([]);

  const activeDay = days[selectedDay] ?? days[0];
  const points = activeDay.points;

  // Real bounding box of the active day's own points, in [lon, lat]
  // degrees -- the only geographic input to this map's framing.
  const bbox = useMemo(() => {
    const lons = points.map((p) => p.coords[0]);
    const lats = points.map((p) => p.coords[1]);
    return {
      minLon: Math.min(...lons),
      maxLon: Math.max(...lons),
      minLat: Math.min(...lats),
      maxLat: Math.max(...lats),
    };
  }, [points]);

  const center = useMemo<[number, number]>(
    () => [(bbox.minLon + bbox.maxLon) / 2, (bbox.minLat + bbox.maxLat) / 2],
    [bbox]
  );

  const lonSpan = Math.max(bbox.maxLon - bbox.minLon, MIN_SPAN_DEG);
  const latSpan = Math.max(bbox.maxLat - bbox.minLat, MIN_SPAN_DEG);

  // Projected (world-unit) half-width/half-height of the padded real
  // bounding box, found by calling project() itself rather than
  // reimplementing its internal lon/lat scaling -- project() already
  // applies geo.ts's fixed-latitude x-scale (LAT_COS) and a plain
  // negation on y, so the delta between the projected center and a
  // projected point offset by the padded span is exactly the right
  // world-unit box size regardless of what project()'s internals do.
  const centerWorld = useMemo(() => project(center), [center]);
  const boxWidth = useMemo(
    () =>
      Math.abs(
        project([center[0] + (lonSpan * PADDING_FACTOR) / 2, center[1]])[0] - centerWorld[0]
      ) * 2,
    [center, centerWorld, lonSpan]
  );
  const boxHeight = useMemo(
    () =>
      Math.abs(
        project([center[0], center[1] + (latSpan * PADDING_FACTOR) / 2])[1] - centerWorld[1]
      ) * 2,
    [center, centerWorld, latSpan]
  );

  const pointWorlds = useMemo(() => points.map((p) => project(p.coords)), [points]);

  useEffect(() => {
    const mapBox = mapBoxRef.current;
    const svg = svgRef.current;
    if (!mapBox || !svg) return;

    const measure = () => {
      const rect = mapBox.getBoundingClientRect();
      const containerWidth = rect.width || 1;
      const containerHeight = rect.height || containerWidth / (boxWidth / boxHeight);
      const aspect =
        rect.width > 0 && rect.height > 0 ? rect.width / rect.height : boxWidth / boxHeight;

      let frameWidth: number;
      let frameHeight: number;
      if (aspect >= boxWidth / boxHeight) {
        frameHeight = boxHeight;
        frameWidth = boxHeight * aspect;
      } else {
        frameWidth = boxWidth;
        frameHeight = boxWidth / aspect;
        const maxHeight = boxHeight * MAX_HEIGHT_MULTIPLIER;
        if (frameHeight > maxHeight) {
          frameHeight = maxHeight;
          frameWidth = frameHeight * aspect;
        }
      }

      const vbX = centerWorld[0] - frameWidth / 2;
      const vbY = centerWorld[1] - frameHeight / 2;
      svg.setAttribute('viewBox', `${vbX} ${vbY} ${frameWidth} ${frameHeight}`);

      const place = (refs: MarkerRefs, world: [number, number]) => {
        const { wrapper, text, labelPlacement } = refs;
        const leftPx = ((world[0] - vbX) / frameWidth) * containerWidth;
        const topPx = ((world[1] - vbY) / frameHeight) * containerHeight;
        if (wrapper) {
          wrapper.style.transform = `translate(${leftPx.toFixed(1)}px, ${topPx.toFixed(1)}px)`;
        }
        if (!text) return;
        if (labelPlacement === 'above') {
          text.style.textAlign = 'center';
          text.style.transform = 'translate(-50%, calc(-100% - 10px))';
        } else {
          const flip = containerWidth - leftPx < LABEL_FLIP_MARGIN_PX;
          text.style.textAlign = flip ? 'right' : 'left';
          text.style.transform = flip
            ? 'translate(-14px, -50%) translateX(-100%)'
            : 'translate(14px, -50%)';
        }
      };

      pointWorlds.forEach((w, i) => {
        const refs = markerRefs.current[i];
        if (refs) place(refs, w);
      });
    };

    measure();
    const resizeObserver = new ResizeObserver(() => measure());
    resizeObserver.observe(mapBox);
    return () => resizeObserver.disconnect();
  }, [centerWorld, boxWidth, boxHeight, pointWorlds]);

  return (
    <div className={className}>
      {/* Day selector -- same uppercase/tracking/Poppins-semibold language
          as every other small label on the site (Eyebrow, RouteLabel),
          the active day picked out with the site's one accent color
          rather than a background pill or border, so it reads as part of
          the same typographic system instead of a separate UI widget. */}
      <div className='flex items-center justify-center gap-6 sm:gap-8'>
        {days.map((d, i) => {
          const active = i === selectedDay;
          return (
            <button
              key={d.day}
              type='button'
              onClick={() => setSelectedDay(i)}
              className='group flex flex-col items-center gap-1.5 py-1'
              aria-pressed={active}
            >
              <span
                className={`text-xs sm:text-sm uppercase tracking-[0.18em] font-[family-name:var(--font-poppins)] font-semibold transition-colors ${
                  active
                    ? 'text-pink-500 dark:text-pink-300'
                    : 'text-black/45 dark:text-white/45 group-hover:text-black/70 dark:group-hover:text-white/70'
                }`}
              >
                {d.label}
              </span>
              <span
                className={`h-0.5 w-8 rounded-full transition-colors ${
                  active ? 'bg-pink-400 dark:bg-pink-300/80' : 'bg-transparent'
                }`}
              />
            </button>
          );
        })}
      </div>

      <div
        className={`relative w-full overflow-hidden mt-5 md:mt-6 ${heightClassName} bg-[#f6f1e6] dark:bg-[#161310]`}
      >
        <div ref={mapBoxRef} className='absolute inset-0'>
          <svg
            ref={svgRef}
            className='absolute inset-0 w-full h-full'
            preserveAspectRatio='xMidYMid slice'
          >
            <rect x={-2000} y={-2000} width={4000} height={4000} fill={MUTED_BACKGROUND} />
          </svg>

          {points.map((point, i) => (
            <div
              key={`${activeDay.day}-${point.id}`}
              ref={(el) => {
                markerRefs.current[i] = {
                  ...(markerRefs.current[i] ?? { wrapper: null, text: null }),
                  wrapper: el,
                  labelPlacement: point.labelPlacement,
                };
              }}
              className='absolute left-0 top-0'
            >
              <span className='absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2 block w-2.5 h-2.5 rounded-full bg-[#e8639f] ring-2 ring-[#f6f1e6] dark:ring-[#161310]' />
              <span
                ref={(el) => {
                  markerRefs.current[i] = {
                    ...(markerRefs.current[i] ?? { wrapper: null, text: null }),
                    text: el,
                    labelPlacement: point.labelPlacement,
                  };
                }}
                className='absolute left-0 top-0 flex flex-col leading-tight whitespace-nowrap font-[family-name:var(--font-poppins)]'
              >
                <span className='text-[0.65rem] sm:text-xs uppercase tracking-[0.14em] font-semibold text-black/75 dark:text-white/75'>
                  {point.name}
                </span>
                {point.sublabel && (
                  <span className='text-[0.6rem] sm:text-[0.65rem] text-black/50 dark:text-white/50'>
                    {point.sublabel}
                  </span>
                )}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
