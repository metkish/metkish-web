'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import type { Journey, JourneyLeg, JourneyMode, JourneyPoint } from '@/lib/journeys/types';
import {
  bezierPoint,
  project,
  projectSpan,
  screenAngle,
  routeCurvePoint,
  routeCurveAngleAt,
  resampleByArcLength,
  ROUTE_SAMPLES,
} from './geo';
import { AUSTRIA_PATHS, CANARY_PATHS, NEIGHBOUR_PATHS, SARDINIA_PATHS, SLOVENIA_PATHS, WIDE_EUROPE_PATHS } from './generated/geography';

// Per-destination fine-detail coastline, keyed by the new `region` prop
// below. Both arrays stay statically imported here exactly as before
// (this file is already a shared dependency of every destination page,
// so that import cost is unavoidable and unchanged) -- what changes is
// that a page whose own destination doesn't need a given region's
// close-up coastline no longer renders it as live SVG <path> elements at
// all. See the `region` prop doc comment for why this existed
// unconditionally before and why that was a real (not just theoretical)
// per-page DOM cost.
const REGION_FINE_DETAIL_PATHS: Record<'canary' | 'sardinia', string[]> = {
  canary: CANARY_PATHS,
  sardinia: SARDINIA_PATHS,
};

// A hand-drawn, editorial-atlas palette — the same warm neutrals used
// across the rest of the site, kept deliberately muted so the map reads as
// illustration rather than a navigation tool.
const MUTED_BACKGROUND = '#f6f1e6';
const MUTED_LAND = '#efe8d8';
const MUTED_LINE = '#ddd0b8';
const ROUTE_PINK = '#e8639f';
const VEHICLE_STROKE = '#7a3348';

// ROUTE_SAMPLES (sample count per leg for the drawn route polyline) now
// lives in ./geo, shared with scripts/generate-route-cache.ts so the
// build-time cache and this component always sample at the identical
// resolution — see the comment on it there.

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
// BUS_BODY_PATH -- a clean, minimal, boxy top-down bus silhouette,
// replacing an earlier thin stroked outline that read as an odd, hard-to-
// recognise shape at small sizes (its outline was built from open stroke
// paths, not a filled silhouette, so it didn't match the solid-silhouette
// language every other vehicle icon on the site uses). Same authoring
// convention as CAR_BODY_PATH/TRAIN_BODY_PATH: a 24x24 local box, nose-
// first along +x so rotate(vehicleAngle) always faces the real direction
// of travel with no extra offset. Proportioned boxier and taller than
// CAR_BODY_PATH (a bus's straight, squared-off sides, not a car's rounder
// corners) but shorter than TRAIN_BODY_PATH (a bus is not as long/flat as
// a train) -- scaled to sit in the same size range as the car icon so it
// reads as clearly visible without dominating the map. BUS_WINDOW is a
// single cutout band near the top of the body (same mask technique as
// CAR_ROOF/TRAIN_WINDOWS -- a real hole revealing whatever is actually
// underneath, not a flat patch that would mismatch the pink route/marker
// it rides over), left a touch short of the front nose so that margin
// reads as the windshield without adding a separate decorative line.
// BUS_WHEEL_HINTS are two cutout ellipses along the bottom edge, same
// size/style as CAR_WHEEL_HINTS -- visible wheels are what keeps a boxy
// top-down silhouette reading as "bus" rather than "train" (the train
// icon deliberately has none). No other decoration added, per explicit
// direction to keep the icon minimal.
const BUS_BODY_PATH =
  'M 6,8.8 Q 4.3,9 4.3,12 Q 4.3,15 6,15.2 L 18,15.2 Q 19.7,15 19.7,12 Q 19.7,9 18,8.8 Z';
const BUS_WINDOW = { x: 5.6, y: 9.6, width: 11.4, height: 2, rx: 0.6 };
const BUS_WHEEL_HINTS: [number, number][] = [
  [8, 15.2],
  [16, 15.2],
];

// TRAIN_BODY_PATH — a real train icon (added for the Rome page's
// Trieste Airport -> Venezia Mestre -> Roma Termini leg), distinct from
// both CAR_BODY_PATH (a passenger car) and the BUS_BODY_PATH
// shuttle/bus icon 'train' mode previously borrowed. Same top-down,
// solid-silhouette language and the same nose-first-along-+x authoring
// convention as PLANE_PATH/CAR_BODY_PATH (rotate(vehicleAngle) then
// always faces the real direction of travel). A long, low, gently
// rounded body with a blunt (not pointed) nose on the right, reading as
// a modern high-speed train rather than a bus/car — visibly longer and
// flatter than the car body, with no wheel hints (a top-down train
// doesn't show wheels). TRAIN_WINDOWS is a single thin cutout strip
// running most of the body's length, same cutout-via-mask technique as
// CAR_ROOF, standing in for the carriage's window band.
const TRAIN_BODY_PATH =
  'M 18.4,10.2 Q 20.3,10.5 20.3,12 Q 20.3,13.5 18.4,13.8 L 4.6,13.8 Q 3.6,13.7 3.6,12 Q 3.6,10.3 4.6,10.2 Z';
const TRAIN_WINDOWS = { x: 5.2, y: 10.6, width: 13.6, height: 1.3, rx: 0.5 };

