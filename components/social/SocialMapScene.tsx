'use client';

// A vertical (9:16), externally time-driven variant of the production
// journey map (components/journey/JourneyMapScene.tsx), built specifically
// for the Instagram Reel composition at app/social/tenerife-intro. It is a
// deliberately separate, isolated component — NOT an edit of the approved
// map — so the live Tenerife page's map rendering is completely untouched.
//
// What is genuinely reused (imported, not copied) from the production
// system:
//   - the real journey data (from/to points, verified route waypoints,
//     routeLand coastline-safety polygons) via the JourneyLeg passed in as
//     a prop, which the caller pulls straight from lib/journeys/tenerife.ts
//   - the exact projection/curve/coastline-safety math: project,
//     projectSpan, routeCurvePoint, routeCurveAngleAt, bezierPoint,
//     screenAngle from components/journey/geo.ts
//   - the exact baked real-world coastline/land geometry: WIDE_EUROPE_PATHS
//     / NEIGHBOUR_PATHS / FOCUS_PATHS / CANARY_PATHS from
//     components/journey/generated/geography.ts
//
// What is deliberately different from JourneyMapScene, because this is a
// fixed-canvas Reel frame rather than a scrollable page section:
//   - no IntersectionObserver / internal GSAP autoplay — `progress` (0..1)
//     is a prop, driven by the page's single master timeline so every
//     scene of the Reel stays in lock-step
//   - the camera is either a single static frame (`camera` prop, used for
//     Vienna -> Tenerife) or a small authored set of keyframes
//     (`cameraKeyframes`, used for Home -> Vienna) blended with an eased
//     eased local interpolation — a deliberately simple "editorial pan",
//     not a literal turn-by-turn navigation follow-cam
//   - the frame is always computed at a fixed 9:16 aspect (this composition
//     never resizes to a wide desktop container), so there is no
//     ResizeObserver / measured-container-width logic — sizing is derived
//     from the canvas's authored 1080px logical width instead of a
//     measured DOM rect, so the map's proportions stay correct regardless
//     of how much the whole 1080x1920 stage is scaled down to fit the
//     preview viewport
//
// REFINEMENT PASS (TEST #1, round 2) — map legibility and vehicle
// visibility were both increased here, restrained on purpose: land/
// coastline opacity, route width and label/dot size are all nudged up a
// little, not restyled. No new colors, no darker background — still the
// exact MUTED_BACKGROUND/MUTED_LAND/ROUTE_PINK palette from vehicle-icons.ts.
//
// REFINEMENT PASS (round 3) — geography opacity nudged up once more for
// the Vienna -> Tenerife scene specifically (still restrained, still the
// same palette), and the vehicle icon sized up a little further, while
// keeping the route/dots the strongest element on the frame so the
// hierarchy stays vehicle+route > labels > geography.

import { useMemo } from 'react';
import type { JourneyMode, JourneyPoint } from '@/lib/journeys/types';
import { bezierPoint, project, projectSpan, routeCurveAngleAt, routeCurvePoint, screenAngle } from '@/components/journey/geo';
import { CANARY_PATHS, FOCUS_PATHS, NEIGHBOUR_PATHS, WIDE_EUROPE_PATHS } from '@/components/journey/generated/geography';
import {
  CAR_BODY_PATH,
  CAR_ROOF,
  CAR_WHEEL_HINTS,
  MUTED_BACKGROUND,
  MUTED_LAND,
  MUTED_LINE,
  PLANE_PATH,
  ROUTE_PINK,
  VEHICLE_STROKE,
} from './vehicle-icons';

// The composition's one fixed logical resolution — see app/social/
// tenerife-intro/page.tsx, which renders the whole stage at this size and
// scales it down (via a single CSS transform) to fit the preview viewport.
// Icon/route sizing below is computed against this constant, never a
// measured rect, so it scales uniformly with the rest of the canvas.
const CANVAS_WIDTH = 1080;
const CANVAS_ASPECT = 1080 / 1920;

const ROUTE_SAMPLES = 96;

// Slightly larger than JourneyMapScene's own ratios/clamps — this canvas
// is always viewed at phone-Reel scale, never a large desktop map, so the
// vehicle and route need a bit more presence to read clearly at that size.
// Still the same shapes/colors, just sized up.
const ICON_RATIO = 0.03;
const ICON_MIN_PX = 28;
const ICON_MAX_PX = 44;
const ROUTE_LINE_RATIO = 0.0038;
const ROUTE_LINE_MIN_PX = 2.8;
const ROUTE_LINE_MAX_PX = 4.8;
const ROUTE_GLOW_RATIO = 0.013;
const ROUTE_GLOW_MIN_PX = 8;
const ROUTE_GLOW_MAX_PX = 14;

function targetPx(ratio: number, width: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, ratio * width));
}

function easeInOutCubic(x: number): number {
  const c = Math.min(1, Math.max(0, x));
  return c < 0.5 ? 4 * c * c * c : 1 - Math.pow(-2 * c + 2, 3) / 2;
}

