'use client';

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { Journey, JourneyLeg, JourneyMode, JourneyPoint } from '@/lib/journeys/types';
import { bezierPoint, project, projectSpan, screenAngle, smoothClosedPath } from './geo';
import {
  CANARY_NEIGHBOURS,
  CENTRAL_EUROPE_LAND,
  NW_AFRICA_LAND,
  TENERIFE_ISLAND,
  WEST_EUROPE_LAND,
} from './map-geography';
import { JourneyProgressContext } from './journey-context';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// A hand-drawn, editorial-atlas palette — the same warm neutrals used
// across the rest of the site, kept deliberately muted so the map reads as
// illustration rather than a navigation tool.
const MUTED_BACKGROUND = '#f6f1e6';
const MUTED_LAND = '#efe8d8';
const MUTED_LINE = '#ddd0b8';
const ROUTE_PINK = '#e8639f';
const VEHICLE_STROKE = '#7a3348';

const ROUTE_SAMPLES = 48;

// How the on-screen "camera" frames the world. spanDeg is authored per
// leg (degrees of longitude wide, at a reference aspect ratio); the actual
// frame is derived at render time from the real container aspect, so a
// narrow mobile screen gets a genuinely tighter crop rather than a taller
// version of the same wide shot.
const REFERENCE_ASPECT = 1.7;
const MAX_HEIGHT_MULTIPLIER = 2.2;

// The vehicle icon and route line are drawn at a constant screen-pixel
// size no matter how far the camera has zoomed in or out (world-space
// stroke widths/scales are derived from this each frame). Each is a
// fraction of the container's own width, clamped to a legible min/max —
// the clamp matters most on a narrow phone screen, where "a fraction of
// container width" alone would shrink both to an unreadable sliver rather
// than the same steady size a wider screen gets.
const ICON_RATIO = 0.028;
const ICON_MIN_PX = 26;
const ICON_MAX_PX = 42;
const ROUTE_LINE_RATIO = 0.0024;
const ROUTE_LINE_MIN_PX = 1.6;
const ROUTE_LINE_MAX_PX = 3;
const ROUTE_GLOW_RATIO = 0.009;
const ROUTE_GLOW_MIN_PX = 5;
const ROUTE_GLOW_MAX_PX = 9;

function targetPx(ratio: number, containerWidth: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, ratio * containerWidth));
}

interface Frame {
  width: number;
  height: number;
}

