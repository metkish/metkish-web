'use client';

import { useEffect, useMemo, useRef } from 'react';
import type { JourneyPoint } from '@/lib/journeys/types';
import { project } from './geo';

// A static sibling of JourneyMapScene/DepartureAirportsMap (see
// DepartureAirportsMap.tsx's own header comment for the family this
// belongs to), for a shape neither of those two covers: a single
// destination's sightseeing landmarks, plotted together on one still
// overview with real point markers only -- deliberately no route or path
// drawn between them. The brief this was built for was explicit that no
// walking route, transport path or distance between these stops has been
// verified, so unlike every other Metkish map (which draws a real,
// independently-verified route), this one only ever plots real point
// locations and never a line connecting them. The pink/typography/marker
// language is still the same established system -- just markers and
// labels, no path.
//
// REDESIGN (this version replaces an earlier day-by-day selector): the
// previous version switched between three separate framings (Day 1/Day 2/
// Day 3), each reframed around just that day's own points. That produced
// three separate sets of mobile bugs -- markers rendering off-screen on a
// narrow aspect with only two widely-spaced points, and labels clipping or
// overlapping differently on each day -- because each day's tiny point set
// gave the framing/label logic very little room to work with. This version
// drops the day selector entirely and plots every unique landmark from all
// three days together on one consolidated map (see ROME_OVERVIEW_POINTS in
// lib/journeys/rome.ts), which is both the simpler, more honest shape for
// "where did we go in Rome" and, with ten points spread across a real
// ~4km-wide area instead of two or three in a tight corner, gives the
// camera-framing and label-placement logic a much more stable box to work
// with at every viewport width.
//
// MAP BACKGROUND: the brief asked for a real street-map background (roads,
// blocks, the Tiber, parks) if one could be implemented reliably, and
// explicitly asked for this limitation to be explained rather than for an
// inaccurate decorative map if it couldn't. It couldn't: fetching real
// OpenStreetMap tile/static-map imagery was tested directly against
// several tile providers (tile.openstreetmap.org, staticmap.openstreetmap.de,
// maps.wikimedia.org) from both this project's cloud build environment and
// the linked local machine, and every one of those domains is blocked by
// the organization's own network egress policy in both places (confirmed
// via the proxy's own request log, not just a timeout). Rather than
// fabricate streets, a river, or parks that would look plausible but have
// no real geographic data behind them, this map keeps the same accurate
// custom-projection, muted-background approach the previous version used:
// real coordinates, real relative positions, no invented geography.
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

// How much text-measurement buffer to leave before flipping a horizontal
// label to the other side of its dot.
const LABEL_EDGE_BUFFER_PX = 16;
// Only used on the very first paint, before a text node has ever been
// measured (getBoundingClientRect can legitimately return 0 for an
// element that hasn't painted yet) -- a same-order-of-magnitude guess so
// the very first frame doesn't badly misjudge room on either side; the
// very next measure (ResizeObserver fires on mount too) uses the real
// measured width.
const LABEL_FALLBACK_WIDTH_PX = 140;

// Camera framing is computed once from every plotted point's own real
// coordinates (not hardcoded, since the point list is the single source
// of truth for the map's own framing) -- same aspect-aware reframing
// approach as DepartureAirportsMap's computeFrame, just driven by a live
// bounding box instead of one fixed reference box. PADDING_FACTOR is a
// little more generous than a single-day framing needed, since labels now
// have to clear real neighbours across the whole consolidated point set
// rather than just one or two nearby points.
const PADDING_FACTOR = 1.15;
const MIN_SPAN_DEG = 0.012;
const MAX_HEIGHT_MULTIPLIER = 1.3;

interface MarkerRefs {
  wrapper: HTMLDivElement | null;
  text: HTMLSpanElement | null;
  labelPlacement: JourneyPoint['labelPlacement'];
}

export interface RomeItineraryMapProps {
  points: JourneyPoint[];
  className?: string;
  heightClassName?: string;
}

const DEFAULT_HEIGHT_CLASSNAME = 'h-[460px] sm:h-[540px] md:h-[640px]';

export default function RomeItineraryMap({
  points,
  className = '',
  heightClassName = DEFAULT_HEIGHT_CLASSNAME,
}: RomeItineraryMapProps) {
  const mapBoxRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const markerRefs = useRef<MarkerRefs[]>([]);

  // Real bounding box of every plotted point, in [lon, lat] degrees --
  // the only geographic input to this map's framing.
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

        if (labelPlacement === 'above' || labelPlacement === 'below') {
          // Centered labels still need to stay clear of the container's
          // own left/right edges on a narrow viewport -- measure the
          // text's real width and nudge the centering sideways just
          // enough to keep it fully on-screen, rather than always
          // centering exactly on the dot regardless of how close that dot
          // sits to the frame's edge (see 'right'/'left' below for the
          // same underlying "measure, don't guess" approach).
          const textWidth = text.getBoundingClientRect().width || LABEL_FALLBACK_WIDTH_PX;
          const halfWidth = textWidth / 2;
          const minCenter = halfWidth + LABEL_EDGE_BUFFER_PX;
          const maxCenter = containerWidth - halfWidth - LABEL_EDGE_BUFFER_PX;
          const clampedCenter =
            minCenter <= maxCenter
              ? Math.min(Math.max(leftPx, minCenter), maxCenter)
              : containerWidth / 2;
          const offsetX = clampedCenter - leftPx;
          const vertical = labelPlacement === 'above' ? 'calc(-100% - 16px)' : '16px';
          text.style.textAlign = 'center';
          text.style.transform = `translate(calc(-50% + ${offsetX.toFixed(1)}px), ${vertical})`;
          return;
        }

        // 'right' (the default, unset) and 'left': measure this label's
        // own actually-rendered text width and flip to whichever side has
        // real room for it, rather than a single fixed-pixel threshold
        // that doesn't account for how long a given label's text is --
        // that fixed-threshold approach is exactly what let "St. Paul
        // Outside the Walls" (the longest label on the page) clip off the
        // right edge of a narrow mobile viewport on the old per-day map.
        const textWidth = text.getBoundingClientRect().width || LABEL_FALLBACK_WIDTH_PX;
        const roomOnRight = containerWidth - leftPx;
        const roomOnLeft = leftPx;
        const preferLeft = labelPlacement === 'left';
        const preferredRoom = preferLeft ? roomOnLeft : roomOnRight;
        const otherRoom = preferLeft ? roomOnRight : roomOnLeft;
        const fitsPreferred = preferredRoom >= textWidth + LABEL_EDGE_BUFFER_PX;
        const growLeft = fitsPreferred
          ? preferLeft
          : otherRoom > preferredRoom
            ? !preferLeft
            : preferLeft;

        text.style.textAlign = growLeft ? 'right' : 'left';
        text.style.transform = growLeft
          ? 'translate(-14px, -50%) translateX(-100%)'
          : 'translate(14px, -50%)';
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
      <div
        className={`relative w-full overflow-hidden ${heightClassName} bg-[#f6f1e6] dark:bg-[#161310]`}
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
              key={point.id}
              ref={(el) => {
                markerRefs.current[i] = {
                  ...(markerRefs.current[i] ?? {
                    wrapper: null,
                    text: null,
                    labelPlacement: point.labelPlacement,
                  }),
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
                    ...(markerRefs.current[i] ?? {
                      wrapper: null,
                      text: null,
                      labelPlacement: point.labelPlacement,
                    }),
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
