'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import type { Journey, JourneyLeg, JourneyMode, JourneyPoint } from '@/lib/journeys/types';
import { bezierPoint, project, projectSpan, screenAngle, routeCurvePoint, routeCurveAngleAt } from './geo';
import { CANARY_PATHS, FOCUS_PATHS, NEIGHBOUR_PATHS, WIDE_EUROPE_PATHS } from './generated/geography';

// A hand-drawn, editorial-atlas palette — the same warm neutrals used
// across the rest of the site, kept deliberately muted so the map reads as
// illustration rather than a navigation tool.
const MUTED_BACKGROUND = '#f6f1e6';
const MUTED_LAND = '#efe8d8';
const MUTED_LINE = '#ddd0b8';
const ROUTE_PINK = '#e8639f';
const VEHICLE_STROKE = '#7a3348';

// Sample count per leg for the drawn route polyline. Raised again from
// 240 now that the Tenerife South/Duque/Siam legs carry the real, close
// to full-precision OSRM point count (hundreds of real waypoints per leg,
// per the metkish-route-geometry project rule's "prioritise real geometry
// over low point count") rather than a hand-thinned handful. At 240
// samples the ratio of drawn samples to real points on those legs would
// again drop low enough that the polyline between samples reads as
// faceted instead of tracking the real curve — the same class of
// quantization issue raised sample count from 96 to 240 for originally.
// 2000 keeps comfortable oversampling relative to even the densest leg
// (~800 real points) on every leg in this file; cost is still negligible
// for a static SVG path.
const ROUTE_SAMPLES = 2000;

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
const ICON_RATIO = 0.02;
const ICON_MIN_PX = 17;
const ICON_MAX_PX = 28;
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

// `leg.weight` doubles as this leg's share of the journey: under the old
// scroll-scrubbed system it was a fraction of scroll distance, and under
// this time-based autoplay it's a fraction of the animation's total
// duration — same normalization math either way, just a different unit on
// the other end. See totalDurationSeconds below for where the "unit" is
// actually seconds.
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

function totalDurationSeconds(legs: JourneyLeg[]): number {
  return legs.reduce((sum, leg) => sum + (leg.weight ?? 1), 0) || 1;
}

function clamp01(x: number): number {
  return Math.min(1, Math.max(0, x));
}

// A journey can have several points worth marking at once (e.g. the home
// area and Vienna Airport both visible in the same close-up stage), so this
// collects every showMapLabel point across all legs, in first-seen order,
// deduped by id since the same point often appears as both a leg's `to`
// and the next leg's `from`.
function findLabelPoints(legs: JourneyLeg[]): JourneyPoint[] {
  const seen = new Set<string>();
  const points: JourneyPoint[] = [];
  for (const leg of legs) {
    for (const p of [leg.from, leg.to]) {
      if (p.showMapLabel && !seen.has(p.id)) {
        seen.add(p.id);
        points.push(p);
      }
    }
  }
  return points;
}

// Vehicle icon path data (24x24 box, centered at 12,12) — the approved
// top-down silhouettes for the reusable journey-map vehicle marker
// (car + plane), settled after several rounds of visual review. Authored
// nose-first along +x so `rotate(vehicleAngle)` below — where
// vehicleAngle = screenAngle(...), 0 = pointing along +x — always faces
// the actual direction of travel with no extra offset needed. These are
// solid editorial-atlas silhouettes (filled, not stroked): a distinct
// icon language from the thin line-art CarIcon / PlaneIcon in ./icons.tsx,
// which are a separate set used for static mode badges elsewhere on the
// site and are not rotated.
//
// PLANE_PATH — modern commercial passenger aircraft (737/A320-inspired):
// rounded nose (never a sharp fighter-jet point), one long slender swept
// main wing, a visibly smaller swept tailplane. Deliberately not a
// military silhouette.
//
// CAR_BODY_PATH — boxy modern passenger car, straight sides with only
// corner rounding (not an oval/capsule outline), viewed directly from
// above. CAR_ROOF and CAR_WHEEL_HINTS are cut out in the map's own
// background tone (not stroked) so the cabin and wheels read at a glance.
const PLANE_PATH =
  'M 20.7,11.3 Q 22,11.5 22,12 Q 22,12.5 20.7,12.7 L 18.5,12.9 L 12.5,12.8 L 8.8,16.9 Q 8.4,17.2 8,16.95 L 7.85,12.9 L 5.7,12.78 L 4.3,13.65 Q 3.9,13.8 3.65,13.45 L 4.35,12.58 L 2,12.38 L 2,11.62 L 4.35,11.42 L 3.65,10.55 Q 3.9,10.2 4.3,10.35 L 5.7,11.22 L 7.85,11.1 L 8,7.05 Q 8.4,6.8 8.8,7.1 L 12.5,11.2 L 18.5,11.1 Z';