export interface SocialMapLeg {
  mode: JourneyMode;
  from: JourneyPoint;
  to: JourneyPoint;
  route?: [number, number][];
  routeLand?: string[];
  /** Decorative bow used when there is no verified `route` (see
   * JourneyLeg.curve in lib/journeys/types.ts) — the Vienna -> Tenerife
   * leg is drawn this way, exactly as it is on the live site. */
  curve?: number;
}

export interface SocialMapCamera {
  center: [number, number];
  spanDeg: number;
}

export interface SocialMapCameraKeyframe extends SocialMapCamera {
  /** 0..1, position along this scene's own progress. */
  t: number;
}

export interface SocialMapSceneProps {
  leg: SocialMapLeg;
  /** A single static frame for the whole scene (Vienna -> Tenerife uses
   * this — the wide diagonal composition doesn't need to move). */
  camera?: SocialMapCamera;
  /** A small authored sequence of frames, eased between — Home -> Vienna
   * uses this for its gentle "editorial pan" rather than one static wide
   * shot. Provide either this or `camera`, not both. */
  cameraKeyframes?: SocialMapCameraKeyframe[];
  /** 0..1, driven by the page's master timeline. */
  progress: number;
  /** Whether to draw the small pink dot + name label at each endpoint.
   * Off for scenes that already carry a large typographic caption (e.g.
   * "Vienna -> Tenerife"), so the map itself stays uncluttered. */
  showLabels?: boolean;
  className?: string;
}

function resolveCamera(
  clamped: number,
  camera: SocialMapCamera | undefined,
  keyframes: SocialMapCameraKeyframe[] | undefined
): SocialMapCamera {
  if (!keyframes || keyframes.length === 0) return camera ?? { center: [0, 0], spanDeg: 1 };
  if (keyframes.length === 1) return keyframes[0];
  let i = 0;
  while (i < keyframes.length - 2 && clamped > keyframes[i + 1].t) i++;
  const a = keyframes[i];
  const b = keyframes[i + 1];
  const span = b.t - a.t || 1;
  const local = easeInOutCubic((clamped - a.t) / span);
  return {
    center: [a.center[0] + (b.center[0] - a.center[0]) * local, a.center[1] + (b.center[1] - a.center[1]) * local],
    spanDeg: a.spanDeg + (b.spanDeg - a.spanDeg) * local,
  };
}