// BOAT_BODY_PATH -- a small top-down tour-boat hull (added for the
// Sardinia page's La Maddalena Archipelago boat excursion, Palau ->
// Cala Santa Maria -> La Maddalena town -> Palau). Same authoring
// convention as every other vehicle icon here: a 24x24 local box,
// nose-first along +x so rotate(vehicleAngle) always faces the real
// direction of travel with no extra offset. A simple pointed-bow,
// flat-stern hull silhouette -- immediately reads as "boat" at small
// sizes, distinct from the car/bus/train bodies' straight, boxy sides.
// BOAT_CABIN is a single cutout near the stern (same mask technique as
// CAR_ROOF/TRAIN_WINDOWS/BUS_WINDOW), standing in for a small
// wheelhouse/cabin; no wheel hints, since a boat has none.
const BOAT_BODY_PATH =
  'M 21,12 Q 19.3,9.2 14,9 L 7.5,9 Q 5.2,9.2 5.2,12 Q 5.2,14.8 7.5,15 L 14,15 Q 19.3,14.8 21,12 Z';
const BOAT_CABIN = { x: 8.6, y: 10, width: 4.6, height: 4, rx: 1 };

export interface JourneyMapSceneProps {
  journey: Journey;
  className?: string;
  /** Overrides the wrapper's default height classes. Lets a specific map
   * instance be sized to its own content (e.g. a short local leg needs far
   * less height than a wide continental one) without touching the shared
   * rendering/animation logic — purely a container-size knob, the camera
   * framing itself is still authored per-leg via JourneyCamera.spanDeg. */
  heightClassName?: string;
  /** Whether Austria renders with the same precise, stroked FOCUS
   * treatment as Slovenia (true, the default -- preserves every existing
   * map's look) or falls back to the plain NEIGHBOUR_PATHS fill, with no
   * stroke, identical to every other background country (false). Slovenia
   * itself is never affected by this prop and always renders FOCUS-style,
   * since home is in Slovenia on every trip. Set this to false only for a
   * destination whose own journey genuinely never flies out via
   * Vienna/Graz -- Austria has no business being visually distinguished
   * from its neighbours on a map that has nothing to do with it. */
  austriaEmphasis?: boolean;
  /** URL of this destination's build-time-precomputed route-geometry
   * JSON (see scripts/generate-route-cache.ts), e.g. "/route-cache/tenerife".
   * A leg with `routeLand` land-safety checking can take hundreds of
   * milliseconds to sample live in a visitor's browser; this lets
   * JourneyMapScene fetch the already-computed result instead (once per
   * destination per page load, shared across every JourneyMapScene
   * instance on that page -- see routeCacheFetchCache below), so building
   * that leg's cache becomes a plain lookup. Deliberately a URL fetched at
   * runtime rather than data imported directly: every destination page is
   * a Client Component, so importing the precomputed array directly would
   * bake it into THAT PAGE'S OWN JS bundle, which Next's <Link> then
   * prefetches as soon as a link to it scrolls into view anywhere on the
   * site (e.g. the home page's travel gallery) -- silently downloading
   * megabytes of route geometry nobody asked for yet. A plain fetch()
   * here is invisible to Link prefetch and only ever happens on this
   * destination's own page. Optional, and purely an optimization: a
   * missing/failed fetch (or a leg not present in the response) falls
   * back to computing that leg live exactly as before. */
  routeCacheUrl?: string;
  /** Which destination's close-up, fine-detail coastline (bays, headlands
   * -- the real local shapes WIDE_EUROPE_PATHS' continental-scale
   * simplification can't provide) this map renders, in addition to the
   * always-on background layers (wide Europe, neighbours, Slovenia,
   * Austria). Previously CANARY_PATHS and SARDINIA_PATHS both rendered
   * unconditionally on every single JourneyMapScene instance on every
   * destination page, regardless of whether that destination's maps ever
   * showed that region -- e.g. Sardinia's 82-path, 73KB coastline was
   * being rendered on all 10 of Tenerife's map instances, 820 entirely
   * invisible <path> elements that still had to be mounted and later
   * torn down. Leave unset for a destination whose maps never zoom into
   * either region (Italy, Barcelona, Rome, Iceland) -- nothing extra
   * renders. Set to 'canary' (Tenerife) or 'sardinia' (Sardinia) to get
   * exactly the same close-up coastline those maps always had, just no
   * longer paid for by every other destination's pages too. */
  region?: 'canary' | 'sardinia';
}

// Fetches and caches a destination's precomputed route-geometry JSON,
// keyed by its URL, so multiple <JourneyMapScene> instances for the same
// destination on one page (every page here renders several) share a
// single network request instead of each fetching it independently.
// Module-level (not per-component-instance) so the cache survives
// remounts within the same page session. Never throws: a network error
// or malformed response resolves to null, which buildLegCache below
// treats exactly like "not precomputed" and falls back to live
// computation for that leg -- the fetch is purely an optimization, never
// a correctness dependency.
const routeCacheFetchCache = new Map<
  string,
  Promise<Record<string, [number, number][]> | null>
>();
function fetchRouteCache(url: string): Promise<Record<string, [number, number][]> | null> {
  let pending = routeCacheFetchCache.get(url);
  if (!pending) {
    pending = fetch(url)
      .then((res) => (res.ok ? (res.json() as Promise<Record<string, [number, number][]>>) : null))
      .catch(() => null);
    routeCacheFetchCache.set(url, pending);
  }
  return pending;
}

