// Permanent, reusable sanity checks for journey-map route data.
//
// Why this file exists: an earlier editorial simplification pass quietly
// turned a real, verified driving maneuver (Roca Nivaria -> Siam Park's
// TF-1 exit-and-backtrack) into what looked like GPS noise and deleted
// it, producing a route that no longer matched the real drive. `tsc`
// compiling cleanly caught none of that, because it's a geographic
// correctness problem, not a type problem. These functions exist so that
// kind of regression can be checked for mechanically instead of only by
// eye — see the `metkish-route-geometry` project rule for the full
// methodology this supports (verify real route -> identify manoeuvres ->
// simplify -> render -> validate).
//
// These are plain, dependency-free functions over the same [lng, lat]
// waypoint arrays already used in lib/journeys/*.ts and the same
// projected-space safety logic components/journey/geo.ts uses at
// runtime (imported directly, not reimplemented, so this never drifts
// from what actually renders). Nothing here is imported by the app itself
// — run it ad hoc or via `npm run validate:routes` when adding or editing
// a route, not as part of the production bundle.

import {
  project,
  routeCurvePoint,
  marginAgainstLand,
  parseLandRing,
  ROUTE_SAFETY_DEFAULTS,
} from '@/components/journey/geo';

type LngLat = [number, number];

export interface EndpointCheck {
  ok: boolean;
  startMatches: boolean;
  endMatches: boolean;
  startDistanceDeg: number;
  endDistanceDeg: number;
}

/** Real coordinates are immutable (see the route-geometry project rule):
 * a route's first and last points must be EXACTLY the canonical
 * coordinate used for the marker/vehicle at that location, not a nearby
 * approximation. `toleranceDeg` defaults to 0 (exact match required);
 * pass a small tolerance only if you have a specific, documented reason
 * (e.g. deliberately snapping to a road centerline a few metres away). */
export function validateEndpoints(
  route: LngLat[],
  start: LngLat,
  end: LngLat,
  toleranceDeg = 0
): EndpointCheck {
  const dist = (a: LngLat, b: LngLat) => Math.hypot(a[0] - b[0], a[1] - b[1]);
  const startDistanceDeg = dist(route[0], start);
  const endDistanceDeg = dist(route[route.length - 1], end);
  const startMatches = startDistanceDeg <= toleranceDeg;
  const endMatches = endDistanceDeg <= toleranceDeg;
  return { ok: startMatches && endMatches, startMatches, endMatches, startDistanceDeg, endDistanceDeg };
}

export interface LandSafetyResult {
  ok: boolean;
  minMargin: number;
  worstT: number;
  safetyMargin: number;
}

/** Samples the ACTUAL rendered curve (routeCurvePoint, the same function
 * JourneyMapScene draws with) at `samples` points and confirms every one
 * clears the real coastline by at least the production safety margin.
 * This is the "does any part appear to travel through sea, coastline, or
 * empty terrain" check from the mandatory visual-QA list, made
 * mechanical — but it is not a substitute for actually looking at the
 * rendered map, since a route can be numerically "on land" and still
 * read as uncomfortably close to the coast at a given zoom. */
export function checkRouteOnLand(
  route: LngLat[],
  landPaths: string[],
  samples = 500,
  safetyMargin = ROUTE_SAFETY_DEFAULTS.safetyMargin
): LandSafetyResult {
  const rings = landPaths.map(parseLandRing);
  let minMargin = Infinity;
  let worstT = 0;
  for (let i = 0; i <= samples; i++) {
    const t = i / samples;
    const p = routeCurvePoint(route, t, landPaths);
    const m = marginAgainstLand(project(p), rings);
    if (m < minMargin) {
      minMargin = m;
      worstT = t;
    }
  }
  return { ok: minMargin >= safetyMargin, minMargin, worstT, safetyMargin };
}