const CAR_BODY_PATH =
  'M 15.2,9 Q 17.8,9.2 17.8,12 Q 17.8,14.8 15.2,15 L 7.8,15 Q 6.2,14.9 6.2,13.8 L 6.2,10.2 Q 6.2,9.1 7.8,9 Z';
const CAR_ROOF = { x: 9.4, y: 9.8, width: 5.6, height: 4.4, rx: 1.3 };
const CAR_WHEEL_HINTS: [number, number][] = [
  [14.2, 9.1],
  [14.2, 14.9],
  [8.6, 9.1],
  [8.6, 14.9],
];
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
  className?: string;
  /** Overrides the wrapper's default height classes. Lets a specific map
   * instance be sized to its own content (e.g. a short local leg needs far
   * less height than a wide continental one) without touching the shared
   * rendering/animation logic — purely a container-size knob, the camera
   * framing itself is still authored per-leg via JourneyCamera.spanDeg. */
  heightClassName?: string;
}

// A short, self-running cinematic moment — not a scroll-controlled
// system. It autoplays once, driven by time (a GSAP tween of progress
// 0..1 over the journey's total authored duration, see
// totalDurationSeconds), triggered the first time the map meaningfully
// enters the viewport (IntersectionObserver, threshold 0.4). There is no
// scroll pinning and no artificial scroll distance: the section is a
// normal, modestly-tall block the visitor can scroll past at any moment,
// mid-animation or not — the animation simply keeps running (or stops
// wherever it was) in the background. It plays once per mount; scrolling
// back to it afterward shows the completed resting frame.
const DEFAULT_HEIGHT_CLASSNAME = 'h-[420px] sm:h-[480px] md:h-[560px]';