// A short, self-running cinematic moment — not a scroll-controlled
// system. It autoplays once, driven by time (a GSAP tween of progress
// 0..1 over the journey's total authored duration, see
// totalDurationSeconds), triggered the first time the map meaningfully
// enters the viewport (IntersectionObserver, threshold 0.4). There is no
// scroll pinning and no artificial scroll distance: the section is a
// normal, modestly-tall block the visitor can scroll past at any moment,
// mid-animation or not. Unlike an earlier version of this component, the
// animation does NOT keep running while scrolled off-screen: the same
// IntersectionObserver pauses the driving tween the moment the map leaves
// the viewport and resumes it on return, so an offscreen map costs
// nothing. It plays once per mount; scrolling back to it afterward shows
// either the completed resting frame or wherever the animation was
// paused.
const DEFAULT_HEIGHT_CLASSNAME = 'h-[420px] sm:h-[480px] md:h-[560px]';

export default function JourneyMapScene({
  journey,
  className = '',
  heightClassName = DEFAULT_HEIGHT_CLASSNAME,
  austriaEmphasis = true,
  routeCacheUrl,
  region,
}: JourneyMapSceneProps) {
  // Unique per mount (this page puts several JourneyMapScene instances on
  // one page) so each instance's <mask> id below can't collide with
  // another's — an id collision would leave a later map's car referencing
  // the wrong (or a since-unmounted) mask.
  const carMaskId = useId();
  const trainMaskId = useId();
  const busMaskId = useId();
  const boatMaskId = useId();
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const mapBoxRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  // A second, separate <svg> holding only the vehicle — see its JSX
  // below for why the vehicle can't just live in the main svg above.
  const vehicleSvgRef = useRef<SVGSVGElement | null>(null);
  const routeGlowRef = useRef<SVGPathElement | null>(null);
  const routeLineRef = useRef<SVGPathElement | null>(null);
  // The active leg's own in-progress reveal is written to a SEPARATE pair
  // of path elements every frame (see the render() block that fills them,
  // and the comment above LegGeometryCache) so only the still-growing
  // tail of the route is rewritten per frame -- not the full history of
  // every already-completed leg. routeGlowRef/routeLineRef above instead
  // hold that completed-so-far history and are only rewritten once per
  // leg transition.
  const activeRouteGlowRef = useRef<SVGPathElement | null>(null);
  const activeRouteLineRef = useRef<SVGPathElement | null>(null);
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

  // Starts the (deduped, see fetchRouteCache) fetch as soon as this scene
  // mounts -- well before autoplay can actually start, since that still
  // waits for the IntersectionObserver below plus, usually, the visitor
  // scrolling this far down the page -- so the main render effect's
  // buildLegCache almost always finds routeCacheDataRef.current already
  // populated by the time it's needed.
  //
  // routeCacheReadyRef below exists for the case where it ISN'T yet --
  // a slower mobile connection, or a visitor who scrolls fast enough to
  // reach a routeLand leg before its destination's cache JSON has
  // finished downloading. Autoplay (see startAutoplayWhenReady further
  // down) waits on this flag instead of starting blind: without it,
  // render()'s first call to ensureLegCached for that leg would fall
  // back to computing it live -- up to several hundred milliseconds of
  // synchronous main-thread work for a routeLand leg -- in the middle of
  // an already-running GSAP tick, which is what the stutter/vehicle-
  // disappearing reports traced back to. Bounded by routeCacheReadyTimeoutMs
  // so a genuinely failed fetch doesn't block the map forever; past that
  // bound buildLegCache's live-fallback still runs exactly as before,
  // just no longer in the common case.
  const routeCacheDataRef = useRef<Record<string, [number, number][]> | null>(null);
  const routeCacheReadyRef = useRef(!routeCacheUrl);
  useEffect(() => {
    if (!routeCacheUrl) return;
    let cancelled = false;
    const routeCacheReadyTimeoutMs = 5000;
    const timeoutId = window.setTimeout(() => {
      routeCacheReadyRef.current = true;
    }, routeCacheReadyTimeoutMs);
    fetchRouteCache(routeCacheUrl).then((data) => {
      if (cancelled) return;
      if (data) routeCacheDataRef.current = data;
      routeCacheReadyRef.current = true;
      window.clearTimeout(timeoutId);
    });
    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [routeCacheUrl]);

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

    // --- Precomputed route geometry cache ------------------------------
    // The old render() rebuilt the ENTIRE drawn-so-far route polyline
    // (every completed leg at full ROUTE_SAMPLES resolution, plus the
    // active leg's growing partial sample) from scratch on every single
    // animation frame, via up to thousands of routeCurvePoint() calls
    // (each doing coastline-distance/intersection work) and a full SVG `d`
    // string rebuild -- repeated ~60x/second for the whole tween. That's
    // an O(samples-so-far) cost PER FRAME, growing throughout the
    // animation.
    //
    // Below, each leg's full-resolution point array is computed ONCE --
    // lazily, the first time that leg becomes relevant -- and cached.
    // render() still grows the drawn route's `d` attribute(s) as the
    // route is "drawn as it travels" (so it needs no stroke-dasharray/
    // dashoffset support at all -- the undrawn remainder of the route
    // simply isn't in the path yet, which is universally reliable across
    // every SVG engine, mobile included), but that per-frame work is now
    // just reading already-computed points out of the cache and
    // formatting them into a string -- no trigonometry, no
    // coastline-safety checks, no routeCurvePoint calls. This produces
    // mathematically identical output to the old per-frame rebuild (same
    // legPoint() calls, same ROUTE_SAMPLES grid, same 5-decimal
    // precision) -- it is purely a *when the expensive part is computed*
    // change, not a *what's computed* change.
    //
    // The revealed route is actually TWO separate path elements (see
    // routeGlowRef/routeLineRef vs activeRouteGlowRef/activeRouteLineRef
    // in the JSX below), not one:
    //   - routeGlowRef/routeLineRef hold every leg that's already fully
    //     finished, folded in once per leg transition by
    //     foldCompletedLegsUpTo -- a multi-leg journey never re-walks or
    //     re-writes legs it has already finished drawing.
    //   - activeRouteGlowRef/activeRouteLineRef hold only the CURRENTLY
    //     active leg's own in-progress reveal, grown incrementally: each
    //     frame appends only the handful of points newly passed since the
    //     previous frame, rather than re-slicing and rewriting that leg's
    //     entire points-so-far every frame.
    // The two elements are visually indistinguishable (same color/width,
    // and the active path's first point is always the past path's exact
    // last point) but splitting them keeps the common per-frame cost down
    // to a few dozen characters instead of however many thousands the
    // route has grown to so far. An earlier version wrote one
    // accumulated `d` for the whole route every frame; on real mobile
    // hardware that full-string rewrite (twice a frame, for glow and
    // line) was heavy enough to occasionally stall the main thread long
    // enough to visibly skip a frame of the vehicle icon's own mask
    // compositing, i.e. the vehicle appearing to flicker/disappear for an
    // instant -- this split removes that cost from the common frame
    // entirely.
    //
    // (An earlier version still before that revealed the route via
    // stroke-dasharray/stroke-dashoffset instead of growing `d` directly,
    // to avoid touching `d` every frame. That is a well-supported SVG
    // feature, but it turned out not to render reliably on every mobile
    // engine actually in use -- confirmed by a live report of the route
    // showing fully drawn immediately with the vehicle then animating
    // along an already-finished line, i.e. dashoffset having no visible
    // effect. Slicing the precomputed points array into `d` directly
    // sidesteps that risk entirely.)
    interface LegGeometryCache {
      points: [number, number][]; // projected points, index 0..ROUTE_SAMPLES
    }
    const legCaches: (LegGeometryCache | null)[] = legRanges.map(() => null);
    let highestCachedLegIndex = -1;

    const buildLegCache = (
      i: number,
      legPointFn: (i: number, t: number) => [number, number]
    ): LegGeometryCache => {
      // A leg whose routeLand land-safety checking makes it expensive
      // (see scripts/generate-route-cache.ts) was precomputed at build
      // time and is fetched (see routeCacheDataRef above) from this
      // destination's route-cache JSON -- use it directly, with zero
      // sampling work, when it's present and the right shape. Anything
      // missing (fetch not finished yet, not regenerated, or genuinely
      // absent) falls back to the exact same live computation this
      // always did.
      const leg = legRanges[i].leg;
      const precomputed = routeCacheDataRef.current?.[`${journey.id}::${leg.id}`];
      if (precomputed && precomputed.length === ROUTE_SAMPLES + 1) {
        return { points: precomputed };
      }
      const rawPoints: [number, number][] = new Array(ROUTE_SAMPLES + 1);
      for (let s = 0; s <= ROUTE_SAMPLES; s++) {
        rawPoints[s] = project(legPointFn(i, s / ROUTE_SAMPLES));
      }
      return { points: resampleByArcLength(rawPoints) };
    };

    // Pure computation, no DOM writes whatsoever -- safe to call well
    // before the animation starts (see the idle pre-warm below) with
    // zero risk of ever leaving the route's `d` attribute in an
    // inconsistent or prematurely-revealed state. Legs only ever become
    // relevant in increasing index order over a single tween's lifetime,
    // so once a leg is cached it never needs rebuilding.
    const ensureLegCached = (i: number, legPointFn: (i: number, t: number) => [number, number]) => {
      for (let j = highestCachedLegIndex + 1; j <= i; j++) {
        const leg = legRanges[j].leg;
        if (leg.showRoute !== false) legCaches[j] = buildLegCache(j, legPointFn);
      }
      if (i > highestCachedLegIndex) highestCachedLegIndex = i;
    };

    // The `d` for every leg strictly BEFORE the currently active one,
    // folded in once -- the first time render() moves past that leg --
    // by reading its already-cached points (no recomputation). render()
    // appends the active leg's own partial contribution to this every
    // frame, but only up to its current progress, so the undrawn
    // remainder of the route never exists in the path data at all.
    let completedPrefixD = '';
    let completedThroughLegIndex = -1;

    // Returns true only on the (rare) frame where a leg actually just got
    // folded in, so the caller only has to rewrite the completed-legs
    // path element on that frame -- never on every frame, which is the
    // whole point of keeping this separate from the active leg's own
    // path element below.
    const foldCompletedLegsUpTo = (legIndex: number): boolean => {
      let changed = false;
      for (let j = completedThroughLegIndex + 1; j < legIndex; j++) {
        const leg = legRanges[j].leg;
        if (leg.showRoute === false) continue;
        const cache = legCaches[j];
        if (!cache) continue;
        const isFirstEver = completedPrefixD === '';
        const segment = cache.points
          .map((p, s) => `${isFirstEver && s === 0 ? 'M' : 'L'} ${p[0].toFixed(5)},${p[1].toFixed(5)}`)
          .join(' ');
        completedPrefixD = completedPrefixD === '' ? segment : `${completedPrefixD} ${segment}`;
        changed = true;
      }
      if (legIndex - 1 > completedThroughLegIndex) completedThroughLegIndex = legIndex - 1;
      return changed;
    };

    // The active leg's own incrementally-grown partial `d`, kept separate
    // from completedPrefixD above so a frame only ever appends the few
    // points newly revealed since the previous frame -- not the whole
    // route so far. Reset whenever the active leg changes.
    let activeRouteLegIndex = -1;
    let activeRoutePartialD = '';
    let activeRouteDrawnSteps = -1;

    // requestIdleCallback (Safari fallback: setTimeout) so the first
    // leg's cache can be built during browser idle time, after initial
    // paint -- not blocking it -- rather than only at the moment autoplay
    // actually starts. For the common below-the-fold case this means the
    // one-time precompute cost is very likely already paid by the time the
    // visitor scrolls the map into view, so there's no synchronous hitch
    // even at trigger time.
    let idleHandle: number | null = null;
    let idleIsTimeout = false;
    const scheduleIdle = (cb: () => void): void => {
      const w = window as unknown as {
        requestIdleCallback?: (cb: () => void, opts?: { timeout?: number }) => number;
      };
      if (typeof w.requestIdleCallback === 'function') {
        idleHandle = w.requestIdleCallback(cb, { timeout: 2000 });
      } else {
        idleIsTimeout = true;
        idleHandle = window.setTimeout(cb, 200);
      }
    };
    const cancelIdle = () => {
      if (idleHandle === null) return;
      const w = window as unknown as { cancelIdleCallback?: (handle: number) => void };
      if (idleIsTimeout) window.clearTimeout(idleHandle);
      else if (typeof w.cancelIdleCallback === 'function') w.cancelIdleCallback(idleHandle);
      idleHandle = null;
    };

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
      const lineWidth = String((linePx * currentFrame.width) / containerSize.width);
      const glowWidth = String((glowPx * currentFrame.width) / containerSize.width);
      routeLineRef.current?.setAttribute('stroke-width', lineWidth);
      routeGlowRef.current?.setAttribute('stroke-width', glowWidth);
      activeRouteLineRef.current?.setAttribute('stroke-width', lineWidth);
      activeRouteGlowRef.current?.setAttribute('stroke-width', glowWidth);
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
        // narrow frame's edge. 'above'/'below'/'left' are opt-in
        // alternatives for a point whose incoming route approaches from the
        // side at a shallow angle, or (added for Iceland's full-island
        // road-trip maps) whose real-world neighbour lands only a handful
        // of screen pixels away at that much wider zoom — see
        // JourneyPoint.labelPlacement's doc comment. Only a point that
        // explicitly sets one of these takes that branch; every other
        // point's rendering (including the existing 'above' case) is
        // unchanged.
        const placement = labelPoints[i].labelPlacement;
        if (placement === 'above') {
          text.style.textAlign = 'center';
          text.style.transform = 'translate(-50%, calc(-100% - 10px))';
        } else if (placement === 'below') {
          text.style.textAlign = 'center';
          text.style.transform = 'translate(-50%, 10px)';
        } else if (placement === 'left') {
          text.style.textAlign = 'right';
          text.style.transform = 'translate(-14px, -50%) translateX(-100%)';
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
      // return raw [lng, lat]. Only ever called from buildLegCache now --
      // once per leg, not once per frame (see the route-geometry-cache
      // block above).
      const legPoint = (i: number, t: number): [number, number] => {
        const l = legRanges[i].leg;
        return l.route
          ? routeCurvePoint(l.route, t, l.routeLand)
          : bezierPoint(l.from.coords, l.to.coords, l.curve ?? 0, t);
      };

      ensureLegCached(legIndex, legPoint);

      // Only the (rare) frame where a leg actually just finished rewrites
      // the completed-legs path element -- every other frame this is a
      // no-op, so the cost of carrying a long multi-leg history around
      // never shows up in the common per-frame cost at all.
      if (foldCompletedLegsUpTo(legIndex)) {
        if (routeGlowRef.current) routeGlowRef.current.setAttribute('d', completedPrefixD);
        if (routeLineRef.current) routeLineRef.current.setAttribute('d', completedPrefixD);
      }

      // The active leg's own reveal lives in a SEPARATE path element,
      // grown incrementally: each frame appends only the points newly
      // passed since the previous frame (almost always a handful, since
      // ROUTE_SAMPLES=2000 resolves far finer than one frame's worth of
      // progress) instead of re-slicing and rewriting the whole leg's
      // points-so-far every frame. There is still no
      // stroke-dasharray/stroke-dashoffset involved -- the undrawn
      // remainder of the route simply isn't present in the path data at
      // all yet, which every SVG engine draws correctly, including real
      // mobile browsers (see the comment above LegGeometryCache for why
      // both this and dash-based reveal were tried and rejected).
      if (leg.showRoute === false) {
        activeRouteLegIndex = -1;
        activeRoutePartialD = '';
        activeRouteDrawnSteps = -1;
        if (activeRouteGlowRef.current) activeRouteGlowRef.current.setAttribute('d', '');
        if (activeRouteLineRef.current) activeRouteLineRef.current.setAttribute('d', '');
      } else {
        if (legIndex !== activeRouteLegIndex) {
          activeRouteLegIndex = legIndex;
          activeRoutePartialD = '';
          activeRouteDrawnSteps = -1;
        }
        const cache = legCaches[legIndex];
        if (cache) {
          const stepsF = ROUTE_SAMPLES * localProgress;
          const steps = Math.min(ROUTE_SAMPLES, Math.max(1, Math.round(stepsF)));
          if (steps > activeRouteDrawnSteps) {
            const newPoints = cache.points
              .slice(activeRouteDrawnSteps + 1, steps + 1)
              .map((p, s) => {
                const isVeryFirstPoint = activeRouteDrawnSteps === -1 && s === 0;
                return `${isVeryFirstPoint ? 'M' : 'L'} ${p[0].toFixed(5)},${p[1].toFixed(5)}`;
              })
              .join(' ');
            activeRoutePartialD = activeRoutePartialD === '' ? newPoints : `${activeRoutePartialD} ${newPoints}`;
            activeRouteDrawnSteps = steps;
            if (activeRouteGlowRef.current) activeRouteGlowRef.current.setAttribute('d', activeRoutePartialD);
            if (activeRouteLineRef.current) activeRouteLineRef.current.setAttribute('d', activeRoutePartialD);
          } else if (steps < activeRouteDrawnSteps) {
            // Defensive only -- progress is expected to be monotonic
            // within a leg, but if it ever isn't, rebuild the partial
            // path from the cache rather than leaving stale points drawn
            // past the vehicle.
            const rebuilt = cache.points
              .slice(0, steps + 1)
              .map((p, s) => `${s === 0 ? 'M' : 'L'} ${p[0].toFixed(5)},${p[1].toFixed(5)}`)
              .join(' ');
            activeRoutePartialD = rebuilt;
            activeRouteDrawnSteps = steps;
            if (activeRouteGlowRef.current) activeRouteGlowRef.current.setAttribute('d', activeRoutePartialD);
            if (activeRouteLineRef.current) activeRouteLineRef.current.setAttribute('d', activeRoutePartialD);
          }
        }
      }

      if (leg.showRoute === false) {
        vehicleWorld = project(leg.from.coords);
      } else {
        const cache = legCaches[legIndex];
        if (cache) {
          // Vehicle position: linear interpolation between the two cached
          // samples bracketing the exact (continuous) localProgress -- not
          // a routeCurvePoint() call. At ROUTE_SAMPLES=2000 resolution the
          // gap between a true curve point and the chord joining its two
          // neighbouring cached samples is negligible (well under a pixel
          // on screen), and it's no less precise than the rendered route
          // line itself, which is built from these same samples.
          const stepsF = ROUTE_SAMPLES * localProgress;
          const s0 = Math.max(0, Math.min(ROUTE_SAMPLES - 1, Math.floor(stepsF)));
          const s1 = Math.min(ROUTE_SAMPLES, s0 + 1);
          const frac = Math.min(1, Math.max(0, stepsF - s0));
          const p0 = cache.points[s0];
          const p1 = cache.points[s1];
          vehicleWorld = [p0[0] + (p1[0] - p0[0]) * frac, p0[1] + (p1[1] - p0[1]) * frac];
          if (localProgress < 0.999) {
            // Same centered-difference tangent as before, but reading two
            // cached points instead of calling routeCurveAngleAt/
            // screenAngle with fresh routeCurvePoint evaluations.
            // eps=0.015 in the original t-space is exactly 30 samples at
            // ROUTE_SAMPLES=2000 (0.015 * 2000 = 30), so this is the same
            // tangent, not an approximation of it.
            const EPS_STEPS = 30;
            const sa = Math.max(0, Math.min(ROUTE_SAMPLES, Math.round(stepsF - EPS_STEPS)));
            const sb = Math.max(0, Math.min(ROUTE_SAMPLES, Math.round(stepsF + EPS_STEPS)));
            vehicleAngle = screenAngle(cache.points[sa], cache.points[sb]);
          }
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

    // Warm the first leg's route-geometry cache during browser idle time,
    // after initial paint -- not as part of it -- so the common
    // below-the-fold case has no synchronous hitch even at the moment
    // autoplay's IntersectionObserver fires. This performs NO DOM writes
    // at all (see ensureLegCached above) -- it only computes and caches
    // point arrays, so there is zero risk of it ever leaving the route's
    // `d` attribute in a prematurely-revealed or inconsistent state.
    if (!reducedMotion && legRanges.length > 0) {
      scheduleIdle(() => {
        const legPoint0 = (i: number, t: number): [number, number] => {
          const l = legRanges[i].leg;
          return l.route
            ? routeCurvePoint(l.route, t, l.routeLand)
            : bezierPoint(l.from.coords, l.to.coords, l.curve ?? 0, t);
        };
        ensureLegCached(0, legPoint0);
      });
    }

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
    //
    // rootMargin shrinks the *effective* viewport this observer measures
    // against, top and bottom only (left/right untouched -- the map is
    // full-width, and the issue below is purely about viewport *height*),
    // before the threshold above is even evaluated. Without it, root
    // defaults to the actual browser viewport -- on mobile browsers with a
    // collapsing/dynamic address bar, that viewport's reported height can
    // be the larger, toolbar-hidden size even while the toolbar is still
    // on screen (reported: autoplay starting while the map was barely at
    // the very bottom edge of what was visually on screen, well before it
    // had been scrolled anywhere near into view -- same behaviour on every
    // destination page, since this observer config is shared by all of
    // them). Pulling the observed region in from the top and bottom means
    // the map has to be substantially inside the *stable, clearly-visible*
    // vertical band of the screen -- not just technically within a
    // viewport number that may not match what the visitor can actually see
    // yet -- before the animation is allowed to start.
    // Waits for routeCacheReadyRef (see above) before actually calling
    // startAutoplay, retrying on a short timer rather than blocking
    // anything -- the retry is cheap (one ref read) and bounded by the
    // same routeCacheReadyTimeoutMs ceiling the fetch effect already
    // enforces, so this never waits meaningfully longer than that.
    let autoplayRetryId: number | null = null;
    const startAutoplayWhenReady = () => {
      if (hasPlayedRef.current) return;
      if (!routeCacheReadyRef.current) {
        autoplayRetryId = window.setTimeout(startAutoplayWhenReady, 100);
        return;
      }
      startAutoplay();
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            startAutoplayWhenReady();
            // Resume a tween paused while this map was scrolled out of
            // view (see the else branch). No-op the very first time,
            // since startAutoplay hasn't assigned playTween yet.
            playTween?.resume();
          } else {
            // Stop driving onUpdate (and therefore render()) entirely
            // while offscreen, instead of letting the tween keep running
            // "in the background" as the original design intentionally
            // did -- the one deliberate behaviour change here, requested
            // explicitly so offscreen maps stop consuming CPU.
            playTween?.pause();
          }
        });
      },
      { threshold: 0.4, rootMargin: '-25% 0px -25% 0px' }
    );
    observer.observe(wrapper);

    return () => {
      observer.disconnect();
      if (autoplayRetryId !== null) window.clearTimeout(autoplayRetryId);
      playTween?.kill();
      cameraTween?.kill();
      resizeObserver.disconnect();
      cancelIdle();
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
          {/* Slovenia: always precise/FOCUS-style -- home is in Slovenia
              on every trip, so this detail is relevant on every map. */}
          {SLOVENIA_PATHS.map((d, i) => (
            <path
              key={`slovenia-${i}`}
              d={d}
              fill={MUTED_LAND}
              stroke={MUTED_LINE}
              strokeWidth={1}
              vectorEffect='non-scaling-stroke'
              opacity={0.8}
            />
          ))}
          {/* Austria: FOCUS-style only when austriaEmphasis is true (the
              default, preserving every page's existing look). When a
              destination's own journey never flies out via Vienna/Graz,
              the page passes austriaEmphasis={false} and Austria instead
              renders with the exact same plain NEIGHBOUR_PATHS treatment
              just below -- an ordinary background country, not a second
              highlighted region. */}
          {AUSTRIA_PATHS.map((d, i) =>
            austriaEmphasis ? (
              <path
                key={`austria-${i}`}
                d={d}
                fill={MUTED_LAND}
                stroke={MUTED_LINE}
                strokeWidth={1}
                vectorEffect='non-scaling-stroke'
                opacity={0.8}
              />
            ) : (
              <path key={`austria-${i}`} d={d} fill={MUTED_LAND} opacity={0.55} />
            )
          )}
          {/* Canary Islands (Tenerife) or Sardinia (north-east coast /
              Costa Smeralda) close-up coastline -- see the Stage 4 comment
              in scripts/build-geo.mjs for why this fine detail exists
              (e.g. Casagliana -> Spiaggia del Principe's local coastal map
              needs real bay/headland shapes, which WIDE_EUROPE_PATHS'
              continental-scale simplification can't provide). Only the
              one region this page's `region` prop names renders at all --
              see that prop's doc comment above for why this used to
              render BOTH regions unconditionally on every destination's
              maps and why that was a real per-page DOM cost, not just
              invisible-and-free. */}
          {(region ? REGION_FINE_DETAIL_PATHS[region] : []).map((d, i) => (
            <path
              key={`region-${i}`}
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
              the region fine-detail block above already drew.
              extraLandFill/extraLandStroke let ONE journey override the
              colour these render with (see that doc comment for why —
              Iceland/Greenland on the Ljubljana -> Keflavik map, a distant
              landmass with no surrounding baked coastline rather than a
              small correction to one). Every journey that doesn't set them
              — which is every journey except that one — falls through to
              the exact same MUTED_LAND/MUTED_LINE this always rendered. */}
          {journey.extraLandPatches?.map((d, i) => (
            <path
              key={`land-patch-${i}`}
              d={d}
              fill={journey.extraLandFill ?? MUTED_LAND}
              opacity={journey.extraLandOpacity ?? 0.85}
            />
          ))}
          {/* The new coastline edge each patch above actually adds —
              stroked, unfilled, drawn once so it reads as part of the same
              coastline rather than a seam. */}
          {journey.extraCoastlineStrokes?.map((d, i) => (
            <path
              key={`coastline-stroke-${i}`}
              d={d}
              fill='none'
              stroke={journey.extraLandStroke ?? MUTED_LINE}
              strokeWidth={1}
              strokeLinejoin='round'
              vectorEffect='non-scaling-stroke'
              opacity={journey.extraLandOpacity ?? 0.85}
            />
          ))}

          <path ref={routeGlowRef} d='' fill='none' stroke={ROUTE_PINK} strokeLinecap='round' strokeLinejoin='round' opacity={0.14} />
          <path ref={activeRouteGlowRef} d='' fill='none' stroke={ROUTE_PINK} strokeLinecap='round' strokeLinejoin='round' opacity={0.14} />
          <path ref={routeLineRef} d='' fill='none' stroke={ROUTE_PINK} strokeLinecap='round' strokeLinejoin='round' opacity={0.92} />
          <path ref={activeRouteLineRef} d='' fill='none' stroke={ROUTE_PINK} strokeLinecap='round' strokeLinejoin='round' opacity={0.92} />
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
                i.e. exactly on the projected coordinate — never offset.
                A 'small' markerSize (a secondary/minor waypoint, e.g. a
                detour stop between two main road-trip bases) renders a
                visibly smaller dot than every other, unmarked point —
                every existing point on every other map leaves this unset
                and is completely unaffected. */}
            <span
              className={
                p.markerSize === 'small'
                  ? 'absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2 block w-1 h-1 rounded-full bg-[#e8639f]/80 ring-1 ring-[#f6f1e6]'
                  : 'absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2 block w-2 h-2 rounded-full bg-[#e8639f] ring-2 ring-[#f6f1e6]'
              }
            />
            {/* The text: a separate element updateLabelScreenPos nudges
                aside for legibility (and flips near a narrow frame's
                edge) — moving this never moves the dot above. Same
                'small' markerSize also steps the label down a size so a
                minor waypoint reads as clearly secondary to the major
                stops sharing the same map. */}
            <span
              ref={(el) => {
                labelTextRefs.current[i] = el;
              }}
              className='absolute left-0 top-0 flex flex-col leading-tight whitespace-normal max-w-[34vw] md:max-w-none md:whitespace-nowrap font-[family-name:var(--font-poppins)]'
            >
              <span
                className={
                  p.markerSize === 'small'
                    ? 'text-[0.44rem] md:text-[0.55rem] uppercase tracking-[0.1em] md:tracking-[0.14em] font-medium text-black/55'
                    : 'text-[0.52rem] md:text-[0.65rem] uppercase tracking-[0.12em] md:tracking-[0.16em] font-semibold text-black/70'
                }
              >
                {p.name}
              </span>
              {p.sublabel && <span className='text-[0.48rem] md:text-[0.6rem] text-black/45'>{p.sublabel}</span>}
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
            ) : vehicleMode === 'train' ? (
              <>
                <mask id={trainMaskId} maskUnits='userSpaceOnUse' x={-4} y={-4} width={32} height={32}>
                  <path d={TRAIN_BODY_PATH} fill='white' />
                  <rect
                    x={TRAIN_WINDOWS.x}
                    y={TRAIN_WINDOWS.y}
                    width={TRAIN_WINDOWS.width}
                    height={TRAIN_WINDOWS.height}
                    rx={TRAIN_WINDOWS.rx}
                    fill='black'
                  />
                </mask>
                <path d={TRAIN_BODY_PATH} fill={VEHICLE_STROKE} stroke='none' mask={`url(#${trainMaskId})`} />
              </>
            ) : vehicleMode === 'transfer' ? (
              <>
                <mask id={busMaskId} maskUnits='userSpaceOnUse' x={-4} y={-4} width={32} height={32}>
                  <path d={BUS_BODY_PATH} fill='white' />
                  <rect
                    x={BUS_WINDOW.x}
                    y={BUS_WINDOW.y}
                    width={BUS_WINDOW.width}
                    height={BUS_WINDOW.height}
                    rx={BUS_WINDOW.rx}
                    fill='black'
                  />
                  {BUS_WHEEL_HINTS.map(([cx, cy], i) => (
                    <ellipse key={i} cx={cx} cy={cy} rx={0.6} ry={0.32} fill='black' />
                  ))}
                </mask>
                <path d={BUS_BODY_PATH} fill={VEHICLE_STROKE} stroke='none' mask={`url(#${busMaskId})`} />
              </>
            ) : vehicleMode === 'boat' ? (
              <>
                <mask id={boatMaskId} maskUnits='userSpaceOnUse' x={-4} y={-4} width={32} height={32}>
                  <path d={BOAT_BODY_PATH} fill='white' />
                  <rect
                    x={BOAT_CABIN.x}
                    y={BOAT_CABIN.y}
                    width={BOAT_CABIN.width}
                    height={BOAT_CABIN.height}
                    rx={BOAT_CABIN.rx}
                    fill='black'
                  />
                </mask>
                <path d={BOAT_BODY_PATH} fill={VEHICLE_STROKE} stroke='none' mask={`url(#${boatMaskId})`} />
              </>
            ) : (
              <>
                {/* The roof and wheel hints are real holes in the car body
                    (via this mask), not an opaque MUTED_BACKGROUND-colored
                    patch drawn on top. A flat fill only happened to match
                    what was underneath while the car sat on the plain map
                    background — anywhere else (the pink route line/glow, or
                    a destination's pink marker dot, which every leg ends on)
                    it showed up as a mismatched light square/dot riding
                    along with the car, worst right where the vehicle comes
                    to rest on a marker. A mask instead reveals whatever is
                    actually beneath the vehicle overlay at that pixel —
                    correct regardless of what that is. */}
                {/* Explicit mask region (rather than the SVG default of
                    -10%/120% of the current viewport) because maskUnits is
                    userSpaceOnUse and this <g>'s enclosing viewBox is set
                    imperatively in JS and changes every frame during the
                    camera pan — a percentage of a viewBox that size can
                    resolve to a region nowhere near the car's own 24x24
                    local space, which clipped the whole car invisible.
                    -4..28 comfortably covers the 24x24 icon in its own,
                    untransformed coordinate system regardless of viewBox. */}
                <mask id={carMaskId} maskUnits='userSpaceOnUse' x={-4} y={-4} width={32} height={32}>
                  <path d={CAR_BODY_PATH} fill='white' />
                  <rect
                    x={CAR_ROOF.x}
                    y={CAR_ROOF.y}
                    width={CAR_ROOF.width}
                    height={CAR_ROOF.height}
                    rx={CAR_ROOF.rx}
                    fill='black'
                  />
                  {CAR_WHEEL_HINTS.map(([cx, cy], i) => (
                    <ellipse key={i} cx={cx} cy={cy} rx={0.6} ry={0.32} fill='black' />
                  ))}
                </mask>
                <path d={CAR_BODY_PATH} fill={VEHICLE_STROKE} stroke='none' mask={`url(#${carMaskId})`} />
              </>
            )}
          </g>
        </svg>
      </div>
    </div>
  );
}
