'use client';

import { useEffect, useMemo, useRef } from 'react';
import type { JourneyPoint } from '@/lib/journeys/types';
import type { DepartureAirportRoute } from '@/lib/journeys/flights-departure-airports';
import { project, projectSpan, routeCurvePoint } from './geo';
import { FOCUS_PATHS, NEIGHBOUR_PATHS, WIDE_EUROPE_PATHS } from './generated/geography';
import { HomeIcon, PlaneIcon } from './icons';

// A static sibling of JourneyMapScene, for one specific shape of map that
// engine can't produce: one `home` point fanned out to several airports
// by real, simultaneously-visible routes, with no single travelling
// vehicle and no per-leg camera pan. JourneyMapScene is built around
// exactly one vehicle animating along one route at a time (see its own
// header comment); forcing "four real routes, all drawn at once, each
// ending in its own airport icon" through that engine would mean either
// four separate animated instances (wrong effect -- one route at a time,
// with a travelling vehicle) or fighting its single-vehicle assumptions
// from the inside. This component instead renders every route fully in
// one still frame, and marks `home` with a house icon and every airport
// with a plane icon -- rather than JourneyMapScene's pink-dot-plus-text
// marker -- while reusing the exact same palette, equirectangular
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

// A label text span defaults to centred directly under its icon. Close to
// either edge of a narrow frame (a 320px phone is the real case this
// exists for -- "LJUBLJANA AIRPORT"/"VIENNA AIRPORT" are long enough to
// run past the edge from a marker that sits only ~15% of the frame's
// width in), it instead grows inward from that edge, the same edge-aware
// idea as JourneyMapScene's LABEL_FLIP_MARGIN_PX, just anchored below an
// icon rather than beside a dot. The icon itself never moves either way.
const LABEL_EDGE_MARGIN_PX = 90;

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
  icon: HTMLDivElement | null;
  label: HTMLSpanElement | null;
  /** Vertical gap (px) from the exact point to where the label starts --
   * bigger for the home marker since its badge is a touch larger. */
  gapPx: number;
}

export default function DepartureAirportsMap({
  home,
  airports,
  className = '',
  heightClassName = DEFAULT_HEIGHT_CLASSNAME,
}: DepartureAirportsMapProps) {
  const mapBoxRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const homeRefs = useRef<MarkerRefs>({ icon: null, label: null, gapPx: 24 });
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
      const aspect = rect.width > 0 && rect.height > 0 ? rect.width / rect.height : REFERENCE_ASPECT;
      const frame = computeFrame(aspect);
      const [cx, cy] = project(CAMERA_CENTER);
      const vbX = cx - frame.width / 2;
      const vbY = cy - frame.height / 2;
      svg.setAttribute('viewBox', `${vbX} ${vbY} ${frame.width} ${frame.height}`);

      // ONE REAL LOCATION -> ONE COORDINATE -> ONE PROJECTED POSITION,
      // same rule JourneyMapScene's updateLabelScreenPos follows: the
      // icon is placed at exactly world's projected percentage position
      // within the current viewBox, with no offset, so it never drifts
      // from the real coordinate it marks. Only the separate label text
      // span is nudged (and here, edge-flipped) for legibility.
      const place = (refs: MarkerRefs, world: [number, number]) => {
        const { icon, label, gapPx } = refs;
        const leftPct = ((world[0] - vbX) / frame.width) * 100;
        const topPct = ((world[1] - vbY) / frame.height) * 100;
        if (icon) {
          icon.style.left = `${leftPct}%`;
          icon.style.top = `${topPct}%`;
        }
        if (!label) return;
        label.style.left = `${leftPct}%`;
        label.style.top = `${topPct}%`;
        const leftPx = (leftPct / 100) * containerWidth;
        const rightPx = containerWidth - leftPx;
        if (leftPx < LABEL_EDGE_MARGIN_PX) {
          label.style.textAlign = 'left';
          label.style.transform = `translate(0, ${gapPx}px)`;
        } else if (rightPx < LABEL_EDGE_MARGIN_PX) {
          label.style.textAlign = 'right';
          label.style.transform = `translate(-100%, ${gapPx}px)`;
        } else {
          label.style.textAlign = 'center';
          label.style.transform = `translate(-50%, ${gapPx}px)`;
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

        <div
          ref={(el) => {
            homeRefs.current.icon = el;
          }}
          className='absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center w-7 h-7 rounded-full bg-[#faf9f6] dark:bg-black ring-2 ring-[#e8639f]'
        >
          <HomeIcon className='w-4 h-4 text-[#7a3348] dark:text-[#f2a9c6]' />
        </div>
        <span
          ref={(el) => {
            homeRefs.current.label = el;
          }}
          className='absolute left-0 top-0 block text-[0.65rem] uppercase tracking-[0.16em] font-semibold text-black/70 dark:text-white/80 font-[family-name:var(--font-poppins)] whitespace-nowrap'
        >
          {home.name}
        </span>

        {airports.map(({ airport }, i) => (
          <div key={airport.id}>
            <div
              ref={(el) => {
                airportRefs.current[i] = { ...(airportRefs.current[i] ?? { icon: null, label: null, gapPx: 20 }), icon: el };
              }}
              className='absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center w-6 h-6 rounded-full bg-[#faf9f6] dark:bg-black ring-2 ring-[#e8639f]'
            >
              <PlaneIcon className='w-3.5 h-3.5 text-[#7a3348] dark:text-[#f2a9c6]' />
            </div>
            <span
              ref={(el) => {
                airportRefs.current[i] = { ...(airportRefs.current[i] ?? { icon: null, label: null, gapPx: 20 }), label: el };
              }}
              className='absolute left-0 top-0 block text-[0.6rem] uppercase tracking-[0.14em] font-semibold text-black/70 dark:text-white/80 font-[family-name:var(--font-poppins)] whitespace-nowrap'
            >
              {airport.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