export default function SocialMapScene({
  leg,
  camera,
  cameraKeyframes,
  progress,
  showLabels = true,
  className = '',
}: SocialMapSceneProps) {
  const clamped = Math.min(1, Math.max(0, progress));

  const effectiveCamera = useMemo(
    () => resolveCamera(clamped, camera, cameraKeyframes),
    [clamped, camera, cameraKeyframes]
  );

  const frame = useMemo(() => {
    const width = projectSpan(effectiveCamera.spanDeg);
    const height = width / CANVAS_ASPECT;
    return { width, height };
  }, [effectiveCamera.spanDeg]);

  const viewBox = useMemo(() => {
    const [cx, cy] = project(effectiveCamera.center);
    return `${cx - frame.width / 2} ${cy - frame.height / 2} ${frame.width} ${frame.height}`;
  }, [effectiveCamera.center, frame]);

  const legPoint = (t: number): [number, number] =>
    leg.route
      ? routeCurvePoint(leg.route, t, leg.routeLand)
      : bezierPoint(leg.from.coords, leg.to.coords, leg.curve ?? 0, t);

  const routeD = useMemo(() => {
    const steps = Math.max(1, Math.round(ROUTE_SAMPLES * clamped));
    const coords: [number, number][] = [];
    for (let s = 0; s <= steps; s++) coords.push(project(legPoint(s / ROUTE_SAMPLES)));
    if (!coords.length) return '';
    return coords.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0].toFixed(3)},${p[1].toFixed(3)}`).join(' ');
  }, [clamped, leg]);

  const vehicleWorld = useMemo(() => project(legPoint(clamped)), [clamped, leg]);
  const vehicleAngle = useMemo(() => {
    const t = Math.min(0.985, clamped);
    if (leg.route) return routeCurveAngleAt(leg.route, t, leg.routeLand);
    // Decorative-bow leg (no verified route): same tangent approach
    // JourneyMapScene uses for a bezierPoint() bow — a small centered
    // step behind/ahead of the vehicle's own position, so the icon still
    // eases smoothly through the curve instead of pointing straight at
    // the destination the whole way.
    const eps = 0.02;
    const a = legPoint(Math.max(0, t - eps));
    const b = legPoint(Math.min(1, t + eps));
    return screenAngle(project(a), project(b));
  }, [clamped, leg]);

  const iconPx = targetPx(ICON_RATIO, CANVAS_WIDTH, ICON_MIN_PX, ICON_MAX_PX);
  const vehicleScale = (iconPx * frame.width) / (24 * CANVAS_WIDTH);
  const linePx = targetPx(ROUTE_LINE_RATIO, CANVAS_WIDTH, ROUTE_LINE_MIN_PX, ROUTE_LINE_MAX_PX);
  const glowPx = targetPx(ROUTE_GLOW_RATIO, CANVAS_WIDTH, ROUTE_GLOW_MIN_PX, ROUTE_GLOW_MAX_PX);
  const lineWidth = (linePx * frame.width) / CANVAS_WIDTH;
  const glowWidth = (glowPx * frame.width) / CANVAS_WIDTH;

  const labelPoints: JourneyPoint[] = showLabels ? [leg.from, leg.to] : [];

  return (
    <div
      className={`relative w-full h-full overflow-hidden ${className}`}
      style={{ background: MUTED_BACKGROUND }}
    >
      <svg className='absolute inset-0 w-full h-full' viewBox={viewBox} preserveAspectRatio='xMidYMid slice'>
        <rect x={-500} y={-300} width={1000} height={600} fill={MUTED_BACKGROUND} />
        {/* Land/coastline opacities nudged up again from the previous
            pass (0.52/0.66/0.92/0.94) — still a restrained bump for
            phone-scale legibility, same MUTED_LAND/MUTED_LINE colors, no
            new tone, no darkening of the composition as a whole. Route,
            dots and vehicle stay the strongest element on the frame (see
            their own values just below), so the visual hierarchy holds:
            vehicle/route first, then labels, then geography. */}
        {WIDE_EUROPE_PATHS.map((d, i) => (
          <path key={`wide-${i}`} d={d} fill={MUTED_LAND} opacity={0.62} />
        ))}
        {NEIGHBOUR_PATHS.map((d, i) => (
          <path key={`neighbour-${i}`} d={d} fill={MUTED_LAND} opacity={0.76} />
        ))}
        {FOCUS_PATHS.map((d, i) => (
          <path key={`focus-${i}`} d={d} fill={MUTED_LAND} stroke={MUTED_LINE} strokeWidth={1.6} vectorEffect='non-scaling-stroke' opacity={0.97} />
        ))}
        {CANARY_PATHS.map((d, i) => (
          <path key={`canary-${i}`} d={d} fill={MUTED_LAND} stroke={MUTED_LINE} strokeWidth={1.6} vectorEffect='non-scaling-stroke' opacity={0.98} />
        ))}

        <path d={routeD} fill='none' stroke={ROUTE_PINK} strokeLinecap='round' strokeLinejoin='round' opacity={0.2} strokeWidth={glowWidth} />
        <path d={routeD} fill='none' stroke={ROUTE_PINK} strokeLinecap='round' strokeLinejoin='round' opacity={1} strokeWidth={lineWidth} />

        {labelPoints.map((p) => {
          const [wx, wy] = project(p.coords);
          return (
            <g key={p.id}>
              <circle cx={wx} cy={wy} r={frame.width * 0.0052} fill={ROUTE_PINK} stroke={MUTED_BACKGROUND} strokeWidth={frame.width * 0.002} />
            </g>
          );
        })}

        <g transform={`translate(${vehicleWorld[0]} ${vehicleWorld[1]}) rotate(${vehicleAngle}) scale(${vehicleScale}) translate(-12 -12)`}>
          {leg.mode === 'plane' ? (
            <path d={PLANE_PATH} fill={VEHICLE_STROKE} stroke='none' />
          ) : (
            <>
              <path d={CAR_BODY_PATH} fill={VEHICLE_STROKE} stroke='none' />
              <rect x={CAR_ROOF.x} y={CAR_ROOF.y} width={CAR_ROOF.width} height={CAR_ROOF.height} rx={CAR_ROOF.rx} fill={MUTED_BACKGROUND} />
              {CAR_WHEEL_HINTS.map(([cx, cy], i) => (
                <ellipse key={i} cx={cx} cy={cy} rx={0.6} ry={0.32} fill={MUTED_BACKGROUND} />
              ))}
            </>
          )}
        </g>
      </svg>

      {/* HTML label text, positioned from the same projected world
          coordinates as the SVG dots above (computed once per render via
          plain percentage math against the current viewBox — no DOM
          measurement needed since this canvas's aspect/size never
          changes). Sized up from the first pass for comfortable phone
          reading. */}
      {labelPoints.map((p) => {
        const [wx, wy] = project(p.coords);
        const vbX = project(effectiveCamera.center)[0] - frame.width / 2;
        const vbY = project(effectiveCamera.center)[1] - frame.height / 2;
        const leftPct = ((wx - vbX) / frame.width) * 100;
        const topPct = ((wy - vbY) / frame.height) * 100;
        return (
          <div
            key={p.id}
            className='absolute flex flex-col leading-tight whitespace-nowrap font-[family-name:var(--font-poppins)]'
            style={{ left: `${leftPct}%`, top: `${topPct}%`, transform: 'translate(22px, -50%)' }}
          >
            <span className='text-[1.35rem] uppercase tracking-[0.16em] font-semibold text-black/80'>{p.name}</span>
            {p.sublabel && <span className='text-[1.05rem] text-black/50'>{p.sublabel}</span>}
          </div>
        );
      })}
    </div>
  );
}