export interface LargeJumpFlag {
  index: number;
  from: LngLat;
  to: LngLat;
  distanceDeg: number;
  ratioToMedian: number;
}

/** Flags consecutive real waypoints whose gap is disproportionately large
 * relative to the rest of THIS route (a scale-aware check, per the
 * project rule's "no fixed point-count target" — what counts as too
 * sparse depends on how dense the rest of the same route is, not an
 * absolute number). A large ratio is a prompt to go look at that segment
 * on the live map and confirm the straight line between those two points
 * still stays inside the real road corridor — it is not automatically
 * wrong (a genuinely long, straight stretch of real motorway will also
 * trip this), so treat it as "inspect this," not "fail this." */
export function detectLargeJumps(route: LngLat[], flagRatio = 4): LargeJumpFlag[] {
  if (route.length < 3) return [];
  const gaps: number[] = [];
  for (let i = 0; i < route.length - 1; i++) {
    gaps.push(Math.hypot(route[i + 1][0] - route[i][0], route[i + 1][1] - route[i][1]));
  }
  const sorted = [...gaps].sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)] || 1e-9;
  const flags: LargeJumpFlag[] = [];
  gaps.forEach((d, i) => {
    const ratio = d / median;
    if (ratio >= flagRatio) {
      flags.push({ index: i, from: route[i], to: route[i + 1], distanceDeg: d, ratioToMedian: ratio });
    }
  });
  return flags;
}

export interface SharedGeometryResult {
  sharedPointCount: number;
  divergesAtIndex: number | null;
  ok: boolean;
}

/** Two routes that are documented as sharing a real corridor (e.g. two
 * destinations leaving the same hotel) should be byte-identical over
 * that shared stretch — never two independently-drawn approximations of
 * the same road. Pass the two routes already aligned in the same
 * direction (reverse one first if needed) and the number of leading
 * points they're expected to share; this confirms they actually do, and
 * reports exactly where they stop matching if not. */
export function compareSharedPrefix(
  routeA: LngLat[],
  routeB: LngLat[],
  expectedSharedCount: number,
  toleranceDeg = 1e-9
): SharedGeometryResult {
  const n = Math.min(routeA.length, routeB.length);
  let i = 0;
  for (; i < n; i++) {
    const d = Math.hypot(routeA[i][0] - routeB[i][0], routeA[i][1] - routeB[i][1]);
    if (d > toleranceDeg) break;
  }
  return {
    sharedPointCount: i,
    divergesAtIndex: i < n ? i : null,
    ok: i >= expectedSharedCount,
  };
}

export interface RouteReport {
  pointCount: number;
  boundingBoxDeg: { minLng: number; maxLng: number; minLat: number; maxLat: number };
  approxRealDistanceKm: number;
}

/** Plain human-readable stats for a route — point count, bounding box,
 * and a haversine-based real-world distance estimate (through the actual
 * waypoints, not the smoothed curve, so it's a slight underestimate) —
 * useful for a quick by-eye sanity read alongside the other checks. */
export function summarizeRoute(route: LngLat[]): RouteReport {
  const lngs = route.map((p) => p[0]);
  const lats = route.map((p) => p[1]);
  const toRad = (d: number) => (d * Math.PI) / 180;
  const haversineKm = (a: LngLat, b: LngLat) => {
    const R = 6371;
    const dLat = toRad(b[1] - a[1]);
    const dLng = toRad(b[0] - a[0]);
    const lat1 = toRad(a[1]);
    const lat2 = toRad(b[1]);
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
  };
  let dist = 0;
  for (let i = 0; i < route.length - 1; i++) dist += haversineKm(route[i], route[i + 1]);
  return {
    pointCount: route.length,
    boundingBoxDeg: {
      minLng: Math.min(...lngs),
      maxLng: Math.max(...lngs),
      minLat: Math.min(...lats),
      maxLat: Math.max(...lats),
    },
    approxRealDistanceKm: dist,
  };
}
