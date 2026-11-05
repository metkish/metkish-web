'use client';

import { useEffect, useMemo, useRef } from 'react';
import type { JourneyPoint } from '@/lib/journeys/types';
import type { DepartureAirportRoute } from '@/lib/journeys/flights-departure-airports';
import { project, projectSpan, routeCurvePoint } from './geo';
import { FOCUS_PATHS, NEIGHBOUR_PATHS, WIDE_EUROPE_PATHS } from './generated/geography';

// A static sibling of JourneyMapScene, for one specific shape of map that
// engine can't produce: one `home` point fanned out to several airports
// by real, simultaneously-visible routes, with no single travelling
// vehicle and no per-leg camera pan. JourneyMapScene is built around
// exactly one vehicle animating along one route at a time (see its own
// header comment); forcing "four real routes, all drawn at once" through
// that engine would mean either four separate animated instances (wrong
// effect -- one route at a time, with a travelling vehicle) or fighting
// its single-vehicle assumptions from the inside. This component instead
// renders every route fully in one still frame, while reusing -- exactly,
// not just approximately -- JourneyMapScene's own marker convention: a
// small solid pink dot plus an uppercase label, no icon, no badge. See
// JourneyMapScene.tsx's labelPoints.map() block for the source of truth
// this mirrors. It also reuses the same palette, equirectangular
// projection, generated coastline/border data and real-route curve math
// (components/journey/geo.ts, components/journey/generated/geography.ts).
const MUTED_BACKGROUND = '#f6f1e6';
const MUTED_LAND = '#efe8d8';
const MUTED_LINE = '#ddd0b8';
const ROUTE_PINK = '#e8639f';

// Fewer samples than JourneyMapScene's ROUTE_SAMPLES (2000): this map has
// no progressive reveal-as-travelled to sample into, and every route here
// is a short, already-thinned real-waypoint list (a handful of points),
// so 300 is comfortably oversampled for a smooth static curve.
const ROUTE_SAMPLES = 300;

// Reference framing tuned for the current Home + 4-airport set (Ljubljana,
// Zagreb, Graz, Vienna airports): centred roughly between all five real
// points, with REFERENCE_ASPECT set to that padded bounding box's own
// aspect ratio in projected world units (lon-span * cos(REF_LAT) /
// lat-span) -- the box is naturally taller than wide (Zagreb-to-Vienna is
// a bigger north-south reach than Ljubljana-to-Vienna is east-west), so a
// wide desktop container shows extra *horizontal* breathing room while
// always keeping the full vertical reach, and a narrower mobile container
// keeps that same full vertical reach too, only cropping width. If more
// airports are ever added to DEPARTURE_AIRPORTS, re-derive these three
// numbers from the new bounding box rather than nudging them by eye.
const CAMERA_CENTER: [number, number] = [15.5, 46.95];
const CAMERA_SPAN_DEG = 2.9;
const REFERENCE_ASPECT = 0.766;
const MAX_HEIGHT_MULTIPLIER = 1.4;

function computeFrame(aspect: number): { width: number; height: number } {
  const w0 = projectSpan(CAMERA_SPAN_DEG);
  const h0 = w0 / REFERENCE_ASPECT;
  if (!isFinite(aspect) || aspect <= 0) return { width: w0, height: h0 };
  if (aspect >= REFERENCE_ASPECT) {
    return { width: h0 * aspect, height: h0 };
  }
  let width = w0;
  let height = w0 / aspect;
  const maxHeight = h0 * MAX_HEIGHT_MULTIPLIER;
  if (height > maxHeight) {
    height = maxHeight;
    width = height * aspect;
  }
  return { width, height };
}

// Exactly JourneyMapScene's own LABEL_FLIP_MARGIN_PX: a label defaults to
// growing to the right of its dot, flipping to grow leftward only once
// the dot sits within this many pixels of the frame's right edge (the
// real case this exists for on a narrow phone -- "LJUBLJANA AIRPORT" is
// long enough to run off-screen from a marker near the right side). The
// dot itself never moves either way.
const LABEL_FLIP_MARGIN_PX = 160;

export interface DepartureAirportsMapProps {
  home: JourneyPoint;
  airports: DepartureAirportRoute[];
  className?: string;
  /** Overrides the wrapper's default height classes -- same knob as
   * JourneyMapScene's own heightClassName prop. */
  heightClassName?: string;
}