function computeFrame(spanDeg: number, aspect: number): Frame {
  const w0 = projectSpan(spanDeg);
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

interface LegRange {
  leg: JourneyLeg;
  start: number;
  end: number;
}

function computeLegRanges(legs: JourneyLeg[]): LegRange[] {
  const total = legs.reduce((sum, leg) => sum + (leg.weight ?? 1), 0) || 1;
  let cumulative = 0;
  return legs.map((leg) => {
    const start = cumulative / total;
    cumulative += leg.weight ?? 1;
    const end = cumulative / total;
    return { leg, start, end };
  });
}

function clamp01(x: number): number {
  return Math.min(1, Math.max(0, x));
}

function findLabelPoint(legs: JourneyLeg[]): JourneyPoint | null {
  for (const leg of legs) {
    if (leg.from.showMapLabel) return leg.from;
    if (leg.to.showMapLabel) return leg.to;
  }
  return null;
}

// Global scroll-smooth lock ----------------------------------------------
// The site applies Tailwind's `scroll-smooth` globally, which fights with
// GSAP ScrollTrigger's own scrub-driven scroll math. Rather than touching
// the global layout, every mounted journey scene takes a reference-counted
// lock that forces `scroll-behavior: auto` for as long as any scene is on
// screen, restoring the previous value once the last one unmounts.
let smoothScrollLockCount = 0;
let previousScrollBehavior = '';
function lockSmoothScroll() {
  if (typeof document === 'undefined') return;
  if (smoothScrollLockCount === 0) {
    previousScrollBehavior = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = 'auto';
  }
  smoothScrollLockCount++;
}
function unlockSmoothScroll() {
  if (typeof document === 'undefined') return;
  smoothScrollLockCount = Math.max(0, smoothScrollLockCount - 1);
  if (smoothScrollLockCount === 0) {
    document.documentElement.style.scrollBehavior = previousScrollBehavior;
  }
}

// Vehicle icon path data (24x24 box, centered ~12,12) — mirrors the
// minimal line-art already used for CarIcon / PlaneIcon / TransferIcon
// elsewhere on the site, inlined here so it can live directly inside the
// map's own <svg> and be positioned/rotated/scaled with a single
// transform rather than an HTML overlay.
const CAR_PATHS = [
  'M4 15.5 5.4 10a2 2 0 0 1 1.9-1.4h9.4A2 2 0 0 1 18.6 10L20 15.5',
  'M3.5 15.5h17v2.2a1 1 0 0 1-1 1h-1.2a1 1 0 0 1-1-1V17H6.7v.7a1 1 0 0 1-1 1H4.5a1 1 0 0 1-1-1z',
];
const CAR_WHEELS: [number, number][] = [
  [7.5, 15.5],
  [16.5, 15.5],
];
const PLANE_PATH =
  'M11.2 3.2 12 2.4l.8.8v6.1l6.3 4v1.6l-6.3-2v4.6l1.9 1.5v1.4L12 19.6l-2.7.8v-1.4l1.9-1.5v-4.6l-6.3 2v-1.6l6.3-4z';
const TRANSFER_PATHS = [
  'M4 16 5 10.6a2 2 0 0 1 2-1.6h7.6a2 2 0 0 1 1.9 1.3l1.5 4.2',
  'M3.5 16h17v2.6h-2v-.4a1 1 0 0 0-1-1h-.4a1 1 0 0 0-1 1v.4H7.9v-.4a1 1 0 0 0-1-1h-.4a1 1 0 0 0-1 1v.4h-2z',
  'M9.2 9.4V6.8h5.6v2.6',
];
const TRANSFER_WHEELS: [number, number][] = [
  [7, 16.2],
  [16.5, 16.2],
];

export interface JourneyMapSceneProps {
  journey: Journey;
  /** Total scroll distance for the whole scene, in viewport heights. */
  heightVh?: number;
  className?: string;
  children?: ReactNode;
}

export default function JourneyMapScene({
  journey,
  heightVh = 500,
  className = '',
  children,
}: JourneyMapSceneProps) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const mapBoxRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const routeGlowRef = useRef<SVGPathElement | null>(null);
  const routeLineRef = useRef<SVGPathElement | null>(null);
  const vehicleGroupRef = useRef<SVGGElement | null>(null);
  const labelRef = useRef<HTMLDivElement | null>(null);

  const [progress, setProgress] = useState(0);
  const [vehicleMode, setVehicleMode] = useState<JourneyMode>(journey.legs[0]?.mode ?? 'car');

  const legRanges = useMemo(() => computeLegRanges(journey.legs), [journey]);
  const labelPoint = useMemo(() => findLabelPoint(journey.legs), [journey]);
  const labelWorld = useMemo(() => (labelPoint ? project(labelPoint.coords) : null), [labelPoint]);

  // Static illustrative land shapes — computed once, never touched again
  // by the scroll/zoom animation, since they live in the same world
  // coordinate space the viewBox pans and zooms over.
  const landPaths = useMemo(
    () => ({
      centralEurope: smoothClosedPath(CENTRAL_EUROPE_LAND.map(project)),
      westEurope: smoothClosedPath(WEST_EUROPE_LAND.map(project)),
      nwAfrica: smoothClosedPath(NW_AFRICA_LAND.map(project)),
      tenerife: smoothClosedPath(TENERIFE_ISLAND.map(project)),
      canaryNeighbours: CANARY_NEIGHBOURS.map((ring) => smoothClosedPath(ring.map(project))),
    }),
    []
  );

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const mapBox = mapBoxRef.current;
    const svg = svgRef.current;
    if (!wrapper || !mapBox || !svg) return;

    lockSmoothScroll();

    const viewBoxProxy = {
      lng: journey.initialCamera.center[0],
      lat: journey.initialCamera.center[1],
      spanDeg: journey.initialCamera.spanDeg,
    };
    const containerSize = { width: 1200, height: 700 };
    let currentFrame: Frame = computeFrame(viewBoxProxy.spanDeg, containerSize.width / containerSize.height);

    let activeLegIndex = -1;
    let activeMode: JourneyMode = journey.legs[0]?.mode ?? 'car';
    let lastAppliedProgress = -1;
    let vehicleWorld: [number, number] = project(
      journey.legs[0]?.from.coords ?? journey.initialCamera.center
    );
    let vehicleAngle = 0;
    let labelRevealed = false;
    let cameraTween: gsap.core.Tween | null = null;

    const syncViewBoxAttribute = () => {
      const aspect = containerSize.width / containerSize.height;
      currentFrame = computeFrame(viewBoxProxy.spanDeg, aspect);
      const [cx, cy] = project([viewBoxProxy.lng, viewBoxProxy.lat]);
      svg.setAttribute(
        'viewBox',
        `${cx - currentFrame.width / 2} ${cy - currentFrame.height / 2} ${currentFrame.width} ${currentFrame.height}`
      );
    };

    const updateVehicleTransform = () => {
      const g = vehicleGroupRef.current;
      if (!g) return;
      const px = targetPx(ICON_RATIO, containerSize.width, ICON_MIN_PX, ICON_MAX_PX);
      const scale = (px * currentFrame.width) / (24 * containerSize.width);
      g.setAttribute(
        'transform',
        `translate(${vehicleWorld[0]} ${vehicleWorld[1]}) rotate(${vehicleAngle}) scale(${scale}) translate(-12 -12)`
      );
    };

    const applyRouteStrokeWidth = () => {
      const linePx = targetPx(ROUTE_LINE_RATIO, containerSize.width, ROUTE_LINE_MIN_PX, ROUTE_LINE_MAX_PX);
      const glowPx = targetPx(ROUTE_GLOW_RATIO, containerSize.width, ROUTE_GLOW_MIN_PX, ROUTE_GLOW_MAX_PX);
      routeLineRef.current?.setAttribute('stroke-width', String((linePx * currentFrame.width) / containerSize.width));
      routeGlowRef.current?.setAttribute('stroke-width', String((glowPx * currentFrame.width) / containerSize.width));
    };

    const updateLabelScreenPos = () => {
      const label = labelRef.current;
      if (!label || !labelWorld) return;
      const aspect = containerSize.width / containerSize.height;
      const vbX = project([viewBoxProxy.lng, viewBoxProxy.lat])[0] - currentFrame.width / 2;
      const vbY = project([viewBoxProxy.lng, viewBoxProxy.lat])[1] - currentFrame.height / 2;
      const left = ((labelWorld[0] - vbX) / currentFrame.width) * containerSize.width;
      const top = ((labelWorld[1] - vbY) / currentFrame.height) * containerSize.height;
      label.style.transform = `translate(${left.toFixed(1)}px, ${top.toFixed(1)}px) translate(14px, -50%)`;
      if (labelRevealed) label.style.opacity = '1';
      void aspect;
    };

    const onCameraTweenUpdate = () => {
      syncViewBoxAttribute();
      updateVehicleTransform();
      applyRouteStrokeWidth();
      updateLabelScreenPos();
    };

    const render = (raw: number) => {
      const clamped = clamp01(raw);
      let legIndex = legRanges.findIndex((r) => clamped >= r.start && clamped <= r.end);
      if (legIndex === -1) legIndex = legRanges.length - 1;
      const range = legRanges[legIndex];
      const leg = range.leg;
      const span = range.end - range.start || 1;
      const localProgress = clamp01((clamped - range.start) / span);

      if (legIndex !== activeLegIndex) {
        activeLegIndex = legIndex;
        cameraTween?.kill();
        cameraTween = gsap.to(viewBoxProxy, {
          lng: leg.camera.center[0],
          lat: leg.camera.center[1],
          spanDeg: leg.camera.spanDeg,
          duration: leg.transition === 'fly' ? 1.9 : 1.3,
          ease: 'power2.inOut',
          onUpdate: onCameraTweenUpdate,
        });
        if (leg.mode !== activeMode) {
          activeMode = leg.mode;
          setVehicleMode(leg.mode);
        }
        if (!labelRevealed && (leg.from.showMapLabel || leg.to.showMapLabel)) {
          labelRevealed = true;
        }
      }

      if (leg.showRoute !== false) {
        const coordinates: [number, number][] = [];
        legRanges.forEach((r, i) => {
          if (r.leg.showRoute === false) return;
          if (i < legIndex) {
            for (let s = 0; s <= ROUTE_SAMPLES; s++) {
              coordinates.push(project(bezierPoint(r.leg.from.coords, r.leg.to.coords, r.leg.curve ?? 0, s / ROUTE_SAMPLES)));
            }
          } else if (i === legIndex) {
            const steps = Math.max(1, Math.round(ROUTE_SAMPLES * localProgress));
            for (let s = 0; s <= steps; s++) {
              coordinates.push(project(bezierPoint(r.leg.from.coords, r.leg.to.coords, r.leg.curve ?? 0, s / ROUTE_SAMPLES)));
            }
          }
        });
        const d = coordinates.length
          ? coordinates.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0].toFixed(3)},${p[1].toFixed(3)}`).join(' ')
          : '';
        routeGlowRef.current?.setAttribute('d', d);
        routeLineRef.current?.setAttribute('d', d);
      }

      if (leg.showRoute === false) {
        vehicleWorld = project(leg.from.coords);
      } else {
        const point = bezierPoint(leg.from.coords, leg.to.coords, leg.curve ?? 0, localProgress);
        const lookAhead = bezierPoint(
          leg.from.coords,
          leg.to.coords,
          leg.curve ?? 0,
          Math.min(1, localProgress + 0.02)
        );
        vehicleWorld = project(point);
        if (localProgress < 0.999) {
          vehicleAngle = screenAngle(vehicleWorld, project(lookAhead));
        }
      }

      updateVehicleTransform();
      applyRouteStrokeWidth();
      updateLabelScreenPos();

      if (Math.abs(clamped - lastAppliedProgress) > 0.0015) {
        lastAppliedProgress = clamped;
        setProgress(clamped);
      }
    };

    const measure = () => {
      const rect = mapBox.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        containerSize.width = rect.width;
        containerSize.height = rect.height;
      }
      syncViewBoxAttribute();
      updateVehicleTransform();
      applyRouteStrokeWidth();
      updateLabelScreenPos();
    };

    measure();

    const resizeObserver = new ResizeObserver(() => measure());
    resizeObserver.observe(mapBox);

    const trigger = ScrollTrigger.create({
      trigger: wrapper,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.4,
      onUpdate: (self) => render(self.progress),
      onRefresh: (self) => render(self.progress),
    });
    render(trigger.progress);

    const raf = requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => {
      cancelAnimationFrame(raf);
      trigger.kill();
      cameraTween?.kill();
      resizeObserver.disconnect();
      unlockSmoothScroll();
    };
  }, [journey, legRanges, labelWorld]);

  return (
    <div ref={wrapperRef} style={{ height: `${heightVh}vh` }} className={`relative ${className}`}>
      <div className='sticky top-0 h-[100svh] md:h-screen w-full overflow-hidden bg-[#f6f1e6] dark:bg-[#161310]'>
        <div ref={mapBoxRef} className='absolute inset-0'>
          <svg
            ref={svgRef}
            className='absolute inset-0 w-full h-full'
            preserveAspectRatio='xMidYMid slice'
          >
            <rect x={-500} y={-300} width={1000} height={600} fill={MUTED_BACKGROUND} />
            <path d={landPaths.westEurope} fill={MUTED_LAND} opacity={0.45} />
            <path d={landPaths.nwAfrica} fill={MUTED_LAND} opacity={0.42} />
            <path d={landPaths.centralEurope} fill={MUTED_LAND} opacity={0.6} />
            {landPaths.canaryNeighbours.map((d, i) => (
              <path key={i} d={d} fill={MUTED_LAND} opacity={0.5} />
            ))}
            <path
              d={landPaths.tenerife}
              fill={MUTED_LAND}
              stroke={MUTED_LINE}
              strokeWidth={1.1}
              vectorEffect='non-scaling-stroke'
              opacity={0.85}
            />

            <path ref={routeGlowRef} d='' fill='none' stroke={ROUTE_PINK} strokeLinecap='round' strokeLinejoin='round' opacity={0.14} />
            <path ref={routeLineRef} d='' fill='none' stroke={ROUTE_PINK} strokeLinecap='round' strokeLinejoin='round' opacity={0.92} />

            <g ref={vehicleGroupRef}>
              <circle
                cx={12}
                cy={12}
                r={11}
                fill='#faf9f6'
                stroke={ROUTE_PINK}
                strokeWidth={1.3}
                vectorEffect='non-scaling-stroke'
              />
              {vehicleMode === 'plane' ? (
                <path
                  d={PLANE_PATH}
                  fill='none'
                  stroke={VEHICLE_STROKE}
                  strokeWidth={1.5}
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  vectorEffect='non-scaling-stroke'
                />
              ) : vehicleMode === 'transfer' || vehicleMode === 'train' ? (
                <>
                  {TRANSFER_PATHS.map((d, i) => (
                    <path
                      key={i}
                      d={d}
                      fill='none'
                      stroke={VEHICLE_STROKE}
                      strokeWidth={1.5}
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      vectorEffect='non-scaling-stroke'
                    />
                  ))}
                  {TRANSFER_WHEELS.map(([cx, cy], i) => (
                    <circle key={i} cx={cx} cy={cy} r={1.2} fill='none' stroke={VEHICLE_STROKE} strokeWidth={1.5} vectorEffect='non-scaling-stroke' />
                  ))}
                </>
              ) : (
                <>
                  {CAR_PATHS.map((d, i) => (
                    <path
                      key={i}
                      d={d}
                      fill='none'
                      stroke={VEHICLE_STROKE}
                      strokeWidth={1.5}
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      vectorEffect='non-scaling-stroke'
                    />
                  ))}
                  {CAR_WHEELS.map(([cx, cy], i) => (
                    <circle key={i} cx={cx} cy={cy} r={1.3} fill='none' stroke={VEHICLE_STROKE} strokeWidth={1.5} vectorEffect='non-scaling-stroke' />
                  ))}
                </>
              )}
            </g>
          </svg>

          {labelPoint && (
            <div
              ref={labelRef}
              className='absolute left-0 top-0 flex items-center gap-2 pointer-events-none opacity-0 transition-opacity duration-700 ease-out'
            >
              <span className='block w-2 h-2 rounded-full bg-[#e8639f] ring-2 ring-[#f6f1e6]' />
              <span className='flex flex-col leading-tight font-[family-name:var(--font-poppins)]'>
                <span className='text-[0.65rem] uppercase tracking-[0.16em] font-semibold text-black/70'>
                  {labelPoint.name}
                </span>
                {labelPoint.sublabel && (
                  <span className='text-[0.6rem] text-black/45'>{labelPoint.sublabel}</span>
                )}
              </span>
            </div>
          )}
        </div>

        <div className='absolute inset-0'>
          <JourneyProgressContext.Provider value={progress}>{children}</JourneyProgressContext.Provider>
        </div>
      </div>
    </div>
  );
}