export default function JourneyMapScene({
  journey,
  className = '',
  heightClassName = DEFAULT_HEIGHT_CLASSNAME,
}: JourneyMapSceneProps) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const mapBoxRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  // A second, separate <svg> holding only the vehicle — see its JSX
  // below for why the vehicle can't just live in the main svg above.
  const vehicleSvgRef = useRef<SVGSVGElement | null>(null);
  const routeGlowRef = useRef<SVGPathElement | null>(null);
  const routeLineRef = useRef<SVGPathElement | null>(null);
  const vehicleGroupRef = useRef<SVGGElement | null>(null);
  const labelRefs = useRef<(HTMLDivElement | null)[]>([]);
  // Separate from labelRefs: the *dot* sits on labelRefs (transformed to
  // the exact projected coordinate, no offset — see the coordinate-system
  // note on updateLabelScreenPos below). Only this text span gets the
  // readability offset, so a label can be nudged for legibility without
  // ever moving the geographic marker itself.
  const labelTextRefs = useRef<(HTMLSpanElement | null)[]>([]);
  // Persists across effect re-runs (including React StrictMode's dev-only
  // double-invoke) within the same mount, so the journey only ever
  // autoplays once per page visit — re-entering the viewport afterward
  // just leaves the completed resting frame in place.
  const hasPlayedRef = useRef(false);

  const [vehicleMode, setVehicleMode] = useState<JourneyMode>(journey.legs[0]?.mode ?? 'car');
  // Scroll-scrubbed camera pans, route draw-on and vehicle travel are all
  // motion this component adds *on top of* an already-complete, readable
  // map — someone with prefers-reduced-motion gets that same map as a
  // single calm static frame instead: the final leg's camera, the whole
  // route already drawn, the vehicle resting at its destination, no
  // autoplay. This must start `false` (matching the server render, which
  // has no `window`) rather than reading matchMedia in the useState
  // initializer: reading it there makes the client's first render disagree
  // with the server-rendered HTML, and React does not patch up a hydration
  // attribute mismatch. Setting it from an effect after mount instead
  // triggers a normal (non-hydration) re-render, which does apply.
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setReducedMotion(mq.matches);
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const legRanges = useMemo(() => computeLegRanges(journey.legs), [journey]);
  const labelPoints = useMemo(() => findLabelPoints(journey.legs), [journey]);
  const labelWorlds = useMemo(() => labelPoints.map((p) => project(p.coords)), [labelPoints]);
  const playDurationS = useMemo(() => totalDurationSeconds(journey.legs), [journey]);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const mapBox = mapBoxRef.current;
    const svg = svgRef.current;
    if (!wrapper || !mapBox || !svg) return;

    const viewBoxProxy = {
      lng: journey.initialCamera.center[0],
      lat: journey.initialCamera.center[1],
      spanDeg: journey.initialCamera.spanDeg,
    };
    const containerSize = { width: 1200, height: 700 };
    let currentFrame: Frame = computeFrame(viewBoxProxy.spanDeg, containerSize.width / containerSize.height);

    let activeLegIndex = -1;
    let activeMode: JourneyMode = journey.legs[0]?.mode ?? 'car';
    let vehicleWorld: [number, number] = project(
      journey.legs[0]?.from.coords ?? journey.initialCamera.center
    );
    let vehicleAngle = 0;
    const labelRevealed = labelPoints.map(() => false);
    let cameraTween: gsap.core.Tween | null = null;

    const syncViewBoxAttribute = () => {
      const aspect = containerSize.width / containerSize.height;
      currentFrame = computeFrame(viewBoxProxy.spanDeg, aspect);
      const [cx, cy] = project([viewBoxProxy.lng, viewBoxProxy.lat]);
      const vb = `${cx - currentFrame.width / 2} ${cy - currentFrame.height / 2} ${currentFrame.width} ${currentFrame.height}`;
      svg.setAttribute('viewBox', vb);
      // The vehicle-only overlay svg (see its JSX below) shares this exact
      // viewBox so the vehicle keeps landing on the same projected
      // position as the route/markers in the main svg beneath it.
      vehicleSvgRef.current?.setAttribute('viewBox', vb);
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

    // Labels default to sitting right of their point; but a point that
    // lands near the right edge of a narrow (mobile) frame would push its
    // text off-screen, so close to that edge the label flips to grow
    // leftward instead, keeping the dot anchored on the point either way.
    const LABEL_FLIP_MARGIN_PX = 160;

    // ONE REAL LOCATION -> ONE COORDINATE -> ONE PROJECTED POSITION. `world`
    // (labelWorlds[i], from project(point.coords)) is the single source of
    // truth for where this location actually sits on the map — the same
    // project() call the route curve and vehicle position are drawn from.
    // The wrapper below is placed at exactly that screen position with no
    // offset, and the small dot sits centered on the wrapper's own origin
    // (see the label JSX), so the geographic marker itself never moves.
    // Only the adjacent text span — a separate element — gets nudged for
    // readability (and flips side near a narrow frame's edge); a label may
    // never be made to fit by moving the marker.
    const updateLabelScreenPos = () => {
      const vbX = project([viewBoxProxy.lng, viewBoxProxy.lat])[0] - currentFrame.width / 2;
      const vbY = project([viewBoxProxy.lng, viewBoxProxy.lat])[1] - currentFrame.height / 2;
      labelWorlds.forEach((world, i) => {
        const label = labelRefs.current[i];
        if (!label) return;
        // Set opacity explicitly both ways (not just '1' when revealed) so
        // a fresh effect run can't inherit a stale opacity:1 left over
        // from a previous run's now-discarded `labelRevealed` state.
        label.style.opacity = labelRevealed[i] ? '1' : '0';
        // Only position a label once it's actually revealed. An unrevealed
        // label is invisible anyway, but its transform still counts toward
        // the page's scrollable layout size — so a point far from the
        // *current* camera frame (e.g. Home/Vienna once the reduced-motion
        // fallback jumps to the destination's tight final-leg zoom) must
        // not get positioned by that frame's math at all, or the resulting
        // translate() can land tens of thousands of pixels off screen and
        // blow out the page width even while opacity keeps it invisible.
        if (!labelRevealed[i]) return;
        const left = ((world[0] - vbX) / currentFrame.width) * containerSize.width;
        const top = ((world[1] - vbY) / currentFrame.height) * containerSize.height;
        label.style.transform = `translate(${left.toFixed(1)}px, ${top.toFixed(1)}px)`;
        const text = labelTextRefs.current[i];
        if (!text) return;
        // Default placement (unset on every point except where noted below):
        // text grows to the right of the dot, flipping left only close to a
        // narrow frame's edge. 'above' is an opt-in alternative for a point
        // whose incoming route approaches from the side at a shallow angle —
        // see JourneyPoint.labelPlacement's doc comment for the Loro Parque
        // case this exists for. Only a point that explicitly sets it takes
        // this branch; every other point's rendering is unchanged.
        if (labelPoints[i].labelPlacement === 'above') {
          text.style.textAlign = 'center';
          text.style.transform = 'translate(-50%, calc(-100% - 10px))';
        } else {
          const flip = containerSize.width - left < LABEL_FLIP_MARGIN_PX;
          text.style.textAlign = flip ? 'right' : 'left';
          text.style.transform = flip ? 'translate(-14px, -50%) translateX(-100%)' : 'translate(14px, -50%)';
        }
      });
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
        labelPoints.forEach((p, i) => {
          if (!labelRevealed[i] && (leg.from.id === p.id || leg.to.id === p.id)) {
            labelRevealed[i] = true;
          }
        });
      }

      // A leg with a verified real `route` is sampled through
      // routeCurvePoint (optionally coastline-safe, see routeLand); every
      // other leg keeps the original decorative bezierPoint() bow. Both
      // return raw [lng, lat] so the rest of this function — projecting,
      // drawing, positioning the vehicle — doesn't need to know which one
      // it got.
      const legPoint = (i: number, t: number): [number, number] => {
        const l = legRanges[i].leg;
        return l.route
          ? routeCurvePoint(l.route, t, l.routeLand)
          : bezierPoint(l.from.coords, l.to.coords, l.curve ?? 0, t);
      };

      if (leg.showRoute !== false) {
        const coordinates: [number, number][] = [];
        legRanges.forEach((r, i) => {
          if (r.leg.showRoute === false) return;
          if (i < legIndex) {
            for (let s = 0; s <= ROUTE_SAMPLES; s++) {
              coordinates.push(project(legPoint(i, s / ROUTE_SAMPLES)));
            }
          } else if (i === legIndex) {
            const steps = Math.max(1, Math.round(ROUTE_SAMPLES * localProgress));
            for (let s = 0; s <= steps; s++) {
              coordinates.push(project(legPoint(i, s / ROUTE_SAMPLES)));
            }
          }
        });
        // 5 decimal places in this projected (degree-scale) coordinate
        // space is ~1m of real-world precision. 3 was fine when routes
        // were a handful of widely-spaced points, but once a route's real
        // waypoints sit only metres apart (a tight local bend, a small
        // roundabout), rounding to 3 decimals (~111m) snaps consecutive
        // samples onto the same coarse grid line and back, drawing a
        // visible axis-aligned staircase instead of the smooth curve
        // actually being sampled — a quantization artifact, not a
        // geometry problem.
        const d = coordinates.length
          ? coordinates.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0].toFixed(5)},${p[1].toFixed(5)}`).join(' ')
          : '';
        routeGlowRef.current?.setAttribute('d', d);
        routeLineRef.current?.setAttribute('d', d);
      }

      if (leg.showRoute === false) {
        vehicleWorld = project(leg.from.coords);
      } else {
        const point = legPoint(legIndex, localProgress);
        vehicleWorld = project(point);
        if (localProgress < 0.999) {
          // Same tangent-based approach either way: a centered difference a
          // small step behind and ahead of the vehicle, so orientation
          // eases smoothly through a bend instead of snapping — the
          // routeCurveAngleAt path already works this way for a verified
          // real route; this mirrors it for a decorative bezierPoint() bow.
          vehicleAngle = leg.route
            ? routeCurveAngleAt(leg.route, localProgress, leg.routeLand)
            : screenAngle(
                project(legPoint(legIndex, Math.max(0, localProgress - 0.02))),
                project(legPoint(legIndex, Math.min(1, localProgress + 0.02)))
              );
        }
      }

      updateVehicleTransform();
      applyRouteStrokeWidth();
      updateLabelScreenPos();
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

    if (reducedMotion) {
      const lastLeg = legRanges[legRanges.length - 1]?.leg;
      if (lastLeg) {
        viewBoxProxy.lng = lastLeg.camera.center[0];
        viewBoxProxy.lat = lastLeg.camera.center[1];
        viewBoxProxy.spanDeg = lastLeg.camera.spanDeg;
      }
      measure();
      // Reveal every label whose point actually falls inside this final,
      // static frame — not just the last leg's own endpoints. A journey
      // whose last leg is a same-point "hold" (from === to, e.g. a
      // resting zoom) still wants every other point the journey visited
      // (its departure point, say) shown in the finished summary, as
      // long as the final camera is wide enough to actually contain it —
      // which is exactly what makes the completed map read as a static
      // visual summary of the whole journey rather than just its last
      // moment. A point that would fall outside this frame is
      // intentionally left unrevealed so its translate() can't be
      // positioned by a frame it isn't actually inside, which would blow
      // out the page's scrollable width for anyone with reduced motion on.
      if (lastLeg) {
        const [fcx, fcy] = project([viewBoxProxy.lng, viewBoxProxy.lat]);
        const fMinX = fcx - currentFrame.width / 2;
        const fMaxX = fcx + currentFrame.width / 2;
        const fMinY = fcy - currentFrame.height / 2;
        const fMaxY = fcy + currentFrame.height / 2;
        labelWorlds.forEach((world, i) => {
          if (world[0] >= fMinX && world[0] <= fMaxX && world[1] >= fMinY && world[1] <= fMaxY) {
            labelRevealed[i] = true;
          }
        });
      }
      render(1);
      return () => {
        resizeObserver.disconnect();
      };
    }

    // Autoplay: a plain 0..1 tween over the journey's authored duration
    // (playDurationS), driving the exact same render(progress) the old
    // scroll-scrubbed system used — so every bit of the verified
    // marker/route/vehicle alignment, route-reveal-as-it-travels and
    // tangent-based orientation logic above is reused untouched; only
    // *what drives progress* has changed, from scroll position to time.
    let playTween: gsap.core.Tween | null = null;
    const startAutoplay = () => {
      if (hasPlayedRef.current) return;
      hasPlayedRef.current = true;
      const proxy = { p: 0 };
      playTween = gsap.to(proxy, {
        p: 1,
        duration: playDurationS,
        ease: 'none',
        onUpdate: () => render(proxy.p),
      });
    };

    // Fires once the map has "meaningfully" entered the viewport (40%
    // visible) — not the instant a single pixel crosses the edge. No
    // scroll locking, no pinning: this observer only ever starts a
    // timeline: the page keeps scrolling completely normally underneath
    // it, in either direction, at any moment.
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
      playTween?.kill();
      cameraTween?.kill();
      resizeObserver.disconnect();
    };
  }, [journey, legRanges, labelPoints, labelWorlds, playDurationS, reducedMotion]);

  return (
    <div
      ref={wrapperRef}
      className={`relative w-full overflow-hidden ${heightClassName} bg-[#f6f1e6] dark:bg-[#161310] ${className}`}
    >
      <div ref={mapBoxRef} className='absolute inset-0'>
        <svg
          ref={svgRef}
          className='absolute inset-0 w-full h-full'
          preserveAspectRatio='xMidYMid slice'
        >
          <rect x={-500} y={-300} width={1000} height={600} fill={MUTED_BACKGROUND} />
          {/* Real coastline/border data, baked at build time from OpenStreetMap
              land geometry (see scripts/build-geo.mjs) — layered coarse-to-fine
              so the same shapes read at both the pulled-back Europe view and
              the close-up stages, editorial-atlas style: warm, flat, almost no
              stroke. */}
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
          {CANARY_PATHS.map((d, i) => (
            <path
              key={`canary-${i}`}
              d={d}
              fill={MUTED_LAND}
              stroke={MUTED_LINE}
              strokeWidth={1}
              vectorEffect='non-scaling-stroke'
              opacity={0.85}
            />
          ))}
          {/* Optional, opt-in supplemental land shapes for this journey only
              — see the Journey.extraLandPatches doc comment in
              lib/journeys/types.ts. Unset (undefined) for every journey but
              the one that needs it, so this renders nothing extra anywhere
              else. Fill only, no stroke: the patch's own closing edge
              deliberately retraces the existing coastline vertices it
              extends from, so stroking it too would double-draw a line
              CANARY_PATHS above already drew. */}
          {journey.extraLandPatches?.map((d, i) => (
            <path key={`land-patch-${i}`} d={d} fill={MUTED_LAND} opacity={0.85} />
          ))}
          {/* The new coastline edge each patch above actually adds —
              stroked, unfilled, drawn once so it reads as part of the same
              coastline rather than a seam. */}
          {journey.extraCoastlineStrokes?.map((d, i) => (
            <path
              key={`coastline-stroke-${i}`}
              d={d}
              fill='none'
              stroke={MUTED_LINE}
              strokeWidth={1}
              strokeLinejoin='round'
              vectorEffect='non-scaling-stroke'
              opacity={0.85}
            />
          ))}

          <path ref={routeGlowRef} d='' fill='none' stroke={ROUTE_PINK} strokeLinecap='round' strokeLinejoin='round' opacity={0.14} />
          <path ref={routeLineRef} d='' fill='none' stroke={ROUTE_PINK} strokeLinecap='round' strokeLinejoin='round' opacity={0.92} />
        </svg>

        {labelPoints.map((p, i) => (
          <div
            key={p.id}
            ref={(el) => {
              labelRefs.current[i] = el;
            }}
            className='absolute left-0 top-0 pointer-events-none opacity-0 transition-opacity duration-700 ease-out'
          >
            {/* The marker: centered exactly on the wrapper's own origin,
                i.e. exactly on the projected coordinate — never offset. */}
            <span className='absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2 block w-2 h-2 rounded-full bg-[#e8639f] ring-2 ring-[#f6f1e6]' />
            {/* The text: a separate element updateLabelScreenPos nudges
                aside for legibility (and flips near a narrow frame's
                edge) — moving this never moves the dot above. */}
            <span
              ref={(el) => {
                labelTextRefs.current[i] = el;
              }}
              className='absolute left-0 top-0 flex flex-col leading-tight whitespace-nowrap font-[family-name:var(--font-poppins)]'
            >
              <span className='text-[0.65rem] uppercase tracking-[0.16em] font-semibold text-black/70'>
                {p.name}
              </span>
              {p.sublabel && <span className='text-[0.6rem] text-black/45'>{p.sublabel}</span>}
            </span>
          </div>
        ))}

        {/* The vehicle lives in its own overlay svg, stacked after (so on
            top of) the label markers above — a separate element rather
            than a z-index on the main svg, because that main svg also
            carries the map's opaque background/land fills: raising the
            whole thing would bury the labels behind them instead of just
            lifting the vehicle above a marker dot. This one shares the
            main svg's exact viewBox (kept in sync in syncViewBoxAttribute
            above) so the vehicle still lands on the same projected
            position, and is otherwise fully transparent/click-through. */}
        <svg
          ref={vehicleSvgRef}
          className='absolute inset-0 w-full h-full pointer-events-none'
          preserveAspectRatio='xMidYMid slice'
        >
          <g ref={vehicleGroupRef}>
            {vehicleMode === 'plane' ? (
              <path d={PLANE_PATH} fill={VEHICLE_STROKE} stroke='none' />
            ) : vehicleMode === 'transfer' || vehicleMode === 'train' ? (
              <>
                {TRANSFER_PATHS.map((d, i) => (
                  <path
                    key={i}
                    d={d}
                    fill='none'
                    stroke={VEHICLE_STROKE}
                    strokeWidth={1.3}
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    vectorEffect='non-scaling-stroke'
                  />
                ))}
                {TRANSFER_WHEELS.map(([cx, cy], i) => (
                  <circle key={i} cx={cx} cy={cy} r={1.2} fill='none' stroke={VEHICLE_STROKE} strokeWidth={1.3} vectorEffect='non-scaling-stroke' />
                ))}
              </>
            ) : (
              <>
                <path d={CAR_BODY_PATH} fill={VEHICLE_STROKE} stroke='none' />
                <rect
                  x={CAR_ROOF.x}
                  y={CAR_ROOF.y}
                  width={CAR_ROOF.width}
                  height={CAR_ROOF.height}
                  rx={CAR_ROOF.rx}
                  fill={MUTED_BACKGROUND}
                />
                {CAR_WHEEL_HINTS.map(([cx, cy], i) => (
                  <ellipse key={i} cx={cx} cy={cy} rx={0.6} ry={0.32} fill={MUTED_BACKGROUND} />
                ))}
              </>
            )}
          </g>
        </svg>
      </div>
    </div>
  );
}