const DEFAULT_HEIGHT_CLASSNAME = 'h-[380px] sm:h-[440px] md:h-[500px]';

interface MarkerRefs {
  /** The wrapper positioned at the exact projected coordinate -- holds
   * both the dot and the label, mirroring JourneyMapScene's labelRefs. */
  wrapper: HTMLDivElement | null;
  /** The label's own text span, nudged aside from the wrapper's origin
   * for legibility -- mirrors JourneyMapScene's labelTextRefs. */
  text: HTMLSpanElement | null;
  /** Mirrors JourneyPoint.labelPlacement: 'right' (default, flips left
   * near the frame's right edge) or 'above', for a point whose incoming
   * routes crowd its default side. */
  labelPlacement?: 'right' | 'above';
}

export default function DepartureAirportsMap({
  home,
  airports,
  className = '',
  heightClassName = DEFAULT_HEIGHT_CLASSNAME,
}: DepartureAirportsMapProps) {
  const mapBoxRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const homeRefs = useRef<MarkerRefs>({ wrapper: null, text: null });
  const airportRefs = useRef<MarkerRefs[]>([]);

  // Each route is a real, already-verified waypoint list (see
  // lib/journeys/flights-departure-airports.ts) sampled once through the
  // same routeCurvePoint() smoothing JourneyMapScene uses for a verified
  // real route -- no `land` argument, since this whole region (Slovenia /
  // Austria / Croatia / the Hungary border dip) is entirely inland, with
  // no coastline risk to guard against.
  const routePaths = useMemo(
    () =>
      airports.map(({ route }) => {
        const pts: [number, number][] = [];
        for (let s = 0; s <= ROUTE_SAMPLES; s++) {
          pts.push(project(routeCurvePoint(route, s / ROUTE_SAMPLES)));
        }
        return pts
          .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0].toFixed(5)},${p[1].toFixed(5)}`)
          .join(' ');
      }),
    [airports]
  );

  const homeWorld = useMemo(() => project(home.coords), [home]);
  const airportWorlds = useMemo(() => airports.map((a) => project(a.airport.coords)), [airports]);

  // No animation loop here (unlike JourneyMapScene): the camera never
  // pans and no route is progressively drawn, so this only ever needs to
  // run once on mount and again whenever the container's own aspect
  // ratio changes (resize, orientation change) -- the same
  // measure()/ResizeObserver shape JourneyMapScene uses, just without a
  // per-frame tween driving it.
  useEffect(() => {
    const mapBox = mapBoxRef.current;
    const svg = svgRef.current;
    if (!mapBox || !svg) return;

    const measure = () => {
      const rect = mapBox.getBoundingClientRect();
      const containerWidth = rect.width || 1;
      const containerHeight = rect.height || containerWidth / REFERENCE_ASPECT;
      const aspect = rect.width > 0 && rect.height > 0 ? rect.width / rect.height : REFERENCE_ASPECT;
      const frame = computeFrame(aspect);
      const [cx, cy] = project(CAMERA_CENTER);
      const vbX = cx - frame.width / 2;
      const vbY = cy - frame.height / 2;
      svg.setAttribute('viewBox', `${vbX} ${vbY} ${frame.width} ${frame.height}`);

      // ONE REAL LOCATION -> ONE COORDINATE -> ONE PROJECTED POSITION,
      // exactly JourneyMapScene's updateLabelScreenPos: the wrapper is
      // translated to world's projected pixel position within the
      // current viewBox, with no offset, so the dot centred on its own
      // origin never drifts from the real coordinate it marks. Only the
      // separate label text span is nudged (and edge-flipped, or placed
      // above when labelPlacement === 'above') for legibility.
      const place = (refs: MarkerRefs, world: [number, number]) => {
        const { wrapper, text, labelPlacement } = refs;
        const leftPx = ((world[0] - vbX) / frame.width) * containerWidth;
        const topPx = ((world[1] - vbY) / frame.height) * containerHeight;
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
          text.style.transform = flip ? 'translate(-14px, -50%) translateX(-100%)' : 'translate(14px, -50%)';
        }
      };
      place(homeRefs.current, homeWorld);
      airportWorlds.forEach((w, i) => {
        const refs = airportRefs.current[i];
        if (refs) place(refs, w);
      });
    };

    measure();
    const resizeObserver = new ResizeObserver(() => measure());
    resizeObserver.observe(mapBox);
    return () => resizeObserver.disconnect();
  }, [homeWorld, airportWorlds]);

  return (
    <div
      className={`relative w-full overflow-hidden ${heightClassName} bg-[#f6f1e6] dark:bg-[#161310] ${className}`}
    >
      <div ref={mapBoxRef} className='absolute inset-0'>
        <svg
          ref={svgRef}
          className='absolute inset-0 w-full h-full'
          preserveAspectRatio='xMidYMid slice'
        >
          <rect x={-500} y={-300} width={1000} height={600} fill={MUTED_BACKGROUND} />
          {/* Same coarse-to-fine coastline/border layering as
              JourneyMapScene, built at the same time from the same
              OpenStreetMap-derived data (scripts/build-geo.mjs) -- this
              map only ever needs the FOCUS (Austria + Slovenia) and
              NEIGHBOUR (which already includes Croatia and Hungary, both
              needed for the real Zagreb-leg border dip) tiers, never the
              Canary Islands shapes JourneyMapScene also carries. */}
          {WIDE_EUROPE_PATHS.map((d, i) => (
            <path key={`wide-${i}`} d={d} fill={MUTED_LAND} opacity={0.4} />
          ))}
          {NEIGHBOUR_PATHS.map((d, i) => (
            <path key={`neighbour-${i}`} d={d} fill={MUTED_LAND} opacity={0.55} />
          ))}
          {FOCUS_PATHS.map((d, i) => (
            <path
              key={`focus-${i}`}
              d={d}
              fill={MUTED_LAND}
              stroke={MUTED_LINE}
              strokeWidth={1}
              vectorEffect='non-scaling-stroke'
              opacity={0.8}
            />
          ))}
          {/* Every route drawn fully and simultaneously -- the whole
              point of this map -- as a soft glow plus a solid line, same
              two-pass treatment and same ROUTE_PINK as every other
              Metkish map. */}
          {routePaths.map((d, i) => (
            <path
              key={`glow-${i}`}
              d={d}
              fill='none'
              stroke={ROUTE_PINK}
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={5}
              vectorEffect='non-scaling-stroke'
              opacity={0.14}
            />
          ))}
          {routePaths.map((d, i) => (
            <path
              key={`line-${i}`}
              d={d}
              fill='none'
              stroke={ROUTE_PINK}
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              vectorEffect='non-scaling-stroke'
              opacity={0.92}
            />
          ))}
        </svg>

        {/* Home marker: the exact JourneyMapScene convention -- a small
            solid pink dot centred on the real coordinate, no icon, no
            badge, with an uppercase label growing beside it. */}
        <div
          ref={(el) => {
            homeRefs.current.wrapper = el;
          }}
          className='absolute left-0 top-0'
        >
          <span className='absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2 block w-2 h-2 rounded-full bg-[#e8639f] ring-2 ring-[#f6f1e6]' />
          <span
            ref={(el) => {
              homeRefs.current.text = el;
            }}
            className='absolute left-0 top-0 flex flex-col leading-tight whitespace-nowrap font-[family-name:var(--font-poppins)]'
          >
            <span className='text-[0.65rem] uppercase tracking-[0.16em] font-semibold text-black/70'>
              {home.name}
            </span>
          </span>
        </div>

        {airports.map(({ airport }, i) => (
          <div
            key={airport.id}
            ref={(el) => {
              airportRefs.current[i] = { ...(airportRefs.current[i] ?? { wrapper: null, text: null }), wrapper: el };
            }}
            className='absolute left-0 top-0'
          >
            <span className='absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2 block w-2 h-2 rounded-full bg-[#e8639f] ring-2 ring-[#f6f1e6]' />
            <span
              ref={(el) => {
                airportRefs.current[i] = { ...(airportRefs.current[i] ?? { wrapper: null, text: null }), text: el };
              }}
              className='absolute left-0 top-0 flex flex-col leading-tight whitespace-nowrap font-[family-name:var(--font-poppins)]'
            >
              <span className='text-[0.65rem] uppercase tracking-[0.16em] font-semibold text-black/70'>
                {airport.name}
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
